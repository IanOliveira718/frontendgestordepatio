import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Truck, Clock, Package, MapPin, FileText, Box,
  CheckCircle2, AlertCircle, Timer, Plus,
  ChevronRight, Calendar, AlertTriangle, Layers,
} from "lucide-react";
import { Sidebar }  from "@/components/Sidebar";
import { Header }   from "@/components/Header";
import { Button }   from "@/components/ui/button";
import { Badge }    from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label }  from "@/components/ui/label";
import { toast }  from "@/hooks/use-toast";
import { cn }     from "@/lib/utils";
import { useAuth }         from "@/context/AuthContext";
import { usePermissions }  from "@/context/usePermissions";
import { NewScheduleDialog } from "@/components/NewScheduleDialog";

import {
  AgendamentoAPI,
  fetchAgendamentosByDate,
  fetchMeusAgendamentos,
  updateAgendamentoStatus,
  fetchAgendamentoById,
} from "@/services/agendamentosService";

import {
  PalletAPI, StatusPallet,
  STATUS_PALLET_LABELS, STATUS_PALLET_COLORS,
  fetchPallets, updatePalletStatus,
} from "@/services/palletService";

// ── Config visual ─────────────────────────────────────────────────────────────

type StatusAgendamento = AgendamentoAPI["status"];

