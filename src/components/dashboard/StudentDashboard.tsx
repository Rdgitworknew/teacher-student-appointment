import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { db, logAction } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Teacher, Appointment, Message } from '@/types';
import { Search, Calendar, MessageSquare } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    purpose: ''
  });
  const [messageForm, setMessageForm] = useState({
    teacherId: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load teachers
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      const teachersData = teachersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Teacher[];

      // Load student's appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('studentId', '==', user.id)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Appointment[];

      setTeachers(teachersData);
      setAppointments(appointmentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bookAppointment = async () => {
    if (!selectedTeacher || !user || !appointmentForm.date || !appointmentForm.time || !appointmentForm.purpose) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const appointmentData: Omit<Appointment, 'id'> = {
        studentId: user.id,
        teacherId: selectedTeacher.id,
        studentName: user.name,
        teacherName: selectedTeacher.name,
        date: appointmentForm.date,
        time: appointmentForm.time,
        purpose: appointmentForm.purpose,
        status: 'pending',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'appointments'), appointmentData);
      logAction('Appointment booked', { studentId: user.id, teacherId: selectedTeacher.id });
      
      setAppointmentForm({ date: '', time: '', purpose: '' });
      setSelectedTeacher(null);
      loadData();
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment');
    }
  };

  const sendMessage = async () => {
    if (!user || !messageForm.teacherId || !messageForm.content) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const teacher = teachers.find(t => t.id === messageForm.teacherId);
      if (!teacher) return;

      const messageData: Omit<Message, 'id'> = {
        studentId: user.id,
        teacherId: messageForm.teacherId,
        studentName: user.name,
        teacherName: teacher.name,
        content: messageForm.content,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'messages'), messageData);
      logAction('Message sent', { studentId: user.id, teacherId: messageForm.teacherId });
      
      setMessageForm({ teacherId: '', content: '' });
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message to Teacher</DialogTitle>
                <DialogDescription>
                  Send a message to any teacher
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teacher-select">Select Teacher</Label>
                  <Select value={messageForm.teacherId} onValueChange={(value) => setMessageForm(prev => ({ ...prev, teacherId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message-content">Message</Label>
                  <Textarea
                    id="message-content"
                    value={messageForm.content}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>
                <Button onClick={sendMessage} className="w-full">
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Teachers */}
      <Card>
        <CardHeader>
          <CardTitle>Search Teachers</CardTitle>
          <CardDescription>
            Find and book appointments with teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, department, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{teacher.name}</CardTitle>
                  <CardDescription>{teacher.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">{teacher.department}</Badge>
                    <p className="text-sm text-gray-600">{teacher.subject}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book Appointment with {teacher.name}</DialogTitle>
                          <DialogDescription>
                            Schedule your appointment
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={appointmentForm.date}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="time">Time</Label>
                            <Select value={appointmentForm.time} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, time: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {teacher.availableSlots.map(slot => (
                                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="purpose">Purpose</Label>
                            <Textarea
                              id="purpose"
                              value={appointmentForm.purpose}
                              onChange={(e) => setAppointmentForm(prev => ({ ...prev, purpose: e.target.value }))}
                              placeholder="Describe the purpose of your appointment"
                            />
                          </div>
                          <Button onClick={bookAppointment} className="w-full">
                            Book Appointment
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>
            View your scheduled appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments scheduled</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.teacherName}</TableCell>
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
    </div>
  );
}