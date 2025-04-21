
import React from "react";
import { ResearchPosition, Application } from "@/lib/types";
import ResearchPositionCard from "@/components/ResearchPositionCard";

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
}

const PositionsList: React.FC<PositionsListProps> = ({
  positions,
  countsMap,
  applicationsMap,
  selectedPositionId,
  setSelectedPositionId,
  getStatusColor,
  handleStatusUpdate,
  handleDemoStatusUpdate
}) => (
  <div className="space-y-6">
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
      />
    ))}
  </div>
);

export default PositionsList;
