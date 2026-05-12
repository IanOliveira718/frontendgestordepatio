import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Pencil, Trash2, MapPin, Layers,
  Package, MoreVertical, Building2, X,
} from "lucide-react";
import { Sidebar }  from "@/components/Sidebar";
import { Header }   from "@/components/Header";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Badge }    from "@/components/ui/badge";
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
import {
  PatioAPI, fetchPatios, createPatio, updatePatio, deletePatio,
} from "@/services/patioService";

interface FormData { nome: string; localizacao: string; }
const emptyForm = (): FormData => ({ nome: "", localizacao: "" });

export default function Patios() {
  const navigate = useNavigate();
  const [patios,        setPatios]        = useState<PatioAPI[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTarget,    setEditTarget]    = useState<PatioAPI | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<PatioAPI | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [formData,      setFormData]      = useState<FormData>(emptyForm());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPatios(await fetchPatios());
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os pátios.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = patios.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Criar / Editar ─────────────────────────────────────────────────────────
  const openCreate = () => { setEditTarget(null); setFormData(emptyForm()); setFormDialogOpen(true); };
  const openEdit   = (p: PatioAPI) => { setEditTarget(p); setFormData({ nome: p.nome, localizacao: p.localizacao }); setFormDialogOpen(true); };

  const handleSave = async () => {
    if (!formData.nome.trim() || !formData.localizacao.trim()) {
      toast({ title: "Preencha todos os campos.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updatePatio(editTarget.id, formData);
        setPatios((prev) => prev.map((p) => p.id === updated.id ? updated : p));
        toast({ title: "Pátio atualizado!" });
      } else {
        const created = await createPatio(formData);
        setPatios((prev) => [...prev, created]);
        toast({ title: "Pátio criado!" });
      }
      setFormDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Excluir ────────────────────────────────────────────────────────────────
  const openDelete  = (p: PatioAPI) => { setDeleteTarget(p); setDeleteDialogOpen(true); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePatio(deleteTarget.id);
      setPatios((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast({ title: "Pátio excluído." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-20">
        <Header />
        <main className="p-6 space-y-6">

          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pátios</h1>
              <p className="text-sm text-muted-foreground">Gerencie os pátios e navegue até suas zonas</p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />Novo Pátio
            </Button>
          </div>

          {/* Busca */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou localização..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>

          {/* Grid de cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Carregando pátios...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20">
              <Building2 className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-foreground">Nenhum pátio encontrado</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo Pátio" para começar</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((patio) => (
                <div key={patio.id}
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
                        <DropdownMenuItem onClick={() => openEdit(patio)}>
                          <Pencil className="mr-2 h-4 w-4" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/zones?patio=${patio.id}`)}>
                          <Layers className="mr-2 h-4 w-4" />Ver Zonas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDelete(patio)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Ícone + Nome */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground leading-tight">{patio.nome}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{patio.localizacao}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{patio.total_zonas}</p>
                      <p className="text-xs text-muted-foreground">Zonas</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{patio.capacidade_total}</p>
                      <p className="text-xs text-muted-foreground">Pallets totais</p>
                    </div>
                  </div>

                  {/* Botão ver zonas */}
                  <Button variant="outline" size="sm" className="mt-3 w-full gap-2"
                    onClick={() => navigate(`/zones?patio=${patio.id}`)}>
                    <Layers className="h-4 w-4" />Ver Zonas
                  </Button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Dialog Criar / Editar */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {editTarget ? "Editar Pátio" : "Novo Pátio"}
            </DialogTitle>
            <DialogDescription>
              {editTarget ? "Atualize as informações do pátio." : "Preencha os dados do novo pátio."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Pátio</Label>
              <Input id="nome" placeholder="Ex: Pátio Central"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localizacao" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />Localização
              </Label>
              <Input id="localizacao" placeholder="Ex: Rua das Indústrias, 100 — Galpão A"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editTarget ? "Salvar" : "Criar Pátio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pátio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pátio <strong>{deleteTarget?.nome}</strong>?
              Pátios com zonas não podem ser excluídos.
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
