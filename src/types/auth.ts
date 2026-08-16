export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}