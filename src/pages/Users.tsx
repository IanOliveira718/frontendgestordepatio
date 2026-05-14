import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Pencil, Trash2, MoreVertical,
  ShieldCheck, ShieldOff, KeyRound, UserCog,
  Users as UsersIcon, Eye, EyeOff, Shield,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header }  from "@/components/Header";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { Badge }   from "@/components/ui/badge";
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
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  UsuarioAPI, TipoUsuario,
  TIPO_USUARIO_LABELS, TIPO_USUARIO_COLORS, HIERARQUIA,
  fetchUsuarios, createUsuario, updateUsuario,
  changePassword, toggleAcesso, deleteUsuario,
} from "@/services/userService";

// Tipos disponíveis para criação conforme hierarquia do admin logado
function tiposDisponiveis(adminTipo: TipoUsuario): TipoUsuario[] {
  const nivelAdmin = HIERARQUIA[adminTipo] ?? 0;
  return (Object.keys(HIERARQUIA) as TipoUsuario[]).filter(
    (t) => HIERARQUIA[t] < nivelAdmin
  );
}

// ── Avatar com inicial ────────────────────────────────────────────────────────
function UserAvatar({ usuario }: { usuario: UsuarioAPI }) {
  const inicial = (usuario.first_name?.[0] ?? usuario.username[0]).toUpperCase();
  return (
    <div className={cn(
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
      usuario.bloqueado
        ? "bg-muted text-muted-foreground"
        : "bg-primary/15 text-primary"
    )}>
      {inicial}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Users() {
  const { user: authUser } = useAuth();

  const [usuarios,     setUsuarios]     = useState<UsuarioAPI[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterTipo,   setFilterTipo]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialogs
  const [createDialogOpen,   setCreateDialogOpen]   = useState(false);
  const [editDialogOpen,     setEditDialogOpen]      = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen]  = useState(false);
  const [deleteDialogOpen,   setDeleteDialogOpen]    = useState(false);
  const [targetUser,         setTargetUser]          = useState<UsuarioAPI | null>(null);
  const [saving,             setSaving]              = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    username: "", email: "", first_name: "", last_name: "",
    password: "", password2: "", tipo: "" as TipoUsuario | "",
  });
  const [editForm, setEditForm] = useState({
    email: "", first_name: "", last_name: "", tipo: "" as TipoUsuario | "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPass,    setShowPass]    = useState(false);

  const adminTipo = (authUser as any)?.tipo as TipoUsuario ?? "administrador";
  const tipos     = tiposDisponiveis(adminTipo);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try { setUsuarios(await fetchUsuarios()); }
    catch { toast({ title: "Erro ao carregar usuários.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtro ────────────────────────────────────────────────────────────────
  const filtered = usuarios.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo   = filterTipo   === "all" || u.tipo     === filterTipo;
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "ativo"    && !u.bloqueado) ||
      (filterStatus === "bloqueado" && u.bloqueado);
    return matchSearch && matchTipo && matchStatus;
  });

  // ── Criar ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (createForm.password !== createForm.password2) {
      toast({ title: "As senhas não coincidem.", variant: "destructive" }); return;
    }
    if (!createForm.tipo) {
      toast({ title: "Selecione o tipo de usuário.", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const novo = await createUsuario({ ...createForm, tipo: createForm.tipo as TipoUsuario });
      setUsuarios((prev) => [...prev, novo]);
      toast({ title: "Usuário criado!", description: `${novo.first_name} (${TIPO_USUARIO_LABELS[novo.tipo]})` });
      setCreateDialogOpen(false);
      setCreateForm({ username: "", email: "", first_name: "", last_name: "", password: "", password2: "", tipo: "" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // ── Editar ────────────────────────────────────────────────────────────────
  const openEdit = (u: UsuarioAPI) => {
    setTargetUser(u);
    setEditForm({ email: u.email, first_name: u.first_name, last_name: u.last_name, tipo: u.tipo });
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!targetUser) return;
    setSaving(true);
    try {
      const updated = await updateUsuario(targetUser.id, {
        ...editForm,
        tipo: editForm.tipo as TipoUsuario,
      });
      setUsuarios((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      toast({ title: "Usuário atualizado!" });
      setEditDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // ── Senha ─────────────────────────────────────────────────────────────────
  const openPassword = (u: UsuarioAPI) => { setTargetUser(u); setNewPassword(""); setPasswordDialogOpen(true); };

  const handleChangePassword = async () => {
    if (!targetUser || !newPassword) return;
    setSaving(true);
    try {
      await changePassword(targetUser.id, newPassword);
      toast({ title: "Senha redefinida com sucesso!" });
      setPasswordDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // ── Bloquear / Desbloquear ────────────────────────────────────────────────
  const handleToggleAcesso = async (u: UsuarioAPI) => {
    try {
      const updated = await toggleAcesso(u.id, !u.bloqueado);
      setUsuarios((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      toast({ title: updated.bloqueado ? "Acesso bloqueado." : "Acesso desbloqueado." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  // ── Excluir ───────────────────────────────────────────────────────────────
  const openDelete  = (u: UsuarioAPI) => { setTargetUser(u); setDeleteDialogOpen(true); };
  const handleDelete = async () => {
    if (!targetUser) return;
    try {
      await deleteUsuario(targetUser.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== targetUser.id));
      toast({ title: "Usuário excluído." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally { setDeleteDialogOpen(false); setTargetUser(null); }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const ativos    = usuarios.filter((u) => !u.bloqueado).length;
  const bloqueados = usuarios.filter((u) => u.bloqueado).length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6 space-y-6">

          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
              <p className="text-sm text-muted-foreground">
                {usuarios.length} usuário(s) · {ativos} ativo(s) · {bloqueados} bloqueado(s)
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />Novo Usuário
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome, usuário ou e-mail..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {(Object.keys(TIPO_USUARIO_LABELS) as TipoUsuario[]).map((t) => (
                  <SelectItem key={t} value={t}>{TIPO_USUARIO_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="bloqueado">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20">
              <UsersIcon className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((usuario) => {
                const isSystemAdmin = usuario.is_system_admin;
                const isSelf        = authUser?.id === usuario.id;
                const nomeCompleto  = [usuario.first_name, usuario.last_name].filter(Boolean).join(" ") || usuario.username;

                return (
                  <div key={usuario.id}
                    className={cn(
                      "group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all",
                      usuario.bloqueado
                        ? "border-destructive/20 opacity-70"
                        : "border-border hover:border-primary/30 hover:shadow-sm"
                    )}>

                    <UserAvatar usuario={usuario} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{nomeCompleto}</p>
                        {isSystemAdmin && (
                          <Badge variant="outline" className="gap-1 text-xs bg-primary/5 text-primary border-primary/30">
                            <Shield className="h-3 w-3" />Admin Sistema
                          </Badge>
                        )}
                        {isSelf && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Você</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{usuario.username} · {usuario.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-xs hidden sm:flex", TIPO_USUARIO_COLORS[usuario.tipo])}>
                        {TIPO_USUARIO_LABELS[usuario.tipo]}
                      </Badge>

                      <Badge variant="outline" className={cn(
                        "text-xs",
                        usuario.bloqueado
                          ? "bg-destructive/10 text-destructive border-destructive/30"
                          : "bg-green-500/10 text-green-600 border-green-500/30"
                      )}>
                        {usuario.bloqueado ? "Bloqueado" : "Ativo"}
                      </Badge>

                      {/* Menu de ações — desabilitado para admin do sistema */}
                      {!isSystemAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(usuario)}>
                              <Pencil className="mr-2 h-4 w-4" />Editar informações
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPassword(usuario)}>
                              <KeyRound className="mr-2 h-4 w-4" />Redefinir senha
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleAcesso(usuario)}
                              disabled={isSelf}
                              className={usuario.bloqueado ? "text-green-600 focus:text-green-600" : "text-amber-600 focus:text-amber-600"}
                            >
                              {usuario.bloqueado
                                ? <><ShieldCheck className="mr-2 h-4 w-4" />Desbloquear acesso</>
                                : <><ShieldOff  className="mr-2 h-4 w-4" />Bloquear acesso</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDelete(usuario)}
                              disabled={isSelf}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />Excluir usuário
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Dialog: Criar ─────────────────────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />Novo Usuário
            </DialogTitle>
            <DialogDescription>Preencha os dados do novo usuário.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nome</Label>
                <Input id="first_name" placeholder="João"
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input id="last_name" placeholder="Silva"
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="joao@empresa.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input id="username" placeholder="joao.silva"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo <span className="text-destructive">*</span></Label>
                <Select value={createForm.tipo}
                  onValueChange={(v) => setCreateForm({ ...createForm, tipo: v as TipoUsuario })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t} value={t}>{TIPO_USUARIO_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={createForm.password} className="pr-10"
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password2">Confirmar senha</Label>
              <Input id="password2" type={showPass ? "text" : "password"} placeholder="••••••••"
                value={createForm.password2}
                onChange={(e) => setCreateForm({ ...createForm, password2: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Editar ────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />Editar Usuário
            </DialogTitle>
            <DialogDescription>
              Atualize as informações de <strong>{targetUser?.username}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Sobrenome</Label>
                <Input value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={editForm.tipo}
                onValueChange={(v) => setEditForm({ ...editForm, tipo: v as TipoUsuario })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t} value={t}>{TIPO_USUARIO_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Redefinir Senha ────────────────────────────────────────── */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />Redefinir Senha
            </DialogTitle>
            <DialogDescription>
              Defina uma nova senha para <strong>{targetUser?.username}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Nova senha</Label>
            <div className="relative">
              <Input type={showPass ? "text" : "password"} placeholder="••••••••"
                value={newPassword} className="pr-10"
                onChange={(e) => setNewPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleChangePassword} disabled={saving || !newPassword}>
              {saving ? "Salvando..." : "Redefinir Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Alert: Excluir ────────────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{targetUser?.username}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
