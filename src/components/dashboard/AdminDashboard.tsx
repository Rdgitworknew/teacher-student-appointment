import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { db, logAction } from '@/lib/firebase';
import { User, Teacher } from '@/types';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingStudents, setPendingStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load pending students
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('isApproved', '==', false)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as User[];

      // Load teachers
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      const teachersData = teachersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Teacher[];

      setPendingStudents(studentsData);
      setTeachers(teachersData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const approveStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, 'users', studentId), {
        isApproved: true
      });
      logAction('Student approved', { studentId });
      loadData();
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  const rejectStudent = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, 'users', studentId));
      logAction('Student rejected', { studentId });
      loadData();
    } catch (error) {
      console.error('Error rejecting student:', error);
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    try {
      await deleteDoc(doc(db, 'teachers', teacherId));
      await deleteDoc(doc(db, 'users', teacherId));
      logAction('Teacher deleted', { teacherId });
      loadData();
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Pending Student Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Student Registrations</CardTitle>
          <CardDescription>
            Review and approve student registration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingStudents.length === 0 ? (
            <p className="text-gray-500">No pending registrations</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveStudent(student.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectStudent(student.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
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

      {/* Teachers Management */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers Management</CardTitle>
          <CardDescription>
            Manage registered teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p className="text-gray-500">No teachers registered</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{teacher.department}</Badge>
                    </TableCell>
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTeacher(teacher.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
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