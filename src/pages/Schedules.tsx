import { useState, useEffect, useCallback } from "react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Truck,
  Clock,
  Package,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Timer,
  FileText,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AgendamentoAPI,
  fetchAgendamentosByPeriod,
  createAgendamento,
  updateAgendamentoStatus,
  cancelAgendamento,
} from "@/services/agendamentosService";

interface Schedule {
  id: string;
  date: Date;
  time: string;
  plate: string;
  driver: string;
  type: "entrada" | "saida";
  zone: string;
  pallets: number;
  nota_fiscal: string;
  status: AgendamentoAPI["status"];
}

function apiToSchedule(a: AgendamentoAPI): Schedule {
  const [year, month, day] = a.date.split("-").map(Number);
  return { ...a, date: new Date(year, month - 1, day) };
}

const statusConfig: Record<
  Schedule["status"],
  { label: string; icon: React.ElementType; color: string }
> = {
  agendado:     { label: "Agendado",     icon: Clock,        color: "bg-muted text-muted-foreground" },
  confirmado:   { label: "Confirmado",   icon: CheckCircle2, color: "bg-primary/15 text-primary" },
  em_andamento: { label: "Em andamento", icon: Timer,        color: "bg-primary/15 text-primary" },
  concluido:    { label: "Concluído",    icon: CheckCircle2, color: "bg-success/15 text-success" },
  cancelado:    { label: "Cancelado",    icon: AlertCircle,  color: "bg-destructive/15 text-destructive" },
};

const typeConfig = {
  entrada: { label: "Entrada", color: "bg-success/15 text-success border-success/30",  icon: "↓" },
  saida:   { label: "Saída",   color: "bg-primary/15 text-primary border-primary/30", icon: "↑" },
};

// Tipo do formData compartilhado entre criação e edição
interface FormData {
  plate:       string;
  driver:      string;
  type:        string;
  zone:        string;
  date:        string;
  time:        string;
  pallets:     string;
  nota_fiscal: string;
  status:      Schedule["status"];
}

const emptyForm = (): FormData => ({
  plate: "", driver: "", type: "entrada", zone: "A1",
  date: "", time: "", pallets: "", nota_fiscal: "", status: "agendado",
});

