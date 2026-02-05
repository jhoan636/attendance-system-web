import { motion } from 'motion/react';
import { CheckCircle2, User, Mail, Phone, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';
import { User as UserType } from '@/types';

interface ProfileLoadedScreenProps {
  user: UserType;
  onContinue: () => void;
}

export function ProfileLoadedScreen({ user, onContinue }: ProfileLoadedScreenProps) {
  const documentId = (user as any).nationalId ?? user.cedula;
  const displayName = (user as any).fullName ?? `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const displayCareer = (user as any).academicProgram ?? user.career;
  const displayCampus = (user as any).campus ?? (user as any).sede ?? (user as any).sede;
  const displaySemester = (user as any).semester ?? (user as any).semesterNumber ?? user.semester;
  const getRoleIcon = () => {
    switch (user.role) {
      case 'Profesor':
        return <Briefcase className="w-5 h-5" />;
      case 'Monitor':
        return <User className="w-5 h-5" />;
      case 'Estudiante':
        return <GraduationCap className="w-5 h-5" />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'Profesor':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Monitor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Estudiante':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-green-600/30 relative">
            <CheckCircle2 className="w-10 h-10 text-white" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl text-slate-900 mb-2">Perfil Cargado</h1>
          <p className="text-slate-600">¡Bienvenido de nuevo! Tu información ha sido recuperada.</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm mb-1">Documento de identidad: {documentId}</p>
                <h2 className="text-2xl text-white">{displayName}</h2>
              </div>
              <div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${getRoleColor()} bg-white`}>
                {getRoleIcon()}
                <span className="font-medium">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm text-slate-500 uppercase tracking-wide mb-4">Información de Contacto</h3>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Correo</p>
                    <p className="text-slate-900 ">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Teléfono</p>
                    <p className="text-slate-900">{user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Role-Specific Information */}
              <div className="space-y-4">
                <h3 className="text-sm text-slate-500 uppercase tracking-wide mb-4">
                  {user.role === 'Profesor' ? 'Departamento' : 'Información Académica'}
                </h3>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {user.role === 'Profesor' ? (
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {user.role === 'Profesor' ? 'Departamento' : 'Carrera/Programa'}
                    </p>
                    <p className="text-slate-900">
                      {user.role === 'Profesor' ? user.department ?? '-' : displayCareer ?? '-'}
                    </p>
                  </div>
                </div>

                {/* Campus / Sede */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Sede</p>
                    <p className="text-slate-900">{displayCampus ?? '-'}</p>
                  </div>
                </div>

                {/* Semester */}
                {displaySemester !== undefined && displaySemester !== null && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Semestre</p>
                      <p className="text-slate-900">{String(displaySemester)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Miembro Desde</p>
                    <p className="text-slate-900">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-900 text-sm">
                <strong>Datos Precargados:</strong> Tu información de perfil ya está guardada. 
                Solo necesitas proporcionar los detalles de la sesión de hoy.
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={onContinue}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30"
            >
              Continuar al Registro de Sesión
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}