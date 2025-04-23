import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePositions } from "@/contexts/PositionsContext";

const BrowsePositions = () => {
  const { positions, loading } = usePositions();
  
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const departments = Array.from(new Set(positions.map(p => p.department)));
  
  const filteredPositions = positions.filter(position => {
    const matchesDepartment = departmentFilter === "all" || position.department === departmentFilter;
    const matchesSearch = position.researchArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         position.professorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         position.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (position.summary && position.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDepartment && matchesSearch && position.status === "open";
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-bits-blue text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">BITS Research Connect</h1>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-white hover:bg-white hover:text-bits-blue transition-colors mr-2"
              asChild
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button 
              size="sm" 
              className="bg-white text-bits-blue hover:bg-bits-lightblue"
              asChild
            >
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-bits-darkblue mb-6">Browse Research Positions</h2>
          
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Department
                </Label>
                <Select 
                  value={departmentFilter} 
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </Label>
                <Input
                  id="search"
                  type="text"
                  className="w-full"
                  placeholder="Search by research area, professor, or course code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Showing {filteredPositions.length} open position{filteredPositions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading research positions...</p>
            </div>
          ) : filteredPositions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No open research positions found matching your criteria.</p>
              <Button className="mt-4" variant="outline" onClick={() => {
                setDepartmentFilter("all");
                setSearchQuery("");
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPositions.map(position => (
                <Card key={position.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-bits-blue">{position.researchArea}</CardTitle>
                        <CardDescription>{position.courseCode} • {position.credits} Credits</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-bits-lightblue text-bits-darkblue">
                        {position.department}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Professor</p>
                        <p>{position.professorName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Semester</p>
                        <p>{position.semester}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Minimum CGPA</p>
                        <p>{position.minimumCGPA}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Number of Openings</p>
                        <p>{position.numberOfOpenings}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Date to Apply</p>
                        <p>{new Date(position.lastDateToApply).toLocaleDateString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Eligible Branches</p>
                        <div className="flex flex-wrap gap-1">
                          {position.eligibleBranches.map(branch => (
                            <Badge key={branch} variant="secondary" className="text-xs">
                              {branch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Summary</p>
                      <p className="text-sm">{position.summary}</p>
                    </div>
                    
                    {position.prerequisites && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500">Prerequisites</p>
                        <p className="text-sm">{position.prerequisites}</p>
                      </div>
                    )}
                    
                    {position.specificRequirements && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Specific Requirements</p>
                        <p className="text-sm">{position.specificRequirements}</p>
                      </div>
                    )}
                    
                    <div className="mt-6 text-center">
                      <Button className="bg-bits-blue hover:bg-bits-darkblue" asChild>
                        <Link to="/register">Register to Apply</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="mb-4 text-gray-700">Create an account to apply for research positions</p>
            <div className="space-x-4">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="bg-bits-blue hover:bg-bits-darkblue" asChild>
                <Link to="/register">Register Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-bits-darkblue text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} BITS Research Connect - BITS Pilani, Goa Campus
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BrowsePositions;
