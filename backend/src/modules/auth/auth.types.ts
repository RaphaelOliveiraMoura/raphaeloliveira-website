export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
