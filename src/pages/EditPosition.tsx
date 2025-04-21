
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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

const EditPosition = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const { user } = useAuth();
  const { getPositionById, updatePosition, deletePosition } = usePositions();
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
    specificRequirements: "",
    status: "open"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // If not logged in or not a professor, redirect to login
    if (!user) {
      navigate("/login");
      return;
    } else if (user.role !== "professor") {
      navigate("/student-dashboard");
      return;
    }
    
    // Fetch position data
    if (positionId) {
      const position = getPositionById(positionId);
      
      if (!position) {
        setError("Position not found");
        return;
      }
      
      if (position.professorId !== user.id) {
        setError("You don't have permission to edit this position");
        return;
      }
      
      setFormData({
        researchArea: position.researchArea || "",
        courseCode: position.courseCode || "",
        credits: position.credits?.toString() || "",
        semester: position.semester || "",
        prerequisites: position.prerequisites || "",
        minimumCGPA: position.minimumCGPA?.toString() || "",
        summary: position.summary || "",
        specificRequirements: position.specificRequirements || "",
        status: position.status || "open"
      });
    }
  }, [user, navigate, positionId, getPositionById]);

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
    
    if (!positionId) {
      toast({
        title: "Error",
        description: "Position ID is missing.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await updatePosition(positionId, {
        ...formData,
        credits: parseInt(formData.credits),
        minimumCGPA: cgpa,
        status: formData.status as "open" | "closed"
      });
      
      toast({
        title: "Position Updated",
        description: "Your research position has been successfully updated.",
      });
      
      // Redirect to dashboard
      navigate("/professor-dashboard");
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update research position. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!positionId) return;
    
    if (!window.confirm("Are you sure you want to delete this position? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      await deletePosition(positionId);
      
      toast({
        title: "Position Deleted",
        description: "Your research position has been successfully deleted.",
      });
      
      // Redirect to dashboard
      navigate("/professor-dashboard");
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete research position. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-bits-lightblue py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/professor-dashboard")}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bits-lightblue py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-bits-blue">
              Edit Research Position
            </CardTitle>
            <CardDescription className="text-center">
              Update the details of your research opportunity
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="status">Status*</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
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
              
              <div className="pt-4 flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-bits-error text-bits-error hover:bg-bits-error hover:text-white"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                >
                  {isDeleting ? "Deleting..." : "Delete Position"}
                </Button>
                
                <div className="space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/professor-dashboard")}
                    disabled={isSubmitting || isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-bits-blue hover:bg-bits-darkblue" 
                    disabled={isSubmitting || isDeleting}
                  >
                    {isSubmitting ? "Updating..." : "Update Position"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPosition;
