import { api } from "@/lib/api-client";

export interface AuthUser {
  username: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>("/auth", { username, password }),
};
