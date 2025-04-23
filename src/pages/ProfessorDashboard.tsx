
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

// Demo position for professors with no positions has been removed as per request
// We're no longer showing demo data

const ProfessorDashboard = () => {
  const { user, logout } = useAuth();
  const { myPositions, getApplicationsForPosition, updateApplicationStatus, loading } = usePositions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "professor") {
      navigate("/student-dashboard");
    }
  }, [user, navigate]);

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

  // Get applications for a position
  const getDisplayedApplications = (positionId: string) => {
    return getApplicationsForPosition(positionId);
  };

  // Helper: counts for all positions
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

  // Helper: applications for all positions
  const getApplicationsMap = () => {
    const map: { [id: string]: Application[] } = {};
    
    for (const position of myPositions) {
      map[position.id] = getDisplayedApplications(position.id);
    }
    
    return map;
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
            handleDemoStatusUpdate={() => {}}
          />
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;
