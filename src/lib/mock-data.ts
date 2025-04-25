import { Application, ProfessorProfile, ResearchPosition, StudentProfile } from "./types";

// Mock student profiles
export const mockStudents: StudentProfile[] = [
  {
    id: "s1",
    fullName: "Aaditya Sharma",
    idNumber: "2021A7PS0001G",
    email: "f20210001@goa.bits-pilani.ac.in",
    whatsappNumber: "9876543210",
    role: "student",
    btechBranch: "Computer Science",
    dualDegree: "MSc. Economics",
    cgpa: 9.2,
    createdAt: new Date("2023-07-01")
  },
  {
    id: "s2",
    fullName: "Priya Patel",
    idNumber: "2021A3PS0042G",
    email: "f20210042@goa.bits-pilani.ac.in",
    whatsappNumber: "9876543211",
    role: "student",
    btechBranch: "Mechanical Engineering",
    minorDegree: "Finance",
    cgpa: 8.7,
    createdAt: new Date("2023-07-02")
  },
  {
    id: "s3",
    fullName: "Rahul Gupta",
    idNumber: "2022A8PS0103G",
    email: "f20220103@goa.bits-pilani.ac.in",
    whatsappNumber: "9876543212",
    role: "student",
    btechBranch: "Electronics and Communication",
    cgpa: 8.1,
    createdAt: new Date("2023-07-03")
  }
];

// Mock professor profiles
export const mockProfessors: ProfessorProfile[] = [
  {
    id: "p1",
    fullName: "Dr. Anand Mishra",
    idNumber: "PROF001",
    email: "anand@goa.bits-pilani.ac.in",
    whatsappNumber: "9876543213",
    role: "professor",
    designation: "Professor",
    department: "Computer Science",
    chamberNumber: "A-212",
    researchInterests: ["Machine Learning", "Computer Vision", "Natural Language Processing"],
    createdAt: new Date("2023-01-01")
  },
  {
    id: "p2",
    fullName: "Dr. Sunita Verma",
    idNumber: "PROF002",
    email: "sunita@goa.bits-pilani.ac.in",
    whatsappNumber: "9876543214",
    role: "professor",
    designation: "Associate Professor",
    department: "Mechanical Engineering",
    chamberNumber: "B-113",
    researchInterests: ["Fluid Dynamics", "Thermal Engineering"],
    createdAt: new Date("2023-01-02")
  },
  {
    id: "p3",
    fullName: "Dr. Rajesh Kumar",
    idNumber: "PROF003",
    email: "rajesh@goa.bits-pilani.ac.in",
    whatsappNumber: "9876543215",
    role: "professor",
    designation: "Assistant Professor",
    department: "Economics",
    chamberNumber: "C-302",
    researchInterests: ["Macroeconomics", "Development Economics"],
    createdAt: new Date("2023-01-03")
  }
];

