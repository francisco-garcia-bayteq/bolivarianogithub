import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {SecurityProvider, useSecurity} from '../../src/providers/SecurityProvider';
import {useDI} from '../../src/di';

jest.mock('../../src/di', () => ({
  useDI: jest.fn(),
}));

const mockedUseDI = useDI as jest.MockedFunction<typeof useDI>;

describe('SecurityProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expone la clave pública tras retry (carga explícita)', async () => {
    mockedUseDI.mockReturnValue({
      getPublicKeyUseCase: {
        execute: jest.fn().mockResolvedValue({value: 'pk-b64-value'}),
      },
    } as never);

    let ctx: ReturnType<typeof useSecurity> | undefined;
    function Read() {
      ctx = useSecurity();
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(
        <SecurityProvider>
          <Read />
        </SecurityProvider>,
      );
    });

    expect(ctx?.publicKey).toBeNull();

    await act(async () => {
      await ctx?.retry();
    });

    expect(ctx?.publicKey).toBe('pk-b64-value');
    expect(ctx?.isLoading).toBe(false);
    expect(ctx?.error).toBeNull();
  });

  it('expone error y permite retry', async () => {
    const execute = jest
      .fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({value: 'ok'});

    mockedUseDI.mockReturnValue({
      getPublicKeyUseCase: {execute},
    } as never);

    let ctx: ReturnType<typeof useSecurity> | undefined;
    function Read() {
      ctx = useSecurity();
      return null;
    }

    await act(async () => {
      ReactTestRenderer.create(
        <SecurityProvider>
          <Read />
        </SecurityProvider>,
      );
    });

    expect(ctx?.error).toBeNull();
    expect(ctx?.publicKey).toBeNull();

    await act(async () => {
      await ctx?.retry();
    });

    expect(ctx?.error).toBe('timeout');
    expect(ctx?.publicKey).toBeNull();

    await act(async () => {
      await ctx?.retry();
    });

    expect(ctx?.publicKey).toBe('ok');
    expect(ctx?.error).toBeNull();
  });
});
