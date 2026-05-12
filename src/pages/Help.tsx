import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { toast } from "sonner";

const faqs = [
  {
    question: "Como criar um novo agendamento?",
    answer: "Para criar um novo agendamento, acesse a página de Agendamentos no menu lateral e clique no botão 'Novo Agendamento'. Preencha os dados do veículo, motorista, tipo de operação e horário desejado."
  },
  {
    question: "Como visualizar a ocupação das zonas?",
    answer: "A ocupação das zonas pode ser visualizada no Dashboard principal ou na página 'Mapa do Pátio'. Cada zona exibe o percentual de ocupação atual e os limites de capacidade."
  },
  {
    question: "Como exportar relatórios?",
    answer: "Na página de Relatórios, você pode selecionar o período desejado e clicar em 'Exportar PDF' ou 'Exportar Excel' para baixar o relatório no formato preferido."
  },
  {
    question: "Como editar um agendamento existente?",
    answer: "Na página de Agendamentos, localize o agendamento desejado na tabela e clique no ícone de edição (lápis). Faça as alterações necessárias e salve."
  },
  {
    question: "O que significa cada status de veículo?",
    answer: "Aguardando: veículo aguardando liberação de doca. Carregando: operação de carga em andamento. Descarregando: operação de descarga em andamento. Concluído: operação finalizada. Atrasado: operação passou do horário previsto."
  },
  {
    question: "Como alterar as configurações de notificação?",
    answer: "Acesse Configurações no menu lateral, selecione a aba 'Notificações' e ative ou desative as opções conforme sua preferência."
  },
];

const Help = () => {
  const handleContact = () => {
    toast.success("Mensagem de suporte enviada!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-20">
        <Header />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              Central de Ajuda
            </h1>
            <p className="text-sm text-muted-foreground">
              Encontre respostas e suporte para suas dúvidas
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Input
                placeholder="Buscar na central de ajuda..."
                className="pl-10"
              />
              <HelpCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-8 grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Documentação</CardTitle>
                  <CardDescription>Guias detalhados</CardDescription>
                </div>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-warning/10 p-3">
                  <Mail className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-base">E-mail</CardTitle>
                  <CardDescription>suporte@prototipo.com</CardDescription>
                </div>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <Phone className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base">Telefone</CardTitle>
                  <CardDescription>(11) 0800-123-456</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* FAQ */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Perguntas Frequentes</CardTitle>
                  <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Precisa de mais ajuda?</CardTitle>
                  <CardDescription>Entre em contato com nossa equipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assunto</label>
                    <Input placeholder="Descreva brevemente sua dúvida" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensagem</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Detalhe sua dúvida ou problema..."
                    />
                  </div>
                  <Button className="w-full" onClick={handleContact}>
                    Enviar Mensagem
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Horário de Atendimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Segunda a Sexta: 08h às 18h</p>
                  <p>Sábado: 08h às 12h</p>
                  <p>Domingo e Feriados: Fechado</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;
