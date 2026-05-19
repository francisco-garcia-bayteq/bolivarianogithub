import {useMemo} from 'react';
import {getVersion, getBuildNumber} from 'react-native-device-info';

import {formatAppVersionDisplay} from '../../utils/appVersion';

export function useLoginVersionLabel(): string {
  return useMemo(
    () =>
      `Versión ${formatAppVersionDisplay(
        getVersion(),
        getBuildNumber(),
      )}`,
    [],
  );
}
