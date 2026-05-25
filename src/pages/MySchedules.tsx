import { useState, useEffect, useCallback } from "react";
import { format, subMonths, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar, Truck, Package, MapPin, FileText,
  Clock, CheckCircle2, AlertCircle, Timer,
  ChevronRight, Search, X, Box, ArrowLeft,
  Hash, Layers,
} from "lucide-react";
import { Sidebar }  from "@/components/Sidebar";
import { Header }   from "@/components/Header";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast }  from "@/hooks/use-toast";
import { cn }     from "@/lib/utils";
import {
  AgendamentoAPI,
  fetchAgendamentosByPeriod,
  fetchAgendamentoById,
} from "@/services/agendamentosService";

// ── Config visual ─────────────────────────────────────────────────────────────

type StatusAgendamento = AgendamentoAPI["status"];

const STATUS_CONFIG: Record<StatusAgendamento, {
  label: string; icon: React.ElementType;
  badge: string; dot: string;
}> = {
  agendado:     { label: "Agendado",     icon: Clock,        badge: "bg-muted text-muted-foreground border-border",              dot: "bg-muted-foreground" },
  confirmado:   { label: "Confirmado",   icon: CheckCircle2, badge: "bg-primary/15 text-primary border-primary/30",             dot: "bg-primary" },
  em_andamento: { label: "Em andamento", icon: Timer,        badge: "bg-amber-500/15 text-amber-600 border-amber-500/30",       dot: "bg-amber-500" },
  concluido:    { label: "Concluído",    icon: CheckCircle2, badge: "bg-green-500/15 text-green-600 border-green-500/30",       dot: "bg-green-500" },
  cancelado:    { label: "Cancelado",    icon: AlertCircle,  badge: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
};

const TYPE_CONFIG = {
  entrada: { label: "Entrada", color: "bg-green-500/15 text-green-600 border-green-500/30", icon: "↓" },
  saida:   { label: "Saída",   color: "bg-blue-500/15 text-blue-600 border-blue-500/30",   icon: "↑" },
};

// ── Helper: converte string de data da API para objeto Date ───────────────────
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ── Card de agendamento ───────────────────────────────────────────────────────
interface AgendamentoCardProps {
  agendamento: AgendamentoAPI;
  onClick:     () => void;
}

function AgendamentoCard({ agendamento, onClick }: AgendamentoCardProps) {
  const statusCfg = STATUS_CONFIG[agendamento.status];
  const typeCfg   = TYPE_CONFIG[agendamento.type];
  const StatusIcon = statusCfg.icon;
  const data       = parseDate(agendamento.date);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Data */}
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
          <span className="text-xs font-medium uppercase text-muted-foreground leading-none">
            {format(data, "MMM", { locale: ptBR })}
          </span>
          <span className="text-2xl font-bold text-foreground leading-tight">
            {format(data, "dd")}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-foreground">{agendamento.plate}</span>
            <Badge variant="outline" className={cn("text-xs gap-1", typeCfg.color)}>
              {typeCfg.icon} {typeCfg.label}
            </Badge>
            <Badge variant="outline" className={cn("text-xs gap-1.5", statusCfg.badge)}>
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </Badge>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />{agendamento.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />{agendamento.zone}
            </span>
            <span className="flex items-center gap-1">
              {agendamento.tipo_unidade === "volume"
                ? <Box className="h-3.5 w-3.5" />
                : <Package className="h-3.5 w-3.5" />}
              {agendamento.pallets} {agendamento.tipo_unidade === "volume" ? "volumes" : "pallets"}
            </span>
            {agendamento.nota_fiscal && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />{agendamento.nota_fiscal}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 mt-1" />
      </div>
    </button>
  );
}

// ── Modal de detalhe ──────────────────────────────────────────────────────────
interface DetalheModalProps {
  agendamento: AgendamentoAPI | null;
  onClose:     () => void;
}

function DetalheModal({ agendamento, onClose }: DetalheModalProps) {
  if (!agendamento) return null;

  const statusCfg  = STATUS_CONFIG[agendamento.status];
  const typeCfg    = TYPE_CONFIG[agendamento.type];
  const StatusIcon = statusCfg.icon;
  const data       = parseDate(agendamento.date);
  const isPallet   = agendamento.tipo_unidade !== "volume";
  const descricoes = isPallet
    ? (agendamento.descricoes_pallets ?? [])
    : (agendamento.descricoes_volumes ?? []);

  return (
    <Dialog open={!!agendamento} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
              <span className="text-[10px] font-medium uppercase text-muted-foreground leading-none">
                {format(data, "MMM", { locale: ptBR })}
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {format(data, "dd")}
              </span>
            </div>
            <div>
              <p className="font-mono text-base font-bold">{agendamento.plate}</p>
              <p className="text-sm font-normal text-muted-foreground">{agendamento.driver}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">

          {/* Badges de tipo e status */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={cn("gap-1", typeCfg.color)}>
              {typeCfg.icon} {typeCfg.label}
            </Badge>
            <Badge variant="outline" className={cn("gap-1.5", statusCfg.badge)}>
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </Badge>
          </div>

          {/* Informações principais */}
          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />Horário
              </span>
              <span className="font-medium">
                {format(data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {agendamento.time}
              </span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />Zona
              </span>
              <span className="font-mono font-semibold">{agendamento.zone}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />Nota Fiscal
              </span>
              <span className="font-medium">{agendamento.nota_fiscal || "—"}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                {isPallet
                  ? <Package className="h-3.5 w-3.5" />
                  : <Box className="h-3.5 w-3.5" />}
                {isPallet ? "Pallets" : "Volumes"}
              </span>
              <span className="font-semibold">{agendamento.pallets}</span>
            </div>
          </div>

          {/* Descrições dos pallets/volumes */}
          {descricoes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {isPallet ? "Descrição dos Pallets" : "Descrição dos Volumes"}
              </p>
              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                {isPallet
                  ? (descricoes as typeof agendamento.descricoes_pallets & {}).map((d: any) => (
                      <div key={d.ordem} className="flex items-start gap-2 text-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {d.ordem}
                        </span>
                        <span className="text-foreground leading-relaxed">{d.descricao}</span>
                      </div>
                    ))
                  : (agendamento.descricoes_volumes ?? []).map((v) => (
                      <div key={v.ordem} className="space-y-1.5">
                        <div className="flex items-start gap-2 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {v.ordem}
                          </span>
                          <span className="font-medium text-foreground">{v.descricao}</span>
                        </div>
                        <div className="ml-7 flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />A: {v.altura} cm
                          </span>
                          <span>L: {v.largura} cm</span>
                          <span>C: {v.comprimento} cm</span>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>
          )}

          {/* Pallets vinculados (se existirem no objeto) */}
          {(agendamento as any).pallets_detalhes?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pallets no Pátio
              </p>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-muted-foreground text-xs">
                      <th className="px-3 py-2 text-left">Nº</th>
                      <th className="px-3 py-2 text-left">Espaço</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(agendamento as any).pallets_detalhes.map((p: any) => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {p.numero_pallet}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold">#{p.numero_espaco}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs">
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function MySchedules() {
  const [agendamentos,    setAgendamentos]    = useState<AgendamentoAPI[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterStatus,    setFilterStatus]    = useState<string>("all");
  const [detalhe,         setDetalhe]         = useState<AgendamentoAPI | null>(null);
  const [loadingDetalhe,  setLoadingDetalhe]  = useState(false);

  // Carrega os últimos 3 meses
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const end   = format(new Date(), "yyyy-MM-dd");
      const start = format(subMonths(new Date(), 3), "yyyy-MM-dd");
      const data  = await fetchAgendamentosByPeriod(start, end);
      // Ordena do mais recente para o mais antigo
      setAgendamentos(
        data.sort((a, b) => {
          const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
          return diff !== 0 ? diff : b.time.localeCompare(a.time);
        })
      );
    } catch {
      toast({ title: "Erro ao carregar agendamentos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Abre detalhe buscando dados completos (com descrições e pallets)
  const handleOpenDetalhe = async (agendamento: AgendamentoAPI) => {
    setDetalhe(agendamento); // abre imediatamente com o que já tem
    setLoadingDetalhe(true);
    try {
      const completo = await fetchAgendamentoById(agendamento.id);
      setDetalhe(completo);
    } catch {
      // mantém os dados parciais que já estão no modal
    } finally {
      setLoadingDetalhe(false);
    }
  };

  // Filtragem
  const filtered = agendamentos.filter((a) => {
    const matchSearch =
      a.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.nota_fiscal ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Agrupa por mês para exibição
  const grupos = filtered.reduce<Record<string, AgendamentoAPI[]>>((acc, a) => {
    const chave = format(parseDate(a.date), "MMMM 'de' yyyy", { locale: ptBR });
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(a);
    return acc;
  }, {});

  // Stats
  const total     = agendamentos.length;
  const ativos    = agendamentos.filter((a) => !["cancelado", "concluido"].includes(a.status)).length;
  const concluidos = agendamentos.filter((a) => a.status === "concluido").length;

  const STATUS_FILTROS = [
    { value: "all",         label: "Todos" },
    { value: "agendado",    label: "Agendados" },
    { value: "confirmado",  label: "Confirmados" },
    { value: "em_andamento",label: "Em andamento" },
    { value: "concluido",   label: "Concluídos" },
    { value: "cancelado",   label: "Cancelados" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-20">
        <Header />
        <main className="p-6 space-y-6">

          {/* Cabeçalho */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Agendamentos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Últimos 3 meses · {total} agendamento(s)
            </p>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total",      value: total,     color: "text-foreground" },
              { label: "Ativos",     value: ativos,    color: "text-primary" },
              { label: "Concluídos", value: concluidos, color: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Busca + filtros de status */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, motorista, zona ou nota fiscal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Pills de status */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTROS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                    filterStatus === f.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-dashed border-border"
                >
                  <X className="h-3 w-3" />Limpar
                </button>
              )}
            </div>
          </div>

          {/* Lista agrupada por mês */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Carregando agendamentos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20">
              <Calendar className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-foreground">Nenhum agendamento encontrado</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterStatus !== "all"
                  ? "Tente ajustar os filtros"
                  : "Você não possui agendamentos nos últimos 3 meses"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grupos).map(([mes, items]) => (
                <div key={mes} className="space-y-2">
                  {/* Header do mês */}
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold capitalize text-foreground">{mes}</p>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {items.map((a) => (
                      <AgendamentoCard
                        key={a.id}
                        agendamento={a}
                        onClick={() => handleOpenDetalhe(a)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <DetalheModal
        agendamento={detalhe}
        onClose={() => setDetalhe(null)}
      />
    </div>
  );
}
