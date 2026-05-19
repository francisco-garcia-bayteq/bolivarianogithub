/**
 * Cache en memoria de la clave pública del servidor por ejecución de la app.
 * No persiste en almacén seguro; se llena tras el primer GET exitoso a Security/public-key.
 */
export interface ServerPublicKeySessionStore {
  get(): string | null;
  set(value: string): void;
}
