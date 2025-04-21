
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/lib/types";
import { mockDataService } from "@/lib/mock-data";

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
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const currentUser = mockDataService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Authentication check failed");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mockDataService.login(email, password);
      if (response.success) {
        setUser(response.user);
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mockDataService.register(userData);
      if (response.success) {
        setUser(response.user);
      } else {
        setError(response.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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
      let response;
      if (user.role === "student") {
        response = await mockDataService.updateStudentProfile(user.id, data);
      } else {
        response = await mockDataService.updateProfessorProfile(user.id, data);
      }
      
      if (response.success) {
        setUser(response.profile);
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
