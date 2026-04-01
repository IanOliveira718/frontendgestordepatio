import { useState, useEffect, useCallback } from "react";
import {
  format, isSameDay, startOfMonth, endOfMonth,
  eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search,
  Truck, Clock, Package, MapPin, MoreVertical, Pencil, Trash2, X,
  CheckCircle2, AlertCircle, Timer, FileText, Box,
} from "lucide-react";
import { Sidebar }  from "@/components/Sidebar";
import { Header }   from "@/components/Header";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn }   from "@/lib/utils";
import {
  AgendamentoAPI, TipoUnidade,
  fetchAgendamentosByPeriod, updateAgendamentoStatus, cancelAgendamento,
  fetchAgendamentoById,
} from "@/services/agendamentosService";

interface Schedule {
  id:           string;
  date:         Date;
  time:         string;
  plate:        string;
  driver:       string;
  type:         "entrada" | "saida";
  zone:         string;
  pallets:      number;
  nota_fiscal:  string;
  tipo_unidade: TipoUnidade;
  status:       AgendamentoAPI["status"];
}

function apiToSchedule(a: AgendamentoAPI): Schedule {
  const [year, month, day] = a.date.split("-").map(Number);
  return { ...a, date: new Date(year, month - 1, day) };
}

const statusConfig: Record<Schedule["status"], { label: string; icon: React.ElementType; color: string }> = {
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

interface FormData {
  plate:        string;
  driver:       string;
  type:         string;
  zone:         string;
  date:         string;
  time:         string;
  pallets:      string;
  nota_fiscal:  string;
  tipo_unidade: TipoUnidade;
  status:       Schedule["status"];
}

const emptyForm = (): FormData => ({
  plate: "", driver: "", type: "entrada", zone: "A1",
  date: "", time: "", pallets: "", nota_fiscal: "",
  tipo_unidade: "pallet", status: "agendado",
});

export default function Schedules() {
  const [schedules,     setSchedules]     = useState<Schedule[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [currentMonth,  setCurrentMonth]  = useState(new Date());
  const [selectedDate,  setSelectedDate]  = useState<Date | null>(new Date());
  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterType,    setFilterType]    = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterZone,    setFilterZone]    = useState("all");
  const [editDialogOpen,   setEditDialogOpen]   = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [detailLoading, setDetailLoading] = useState(false);
  const [agendamentoDetail, setAgendamentoDetail] = useState<AgendamentoAPI | null>(null);

  // ── Carregar ───────────────────────────────────────────────────────────────
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

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
    end:   endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 0 }),
  });

  const getSchedulesForDate = (date: Date) => schedules.filter((s) => isSameDay(s.date, date));

  const filteredSchedules = schedules.filter((s) => {
    const matchesDate   = selectedDate ? isSameDay(s.date, selectedDate) : true;
    const matchesSearch = s.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType   = filterType   === "all" || s.type   === filterType;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    const matchesZone   = filterZone   === "all" || s.zone   === filterZone;
    return matchesDate && matchesSearch && matchesType && matchesStatus && matchesZone;
  });

  // ── Editar — só status ────────────────────────────────────────────────────
 const handleEdit = async (schedule: Schedule) => {
  setSelectedSchedule(schedule);
  setFormData({
    plate:        schedule.plate,
    driver:       schedule.driver,
    type:         schedule.type,
    zone:         schedule.zone,
    date:         format(schedule.date, "yyyy-MM-dd"),
    time:         schedule.time,
    pallets:      schedule.pallets.toString(),
    nota_fiscal:  schedule.nota_fiscal,
    tipo_unidade: schedule.tipo_unidade,
    status:       schedule.status,
  });

  // Busca o detalhe completo com descrições
  setDetailLoading(true);
  setAgendamentoDetail(null);
  setEditDialogOpen(true);
  try {
    const detail = await fetchAgendamentoById(schedule.id);
    setAgendamentoDetail(detail);
  } catch {
    toast({ title: "Erro", description: "Não foi possível carregar os detalhes.", variant: "destructive" });
  } finally {
    setDetailLoading(false);
  }
};

  const handleSaveEdit = async () => {
    if (!selectedSchedule) return;
    try {
      if (formData.status !== selectedSchedule.status) {
        const updated = await updateAgendamentoStatus(selectedSchedule.id, formData.status);
        setSchedules((prev) =>
          prev.map((s) => s.id === selectedSchedule.id ? apiToSchedule(updated) : s)
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
              <p className="text-sm text-muted-foreground">Gerencie todos os agendamentos de entrada e saída do pátio</p>
            </div>
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
                {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d) => (
                  <div key={d} className="py-2 text-xs font-medium text-muted-foreground">{d}</div>
                ))}
                {calendarDays.map((day) => {
                  const daySchedules   = getSchedulesForDate(day);
                  const isSelected     = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isToday        = isSameDay(day, new Date());
                  return (
                    <button key={day.toISOString()} onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={cn(
                        "relative flex h-10 items-center justify-center rounded-lg text-sm transition-all",
                        isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                        isSelected && "bg-primary text-primary-foreground",
                        !isSelected && isToday && "bg-accent/20 font-semibold text-accent",
                        !isSelected && !isToday && "hover:bg-muted"
                      )}>
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
                  <Input placeholder="Buscar por placa ou motorista..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
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
                      <div key={schedule.id}
                        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-card">
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
                            {schedule.tipo_unidade === "pallet"
                              ? <Package className="h-4 w-4" />
                              : <Box className="h-4 w-4" />}
                            {schedule.pallets} {schedule.tipo_unidade === "pallet" ? "pallets" : "volumes"}
                          </div>

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

      {/* Dialog de Edição */}
<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Pencil className="h-5 w-5 text-primary" />
        Editar Agendamento
      </DialogTitle>
      <DialogDescription>Atualize o status do agendamento.</DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-2">

      {/* Dados principais — somente leitura */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Placa</span>
          <span className="font-mono font-semibold">{formData.plate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Motorista</span>
          <span>{formData.driver}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data / Hora</span>
          <span>{formData.date} às {formData.time}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Zona</span>
          <span className="font-mono">{formData.zone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nota Fiscal</span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            {formData.nota_fiscal}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Unidades</span>
          <span className="flex items-center gap-1.5">
            {formData.tipo_unidade === "pallet"
              ? <Package className="h-3.5 w-3.5 text-muted-foreground" />
              : <Box className="h-3.5 w-3.5 text-muted-foreground" />}
            {formData.pallets} {formData.tipo_unidade === "pallet" ? "pallets" : "volumes"}
          </span>
        </div>
      </div>

      {/* Descrições — carregadas via API */}
      {detailLoading ? (
        <div className="flex items-center justify-center py-4">
          <p className="text-sm text-muted-foreground">Carregando descrições...</p>
        </div>
      ) : agendamentoDetail && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            {formData.tipo_unidade === "pallet"
              ? <Package className="h-4 w-4 text-muted-foreground" />
              : <Box className="h-4 w-4 text-muted-foreground" />}
            {formData.tipo_unidade === "pallet" ? "Descrição dos Pallets" : "Descrição dos Volumes"}
          </Label>

          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            {formData.tipo_unidade === "pallet"
              ? (agendamentoDetail.descricoes_pallets ?? []).map((p) => (
                  <div key={p.ordem} className="flex items-start gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {p.ordem}
                    </span>
                    <span className="text-foreground">{p.descricao}</span>
                  </div>
                ))
              : (agendamentoDetail.descricoes_volumes ?? []).map((v) => (
                  <div key={v.ordem} className="space-y-1">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {v.ordem}
                      </span>
                      <span className="font-medium text-foreground">{v.descricao}</span>
                    </div>
                    <div className="ml-7 flex gap-4 text-xs text-muted-foreground">
                      <span>A: {v.altura} cm</span>
                      <span>L: {v.largura} cm</span>
                      <span>C: {v.comprimento} cm</span>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      )}

      {/* Status — editável */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(v) => setFormData({ ...formData, status: v as Schedule["status"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="em_andamento">Em andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
      <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
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
