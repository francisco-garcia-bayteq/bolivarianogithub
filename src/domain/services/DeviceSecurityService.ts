import type {DeviceSecuritySnapshot} from '../entities/DeviceSecuritySnapshot';

export interface DeviceSecurityService {
  getSnapshot(): Promise<DeviceSecuritySnapshot>;
}
