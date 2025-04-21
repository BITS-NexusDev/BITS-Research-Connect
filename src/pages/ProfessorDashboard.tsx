
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePositions } from "@/contexts/PositionsContext";
import { useToast } from "@/hooks/use-toast";
import { Application, ProfessorProfile, ResearchPosition } from "@/lib/types";
import DashboardHeader from "@/components/professor-dashboard/DashboardHeader";
import PositionsList from "@/components/professor-dashboard/PositionsList";
import EmptyState from "@/components/professor-dashboard/EmptyState";

// Demo position for professors with no positions
const DEMO_POSITION: ResearchPosition = {
  id: "demo-position",
  professorId: "demo",
  professorName: "Demo Professor",
  researchArea: "Machine Learning for Computer Vision",
  courseCode: "CS F266",
  credits: 3,
  semester: "Academic Year 24-25 Semester-1",
  prerequisites: "CS F111 with Grade: A or above",
  minimumCGPA: 8.0,
  summary: "Development of deep learning models for image classification and object detection.",
  specificRequirements: "Proficiency in Python and PyTorch/TensorFlow is required.",
  createdAt: new Date(),
  status: "open",
  department: "Computer Science"
};

// Demo applications
const DEMO_APPLICATIONS: Application[] = [
  {
    id: "demo-1",
    positionId: "demo-position",
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
    positionId: "demo-position",
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
  const [showDemoPosition, setShowDemoPosition] = useState(false);
  
  // Combined positions (real + demo if needed)
  const [displayPositions, setDisplayPositions] = useState<ResearchPosition[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "professor") {
      navigate("/student-dashboard");
    }
  }, [user, navigate]);

  // Handle positions and demo data
  useEffect(() => {
    if (loading) return;
    
    // If no real positions, show demo position
    if (myPositions.length === 0) {
      console.log("No real positions, showing demo position");
      setShowDemoPosition(true);
      setDisplayPositions([DEMO_POSITION]);
      
      // Initialize demo applications for the demo position
      setDemoAppStates({
        "demo-position": DEMO_APPLICATIONS
      });
    } else {
      console.log(`Found ${myPositions.length} real positions, hiding demo`);
      setShowDemoPosition(false);
      setDisplayPositions(myPositions);
    }
  }, [myPositions, loading]);

  if (!user || user.role !== "professor") {
    return null;
  }

  const professor = user as ProfessorProfile;

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

  // Get applications for a position (real or demo)
  const getDisplayedApplications = (positionId: string) => {
    // For demo position, return demo applications
    if (positionId === "demo-position") {
      return demoAppStates["demo-position"] || DEMO_APPLICATIONS;
    }
    
    // For real positions, get real applications
    const realApps = getApplicationsForPosition(positionId);
    return realApps;
  };

  // Handle demo application status updates
  const handleDemoStatusUpdate = (
    positionId: string,
    applicationId: string,
    status: "pending" | "shortlisted" | "rejected"
  ) => {
    setDemoAppStates(prev => {
      const updated = {
        ...prev,
        [positionId]: (prev[positionId] || DEMO_APPLICATIONS).map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      };
      console.log(`Updated demo application ${applicationId} status to ${status}`);
      return updated;
    });
    
    toast({
      title: "Status Updated",
      description: `Application status updated to ${status}`,
    });
  };

  // Helper: counts for all positions
  const getApplicationCountsMap = () => {
    const map: { [id: string]: { total: number; pending: number; shortlisted: number; rejected: number } } = {};
    
    for (const position of displayPositions) {
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
    
    for (const position of displayPositions) {
      map[position.id] = getDisplayedApplications(position.id);
    }
    
    return map;
  };

  console.log("Display positions:", displayPositions);
  console.log("Show demo:", showDemoPosition);

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
        ) : !showDemoPosition && myPositions.length === 0 ? (
          <EmptyState />
        ) : (
          <PositionsList
            positions={displayPositions}
            countsMap={getApplicationCountsMap()}
            applicationsMap={getApplicationsMap()}
            selectedPositionId={selectedPositionId}
            setSelectedPositionId={setSelectedPositionId}
            getStatusColor={getStatusColor}
            handleStatusUpdate={handleStatusUpdate}
            handleDemoStatusUpdate={handleDemoStatusUpdate}
            showingDemo={showDemoPosition}
          />
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;
