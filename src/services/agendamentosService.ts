import { authHeaders } from "./authService";

const BASE_URL = "http://localhost:8000/api/agendamentos";

export interface PalletDescricao {
  ordem: number;
  descricao: string;
}

export interface AgendamentoAPI {
  id: string;
  date: string;
  time: string;
  plate: string;
  driver: string;
  type: "entrada" | "saida";
  zone: string;
  pallets: number;
  nota_fiscal: string;
  status: "agendado" | "confirmado" | "em_andamento" | "concluido" | "cancelado";
  descricoes_pallets?: PalletDescricao[];
}

export interface AgendamentoPayload {
  plate: string;
  driver: string;
  type: string;
  zone: string;
  date: string;
  time: string;
  pallets: number;
  nota_fiscal: string;
  descricoes_pallets: PalletDescricao[];
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

  console.log(JSON.stringify(payload));

  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    // Extrai mensagem legível de erros de validação do DRF
    const message =
      err?.descricoes_pallets ??
      err?.nota_fiscal ??
      Object.values(err).flat().join(" ") ??
      "Erro ao criar agendamento.";
    throw new Error(Array.isArray(message) ? message.join(" ") : message);
  }
  return res.json();
}

export async function updateAgendamentoStatus(
  id: string,
  status: AgendamentoAPI["status"]
): Promise<AgendamentoAPI> {
  const res = await fetch(`${BASE_URL}/${id}/status/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function cancelAgendamento(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/cancelar/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
}
