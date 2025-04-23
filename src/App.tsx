
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PositionsProvider } from "./contexts/PositionsContext";
import { useAuth } from "./contexts/AuthContext"; 

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

// Auth route wrapper component
const RequireAuth = ({ children, redirectTo, requiredRole }: { 
  children: JSX.Element, 
  redirectTo: string,
  requiredRole?: "student" | "professor" 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={
        user ? (
          <Navigate to={user.role === "student" ? "/student-dashboard" : "/professor-dashboard"} replace />
        ) : (
          <Login />
        )
      } />
      <Route path="/register" element={
        user ? (
          <Navigate to={user.role === "student" ? "/student-dashboard" : "/professor-dashboard"} replace />
        ) : (
          <Register />
        )
      } />
      <Route path="/student-profile-setup" element={
        <RequireAuth redirectTo="/login" requiredRole="student">
          <StudentProfileSetup />
        </RequireAuth>
      } />
      <Route path="/professor-profile-setup" element={
        <RequireAuth redirectTo="/login" requiredRole="professor">
          <ProfessorProfileSetup />
        </RequireAuth>
      } />
      <Route path="/student-dashboard" element={
        <RequireAuth redirectTo="/login" requiredRole="student">
          <StudentDashboard />
        </RequireAuth>
      } />
      <Route path="/professor-dashboard" element={
        <RequireAuth redirectTo="/login" requiredRole="professor">
          <ProfessorDashboard />
        </RequireAuth>
      } />
      <Route path="/student-profile" element={
        <RequireAuth redirectTo="/login" requiredRole="student">
          <StudentProfile />
        </RequireAuth>
      } />
      <Route path="/professor-profile" element={
        <RequireAuth redirectTo="/login" requiredRole="professor">
          <ProfessorProfile />
        </RequireAuth>
      } />
      <Route path="/create-position" element={
        <RequireAuth redirectTo="/login" requiredRole="professor">
          <CreatePosition />
        </RequireAuth>
      } />
      <Route path="/edit-position/:positionId" element={
        <RequireAuth redirectTo="/login" requiredRole="professor">
          <EditPosition />
        </RequireAuth>
      } />
      <Route path="/browse-positions" element={<BrowsePositions />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PositionsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PositionsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
