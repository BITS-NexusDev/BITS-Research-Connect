import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePositions } from "@/contexts/PositionsContext";
import { ProfessorProfile } from "@/lib/types";
import { courseCodeList, courseIDList, semesterList } from "@/lib/constants";

const credits = [1, 2, 3, 4, 5, 6, 9];

const CreatePosition = () => {
  const { user } = useAuth();
  const { createPosition } = usePositions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    researchArea: "",
    coursePrefix: "",
    courseNumber: "",
    credits: "",
    semester: "",
    prerequisites: "",
    minimumCGPA: "",
    summary: "",
    specificRequirements: "",
    eligibleBranches: [] as string[],
    numberOfOpenings: "1",
    lastDateToApply: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  React.useEffect(() => {
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
    
    if (!formData.researchArea || !formData.coursePrefix || !formData.courseNumber || !formData.credits || 
        !formData.semester || !formData.minimumCGPA || !formData.summary ||
        !formData.lastDateToApply || formData.eligibleBranches.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const cgpa = parseFloat(formData.minimumCGPA);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      toast({
        title: "Invalid CGPA",
        description: "Please enter a valid CGPA between 0 and 10.",
        variant: "destructive"
      });
      return;
    }

    if (!user || user.role !== 'professor') {
      toast({
        title: "Authentication Error",
        description: "You must be logged in as a professor to create a position.",
        variant: "destructive"
      });
      return;
    }

    const professorUser = user as ProfessorProfile;
    
    try {
      setIsSubmitting(true);
      
      await createPosition({
        ...formData,
        course_code: `${formData.coursePrefix} ${formData.courseNumber}`,
        credits: parseInt(formData.credits),
        minimumCGPA: parseFloat(formData.minimumCGPA),
        numberOfOpenings: parseInt(formData.numberOfOpenings),
        department: (user as ProfessorProfile).department,
        lastDateToApply: new Date(formData.lastDateToApply)
      });
      
      toast({
        title: "Position Created",
        description: "Your research position has been successfully posted.",
      });
      
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
                  <Label htmlFor="coursePrefix">Course Code*</Label>
                  <Select 
                    value={formData.coursePrefix}
                    onValueChange={(value) => handleSelectChange("coursePrefix", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select prefix" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseCodeList.map((code) => (
                        <SelectItem key={code} value={code}>{code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseNumber">Course Number*</Label>
                  <Select 
                    value={formData.courseNumber}
                    onValueChange={(value) => handleSelectChange("courseNumber", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseIDList.map((id) => (
                        <SelectItem key={id} value={id}>{id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {semesterList.map((semester) => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              
              <div className="space-y-2">
                <Label htmlFor="eligibleBranches">Eligible Branches*</Label>
                <div className="grid grid-cols-2 gap-2">
                  {bTechBranches.map((branch) => (
                    <div key={branch} className="flex items-center space-x-2">
                      <Checkbox
                        id={branch}
                        checked={formData.eligibleBranches.includes(branch)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            eligibleBranches: checked
                              ? [...prev.eligibleBranches, branch]
                              : prev.eligibleBranches.filter(b => b !== branch)
                          }));
                        }}
                      />
                      <label
                        htmlFor={branch}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {branch}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfOpenings">Number of Openings*</Label>
                  <Input
                    id="numberOfOpenings"
                    name="numberOfOpenings"
                    type="number"
                    min="1"
                    max="15"
                    value={formData.numberOfOpenings}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastDateToApply">Last Date to Apply*</Label>
                  <Input
                    id="lastDateToApply"
                    name="lastDateToApply"
                    type="date"
                    value={formData.lastDateToApply}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
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
