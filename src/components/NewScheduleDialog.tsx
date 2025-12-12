import { useState } from "react";
import { Calendar, Truck, Package, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface NewScheduleDialogProps {
  children: React.ReactNode;
}

export function NewScheduleDialog({ children }: NewScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    plate: "",
    driver: "",
    type: "",
    zone: "",
    date: "",
    time: "",
    pallets: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Agendamento criado!",
      description: `Veículo ${formData.plate} agendado para ${formData.date} às ${formData.time}`,
    });
    setOpen(false);
    setFormData({
      plate: "",
      driver: "",
      type: "",
      zone: "",
      date: "",
      time: "",
      pallets: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Agende a entrada ou saída de um veículo no pátio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                onChange={(e) =>
                  setFormData({ ...formData, plate: e.target.value.toUpperCase() })
                }
                className="font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">Motorista</Label>
              <Input
                id="driver"
                placeholder="Nome do motorista"
                value={formData.driver}
                onChange={(e) =>
                  setFormData({ ...formData, driver: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Operação</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                required
              >
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
              <Select
                value={formData.zone}
                onValueChange={(value) =>
                  setFormData({ ...formData, zone: value })
                }
                required
              >
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
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
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
                onChange={(e) =>
                  setFormData({ ...formData, pallets: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Criar Agendamento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
