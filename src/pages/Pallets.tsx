import { useState, useEffect, useCallback } from "react";
import {
  Search, X, Package, RefreshCw, Filter,
  Clock, CheckCircle2, Truck, AlertTriangle,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header }  from "@/components/Header";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Badge }   from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  PalletAPI, StatusPallet,
  STATUS_PALLET_LABELS, STATUS_PALLET_COLORS,
  fetchPallets, updatePalletStatus,
} from "@/services/palletService";
import { fetchZonas, ZonaAPI } from "@/services/patioService";

// Ícone por status
const STATUS_ICONS: Record<StatusPallet, React.ElementType> = {
  pendente:   Clock,
  armazenado: CheckCircle2,
  retirado:   Truck,
  avariado:   AlertTriangle,
};

export default function Pallets() {
  const [pallets,      setPallets]      = useState<PalletAPI[]>([]);
  const [zonas,        setZonas]        = useState<ZonaAPI[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterZona,   setFilterZona]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId,   setUpdatingId]   = useState<number | null>(null);

  // ── Carregar dados ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, z] = await Promise.all([fetchPallets(), fetchZonas()]);
      setPallets(p);
      setZonas(z);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os pallets.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtros client-side ───────────────────────────────────────────────────
  const filtered = pallets.filter((p) => {
    const matchSearch =
      p.agendamento_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.zona_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.numero_pallet).includes(searchTerm) ||
      String(p.numero_espaco).includes(searchTerm);
    const matchZona   = filterZona   === "all" || p.zona_nome === filterZona;
    const matchStatus = filterStatus === "all" || p.status    === filterStatus;
    return matchSearch && matchZona && matchStatus;
  });

  const hasFilters = searchTerm || filterZona !== "all" || filterStatus !== "all";

  // ── Atualizar status ───────────────────────────────────────────────────────
  const handleStatusChange = async (pallet: PalletAPI, novoStatus: StatusPallet) => {
    if (novoStatus === pallet.status) return;
    setUpdatingId(pallet.id);
    try {
      const updated = await updatePalletStatus(pallet.id, novoStatus);
      setPallets((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      toast({ title: "Status atualizado.", description: `Pallet ${pallet.numero_pallet} → ${STATUS_PALLET_LABELS[novoStatus]}` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Estatísticas rápidas ───────────────────────────────────────────────────
  const stats: Record<StatusPallet, number> = {
    pendente:   pallets.filter((p) => p.status === "pendente").length,
    armazenado: pallets.filter((p) => p.status === "armazenado").length,
    retirado:   pallets.filter((p) => p.status === "retirado").length,
    avariado:   pallets.filter((p) => p.status === "avariado").length,
  };

  const zonasUnicas = [...new Set(pallets.map((p) => p.zona_nome))].sort();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6 space-y-6">

          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Controle de Pallets</h1>
              <p className="text-sm text-muted-foreground">
                {pallets.length} pallet(s) registrado(s) · {filtered.length} exibido(s)
              </p>
            </div>
            <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["pendente", "armazenado", "retirado", "avariado"] as StatusPallet[]).map((s) => {
              const Icon = STATUS_ICONS[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                    filterStatus === s
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">{stats[s]}</span>
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", STATUS_PALLET_COLORS[s].split(" ")[0])}>
                      <Icon className={cn("h-4 w-4", STATUS_PALLET_COLORS[s].split(" ")[1])} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{STATUS_PALLET_LABELS[s]}</span>
                </button>
              );
            })}
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, zona, nº pallet ou espaço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterZona} onValueChange={setFilterZona}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Zona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as zonas</SelectItem>
                {zonasUnicas.map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {(["pendente", "armazenado", "retirado", "avariado"] as StatusPallet[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_PALLET_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm"
                onClick={() => { setSearchTerm(""); setFilterZona("all"); setFilterStatus("all"); }}
                className="gap-1.5">
                <X className="h-4 w-4" />Limpar
              </Button>
            )}
          </div>

          {/* Tabela */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-muted-foreground">Carregando pallets...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Package className="mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-lg font-medium text-foreground">Nenhum pallet encontrado</p>
                <p className="text-sm text-muted-foreground">Crie agendamentos para gerar pallets automaticamente</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[80px] text-center">Nº Pallet</TableHead>
                    <TableHead className="w-[80px] text-center">Espaço</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[160px]">Alterar Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((pallet) => {
                    const StatusIcon = STATUS_ICONS[pallet.status];
                    const isUpdating = updatingId === pallet.id;

                    return (
                      <TableRow key={pallet.id} className={cn(isUpdating && "opacity-60")}>
                        {/* Nº Pallet */}
                        <TableCell className="text-center">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mx-auto">
                            {pallet.numero_pallet}
                          </span>
                        </TableCell>

                        {/* Espaço */}
                        <TableCell className="text-center">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            #{pallet.numero_espaco}
                          </span>
                        </TableCell>

                        {/* Zona */}
                        <TableCell>
                          <span className="font-mono text-sm font-medium">{pallet.zona_nome}</span>
                        </TableCell>

                        {/* Veículo */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-mono text-sm font-semibold">{pallet.agendamento_plate}</span>
                          </div>
                        </TableCell>

                        {/* Horário */}
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium text-foreground">{pallet.agendamento_time}</p>
                            <p className="text-xs text-muted-foreground">
                              {pallet.agendamento_date
                                ? new Date(pallet.agendamento_date + "T00:00:00").toLocaleDateString("pt-BR")
                                : "—"}
                            </p>
                          </div>
                        </TableCell>

                        {/* Status badge */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("gap-1.5 text-xs", STATUS_PALLET_COLORS[pallet.status])}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {STATUS_PALLET_LABELS[pallet.status]}
                          </Badge>
                        </TableCell>

                        {/* Select de status */}
                        <TableCell>
                          <Select
                            value={pallet.status}
                            onValueChange={(v) => handleStatusChange(pallet, v as StatusPallet)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="h-7 text-xs w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(["pendente", "armazenado", "retirado", "avariado"] as StatusPallet[]).map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {STATUS_PALLET_LABELS[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {filtered.length > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Exibindo {filtered.length} de {pallets.length} pallets
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
