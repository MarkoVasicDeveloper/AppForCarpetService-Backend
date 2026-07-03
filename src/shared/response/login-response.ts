export interface LoginResponse {
  id: number;
  identity: string;
  token: string;
  refreshToken: string;
  tokenExpire: string;
}
