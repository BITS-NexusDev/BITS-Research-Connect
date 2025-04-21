
import React, { createContext, useContext, useState, useEffect } from "react";
import { ResearchPosition, Application } from "@/lib/types";
import { mockDataService } from "@/lib/mock-data";
import { useAuth } from "./AuthContext";

interface PositionsContextType {
  positions: ResearchPosition[];
  loading: boolean;
  error: string | null;
  getPositionById: (id: string) => ResearchPosition | undefined;
  createPosition: (data: Omit<ResearchPosition, 'id' | 'createdAt' | 'status' | 'professorId' | 'professorName'>) => Promise<ResearchPosition>;
  updatePosition: (id: string, data: Partial<ResearchPosition>) => Promise<ResearchPosition | undefined>;
  deletePosition: (id: string) => Promise<void>;
  getApplicationsForPosition: (positionId: string) => Application[];
  hasApplied: (positionId: string) => boolean;
  createApplication: (positionId: string, pitch: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: "pending" | "shortlisted" | "rejected") => Promise<void>;
  myPositions: ResearchPosition[]; // For professors
  myApplications: Application[]; // For students
  refreshPositions: () => void;
}

const PositionsContext = createContext<PositionsContextType | undefined>(undefined);

export const PositionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [positions, setPositions] = useState<ResearchPosition[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPositions = () => {
    setLoading(true);
    try {
      const allPositions = mockDataService.getPositions();
      setPositions(allPositions);
      
      const allApplications = mockDataService.getApplications();
      setApplications(allApplications);
    } catch (err) {
      console.error("Error fetching positions:", err);
      setError("Failed to fetch research positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPositions();
  }, [user]);

  const getPositionById = (id: string) => {
    return positions.find(p => p.id === id);
  };

  const createPosition = async (data: Omit<ResearchPosition, 'id' | 'createdAt' | 'status' | 'professorId' | 'professorName'>) => {
    if (!user || user.role !== "professor") {
      throw new Error("Only professors can create positions");
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = mockDataService.createPosition({
        ...data,
        professorId: user.id,
        professorName: user.fullName,
        department: user.department,
        status: "open"
      });
      
      if (result.success) {
        refreshPositions();
        return result.position;
      } else {
        throw new Error("Failed to create position");
      }
    } catch (err) {
      console.error("Create position failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create position");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePosition = async (id: string, data: Partial<ResearchPosition>) => {
    if (!user || user.role !== "professor") {
      throw new Error("Only professors can update positions");
    }

    const position = positions.find(p => p.id === id);
    if (!position || position.professorId !== user.id) {
      throw new Error("You don't have permission to update this position");
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = mockDataService.updatePosition(id, data);
      if (result.success) {
        refreshPositions();
        return result.position;
      }
      return undefined;
    } catch (err) {
      console.error("Update position failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update position");
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const deletePosition = async (id: string) => {
    if (!user || user.role !== "professor") {
      throw new Error("Only professors can delete positions");
    }

    const position = positions.find(p => p.id === id);
    if (!position || position.professorId !== user.id) {
      throw new Error("You don't have permission to delete this position");
    }

    setLoading(true);
    setError(null);
    
    try {
      await mockDataService.deletePosition(id);
      refreshPositions();
    } catch (err) {
      console.error("Delete position failed:", err);
      setError(err instanceof Error ? err.message : "Failed to delete position");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsForPosition = (positionId: string) => {
    if (!user || user.role !== "professor") {
      return [];
    }
    
    const position = positions.find(p => p.id === positionId);
    if (!position || position.professorId !== user.id) {
      return [];
    }
    
    return applications.filter(a => a.positionId === positionId);
  };

  const hasApplied = (positionId: string) => {
    if (!user || user.role !== "student") {
      return false;
    }
    
    return applications.some(a => a.positionId === positionId && a.studentId === user.id);
  };

  const createApplication = async (positionId: string, pitch: string) => {
    if (!user || user.role !== "student") {
      throw new Error("Only students can apply for positions");
    }

    setLoading(true);
    setError(null);
    
    try {
      if (hasApplied(positionId)) {
        throw new Error("You have already applied for this position");
      }
      
      const position = getPositionById(positionId);
      if (!position) {
        throw new Error("Position not found");
      }
      
      if (position.minimumCGPA > user.cgpa) {
        throw new Error(`Your CGPA (${user.cgpa}) does not meet the minimum requirement (${position.minimumCGPA})`);
      }
      
      const applicationData = {
        positionId,
        studentId: user.id,
        fullName: user.fullName,
        idNumber: user.idNumber,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
        btechBranch: user.btechBranch,
        dualDegree: user.dualDegree,
        minorDegree: user.minorDegree,
        cgpa: user.cgpa,
        pitch
      };
      
      await mockDataService.createApplication(applicationData);
      refreshPositions();
    } catch (err) {
      console.error("Application creation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to submit application");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: "pending" | "shortlisted" | "rejected") => {
    if (!user || user.role !== "professor") {
      throw new Error("Only professors can update application status");
    }

    const application = applications.find(a => a.id === applicationId);
    if (!application) {
      throw new Error("Application not found");
    }
    
    const position = positions.find(p => p.id === application.positionId);
    if (!position || position.professorId !== user.id) {
      throw new Error("You don't have permission to update this application");
    }

    setLoading(true);
    setError(null);
    
    try {
      await mockDataService.updateApplication(applicationId, { status });
      refreshPositions();
    } catch (err) {
      console.error("Update application status failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update application status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Filtered data based on user role
  const myPositions = user?.role === "professor" 
    ? positions.filter(p => p.professorId === user.id)
    : [];

  const myApplications = user?.role === "student" 
    ? applications.filter(a => a.studentId === user.id)
    : [];

  return (
    <PositionsContext.Provider
      value={{
        positions,
        loading,
        error,
        getPositionById,
        createPosition,
        updatePosition,
        deletePosition,
        getApplicationsForPosition,
        hasApplied,
        createApplication,
        updateApplicationStatus,
        myPositions,
        myApplications,
        refreshPositions
      }}
    >
      {children}
    </PositionsContext.Provider>
  );
};

export const usePositions = () => {
  const context = useContext(PositionsContext);
  if (context === undefined) {
    throw new Error("usePositions must be used within a PositionsProvider");
  }
  return context;
};