// Mock research positions
export const mockPositions: ResearchPosition[] = [
  {
    id: "pos1",
    professorId: "p1",
    professorName: "Dr. Anand Mishra",
    researchArea: "Machine Learning",
    courseCode: "CS F266",
    credits: 3,
    semester: "Academic Year 24-25 Semester-1",
    prerequisites: "CS F111 with Grade: A or above",
    minimumCGPA: 8.0,
    summary: "Development of deep learning models for image classification and object detection.",
    specificRequirements: "Proficiency in Python and PyTorch/TensorFlow is required.",
    createdAt: new Date("2024-04-01"),
    status: "open",
    department: "Computer Science",
    eligibleBranches: ["A5 - Computer Science", "A7 - Electronics & Communication"],
    numberOfOpenings: 2,
    lastDateToApply: new Date("2024-06-30")
  },
  {
    id: "pos2",
    professorId: "p2",
    professorName: "Dr. Sunita Verma",
    researchArea: "Computational Fluid Dynamics",
    courseCode: "ME F266",
    credits: 4,
    semester: "Academic Year 24-25 Semester-1",
    prerequisites: "ME F211 (Fluid Mechanics) with Grade: B or above",
    minimumCGPA: 7.5,
    summary: "Simulation of fluid flow and heat transfer in microchannels.",
    createdAt: new Date("2024-04-02"),
    status: "open",
    department: "Mechanical Engineering",
    eligibleBranches: ["A2 - Civil", "A4 - Mechanical"],
    numberOfOpenings: 3,
    lastDateToApply: new Date("2024-07-15")
  },
  {
    id: "pos3",
    professorId: "p3",
    professorName: "Dr. Rajesh Kumar",
    researchArea: "Econometric Analysis",
    courseCode: "ECON F266",
    credits: 3,
    semester: "Academic Year 24-25 Semester-2",
    prerequisites: "ECON F111 with Grade: B or above",
    minimumCGPA: 7.0,
    summary: "Statistical analysis of economic data using regression models.",
    specificRequirements: "Familiarity with statistical software (R/STATA) is preferred.",
    createdAt: new Date("2024-04-03"),
    status: "open",
    department: "Economics",
    eligibleBranches: ["A1 - Chemical", "A5 - Computer Science"],
    numberOfOpenings: 1,
    lastDateToApply: new Date("2024-08-01")
  },
  {
    id: "pos4",
    professorId: "p1",
    professorName: "Dr. Anand Mishra",
    researchArea: "Natural Language Processing",
    courseCode: "CS F367",
    credits: 3,
    semester: "Academic Year 24-25 Semester-2",
    prerequisites: "CS F266 with Grade: B or above",
    minimumCGPA: 7.5,
    summary: "Research on transformer models for Indian languages.",
    specificRequirements: "Experience with PyTorch and transformers library preferred.",
    createdAt: new Date("2024-04-04"),
    status: "open",
    department: "Computer Science",
    eligibleBranches: ["A5 - Computer Science", "A7 - Electronics & Communication"],
    numberOfOpenings: 2,
    lastDateToApply: new Date("2024-08-15")
  },
  {
    id: "pos5",
    professorId: "p2",
    professorName: "Dr. Sunita Verma",
    researchArea: "Renewable Energy Systems",
    courseCode: "ME F366",
    credits: 4,
    semester: "Academic Year 24-25 Semester-2",
    prerequisites: "ME F266 with Grade: B or above",
    minimumCGPA: 7.0,
    summary: "Design and optimization of solar thermal systems.",
    createdAt: new Date("2024-04-05"),
    status: "open",
    department: "Mechanical Engineering",
    eligibleBranches: ["A4 - Mechanical", "A3 - Chemical"],
    numberOfOpenings: 1,
    lastDateToApply: new Date("2024-08-30")
  }
];

// Mock applications
export const mockApplications: Application[] = [
  {
    id: "app1",
    positionId: "pos1",
    studentId: "s1",
    fullName: "Aaditya Sharma",
    idNumber: "2021A7PS0001G",
    email: "f20210001@goa.bits-pilani.ac.in",
    btechBranch: "Computer Science",
    dualDegree: "MSc. Economics",
    whatsappNumber: "9876543210",
    cgpa: 9.2,
    pitch: "I have experience in machine learning projects and have worked with PyTorch for image classification tasks. I am excited to contribute to research in this field.",
    status: "pending",
    createdAt: new Date("2024-04-10")
  },
  {
    id: "app2",
    positionId: "pos2",
    studentId: "s3",
    fullName: "Rahul Gupta",
    idNumber: "2022A8PS0103G",
    email: "f20220103@goa.bits-pilani.ac.in",
    btechBranch: "Electronics and Communication",
    whatsappNumber: "9876543212",
    cgpa: 8.1,
    pitch: "I have a strong interest in fluid dynamics and have completed relevant coursework. I am eager to apply my knowledge to computational simulations.",
    status: "shortlisted",
    createdAt: new Date("2024-04-11")
  },
  {
    id: "app3",
    positionId: "pos1",
    studentId: "s2",
    fullName: "Priya Patel",
    idNumber: "2021A3PS0042G",
    email: "f20210042@goa.bits-pilani.ac.in",
    btechBranch: "Mechanical Engineering",
    minorDegree: "Finance",
    whatsappNumber: "9876543211",
    cgpa: 8.7,
    pitch: "I have experience in deep learning and computer vision projects. I would love to contribute to this research.",
    status: "shortlisted",
    createdAt: new Date("2024-04-12")
  },
  {
    id: "app4",
    positionId: "pos1",
    studentId: "s3",
    fullName: "Rahul Gupta",
    idNumber: "2022A8PS0103G",
    email: "f20220103@goa.bits-pilani.ac.in",
    btechBranch: "Electronics and Communication",
    whatsappNumber: "9876543212",
    cgpa: 8.1,
    pitch: "I am particularly interested in the intersection of ML and computer vision.",
    status: "rejected",
    createdAt: new Date("2024-04-13")
  }
];

