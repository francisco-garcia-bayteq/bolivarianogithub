import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {useDI} from '../../../src/di';
import {useBeneficiaryContactsViewModel} from '../../../src/presentation/beneficiary/useBeneficiaryContactsViewModel';

jest.mock('../../../src/di', () => ({
  useDI: jest.fn(),
}));

const mockedUseDI = useDI as jest.MockedFunction<typeof useDI>;

function flushPromises(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve));
}

describe('useBeneficiaryContactsViewModel', () => {
  let latest: ReturnType<typeof useBeneficiaryContactsViewModel> | undefined;

  function Harness() {
    latest = useBeneficiaryContactsViewModel();
    return null;
  }

  beforeEach(() => {
    latest = undefined;
    jest.clearAllMocks();
  });

  test('loads contacts on mount', async () => {
    const contacts = [
      {
        beneficiaryGuid: 'g1',
        contactName: 'María',
        bankName: 'BB',
        accountType: 1,
        lastFourDigits: '4242',
      },
    ];
    mockedUseDI.mockReturnValue({
      getBeneficiaryContactsUseCase: {
        execute: jest.fn().mockResolvedValue(contacts),
      },
    } as never);

    await act(async () => {
      ReactTestRenderer.create(<Harness />);
      await flushPromises();
    });

    expect(latest?.contacts).toEqual(contacts);
    expect(latest?.isLoading).toBe(false);
    expect(latest?.error).toBeNull();
  });

  test('clears contacts on error and allows retry', async () => {
    const execute = jest
      .fn()
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce([]);

    mockedUseDI.mockReturnValue({
      getBeneficiaryContactsUseCase: {execute},
    } as never);

    await act(async () => {
      ReactTestRenderer.create(<Harness />);
      await flushPromises();
    });

    expect(latest?.error).toBe('Timeout');
    expect(latest?.contacts).toEqual([]);

    await act(async () => {
      await latest?.retry();
      await flushPromises();
    });

    expect(latest?.contacts).toEqual([]);
    expect(latest?.error).toBeNull();
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
