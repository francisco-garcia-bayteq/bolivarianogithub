import {MockAuthDataSource} from '../../../src/data/datasources/auth/MockAuthDataSource';
import {MockTransactionDataSource} from '../../../src/data/datasources/transaction/MockTransactionDataSource';

describe('mock data sources', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('MockAuthDataSource resolves with the demo credentials', async () => {
    const dataSource = new MockAuthDataSource();
    const loginPromise = dataSource.login({
      username: 'usuario-demo12',
      password: '123456',
    });

    jest.advanceTimersByTime(1500);

    await expect(loginPromise).resolves.toEqual({
      accessToken: 'mock-jwt-token-xyz123',
      alias: null,
      firstName: 'Demo',
      sessionTimeSeconds: 3600,
      inactivityTimeoutSeconds: 300,
    });
  });

  test('MockAuthDataSource rejects invalid credentials', async () => {
    const dataSource = new MockAuthDataSource();
    const loginPromise = dataSource.login({
      username: 'wrong-user-cred',
      password: 'bad-password',
    });

    jest.advanceTimersByTime(1500);

    await expect(loginPromise).rejects.toThrow('Credenciales inválidas');
  });

  test('MockTransactionDataSource returns the demo transaction list', async () => {
    const dataSource = new MockTransactionDataSource();
    const transactionsPromise = dataSource.getTransactions();

    jest.advanceTimersByTime(1000);

    const result = await transactionsPromise;

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: '2',
      description: 'Supermercado La Comer',
      type: 'expense',
      status: 'completed',
      amount: 1250.5,
    });
  });
});
