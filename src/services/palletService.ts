import { authHeaders } from "./authService";

const BASE_URL = "http://localhost:8000/api/agendamentos/pallets";

export type StatusPallet = "pendente" | "armazenado" | "retirado" | "avariado";

export const STATUS_PALLET_LABELS: Record<StatusPallet, string> = {
  pendente:   "Pendente",
  armazenado: "Armazenado",
  retirado:   "Retirado",
  avariado:   "Avariado",
};

export const STATUS_PALLET_COLORS: Record<StatusPallet, string> = {
  pendente:   "bg-amber-500/15 text-amber-600 border-amber-500/30",
  armazenado: "bg-success/15 text-success border-success/30",
  retirado:   "bg-muted text-muted-foreground border-border",
  avariado:   "bg-destructive/15 text-destructive border-destructive/30",
};

export interface PalletAPI {
  id:                number;
  agendamento:       number;
  agendamento_plate: string;
  agendamento_date:  string;
  agendamento_time:  string;
  numero_pallet:     number;
  numero_espaco:     number;
  zona_nome:         string;
  status:            StatusPallet;
  created_at:        string;
  updated_at:        string;
}

export interface PalletFiltros {
  zona?:        string;
  status?:      StatusPallet;
  agendamento?: number;
}

export async function fetchPallets(filtros?: PalletFiltros): Promise<PalletAPI[]> {
  const params = new URLSearchParams();
  if (filtros?.zona)        params.set("zona",        filtros.zona);
  if (filtros?.status)      params.set("status",      filtros.status);
  if (filtros?.agendamento) params.set("agendamento", String(filtros.agendamento));

  const url = `${BASE_URL}/${params.toString() ? "?" + params.toString() : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar pallets.");
  return res.json();
}

export async function updatePalletStatus(id: number, status: StatusPallet): Promise<PalletAPI> {
  const res = await fetch(`${BASE_URL}/${id}/status/`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Erro ao atualizar status do pallet.");
  }
  return res.json();
}
