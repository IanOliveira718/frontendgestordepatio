import { authHeaders } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL+"/api/agendamentos"

;

export type TipoUnidade = "pallet" | "volume";

export interface PalletDescricao {
  ordem:    number;
  descricao: string;
}

export interface VolumeDescricao {
  ordem:       number;
  descricao:   string;
  altura:      number;
  largura:     number;
  comprimento: number;
}

export interface AgendamentoAPI {
  id:          string;
  date:        string;
  time:        string;
  plate:       string;
  driver:      string;
  type:        "entrada" | "saida";
  zone:        string;
  pallets:     number;
  nota_fiscal: string;
  tipo_unidade: TipoUnidade;
  status:      "agendado" | "confirmado" | "em_andamento" | "concluido" | "cancelado";
  descricoes_pallets?: PalletDescricao[];
  descricoes_volumes?: VolumeDescricao[];
}

export interface AgendamentoPayload {
  plate:        string;
  driver:       string;
  type:         string;
  zone:         string;
  date:         string;
  time:         string;
  pallets:      number;
  nota_fiscal:  string;
  tipo_unidade: TipoUnidade;
  descricoes_pallets: PalletDescricao[];
  descricoes_volumes: VolumeDescricao[];
}

 // GET /api/agendamentos/<id>/
export async function fetchAgendamentoById(id: string): Promise<AgendamentoAPI> {
  const res = await fetch(`${BASE_URL}/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Agendamento não encontrado.");
  return res.json();
}

export async function fetchAgendamentosByDate(date: string): Promise<AgendamentoAPI[]> {
  const res = await fetch(`${BASE_URL}/?date=${date}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar agendamentos do dia.");
  return res.json();
}

export async function fetchAgendamentosByPeriod(
  startDate: string,
  endDate: string
): Promise<AgendamentoAPI[]> {
  const res = await fetch(
    `${BASE_URL}/periodo/?start_date=${startDate}&end_date=${endDate}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Erro ao buscar agendamentos do período.");
  return res.json();
}

export async function createAgendamento(payload: AgendamentoPayload): Promise<AgendamentoAPI> {
  const res = await fetch(`${BASE_URL}/`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    const message =
      err?.descricoes_pallets ??
      err?.descricoes_volumes ??
      err?.nota_fiscal ??
      Object.values(err).flat().join(" ") ??
      "Erro ao criar agendamento.";
    throw new Error(Array.isArray(message) ? message.join(" ") : String(message));
  }
  return res.json();
}

export async function updateAgendamentoStatus(
  id: string,
  status: AgendamentoAPI["status"]
): Promise<AgendamentoAPI> {
  const res = await fetch(`${BASE_URL}/${id}/status/`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function cancelAgendamento(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/cancelar/`, {
    method:  "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
}
