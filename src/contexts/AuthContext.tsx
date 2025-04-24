
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, StudentProfile, ProfessorProfile } from "@/lib/types";
import { mockDataService } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

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
          // If we have a session, fetch the user's profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            // Map the Supabase profile to our User type
            const mappedUser: User = {
              id: profile.id,
              fullName: profile.full_name,
              idNumber: profile.id_number,
              email: profile.email,
              whatsappNumber: profile.whatsapp_number || "",
              role: profile.role as UserRole,
              createdAt: new Date(profile.created_at),
              // Add role-specific fields
              ...(profile.role === "student" ? {
                cgpa: profile.cgpa || 0,
                btechBranch: profile.btech_branch,
                dualDegree: profile.dual_degree,
                minorDegree: profile.minor_degree,
              } : {
                designation: profile.designation,
                department: profile.department || "",
                chamberNumber: profile.chamber_number || "",
                researchInterests: profile.research_interests,
              })
            } as User;
            
            setUser(mappedUser);
          } else {
            // Fallback to mock data if no profile found
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
        // Fetch user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.log("Profile fetch error:", profileError);
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
        } else if (profile) {
          // Map the Supabase profile to our User type
          const mappedUser: User = {
            id: profile.id,
            fullName: profile.full_name,
            idNumber: profile.id_number,
            email: profile.email,
            whatsappNumber: profile.whatsapp_number || "",
            role: profile.role as UserRole,
            createdAt: new Date(profile.created_at),
            // Add role-specific fields
            ...(profile.role === "student" ? {
              cgpa: profile.cgpa || 0,
              btechBranch: profile.btech_branch,
              dualDegree: profile.dual_degree,
              minorDegree: profile.minor_degree,
            } : {
              designation: profile.designation,
              department: profile.department || "",
              chamberNumber: profile.chamber_number || "",
              researchInterests: profile.research_interests,
            })
          } as User;
          
          setUser(mappedUser);
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
      // Try to update profile in Supabase
      const updateData: any = {
        full_name: data.fullName,
        id_number: data.idNumber,
        email: data.email,
        whatsapp_number: data.whatsappNumber,
      };
      
      // Add role-specific fields
      if (user.role === "student") {
        updateData.cgpa = (data as Partial<StudentProfile>).cgpa;
        updateData.btech_branch = (data as Partial<StudentProfile>).btechBranch;
        updateData.dual_degree = (data as Partial<StudentProfile>).dualDegree;
        updateData.minor_degree = (data as Partial<StudentProfile>).minorDegree;
      } else {
        updateData.designation = (data as Partial<ProfessorProfile>).designation;
        updateData.department = (data as Partial<ProfessorProfile>).department;
        updateData.chamber_number = (data as Partial<ProfessorProfile>).chamberNumber;
        updateData.research_interests = (data as Partial<ProfessorProfile>).researchInterests;
      }
      
      // Update in Supabase
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (supabaseError) {
        console.error("Supabase update error:", supabaseError);
        
        // Fallback to mock service
        let response;
        if (user.role === "student") {
          response = await mockDataService.updateStudentProfile(
            user.id, 
            data as Partial<StudentProfile>
          );
        } else {
          response = await mockDataService.updateProfessorProfile(
            user.id, 
            data as Partial<ProfessorProfile>
          );
        }
        
        if (response.success) {
          setUser(response.profile);
        } else {
          setError(response.error || "Profile update failed");
        }
      } else {
        // Update succeeded, get the updated profile
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (updatedProfile) {
          // Map the Supabase profile to our User type
          const mappedUser: User = {
            ...user,
            ...data,
          };
          
          setUser(mappedUser);
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
