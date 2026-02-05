import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gate" element={<Gate />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/inventory" element={<Warehouses />} />
          <Route path="/map" element={<Map />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
