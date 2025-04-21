
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePositions } from "@/contexts/PositionsContext";

const credits = [1, 2, 3, 4, 5, 6, 9];
const semesters = [
  "Academic Year 24-25 Semester-1",
  "Academic Year 24-25 Semester-2",
  "Academic Year 25-26 Semester-1",
  "Academic Year 25-26 Semester-2"
];

const CreatePosition = () => {
  const { user } = useAuth();
  const { createPosition } = usePositions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    researchArea: "",
    courseCode: "",
    credits: "",
    semester: "",
    prerequisites: "",
    minimumCGPA: "",
    summary: "",
    specificRequirements: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  React.useEffect(() => {
    // If not logged in or not a professor, redirect to login
    if (!user) {
      navigate("/login");
    } else if (user.role !== "professor") {
      navigate("/student-dashboard");
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
    
    // Form validation
    if (!formData.researchArea || !formData.courseCode || !formData.credits || 
        !formData.semester || !formData.minimumCGPA || !formData.summary) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate CGPA (between 0 and 10)
    const cgpa = parseFloat(formData.minimumCGPA);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      toast({
        title: "Invalid CGPA",
        description: "Please enter a valid CGPA between 0 and 10.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createPosition({
        ...formData,
        credits: parseInt(formData.credits),
        minimumCGPA: cgpa
      });
      
      toast({
        title: "Position Created",
        description: "Your research position has been successfully posted.",
      });
      
      // Redirect to dashboard
      navigate("/professor-dashboard");
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create research position. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bits-lightblue py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-bits-blue">Post New Research Position</CardTitle>
            <CardDescription className="text-center">
              Create a new research opportunity for students
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="researchArea">Research Area*</Label>
                <Input
                  id="researchArea"
                  name="researchArea"
                  placeholder="e.g., Machine Learning"
                  value={formData.researchArea}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code*</Label>
                  <Input
                    id="courseCode"
                    name="courseCode"
                    placeholder="e.g., CS F266"
                    value={formData.courseCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits*</Label>
                  <Select 
                    value={formData.credits.toString()} 
                    onValueChange={(value) => handleSelectChange("credits", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select credits" />
                    </SelectTrigger>
                    <SelectContent>
                      {credits.map((credit) => (
                        <SelectItem key={credit} value={credit.toString()}>{credit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="semester">Semester*</Label>
                <Select 
                  value={formData.semester} 
                  onValueChange={(value) => handleSelectChange("semester", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prerequisites">Course Completion and Grade Prerequisites</Label>
                <Input
                  id="prerequisites"
                  name="prerequisites"
                  placeholder="e.g., Fluid Mechanics with Grade: B or above"
                  value={formData.prerequisites}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minimumCGPA">Minimum CGPA Requirement*</Label>
                <Input
                  id="minimumCGPA"
                  name="minimumCGPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g., 7.50"
                  value={formData.minimumCGPA}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Summary of Work*</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  placeholder="Describe the research work to be done"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specificRequirements">Specific Requirements (Optional)</Label>
                <Textarea
                  id="specificRequirements"
                  name="specificRequirements"
                  placeholder="Any specific skills, tools, or knowledge required"
                  value={formData.specificRequirements}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/professor-dashboard")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-bits-blue hover:bg-bits-darkblue" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Position"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePosition;
