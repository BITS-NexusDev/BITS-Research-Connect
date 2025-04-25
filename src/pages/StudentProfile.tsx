
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { StudentProfile as StudentProfileType } from "@/lib/types";

const StudentProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    email: "",
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
      navigate("/professor-profile");
    }
    
    // Pre-fill form with existing data
    if (user && user.role === "student") {
      // Type assertion to access student-specific properties safely
      const studentUser = user as StudentProfileType;
      console.log("Loading student data into form:", user);
      setFormData({
        fullName: studentUser.fullName || "",
        idNumber: studentUser.idNumber || "",
        email: studentUser.email || "",
        btechBranch: studentUser.btechBranch || "",
        dualDegree: studentUser.dualDegree || "",
        minorDegree: studentUser.minorDegree || "",
        whatsappNumber: studentUser.whatsappNumber || "",
        cgpa: studentUser.cgpa?.toString() || ""
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
    if (formData.whatsappNumber && !/^\d{10}$/.test(formData.whatsappNumber)) {
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
      
      // Create a data object with only the fields that have changed
      const updateData: any = {};
      
      // Only include fields that have values and are different from the current user data
      if (formData.btechBranch !== user?.btechBranch) updateData.btechBranch = formData.btechBranch;
      if (formData.dualDegree !== user?.dualDegree) updateData.dualDegree = formData.dualDegree;
      if (formData.minorDegree !== user?.minorDegree) updateData.minorDegree = formData.minorDegree;
      if (formData.whatsappNumber !== user?.whatsappNumber) updateData.whatsappNumber = formData.whatsappNumber;
      if (cgpa !== user?.cgpa) updateData.cgpa = cgpa;
      
      console.log("Submitting student profile update with data:", updateData);
      
      await updateProfile(updateData);
      
      toast({
        title: "Profile Updated",
        description: "Your student profile has been successfully updated.",
      });
      
      // Redirect back to dashboard
      navigate("/student-dashboard");
    } catch (error) {
      console.error("Profile update error:", error);
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
    <div className="min-h-screen bg-bits-lightblue py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-bits-blue">Edit Student Profile</CardTitle>
            <CardDescription className="text-center">
              Update your academic information
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name*</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number*</Label>
                  <Input
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">BITS Email*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>
              </div>
              
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g., 8.5"
                    value={formData.cgpa}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/student-dashboard")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-bits-blue hover:bg-bits-darkblue" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