const STATUS_AG: Record<StatusAgendamento, { label: string; icon: React.ElementType; color: string }> = {
  agendado:     { label: "Agendado",     icon: Clock,        color: "bg-muted text-muted-foreground border-border" },
  confirmado:   { label: "Confirmado",   icon: CheckCircle2, color: "bg-primary/15 text-primary border-primary/30" },
  em_andamento: { label: "Em andamento", icon: Timer,        color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  concluido:    { label: "Concluído",    icon: CheckCircle2, color: "bg-green-500/15 text-green-600 border-green-500/30" },
  cancelado:    { label: "Cancelado",    icon: AlertCircle,  color: "bg-destructive/15 text-destructive border-destructive/30" },
};

const STATUS_PALLET_ICONS: Record<StatusPallet, React.ElementType> = {
  pendente:   Clock,
  armazenado: CheckCircle2,
  retirado:   Truck,
  avariado:   AlertTriangle,
};

const TYPE_CONFIG = {
  entrada: { label: "Entrada", color: "bg-green-500/15 text-green-600 border-green-500/30", icon: "↓" },
  saida:   { label: "Saída",   color: "bg-blue-500/15 text-blue-600 border-blue-500/30",   icon: "↑" },
};

function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ── Modal de detalhe de agendamento ──────────────────────────────────────────

interface AgendamentoModalProps {
  agendamento:        AgendamentoAPI | null;
  onClose:            () => void;
  podeAlterarStatus:  boolean;
  onStatusChanged:    (updated: AgendamentoAPI) => void;
}

function AgendamentoModal({ agendamento, onClose, podeAlterarStatus, onStatusChanged }: AgendamentoModalProps) {
  const [completo, setCompleto] = useState<AgendamentoAPI | null>(null);
  const [novoStatus, setNovoStatus] = useState<StatusAgendamento | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!agendamento) { setCompleto(null); return; }
    setNovoStatus("");
    fetchAgendamentoById(agendamento.id)
      .then(setCompleto)
      .catch(() => setCompleto(agendamento));
  }, [agendamento?.id]);

  if (!agendamento) return null;

  const data = completo ?? agendamento;
  const statusCfg  = STATUS_AG[data.status];
  const StatusIcon = statusCfg.icon;
  const typeCfg    = TYPE_CONFIG[data.type];
  const isPallet   = data.tipo_unidade !== "volume";

  const handleSalvarStatus = async () => {
    if (!novoStatus || novoStatus === data.status) return;
    setSaving(true);
    try {
      const updated = await updateAgendamentoStatus(data.id, novoStatus as StatusAgendamento);
      onStatusChanged(updated);
      toast({ title: "Status atualizado!", description: `${STATUS_AG[novoStatus as StatusAgendamento].label}` });
      onClose();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!agendamento} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Truck className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-mono font-bold">{data.plate}</p>
              <p className="text-sm font-normal text-muted-foreground">{data.driver}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={cn("gap-1", typeCfg.color)}>
              {typeCfg.icon} {typeCfg.label}
            </Badge>
            <Badge variant="outline" className={cn("gap-1.5", statusCfg.color)}>
              <StatusIcon className="h-3 w-3" />{statusCfg.label}
            </Badge>
          </div>

          {/* Dados principais */}
          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-3.5 w-3.5" />Horário</span>
              <span className="font-medium">{format(parseDate(data.date), "dd/MM/yyyy")} às {data.time}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Zona</span>
              <span className="font-mono font-semibold">{data.zone}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2"><FileText className="h-3.5 w-3.5" />Nota Fiscal</span>
              <span className="font-medium">{data.nota_fiscal || "—"}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                {isPallet ? <Package className="h-3.5 w-3.5" /> : <Box className="h-3.5 w-3.5" />}
                {isPallet ? "Pallets" : "Volumes"}
              </span>
              <span className="font-semibold">{data.pallets}</span>
            </div>
          </div>

          {/* Descrições */}
          {isPallet && (data.descricoes_pallets ?? []).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição dos Pallets</p>
              <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3">
                {data.descricoes_pallets!.map((d) => (
                  <div key={d.ordem} className="flex items-start gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{d.ordem}</span>
                    <span className="text-foreground">{d.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isPallet && (data.descricoes_volumes ?? []).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição dos Volumes</p>
              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                {data.descricoes_volumes!.map((v) => (
                  <div key={v.ordem} className="space-y-1">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{v.ordem}</span>
                      <span className="font-medium">{v.descricao}</span>
                    </div>
                    <div className="ml-7 flex gap-3 text-xs text-muted-foreground">
                      <span>A: {v.altura}cm</span>
                      <span>L: {v.largura}cm</span>
                      <span>C: {v.comprimento}cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alterar status — só para quem pode */}
          {podeAlterarStatus && data.status !== "cancelado" && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Alterar Status
              </Label>
              <div className="flex gap-2">
                <Select value={novoStatus} onValueChange={(v) => setNovoStatus(v as StatusAgendamento)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione o novo status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_AG) as StatusAgendamento[])
                      .filter((s) => s !== data.status)
                      .map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_AG[s].label}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSalvarStatus} disabled={!novoStatus || saving} className="shrink-0">
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Modal de detalhe de pallet ────────────────────────────────────────────────

interface PalletModalProps {
  pallet:            PalletAPI | null;
  onClose:           () => void;
  podeAlterarStatus: boolean;
  onUpdated:         (updated: PalletAPI) => void;
}

function PalletModal({ pallet, onClose, podeAlterarStatus, onUpdated }: PalletModalProps) {
  const [saving, setSaving] = useState(false);

  if (!pallet) return null;

  const StatusIcon = STATUS_PALLET_ICONS[pallet.status];

  const ACOES: { status: StatusPallet; label: string; icon: React.ElementType; color: string }[] = [
    { status: "armazenado", label: "Marcar Armazenado", icon: CheckCircle2,  color: "border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20" },
    { status: "retirado",   label: "Marcar Retirado",   icon: Truck,         color: "border-border bg-muted/30 text-foreground hover:bg-muted" },
    { status: "pendente",   label: "Voltar Pendente",   icon: Clock,         color: "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" },
    { status: "avariado",   label: "Registrar Avaria",  icon: AlertTriangle, color: "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20" },
  ];

  const handleAcao = async (novoStatus: StatusPallet) => {
    setSaving(true);
    try {
      const updated = await updatePalletStatus(pallet.id, novoStatus);
      onUpdated(updated);
      toast({ title: "Status atualizado!", description: `Pallet ${pallet.numero_pallet} → ${STATUS_PALLET_LABELS[novoStatus]}` });
      onClose();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!pallet} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
              {pallet.numero_pallet}
            </span>
            <div>
              <p className="font-semibold">Pallet {pallet.numero_pallet}</p>
              <p className="text-sm font-normal text-muted-foreground">Zona {pallet.zona_nome} · Espaço #{pallet.numero_espaco}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Veículo</span>
              <span className="font-mono font-semibold">{pallet.agendamento_plate}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Horário</span>
              <span className="font-medium">{pallet.agendamento_time} · {pallet.agendamento_date ? new Date(pallet.agendamento_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Espaço</span>
              <span className="font-mono font-semibold">#{pallet.numero_espaco}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-muted-foreground">Status atual</span>
              <Badge variant="outline" className={cn("gap-1.5 text-xs", STATUS_PALLET_COLORS[pallet.status])}>
                <StatusIcon className="h-3 w-3" />{STATUS_PALLET_LABELS[pallet.status]}
              </Badge>
            </div>
          </div>

          {podeAlterarStatus ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ações</p>
              <div className="grid grid-cols-2 gap-2">
                {ACOES.map((acao) => {
                  const AcaoIcon = acao.icon;
                  return (
                    <button key={acao.status} disabled={pallet.status === acao.status || saving}
                      onClick={() => handleAcao(acao.status)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all text-left",
                        acao.color,
                        (pallet.status === acao.status || saving) && "cursor-not-allowed opacity-40"
                      )}>
                      <AcaoIcon className="h-4 w-4 shrink-0" />
                      <span className="leading-tight">{acao.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground py-2">Visualização apenas</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Card de agendamento ───────────────────────────────────────────────────────

function AgendamentoCard({ ag, onClick }: { ag: AgendamentoAPI; onClick: () => void }) {
  const statusCfg  = STATUS_AG[ag.status];
  const StatusIcon = statusCfg.icon;
  const typeCfg    = TYPE_CONFIG[ag.type];

  return (
    <button onClick={onClick}
      className="group w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
          <span className="text-sm font-bold text-foreground leading-none">{ag.time.split(":")[0]}</span>
          <span className="text-xs text-muted-foreground">:{ag.time.split(":")[1]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-semibold text-foreground">{ag.plate}</span>
            <Badge variant="outline" className={cn("text-xs gap-1", typeCfg.color)}>{typeCfg.icon} {typeCfg.label}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ag.zone}</span>
            <span className="flex items-center gap-1"><Package className="h-3 w-3" />{ag.pallets} {ag.tipo_unidade === "volume" ? "vol." : "pal."}</span>
            {ag.nota_fiscal && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{ag.nota_fiscal}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant="outline" className={cn("text-xs gap-1", statusCfg.color)}>
            <StatusIcon className="h-3 w-3" />{statusCfg.label}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}

// ── Card de pallet ────────────────────────────────────────────────────────────

function PalletCard({ pallet, onClick }: { pallet: PalletAPI; onClick: () => void }) {
  const StatusIcon = STATUS_PALLET_ICONS[pallet.status];
  return (
    <button onClick={onClick}
      className="group w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
          {pallet.numero_pallet}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-foreground">{pallet.agendamento_plate}</span>
            <span className="text-xs text-muted-foreground">· Espaço #{pallet.numero_espaco}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{pallet.zona_nome}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{pallet.agendamento_time}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant="outline" className={cn("text-xs gap-1.5", STATUS_PALLET_COLORS[pallet.status])}>
            <StatusIcon className="h-3 w-3" />{STATUS_PALLET_LABELS[pallet.status]}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}

// ── Seção com título e lista ──────────────────────────────────────────────────

function Secao({ titulo, icone: Icon, count, children, empty }: {
  titulo: string; icone: React.ElementType;
  count: number; children: React.ReactNode; empty: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-semibold text-foreground">{titulo}</h2>
        <span className="ml-auto text-xs text-muted-foreground">{count} registro(s)</span>
      </div>
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-10">
          <Icon className="mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { user }    = useAuth();
  const permissions = usePermissions();
  const tipo        = permissions.tipo;

  const hoje    = format(new Date(), "yyyy-MM-dd");
  const hojeStr = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const nome    = (user as any)?.first_name || (user as any)?.username || "Usuário";

  const [agendamentos,    setAgendamentos]    = useState<AgendamentoAPI[]>([]);
  const [pallets,         setPallets]         = useState<PalletAPI[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [agModal,         setAgModal]         = useState<AgendamentoAPI | null>(null);
  const [palletModal,     setPalletModal]     = useState<PalletAPI | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];

      // Agendamentos — quem precisa ver
      if (tipo === "fornecedor") {
        promises.push(
          fetchMeusAgendamentos(hoje, hoje).then(setAgendamentos)
        );
      } else if (tipo === "administrador") {
        promises.push(
          fetchAgendamentosByDate(hoje).then(setAgendamentos)
        );
      } else if (tipo === "portaria") {
        promises.push(
          fetchAgendamentosByDate(hoje).then(setAgendamentos)
        );
      }

      // Pallets — recebimento e admin
      if (tipo === "recebimento" || tipo === "administrador") {
        promises.push(
          fetchPallets().then((p) => {
            // Filtra apenas pallets de agendamentos de hoje
            const hoje_date = format(new Date(), "yyyy-MM-dd");
            setPallets(p.filter((pl) => pl.agendamento_date === hoje_date));
          })
        );
      }

      await Promise.all(promises);
    } catch {
      toast({ title: "Erro ao carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [tipo, hoje]);

  useEffect(() => { load(); }, [load]);

  const handleAgStatusChanged = (updated: AgendamentoAPI) => {
    setAgendamentos((prev) => prev.map((a) => a.id === updated.id ? updated : a));
  };

  const handlePalletUpdated = (updated: PalletAPI) => {
    setPallets((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  };

  const handleNovoAgendamentoCriado = () => { load(); };

  // Saudação baseada na hora
  const hora  = new Date().getHours();
  const saud  = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-20">
        <Header />
        <main className="p-6 space-y-6">

          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{saud}, {nome}!</h1>
              <p className="text-sm text-muted-foreground capitalize mt-0.5">{hojeStr}</p>
            </div>

            {/* Botão novo agendamento — admin e fornecedor */}
            {permissions.podeCriarAgendamento && (
              <NewScheduleDialog onCreated={handleNovoAgendamentoCriado}>
                <Button className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Button>
              </NewScheduleDialog>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* ── FORNECEDOR: só seus agendamentos de hoje ────────────────── */}
              {tipo === "fornecedor" && (
                <Secao titulo="Meus Agendamentos Hoje" icone={Calendar} count={agendamentos.length}
                  empty="Nenhum agendamento seu para hoje">
                  {agendamentos.map((ag) => (
                    <AgendamentoCard key={ag.id} ag={ag} onClick={() => setAgModal(ag)} />
                  ))}
                </Secao>
              )}

              {/* ── PORTARIA: todos agendamentos de hoje ────────────────────── */}
              {tipo === "portaria" && (
                <Secao titulo="Agendamentos de Hoje" icone={Calendar} count={agendamentos.length}
                  empty="Nenhum agendamento para hoje">
                  {agendamentos.map((ag) => (
                    <AgendamentoCard key={ag.id} ag={ag} onClick={() => setAgModal(ag)} />
                  ))}
                </Secao>
              )}

              {/* ── RECEBIMENTO: pallets de hoje ────────────────────────────── */}
              {tipo === "recebimento" && (
                <Secao titulo="Pallets Agendados para Hoje" icone={Package} count={pallets.length}
                  empty="Nenhum pallet agendado para hoje">
                  {pallets.map((p) => (
                    <PalletCard key={p.id} pallet={p} onClick={() => setPalletModal(p)} />
                  ))}
                </Secao>
              )}

              {/* ── ADMIN: agendamentos + pallets ───────────────────────────── */}
              {tipo === "administrador" && (
                <>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Secao titulo="Agendamentos Hoje" icone={Calendar} count={agendamentos.length}
                      empty="Nenhum agendamento para hoje">
                      {agendamentos.map((ag) => (
                        <AgendamentoCard key={ag.id} ag={ag} onClick={() => setAgModal(ag)} />
                      ))}
                    </Secao>

                    <Secao titulo="Pallets Hoje" icone={Package} count={pallets.length}
                      empty="Nenhum pallet para hoje">
                      {pallets.map((p) => (
                        <PalletCard key={p.id} pallet={p} onClick={() => setPalletModal(p)} />
                      ))}
                    </Secao>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal de agendamento */}
      <AgendamentoModal
        agendamento={agModal}
        onClose={() => setAgModal(null)}
        // Portaria e admin podem alterar status de agendamento; fornecedor só vê
        podeAlterarStatus={permissions.podeAlterarStatusAgendamento}
        onStatusChanged={handleAgStatusChanged}
      />

      {/* Modal de pallet — admin e recebimento */}
      <PalletModal
        pallet={palletModal}
        onClose={() => setPalletModal(null)}
        podeAlterarStatus={permissions.podeAlterarStatusPallet}
        onUpdated={handlePalletUpdated}
      />
    </div>
  );
}
