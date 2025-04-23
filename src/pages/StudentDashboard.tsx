import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { usePositions } from "@/contexts/PositionsContext";
import { useToast } from "@/hooks/use-toast";
import { Application, ResearchPosition, StudentProfile } from "@/lib/types";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { positions, hasApplied, createApplication, myApplications, loading } = usePositions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Application form state
  const [selectedPosition, setSelectedPosition] = useState<ResearchPosition | null>(null);
  const [pitch, setPitch] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter state
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  useEffect(() => {
    // If not logged in or not a student, redirect to login
    if (!user) {
      navigate("/login");
    } else if (user.role !== "student") {
      navigate("/professor-dashboard");
    }
  }, [user, navigate]);

  if (!user || user.role !== "student") {
    return null; // Wait for redirect
  }

  const student = user as StudentProfile;

  // Get all unique departments for filter
  const departments = Array.from(new Set(positions.map(p => p.department)));
  
  // Filter positions based on department and search query
  const filteredPositions = positions.filter(position => {
    const matchesDepartment = departmentFilter === "all" || position.department === departmentFilter;
    const matchesSearch = position.researchArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         position.professorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         position.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  // Check if student meets CGPA requirement for position
  const isCgpaEligible = (position: ResearchPosition) => {
    return student.cgpa >= position.minimumCGPA;
  };

  // Handle application submission
  const handleApply = async () => {
    if (!selectedPosition) return;
    
    if (!resumeLink.startsWith('https://drive.google.com/')) {
      toast({
        title: "Invalid Resume Link",
        description: "Please provide a valid Google Drive link to your resume",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createApplication(selectedPosition.id, pitch, resumeLink);
      
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });
      
      // Reset form
      setSelectedPosition(null);
      setPitch("");
      setResumeLink("");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get application status for a position
  const getApplicationStatus = (positionId: string) => {
    const application = myApplications.find(a => a.positionId === positionId);
    return application ? application.status : null;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-bits-warning text-black";
      case "shortlisted": return "bg-bits-success";
      case "rejected": return "bg-bits-error";
      default: return "";
    }
  };

  // Fix for Element.click() TypeScript error
  const switchToPositionsTab = () => {
    const positionsTab = document.querySelector("[data-value='positions']") as HTMLElement;
    if (positionsTab) {
      positionsTab.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-bits-blue text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">BITS Research Connect</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium">Welcome, {student.fullName}</span>
            <Link to="/student-profile" className="text-sm text-white hover:text-bits-lightblue transition-colors">
              Edit Profile
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-white hover:bg-white hover:text-bits-blue transition-colors"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="positions">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="positions">Available Positions</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>
          
          {/* Available Positions Tab */}
          <TabsContent value="positions" className="mt-6">
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="w-full md:w-auto">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Department
                </label>
                <select
                  id="department"
                  className="w-full md:w-64 border border-gray-300 rounded-md p-2"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Search by research area, professor, or course code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading research positions...</p>
              </div>
            ) : filteredPositions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No research positions found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPositions.map(position => {
                  const isEligible = isCgpaEligible(position);
                  const hasAlreadyApplied = hasApplied(position.id);
                  const applicationStatus = getApplicationStatus(position.id);
                  
                  return (
                    <Card key={position.id} className={!isEligible ? "opacity-75" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-bits-blue text-lg">{position.researchArea}</CardTitle>
                            <CardDescription className="font-medium">{position.courseCode} • {position.credits} Credits</CardDescription>
                          </div>
                          
                          {applicationStatus && (
                            <Badge className={getStatusColor(applicationStatus)}>
                              {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500">Professor</p>
                          <p>{position.professorName}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500">Department</p>
                          <p>{position.department}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500">Semester</p>
                          <p>{position.semester}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500">Prerequisites</p>
                          <p>{position.prerequisites || "None specified"}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500">Minimum CGPA</p>
                          <p className={!isEligible ? "text-bits-error" : ""}>
                            {position.minimumCGPA} {!isEligible && "(You don't meet this requirement)"}
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500">Summary</p>
                          <p className="text-sm">{position.summary}</p>
                        </div>
                        
                        {position.specificRequirements && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Specific Requirements</p>
                            <p className="text-sm">{position.specificRequirements}</p>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter>
                        {hasAlreadyApplied ? (
                          <Button variant="secondary" disabled className="w-full">
                            Applied
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full bg-bits-blue hover:bg-bits-darkblue"
                                disabled={!isEligible}
                              >
                                {isEligible ? "Apply Now" : "Not Eligible"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Apply for Research Position</DialogTitle>
                                <DialogDescription>
                                  {position.researchArea} with {position.professorName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {/* Pre-filled Student Details */}
                                <div className="rounded-lg bg-muted p-4 space-y-3">
                                  <h4 className="font-medium text-sm">Your Details (will be shared with the professor)</h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Full Name</p>
                                      <p className="font-medium">{student.fullName}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">ID Number</p>
                                      <p className="font-medium">{student.idNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Email</p>
                                      <p className="font-medium">{student.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">WhatsApp</p>
                                      <p className="font-medium">{student.whatsappNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">CGPA</p>
                                      <p className="font-medium">{student.cgpa}</p>
                                    </div>
                                    {student.btechBranch && (
                                      <div>
                                        <p className="text-muted-foreground">B.Tech Branch</p>
                                        <p className="font-medium">{student.btechBranch}</p>
                                      </div>
                                    )}
                                    {student.dualDegree && (
                                      <div>
                                        <p className="text-muted-foreground">Dual Degree</p>
                                        <p className="font-medium">{student.dualDegree}</p>
                                      </div>
                                    )}
                                    {student.minorDegree && (
                                      <div>
                                        <p className="text-muted-foreground">Minor Degree</p>
                                        <p className="font-medium">{student.minorDegree}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Resume Link Input */}
                                <div>
                                  <Label htmlFor="resumeLink" className="text-sm font-medium mb-2">Resume Link (Google Drive)</Label>
                                  <Input
                                    id="resumeLink"
                                    placeholder="https://drive.google.com/file/d/..."
                                    value={resumeLink}
                                    onChange={(e) => setResumeLink(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Please share a Google Drive link to your resume
                                  </p>
                                </div>

                                {/* Pitch Text Area */}
                                <div>
                                  <Label htmlFor="pitch" className="text-sm font-medium mb-2">Your Pitch</Label>
                                  <Textarea
                                    id="pitch"
                                    placeholder="Explain why you're a good fit for this position..."
                                    value={pitch}
                                    onChange={(e) => setPitch(e.target.value)}
                                    rows={6}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  type="submit"
                                  className="bg-bits-blue hover:bg-bits-darkblue"
                                  disabled={!pitch.trim() || !resumeLink.trim() || isSubmitting}
                                  onClick={handleApply}
                                >
                                  {isSubmitting ? "Submitting..." : "Submit Application"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          {/* My Applications Tab */}
          <TabsContent value="applications" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading your applications...</p>
              </div>
            ) : myApplications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">You haven't applied to any research positions yet.</p>
                <Button className="mt-4 bg-bits-blue hover:bg-bits-darkblue" onClick={switchToPositionsTab}>
                  Browse Available Positions
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {myApplications.map(application => {
                  const position = positions.find(p => p.id === application.positionId);
                  if (!position) return null;
                  
                  return (
                    <Card key={application.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-bits-blue">{position.researchArea}</CardTitle>
                            <CardDescription>
                              {position.courseCode} • {position.professorName} • Applied on {new Date(application.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700">Your Pitch</h4>
                          <p className="text-sm mt-1">{application.pitch}</p>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Department</p>
                            <p>{position.department}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Semester</p>
                            <p>{position.semester}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Credits</p>
                            <p>{position.credits}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Minimum CGPA</p>
                            <p>{position.minimumCGPA}</p>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to={`/position/${position.id}`}>View Position Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
