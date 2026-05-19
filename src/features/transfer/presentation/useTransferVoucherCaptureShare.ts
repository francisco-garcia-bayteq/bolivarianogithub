import {useCallback, useRef} from 'react';
import type ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

export function useTransferVoucherCaptureShare() {
  const viewShotRef = useRef<ViewShot | null>(null);

  const shareVoucher = useCallback(async () => {
    if (!viewShotRef.current) {
      return;
    }
    const uri = await (
      viewShotRef.current as unknown as {capture: () => Promise<string>}
    ).capture();
    try {
      await Share.open({
        title: 'BBO',
        message: 'Compartir comprobante',
        url: uri,
      });
    } catch {
      // usuario canceló o error de share
    }
  }, []);

  return {viewShotRef, shareVoucher};
}
