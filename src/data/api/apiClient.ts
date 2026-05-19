import axios, { AxiosInstance } from 'axios';
import {
  attachApiHeadersInterceptor,
  type ApiHeadersInterceptorDeps,
} from './apiHeadersInterceptor';
import { attachHttpLoggingInterceptor } from './httpLoggingInterceptor';
import { HttpClient, HttpResponse, RequestConfig } from './HttpClient';

export type { ApiHeadersInterceptorDeps } from './apiHeadersInterceptor';

export type AxiosHttpClientConfig = ApiHeadersInterceptorDeps & {
  timeout?: number;
};

export class AxiosHttpClient implements HttpClient {
  private readonly client: AxiosInstance;

  constructor(config: AxiosHttpClientConfig) {
    const { timeout = 15000, ...interceptorDeps } = config;
    this.client = axios.create({
      baseURL: interceptorDeps.baseURL,
      headers: { 'Content-Type': 'application/json' },
      timeout,
    });
    attachApiHeadersInterceptor(this.client, interceptorDeps);
    attachHttpLoggingInterceptor(this.client);
  }

  async get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return { data: response.data, status: response.status };
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async delete<T>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return { data: response.data, status: response.status };
  }
}