// Mock data service
let students = [...mockStudents];
let professors = [...mockProfessors];
let positions = [...mockPositions];
let applications = [...mockApplications];
let currentUser: string | null = null;

interface ServiceResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export const mockDataService = {
  // Authentication
  login: (email: string, password: string): ServiceResponse<{ user: StudentProfile | ProfessorProfile }> => {
    if (!email.endsWith('@goa.bits-pilani.ac.in')) {
      return { success: false, error: 'Only BITS Pilani Goa campus emails are allowed' };
    }
    
    // Find user by email
    const student = students.find(s => s.email === email);
    if (student) {
      currentUser = student.id;
      return { success: true, user: student };
    }
    
    const professor = professors.find(p => p.email === email);
    if (professor) {
      currentUser = professor.id;
      return { success: true, user: professor };
    }
    
    return { success: false, error: 'Invalid credentials' };
  },
  
  register: (userData: Partial<StudentProfile | ProfessorProfile>): ServiceResponse<{ user: StudentProfile | ProfessorProfile }> => {
    if (!userData.email?.endsWith('@goa.bits-pilani.ac.in')) {
      return { success: false, error: 'Only BITS Pilani Goa campus emails are allowed' };
    }
    
    // Ensure required fields are set
    if (!userData.role) {
      return { success: false, error: 'Role is required' };
    }
    
    const id = `user${Math.floor(Math.random() * 10000)}`;
    const createdAt = new Date();
    
    let newUser: StudentProfile | ProfessorProfile;
    
    if (userData.role === 'student') {
      newUser = {
        id,
        fullName: userData.fullName || '',
        idNumber: userData.idNumber || '',
        email: userData.email || '',
        whatsappNumber: userData.whatsappNumber || '',
        role: 'student',
        cgpa: (userData as Partial<StudentProfile>).cgpa || 0,
        createdAt,
        ...(userData as Partial<StudentProfile>)
      } as StudentProfile;
      students.push(newUser);
    } else {
      newUser = {
        id,
        fullName: userData.fullName || '',
        idNumber: userData.idNumber || '',
        email: userData.email || '',
        whatsappNumber: userData.whatsappNumber || '',
        role: 'professor',
        designation: (userData as Partial<ProfessorProfile>).designation || 'Assistant Professor',
        department: (userData as Partial<ProfessorProfile>).department || '',
        chamberNumber: (userData as Partial<ProfessorProfile>).chamberNumber || '',
        createdAt,
        ...(userData as Partial<ProfessorProfile>)
      } as ProfessorProfile;
      professors.push(newUser);
    }
    
    currentUser = id;
    return { success: true, user: newUser };
  },
  
  logout: (): ServiceResponse<null> => {
    currentUser = null;
    return { success: true };
  },
  
