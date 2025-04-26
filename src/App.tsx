
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PositionsProvider } from "./contexts/PositionsContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentProfileSetup from "./pages/StudentProfileSetup";
import ProfessorProfileSetup from "./pages/ProfessorProfileSetup";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import StudentProfile from "./pages/StudentProfile";
import ProfessorProfile from "./pages/ProfessorProfile";
import CreatePosition from "./pages/CreatePosition";
import EditPosition from "./pages/EditPosition";
import BrowsePositions from "./pages/BrowsePositions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PositionsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student-profile-setup" element={<StudentProfileSetup />} />
              <Route path="/professor-profile-setup" element={<ProfessorProfileSetup />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/professor-dashboard" element={<ProfessorDashboard />} />
              <Route path="/student-profile" element={<StudentProfile />} />
              <Route path="/professor-profile" element={<ProfessorProfile />} />
              <Route path="/create-position" element={<CreatePosition />} />
              <Route path="/edit-position/:positionId" element={<EditPosition />} />
              <Route path="/browse-positions" element={<BrowsePositions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PositionsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
