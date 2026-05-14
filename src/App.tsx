import { Toaster }              from "@/components/ui/toaster";
import { Toaster as Sonner }    from "@/components/ui/sonner";
import { TooltipProvider }      from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }         from "@/context/AuthContext";
import { ProtectedRoute }       from "@/components/ProtectedRoute";

import Index      from "./pages/Index";
import Schedules  from "./pages/Schedules";
import Pallets    from "./pages/Pallets";
import Patios     from "./pages/Patios";
import Zones      from "./pages/Zones";
import Users      from "./pages/Users";
import Gate       from "./pages/Gate";
import Settings   from "./pages/Settings";
import Help       from "./pages/Help";
import NotFound   from "./pages/NotFound";
import Login      from "./pages/Login";
import Register   from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Públicas */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Autenticadas — sem restrição de tipo */}
            <Route path="/"        element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/help"     element={<ProtectedRoute><Help /></ProtectedRoute>} />

            {/* Portaria — admin e portaria */}
            <Route path="/gate"
              element={<ProtectedRoute permission="podeVerAgendamentos"><Gate /></ProtectedRoute>} />

            {/* Agendamentos — todos exceto sem perfil */}
            <Route path="/schedules"
              element={<ProtectedRoute permission="podeVerAgendamentos"><Schedules /></ProtectedRoute>} />

            {/* Pallets — admin, portaria, recebimento */}
            <Route path="/pallets"
              element={<ProtectedRoute permission="podeVerPallets"><Pallets /></ProtectedRoute>} />

            {/* Pátios e Zonas — admin */}
            <Route path="/patios"
              element={<ProtectedRoute permission="podeGerenciarPatios"><Patios /></ProtectedRoute>} />
            <Route path="/zones"
              element={<ProtectedRoute permission="podeGerenciarPatios"><Zones /></ProtectedRoute>} />

            {/* Usuários — admin */}
            <Route path="/users"
              element={<ProtectedRoute permission="podeGerenciarUsuarios"><Users /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
