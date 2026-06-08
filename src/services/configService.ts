import { authHeaders } from "./authService";

const BASE_URL =  import.meta.env.VITE_API_URL+"/api/config";

export interface ConfiguracaoAPI {
  janela_dias:        number;
  janela_horas:       number;
  janela_total_horas: number;
  updated_at:         string;
}

export async function fetchConfiguracao(): Promise<ConfiguracaoAPI> {
  const res = await fetch(`${BASE_URL}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar configuração.");
  return res.json();
}

export async function updateConfiguracao(data: {
  janela_dias?:  number;
  janela_horas?: number;
}): Promise<ConfiguracaoAPI> {
  const res = await fetch(`${BASE_URL}/`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Object.values(err).flat().join(" "));
  }
  return res.json();
}
