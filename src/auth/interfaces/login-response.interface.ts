export interface LoginResponse {
    user: {
      id: string;
      username: string;
      email: string;
      isActive: boolean;
    };
    token: string;
  }