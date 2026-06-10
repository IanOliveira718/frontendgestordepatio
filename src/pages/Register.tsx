import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck, Eye, EyeOff, UserPlus,
  Building2, Search, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { toast }  from "@/hooks/use-toast";
import { cn }     from "@/lib/utils";

const BASE = "http://localhost:8000/api";

// ── Máscara de CNPJ ───────────────────────────────────────────────────────────
function maskCNPJ(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 14);
  console.log(d);
  return d
    .replace(/^(\d{2})(\d)/,            "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/,   "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/,           ".$1/$2")
    .replace(/(\d{4})(\d)/,             "$1-$2");
}

interface FornecedorInfo {
  id:            number;
  nome_fantasia: string;
  cnpj_formatado: string;
}

export default function Register() {
  const navigate = useNavigate();

  // Estado do CNPJ e busca
  const [cnpj,          setCnpj]          = useState("");
  const [cnpjStatus,    setCnpjStatus]    = useState<"idle" | "checking" | "found" | "error">("idle");
  const [cnpjErro,      setCnpjErro]      = useState("");
  const [fornecedor,    setFornecedor]    = useState<FornecedorInfo | null>(null);

  // Estado do formulário
  const [showPass, setShowPass] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "",
    email: "", username: "",
    password: "", password2: "", 
    cnpj: ""
  });

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(maskCNPJ(e.target.value));
    setCnpjStatus("idle");
    setCnpjErro("");
    setFornecedor(null);
  };

  // ── Submeter cadastro ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    /*
    if (cnpjStatus !== "found" || !fornecedor) {
      toast({ title: "Verifique o CNPJ antes de continuar.", variant: "destructive" });
      return;
    }*/
    if (formData.password !== formData.password2) {
      toast({ title: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/auth/register/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cnpj: cnpj.replace(/\D/g, ""),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Extrai mensagem mais legível dos erros do DRF
        const msg = typeof data === "object"
          ? Object.entries(data)
              .map(([k, v]) => `${k === "non_field_errors" ? "" : k + ": "}${Array.isArray(v) ? v.join(" ") : v}`)
              .join(" ")
          : "Erro ao realizar cadastro.";
        throw new Error(msg.trim());
      }

      toast({
        title: "Cadastro realizado!",
        description: "Aguarde a aprovação do administrador para acessar o sistema.",
      });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Erro no cadastro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const cnpjVerificado = cnpjStatus === "found";

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Painel esquerdo ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary p-12 text-primary-foreground">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10">
          <Truck className="h-10 w-10" />
        </div>
        <h1 className="mb-3 text-4xl font-bold">Gestor de Pátio</h1>
        <p className="max-w-sm text-center text-primary-foreground/70 text-lg">
          Crie sua conta para agendar cargas e acompanhar o status das suas entregas.
        </p>
        <ul className="mt-12 space-y-4 w-full max-w-sm">
          {[
            "Agendamento rápido de cargas",
            "Status dos pallets em tempo real",
            "Histórico completo de agendamentos",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-primary-foreground/80">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-bold">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Formulário ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Gestor de Pátio</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Criar conta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados para solicitar acesso ao sistema
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <>
                <div className="pt-1 border-t border-border">
                  <p className="text-sm font-medium text-foreground pt-3 mb-4">Dados pessoais</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Nome</Label>
                        <Input id="first_name" placeholder="João"
                          value={formData.first_name} onChange={set("first_name")} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Sobrenome</Label>
                        <Input id="last_name" placeholder="Silva"
                          value={formData.last_name} onChange={set("last_name")} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="joao@empresa.com"
                        value={formData.email} onChange={set("email")}
                        autoComplete="email" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input id="cnpj" type="text" placeholder="00.000.000/0000-00" 
                        maxLength={18} value={cnpj} onChange={handleCnpjChange} 
                        autoComplete="off" required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Usuário</Label>
                      <Input id="username" placeholder="joao.silva"
                        value={formData.username} onChange={set("username")}
                        autoComplete="username" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input id="password" type={showPass ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password} onChange={set("password")}
                          autoComplete="new-password" className="pr-10" required />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password2">Confirmar senha</Label>
                      <Input id="password2" type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password2} onChange={set("password2")}
                        autoComplete="new-password" required />
                    </div>
                  </div>
                </div>

                {/* Aviso de aprovação */}
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-3 text-xs text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Após o cadastro, seu acesso ficará <strong>bloqueado</strong> até que o
                    administrador aprove sua solicitação.
                  </span>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={saving}>
                  <UserPlus className="h-4 w-4" />
                  {saving ? "Enviando..." : "Solicitar Cadastro"}
                </Button>
              </>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
