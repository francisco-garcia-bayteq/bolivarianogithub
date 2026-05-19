export interface LoginResponseModel {
  accessToken: string;
  firstName: string;
  /** Si el servidor devuelve un valor distinto de `null`, el cliente no debe pedir registro de alias tras OTP. */
  alias?: string | null;
  sessionTimeSeconds: number;
  inactivityTimeoutSeconds: number;
}
