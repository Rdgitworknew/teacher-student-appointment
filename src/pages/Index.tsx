import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MessageSquare, Shield } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Student-Teacher Appointment System
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Streamline Your Academic Appointments
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive web-based appointment booking system that connects students and teachers, 
            making scheduling efficient and accessible from anywhere.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Easy Scheduling</CardTitle>
              <CardDescription>
                Book appointments with teachers quickly and efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Students can search for teachers and book appointments based on available time slots.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Direct Messaging</CardTitle>
              <CardDescription>
                Communicate directly with teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Send messages to teachers about appointment purposes and timing.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Different interfaces for students, teachers, and admins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Tailored dashboards and features based on user roles and permissions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Roles Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-8">System Modules</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin Module */}
            <div className="text-center">
              <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-4">Admin Module</h4>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Add/Update/Delete Teachers</li>
                <li>• Approve Student Registration</li>
                <li>• View All Appointments</li>
                <li>• System Management</li>
              </ul>
            </div>

            {/* Teacher Module */}
            <div className="text-center">
              <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-4">Teacher Module</h4>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Login/Logout</li>
                <li>• Schedule Appointments</li>
                <li>• Approve/Cancel Appointments</li>
                <li>• View Messages</li>
                <li>• View All Appointments</li>
              </ul>
            </div>

            {/* Student Module */}
            <div className="text-center">
              <Calendar className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-4">Student Module</h4>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Register/Login</li>
                <li>• Search Teachers</li>
                <li>• Book Appointments</li>
                <li>• Send Messages</li>
                <li>• View Appointment Status</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-8">
            Join our appointment booking system and experience seamless scheduling.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button size="lg">Register Now</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Login</Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Student-Teacher Appointment System. Built with React, TypeScript, and Firebase.</p>
        </div>
      </footer>
    </div>
  );
}