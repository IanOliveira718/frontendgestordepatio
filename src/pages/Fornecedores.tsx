import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Building2, MoreVertical,
  Pencil, Trash2, Eye, Power, PowerOff,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { Sidebar }   from "@/components/Sidebar";
import { Header }    from "@/components/Header";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Badge }     from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast }              from "@/hooks/use-toast";
import { cn }                 from "@/lib/utils";
import { FornecedorBadge }    from "@/components/FornecedorBadge";
import {
  FornecedorAPI, PaginatedFornecedores,
  fetchFornecedores, toggleFornecedorStatus, deleteFornecedor,
} from "@/services/FornecedorService";

export default function Fornecedores() {
  const navigate = useNavigate();

  const [data,         setData]         = useState<PaginatedFornecedores | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [filterAtivo,  setFilterAtivo]  = useState<string>("all");
  const [page,         setPage]         = useState(1);

  const [confirmTarget,  setConfirmTarget]  = useState<FornecedorAPI | null>(null);
  const [confirmAction,  setConfirmAction]  = useState<"delete" | "toggle" | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ativo = filterAtivo === "all" ? null : filterAtivo === "true";
      const res   = await fetchFornecedores({ q: search, page, per_page: 10, ativo });
      setData(res);
    } catch {
      toast({ title: "Erro ao carregar fornecedores.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, filterAtivo, page]);

  useEffect(() => { load(); }, [load]);

  // Busca com debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Confirmação de ação
  const openConfirm = (f: FornecedorAPI, action: "delete" | "toggle") => {
    setConfirmTarget(f);
    setConfirmAction(action);
  };

  const handleConfirm = async () => {
    if (!confirmTarget || !confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "delete") {
        await deleteFornecedor(confirmTarget.id);
        toast({ title: "Fornecedor excluído." });
      } else {
        const updated = await toggleFornecedorStatus(confirmTarget.id, !confirmTarget.ativo);
        toast({ title: updated.ativo ? "Fornecedor ativado." : "Fornecedor desativado." });
      }
      load();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setConfirmLoading(false);
      setConfirmTarget(null);
      setConfirmAction(null);
    }
  };

  const fornecedores = data?.results ?? [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-20">
        <Header />
        <main className="p-6 space-y-5">

          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
              <p className="text-sm text-muted-foreground">
                {data ? `${data.count} fornecedor(es) cadastrado(s)` : "Carregando..."}
              </p>
            </div>
            <Button onClick={() => navigate("/novo-fornecedor")} className="gap-2">
              <Plus className="h-4 w-4" />Novo Fornecedor
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome fantasia ou CNPJ..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterAtivo} onValueChange={(v) => { setFilterAtivo(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
            {(searchInput || filterAtivo !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchInput(""); setFilterAtivo("all"); setPage(1); }} className="gap-1.5">
                <X className="h-4 w-4" />Limpar
              </Button>
            )}
          </div>

          {/* Tabela */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : fornecedores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Building2 className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="font-medium text-foreground">Nenhum fornecedor encontrado</p>
                <p className="text-sm text-muted-foreground">Cadastre o primeiro fornecedor</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-muted-foreground text-xs font-medium">
                    <th className="px-4 py-3 text-left">Fornecedor</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">CNPJ</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Razão Social</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Cadastro</th>
                    <th className="px-4 py-3 w-[50px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fornecedores.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{f.nome_fantasia}</p>
                            <p className="text-xs text-muted-foreground font-mono md:hidden">{f.cnpj_formatado}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono hidden md:table-cell">{f.cnpj_formatado}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{f.razao_social}</td>
                      <td className="px-4 py-3"><FornecedorBadge ativo={f.ativo} /></td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {new Date(f.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/fornecedores/${f.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/fornecedores/${f.id}/editar`)}>
                              <Pencil className="mr-2 h-4 w-4" />Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openConfirm(f, "toggle")}
                              className={f.ativo ? "text-amber-600 focus:text-amber-600" : "text-green-600 focus:text-green-600"}>
                              {f.ativo
                                ? <><PowerOff className="mr-2 h-4 w-4" />Desativar</>
                                : <><Power    className="mr-2 h-4 w-4" />Ativar</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openConfirm(f, "delete")}
                              className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginação */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {data.page} de {data.pages} · {data.count} registros
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: data.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === data.pages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">…</span>
                    ) : (
                      <Button key={p} variant={page === p ? "default" : "outline"} size="icon"
                        onClick={() => setPage(p as number)}>
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(p + 1, data.pages))} disabled={page === data.pages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmTarget} onOpenChange={(v) => { if (!v) { setConfirmTarget(null); setConfirmAction(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "delete" ? "Excluir Fornecedor" : confirmTarget?.ativo ? "Desativar Fornecedor" : "Ativar Fornecedor"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "delete"
                ? `Tem certeza que deseja excluir "${confirmTarget?.nome_fantasia}"? Fornecedores com usuários vinculados não podem ser excluídos.`
                : confirmTarget?.ativo
                  ? `Desativar "${confirmTarget?.nome_fantasia}"? Usuários desta empresa não conseguirão acessar o sistema.`
                  : `Ativar "${confirmTarget?.nome_fantasia}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={confirmLoading}
              className={confirmAction === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
              {confirmLoading ? "Aguarde..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}