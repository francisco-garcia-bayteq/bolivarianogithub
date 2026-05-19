import axios from 'axios';
import {SecurityRemoteDataSource} from '../SecurityRemoteDataSource';

jest.mock('axios', () => ({isAxiosError: jest.fn()}));
jest.mock('../../../api/devLog', () => ({devLog: jest.fn(), devWarn: jest.fn()}));

const makeHttpClient = () => ({
  get: jest.fn(),
  post: jest.fn(),
});

describe('SecurityRemoteDataSource', () => {
  let http: ReturnType<typeof makeHttpClient>;
  let sut: SecurityRemoteDataSource;

  beforeEach(() => {
    http = makeHttpClient();
    sut = new SecurityRemoteDataSource(http as any);
    jest.clearAllMocks();
  });

  // ─── postCertificate ──────────────────────────────────────────────────────
  describe('postCertificate', () => {
    const body = {
      secretEncryptBase64: 'enc',
      secretEncryptSignBase64: 'sign',
      secretIvEncryptBase64: 'iv',
    };

    it('returns the envelope when content is present', async () => {
      const envelope = {
        code: 200,
        responseType: 'Success',
        message: 'ok',
        content: {
          certificate: {hashEncrypt: 'h', hashEncryptSign: 's'},
          validateHash: true,
          userMessage: '',
        },
      };
      http.post.mockResolvedValueOnce({data: envelope, status: 200});
      await expect(sut.postCertificate(body)).resolves.toBe(envelope);
    });

    it('returns the envelope when only data field is present (validateHash false)', async () => {
      const envelope = {
        code: 200,
        responseType: 'Success',
        message: 'ok',
        data: {
          certificate: {hashEncrypt: 'h', hashEncryptSign: 's'},
          validateHash: false,
          userMessage: '',
        },
      };
      http.post.mockResolvedValueOnce({data: envelope, status: 200});
      await expect(sut.postCertificate(body)).resolves.toBe(envelope);
    });

    it('re-throws and logs AxiosError with response', async () => {
      const axiosErr = Object.assign(new Error('network'), {
        response: {
          status: 500,
          data: {responseType: 'Error', message: 'server fault'},
        },
      });
      http.post.mockRejectedValueOnce(axiosErr);
      (axios.isAxiosError as jest.Mock).mockReturnValueOnce(true);
      await expect(sut.postCertificate(body)).rejects.toThrow('network');
    });

    it('re-throws AxiosError with null response data', async () => {
      const axiosErr = Object.assign(new Error('timeout'), {
        response: {status: 408, data: null},
      });
      http.post.mockRejectedValueOnce(axiosErr);
      (axios.isAxiosError as jest.Mock).mockReturnValueOnce(true);
      await expect(sut.postCertificate(body)).rejects.toThrow('timeout');
    });

    it('re-throws non-Axios Error', async () => {
      const err = new Error('unknown');
      http.post.mockRejectedValueOnce(err);
      (axios.isAxiosError as jest.Mock).mockReturnValueOnce(false);
      await expect(sut.postCertificate(body)).rejects.toThrow('unknown');
    });

    it('re-throws non-Error primitive string', async () => {
      http.post.mockRejectedValueOnce('raw string');
      (axios.isAxiosError as jest.Mock).mockReturnValueOnce(false);
      await expect(sut.postCertificate(body)).rejects.toBe('raw string');
    });
  });

  // ─── getPublicKey ─────────────────────────────────────────────────────────
  describe('getPublicKey', () => {
    it('returns content on success', async () => {
      const content = {publicKey: 'pk-abc'};
      http.get.mockResolvedValueOnce({
        data: {responseType: 'Success', content, message: '', code: 200},
      });
      await expect(sut.getPublicKey()).resolves.toBe(content);
    });

    it('throws the server message when responseType is Error', async () => {
      http.get.mockResolvedValueOnce({
        data: {responseType: 'Error', message: 'Acceso denegado', code: 403},
      });
      await expect(sut.getPublicKey()).rejects.toThrow('Acceso denegado');
    });

    it('throws default message when responseType is Error and message is empty', async () => {
      http.get.mockResolvedValueOnce({
        data: {responseType: 'Error', message: '', code: 500},
      });
      await expect(sut.getPublicKey()).rejects.toThrow(
        'No se pudo obtener la clave pública',
      );
    });

    it('throws default message when content is undefined', async () => {
      http.get.mockResolvedValueOnce({
        data: {responseType: 'Success', content: undefined, message: '', code: 200},
      });
      await expect(sut.getPublicKey()).rejects.toThrow(
        'No se pudo obtener la clave pública',
      );
    });

    it('re-throws Error instances directly', async () => {
      http.get.mockRejectedValueOnce(new Error('connection reset'));
      await expect(sut.getPublicKey()).rejects.toThrow('connection reset');
    });

    it('wraps non-Error throws in a generic Error', async () => {
      http.get.mockRejectedValueOnce('oops');
      await expect(sut.getPublicKey()).rejects.toThrow(
        'Error de conexión con el servidor',
      );
    });
  });

  // ─── validateOtp ──────────────────────────────────────────────────────────
  describe('validateOtp', () => {
    const request = {otp: '123457'};

    it('returns content on success', async () => {
      const content = {userMessage: 'Válido'};
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Success', content, message: '', code: 200},
      });
      await expect(sut.validateOtp(request)).resolves.toBe(content);
    });

    it('throws the server message when responseType is Error', async () => {
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Error', message: 'OTP expirado', code: 422},
      });
      await expect(sut.validateOtp(request)).rejects.toThrow('OTP expirado');
    });

    it('throws default message when responseType is Error and message is empty', async () => {
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Error', message: '', code: 500},
      });
      await expect(sut.validateOtp(request)).rejects.toThrow(
        'Error al validar el OTP. Por favor intente nuevamente.',
      );
    });

    it('throws default message when content is undefined', async () => {
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Success', content: undefined, message: '', code: 200},
      });
      await expect(sut.validateOtp(request)).rejects.toThrow(
        'Error al validar el OTP. Por favor intente nuevamente.',
      );
    });

    it('re-throws Error instances directly', async () => {
      http.post.mockRejectedValueOnce(new Error('network down'));
      await expect(sut.validateOtp(request)).rejects.toThrow('network down');
    });

    it('wraps non-Error throws in a generic Error', async () => {
      http.post.mockRejectedValueOnce(42);
      await expect(sut.validateOtp(request)).rejects.toThrow(
        'Error de conexión con el servidor',
      );
    });
  });

  // ─── validateTransactionAmount ────────────────────────────────────────────
  describe('validateTransactionAmount', () => {
    const request = {
      amount: 100,
      beneficiaryContactGuid: 'b1',
      accountGuid: 'a1',
      concept: 'pago',
    };

    it('returns content on success', async () => {
      const content = {isValid: true};
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Success', content, message: '', code: 200},
      });
      await expect(sut.validateTransactionAmount(request)).resolves.toBe(content);
    });

    it('returns content when isValid is false', async () => {
      const content = {isValid: false};
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Success', content, message: '', code: 200},
      });
      await expect(sut.validateTransactionAmount(request)).resolves.toBe(content);
    });

    it('throws the server message when responseType is Error', async () => {
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Error', message: 'Saldo insuficiente', code: 422},
      });
      await expect(sut.validateTransactionAmount(request)).rejects.toThrow(
        'Saldo insuficiente',
      );
    });

    it('throws default message when responseType is Error and message is empty', async () => {
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Error', message: '', code: 500},
      });
      await expect(sut.validateTransactionAmount(request)).rejects.toThrow(
        'No se pudo validar el monto. Por favor intente nuevamente.',
      );
    });

    it('throws default message when content is undefined', async () => {
      http.post.mockResolvedValueOnce({
        data: {responseType: 'Success', content: undefined, message: '', code: 200},
      });
      await expect(sut.validateTransactionAmount(request)).rejects.toThrow(
        'No se pudo validar el monto. Por favor intente nuevamente.',
      );
    });

    it('re-throws Error instances directly', async () => {
      http.post.mockRejectedValueOnce(new Error('timeout'));
      await expect(sut.validateTransactionAmount(request)).rejects.toThrow('timeout');
    });

    it('wraps non-Error throws in a generic Error', async () => {
      http.post.mockRejectedValueOnce(null);
      await expect(sut.validateTransactionAmount(request)).rejects.toThrow(
        'Error de conexión con el servidor',
      );
    });
  });
});
