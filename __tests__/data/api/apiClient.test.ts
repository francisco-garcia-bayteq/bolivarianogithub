import axios from 'axios';
import {AxiosHttpClient} from '../../../src/data/api/apiClient';
import {attachApiHeadersInterceptor} from '../../../src/data/api/apiHeadersInterceptor';

jest.mock('axios');
jest.mock('../../../src/data/api/apiHeadersInterceptor', () => ({
  attachApiHeadersInterceptor: jest.fn(),
}));

describe('AxiosHttpClient', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const axiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(axiosInstance as never);
  });

  test('creates the axios instance with banking default headers', () => {
    const _client = new AxiosHttpClient({
      baseURL: 'https://api.bank.test',
      secretKey: 'secret',
      requestId: 'req-1',
      secureStorage: {get: jest.fn(), save: jest.fn(), remove: jest.fn(), clear: jest.fn()},
      serverPublicKeySessionStore: {get: () => null, set: jest.fn()},
      serverPublicPemBase64: 'PUBLIC_KEY_B64',
      deviceSecurityService: {getSnapshot: jest.fn()} as never,
    });
    expect(_client).toBeDefined();

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.bank.test',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
    expect(attachApiHeadersInterceptor).toHaveBeenCalledWith(
      axiosInstance,
      expect.objectContaining({
        baseURL: 'https://api.bank.test',
        requestId: 'req-1',
      }),
    );
  });

  test('wraps HTTP verbs and returns only data and status', async () => {
    axiosInstance.get.mockResolvedValue({data: {value: 'g'}, status: 200});
    axiosInstance.post.mockResolvedValue({data: {value: 'p'}, status: 201});
    axiosInstance.put.mockResolvedValue({data: {value: 'u'}, status: 202});
    axiosInstance.delete.mockResolvedValue({data: {value: 'd'}, status: 204});

    const client = new AxiosHttpClient({
      baseURL: 'https://api.bank.test',
      secretKey: 'secret',
      requestId: 'req-1',
      secureStorage: {get: jest.fn(), save: jest.fn(), remove: jest.fn(), clear: jest.fn()},
      serverPublicKeySessionStore: {get: () => null, set: jest.fn()},
      serverPublicPemBase64: 'PUBLIC_KEY_B64',
      deviceSecurityService: {getSnapshot: jest.fn()} as never,
    });

    await expect(client.get('/health')).resolves.toEqual({
      data: {value: 'g'},
      status: 200,
    });
    await expect(client.post('/login', {user: 'demo'})).resolves.toEqual({
      data: {value: 'p'},
      status: 201,
    });
    await expect(client.put('/user', {name: 'demo'})).resolves.toEqual({
      data: {value: 'u'},
      status: 202,
    });
    await expect(client.delete('/logout')).resolves.toEqual({
      data: {value: 'd'},
      status: 204,
    });
  });
});
