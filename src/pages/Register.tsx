import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { register } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const navigate    = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name:  "",
    email:      "",
    username:   "",
    password:   "",
    password2:  "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      toast({ title: "Senhas não coincidem", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await register(formData);
      setUser(data.user);
      toast({ title: "Conta criada!", description: `Bem-vindo, ${data.user.first_name}!` });
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({ title: "Erro ao criar conta", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Painel esquerdo — visual */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary p-12 text-primary-foreground">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10">
          <Truck className="h-10 w-10" />
        </div>
        <h1 className="mb-3 text-4xl font-bold">Gestor de Pátio</h1>
        <p className="max-w-sm text-center text-primary-foreground/70 text-lg">
          Crie sua conta e comece a gerenciar agendamentos com eficiência.
        </p>

        <ul className="mt-12 space-y-4 w-full max-w-sm">
          {[
            "Gerencie entradas e saídas em tempo real",
            "Calendário integrado de agendamentos",
            "Controle de zonas e pallets",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-primary-foreground/80">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-bold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Painel direito — formulário */}
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
            Preencha os dados abaixo para se registrar
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nome</Label>
                <Input
                  id="first_name"
                  placeholder="João"
                  value={formData.first_name}
                  onChange={set("first_name")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input
                  id="last_name"
                  placeholder="Silva"
                  value={formData.last_name}
                  onChange={set("last_name")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@empresa.com"
                value={formData.email}
                onChange={set("email")}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="joao.silva"
                value={formData.username}
                onChange={set("username")}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password2">Confirmar senha</Label>
              <Input
                id="password2"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password2}
                onChange={set("password2")}
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2 mt-2" disabled={loading}>
              <UserPlus className="h-4 w-4" />
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
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
