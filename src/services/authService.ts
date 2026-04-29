const BASE_URL = import.meta.env.VITE_API_URL+"/api";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

// Persistência de tokens no localStorage
export const TokenStorage = {
  getAccess:      ()            => localStorage.getItem("access_token"),
  getRefresh:     ()            => localStorage.getItem("refresh_token"),
  set:            (t: AuthTokens) => {
    localStorage.setItem("access_token",  t.access);
    localStorage.setItem("refresh_token", t.refresh);
  },
  clear:          ()            => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

// Retorna headers com Bearer token
export function authHeaders(): HeadersInit {
  const token = TokenStorage.getAccess();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// POST /api/auth/login/
export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Erro ao fazer login.");
  }
  const data: AuthResponse = await res.json();
  TokenStorage.set(data);
  return data;
}

// POST /api/auth/register/
export async function register(payload: {
  username:   string;
  email:      string;
  first_name: string;
  last_name:  string;
  password:   string;
  password2:  string;
}): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    // Junta todos os erros de validação em uma string legível
    const message = Object.values(err).flat().join(" ");
    throw new Error(message || "Erro ao criar conta.");
  }
  const data: AuthResponse = await res.json();
  TokenStorage.set(data);
  return data;
}

// GET /api/auth/me/
export async function getMe(): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/me/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Sessão expirada.");
  return res.json();
}

export function logout(): void {
  TokenStorage.clear();
}
