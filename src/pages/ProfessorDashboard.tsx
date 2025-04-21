
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { usePositions } from "@/contexts/PositionsContext";
import { useToast } from "@/hooks/use-toast";
import { Application, ProfessorProfile } from "@/lib/types";

const ProfessorDashboard = () => {
  const { user, logout } = useAuth();
  const { myPositions, getApplicationsForPosition, updateApplicationStatus, loading } = usePositions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  
  useEffect(() => {
    // If not logged in or not a professor, redirect to login
    if (!user) {
      navigate("/login");
    } else if (user.role !== "professor") {
      navigate("/student-dashboard");
    }
  }, [user, navigate]);

  if (!user || user.role !== "professor") {
    return null; // Wait for redirect
  }

  const professor = user as ProfessorProfile;

  // Get applications for selected position
  const getApplications = (positionId: string) => {
    return getApplicationsForPosition(positionId);
  };

  // Handle application status update
  const handleStatusUpdate = async (applicationId: string, status: "pending" | "shortlisted" | "rejected") => {
    try {
      await updateApplicationStatus(applicationId, status);
      
      toast({
        title: "Status Updated",
        description: `Application status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update application status. Please try again.",
        variant: "destructive"
      });
    }
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

  // Get application counts for a position
  const getApplicationCounts = (positionId: string) => {
    const applications = getApplications(positionId);
    const total = applications.length;
    const pending = applications.filter(a => a.status === "pending").length;
    const shortlisted = applications.filter(a => a.status === "shortlisted").length;
    const rejected = applications.filter(a => a.status === "rejected").length;
    
    return { total, pending, shortlisted, rejected };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-bits-blue text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">BITS Research Connect</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium">Welcome, {professor.fullName}</span>
            <Link to="/professor-profile" className="text-sm text-white hover:text-bits-lightblue transition-colors">
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-bits-darkblue mb-2">Research Positions Dashboard</h2>
            <p className="text-gray-600">
              Manage your research positions and student applications
            </p>
          </div>
          
          <Button className="mt-4 md:mt-0 bg-bits-blue hover:bg-bits-darkblue" asChild>
            <Link to="/create-position">Post New Research Position</Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your research positions...</p>
          </div>
        ) : myPositions.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Research Positions Found</CardTitle>
              <CardDescription>
                You haven't posted any research positions yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mt-4 bg-bits-blue hover:bg-bits-darkblue" asChild>
                <Link to="/create-position">Post Your First Research Position</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {myPositions.map(position => {
              const counts = getApplicationCounts(position.id);
              
              return (
                <Card key={position.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                      <div>
                        <CardTitle className="text-bits-blue">{position.researchArea}</CardTitle>
                        <CardDescription>
                          {position.courseCode} • {position.credits} Credits • {position.semester}
                        </CardDescription>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                        <Badge variant="outline" className="bg-bits-lightblue text-bits-darkblue">
                          {counts.total} Applications
                        </Badge>
                        {counts.total > 0 && (
                          <>
                            <Badge variant="outline" className="bg-bits-warning text-black">
                              {counts.pending} Pending
                            </Badge>
                            <Badge variant="outline" className="bg-bits-success text-white">
                              {counts.shortlisted} Shortlisted
                            </Badge>
                            <Badge variant="outline" className="bg-bits-error text-white">
                              {counts.rejected} Rejected
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700">Summary</h4>
                      <p className="text-sm mt-1">{position.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Prerequisites</p>
                        <p className="text-sm">{position.prerequisites || "None specified"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Minimum CGPA</p>
                        <p className="text-sm">{position.minimumCGPA}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date Posted</p>
                        <p className="text-sm">{new Date(position.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="text-sm">{position.status.toUpperCase()}</p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-wrap gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="flex-1 bg-bits-blue hover:bg-bits-darkblue"
                          onClick={() => setSelectedPositionId(position.id)}
                        >
                          View Applications ({counts.total})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Applications for {position.researchArea}</DialogTitle>
                          <DialogDescription>
                            {position.courseCode} • {position.credits} Credits • {position.semester}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          {counts.total === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500">No applications received yet.</p>
                            </div>
                          ) : (
                            <ScrollArea className="h-[400px] rounded-md border p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>CGPA</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedPositionId && 
                                    getApplications(selectedPositionId).map((app) => (
                                    <TableRow key={app.id}>
                                      <TableCell>
                                        <div className="font-medium">{app.fullName}</div>
                                        <div className="text-sm text-gray-500">{app.idNumber}</div>
                                      </TableCell>
                                      <TableCell>{app.cgpa}</TableCell>
                                      <TableCell>{app.btechBranch || "-"}</TableCell>
                                      <TableCell>
                                        <Badge className={getStatusColor(app.status)}>
                                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleStatusUpdate(app.id, "shortlisted")}
                                            disabled={app.status === "shortlisted"}
                                          >
                                            Shortlist
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleStatusUpdate(app.id, "rejected")}
                                            className="text-bits-error border-bits-error hover:bg-red-50"
                                            disabled={app.status === "rejected"}
                                          >
                                            Reject
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to={`/edit-position/${position.id}`}>Edit Position</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;
