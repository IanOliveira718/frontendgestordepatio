import { useState } from "react";
import { Plus, Edit, Trash2, Warehouse, Package, Search, Filter } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface WarehouseData {
  id: string;
  code: string;
  name: string;
  type: "dry" | "cold" | "outdoor";
  capacity: number;
  occupied: number;
  status: "active" | "maintenance" | "inactive";
  location: string;
}

const initialWarehouses: WarehouseData[] = [
  { id: "1", code: "ARM-A1", name: "Armazém Principal A1", type: "dry", capacity: 500, occupied: 385, status: "active", location: "Bloco A - Setor 1" },
  { id: "2", code: "ARM-A2", name: "Armazém Secundário A2", type: "dry", capacity: 350, occupied: 280, status: "active", location: "Bloco A - Setor 2" },
  { id: "3", code: "ARM-B1", name: "Armazém Refrigerado B1", type: "cold", capacity: 200, occupied: 180, status: "active", location: "Bloco B - Setor 1" },
  { id: "4", code: "ARM-C1", name: "Pátio Externo C1", type: "outdoor", capacity: 800, occupied: 450, status: "active", location: "Área Externa C" },
  { id: "5", code: "ARM-D1", name: "Armazém Reserva D1", type: "dry", capacity: 400, occupied: 0, status: "maintenance", location: "Bloco D - Setor 1" },
  { id: "6", code: "ARM-E1", name: "Câmara Fria E1", type: "cold", capacity: 150, occupied: 95, status: "active", location: "Bloco E - Setor 1" },
];

const typeLabels: Record<WarehouseData["type"], string> = {
  dry: "Seco",
  cold: "Refrigerado",
  outdoor: "Externo",
};

const statusLabels: Record<WarehouseData["status"], string> = {
  active: "Ativo",
  maintenance: "Manutenção",
  inactive: "Inativo",
};

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>(initialWarehouses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseData | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "dry" as WarehouseData["type"],
    capacity: "",
    occupied: "",
    status: "active" as WarehouseData["status"],
    location: "",
  });

  const filteredWarehouses = warehouses.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || w.type === filterType;
    const matchesStatus = filterStatus === "all" || w.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCapacity = warehouses.reduce((acc, w) => acc + w.capacity, 0);
  const totalOccupied = warehouses.reduce((acc, w) => acc + w.occupied, 0);
  const activeWarehouses = warehouses.filter((w) => w.status === "active").length;

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      type: "dry",
      capacity: "",
      occupied: "",
      status: "active",
      location: "",
    });
    setEditingWarehouse(null);
  };

  const handleOpenDialog = (warehouse?: WarehouseData) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        code: warehouse.code,
        name: warehouse.name,
        type: warehouse.type,
        capacity: warehouse.capacity.toString(),
        occupied: warehouse.occupied.toString(),
        status: warehouse.status,
        location: warehouse.location,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.capacity || !formData.location) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingWarehouse) {
      setWarehouses((prev) =>
        prev.map((w) =>
          w.id === editingWarehouse.id
            ? {
                ...w,
                code: formData.code,
                name: formData.name,
                type: formData.type,
                capacity: parseInt(formData.capacity),
                occupied: parseInt(formData.occupied) || 0,
                status: formData.status,
                location: formData.location,
              }
            : w
        )
      );
      toast.success("Armazém atualizado com sucesso!");
    } else {
      const newWarehouse: WarehouseData = {
        id: Date.now().toString(),
        code: formData.code,
        name: formData.name,
        type: formData.type,
        capacity: parseInt(formData.capacity),
        occupied: parseInt(formData.occupied) || 0,
        status: formData.status,
        location: formData.location,
      };
      setWarehouses((prev) => [...prev, newWarehouse]);
      toast.success("Armazém cadastrado com sucesso!");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
    toast.success("Armazém removido com sucesso!");
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 70) return "text-warning";
    return "text-success";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Armazéns de Pallets</h1>
              <p className="text-sm text-muted-foreground">
                Cadastro e controle de ocupação dos armazéns
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Armazém
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingWarehouse ? "Editar Armazém" : "Novo Armazém"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingWarehouse
                      ? "Atualize as informações do armazém"
                      : "Preencha os dados para cadastrar um novo armazém"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código *</Label>
                      <Input
                        id="code"
                        placeholder="ARM-XX"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value as WarehouseData["type"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dry">Seco</SelectItem>
                          <SelectItem value="cold">Refrigerado</SelectItem>
                          <SelectItem value="outdoor">Externo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Nome do armazém"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização *</Label>
                    <Input
                      id="location"
                      placeholder="Bloco X - Setor Y"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidade (pallets) *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="0"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupied">Ocupação atual</Label>
                      <Input
                        id="occupied"
                        type="number"
                        placeholder="0"
                        value={formData.occupied}
                        onChange={(e) => setFormData({ ...formData, occupied: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as WarehouseData["status"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingWarehouse ? "Salvar alterações" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Metrics Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Warehouse className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Armazéns</p>
                  <p className="text-2xl font-bold">{warehouses.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Package className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">{activeWarehouses}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Package className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacidade Total</p>
                  <p className="text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                  <Package className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ocupação Total</p>
                  <p className="text-2xl font-bold">
                    {Math.round((totalOccupied / totalCapacity) * 100)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, nome ou localização..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="dry">Seco</SelectItem>
                      <SelectItem value="cold">Refrigerado</SelectItem>
                      <SelectItem value="outdoor">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Armazéns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-center">Ocupação</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarehouses.map((warehouse) => {
                    const percentage = Math.round((warehouse.occupied / warehouse.capacity) * 100);
                    return (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-mono font-medium">{warehouse.code}</TableCell>
                        <TableCell>{warehouse.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[warehouse.type]}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{warehouse.location}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className={getOccupancyColor(percentage)}>
                                {warehouse.occupied}/{warehouse.capacity}
                              </span>
                              <span className={`font-medium ${getOccupancyColor(percentage)}`}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                              <div
                                className={`h-full transition-all ${getProgressColor(percentage)}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              warehouse.status === "active"
                                ? "default"
                                : warehouse.status === "maintenance"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {statusLabels[warehouse.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(warehouse)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o armazém "{warehouse.name}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(warehouse.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredWarehouses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum armazém encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
