
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePositions } from "@/contexts/PositionsContext";
import { useToast } from "@/hooks/use-toast";
import { Application, ProfessorProfile } from "@/lib/types";
import DashboardHeader from "@/components/professor-dashboard/DashboardHeader";
import PositionsList from "@/components/professor-dashboard/PositionsList";
import EmptyState from "@/components/professor-dashboard/EmptyState";

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
  const [demoAppStates, setDemoAppStates] = useState<{ [positionId: string]: Application[] }>({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "professor") {
      navigate("/student-dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Initialize demo applications for each position when positions load
    if (myPositions.length > 0) {
      const initialDemoStates: { [positionId: string]: Application[] } = {};
      myPositions.forEach(position => {
        const apps = getApplicationsForPosition(position.id);
        if (apps.length === 0) {
          initialDemoStates[position.id] = DEMO_APPLICATIONS.map((app, idx) => ({
            ...app,
            id: `demo-${position.id}-${idx}`,
            positionId: position.id,
          }));
        }
      });
      if (Object.keys(initialDemoStates).length > 0) {
        setDemoAppStates(prev => ({ ...prev, ...initialDemoStates }));
      }
    }
  }, [myPositions]);

  if (!user || user.role !== "professor") {
    return null;
  }

  const professor = user as ProfessorProfile;

  const getApplications = (positionId: string) => getApplicationsForPosition(positionId);

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

  // Helper: counts for all positions (to give to PositionsList as data object)
  const getApplicationCountsMap = () => {
    const map: { [id: string]: { total: number; pending: number; shortlisted: number; rejected: number } } = {};
    for (const position of myPositions) {
      const apps = getDisplayedApplications(position.id);
      map[position.id] = {
        total: apps.length,
        pending: apps.filter(a => a.status === "pending").length,
        shortlisted: apps.filter(a => a.status === "shortlisted").length,
        rejected: apps.filter(a => a.status === "rejected").length,
      };
    }
    return map;
  };

  // Helper: applications for all positions (including demos)
  const getApplicationsMap = () => {
    const map: { [id: string]: Application[] } = {};
    for (const position of myPositions) {
      map[position.id] = getDisplayedApplications(position.id);
    }
    return map;
  };

  // Use demo applications if none exist
  const getDisplayedApplications = (positionId: string) => {
    const realApps = getApplicationsForPosition(positionId);
    if (realApps.length > 0) return realApps;
    
    // If no real applications and no demo applications yet for this position, create them
    if (!demoAppStates[positionId]) {
      const demoForPosition = DEMO_APPLICATIONS.map((a, idx) => ({
        ...a,
        id: `demo-${positionId}-${idx}`,
        positionId,
      }));
      
      // Update the demo applications state
      setDemoAppStates(prev => {
        const newState = { ...prev, [positionId]: demoForPosition };
        console.log(`Adding demo applications for position ${positionId}:`, newState);
        return newState;
      });
      
      // Return the newly created demos
      return demoForPosition;
    }
    
    // Return existing demos for this position
    return demoAppStates[positionId] || [];
  };

  const handleDemoStatusUpdate = (
    positionId: string,
    applicationId: string,
    status: "pending" | "shortlisted" | "rejected"
  ) => {
    setDemoAppStates(prev => {
      const updated = {
        ...prev,
        [positionId]: (prev[positionId] || []).map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      };
      console.log(`Updated demo application ${applicationId} status to ${status}:`, updated[positionId]);
      return updated;
    });
    
    toast({
      title: "Demo Status Updated",
      description: `Demo application status updated to ${status}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader professor={professor} onLogout={logout} />

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
          <EmptyState />
        ) : (
          <PositionsList
            positions={myPositions}
            countsMap={getApplicationCountsMap()}
            applicationsMap={getApplicationsMap()}
            selectedPositionId={selectedPositionId}
            setSelectedPositionId={setSelectedPositionId}
            getStatusColor={getStatusColor}
            handleStatusUpdate={handleStatusUpdate}
            handleDemoStatusUpdate={handleDemoStatusUpdate}
          />
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;
