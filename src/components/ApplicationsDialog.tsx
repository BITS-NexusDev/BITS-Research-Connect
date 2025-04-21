
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Application, ResearchPosition } from "@/lib/types";

interface ApplicationsDialogProps {
  position: ResearchPosition;
  triggerLabel: React.ReactNode;
  applications: Application[];
  selectedPositionId: string | null;
  setSelectedPositionId: (id: string | null) => void;
  getStatusColor: (status: string) => string;
  handleStatusUpdate: (applicationId: string, status: "pending" | "shortlisted" | "rejected") => void;
  handleDemoStatusUpdate: (positionId: string, applicationId: string, status: "pending" | "shortlisted" | "rejected") => void;
}

const ApplicationsDialog: React.FC<ApplicationsDialogProps> = ({
  position,
  triggerLabel,
  applications,
  selectedPositionId,
  setSelectedPositionId,
  getStatusColor,
  handleStatusUpdate,
  handleDemoStatusUpdate,
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        className="flex-1 bg-bits-blue hover:bg-bits-darkblue"
        onClick={() => setSelectedPositionId(position.id)}
      >
        {triggerLabel}
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
        {applications.length === 0 ? (
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
                  applications.map((app) => (
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
                          {app.id.startsWith("demo-") ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDemoStatusUpdate(position.id, app.id, "shortlisted")
                                }
                                disabled={app.status === "shortlisted"}
                              >
                                Shortlist
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDemoStatusUpdate(position.id, app.id, "rejected")
                                }
                                className="text-bits-error border-bits-error hover:bg-red-50"
                                disabled={app.status === "rejected"}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
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
);

export default ApplicationsDialog;
