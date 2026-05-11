import { useState, useEffect, useCallback } from "react";
import {
  Package, MapPin, ChevronRight, ChevronLeft,
  Search, X, RefreshCw, Clock, CheckCircle2,
  Truck, AlertTriangle, Layers, Loader2,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header }  from "@/components/Header";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Badge }   from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  PalletAPI, StatusPallet,
  STATUS_PALLET_LABELS, STATUS_PALLET_COLORS,
  fetchPallets, updatePalletStatus,
} from "@/services/palletService";
import { fetchZonas, ZonaAPI, TIPO_ZONA_LABELS, TIPO_ZONA_COLORS } from "@/services/patioService";
import { fetchAgendamentoById, AgendamentoAPI } from "@/services/agendamentosService";

// ── Tipos internos ────────────────────────────────────────────────────────────
type VistaAtual =
  | { tipo: "zonas" }
  | { tipo: "zona";     zona: ZonaAPI }
  | { tipo: "especial"; modo: "avariado" | "retirado" };

const STATUS_ICONS: Record<StatusPallet, React.ElementType> = {
  pendente:   Clock,
  armazenado: CheckCircle2,
  retirado:   Truck,
  avariado:   AlertTriangle,
};

const TIPO_ICONS: Record<string, string> = {
  principal:   "🏭",
  refrigerada: "❄️",
  expedicao:   "🚚",
  recebimento: "📥",
  reserva:     "📦",
  avariado:    "⚠️",
};

function getDescricaoPallet(agendamento: AgendamentoAPI | null, numeroPallet: number): string {
  if (!agendamento) return "—";
  const desc = agendamento.descricoes_pallets?.find((d) => d.ordem === numeroPallet);
  return desc?.descricao ?? "—";
}

// ─────────────────────────────────────────────────────────────────────────────
// Seleção de Zona
// ─────────────────────────────────────────────────────────────────────────────
interface ZonaSelectorProps {
  zonas:            ZonaAPI[];
  todosOsPallets:   PalletAPI[];
  loading:          boolean;
  onSelectZona:     (z: ZonaAPI) => void;
  onSelectEspecial: (modo: "avariado" | "retirado") => void;
  searchTerm:       string;
  setSearchTerm:    (v: string) => void;
}

