import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { primaryDisciplineList, secondaryDisciplineList, minorList } from "@/lib/constants";

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
    if (!user) {
      navigate("/login");
    } else if (user.role !== "student") {
      navigate("/professor-profile-setup");
    }
    
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{10}$/.test(formData.whatsappNumber)) {
      toast({
        title: "Invalid WhatsApp Number",
        description: "Please enter a 10-digit WhatsApp number (without country code)",
        variant: "destructive"
      });
      return;
    }
    
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
              <Label htmlFor="btechBranch">B.Tech Branch*</Label>
              <Select 
                value={formData.btechBranch} 
                onValueChange={(value) => handleSelectChange("btechBranch", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your B.Tech branch" />
                </SelectTrigger>
                <SelectContent>
                  {primaryDisciplineList.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dualDegree">Dual Degree (if any)</Label>
              <Select 
                value={formData.dualDegree} 
                onValueChange={(value) => handleSelectChange("dualDegree", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your dual degree" />
                </SelectTrigger>
                <SelectContent>
                  {secondaryDisciplineList.map((degree) => (
                    <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minorDegree">Minor Degree (if any)</Label>
              <Select 
                value={formData.minorDegree} 
                onValueChange={(value) => handleSelectChange("minorDegree", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your minor" />
                </SelectTrigger>
                <SelectContent>
                  {minorList.map((minor) => (
                    <SelectItem key={minor} value={minor}>{minor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
