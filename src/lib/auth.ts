import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, logAction } from './firebase';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'student' | 'teacher', department?: string, subject?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      logAction('Login attempt', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        if (userData.role === 'student' && !userData.isApproved) {
          throw new Error('Your registration is pending approval. Please contact the administrator.');
        }
        setState(prev => ({ ...prev, user: userData, loading: false }));
        logAction('Login successful', { userId: userData.id, role: userData.role });
      } else {
        throw new Error('User profile not found');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      logAction('Login failed', { email, error: errorMessage });
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'student' | 'teacher', department?: string, subject?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      logAction('Registration attempt', { email, role });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData: User = {
        id: userCredential.user.uid,
        email,
        name,
        role,
        department,
        subject,
        createdAt: new Date(),
        isApproved: role !== 'student', // Auto-approve teachers and admins
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // If registering as teacher, also add to teachers collection
      if (role === 'teacher' && department && subject) {
        await setDoc(doc(db, 'teachers', userCredential.user.uid), {
          id: userCredential.user.uid,
          name,
          email,
          department,
          subject,
          availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          createdAt: new Date(),
        });
      }

      setState(prev => ({ ...prev, user: userData, loading: false }));
      logAction('Registration successful', { userId: userData.id, role: userData.role });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      logAction('Registration failed', { email, error: errorMessage });
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      logAction('Logout attempt', { userId: state.user?.id });
      await signOut(auth);
      setState({ user: null, loading: false, error: null });
      logAction('Logout successful');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      logAction('Logout failed', { error: errorMessage });
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setState({ user: userData, loading: false, error: null });
          } else {
            setState({ user: null, loading: false, error: null });
          }
        } catch (error) {
          setState({ user: null, loading: false, error: 'Failed to load user data' });
        }
      } else {
        setState({ user: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};