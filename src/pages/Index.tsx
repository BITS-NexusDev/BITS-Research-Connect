
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  // If user is already logged in, redirect them to their dashboard
  if (user) {
    return user.role === "student" 
      ? <StudentDashboardRedirect />
      : <ProfessorDashboardRedirect />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-bits-blue text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">BITS Research Connect</h1>
          <div>
            <Button variant="ghost" className="text-white mr-2" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="outline" className="bg-white text-bits-blue hover:bg-bits-lightblue" asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-bits-lightblue to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-bits-darkblue">
              Connect with Research Opportunities at BITS Pilani, Goa Campus
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-700">
              A platform for professors to post research positions and students to apply for them.
              Streamline your academic research collaboration process.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-bits-blue hover:bg-bits-darkblue text-lg py-6 px-8" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button variant="outline" className="text-bits-blue border-bits-blue hover:bg-bits-lightblue text-lg py-6 px-8" asChild>
                <Link to="/browse-positions">Browse Research Positions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-bits-darkblue">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-bits-blue">For Students</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Create your academic profile</li>
                  <li>Browse available research positions</li>
                  <li>Apply with a personalized pitch</li>
                  <li>Track application status</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="text-bits-blue p-0 flex items-center" asChild>
                  <Link to="/register">
                    Register as a Student <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-bits-blue">For Professors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Create your faculty profile</li>
                  <li>Post research opportunities</li>
                  <li>Review student applications</li>
                  <li>Shortlist candidates easily</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="text-bits-blue p-0 flex items-center" asChild>
                  <Link to="/register">
                    Register as a Professor <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-bits-blue">Exclusive Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Only for BITS Pilani, Goa Campus</li>
                  <li>Secure authentication with academic emails</li>
                  <li>Streamlined application process</li>
                  <li>Direct communication channels</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="text-bits-blue p-0 flex items-center" asChild>
                  <Link to="/login">
                    Login Now <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-bits-darkblue text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">BITS Research Connect</h3>
              <p className="text-sm text-gray-300">Connecting talent with opportunity</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">
                © {new Date().getFullYear()} BITS Pilani, Goa Campus. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StudentDashboardRedirect = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96 text-center">
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>You're already logged in</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Continue to your student dashboard to browse and apply for research positions.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="bg-bits-blue" asChild>
            <Link to="/student-dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const ProfessorDashboardRedirect = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96 text-center">
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>You're already logged in</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Continue to your faculty dashboard to manage your research positions and applications.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="bg-bits-blue" asChild>
            <Link to="/professor-dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
