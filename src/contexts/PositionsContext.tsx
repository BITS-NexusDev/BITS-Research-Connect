import React, { createContext, useContext, useState, useEffect } from "react";
import { ResearchPosition, Application } from "@/lib/types";
import { mockDataService } from "@/lib/mock-data";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

      const mappedPositions: ResearchPosition[] = positionsData.map(p => ({
        id: p.id,
        professorId: p.professor_id,
        professorName: p.professor_name,
        researchArea: p.research_area,
        courseCode: p.course_code,
        credits: p.credits,
        semester: p.semester,
        prerequisites: p.prerequisites,
        minimumCGPA: p.minimum_cgpa,
        summary: p.summary,
        specificRequirements: p.specific_requirements,
        createdAt: new Date(p.created_at),
        status: p.status as "open" | "closed",
        department: p.department,
        eligibleBranches: p.eligible_branches,
        numberOfOpenings: p.number_of_openings,
        lastDateToApply: new Date(p.last_date_to_apply)
      }));

      const mappedApplications: Application[] = applicationsData.map(a => ({
        id: a.id,
        positionId: a.position_id,
        studentId: a.student_id,
        fullName: a.full_name,
        idNumber: a.id_number,
        email: a.email,
        btechBranch: a.btech_branch,
        dualDegree: a.dual_degree,
        minorDegree: a.minor_degree,
        whatsappNumber: a.whatsapp_number,
        cgpa: a.cgpa,
        pitch: a.pitch,
        status: a.status as "pending" | "shortlisted" | "rejected",
        createdAt: new Date(a.created_at)
      }));

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
      console.log("Creating position with data:", data);
      
      // Convert Date object to ISO string for Supabase
      const lastDateToApply = data.lastDateToApply instanceof Date 
        ? data.lastDateToApply.toISOString().split('T')[0]
        : data.lastDateToApply;

      const insertData = {
        professor_id: user.id,
        professor_name: user.fullName,
        research_area: data.researchArea,
        course_code: data.courseCode,
        credits: data.credits,
        semester: data.semester,
        prerequisites: data.prerequisites || null,
        minimum_cgpa: data.minimumCGPA,
        summary: data.summary,
        specific_requirements: data.specificRequirements || null,
        status: 'open',
        department: user.department,
        eligible_branches: data.eligibleBranches,
        number_of_openings: data.numberOfOpenings,
        last_date_to_apply: lastDateToApply
      };

      console.log("Sending data to Supabase:", insertData);

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
      
      const mappedPosition: ResearchPosition = {
        id: newPosition.id,
        professorId: newPosition.professor_id,
        professorName: newPosition.professor_name,
        researchArea: newPosition.research_area,
        courseCode: newPosition.course_code,
        credits: newPosition.credits,
        semester: newPosition.semester,
        prerequisites: newPosition.prerequisites,
        minimumCGPA: newPosition.minimum_cgpa,
        summary: newPosition.summary,
        specificRequirements: newPosition.specific_requirements,
        createdAt: new Date(newPosition.created_at),
        status: newPosition.status as "open" | "closed",
        department: newPosition.department,
        eligibleBranches: newPosition.eligible_branches,
        numberOfOpenings: newPosition.number_of_openings,
        lastDateToApply: new Date(newPosition.last_date_to_apply)
      };
      
      return mappedPosition;
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
      
      if (data.researchArea !== undefined) updateData.research_area = data.researchArea;
      if (data.courseCode !== undefined) updateData.course_code = data.courseCode;
      if (data.credits !== undefined) updateData.credits = data.credits;
      if (data.semester !== undefined) updateData.semester = data.semester;
      if (data.prerequisites !== undefined) updateData.prerequisites = data.prerequisites;
      if (data.minimumCGPA !== undefined) updateData.minimum_cgpa = data.minimumCGPA;
      if (data.summary !== undefined) updateData.summary = data.summary;
      if (data.specificRequirements !== undefined) updateData.specific_requirements = data.specificRequirements;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.eligibleBranches !== undefined) updateData.eligible_branches = data.eligibleBranches;
      if (data.numberOfOpenings !== undefined) updateData.number_of_openings = data.numberOfOpenings;
      if (data.lastDateToApply !== undefined) {
        // Convert Date object to ISO string for Supabase
        updateData.last_date_to_apply = data.lastDateToApply instanceof Date 
          ? data.lastDateToApply.toISOString().split('T')[0] 
          : data.lastDateToApply;
      }
      
      console.log("Sending update data to Supabase:", updateData);
      
      const { data: updatedPosition, error } = await supabase
        .from('research_positions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating position:", error);
        throw error;
      }
      
      console.log("Position updated successfully:", updatedPosition);
      await refreshPositions();
      
      const mappedPosition: ResearchPosition = {
        id: updatedPosition.id,
        professorId: updatedPosition.professor_id,
        professorName: updatedPosition.professor_name,
        researchArea: updatedPosition.research_area,
        courseCode: updatedPosition.course_code,
        credits: updatedPosition.credits,
        semester: updatedPosition.semester,
        prerequisites: updatedPosition.prerequisites,
        minimumCGPA: updatedPosition.minimum_cgpa,
        summary: updatedPosition.summary,
        specificRequirements: updatedPosition.specific_requirements,
        createdAt: new Date(updatedPosition.created_at),
        status: updatedPosition.status as "open" | "closed",
        department: updatedPosition.department,
        eligibleBranches: updatedPosition.eligible_branches,
        numberOfOpenings: updatedPosition.number_of_openings,
        lastDateToApply: new Date(updatedPosition.last_date_to_apply)
      };
      
      return mappedPosition;
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
        full_name: user.fullName,
        id_number: user.idNumber,
        email: user.email,
        whatsapp_number: user.whatsappNumber,
        btech_branch: user.btechBranch,
        dual_degree: user.dualDegree,
        minor_degree: user.minorDegree,
        cgpa: user.cgpa,
        pitch,
        resume_link: resumeLink,
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
