
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import ApplicationsDialog from "./ApplicationsDialog";
import { ResearchPosition, Application } from "@/lib/types";

interface Counts {
  total: number;
  pending: number;
  shortlisted: number;
  rejected: number;
}

interface ResearchPositionCardProps {
  position: ResearchPosition;
  counts: Counts;
  applications: Application[];
  selectedPositionId: string | null;
  setSelectedPositionId: (id: string | null) => void;
  getStatusColor: (status: string) => string;
  handleStatusUpdate: (applicationId: string, status: "pending" | "shortlisted" | "rejected") => void;
  handleDemoStatusUpdate: (positionId: string, applicationId: string, status: "pending" | "shortlisted" | "rejected") => void;
  isDemo?: boolean;
  onDelete?: (id: string) => void;
}

const ResearchPositionCard: React.FC<ResearchPositionCardProps> = ({
  position,
  counts,
  applications,
  selectedPositionId,
  setSelectedPositionId,
  getStatusColor,
  handleStatusUpdate,
  handleDemoStatusUpdate,
  isDemo,
  onDelete
}) => (
  <Card>
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
          <p className="text-sm font-medium text-gray-500">Department</p>
          <p>{position.department}</p>
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
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">Eligible Branches</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {position.eligibleBranches.map((branch) => (
            <Badge key={branch} variant="secondary">
              {branch}
            </Badge>
          ))}
        </div>
      </div>
      
      {position.prerequisites && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">Prerequisites</p>
          <p className="text-sm">{position.prerequisites}</p>
        </div>
      )}
      
      {position.specificRequirements && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">Specific Requirements</p>
          <p className="text-sm">{position.specificRequirements}</p>
        </div>
      )}
    </CardContent>
    
    <CardFooter className="flex flex-wrap gap-4 justify-between">
      <div className="flex flex-wrap gap-4">
        <ApplicationsDialog
          position={position}
          triggerLabel={`View Applications (${counts.total})`}
          applications={applications}
          selectedPositionId={selectedPositionId}
          setSelectedPositionId={setSelectedPositionId}
          getStatusColor={getStatusColor}
          handleStatusUpdate={handleStatusUpdate}
          handleDemoStatusUpdate={handleDemoStatusUpdate}
        />
      </div>
      
      {onDelete && (
        <Button 
          variant="outline"
          size="sm"
          className="text-bits-error border-bits-error hover:bg-red-50"
          onClick={() => onDelete(position.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      )}
    </CardFooter>
  </Card>
);

export default ResearchPositionCard;
