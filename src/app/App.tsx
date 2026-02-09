import { useState } from 'react';
import { AppState, User, AttendanceSession } from '@/types';
import { database, ApiErrorWithFields } from '@/lib/database';
import { IDEntryScreen } from '@/app/components/IDEntryScreen';
import { ProfileLoadedScreen } from '@/app/components/ProfileLoadedScreen';
import { RegistrationScreen } from '@/app/components/RegistrationScreen';
import { SessionEntryScreen } from '@/app/components/SessionEntryScreen';
import { ConfirmationScreen } from '@/app/components/ConfirmationScreen';
import { LoadingScreen } from '@/app/components/LoadingScreen';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/app/components/ui/alert-dialog';

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentStep: 'id-entry',
    user: null,
    isNewUser: false,
    sessionData: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [completedSession, setCompletedSession] = useState<AttendanceSession | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminModalMessage, setAdminModalMessage] = useState('');

  // Handle ID lookup
  const handleIDLookup = async (cedula: string) => {
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const existingUser = await database.getUserByCedula(cedula);

      if (existingUser) {
        // Existing user - load profile
        setAppState({
          currentStep: 'profile-loaded',
          user: existingUser,
          isNewUser: false,
          sessionData: null
        });
      } else {
        // New user - go to registration
        setAppState({
          currentStep: 'registration',
          user: { cedula } as User,
          isNewUser: true,
          sessionData: null
        });
      }
    } catch (error: any) {
      console.error('Error looking up user:', error);
      // Show a generic modal message (do not expose server details)
      setAdminModalMessage('Error al comunicarse con el servidor. Por favor contactar al administrador.');
      setShowAdminModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new user registration
const handleRegistration = async (userData: Omit<User, 'createdAt'>) => {
  try {
    const newUser: User = {
      ...userData,
      createdAt: new Date().toISOString()
    };

    await database.createUser(newUser);

    setAppState({
      currentStep: 'session-entry',
      user: newUser,
      isNewUser: false,
      sessionData: null
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    
    // Si es un ApiErrorWithFields, dejamos que RegistrationScreen lo maneje
    // Re-lanzamos la excepción para que RegistrationScreen la capture
    if (error instanceof ApiErrorWithFields) {
      throw error;
    }
    
    // Para otros errores, mostramos el modal genérico
    setAdminModalMessage(error?.message ?? 'Error al registrar usuario. Contactar al administrador.');
    setShowAdminModal(true);
  }
};


  // Handle continuing from profile loaded screen
  const handleContinueToSession = () => {
    setAppState(prev => ({
      ...prev,
      currentStep: 'session-entry'
    }));
  };

  // Handle session data submission using backend DTO
  const handleSessionSubmit = async (sessionData: {
    nationalId: string;
    serviceTypeId: number;
    accompanimentCourseId?: number;
    estimatedHours: number;
    authorization: boolean;
    comments?: string;
  }) => {
    if (!appState.user) return;

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const response = await database.createAttendance(sessionData);

      // Try to build a UI-facing AttendanceSession from response, fallback to local mapping
      const session: AttendanceSession = {
        id: response?.id || crypto.randomUUID(),
        cedula: sessionData.nationalId,
        userName: `${appState.user.firstName || ''} ${appState.user.lastName || ''}`.trim(),
        role: appState.user.role,
        serviceType: response?.serviceType || undefined,
        accompanimentCourse: response?.accompanimentCourse || undefined,
        estimatedHours: sessionData.estimatedHours,
        comments: sessionData.comments,
        authorization: Boolean(sessionData.authorization),
        timestamp: response?.timestamp || new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      setCompletedSession(session);

      setAppState(prev => ({
        ...prev,
        currentStep: 'confirmation',
        sessionData: session
      }));
    } catch (error) {
      console.error('Error creating session:', error);
      setAdminModalMessage('Error al registrar la asistencia. Por favor contactar al administrador.');
      setShowAdminModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new entry (reset to ID entry)
  const handleNewEntry = () => {
    setAppState({
      currentStep: 'id-entry',
      user: null,
      isNewUser: false,
      sessionData: null
    });
    setCompletedSession(null);
  };

  // Render current screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  let content: React.ReactNode = null;
  switch (appState.currentStep) {
    case 'id-entry':
      content = (
        <IDEntryScreen
          onLookup={handleIDLookup}
          isLoading={isLoading}
        />
      );
      break;

    case 'profile-loaded':
      content = appState.user ? (
        <ProfileLoadedScreen
          user={appState.user}
          onContinue={handleContinueToSession}
        />
      ) : null;
      break;

    case 'registration':
      content = appState.user?.cedula ? (
        <RegistrationScreen
          cedula={appState.user.cedula}
          onRegister={handleRegistration}
        />
      ) : null;
      break;

    case 'session-entry':
      content = appState.user ? (
        <SessionEntryScreen
          user={appState.user}
          onSubmit={handleSessionSubmit}
        />
      ) : null;
      break;

    case 'confirmation':
      content = completedSession ? (
        <ConfirmationScreen
          session={completedSession}
          onNewEntry={handleNewEntry}
        />
      ) : null;
      break;

    default:
      content = null;
  }

  return (
    <>
      {content}

      <AlertDialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{adminModalMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAdminModal(false)}>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
