
import React from "react";
import { ResearchPosition, Application } from "@/lib/types";
import ResearchPositionCard from "@/components/ResearchPositionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Counts {
  total: number;
  pending: number;
  shortlisted: number;
  rejected: number;
}

interface PositionsListProps {
  positions: ResearchPosition[];
  countsMap: { [id: string]: Counts };
  applicationsMap: { [id: string]: Application[] };
  selectedPositionId: string | null;
  setSelectedPositionId: (id: string | null) => void;
  getStatusColor: (status: string) => string;
  handleStatusUpdate: (applicationId: string, status: "pending" | "shortlisted" | "rejected") => void;
  handleDemoStatusUpdate: (positionId: string, applicationId: string, status: "pending" | "shortlisted" | "rejected") => void;
  showingDemo?: boolean;
}

const PositionsList: React.FC<PositionsListProps> = ({
  positions,
  countsMap,
  applicationsMap,
  selectedPositionId,
  setSelectedPositionId,
  getStatusColor,
  handleStatusUpdate,
  handleDemoStatusUpdate,
  showingDemo = false
}) => (
  <div className="space-y-6">
    {showingDemo && (
      <Alert className="bg-bits-lightblue border-bits-blue">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a demo view showing sample research positions and applications. Post a real position to see your actual data.
        </AlertDescription>
      </Alert>
    )}
    
    {positions.map(position => (
      <ResearchPositionCard
        key={position.id}
        position={position}
        counts={countsMap[position.id]}
        applications={applicationsMap[position.id]}
        selectedPositionId={selectedPositionId}
        setSelectedPositionId={setSelectedPositionId}
        getStatusColor={getStatusColor}
        handleStatusUpdate={handleStatusUpdate}
        handleDemoStatusUpdate={handleDemoStatusUpdate}
        isDemo={position.id === "demo-position"}
      />
    ))}
  </div>
);

export default PositionsList;
