import React, { createContext, useContext, useState, useEffect } from "react";
import { ResearchPosition, Application, DbResearchPosition, DbApplication } from "@/lib/types";
import { mockDataService } from "@/lib/mock-data";
import { useAuth } from "./AuthContext";
import { supabase, generateUUID } from "@/integrations/supabase/client";

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
  createApplication: (positionId: string, pitch: string, resumeLink: string) => Promise<void>;
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

  const mapDbPositionToAppPosition = (dbPosition: DbResearchPosition, professorName?: string): ResearchPosition => {
    return {
      id: dbPosition.id,
      professorId: dbPosition.professor_id,
      professorName: professorName || "Unknown Professor",
      researchArea: dbPosition.title,
      courseCode: dbPosition.description.split(' • ')[0] || dbPosition.description,
      credits: dbPosition.duration_months || 3,
      semester: "Current",
      prerequisites: dbPosition.requirements || undefined,
      minimumCGPA: parseFloat(dbPosition.requirements?.match(/CGPA: (\d+\.\d+)/)?.[1] || "7.5"),
      summary: dbPosition.description,
      specificRequirements: dbPosition.requirements,
      createdAt: new Date(dbPosition.created_at),
      status: dbPosition.status as "open" | "closed",
      department: dbPosition.department || "General",
      eligibleBranches: dbPosition.requirements?.split(',').map(s => s.trim()) || ["All Branches"],
      numberOfOpenings: dbPosition.number_of_openings || 1,
      lastDateToApply: new Date(dbPosition.deadline || Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  };

  const mapDbApplicationToAppApplication = async (dbApp: DbApplication): Promise<Application> => {
    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('id', dbApp.student_id)
      .single();
      
    return {
      id: dbApp.id,
      positionId: dbApp.position_id,
      studentId: dbApp.student_id,
      fullName: studentData?.full_name || "Unknown Student",
      idNumber: studentData?.id_number || "",
      email: studentData?.email || "",
      btechBranch: studentData?.btech_branch || undefined,
      dualDegree: studentData?.dual_degree || undefined,
      minorDegree: studentData?.minor_degree || undefined,
      whatsappNumber: studentData?.whatsapp_number || "",
      cgpa: studentData?.cgpa || 0,
      pitch: dbApp.cover_letter || "",
      status: dbApp.status as "pending" | "shortlisted" | "rejected",
      createdAt: new Date(dbApp.created_at)
    };
  };

  const refreshPositions = async () => {
    setLoading(true);
    try {
      console.log("Refreshing positions and applications data...");
      const { data: positionsData, error: positionsError } = await supabase
        .from('research_positions')
        .select('*');

      if (positionsError) {
        console.error("Error fetching positions:", positionsError);
        throw positionsError;
      }

      console.log("Positions data received:", positionsData);

      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*');

      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
        throw applicationsError;
      }

      console.log("Applications data received:", applicationsData);

      const professorIds = [...new Set(positionsData.map(p => p.professor_id))];
      const professorNamesMap: Record<string, string> = {};
      
      for (const profId of professorIds) {
        const { data: profData } = await supabase
          .from('professors')
          .select('full_name')
          .eq('id', profId)
          .single();
          
        if (profData) {
          professorNamesMap[profId] = profData.full_name;
        }
      }

      const mappedPositions: ResearchPosition[] = positionsData.map(p => 
        mapDbPositionToAppPosition(p, professorNamesMap[p.professor_id]));

      const mappedApplicationsPromises = applicationsData.map(mapDbApplicationToAppApplication);
      const mappedApplications = await Promise.all(mappedApplicationsPromises);

      setPositions(mappedPositions);
      setApplications(mappedApplications);
      console.log("Data refresh complete. Positions:", mappedPositions.length, "Applications:", mappedApplications.length);
    } catch (err) {
      console.error("Error in refreshPositions:", err);
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
      console.log("Creating position with data:", JSON.stringify(data, null, 2));
      
      const deadline = data.lastDateToApply instanceof Date 
        ? data.lastDateToApply.toISOString().split('T')[0]
        : data.lastDateToApply;

      const professorId = generateUUID(user.id);
      
      const insertData = {
        professor_id: professorId,
        title: data.researchArea,
        description: `${data.courseCode} • ${data.credits} credits • ${data.summary}`,
        requirements: `Minimum CGPA: ${data.minimumCGPA}, ${data.prerequisites || ''} ${data.specificRequirements || ''}`,
        status: 'open',
        department: data.department,
        number_of_openings: data.numberOfOpenings,
        deadline: deadline,
        duration_months: data.credits
      };

      console.log("Sending data to Supabase:", JSON.stringify(insertData, null, 2));

      const { data: newPosition, error } = await supabase
        .from('research_positions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Error creating position:", error);
        throw error;
      }
      
      console.log("Position created successfully:", newPosition);
      await refreshPositions();
      
      const createdPosition = positions.find(p => p.id === newPosition.id);
      if (!createdPosition) {
        throw new Error("Failed to retrieve created position");
      }
      
      return createdPosition;
    } catch (err) {
      console.error("Create position failed:", err);
      setError("Failed to create position");
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
      console.log("Updating position:", id, "with data:", data);
      
      const updateData: any = {};
      
      if (data.researchArea !== undefined) updateData.title = data.researchArea;
      if (data.summary !== undefined || data.courseCode !== undefined || data.credits !== undefined) {
        const currentPosition = positions.find(p => p.id === id);
        updateData.description = `${data.courseCode || currentPosition?.courseCode} • ${data.credits || currentPosition?.credits} credits • ${data.summary || currentPosition?.summary}`;
      }
      if (data.prerequisites !== undefined || data.specificRequirements !== undefined || data.minimumCGPA !== undefined) {
        const currentPosition = positions.find(p => p.id === id);
        updateData.requirements = `Minimum CGPA: ${data.minimumCGPA || currentPosition?.minimumCGPA}, ${data.prerequisites || currentPosition?.prerequisites || ''} ${data.specificRequirements || currentPosition?.specificRequirements || ''}`;
      }
      if (data.status !== undefined) updateData.status = data.status;
      if (data.numberOfOpenings !== undefined) updateData.number_of_openings = data.numberOfOpenings;
      if (data.lastDateToApply !== undefined) {
        updateData.deadline = data.lastDateToApply instanceof Date 
          ? data.lastDateToApply.toISOString().split('T')[0] 
          : data.lastDateToApply;
      }
      if (data.department !== undefined) updateData.department = data.department;
      if (data.credits !== undefined) updateData.duration_months = data.credits;
      
      console.log("Sending update data to Supabase:", updateData);
      
      const { error } = await supabase
        .from('research_positions')
        .update(updateData)
        .eq('id', id);
        
      if (error) {
        console.error("Error updating position:", error);
        throw error;
      }
      
      console.log("Position updated successfully");
      await refreshPositions();
      
      const updatedPosition = positions.find(p => p.id === id);
      return updatedPosition;
    } catch (err) {
      console.error("Update position failed:", err);
      setError("Failed to update position");
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const deletePosition = async (id: string) => {
    if (!user || user.role !== "professor") {
      throw new Error("Only professors can delete positions");
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Deleting position:", id);
      const { error } = await supabase
        .from('research_positions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting position:", error);
        throw error;
      }
      
      console.log("Position deleted successfully");
      refreshPositions();
    } catch (err) {
      console.error("Delete position failed:", err);
      setError("Failed to delete position");
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

  const createApplication = async (positionId: string, pitch: string, resumeLink: string) => {
    if (!user || user.role !== "student") {
      throw new Error("Only students can apply for positions");
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Creating application for position:", positionId);
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
        position_id: positionId,
        student_id: user.id,
        cover_letter: pitch,
        status: 'pending'
      };
      
      console.log("Sending application data to Supabase:", applicationData);
      
      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData);

      if (error) {
        console.error("Error creating application:", error);
        throw error;
      }
      
      console.log("Application created successfully");
      await refreshPositions();
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
      console.log("Updating application status:", applicationId, "to", status);
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) {
        console.error("Error updating application status:", error);
        throw error;
      }
      
      console.log("Application status updated successfully");
      await refreshPositions();
    } catch (err) {
      console.error("Update application status failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update application status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
