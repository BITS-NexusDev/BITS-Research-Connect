
import React, { useEffect } from "react";
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
}) => {
  const [open, setOpen] = React.useState(false);
  const isDemo = position.id.includes("demo");

  // Ensure applications are being shown for the position when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedPositionId(position.id);
      console.log(`Opening applications dialog for ${position.id}`);
      console.log("Applications:", applications);
    }
  }, [open, position.id, setSelectedPositionId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex-1 bg-bits-blue hover:bg-bits-darkblue"
          onClick={() => {
            console.log(`Opening dialog for position ${position.id}`);
            setSelectedPositionId(position.id);
          }}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Applications for {position.researchArea}</DialogTitle>
          <DialogDescription>
            {position.courseCode} • {position.credits} Credits • {position.semester}
            {isDemo && <span className="ml-2 text-bits-blue font-medium">(Demo Data)</span>}
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
                  {applications.map((app) => (
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
                          {app.id.includes("demo") || isDemo ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log(`Updating demo application ${app.id} to shortlisted`);
                                  handleDemoStatusUpdate(position.id, app.id, "shortlisted");
                                }}
                                disabled={app.status === "shortlisted"}
                              >
                                Shortlist
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log(`Updating demo application ${app.id} to rejected`);
                                  handleDemoStatusUpdate(position.id, app.id, "rejected");
                                }}
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
};

export default ApplicationsDialog;
