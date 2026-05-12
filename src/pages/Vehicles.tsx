import { useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  company: string;
  type: "truck" | "van" | "container";
  status: "waiting" | "loading" | "unloading" | "completed" | "delayed";
  dock: string | null;
  arrivalTime: string;
  estimatedDeparture: string;
}

const initialVehicles: Vehicle[] = [
  { id: "1", plate: "ABC-1234", driver: "João Silva", company: "Transportes Silva", type: "truck", status: "loading", dock: "D1", arrivalTime: "08:30", estimatedDeparture: "10:00" },
  { id: "2", plate: "XYZ-5678", driver: "Maria Santos", company: "LogiMax", type: "container", status: "waiting", dock: null, arrivalTime: "09:00", estimatedDeparture: "11:30" },
  { id: "3", plate: "DEF-9012", driver: "Pedro Costa", company: "Rápido Express", type: "van", status: "unloading", dock: "D6", arrivalTime: "09:30", estimatedDeparture: "10:30" },
  { id: "4", plate: "GHI-3456", driver: "Ana Oliveira", company: "Carga Pesada", type: "truck", status: "delayed", dock: "D3", arrivalTime: "08:00", estimatedDeparture: "09:30" },
  { id: "5", plate: "JKL-7890", driver: "Carlos Ferreira", company: "TransLog", type: "truck", status: "completed", dock: null, arrivalTime: "07:00", estimatedDeparture: "08:30" },
];

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate: "",
    driver: "",
    company: "",
    type: "truck" as Vehicle["type"],
    status: "waiting" as Vehicle["status"],
    dock: "",
    arrivalTime: "",
    estimatedDeparture: "",
  });

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    const matchesType = typeFilter === "all" || vehicle.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSave = () => {
    if (editingVehicle) {
      setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? { ...v, ...formData, dock: formData.dock || null } : v)));
      toast.success("Veículo atualizado com sucesso!");
    } else {
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        ...formData,
        dock: formData.dock || null,
      };
      setVehicles([...vehicles, newVehicle]);
      toast.success("Veículo cadastrado com sucesso!");
    }
    resetForm();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      driver: vehicle.driver,
      company: vehicle.company,
      type: vehicle.type,
      status: vehicle.status,
      dock: vehicle.dock || "",
      arrivalTime: vehicle.arrivalTime,
      estimatedDeparture: vehicle.estimatedDeparture,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
    toast.success("Veículo removido com sucesso!");
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingVehicle(null);
    setFormData({
      plate: "",
      driver: "",
      company: "",
      type: "truck",
      status: "waiting",
      dock: "",
      arrivalTime: "",
      estimatedDeparture: "",
    });
  };

  const getStatusBadge = (status: Vehicle["status"]) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Aguardando</Badge>;
      case "loading":
        return <Badge className="gap-1 bg-primary"><Truck className="h-3 w-3" /> Carregando</Badge>;
      case "unloading":
        return <Badge className="gap-1 bg-success text-success-foreground"><Truck className="h-3 w-3" /> Descarregando</Badge>;
      case "completed":
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Concluído</Badge>;
      case "delayed":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Atrasado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeName = (type: Vehicle["type"]) => {
    switch (type) {
      case "truck": return "Caminhão";
      case "van": return "Van";
      case "container": return "Container";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-20">
        <Header />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Truck className="h-6 w-6" />
                Veículos
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerenciamento de veículos no pátio
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Veículo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingVehicle ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
                  <DialogDescription>
                    {editingVehicle ? "Edite as informações do veículo." : "Cadastre um novo veículo no sistema."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plate">Placa</Label>
                      <Input
                        id="plate"
                        value={formData.plate}
                        onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                        placeholder="ABC-1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={formData.type} onValueChange={(value: Vehicle["type"]) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="truck">Caminhão</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="container">Container</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver">Motorista</Label>
                    <Input
                      id="driver"
                      value={formData.driver}
                      onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                      placeholder="Nome do motorista"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Transportadora</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nome da transportadora"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: Vehicle["status"]) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="waiting">Aguardando</SelectItem>
                          <SelectItem value="loading">Carregando</SelectItem>
                          <SelectItem value="unloading">Descarregando</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="delayed">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dock">Doca</Label>
                      <Input
                        id="dock"
                        value={formData.dock}
                        onChange={(e) => setFormData({ ...formData, dock: e.target.value })}
                        placeholder="D1, D2..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="arrivalTime">Hora Chegada</Label>
                      <Input
                        id="arrivalTime"
                        type="time"
                        value={formData.arrivalTime}
                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDeparture">Previsão Saída</Label>
                      <Input
                        id="estimatedDeparture"
                        type="time"
                        value={formData.estimatedDeparture}
                        onChange={(e) => setFormData({ ...formData, estimatedDeparture: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button onClick={handleSave}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, motorista ou transportadora..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="waiting">Aguardando</SelectItem>
                <SelectItem value="loading">Carregando</SelectItem>
                <SelectItem value="unloading">Descarregando</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="delayed">Atrasado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="truck">Caminhão</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-foreground">{vehicles.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-foreground">{vehicles.filter(v => v.status === "waiting").length}</div>
              <div className="text-sm text-muted-foreground">Aguardando</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-primary">{vehicles.filter(v => v.status === "loading" || v.status === "unloading").length}</div>
              <div className="text-sm text-muted-foreground">Em Operação</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-success">{vehicles.filter(v => v.status === "completed").length}</div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-destructive">{vehicles.filter(v => v.status === "delayed").length}</div>
              <div className="text-sm text-muted-foreground">Atrasados</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Transportadora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Doca</TableHead>
                  <TableHead>Chegada</TableHead>
                  <TableHead>Prev. Saída</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-medium">{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.driver}</TableCell>
                    <TableCell>{vehicle.company}</TableCell>
                    <TableCell>{getTypeName(vehicle.type)}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>{vehicle.dock || "-"}</TableCell>
                    <TableCell>{vehicle.arrivalTime}</TableCell>
                    <TableCell>{vehicle.estimatedDeparture}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      Nenhum veículo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Vehicles;
