
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessorProfile as ProfessorProfileType } from "@/lib/types";

const designations = [
  "Professor",
  "Senior Professor",
  "Associate Professor",
  "Assistant Professor",
  "Junior Professor"
];

const departments = [
  "Computer Science",
  "Mechanical Engineering", 
  "Electrical and Electronics Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Economics",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biological Sciences",
  "Humanities and Social Sciences",
  "Pharmacy"
];

const ProfessorProfileSetup = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    designation: "",
    department: "",
    chamberNumber: "",
    whatsappNumber: "",
    researchInterests: ""  // Store as string in the form
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If not logged in or not a professor, redirect to login
    if (!user) {
      navigate("/login");
    } else if (user.role !== "professor") {
      navigate("/student-profile-setup");
    }
    
    // Pre-fill form if data exists
    if (user && user.role === "professor") {
      const professorUser = user as ProfessorProfileType;
      setFormData({
        designation: professorUser.designation || "",
        department: professorUser.department || "",
        chamberNumber: professorUser.chamberNumber || "",
        whatsappNumber: professorUser.whatsappNumber || "",
        // Convert array of research interests to comma-separated string for form display
        researchInterests: professorUser.researchInterests ? professorUser.researchInterests.join(", ") : ""
      });
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
    
    if (!formData.designation) {
      toast({
        title: "Missing Information",
        description: "Please select your designation",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.department) {
      toast({
        title: "Missing Information",
        description: "Please select your department",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare data for update
      const updateData: Partial<ProfessorProfileType> = {
        designation: formData.designation as ProfessorProfileType['designation'],
        department: formData.department,
        chamberNumber: formData.chamberNumber,
        whatsappNumber: formData.whatsappNumber
      };
      
      // Convert research interests from string to array for database storage
      if (formData.researchInterests) {
        // Split by commas and trim whitespace
        updateData.researchInterests = formData.researchInterests.split(",").map(item => item.trim());
      } else {
        // Empty array if no research interests
        updateData.researchInterests = [];
      }
      
      await updateProfile(updateData);
      
      toast({
        title: "Profile Updated",
        description: "Your faculty profile has been successfully saved.",
      });
      
      // Redirect to dashboard
      navigate("/professor-dashboard");
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
          <CardTitle className="text-2xl font-bold text-center text-bits-blue">Complete Your Faculty Profile</CardTitle>
          <CardDescription className="text-center">
            Fill in your professional details to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation*</Label>
              <Select 
                value={formData.designation} 
                onValueChange={(value) => handleSelectChange("designation", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department*</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chamberNumber">Chamber Number (Block and Room)*</Label>
              <Input
                id="chamberNumber"
                name="chamberNumber"
                placeholder="e.g., A-212"
                value={formData.chamberNumber}
                onChange={handleChange}
                required
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
              <Label htmlFor="researchInterests">Research Interests</Label>
              <Textarea
                id="researchInterests"
                name="researchInterests"
                placeholder="Describe your research interests and areas of expertise"
                value={formData.researchInterests}
                onChange={handleChange}
                rows={4}
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

export default ProfessorProfileSetup;
