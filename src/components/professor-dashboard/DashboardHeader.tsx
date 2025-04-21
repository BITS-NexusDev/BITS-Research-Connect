
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProfessorProfile } from "@/lib/types";

interface DashboardHeaderProps {
  professor: ProfessorProfile;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ professor, onLogout }) => (
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
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  </header>
);

export default DashboardHeader;

