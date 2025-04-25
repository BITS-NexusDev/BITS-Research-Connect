
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debug, setDebug] = useState<string | null>(null);
  const { toast } = useToast();
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith('@goa.bits-pilani.ac.in')) {
      toast({
        title: "Invalid Email",
        description: "Please use your BITS Pilani Goa campus email (@goa.bits-pilani.ac.in)",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setDebug(null);
      
      // Try to log in with Supabase directly
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data.user) {
        // Show debug information in development
        setDebug(`Authenticated with ID: ${data.user.id}`);
        console.log("Auth data:", data);
        
        toast({
          title: "Login Successful",
          description: "Welcome back to BITS Research Connect!",
        });
        
        // Redirect based on user role in the session
        const { data: userRoleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (roleError) {
          console.error("Error fetching user role:", roleError);
          setDebug(prev => `${prev}\nRole error: ${roleError.message}`);
        }
          
        if (userRoleData && userRoleData.role) {
          setDebug(prev => `${prev}\nRole: ${userRoleData.role}`);
          
          if (userRoleData.role === "student") {
            navigate("/student-dashboard");
          } else {
            navigate("/professor-dashboard");
          }
        } else {
          setDebug(prev => `${prev}\nNo role data found, checking tables directly`);
          
          // Check if user exists in students or professors table
          const { data: studentData } = await supabase
            .from('students')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
            
          const { data: professorData } = await supabase
            .from('professors')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (studentData) {
            setDebug(prev => `${prev}\nFound in students table`);
            navigate("/student-dashboard");
          } else if (professorData) {
            setDebug(prev => `${prev}\nFound in professors table`);
            navigate("/professor-dashboard");
          } else {
            // Fallback if we can't determine role
            setDebug(prev => `${prev}\nNot found in any table, redirecting to home`);
            navigate("/");
          }
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      
      setDebug(`Login error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bits-lightblue py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-bits-blue">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your BITS Pilani Goa campus email to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@goa.bits-pilani.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-bits-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-bits-blue hover:bg-bits-darkblue" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            
            {debug && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                <p className="font-bold mb-1">Debug Info:</p>
                {debug.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 mt-2 w-full">
            Don't have an account?{" "}
            <Link to="/register" className="text-bits-blue hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