function ZonaSelector({
  zonas, todosOsPallets, loading,
  onSelectZona, onSelectEspecial,
  searchTerm, setSearchTerm,
}: ZonaSelectorProps) {
  const avariados = todosOsPallets.filter((p) => p.status === "avariado").length;
  const retirados = todosOsPallets.filter((p) => p.status === "retirado").length;

  const filtered = zonas.filter((z) =>
    z.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    TIPO_ZONA_LABELS[z.tipo]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Controle de Pallets</h1>
        <p className="text-sm text-muted-foreground mt-1">Selecione uma zona para visualizar os pallets ativos</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar zona..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Zonas ativas */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Zonas Ativas
            </p>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12">
                <Layers className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="font-medium text-foreground">
                  {searchTerm ? "Nenhuma zona encontrada" : "Nenhuma zona cadastrada"}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((zona) => {
                  const ativos = todosOsPallets.filter(
                    (p) => p.zona_nome === zona.nome &&
                           (p.status === "pendente" || p.status === "armazenado")
                  ).length;
                  const ocupacao = Math.round((ativos / Math.max(zona.capacidade, 1)) * 100);

                  return (
                    <button key={zona.id} onClick={() => onSelectZona(zona)}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                        {TIPO_ICONS[zona.tipo] ?? "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{zona.nome}</p>
                        <Badge variant="outline" className={cn("mt-1 text-xs", TIPO_ZONA_COLORS[zona.tipo])}>
                          {TIPO_ZONA_LABELS[zona.tipo]}
                        </Badge>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{ativos} pallets ativos</span>
                            <span>{ocupacao}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className={cn(
                              "h-full rounded-full transition-all",
                              ocupacao >= 90 ? "bg-destructive" :
                              ocupacao >= 70 ? "bg-amber-500" : "bg-primary"
                            )} style={{ width: `${Math.min(ocupacao, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Áreas especiais — só quando não há busca ativa */}
          {!searchTerm && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Áreas Especiais
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => onSelectEspecial("avariado")}
                  className="group flex items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left transition-all hover:border-destructive/50 hover:bg-destructive/10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-2xl">⚠️</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Avariados</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pallets com registro de avaria</p>
                    <p className="mt-1.5 text-2xl font-bold text-destructive">{avariados}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </button>

                <button onClick={() => onSelectEspecial("retirado")}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">🚚</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Retirados</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pallets já retirados do pátio</p>
                    <p className="mt-1.5 text-2xl font-bold text-foreground">{retirados}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabela de Pallets
// ─────────────────────────────────────────────────────────────────────────────
interface PalletTableProps {
  titulo:    string;
  subtitulo?: string;
  icone:     string;
  pallets:   PalletAPI[];
  zona?:     ZonaAPI;
  loading:   boolean;
  onBack:    () => void;
  onRefresh: () => void;
  onClickPallet: (p: PalletAPI) => void;
}

function PalletTable({
  titulo, subtitulo, icone, pallets, zona,
  loading, onBack, onRefresh, onClickPallet,
}: PalletTableProps) {
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = pallets.filter((p) => {
    const matchSearch =
      String(p.numero_pallet).includes(search) ||
      String(p.numero_espaco).includes(search) ||
      p.agendamento_plate.toLowerCase().includes(search.toLowerCase()) ||
      p.zona_nome.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendentes   = pallets.filter((p) => p.status === "pendente").length;
  const armazenados = pallets.filter((p) => p.status === "armazenado").length;
  const ocupacao    = zona
    ? Math.round(((pendentes + armazenados) / Math.max(zona.capacidade, 1)) * 100)
    : null;

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{icone}</span>
            <h1 className="text-2xl font-bold text-foreground">{titulo}</h1>
            {subtitulo && <Badge variant="outline" className="text-xs">{subtitulo}</Badge>}
          </div>
          {zona?.localizacao && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />{zona.localizacao}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Barra de ocupação — só para zonas reais */}
      {zona && ocupacao !== null && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Ocupação da zona</span>
            <span className="text-muted-foreground">
              {pendentes + armazenados} / {zona.capacidade} pallets ({ocupacao}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div className={cn(
              "h-full rounded-full transition-all duration-500",
              ocupacao >= 90 ? "bg-destructive" :
              ocupacao >= 70 ? "bg-amber-500" : "bg-primary"
            )} style={{ width: `${Math.min(ocupacao, 100)}%` }} />
          </div>
          <div className="flex gap-4 pt-1">
            {(["pendente", "armazenado"] as StatusPallet[]).map((s) => {
              const count = s === "pendente" ? pendentes : armazenados;
              const Icon  = STATUS_ICONS[s];
              return (
                <button key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                    filterStatus === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}>
                  <Icon className="h-3.5 w-3.5" />
                  <span className="font-medium">{count}</span>
                  <span>{STATUS_PALLET_LABELS[s]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nº, espaço ou placa..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {(search || filterStatus !== "all") && (
          <Button variant="ghost" size="icon"
            onClick={() => { setSearch(""); setFilterStatus("all"); }}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">Nenhum pallet encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[80px] text-center">Nº</TableHead>
                <TableHead className="w-[80px] text-center">Espaço</TableHead>
                {!zona && <TableHead>Zona</TableHead>}
                <TableHead>Veículo</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pallet) => {
                const StatusIcon = STATUS_ICONS[pallet.status];
                return (
                  <TableRow key={pallet.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => onClickPallet(pallet)}>
                    <TableCell className="text-center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mx-auto">
                        {pallet.numero_pallet}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm font-semibold">#{pallet.numero_espaco}</span>
                    </TableCell>
                    {!zona && (
                      <TableCell><span className="font-mono text-sm">{pallet.zona_nome}</span></TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-mono text-sm font-semibold">{pallet.agendamento_plate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{pallet.agendamento_time}</p>
                      <p className="text-xs text-muted-foreground">
                        {pallet.agendamento_date
                          ? new Date(pallet.agendamento_date + "T00:00:00").toLocaleDateString("pt-BR")
                          : "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1.5 text-xs", STATUS_PALLET_COLORS[pallet.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {STATUS_PALLET_LABELS[pallet.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">{filtered.length} pallet(s) exibido(s)</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal de Detalhe
// ─────────────────────────────────────────────────────────────────────────────
interface PalletDetailModalProps {
  pallet:    PalletAPI | null;
  onClose:   () => void;
  onUpdated: (updated: PalletAPI) => void;
}

function PalletDetailModal({ pallet, onClose, onUpdated }: PalletDetailModalProps) {
  const [saving,      setSaving]      = useState(false);
  const [agendamento, setAgendamento] = useState<AgendamentoAPI | null>(null);
  const [loadingDesc, setLoadingDesc] = useState(false);

  useEffect(() => {
    if (!pallet) { setAgendamento(null); return; }
    setLoadingDesc(true);
    fetchAgendamentoById(String(pallet.agendamento))
      .then(setAgendamento)
      .catch(() => {})
      .finally(() => setLoadingDesc(false));
  }, [pallet?.id]);

  if (!pallet) return null;

  const StatusIcon = STATUS_ICONS[pallet.status];
  const descricao  = getDescricaoPallet(agendamento, pallet.numero_pallet);
  const volumeDesc = agendamento?.descricoes_volumes?.find((v) => v.ordem === pallet.numero_pallet);

  const ACOES: { status: StatusPallet; label: string; icon: React.ElementType; color: string }[] = [
    { status: "armazenado", label: "Marcar como Armazenado", icon: CheckCircle2,  color: "border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20" },
    { status: "retirado",   label: "Marcar como Retirado",   icon: Truck,         color: "border-border bg-muted/30 text-foreground hover:bg-muted" },
    { status: "pendente",   label: "Voltar para Pendente",   icon: Clock,         color: "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" },
    { status: "avariado",   label: "Registrar Avaria",       icon: AlertTriangle, color: "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20" },
  ];

  const handleAcao = async (novoStatus: StatusPallet) => {
    setSaving(true);
    try {
      const updated = await updatePalletStatus(pallet.id, novoStatus);
      onUpdated(updated);
      toast({ title: "Status atualizado", description: `Pallet ${pallet.numero_pallet} → ${STATUS_PALLET_LABELS[novoStatus]}` });
      onClose();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!pallet} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
              {pallet.numero_pallet}
            </span>
            <div>
              <p className="text-base font-semibold leading-tight">Pallet {pallet.numero_pallet}</p>
              <p className="text-sm font-normal text-muted-foreground">
                Zona {pallet.zona_nome} · Espaço #{pallet.numero_espaco}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">

          {/* Informações */}
          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Número do espaço</span>
              <span className="font-mono font-semibold">#{pallet.numero_espaco}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Veículo</span>
              <span className="font-mono font-semibold">{pallet.agendamento_plate}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Nota Fiscal</span>
              <span className="font-medium">{agendamento?.nota_fiscal ?? "—"}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Horário</span>
              <div className="text-right">
                <p className="font-medium">{pallet.agendamento_time}</p>
                <p className="text-xs text-muted-foreground">
                  {pallet.agendamento_date
                    ? new Date(pallet.agendamento_date + "T00:00:00").toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className={cn("gap-1.5 text-xs", STATUS_PALLET_COLORS[pallet.status])}>
                <StatusIcon className="h-3 w-3" />
                {STATUS_PALLET_LABELS[pallet.status]}
              </Badge>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Descrição do {agendamento?.tipo_unidade === "volume" ? "Volume" : "Pallet"}
            </p>
            {loadingDesc ? (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando descrição...
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-foreground leading-relaxed">
                {descricao}
              </div>
            )}

            {/* Dimensões do volume */}
            {volumeDesc && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Altura",      valor: volumeDesc.altura },
                  { label: "Largura",     valor: volumeDesc.largura },
                  { label: "Comprimento", valor: volumeDesc.comprimento },
                ].map((d) => (
                  <div key={d.label} className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                    <p className="text-sm font-semibold text-foreground">{d.valor} cm</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ações disponíveis
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ACOES.map((acao) => {
                const AcaoIcon = acao.icon;
                const isAtual  = pallet.status === acao.status;
                return (
                  <button key={acao.status}
                    disabled={isAtual || saving}
                    onClick={() => handleAcao(acao.status)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all text-left",
                      acao.color,
                      (isAtual || saving) && "cursor-not-allowed opacity-40"
                    )}>
                    <AcaoIcon className="h-4 w-4 shrink-0" />
                    <span className="leading-tight">{acao.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Pallets() {
  const [zonas,            setZonas]            = useState<ZonaAPI[]>([]);
  const [todosOsPallets,   setTodosOsPallets]   = useState<PalletAPI[]>([]);
  const [palletsFiltrados, setPalletsFiltrados] = useState<PalletAPI[]>([]);
  const [vista,            setVista]            = useState<VistaAtual>({ tipo: "zonas" });
  const [palletDetalhe,    setPalletDetalhe]    = useState<PalletAPI | null>(null);
  const [loadingZonas,     setLoadingZonas]     = useState(false);
  const [loadingPallets,   setLoadingPallets]   = useState(false);
  const [searchZona,       setSearchZona]       = useState("");

  const loadAll = useCallback(async () => {
    setLoadingZonas(true);
    try {
      const [z, p] = await Promise.all([fetchZonas(), fetchPallets()]);
      setZonas(z);
      setTodosOsPallets(p);
    } catch {
      toast({ title: "Erro ao carregar dados.", variant: "destructive" });
    } finally {
      setLoadingZonas(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Filtra pallets conforme a vista
  useEffect(() => {
    if (vista.tipo === "zona") {
      setPalletsFiltrados(
        todosOsPallets.filter(
          (p) => p.zona_nome === vista.zona.nome &&
                 (p.status === "pendente" || p.status === "armazenado")
        )
      );
    } else if (vista.tipo === "especial") {
      setPalletsFiltrados(todosOsPallets.filter((p) => p.status === vista.modo));
    }
  }, [vista, todosOsPallets]);

  const handlePalletUpdated = (updated: PalletAPI) => {
    setTodosOsPallets((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  };

  const handleBack = () => { setVista({ tipo: "zonas" }); setSearchZona(""); };

  // Configuração da vista atual
  const vistaConfig = vista.tipo === "especial"
    ? vista.modo === "avariado"
      ? { titulo: "Pallets Avariados", icone: "⚠️",  subtitulo: "Registro de avarias" }
      : { titulo: "Pallets Retirados", icone: "🚚",  subtitulo: "Histórico de retiradas" }
    : vista.tipo === "zona"
      ? { titulo: `Zona ${vista.zona.nome}`, icone: TIPO_ICONS[vista.zona.tipo] ?? "📦", subtitulo: TIPO_ZONA_LABELS[vista.zona.tipo] }
      : null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6">
          {vista.tipo === "zonas" ? (
            <ZonaSelector
              zonas={zonas}
              todosOsPallets={todosOsPallets}
              loading={loadingZonas}
              onSelectZona={(zona) => setVista({ tipo: "zona", zona })}
              onSelectEspecial={(modo) => setVista({ tipo: "especial", modo })}
              searchTerm={searchZona}
              setSearchTerm={setSearchZona}
            />
          ) : vistaConfig && (
            <PalletTable
              titulo={vistaConfig.titulo}
              subtitulo={vistaConfig.subtitulo}
              icone={vistaConfig.icone}
              pallets={palletsFiltrados}
              zona={vista.tipo === "zona" ? vista.zona : undefined}
              loading={loadingPallets}
              onBack={handleBack}
              onRefresh={loadAll}
              onClickPallet={setPalletDetalhe}
            />
          )}
        </main>
      </div>

      <PalletDetailModal
        pallet={palletDetalhe}
        onClose={() => setPalletDetalhe(null)}
        onUpdated={handlePalletUpdated}
      />
    </div>
  );
}
