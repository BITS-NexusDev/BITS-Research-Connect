
export type UserRole = "student" | "professor";

export interface BaseUser {
  id: string;
  fullName: string;
  idNumber: string;
  email: string;
  whatsappNumber: string;
  role: UserRole;
  createdAt: Date;
}

export interface StudentProfile extends BaseUser {
  role: "student";
  btechBranch?: string;
  dualDegree?: string;
  minorDegree?: string;
  cgpa: number;
}

export interface ProfessorProfile extends BaseUser {
  role: "professor";
  designation: "Professor" | "Senior Professor" | "Associate Professor" | "Assistant Professor" | "Junior Professor";
  department: string;
  chamberNumber: string;
  researchInterests?: string;
}

export interface ResearchPosition {
  id: string;
  professorId: string;
  professorName: string;
  researchArea: string;
  courseCode: string;
  credits: number;
  semester: string;
  prerequisites?: string;
  minimumCGPA: number;
  summary: string;
  specificRequirements?: string;
  createdAt: Date;
  status: "open" | "closed";
  department: string; // Professor's department
}

export interface Application {
  id: string;
  positionId: string;
  studentId: string;
  fullName: string;
  idNumber: string;
  email: string;
  btechBranch?: string;
  dualDegree?: string;
  minorDegree?: string;
  whatsappNumber: string;
  cgpa: number;
  pitch: string;
  status: "pending" | "shortlisted" | "rejected";
  createdAt: Date;
}

export type User = StudentProfile | ProfessorProfile;
