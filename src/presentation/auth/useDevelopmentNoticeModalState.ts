import {useCallback, useState} from 'react';

export function useDevelopmentNoticeModalState() {
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  return {visible, show, close};
}
