
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { ThemeProvider } from "@/hooks/use-theme";

// Páginas
import Inventory from "./pages/Inventory";
import Loans from "./pages/Loans";
import Movements from "./pages/Movements";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

// Libs para exportação
import 'jspdf-autotable';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <InventoryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <div className="flex-1 relative">
                  <div className="sticky top-0 left-0 right-0 bg-background/75 backdrop-blur-sm z-10 py-3 px-4 border-b">
                    <SidebarTrigger />
                  </div>
                  <Routes>
                    <Route path="/" element={<Inventory />} />
                    <Route path="/emprestimos" element={<Loans />} />
                    <Route path="/movimentacoes" element={<Movements />} />
                    <Route path="/relatorios" element={<Reports />} />
                    <Route path="/notificacoes" element={<Notifications />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </InventoryProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
