import { useState, useEffect } from "react";
import { Calendar, Truck, Package, MapPin, FileText, Plus, Trash2 } from "lucide-react";
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
import { createAgendamento } from "@/services/agendamentosService";

interface NewScheduleDialogProps {
  children: React.ReactNode;
  onCreated?: () => void;
}

export function NewScheduleDialog({ children, onCreated }: NewScheduleDialogProps) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plate:       "",
    driver:      "",
    type:        "",
    zone:        "",
    date:        "",
    time:        "",
    pallets:     "",
    nota_fiscal: "",
  });

  // Uma descrição por pallet — sincroniza com a quantidade informada
  const [descricoes, setDescricoes] = useState<string[]>([]);

  // Sempre que a quantidade de pallets mudar, ajusta o array de descrições
  useEffect(() => {
    const qtd = parseInt(formData.pallets) || 0;
    setDescricoes((prev) => {
      if (qtd > prev.length) {
        return [...prev, ...Array(qtd - prev.length).fill("")];
      }
      return prev.slice(0, qtd);
    });
  }, [formData.pallets]);

  const setDescricao = (index: number, value: string) => {
    setDescricoes((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  // Validação no front antes de enviar
  const validate = (): string | null => {
    const qtd = parseInt(formData.pallets) || 0;
    if (!formData.nota_fiscal.trim()) return "Nota fiscal é obrigatória.";
    if (qtd === 0) return "Informe a quantidade de pallets.";
    if (descricoes.length !== qtd) return `Informe exatamente ${qtd} descrição(ões) de pallets.`;
    if (descricoes.some((d) => !d.trim())) return "Todas as descrições de pallets devem ser preenchidas.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const erro = validate();
    if (erro) {
      toast({ title: "Dados inválidos", description: erro, variant: "destructive" });
      return;
    }

    setLoading(true);
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
          ordem:    i + 1,
          descricao: descricao.trim(),
        })),
      });

      toast({
        title: "Agendamento criado!",
        description: `Veículo ${created.plate} agendado para ${created.date} às ${created.time}`,
      });
      setOpen(false);
      resetForm();
      onCreated?.();
    } catch (err: any) {
      // Mostra o erro de validação vindo do back-end
      toast({ title: "Erro ao criar agendamento", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ plate: "", driver: "", type: "", zone: "", date: "", time: "", pallets: "", nota_fiscal: "" });
    setDescricoes([]);
  };

  const qtdPallets = parseInt(formData.pallets) || 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Agende a entrada ou saída de um veículo no pátio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          {/* Placa + Motorista */}
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver">Motorista</Label>
              <Input
                id="driver"
                placeholder="Nome do motorista"
                value={formData.driver}
                onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Tipo + Zona */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Operação</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
              <Select value={formData.zone} onValueChange={(v) => setFormData({ ...formData, zone: v })} required>
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

          {/* Data + Hora + Pallets */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pallets" className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Pallets
              </Label>
              <Input
                id="pallets"
                type="number"
                min="1"
                placeholder="0"
                value={formData.pallets}
                onChange={(e) => setFormData({ ...formData, pallets: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Nota Fiscal */}
          <div className="space-y-2">
            <Label htmlFor="nota_fiscal" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Nota Fiscal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nota_fiscal"
              placeholder="Ex: NF-000123"
              value={formData.nota_fiscal}
              onChange={(e) => setFormData({ ...formData, nota_fiscal: e.target.value })}
              required
            />
          </div>

          {/* Descrições dos Pallets */}
          {qtdPallets > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Descrição dos Pallets
                  <span className="text-xs text-muted-foreground">
                    ({descricoes.filter((d) => d.trim()).length}/{qtdPallets} preenchidos)
                  </span>
                </Label>
              </div>

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
                <p className="text-xs text-destructive">
                  Todas as descrições são obrigatórias.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
