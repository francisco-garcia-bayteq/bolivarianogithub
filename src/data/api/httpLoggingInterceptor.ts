import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {devLog} from './devLog';

const LOG = 'HTTP';

/** Avoid `String(object)` → '[object Object]' (Sonar: explicit serialization). */
function stringifyForLog(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (typeof value === 'symbol') {
    return value.toString();
  }
  if (typeof value === 'function') {
    const fn = value as {name?: string};
    return `[Function: ${fn.name ?? 'anonymous'}]`;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function serializeHeaders(h: unknown): Record<string, unknown> {
  if (h == null) {
    return {};
  }
  const maybeToJson = (h as {toJSON?: () => unknown}).toJSON;
  if (typeof maybeToJson === 'function') {
    return maybeToJson.call(h) as Record<string, unknown>;
  }
  if (typeof h === 'object' && !Array.isArray(h)) {
    return {...(h as Record<string, unknown>)};
  }
  return {raw: stringifyForLog(h)};
}

function summarizeBody(data: unknown): unknown {
  if (data === undefined || data === null) {
    return data;
  }
  if (typeof data === 'string') {
    const max = 8000;
    if (data.length > max) {
      return `${data.slice(0, max)}… (${data.length} chars)`;
    }
    return data;
  }
  try {
    return (globalThis as unknown as {structuredClone: <T>(value: T) => T}).structuredClone(
      data,
    );
  } catch {
    return stringifyForLog(data);
  }
}

/**
 * Registra en consola (solo __DEV__) cada petición y respuesta del cliente Axios:
 * método, URL, headers, body/params; y status, headers y data de la respuesta.
 * Debe registrarse después de {@link attachApiHeadersInterceptor} para loguear headers finales.
 */
export function attachHttpLoggingInterceptor(client: AxiosInstance): void {
  if (!__DEV__) {
    return;
  }

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      let fullUrl: string;
      try {
        fullUrl = axios.getUri(config);
      } catch {
        fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
      }
      devLog(LOG, '→ request', {
        method: (config.method ?? 'get').toUpperCase(),
        url: fullUrl,
        headers: serializeHeaders(config.headers),
        data: summarizeBody(config.data),
        params: config.params,
      });
      return config;
    },
    error => Promise.reject(error),
  );

  client.interceptors.response.use(
    response => {
      let fullUrl: string | undefined;
      try {
        fullUrl = axios.getUri(response.config);
      } catch {
        fullUrl = response.config?.url;
      }
      devLog(LOG, '← response', {
        status: response.status,
        url: fullUrl,
        headers: serializeHeaders(response.headers),
        data: summarizeBody(response.data),
      });
      return response;
    },
    (error: AxiosError) => {
      const cfg = error.config;
      let fullUrl: string | undefined;
      try {
        fullUrl = cfg ? axios.getUri(cfg) : undefined;
      } catch {
        fullUrl = cfg?.url;
      }
      devLog(LOG, '← error', {
        message: error.message,
        method: cfg?.method,
        url: fullUrl,
        status: error.response?.status,
        requestHeaders: cfg ? serializeHeaders(cfg.headers) : undefined,
        responseHeaders: error.response
          ? serializeHeaders(error.response.headers)
          : undefined,
        responseData: error.response
          ? summarizeBody(error.response.data)
          : undefined,
      });
      return Promise.reject(error);
    },
  );
}
