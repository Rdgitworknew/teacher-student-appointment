import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { db, logAction } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Appointment, Message } from '@/types';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load teacher's appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('teacherId', '==', user.id)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Appointment[];

      // Load teacher's messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('teacherId', '==', user.id)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Message[];

      setAppointments(appointmentsData);
      setMessages(messagesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'approved' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status
      });
      logAction('Appointment status updated', { appointmentId, status });
      loadData();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const allAppointments = appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pendingAppointments.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {appointments.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Messages Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {messages.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Appointments</CardTitle>
          <CardDescription>
            Review and approve appointment requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingAppointments.length === 0 ? (
            <p className="text-gray-500">No pending appointments</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.studentName}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.purpose}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>
            View all your appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allAppointments.length === 0 ? (
            <p className="text-gray-500">No appointments</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.studentName}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.purpose}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          appointment.status === 'approved' ? 'default' :
                          appointment.status === 'cancelled' ? 'destructive' : 'secondary'
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Messages from Students</CardTitle>
          <CardDescription>
            View messages sent by students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">{message.studentName}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {message.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}