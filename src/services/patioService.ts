import { authHeaders } from "./authService";

const BASE = "http://localhost:8000/api";

export type TipoZona = "principal" | "refrigerada" | "expedicao" | "recebimento" | "reserva" | "avariado";

export const TIPO_ZONA_LABELS: Record<TipoZona, string> = {
  principal:   "Principal",
  refrigerada: "Refrigerada",
  expedicao:   "Expedição",
  recebimento: "Recebimento",
  reserva:     "Reserva",
  avariado:    "Avariado",
};

export const TIPO_ZONA_COLORS: Record<TipoZona, string> = {
  principal:   "bg-primary/15 text-primary border-primary/30",
  refrigerada: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  expedicao:   "bg-amber-500/15 text-amber-600 border-amber-500/30",
  recebimento: "bg-green-500/15 text-green-600 border-green-500/30",
  reserva:     "bg-muted text-muted-foreground border-border",
  avariado:    "bg-destructive/15 text-destructive border-destructive/30",
};

export interface ZonaAPI {
  id:          number;
  patio:       number;
  nome:        string;
  tipo:        TipoZona;
  capacidade:  number;
  localizacao: string;
  created_at:  string;
  updated_at:  string;
}

export interface PatioAPI {
  id:               number;
  nome:             string;
  localizacao:      string;
  total_zonas:      number;
  capacidade_total: number;
  zonas?:           ZonaAPI[];
  created_at:       string;
  updated_at:       string;
}

// ── Pátios ────────────────────────────────────────────────────────────────────

export async function fetchPatios(): Promise<PatioAPI[]> {
  const res = await fetch(`${BASE}/patios/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar pátios.");
  return res.json();
}

export async function fetchPatio(id: number): Promise<PatioAPI> {
  const res = await fetch(`${BASE}/patios/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Pátio não encontrado.");
  return res.json();
}

export async function createPatio(data: { nome: string; localizacao: string }): Promise<PatioAPI> {
  const res = await fetch(`${BASE}/patios/`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(Object.values(e).flat().join(" ")); }
  return res.json();
}

export async function updatePatio(id: number, data: Partial<{ nome: string; localizacao: string }>): Promise<PatioAPI> {
  const res = await fetch(`${BASE}/patios/${id}/`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(Object.values(e).flat().join(" ")); }
  return res.json();
}

export async function deletePatio(id: number): Promise<void> {
  const res = await fetch(`${BASE}/patios/${id}/`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erro ao excluir pátio."); }
}

// ── Zonas ─────────────────────────────────────────────────────────────────────

export async function fetchZonas(patioId?: number): Promise<ZonaAPI[]> {
  const url = patioId ? `${BASE}/zonas/?patio=${patioId}` : `${BASE}/zonas/`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar zonas.");
  return res.json();
}

export async function createZona(data: Omit<ZonaAPI, "id" | "created_at" | "updated_at">): Promise<ZonaAPI> {
  const res = await fetch(`${BASE}/zonas/`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(Object.values(e).flat().join(" ")); }
  return res.json();
}

export async function updateZona(id: number, data: Partial<Omit<ZonaAPI, "id" | "created_at" | "updated_at">>): Promise<ZonaAPI> {
  const res = await fetch(`${BASE}/zonas/${id}/`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(Object.values(e).flat().join(" ")); }
  return res.json();
}

export async function deleteZona(id: number): Promise<void> {
  const res = await fetch(`${BASE}/zonas/${id}/`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erro ao excluir zona."); }
}
