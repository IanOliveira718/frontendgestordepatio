import { useState } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
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

interface Schedule {
  id: string;
  date: Date;
  time: string;
  plate: string;
  driver: string;
  type: "entrada" | "saida";
  zone: string;
  pallets: number;
  status: "agendado" | "em_andamento" | "concluido" | "atrasado";
}

const initialSchedules: Schedule[] = [
  { id: "1", date: new Date(2025, 11, 12), time: "08:00", plate: "ABC-1234", driver: "João Silva", type: "entrada", zone: "A1", pallets: 24, status: "concluido" },
  { id: "2", date: new Date(2025, 11, 12), time: "09:30", plate: "DEF-5678", driver: "Maria Santos", type: "saida", zone: "B2", pallets: 18, status: "em_andamento" },
  { id: "3", date: new Date(2025, 11, 12), time: "10:00", plate: "GHI-9012", driver: "Pedro Costa", type: "entrada", zone: "A2", pallets: 32, status: "agendado" },
  { id: "4", date: new Date(2025, 11, 12), time: "14:00", plate: "JKL-3456", driver: "Ana Lima", type: "saida", zone: "C1", pallets: 15, status: "atrasado" },
  { id: "5", date: new Date(2025, 11, 13), time: "08:30", plate: "MNO-7890", driver: "Carlos Ferreira", type: "entrada", zone: "B1", pallets: 28, status: "agendado" },
  { id: "6", date: new Date(2025, 11, 13), time: "11:00", plate: "PQR-1234", driver: "Lucia Oliveira", type: "saida", zone: "A1", pallets: 20, status: "agendado" },
  { id: "7", date: new Date(2025, 11, 14), time: "09:00", plate: "STU-5678", driver: "Roberto Alves", type: "entrada", zone: "C1", pallets: 22, status: "agendado" },
  { id: "8", date: new Date(2025, 11, 15), time: "10:30", plate: "VWX-9012", driver: "Fernanda Cruz", type: "entrada", zone: "A2", pallets: 30, status: "agendado" },
  { id: "9", date: new Date(2025, 11, 16), time: "14:30", plate: "YZA-3456", driver: "Marcos Dias", type: "saida", zone: "B2", pallets: 16, status: "agendado" },
];

const statusConfig = {
  agendado: { label: "Agendado", icon: Clock, color: "bg-muted text-muted-foreground" },
  em_andamento: { label: "Em andamento", icon: Timer, color: "bg-primary/15 text-primary" },
  concluido: { label: "Concluído", icon: CheckCircle2, color: "bg-success/15 text-success" },
  atrasado: { label: "Atrasado", icon: AlertCircle, color: "bg-destructive/15 text-destructive" },
};

