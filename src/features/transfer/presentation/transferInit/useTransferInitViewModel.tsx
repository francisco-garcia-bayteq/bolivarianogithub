import {useHomeViewModel} from "../../../../presentation/home/useHomeViewModel.ts";


export const useTransferInitViewModel = () => {
  const {data, isLoading, error, retry} = useHomeViewModel();

  const isBetweenOwnAccountsEnabled = (data?.accounts.length ?? 0) >= 2;
  const isThirdPartyEnabled = false

  return {
    data,
    isLoading,
    error,
    retry,
    isBetweenOwnAccountsEnabled,
    isThirdPartyEnabled,
  };
};
