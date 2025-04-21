import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { usePositions } from "@/contexts/PositionsContext";
import { useToast } from "@/hooks/use-toast";
import { Application, ProfessorProfile } from "@/lib/types";
import ResearchPositionCard from "@/components/ResearchPositionCard";

const DEMO_APPLICATIONS: Application[] = [
  {
    id: "demo-1",
    positionId: "demo",
    studentId: "S2023001",
    fullName: "Aarya Gupta",
    idNumber: "2023A7PS001G",
    email: "aarya.gupta@bits-demo.edu",
    whatsappNumber: "9876543210",
    btechBranch: "CSE",
    dualDegree: "",
    minorDegree: "Data Science",
    cgpa: 9.1,
    pitch: "I am passionate about research and have completed relevant projects.",
    status: "pending",
    createdAt: new Date(),
  },
  {
    id: "demo-2",
    positionId: "demo",
    studentId: "S2023022",
    fullName: "Rahul Sen",
    idNumber: "2023A7PS022G",
    email: "rahul.sen@bits-demo.edu",
    whatsappNumber: "9123456789",
    btechBranch: "EEE",
    dualDegree: "MSc Chemistry",
    minorDegree: "",
    cgpa: 8.7,
    pitch: "Strong interest in your research area, and a good track record in circuits.",
    status: "pending",
    createdAt: new Date(),
  }
];

const ProfessorDashboard = () => {
  const { user, logout } = useAuth();
  const { myPositions, getApplicationsForPosition, updateApplicationStatus, loading } = usePositions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [demoAppStates, setDemoAppStates] = useState<{
    [positionId: string]: Application[]
  }>({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "professor") {
      navigate("/student-dashboard");
    }
  }, [user, navigate]);

  if (!user || user.role !== "professor") {
    return null; // Wait for redirect
  }

  const professor = user as ProfessorProfile;

  const getApplications = (positionId: string) => {
    return getApplicationsForPosition(positionId);
  };

  const handleStatusUpdate = async (applicationId: string, status: "pending" | "shortlisted" | "rejected") => {
    try {
      await updateApplicationStatus(applicationId, status);
      
      toast({
        title: "Status Updated",
        description: `Application status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update application status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-bits-warning text-black";
      case "shortlisted": return "bg-bits-success";
      case "rejected": return "bg-bits-error";
      default: return "";
    }
  };

  const getApplicationCounts = (positionId: string) => {
    const applications = getApplications(positionId);
    const total = applications.length;
    const pending = applications.filter(a => a.status === "pending").length;
    const shortlisted = applications.filter(a => a.status === "shortlisted").length;
    const rejected = applications.filter(a => a.status === "rejected").length;
    
    return { total, pending, shortlisted, rejected };
  };

  const getDisplayedApplications = (positionId: string) => {
    const realApps = getApplicationsForPosition(positionId);
    if (realApps.length > 0) {
      return realApps;
    }
    if (!demoAppStates[positionId]) {
      const demoForPosition = DEMO_APPLICATIONS.map((a, idx) => ({
        ...a,
        id: `demo-${positionId}-${idx}`,
        positionId,
      }));
      setDemoAppStates(prev => ({ ...prev, [positionId]: demoForPosition }));
      return demoForPosition;
    }
    return demoAppStates[positionId];
  };

  const handleDemoStatusUpdate = (positionId: string, applicationId: string, status: "pending" | "shortlisted" | "rejected") => {
    setDemoAppStates(prev => ({
      ...prev,
      [positionId]: prev[positionId].map(app =>
        app.id === applicationId ? { ...app, status } : app
      )
    }));
    toast({
      title: "Demo Status Updated",
      description: `Demo application status updated to ${status}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-bits-blue text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">BITS Research Connect</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium">Welcome, {professor.fullName}</span>
            <Link to="/professor-profile" className="text-sm text-white hover:text-bits-lightblue transition-colors">
              Edit Profile
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-white hover:bg-white hover:text-bits-blue transition-colors"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-bits-darkblue mb-2">Research Positions Dashboard</h2>
            <p className="text-gray-600">
              Manage your research positions and student applications
            </p>
          </div>
          
          <Button className="mt-4 md:mt-0 bg-bits-blue hover:bg-bits-darkblue" asChild>
            <Link to="/create-position">Post New Research Position</Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your research positions...</p>
          </div>
        ) : myPositions.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Research Positions Found</CardTitle>
              <CardDescription>
                You haven't posted any research positions yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mt-4 bg-bits-blue hover:bg-bits-darkblue" asChild>
                <Link to="/create-position">Post Your First Research Position</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {myPositions.map(position => {
              const counts = getApplicationCounts(position.id);
              const displayedApplications = getDisplayedApplications(position.id);
              return (
                <ResearchPositionCard
                  key={position.id}
                  position={position}
                  counts={counts}
                  applications={displayedApplications}
                  selectedPositionId={selectedPositionId}
                  setSelectedPositionId={setSelectedPositionId}
                  getStatusColor={getStatusColor}
                  handleStatusUpdate={handleStatusUpdate}
                  handleDemoStatusUpdate={handleDemoStatusUpdate}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;
