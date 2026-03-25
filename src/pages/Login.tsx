import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { login } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate        = useNavigate();
  const { setUser }     = useAuth();
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [formData, setFormData]   = useState({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.username, formData.password);
      setUser(data.user);
      toast({ title: `Bem-vindo, ${data.user.first_name || data.user.username}!` });
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({ title: "Erro ao entrar", description: err.message, variant: "destructive" });
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
          Controle total sobre agendamentos, entradas e saídas do seu pátio logístico.
        </p>

        <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-sm">
          {[
            { label: "Agendamentos", value: "1.2k" },
            { label: "Zonas ativas", value: "5" },
            { label: "Eficiência", value: "98%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-primary-foreground/10 p-4 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-primary-foreground/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Gestor de Pátio</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Entrar na conta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Insira suas credenciais para continuar
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="seu.usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
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

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
