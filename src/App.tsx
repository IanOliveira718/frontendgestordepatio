import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Schedules from "./pages/Schedules";
import Warehouses from "./pages/Warehouses";
import Map from "./pages/Map";
import Vehicles from "./pages/Vehicles";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Gate from "./pages/Gate";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Patios from "./pages/Patios";
import Zones from "./pages/Zones";
import Pallets from "./pages/Pallets";
import Home from "./pages/Home";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas protegidas */}
            <Route path="/"          element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/home"          element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/gate"      element={<ProtectedRoute><Gate /></ProtectedRoute>} />
            <Route path="/schedules" element={<ProtectedRoute><Schedules /></ProtectedRoute>} />
            {/*<Route path="/inventory" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />*/}
            {/*<Route path="/map"       element={<ProtectedRoute><Map /></ProtectedRoute>} />*/}
            {/*<Route path="/vehicles"  element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />*/}
            {/*<Route path="/reports"   element={<ProtectedRoute><Reports /></ProtectedRoute>} />*/}
            <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/help"      element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/patios"  element={<ProtectedRoute><Patios /></ProtectedRoute>} />
            <Route path="/zones"      element={<ProtectedRoute><Zones /></ProtectedRoute>} />
            <Route path="/pallets" element={<ProtectedRoute><Pallets /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;