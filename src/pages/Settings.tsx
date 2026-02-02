import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { toast } from "sonner";

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: "Protótipo Logística",
    email: "admin@prototipo.com",
    phone: "(11) 99999-9999",
    notifySchedules: true,
    notifyAlerts: true,
    notifyReports: false,
    emailNotifications: true,
    theme: "system",
    language: "pt-BR",
    autoRefresh: true,
    refreshInterval: "30",
  });

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-6 w-6" />
              Configurações
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as configurações do sistema
            </p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general" className="gap-2">
                <User className="h-4 w-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <Database className="h-4 w-4" />
                Sistema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                  <CardDescription>Dados básicos da empresa e contato</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Notificações</CardTitle>
                  <CardDescription>Configure quais notificações deseja receber</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Agendamentos</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações sobre novos agendamentos
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifySchedules}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifySchedules: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alertas de Capacidade</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber alertas quando zonas atingirem capacidade crítica
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifyAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifyAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Relatórios Automáticos</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber relatórios semanais por e-mail
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifyReports}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifyReports: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por E-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar cópia das notificações para o e-mail cadastrado
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>Personalize a aparência do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => setSettings({ ...settings, theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings({ ...settings, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>Configurações técnicas e de performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Atualização Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Atualizar dados automaticamente em tempo real
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoRefresh: checked })}
                    />
                  </div>
                  {settings.autoRefresh && (
                    <div className="space-y-2">
                      <Label htmlFor="refreshInterval">Intervalo de Atualização</Label>
                      <Select
                        value={settings.refreshInterval}
                        onValueChange={(value) => setSettings({ ...settings, refreshInterval: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 segundos</SelectItem>
                          <SelectItem value="30">30 segundos</SelectItem>
                          <SelectItem value="60">1 minuto</SelectItem>
                          <SelectItem value="300">5 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
