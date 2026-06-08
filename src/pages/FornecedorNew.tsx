import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Building2 } from "lucide-react";
import { Sidebar }         from "@/components/Sidebar";
import { Header }          from "@/components/Header";
import { Button }          from "@/components/ui/button";
import { toast }           from "@/hooks/use-toast";
import { FornecedorForm }  from "@/components/Fornecedorform";
import { createFornecedor, FornecedorPayload } from "@/services/FornecedorService";

export default function FornecedorNovo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload: FornecedorPayload) => {
    setLoading(true);
    try {
      const created = await createFornecedor(payload);
      toast({ title: "Fornecedor cadastrado!", description: created.nome_fantasia });
      navigate(`/fornecedores/${created.id}`);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-20">
        <Header />
        <main className="p-6 max-w-xl space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/fornecedores")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Novo Fornecedor</h1>
              <p className="text-sm text-muted-foreground">Preencha os dados do fornecedor</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground">Dados do Fornecedor</p>
            </div>
            <FornecedorForm
              onSubmit={handleSubmit}
              onCancel={() => navigate("/fornecedores")}
              submitLabel="Cadastrar Fornecedor"
              loading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}2