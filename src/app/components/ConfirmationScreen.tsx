import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Calendar, Clock, User, BookOpen, FileText, Home } from 'lucide-react';
import { AttendanceSession } from '@/types';

interface ConfirmationScreenProps {
  session: AttendanceSession;
  onNewEntry: () => void;
}

export function ConfirmationScreen({ session, onNewEntry }: ConfirmationScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            {/* user-provided animation: ball style + motion */}
            {(() => {
              const ball: React.CSSProperties = {
                width: 96,
                height: 96,
                borderRadius: 9999,
                background: 'linear-gradient(to right,#16a34a,#16a34a,#15803d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 18px 30px rgba(0, 0, 0, 0.31)'
              };

              return (
                <motion.div
                  style={ball}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5,
                    ease: [0, 0.71, 0.2, 1.01]
                  }}
                  className="relative"
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
              );
            })()}
          </div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl text-slate-900 mt-6 mb-2"
          >
            Registro Completado
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-600"
          >
            Tu asistencia ha sido registrada exitosamente
          </motion.p>
        </motion.div>

        {/* Session Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">ID de Sesión</p>
                <p className="text-white text-lg font-mono">{session.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            {/* User Information */}
            <div>
              <h3 className="text-sm text-slate-500 uppercase tracking-wide mb-4">Información del Usuario</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Nombre</p>
                    <p className="text-slate-900">{session.userName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500">ID (Cédula)</p>
                      <p className="text-slate-900 font-mono">{session.cedula}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                      <p className="text-xs text-slate-500">Rol</p>
                      <p className="text-slate-900">{session.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Information */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm text-slate-500 uppercase tracking-wide mb-4">Información de la Sesión</h3>
              <div className="space-y-3">
                {session.serviceType && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tipo de Servicio</p>
                      <p className="text-slate-900">{session.serviceType}</p>
                      {session.accompanimentCourse && (
                        <p className="text-slate-600 text-sm">Asignatura: {session.accompanimentCourse}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Horas Estimadas</p>
                    <p className="text-slate-900">{session.estimatedHours} horas</p>
                  </div>
                </div>

                {session.comments && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Comentarios</p>
                      <p className="text-slate-900">{session.comments}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Fecha y Hora</p>
                    <p className="text-slate-900">{session.date}</p>
                    <p className="text-slate-600 text-sm">
                      {new Date(session.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="pt-6 border-t border-slate-200">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-900 text-sm">
                  <strong>✓ Datos Guardados:</strong> Este registro de asistencia ha sido almacenado en el sistema. 
                  Tu perfil está listo para futuros registros rápidos.
                </p>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={onNewEntry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
            >
              <Home className="w-5 h-5" />
              Nueva Entrada
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Sesión registrada el {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </motion.div>
    </div>
  );
}