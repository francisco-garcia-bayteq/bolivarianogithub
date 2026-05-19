import {useState, useCallback, useEffect} from 'react';
import {BeneficiaryContact} from '../../domain/entities/BeneficiaryContact';
import {useDI} from '../../di';

interface BeneficiaryContactsState {
  contacts: BeneficiaryContact[];
  isLoading: boolean;
  error: string | null;
}

export function useBeneficiaryContactsViewModel() {
  const [state, setState] = useState<BeneficiaryContactsState>({
    contacts: [],
    isLoading: true,
    error: null,
  });

  const {getBeneficiaryContactsUseCase} = useDI();

  const load = useCallback(async () => {
    setState(prev => ({...prev, isLoading: true, error: null}));

    try {
      const contacts = await getBeneficiaryContactsUseCase.execute();
      setState({contacts, isLoading: false, error: null});
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar contactos';
      setState({contacts: [], isLoading: false, error: message});
    }
  }, [getBeneficiaryContactsUseCase]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    contacts: state.contacts,
    isLoading: state.isLoading,
    error: state.error,
    retry: load,
  };
}
