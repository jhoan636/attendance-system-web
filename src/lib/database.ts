import { User, AttendanceSession } from '@/types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';

export class ApiErrorWithFields extends Error {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiErrorWithFields';
  }
}

async function handleJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!res.ok) {
    console.error(`API error ${res.status} (${res.url}) — content-type: ${contentType}`, text);
    try {
      const parsed = JSON.parse(text);
      const msg = parsed && (parsed.message || parsed.error || parsed.msg) ? (parsed.message || parsed.error || parsed.msg) : text;
      
      // Si hay fieldErrors, lanzar una excepción especial que los incluya
      if (parsed.fieldErrors && typeof parsed.fieldErrors === 'object') {
        throw new ApiErrorWithFields(msg, parsed.fieldErrors);
      }
      
      throw new Error(msg);
    } catch (e) {
      // Si ya es un Error procesado (ApiErrorWithFields o Error con mensaje extraído), relanzarlo tal cual
      if (e instanceof ApiErrorWithFields || e instanceof Error) {
        throw e;
      }
      // Solo relanzar el JSON completo si hubo otro tipo de excepción
      throw new Error(text);
    }
  }

  if (!contentType.includes('application/json')) {
    console.warn(`Expected JSON but got ${contentType} from ${res.url}`, text);
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error(`Failed parsing JSON from ${res.url}`, text);
    throw new Error('API_ERROR');
  }
}

export const database = {
  getUserByCedula: async (cedula: string): Promise<User | null> => {
    const res = await fetch(`${API_BASE}/api/users/find/${encodeURIComponent(cedula)}`);
    if (res.status === 404) return null;
    const data = await handleJsonResponse<any>(res);

    // Normalize backend UserResponse to frontend `User` shape
    const fullName: string = data.fullName || '';
    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts.length > 0 ? nameParts[0] : (data.firstName || '');
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (data.lastName || '');

    const user: User = {
      cedula: data.nationalId || data.cedula || cedula,
      nationalId: data.nationalId || data.cedula || cedula,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName || `${firstName} ${lastName}`.trim(),
      email: data.email || '',
      phone: data.phone || '',
      role: (data.role || 'Invitado') as User['role'],
      career: data.career || undefined,
      department: data.department || undefined,
      sede: data.campus || undefined,
      academicProgram: data.academicProgram || undefined,
      semester: data.semester ? String(data.semester) : undefined,
      semesterNumber: data.semester || undefined,
      campus: data.campus || undefined,
      createdAt: data.createdAt || new Date().toISOString()
    };

    return user;
  },

  createUser: async (payload: any): Promise<User> => {
    const body: any = {
      nationalId: payload.cedula || payload.nationalId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
    };

    if (payload.campusId) body.campusId = Number(payload.campusId);
    if (payload.academicProgramId) body.academicProgramId = Number(payload.academicProgramId);
    if (payload.semester) body.semester = Number(payload.semester);
    if (payload.roleAccessCode) body.roleAccessCode = payload.roleAccessCode;

    console.log('createUser payload ->', body);
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await handleJsonResponse<any>(res);

    // Map backend response to frontend `User`
    const fullName: string = data.fullName || '';
    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts.length > 0 ? nameParts[0] : (data.firstName || payload.firstName || '');
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (data.lastName || payload.lastName || '');

    const user: User = {
      cedula: data.nationalId || data.cedula || payload.cedula || '',
      nationalId: data.nationalId || data.cedula || payload.cedula || '',
      firstName,
      lastName,
      fullName: fullName || `${firstName} ${lastName}`.trim(),
      email: data.email || payload.email || '',
      phone: data.phone || payload.phone || '',
      role: (data.role || payload.role || 'Invitado') as User['role'],
      career: data.career || undefined,
      department: data.department || undefined,
      sede: data.campus || undefined,
      academicProgram: data.academicProgram || undefined,
      semester: data.semester ? String(data.semester) : (payload.semester ? String(payload.semester) : undefined),
      semesterNumber: data.semester || undefined,
      campus: data.campus || undefined,
      createdAt: data.createdAt || new Date().toISOString()
    };

    return user;
  },

  // Fetch master data
  getCampuses: async (): Promise<Array<{ id: number; name: string }>> => {
    const res = await fetch(`${API_BASE}/api/campuses`);
    return await handleJsonResponse<Array<{ id: number; name: string }>>(res);
  },

  getAcademicPrograms: async (): Promise<Array<{ id: number; name: string }>> => {
    const res = await fetch(`${API_BASE}/api/academic-programs`);
    return await handleJsonResponse<Array<{ id: number; name: string }>>(res);
  },

  getServiceTypes: async (): Promise<Array<{ id: number; name: string }>> => {
    const res = await fetch(`${API_BASE}/api/service-types`);
    return await handleJsonResponse<Array<{ id: number; name: string }>>(res);
  },

  getAccompanimentCourses: async (): Promise<Array<{ id: number; name: string }>> => {
    const res = await fetch(`${API_BASE}/api/accompaniment-courses`);
    return await handleJsonResponse<Array<{ id: number; name: string }>>(res);
  },

  updateUser: async (cedula: string, updates: Partial<User>): Promise<User | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(cedula)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.status === 404) return null;
      return await handleJsonResponse<User>(res);
    } catch (err) {
      console.error('updateUser error', err);
      return null;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/api/users`);
    return await handleJsonResponse<User[]>(res);
  },

  // Session operations
  createSession: async (session: AttendanceSession): Promise<AttendanceSession> => {
    const res = await fetch(`${API_BASE}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return await handleJsonResponse<AttendanceSession>(res);
  },

  // New: create attendance using backend DTO expected by the API
  createAttendance: async (payload: any): Promise<any> => {
    const body = {
      nationalId: payload.nationalId,
      serviceTypeId: Number(payload.serviceTypeId),
      accompanimentCourseId: payload.accompanimentCourseId ? Number(payload.accompanimentCourseId) : undefined,
      estimatedHours: payload.estimatedHours,
      authorization: Boolean(payload.authorization),
      comments: payload.comments
    };
    const res = await fetch(`${API_BASE}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await handleJsonResponse<any>(res);
  },

  getAllSessions: async (): Promise<AttendanceSession[]> => {
    const res = await fetch(`${API_BASE}/api/attendance`);
    return await handleJsonResponse<AttendanceSession[]>(res);
  },

  getSessionsByCedula: async (cedula: string): Promise<AttendanceSession[]> => {
    try {
      const sessions = await database.getAllSessions();
      return sessions.filter(s => s.cedula === cedula);
    } catch (err) {
      console.error('getSessionsByCedula error', err);
      return [];
    }
  },

  // Utility: backend may not support clearing everything — keep as no-op
  clearAllData: async (): Promise<void> => {
    return;
  }
};
