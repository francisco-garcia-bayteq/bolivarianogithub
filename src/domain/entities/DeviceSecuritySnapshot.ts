/**
 * Señales de integridad del dispositivo recopiladas en un momento dado.
 * En iOS no existe API pública para el interruptor "Developer Mode" del sistema;
 * `isDeveloperModeEnabled` será false y `developerModeSupported` false.
 */
export interface DeviceSecuritySnapshot {
  isRootedOrJailbroken: boolean;
  isEmulator: boolean;
  isDeveloperModeEnabled: boolean;
  /** true solo en Android; JailMonkey expone modo desarrollador allí. */
  developerModeSupported: boolean;
  isDebuggedMode: boolean;
}
