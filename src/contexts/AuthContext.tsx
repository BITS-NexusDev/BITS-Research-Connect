
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, StudentProfile, ProfessorProfile } from "@/lib/types";
import { mockDataService } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { generateUUID } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if there's a session with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // If we have a session, check if the user is in the user_roles table
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userRole) {
            // Based on the role, fetch the appropriate profile
            if (userRole.role === "student") {
              const { data: studentProfile } = await supabase
                .from('students')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (studentProfile) {
                console.log("Found student profile:", studentProfile);
                const studentUser: StudentProfile = {
                  id: studentProfile.id,
                  fullName: studentProfile.full_name,
                  idNumber: studentProfile.id_number,
                  email: studentProfile.email,
                  whatsappNumber: studentProfile.whatsapp_number || "",
                  role: "student",
                  createdAt: new Date(studentProfile.created_at),
                  cgpa: studentProfile.cgpa || 0,
                  btechBranch: studentProfile.btech_branch || "",
                  dualDegree: studentProfile.dual_degree || "",
                  minorDegree: studentProfile.minor_degree || "",
                };
                setUser(studentUser);
              }
            } else {
              const { data: professorProfile } = await supabase
                .from('professors')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (professorProfile) {
                console.log("Found professor profile:", professorProfile);
                const professorUser: ProfessorProfile = {
                  id: professorProfile.id,
                  fullName: professorProfile.full_name,
                  idNumber: professorProfile.id_number,
                  email: professorProfile.email,
                  whatsappNumber: professorProfile.whatsapp_number || "",
                  role: "professor",
                  createdAt: new Date(professorProfile.created_at),
                  designation: professorProfile.designation || "Assistant Professor",
                  department: professorProfile.department || "",
                  chamberNumber: professorProfile.chamber_number || "",
                  researchInterests: professorProfile.research_interests || [],
                };
                setUser(professorUser);
              }
            }
          } else {
            // Fallback to mock data if no user role found
            const currentUser = mockDataService.getCurrentUser();
            setUser(currentUser);
          }
        } else {
          // Fallback to mock data if no session
          const currentUser = mockDataService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Authentication check failed");
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in, update the user state
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear the user state
          setUser(null);
        }
      }
    );

    // Initial auth check
    checkAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Try to log in with Supabase
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data.user) {
        // Get user role
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (!userRole) {
          console.log("User role not found, trying mock service");
          // Try the mock service as fallback
          const response = await mockDataService.login(email, password);
          if (response.success) {
            if (
              response.user && 
              typeof response.user.id === 'string' && 
              response.user.role
            ) {
              setUser(response.user as User);
              return;
            } else {
              throw new Error("Invalid user data received");
            }
          } else {
            setError(response.error || "Login failed");
            throw new Error(response.error || "Login failed");
          }
        } else {
          // Based on the role, fetch the appropriate profile
          if (userRole.role === "student") {
            const { data: studentProfile } = await supabase
              .from('students')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (studentProfile) {
              console.log("Login successful, found student profile:", studentProfile);
              const studentUser: StudentProfile = {
                id: studentProfile.id,
                fullName: studentProfile.full_name,
                idNumber: studentProfile.id_number,
                email: studentProfile.email,
                whatsappNumber: studentProfile.whatsapp_number || "",
                role: "student",
                createdAt: new Date(studentProfile.created_at),
                cgpa: studentProfile.cgpa || 0,
                btechBranch: studentProfile.btech_branch || "",
                dualDegree: studentProfile.dual_degree || "",
                minorDegree: studentProfile.minor_degree || "",
              };
              setUser(studentUser);
            }
          } else {
            const { data: professorProfile } = await supabase
              .from('professors')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (professorProfile) {
              console.log("Login successful, found professor profile:", professorProfile);
              const professorUser: ProfessorProfile = {
                id: professorProfile.id,
                fullName: professorProfile.full_name,
                idNumber: professorProfile.id_number,
                email: professorProfile.email,
                whatsappNumber: professorProfile.whatsapp_number || "",
                role: "professor",
                createdAt: new Date(professorProfile.created_at),
                designation: professorProfile.designation || "Assistant Professor",
                department: professorProfile.department || "",
                chamberNumber: professorProfile.chamber_number || "",
                researchInterests: professorProfile.research_interests || [],
              };
              setUser(professorUser);
            }
          }
          return;
        }
      } else {
        // Fallback to mock service
        const response = await mockDataService.login(email, password);
        if (response.success) {
          if (
            response.user && 
            typeof response.user.id === 'string' && 
            response.user.role
          ) {
            setUser(response.user as User);
            return;
          } else {
            throw new Error("Invalid user data received");
          }
        } else {
          setError(response.error || "Login failed");
          throw new Error(response.error || "Login failed");
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Try to register with Supabase
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: userData.email!,
        password: password,
        options: {
          data: {
            fullName: userData.fullName,
            idNumber: userData.idNumber,
            email: userData.email,
            role: userData.role
          }
        }
      });
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data.user) {
        // Use the mock service to create a user profile for now
        // In a real app, you'd create a profile in Supabase
        const response = await mockDataService.register(userData);
        if (response.success) {
          if (
            response.user && 
            typeof response.user.id === 'string' && 
            response.user.role
          ) {
            setUser(response.user as User);
          } else {
            throw new Error("Invalid user data received");
          }
        } else {
          setError(response.error || "Registration failed");
        }
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Also perform mock logout
    mockDataService.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      setError("No user logged in");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Updating profile with data:", data);
      
      // Format the user ID as a UUID
      const formattedUserId = generateUUID(user.id);
      
      if (user.role === "student") {
        // Update student profile
        const updateData: any = {};
        
        // Add base user fields
        if (data.fullName) updateData.full_name = data.fullName;
        if (data.idNumber) updateData.id_number = data.idNumber;
        if (data.email) updateData.email = data.email;
        if (data.whatsappNumber) updateData.whatsapp_number = data.whatsappNumber;
        
        // Add student-specific fields
        if ((data as Partial<StudentProfile>).cgpa !== undefined) 
          updateData.cgpa = (data as Partial<StudentProfile>).cgpa;
        if ((data as Partial<StudentProfile>).btechBranch !== undefined) 
          updateData.btech_branch = (data as Partial<StudentProfile>).btechBranch;
        if ((data as Partial<StudentProfile>).dualDegree !== undefined) 
          updateData.dual_degree = (data as Partial<StudentProfile>).dualDegree;
        if ((data as Partial<StudentProfile>).minorDegree !== undefined) 
          updateData.minor_degree = (data as Partial<StudentProfile>).minorDegree;
        
        console.log("Prepared student update data:", updateData);
        
        // Update in Supabase
        const { error: supabaseError } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', formattedUserId);
          
        if (supabaseError) {
          console.error("Student update error:", supabaseError);
          
          // Fallback to mock service
          const response = await mockDataService.updateStudentProfile(
            user.id, 
            data as Partial<StudentProfile>
          );
          
          if (response.success) {
            setUser(response.profile as User);
          } else {
            setError(response.error || "Profile update failed");
          }
        } else {
          console.log("Student update successful, retrieving updated profile");
          // Update succeeded, get the updated profile
          const { data: updatedProfile, error: fetchError } = await supabase
            .from('students')
            .select('*')
            .eq('id', formattedUserId)
            .maybeSingle(); // Using maybeSingle instead of single to handle when no records are found
            
          if (fetchError) {
            console.error("Error fetching updated profile:", fetchError);
            // If we can't fetch the updated profile, update the local user object with the data we just sent
            const updatedStudentUser: StudentProfile = {
              ...user as StudentProfile,
              ...(data as Partial<StudentProfile>)
            };
            setUser(updatedStudentUser);
          } else if (updatedProfile) {
            console.log("Retrieved updated student profile:", updatedProfile);
            const updatedStudentUser: StudentProfile = {
              ...user as StudentProfile,
              fullName: updatedProfile.full_name || user.fullName,
              idNumber: updatedProfile.id_number || user.idNumber,
              email: updatedProfile.email || user.email,
              whatsappNumber: updatedProfile.whatsapp_number || user.whatsappNumber,
              cgpa: updatedProfile.cgpa || (user as StudentProfile).cgpa || 0,
              btechBranch: updatedProfile.btech_branch || (user as StudentProfile).btechBranch || "",
              dualDegree: updatedProfile.dual_degree || (user as StudentProfile).dualDegree || "",
              minorDegree: updatedProfile.minor_degree || (user as StudentProfile).minorDegree || "",
            };
            setUser(updatedStudentUser);
          } else {
            // No profile found, update the local user object with the data we just sent
            const updatedStudentUser: StudentProfile = {
              ...user as StudentProfile,
              ...(data as Partial<StudentProfile>)
            };
            setUser(updatedStudentUser);
          }
        }
      } else {
        // Update professor profile
        const updateData: any = {};
        
        // Add base user fields
        if (data.fullName) updateData.full_name = data.fullName;
        if (data.idNumber) updateData.id_number = data.idNumber;
        if (data.email) updateData.email = data.email;
        if (data.whatsappNumber) updateData.whatsapp_number = data.whatsappNumber;
        
        // Add professor-specific fields
        if ((data as Partial<ProfessorProfile>).designation !== undefined) 
          updateData.designation = (data as Partial<ProfessorProfile>).designation;
        if ((data as Partial<ProfessorProfile>).department !== undefined) 
          updateData.department = (data as Partial<ProfessorProfile>).department;
        if ((data as Partial<ProfessorProfile>).chamberNumber !== undefined) 
          updateData.chamber_number = (data as Partial<ProfessorProfile>).chamberNumber;
        if ((data as Partial<ProfessorProfile>).researchInterests !== undefined) 
          updateData.research_interests = (data as Partial<ProfessorProfile>).researchInterests;
        
        console.log("Prepared professor update data:", updateData);
        
        // Update in Supabase
        const { error: supabaseError } = await supabase
          .from('professors')
          .update(updateData)
          .eq('id', formattedUserId);
          
        if (supabaseError) {
          console.error("Professor update error:", supabaseError);
          
          // Fallback to mock service
          const response = await mockDataService.updateProfessorProfile(
            user.id, 
            data as Partial<ProfessorProfile>
          );
          
          if (response.success) {
            setUser(response.profile as User);
          } else {
            setError(response.error || "Profile update failed");
          }
        } else {
          console.log("Professor update successful, retrieving updated profile");
          // Update succeeded, get the updated profile
          const { data: updatedProfile, error: fetchError } = await supabase
            .from('professors')
            .select('*')
            .eq('id', formattedUserId)
            .maybeSingle(); // Using maybeSingle instead of single to handle when no records are found
            
          if (fetchError) {
            console.error("Error fetching updated profile:", fetchError);
            // If we can't fetch the updated profile, update the local user object with the data we just sent
            const updatedProfessorUser: ProfessorProfile = {
              ...user as ProfessorProfile,
              ...(data as Partial<ProfessorProfile>)
            };
            setUser(updatedProfessorUser);
          } else if (updatedProfile) {
            console.log("Retrieved updated professor profile:", updatedProfile);
            const updatedProfessorUser: ProfessorProfile = {
              ...user as ProfessorProfile,
              fullName: updatedProfile.full_name || user.fullName,
              idNumber: updatedProfile.id_number || user.idNumber,
              email: updatedProfile.email || user.email,
              whatsappNumber: updatedProfile.whatsapp_number || user.whatsappNumber,
              designation: updatedProfile.designation || (user as ProfessorProfile).designation || "Assistant Professor",
              department: updatedProfile.department || (user as ProfessorProfile).department || "",
              chamberNumber: updatedProfile.chamber_number || (user as ProfessorProfile).chamberNumber || "",
              researchInterests: updatedProfile.research_interests || [],
            };
            setUser(updatedProfessorUser);
          } else {
            // No profile found, update the local user object with the data we just sent
            const updatedProfessorUser: ProfessorProfile = {
              ...user as ProfessorProfile,
              ...(data as Partial<ProfessorProfile>)
            };
            setUser(updatedProfessorUser);
          }
        }
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      setError(err instanceof Error ? err.message : "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
