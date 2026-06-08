import { authHeaders } from "./authService";

const BASE =  import.meta.env.VITE_API_URL+"/api/fornecedores";

export interface FornecedorAPI {
  id:            number;
  cnpj:          string;
  cnpj_formatado: string;
  razao_social:  string;
  nome_fantasia: string;
  ativo:         boolean;
  created_at:    string;
  updated_at:    string;
}

export interface PaginatedFornecedores {
  count:    number;
  page:     number;
  per_page: number;
  pages:    number;
  results:  FornecedorAPI[];
}

export interface FornecedorPayload {
  cnpj:          string;
  razao_social:  string;
  nome_fantasia: string;
}

export async function fetchFornecedores(params?: {
  q?: string; page?: number; per_page?: number; ativo?: boolean | null;
}): Promise<PaginatedFornecedores> {
  const p = new URLSearchParams();
  if (params?.q)                          p.set("q",        params.q);
  if (params?.page)                       p.set("page",     String(params.page));
  if (params?.per_page)                   p.set("per_page", String(params.per_page));
  if (params?.ativo != null)              p.set("ativo",    String(params.ativo));

  const res = await fetch(`${BASE}/?${p}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar fornecedores.");
  return res.json();
}

export async function fetchFornecedor(id: number): Promise<FornecedorAPI> {
  const res = await fetch(`${BASE}/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Fornecedor não encontrado.");
  return res.json();
}

export async function createFornecedor(data: FornecedorPayload): Promise<FornecedorAPI> {
  const res = await fetch(`${BASE}/`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Object.values(err).flat().join(" "));
  }
  return res.json();
}

export async function updateFornecedor(id: number, data: Partial<FornecedorPayload>): Promise<FornecedorAPI> {
  const res = await fetch(`${BASE}/${id}/`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Object.values(err).flat().join(" "));
  }
  return res.json();
}

export async function toggleFornecedorStatus(id: number, ativo: boolean): Promise<FornecedorAPI> {
  const res = await fetch(`${BASE}/${id}/status/`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify({ ativo }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Erro ao atualizar status.");
  }
  return res.json();
}

export async function deleteFornecedor(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}/`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Erro ao excluir fornecedor.");
  }
}