import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus, Search, Pencil, Trash2, MapPin, Package,
  MoreVertical, Layers, ChevronLeft, X,
} from "lucide-react";
import { Sidebar }  from "@/components/Sidebar";
import { Header }   from "@/components/Header";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Badge }    from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ZonaAPI, PatioAPI, TipoZona,
  TIPO_ZONA_LABELS, TIPO_ZONA_COLORS,
  fetchZonas, fetchPatios, fetchPatio,
  createZona, updateZona, deleteZona,
} from "@/services/patioService";

interface FormData {
  patio:       string;
  nome:        string;
  tipo:        TipoZona | "";
  capacidade:  string;
  localizacao: string;
}

const emptyForm = (patioId?: string): FormData => ({
  patio: patioId ?? "", nome: "", tipo: "", capacidade: "", localizacao: "",
});

const TIPOS: TipoZona[] = ["principal", "refrigerada", "expedicao", "recebimento", "reserva", "avariado"];

// Ícones por tipo
const TIPO_ICONS: Record<TipoZona, string> = {
  principal:   "🏭",
  refrigerada: "❄️",
  expedicao:   "🚚",
  recebimento: "📥",
  reserva:     "📦",
  avariado:    "⚠️",
};

export default function Zones() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patioIdParam = searchParams.get("patio");

  const [zonas,        setZonas]        = useState<ZonaAPI[]>([]);
  const [patios,       setPatios]       = useState<PatioAPI[]>([]);
  const [patioAtual,   setPatioAtual]   = useState<PatioAPI | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterTipo,   setFilterTipo]   = useState<string>("all");
  const [formDialogOpen,   setFormDialogOpen]   = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTarget,   setEditTarget]   = useState<ZonaAPI | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ZonaAPI | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [formData,     setFormData]     = useState<FormData>(emptyForm(patioIdParam ?? undefined));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [z, p] = await Promise.all([
        fetchZonas(patioIdParam ? parseInt(patioIdParam) : undefined),
        fetchPatios(),
      ]);
      setZonas(z);
      setPatios(p);
      if (patioIdParam) {
        setPatioAtual(p.find((x) => x.id === parseInt(patioIdParam)) ?? null);
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar as zonas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [patioIdParam]);

  useEffect(() => { load(); }, [load]);

  const filtered = zonas.filter((z) => {
    const matchSearch = z.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        z.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo   = filterTipo === "all" || z.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const hasFilters = searchTerm || filterTipo !== "all";

  // ── Criar / Editar ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setFormData(emptyForm(patioIdParam ?? undefined));
    setFormDialogOpen(true);
  };

  const openEdit = (z: ZonaAPI) => {
    setEditTarget(z);
    setFormData({
      patio:      z.patio.toString(),
      nome:       z.nome,
      tipo:       z.tipo,
      capacidade: z.capacidade.toString(),
      localizacao: z.localizacao,
    });
    setFormDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.patio || !formData.nome.trim() || !formData.tipo || !formData.capacidade) {
      toast({ title: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        patio:      parseInt(formData.patio),
        nome:       formData.nome.trim(),
        tipo:       formData.tipo as TipoZona,
        capacidade: parseInt(formData.capacidade),
        localizacao: formData.localizacao.trim(),
      };

      if (editTarget) {
        const updated = await updateZona(editTarget.id, payload);
        setZonas((prev) => prev.map((z) => z.id === updated.id ? updated : z));
        toast({ title: "Zona atualizada!" });
      } else {
        const created = await createZona(payload);
        setZonas((prev) => [...prev, created]);
        toast({ title: "Zona criada!" });
      }
      setFormDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Excluir ────────────────────────────────────────────────────────────────
  const openDelete    = (z: ZonaAPI) => { setDeleteTarget(z); setDeleteDialogOpen(true); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteZona(deleteTarget.id);
      setZonas((prev) => prev.filter((z) => z.id !== deleteTarget.id));
      toast({ title: "Zona excluída." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // Capacidade ocupada (placeholder visual — sem dado real de ocupação aqui)
  const getPatioNome = (id: number) => patios.find((p) => p.id === id)?.nome ?? `Pátio ${id}`;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6 space-y-6">

          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {patioAtual && (
                <Button variant="ghost" size="icon" onClick={() => navigate("/patios")}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {patioAtual ? `Zonas — ${patioAtual.nome}` : "Zonas"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {patioAtual
                    ? `${patioAtual.localizacao} · ${patioAtual.total_zonas} zona(s) · ${patioAtual.capacidade_total} pallets`
                    : "Gerencie todas as zonas dos pátios"}
                </p>
              </div>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />Nova Zona
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou localização..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIPO_ICONS[t]} {TIPO_ZONA_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setFilterTipo("all"); }} className="gap-1.5">
                <X className="h-4 w-4" />Limpar
              </Button>
            )}
          </div>

          {/* Cards de zonas */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Carregando zonas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20">
              <Layers className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-foreground">Nenhuma zona encontrada</p>
              <p className="text-sm text-muted-foreground">Clique em "Nova Zona" para começar</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((zona) => (
                <div key={zona.id}
                  className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30 hover:shadow-md">

                  {/* Menu */}
                  <div className="absolute right-3 top-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(zona)}>
                          <Pencil className="mr-2 h-4 w-4" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDelete(zona)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Ícone + Nome + Tipo */}
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
                      {TIPO_ICONS[zona.tipo]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{zona.nome}</h3>
                        <Badge variant="outline" className={cn("text-xs", TIPO_ZONA_COLORS[zona.tipo])}>
                          {TIPO_ZONA_LABELS[zona.tipo]}
                        </Badge>
                      </div>
                      {!patioAtual && (
                        <p className="text-xs text-muted-foreground mt-0.5">{getPatioNome(zona.patio)}</p>
                      )}
                      {zona.localizacao && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />{zona.localizacao}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Capacidade */}
                  <div className="mt-auto rounded-lg bg-muted/50 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      Capacidade
                    </div>
                    <span className="text-lg font-bold text-foreground">{zona.capacidade} pallets</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Dialog Criar / Editar */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {editTarget ? "Editar Zona" : "Nova Zona"}
            </DialogTitle>
            <DialogDescription>
              {editTarget ? "Atualize as informações da zona." : "Preencha os dados da nova zona."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Pátio */}
            <div className="space-y-2">
              <Label>Pátio <span className="text-destructive">*</span></Label>
              <Select value={formData.patio} onValueChange={(v) => setFormData({ ...formData, patio: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o pátio" /></SelectTrigger>
                <SelectContent>
                  {patios.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nome + Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Zona <span className="text-destructive">*</span></Label>
                <Input id="nome" placeholder="Ex: A1, B2..."
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo <span className="text-destructive">*</span></Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v as TipoZona })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TIPO_ICONS[t]} {TIPO_ZONA_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Capacidade */}
            <div className="space-y-2">
              <Label htmlFor="capacidade" className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Capacidade (pallets) <span className="text-destructive">*</span>
              </Label>
              <Input id="capacidade" type="number" min="1" placeholder="Ex: 50"
                value={formData.capacidade}
                onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })} />
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="localizacao" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Localização <span className="text-xs text-muted-foreground">(opcional)</span>
              </Label>
              <Input id="localizacao" placeholder="Ex: Corredor 3, Bloco B"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })} />
            </div>

            {/* Preview do badge */}
            {formData.tipo && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                <span className="text-lg">{TIPO_ICONS[formData.tipo as TipoZona]}</span>
                <div>
                  <p className="text-sm font-medium">{formData.nome || "Nome da zona"}</p>
                  <Badge variant="outline" className={cn("text-xs mt-1", TIPO_ZONA_COLORS[formData.tipo as TipoZona])}>
                    {TIPO_ZONA_LABELS[formData.tipo as TipoZona]}
                  </Badge>
                </div>
                {formData.capacidade && (
                  <div className="ml-auto text-right">
                    <p className="text-lg font-bold text-foreground">{formData.capacidade}</p>
                    <p className="text-xs text-muted-foreground">pallets</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editTarget ? "Salvar" : "Criar Zona"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Zona</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a zona <strong>{deleteTarget?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
