
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EmptyState: React.FC = () => (
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
);

export default EmptyState;