  getCurrentUser: (): StudentProfile | ProfessorProfile | null => {
    if (!currentUser) return null;
    
    const student = students.find(s => s.id === currentUser);
    if (student) return student;
    
    const professor = professors.find(p => p.id === currentUser);
    if (professor) return professor;
    
    return null;
  },
  
  // Profile management
  updateStudentProfile: (id: string, data: Partial<StudentProfile>): ServiceResponse<{ profile: StudentProfile | null }> => {
    const studentIndex = students.findIndex(s => s.id === id);
    if (studentIndex === -1) {
      return { success: false, error: 'Student not found', profile: null };
    }
    
    students[studentIndex] = { ...students[studentIndex], ...data };
    return { success: true, profile: students[studentIndex] };
  },
  
  updateProfessorProfile: (id: string, data: Partial<ProfessorProfile>): ServiceResponse<{ profile: ProfessorProfile | null }> => {
    const professorIndex = professors.findIndex(p => p.id === id);
    if (professorIndex === -1) {
      return { success: false, error: 'Professor not found', profile: null };
    }
    
    professors[professorIndex] = { ...professors[professorIndex], ...data };
    return { success: true, profile: professors[professorIndex] };
  },
  
  // Position management
  getPositions: () => {
    // If there's a logged in user, check their role
    const currentUser = mockDataService.getCurrentUser();
    
    if (currentUser?.role === 'professor') {
      // For professors, only return their positions
      return positions.filter(p => p.professorId === currentUser.id);
    }
    
    // For students or non-logged in users, return all open positions
    return positions.filter(p => p.status === 'open');
  },
  
  getPosition: (id: string) => {
    return positions.find(p => p.id === id);
  },
  
  createPosition: (data: Omit<ResearchPosition, 'id' | 'createdAt'>) => {
    const id = `pos${positions.length + 1}`;
    const newPosition = {
      ...data,
      id,
      createdAt: new Date(),
    };
    positions.push(newPosition);
    return { success: true, position: newPosition };
  },
  
  updatePosition: (id: string, data: Partial<ResearchPosition>) => {
    positions = positions.map(p => p.id === id ? { ...p, ...data } : p);
    return { success: true, position: positions.find(p => p.id === id) };
  },
  
  deletePosition: (id: string) => {
    positions = positions.filter(p => p.id !== id);
    return { success: true };
  },
  
  // Application management
  getApplications: (filters?: { positionId?: string, studentId?: string }) => {
    let filtered = [...applications];
    
    if (filters?.positionId) {
      filtered = filtered.filter(a => a.positionId === filters.positionId);
    }
    
    if (filters?.studentId) {
      filtered = filtered.filter(a => a.studentId === filters.studentId);
    }
    
    return filtered;
  },
  
  createApplication: (data: Omit<Application, 'id' | 'createdAt' | 'status'>) => {
    const id = `app${applications.length + 1}`;
    const newApplication = {
      ...data,
      id,
      status: 'pending' as const,
      createdAt: new Date(),
    };
    applications.push(newApplication);
    return { success: true, application: newApplication };
  },
  
  updateApplication: (id: string, data: Partial<Application>) => {
    applications = applications.map(a => a.id === id ? { ...a, ...data } : a);
    return { success: true, application: applications.find(a => a.id === id) };
  },
  
  // Helper methods
  getPositionsByProfessor: (professorId: string) => {
    return positions.filter(p => p.professorId === professorId);
  },
  
  getApplicationsForPosition: (positionId: string) => {
    return applications.filter(a => a.positionId === positionId);
  },
  
  getAppliedPositions: (studentId: string) => {
    const appliedIds = applications
      .filter(a => a.studentId === studentId)
      .map(a => a.positionId);
    return positions.filter(p => appliedIds.includes(p.id));
  },
  
  hasApplied: (studentId: string, positionId: string) => {
    return applications.some(a => a.studentId === studentId && a.positionId === positionId);
  }
};
