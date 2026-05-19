import axios, {AxiosError, type InternalAxiosRequestConfig} from 'axios';
import {attachHttpLoggingInterceptor} from '../../../src/data/api/httpLoggingInterceptor';

const mockDevLog = jest.fn();

jest.mock('../../../src/data/api/devLog', () => ({
  devLog: (...args: unknown[]) => mockDevLog(...args),
}));

describe('attachHttpLoggingInterceptor', () => {
  const originalDev = global.__DEV__;

  afterEach(() => {
    global.__DEV__ = originalDev;
    mockDevLog.mockClear();
  });

  it('no registra interceptores cuando __DEV__ es false', () => {
    global.__DEV__ = false;
    const client = axios.create({baseURL: 'https://api.test'});
    const before = client.interceptors.request.handlers.filter(Boolean).length;
    attachHttpLoggingInterceptor(client);
    const after = client.interceptors.request.handlers.filter(Boolean).length;
    expect(after).toBe(before);
    expect(mockDevLog).not.toHaveBeenCalled();
  });

  it('registra request y loguea método, URL y body resumido', async () => {
    global.__DEV__ = true;
    const client = axios.create({baseURL: 'https://api.test'});
    attachHttpLoggingInterceptor(client);

    const cfg: InternalAxiosRequestConfig = {
      baseURL: 'https://api.test',
      url: '/path',
      method: 'post',
      data: {a: 1},
      headers: {Authorization: 'Bearer x'},
    };

    await client.interceptors.request.handlers[0]!.fulfilled!(cfg);

    expect(mockDevLog).toHaveBeenCalledWith(
      'HTTP',
      '→ request',
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/path',
        data: {a: 1},
      }),
    );
  });

  it('en request error rechaza la promesa', async () => {
    global.__DEV__ = true;
    const client = axios.create();
    attachHttpLoggingInterceptor(client);
    const err = new Error('fail');
    await expect(
      client.interceptors.request.handlers[0]!.rejected!(err),
    ).rejects.toBe(err);
  });

  it('en response exitosa loguea status y datos', async () => {
    global.__DEV__ = true;
    const client = axios.create({baseURL: 'https://x'});
    attachHttpLoggingInterceptor(client);

    const response = {
      status: 200,
      config: {baseURL: 'https://x', url: '/ok', method: 'get'},
      headers: {},
      data: {ok: true},
    };

    const out = await client.interceptors.response.handlers[0]!.fulfilled!(
      response as never,
    );

    expect(out).toBe(response);
    expect(mockDevLog).toHaveBeenCalledWith(
      'HTTP',
      '← response',
      expect.objectContaining({status: 200, data: {ok: true}}),
    );
  });

  it('en error de Axios loguea detalles y rechaza', async () => {
    global.__DEV__ = true;
    const client = axios.create();
    attachHttpLoggingInterceptor(client);

    const error = new AxiosError('Network');
    error.config = {
      method: 'get',
      url: '/fail',
      headers: {},
    } as InternalAxiosRequestConfig;
    error.response = {
      status: 503,
      data: {msg: 'down'},
      headers: {},
      statusText: 'Error',
      config: error.config!,
    } as never;

    await expect(
      client.interceptors.response.handlers[0]!.rejected!(error),
    ).rejects.toBe(error);

    expect(mockDevLog).toHaveBeenCalledWith(
      'HTTP',
      '← error',
      expect.objectContaining({
        message: 'Network',
        status: 503,
      }),
    );
  });

  it('resume body string largo en request', async () => {
    global.__DEV__ = true;
    const client = axios.create({baseURL: 'https://x'});
    attachHttpLoggingInterceptor(client);
    const long = 'a'.repeat(9000);
    const cfg: InternalAxiosRequestConfig = {
      baseURL: 'https://x',
      url: '/u',
      method: 'post',
      data: long,
    };
    await client.interceptors.request.handlers[0]!.fulfilled!(cfg);
    const payload = mockDevLog.mock.calls.find(c => c[1] === '→ request')?.[2] as {
      data: string;
    };
    expect(payload.data).toContain('…');
    expect(payload.data).toContain('9000 chars');
  });
});