export default function Schedules() {
  const [schedules, setSchedules]         = useState<Schedule[]>([]);
  const [loading, setLoading]             = useState(false);
  const [currentMonth, setCurrentMonth]   = useState(new Date());
  const [selectedDate, setSelectedDate]   = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterType, setFilterType]       = useState<string>("all");
  const [filterStatus, setFilterStatus]   = useState<string>("all");
  const [filterZone, setFilterZone]       = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen]   = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newDialogOpen, setNewDialogOpen]     = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData]           = useState<FormData>(emptyForm());

  // Descrições de pallets — usadas apenas no formulário de CRIAÇÃO
  const [descricoes, setDescricoes] = useState<string[]>([]);

  // Sincroniza o array de descrições com a quantidade de pallets
  useEffect(() => {
    const qtd = parseInt(formData.pallets) || 0;
    setDescricoes((prev) => {
      if (qtd > prev.length) return [...prev, ...Array(qtd - prev.length).fill("")];
      return prev.slice(0, qtd);
    });
  }, [formData.pallets]);

  const setDescricao = (index: number, value: string) =>
    setDescricoes((prev) => prev.map((d, i) => (i === index ? value : d)));

  // ── Carregar agendamentos do mês ───────────────────────────────────────────
  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end   = format(endOfMonth(currentMonth),   "yyyy-MM-dd");
      const data  = await fetchAgendamentosByPeriod(start, end);
      setSchedules(data.map(apiToSchedule));
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os agendamentos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  const monthStart    = startOfMonth(currentMonth);
  const monthEnd      = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd   = endOfWeek(monthEnd,     { weekStartsOn: 0 });
  const calendarDays  = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSchedulesForDate = (date: Date) =>
    schedules.filter((s) => isSameDay(s.date, date));

  const filteredSchedules = schedules.filter((s) => {
    const matchesDate   = selectedDate ? isSameDay(s.date, selectedDate) : true;
    const matchesSearch = s.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType   = filterType   === "all" || s.type   === filterType;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    const matchesZone   = filterZone   === "all" || s.zone   === filterZone;
    return matchesDate && matchesSearch && matchesType && matchesStatus && matchesZone;
  });

  // ── Criar ──────────────────────────────────────────────────────────────────
  const handleNewSchedule = () => {
    setFormData({
      ...emptyForm(),
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    });
    setDescricoes([]);
    setNewDialogOpen(true);
  };

  const validateCreate = (): string | null => {
    const qtd = parseInt(formData.pallets) || 0;
    if (!formData.nota_fiscal.trim()) return "Nota fiscal é obrigatória.";
    if (qtd === 0)                    return "Informe a quantidade de pallets.";
    if (descricoes.length !== qtd)    return `Informe exatamente ${qtd} descrição(ões) de pallets.`;
    if (descricoes.some((d) => !d.trim())) return "Todas as descrições de pallets devem ser preenchidas.";
    return null;
  };

  const handleCreateSchedule = async () => {
    const erro = validateCreate();
    if (erro) {
      toast({ title: "Dados inválidos", description: erro, variant: "destructive" });
      return;
    }
    try {
      const created = await createAgendamento({
        plate:       formData.plate,
        driver:      formData.driver,
        type:        formData.type,
        zone:        formData.zone,
        date:        formData.date,
        time:        formData.time,
        pallets:     parseInt(formData.pallets),
        nota_fiscal: formData.nota_fiscal.trim(),
        descricoes_pallets: descricoes.map((descricao, i) => ({
          ordem: i + 1,
          descricao: descricao.trim(),
        })),
      });
      setSchedules((prev) => [...prev, apiToSchedule(created)]);
      toast({
        title: "Agendamento criado",
        description: `Veículo ${created.plate} agendado para ${format(new Date(formData.date), "dd/MM/yyyy")} às ${created.time}`,
      });
      setNewDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message ?? "Não foi possível criar o agendamento.", variant: "destructive" });
    }
  };

  // ── Editar — atualiza apenas o status via PATCH ────────────────────────────
  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      plate:       schedule.plate,
      driver:      schedule.driver,
      type:        schedule.type,
      zone:        schedule.zone,
      date:        format(schedule.date, "yyyy-MM-dd"),
      time:        schedule.time,
      pallets:     schedule.pallets.toString(),
      nota_fiscal: schedule.nota_fiscal,
      status:      schedule.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedSchedule) return;
    try {
      if (formData.status !== selectedSchedule.status) {
        const updated = await updateAgendamentoStatus(selectedSchedule.id, formData.status);
        setSchedules((prev) =>
          prev.map((s) => (s.id === selectedSchedule.id ? apiToSchedule(updated) : s))
        );
      }
      toast({ title: "Agendamento atualizado", description: `Status do veículo ${formData.plate} atualizado.` });
      setEditDialogOpen(false);
      setSelectedSchedule(null);
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar o agendamento.", variant: "destructive" });
    }
  };

  // ── Cancelar ───────────────────────────────────────────────────────────────
  const handleDelete = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSchedule) return;
    try {
      await cancelAgendamento(selectedSchedule.id);
      setSchedules((prev) =>
        prev.map((s) => s.id === selectedSchedule.id ? { ...s, status: "cancelado" } : s)
      );
      toast({ title: "Agendamento cancelado", description: `Agendamento do veículo ${selectedSchedule.plate} foi cancelado.` });
      setDeleteDialogOpen(false);
      setSelectedSchedule(null);
    } catch {
      toast({ title: "Erro", description: "Não foi possível cancelar o agendamento.", variant: "destructive" });
    }
  };

  const clearFilters = () => {
    setSearchTerm(""); setFilterType("all"); setFilterStatus("all");
    setFilterZone("all"); setSelectedDate(null);
  };

  const hasActiveFilters = searchTerm || filterType !== "all" || filterStatus !== "all" || filterZone !== "all" || selectedDate;
  const qtdPallets = parseInt(formData.pallets) || 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie todos os agendamentos de entrada e saída do pátio
              </p>
            </div>
            <Button onClick={handleNewSchedule} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Calendário */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="py-2 text-xs font-medium text-muted-foreground">{day}</div>
                ))}
                {calendarDays.map((day) => {
                  const daySchedules  = getSchedulesForDate(day);
                  const isSelected    = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isToday       = isSameDay(day, new Date());
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={cn(
                        "relative flex h-10 items-center justify-center rounded-lg text-sm transition-all",
                        isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                        isSelected && "bg-primary text-primary-foreground",
                        !isSelected && isToday && "bg-accent/20 font-semibold text-accent",
                        !isSelected && !isToday && "hover:bg-muted"
                      )}
                    >
                      {format(day, "d")}
                      {daySchedules.length > 0 && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary" />
                      )}
                      {daySchedules.length > 0 && isSelected && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                          {daySchedules.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium text-foreground">
                    {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getSchedulesForDate(selectedDate).length} agendamento(s)
                  </p>
                </div>
              )}
            </div>

            {/* Lista */}
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar por placa ou motorista..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterZone} onValueChange={setFilterZone}>
                  <SelectTrigger className="w-[120px]"><SelectValue placeholder="Zona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="A1">Zona A1</SelectItem>
                    <SelectItem value="A2">Zona A2</SelectItem>
                    <SelectItem value="B1">Zona B1</SelectItem>
                    <SelectItem value="B2">Zona B2</SelectItem>
                    <SelectItem value="C1">Zona C1</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                    <X className="h-4 w-4" />Limpar
                  </Button>
                )}
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card py-12">
                    <p className="text-sm text-muted-foreground">Carregando agendamentos...</p>
                  </div>
                ) : filteredSchedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12">
                    <CalendarIcon className="mb-3 h-12 w-12 text-muted-foreground/40" />
                    <p className="text-lg font-medium text-foreground">Nenhum agendamento encontrado</p>
                    <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou criar um novo agendamento</p>
                  </div>
                ) : (
                  filteredSchedules.map((schedule) => {
                    const statusInfo = statusConfig[schedule.status];
                    const typeInfo   = typeConfig[schedule.type];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div key={schedule.id} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-card">
                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-muted">
                          <span className="text-lg font-bold text-foreground">{schedule.time.split(":")[0]}</span>
                          <span className="text-xs text-muted-foreground">:{schedule.time.split(":")[1]}</span>
                        </div>

                        <div className="flex flex-1 flex-wrap items-center gap-4">
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-mono font-semibold text-foreground">{schedule.plate}</p>
                              <p className="text-sm text-muted-foreground">{schedule.driver}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs", typeInfo.color)}>
                              {typeInfo.icon} {typeInfo.label}
                            </Badge>
                            <span className="font-mono text-sm text-muted-foreground">{schedule.zone}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            {schedule.pallets} pallets
                          </div>

                          {/* Nota fiscal */}
                          {schedule.nota_fiscal && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <FileText className="h-3.5 w-3.5" />
                              {schedule.nota_fiscal}
                            </div>
                          )}

                          <div className="hidden text-xs text-muted-foreground sm:block">
                            {format(schedule.date, "dd/MM/yyyy")}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", statusInfo.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                                <Pencil className="mr-2 h-4 w-4" />Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(schedule)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />Cancelar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredSchedules.length > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Mostrando {filteredSchedules.length} de {schedules.length} agendamentos
                </p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialog de Edição — só altera status */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Editar Agendamento
            </DialogTitle>
            <DialogDescription>Atualize o status do agendamento.</DialogDescription>
          </DialogHeader>
          <ScheduleForm formData={formData} setFormData={setFormData} showStatus readOnly />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Novo Agendamento — com nota fiscal e descrições */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Novo Agendamento
            </DialogTitle>
            <DialogDescription>Agende a entrada ou saída de um veículo no pátio.</DialogDescription>
          </DialogHeader>
          <ScheduleForm formData={formData} setFormData={setFormData} />

          {/* Nota Fiscal */}
          <div className="space-y-2 px-0">
            <Label htmlFor="nota_fiscal" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Nota Fiscal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nota_fiscal"
              placeholder="Ex: NF-000123"
              value={formData.nota_fiscal}
              onChange={(e) => setFormData({ ...formData, nota_fiscal: e.target.value })}
            />
          </div>

          {/* Descrições dos pallets */}
          {qtdPallets > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Descrição dos Pallets
                <span className="text-xs text-muted-foreground">
                  ({descricoes.filter((d) => d.trim()).length}/{qtdPallets} preenchidos)
                </span>
              </Label>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                {descricoes.map((desc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <Input
                      placeholder={`Descrição do pallet ${i + 1}`}
                      value={desc}
                      onChange={(e) => setDescricao(i, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              {descricoes.some((d) => !d.trim()) && (
                <p className="text-xs text-destructive">Todas as descrições são obrigatórias.</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateSchedule}>Criar Agendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert de Cancelamento */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento do veículo{" "}
              <strong>{selectedSchedule?.plate}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancelar Agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── ScheduleForm ─────────────────────────────────────────────────────────────

interface ScheduleFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  showStatus?: boolean;
  readOnly?: boolean;  // quando true, desabilita campos que não devem ser editados
}

function ScheduleForm({ formData, setFormData, showStatus, readOnly }: ScheduleFormProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plate" className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />Placa
          </Label>
          <Input
            id="plate"
            placeholder="ABC-1234"
            value={formData.plate}
            onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
            className="font-mono"
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver">Motorista</Label>
          <Input
            id="driver"
            placeholder="Nome do motorista"
            value={formData.driver}
            onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Operação</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} disabled={readOnly}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">↓ Entrada</SelectItem>
              <SelectItem value="saida">↑ Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Zona</Label>
          <Select value={formData.zone} onValueChange={(v) => setFormData({ ...formData, zone: v })} disabled={readOnly}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A1">Zona A1</SelectItem>
              <SelectItem value="A2">Zona A2</SelectItem>
              <SelectItem value="B1">Zona B1</SelectItem>
              <SelectItem value="B2">Zona B2</SelectItem>
              <SelectItem value="C1">Zona C1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} disabled={readOnly} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Horário</Label>
          <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} disabled={readOnly} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pallets" className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" />Pallets</Label>
          <Input id="pallets" type="number" min="1" placeholder="0" value={formData.pallets} onChange={(e) => setFormData({ ...formData, pallets: e.target.value })} disabled={readOnly} />
        </div>
      </div>

      {showStatus && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as FormData["status"] })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