const typeConfig = {
  entrada: { label: "Entrada", color: "bg-success/15 text-success border-success/30", icon: "↓" },
  saida: { label: "Saída", color: "bg-primary/15 text-primary border-primary/30", icon: "↑" },
};

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    plate: "",
    driver: "",
    type: "entrada",
    zone: "A1",
    date: "",
    time: "",
    pallets: "",
    status: "agendado",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((s) => isSameDay(s.date, date));
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesDate = selectedDate ? isSameDay(schedule.date, selectedDate) : true;
    const matchesSearch =
      schedule.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || schedule.type === filterType;
    const matchesStatus = filterStatus === "all" || schedule.status === filterStatus;
    const matchesZone = filterZone === "all" || schedule.zone === filterZone;
    return matchesDate && matchesSearch && matchesType && matchesStatus && matchesZone;
  });

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      plate: schedule.plate,
      driver: schedule.driver,
      type: schedule.type,
      zone: schedule.zone,
      date: format(schedule.date, "yyyy-MM-dd"),
      time: schedule.time,
      pallets: schedule.pallets.toString(),
      status: schedule.status,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSchedule) {
      setSchedules(schedules.filter((s) => s.id !== selectedSchedule.id));
      toast({
        title: "Agendamento excluído",
        description: `Agendamento do veículo ${selectedSchedule.plate} foi removido.`,
      });
      setDeleteDialogOpen(false);
      setSelectedSchedule(null);
    }
  };

  const handleSaveEdit = () => {
    if (selectedSchedule) {
      setSchedules(
        schedules.map((s) =>
          s.id === selectedSchedule.id
            ? {
                ...s,
                plate: formData.plate,
                driver: formData.driver,
                type: formData.type as "entrada" | "saida",
                zone: formData.zone,
                date: new Date(formData.date),
                time: formData.time,
                pallets: parseInt(formData.pallets),
                status: formData.status as Schedule["status"],
              }
            : s
        )
      );
      toast({
        title: "Agendamento atualizado",
        description: `Agendamento do veículo ${formData.plate} foi atualizado.`,
      });
      setEditDialogOpen(false);
      setSelectedSchedule(null);
    }
  };

  const handleNewSchedule = () => {
    setFormData({
      plate: "",
      driver: "",
      type: "entrada",
      zone: "A1",
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      time: "",
      pallets: "",
      status: "agendado",
    });
    setNewDialogOpen(true);
  };

  const handleCreateSchedule = () => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      plate: formData.plate,
      driver: formData.driver,
      type: formData.type as "entrada" | "saida",
      zone: formData.zone,
      date: new Date(formData.date),
      time: formData.time,
      pallets: parseInt(formData.pallets),
      status: formData.status as Schedule["status"],
    };
    setSchedules([...schedules, newSchedule]);
    toast({
      title: "Agendamento criado",
      description: `Veículo ${formData.plate} agendado para ${format(new Date(formData.date), "dd/MM/yyyy")} às ${formData.time}`,
    });
    setNewDialogOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterZone("all");
    setSelectedDate(null);
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="py-2 text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => {
                  const daySchedules = getSchedulesForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isToday = isSameDay(day, new Date());

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

            {/* Lista de Agendamentos */}
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por placa ou motorista..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterZone} onValueChange={setFilterZone}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Zona" />
                  </SelectTrigger>
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
                    <X className="h-4 w-4" />
                    Limpar
                  </Button>
                )}
              </div>

              {/* Resultados */}
              <div className="space-y-3">
                {filteredSchedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12">
                    <CalendarIcon className="mb-3 h-12 w-12 text-muted-foreground/40" />
                    <p className="text-lg font-medium text-foreground">Nenhum agendamento encontrado</p>
                    <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou criar um novo agendamento</p>
                  </div>
                ) : (
                  filteredSchedules.map((schedule) => {
                    const statusInfo = statusConfig[schedule.status];
                    const typeInfo = typeConfig[schedule.type];
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div
                        key={schedule.id}
                        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-card"
                      >
                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-muted">
                          <span className="text-lg font-bold text-foreground">
                            {schedule.time.split(":")[0]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            :{schedule.time.split(":")[1]}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-wrap items-center gap-4">
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-mono font-semibold text-foreground">
                                {schedule.plate}
                              </p>
                              <p className="text-sm text-muted-foreground">{schedule.driver}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs", typeInfo.color)}>
                              {typeInfo.icon} {typeInfo.label}
                            </Badge>
                            <span className="font-mono text-sm text-muted-foreground">
                              {schedule.zone}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            {schedule.pallets} pallets
                          </div>

                          <div className="hidden text-xs text-muted-foreground sm:block">
                            {format(schedule.date, "dd/MM/yyyy")}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                              statusInfo.color
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(schedule)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Editar Agendamento
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do agendamento.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm formData={formData} setFormData={setFormData} showStatus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Novo Agendamento */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Novo Agendamento
            </DialogTitle>
            <DialogDescription>
              Agende a entrada ou saída de um veículo no pátio.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSchedule}>Criar Agendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agendamento do veículo{" "}
              <strong>{selectedSchedule?.plate}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ScheduleFormProps {
  formData: {
    plate: string;
    driver: string;
    type: string;
    zone: string;
    date: string;
    time: string;
    pallets: string;
    status: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<ScheduleFormProps["formData"]>>;
  showStatus?: boolean;
}

function ScheduleForm({ formData, setFormData, showStatus }: ScheduleFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plate" className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            Placa
          </Label>
          <Input
            id="plate"
            placeholder="ABC-1234"
            value={formData.plate}
            onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver">Motorista</Label>
          <Input
            id="driver"
            placeholder="Nome do motorista"
            value={formData.driver}
            onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Operação</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">↓ Entrada</SelectItem>
              <SelectItem value="saida">↑ Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Zona
          </Label>
          <Select value={formData.zone} onValueChange={(value) => setFormData({ ...formData, zone: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
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
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Horário</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pallets" className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Pallets
          </Label>
          <Input
            id="pallets"
            type="number"
            placeholder="0"
            value={formData.pallets}
            onChange={(e) => setFormData({ ...formData, pallets: e.target.value })}
          />
        </div>
      </div>

      {showStatus && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
