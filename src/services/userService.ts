import { authHeaders } from "./authService";

const BASE_URL = import.meta.env.VITE_API_URL+"/api/users";

export type TipoUsuario = "administrador" | "portaria" | "recebimento" | "fornecedor";

export const TIPO_USUARIO_LABELS: Record<TipoUsuario, string> = {
  administrador: "Administrador",
  portaria:      "Portaria",
  recebimento:   "Recebimento",
  fornecedor:    "Fornecedor",
};

export const TIPO_USUARIO_COLORS: Record<TipoUsuario, string> = {
  administrador: "bg-primary/15 text-primary border-primary/30",
  portaria:      "bg-blue-500/15 text-blue-600 border-blue-500/30",
  recebimento:   "bg-green-500/15 text-green-600 border-green-500/30",
  fornecedor:    "bg-amber-500/15 text-amber-600 border-amber-500/30",
};

// Hierarquia: admin só pode criar tipos de nível menor que o seu
export const HIERARQUIA: Record<TipoUsuario, number> = {
  administrador: 4,
  portaria:      3,
  recebimento:   2,
  fornecedor:    1,
};

export interface UsuarioAPI {
  id:               number;
  username:         string;
  email:            string;
  first_name:       string;
  last_name:        string;
  tipo:             TipoUsuario;
  bloqueado:        boolean;
  is_system_admin:  boolean;
  date_joined:      string;
}

export async function fetchUsuarios(): Promise<UsuarioAPI[]> {
  const res = await fetch(`${BASE_URL}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar usuários.");
  return res.json();
}

export async function createUsuario(data: {
  username:   string;
  email:      string;
  first_name: string;
  last_name:  string;
  password:   string;
  tipo:       TipoUsuario;
}): Promise<UsuarioAPI> {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Object.values(err).flat().join(" "));
  }
  return res.json();
}

export async function updateUsuario(id: number, data: {
  email?:      string;
  first_name?: string;
  last_name?:  string;
  tipo?:       TipoUsuario;
}): Promise<UsuarioAPI> {
  const res = await fetch(`${BASE_URL}/${id}/`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Object.values(err).flat().join(" "));
  }
  return res.json();
}

export async function changePassword(id: number, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/senha/`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Object.values(err).flat().join(" "));
  }
}

export async function toggleAcesso(id: number, bloqueado: boolean): Promise<UsuarioAPI> {
  const res = await fetch(`${BASE_URL}/${id}/acesso/`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify({ bloqueado }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Erro ao alterar acesso.");
  }
  return res.json();
}

export async function deleteUsuario(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Erro ao excluir usuário.");
  }
}
