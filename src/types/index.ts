export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  subject?: string;
  createdAt: Date;
  isApproved?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  subject: string;
  availableSlots: string[];
  createdAt: Date;
}

export interface Appointment {
  id: string;
  studentId: string;
  teacherId: string;
  studentName: string;
  teacherName: string;
  date: string;
  time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'cancelled';
  createdAt: Date;
}

export interface Message {
  id: string;
  studentId: string;
  teacherId: string;
  studentName: string;
  teacherName: string;
  content: string;
  appointmentId?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}