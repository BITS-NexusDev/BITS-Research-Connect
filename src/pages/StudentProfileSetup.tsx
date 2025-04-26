
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const StudentProfileSetup = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    btechBranch: "",
    dualDegree: "",
    minorDegree: "",
    whatsappNumber: "",
    cgpa: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If not logged in or not a student, redirect to login
    if (!user) {
      navigate("/login");
    } else if (user.role !== "student") {
      navigate("/professor-profile-setup");
    }
    
    // Pre-fill form if data exists
    if (user && user.role === "student") {
      setFormData({
        btechBranch: user.btechBranch || "",
        dualDegree: user.dualDegree || "",
        minorDegree: user.minorDegree || "",
        whatsappNumber: user.whatsappNumber || "",
        cgpa: user.cgpa?.toString() || ""
      });
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate WhatsApp number (10 digits)
    if (!/^\d{10}$/.test(formData.whatsappNumber)) {
      toast({
        title: "Invalid WhatsApp Number",
        description: "Please enter a 10-digit WhatsApp number (without country code)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate CGPA
    const cgpa = parseFloat(formData.cgpa);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      toast({
        title: "Invalid CGPA",
        description: "Please enter a valid CGPA between 0 and 10",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await updateProfile({
        ...formData,
        cgpa
      });
      
      toast({
        title: "Profile Updated",
        description: "Your student profile has been successfully saved.",
      });
      
      // Redirect to dashboard
      navigate("/student-dashboard");
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bits-lightblue py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-bits-blue">Complete Your Student Profile</CardTitle>
          <CardDescription className="text-center">
            Fill in your academic details to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="btechBranch">B.Tech Branch (if any)</Label>
              <Input
                id="btechBranch"
                name="btechBranch"
                placeholder="e.g., Computer Science"
                value={formData.btechBranch}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dualDegree">Dual Degree (if any)</Label>
              <Input
                id="dualDegree"
                name="dualDegree"
                placeholder="e.g., MSc. Economics"
                value={formData.dualDegree}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minorDegree">Minor Degree (if any)</Label>
              <Input
                id="minorDegree"
                name="minorDegree"
                placeholder="e.g., Finance"
                value={formData.minorDegree}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number (10 digits)*</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                placeholder="e.g., 9876543210"
                value={formData.whatsappNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cgpa">Latest CGPA*</Label>
              <Input
                id="cgpa"
                name="cgpa"
                placeholder="e.g., 8.5"
                value={formData.cgpa}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-bits-blue hover:bg-bits-darkblue" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfileSetup;
