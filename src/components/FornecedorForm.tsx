import { useEffect, useState } from "react";
import { Building2, FileText, Tag } from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn }     from "@/lib/utils";
import { FornecedorAPI, FornecedorPayload } from "@/services/FornecedorService";

export function formatCNPJ(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/,           "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/,  "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/,          ".$1/$2")
    .replace(/(\d{4})(\d)/,            "$1-$2");
}

interface FornecedorFormProps {
  initial?:   Partial<FornecedorAPI>;
  onSubmit:   (payload: FornecedorPayload) => Promise<void>;
  onCancel?:  () => void;
  submitLabel?: string;
  loading?:   boolean;
}

export function FornecedorForm({
  initial, onSubmit, onCancel, submitLabel = "Salvar", loading,
}: FornecedorFormProps) {
  const [cnpj,         setCnpj]         = useState(initial?.cnpj_formatado ?? "");
  const [razaoSocial,  setRazaoSocial]  = useState(initial?.razao_social   ?? "");
  const [nomeFantasia, setNomeFantasia] = useState(initial?.nome_fantasia  ?? "");
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setCnpj(initial.cnpj_formatado ?? "");
      setRazaoSocial(initial.razao_social ?? "");
      setNomeFantasia(initial.nome_fantasia ?? "");
    }
  }, [initial?.id]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length !== 14)     e.cnpj         = "CNPJ deve ter 14 dígitos.";
    if (!razaoSocial.trim())      e.razao_social  = "Razão social é obrigatória.";
    if (!nomeFantasia.trim())     e.nome_fantasia = "Nome fantasia é obrigatório.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      cnpj:          cnpj.replace(/\D/g, ""),
      razao_social:  razaoSocial.trim(),
      nome_fantasia: nomeFantasia.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* CNPJ */}
      <div className="space-y-2">
        <Label htmlFor="cnpj" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          CNPJ <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
          className={cn("font-mono", errors.cnpj && "border-destructive")}
          disabled={!!initial?.id} // CNPJ não editável após criação
          maxLength={18}
        />
        {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj}</p>}
        {initial?.id && (
          <p className="text-xs text-muted-foreground">O CNPJ não pode ser alterado após o cadastro.</p>
        )}
      </div>

      {/* Razão Social */}
      <div className="space-y-2">
        <Label htmlFor="razao_social" className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Razão Social <span className="text-destructive">*</span>
        </Label>
        <Input
          id="razao_social"
          placeholder="Empresa Ltda."
          value={razaoSocial}
          onChange={(e) => setRazaoSocial(e.target.value)}
          className={cn(errors.razao_social && "border-destructive")}
        />
        {errors.razao_social && <p className="text-xs text-destructive">{errors.razao_social}</p>}
      </div>

      {/* Nome Fantasia */}
      <div className="space-y-2">
        <Label htmlFor="nome_fantasia" className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          Nome Fantasia <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nome_fantasia"
          placeholder="Nome comercial"
          value={nomeFantasia}
          onChange={(e) => setNomeFantasia(e.target.value)}
          className={cn(errors.nome_fantasia && "border-destructive")}
        />
        {errors.nome_fantasia && <p className="text-xs text-destructive">{errors.nome_fantasia}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}