
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
  isDemo = false
}) => (
  <Card className={isDemo ? "border-bits-blue border-2" : ""}>
    <CardHeader>
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div>
          <CardTitle className="text-bits-blue">
            {position.researchArea}
            {isDemo && <span className="ml-2 text-sm bg-bits-lightblue text-bits-darkblue px-2 py-1 rounded-md">Demo</span>}
          </CardTitle>
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
      <ApplicationsDialog
        position={position}
        triggerLabel={`View Applications (${counts.total || applications.length})`}
        applications={applications}
        selectedPositionId={selectedPositionId}
        setSelectedPositionId={setSelectedPositionId}
        getStatusColor={getStatusColor}
        handleStatusUpdate={handleStatusUpdate}
        handleDemoStatusUpdate={handleDemoStatusUpdate}
      />
      {!isDemo && (
        <Button variant="outline" className="flex-1" asChild>
          <Link to={`/edit-position/${position.id}`}>Edit Position</Link>
        </Button>
      )}
      {isDemo && (
        <Button variant="outline" className="flex-1" asChild>
          <Link to="/create-position">Create Real Position</Link>
        </Button>
      )}
    </CardFooter>
  </Card>
);

export default ResearchPositionCard;
