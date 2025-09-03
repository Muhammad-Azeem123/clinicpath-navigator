import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Map from "./pages/Map";
import Departments from "./pages/Departments";
import Navigation from "./pages/Navigation";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="clinicpath-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1">
              <header className="h-12 flex items-center border-b bg-background px-4">
                <SidebarTrigger />
                <h1 className="ml-4 text-lg font-semibold">ClinicPath Navigation System</h1>
              </header>
              <div className="p-6">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/departments" element={<Departments />} />
                  <Route path="/navigation" element={<Navigation />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/staff" element={<Staff />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
