/** Body de login: `username` y `password` son texto cifrado (RSA-OAEP, convención doble Base64 del backend). */
export interface LoginRequestModel {
  username: string;
  password: string;
}