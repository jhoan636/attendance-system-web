export type UserRole = 'Profesor' | 'Monitor' | 'Estudiante' | 'Invitado';

export interface User {
  cedula: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  career?: string; // Para estudiantes y monitores
  department?: string; // (opcional, legacy)
  sede?: string; // Sede o campus al que pertenece
  semester?: string; // Semestre (para estudiantes/monitores)
  // Backend DTO aliases (optional) — some endpoints return different field names
  nationalId?: string;
  fullName?: string;
  campus?: string;
  academicProgram?: string;
  // semester above may be string or number coming from backend
  semesterNumber?: number;
  createdAt: string;
}

export interface Campus {
  id: number;
  name: string;
}

export interface AcademicProgram {
  id: number;
  name: string;
}

export interface AttendanceSession {
  id: string;
  cedula: string;
  userName: string;
  role: UserRole;
  serviceType?: string;
  accompanimentCourse?: string;
  estimatedHours: number;
  comments?: string;
  authorization?: boolean;
  timestamp: string;
  date: string;
}

export interface AppState {
  currentStep: 'id-entry' | 'profile-loaded' | 'registration' | 'session-entry' | 'confirmation';
  user: User | null;
  isNewUser: boolean;
  sessionData: Partial<AttendanceSession> | null;
}