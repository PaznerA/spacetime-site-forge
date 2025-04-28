
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EditorPage from "./pages/EditorPage";
import ProjectsPage from "./pages/ProjectsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { EditorProvider } from "./context/EditorContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { Navbar } from "./components/layout/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <HashRouter>
          <AuthProvider>
            <EditorProvider>
              <Toaster />
              <Sonner />
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/editor/:projectId?" element={<EditorPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </EditorProvider>
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
