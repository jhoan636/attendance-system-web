import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, BookOpen, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { User } from '@/types';
import { database } from '@/lib/database';

interface SessionEntryScreenProps {
  user: User;
  onSubmit: (sessionData: {
    nationalId: string;
    serviceTypeId: number;
    accompanimentCourseId?: number;
    estimatedHours: number;
    authorization: boolean;
    comments?: string;
  }) => Promise<void>;
}


export function SessionEntryScreen({ user, onSubmit }: SessionEntryScreenProps) {
  const [formData, setFormData] = useState({
    serviceTypeId: '',
    accompanimentCourseId: '',
    estimatedHours: '',
    authorization: true,
    comments: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [serviceTypes, setServiceTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [accompanimentCourses, setAccompanimentCourses] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await database.getServiceTypes();
        setServiceTypes(s || []);
      } catch (e) {
        console.error('Error loading service types', e);
      }
      try {
        const a = await database.getAccompanimentCourses();
        setAccompanimentCourses(a || []);
      } catch (e) {
        console.error('Error loading accompaniment courses', e);
      }
    })();
  }, []);

  const getFieldLabels = () => ({
    serviceType: 'Tipo de Servicio',
    accompanimentCourse: 'Asignatura de Acompañamiento',
    comments: 'Comentarios'
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceTypeId.trim()) {
      newErrors.serviceTypeId = 'El tipo de servicio es requerido';
    }

    const hours = parseFloat(formData.estimatedHours);
    if (!formData.estimatedHours) {
      newErrors.estimatedHours = 'Las horas estimadas son requeridas';
    } else if (isNaN(hours) || hours <= 0 || hours > 24) {
      newErrors.estimatedHours = 'Ingrese un número válido entre 0.5 y 24';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  const nationalId = user.nationalId || user.cedula || '';
  const serviceTypeId = Number(formData.serviceTypeId);
  const accompanimentCourseId = formData.accompanimentCourseId
    ? Number(formData.accompanimentCourseId)
    : undefined;

  try {
    await onSubmit({
      nationalId,
      serviceTypeId,
      accompanimentCourseId,
      estimatedHours: parseFloat(formData.estimatedHours),
      authorization: Boolean(formData.authorization),
      comments: formData.comments.trim() || undefined
    });
  } catch (error: any) {
    if (error?.fieldErrors) {
      setErrors(prev => ({
        ...prev,
        ...error.fieldErrors
      }));
      return;
    }
    setErrors({});
    alert(error?.message || 'Error al registrar la sesión');
  }
};


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const labels = getFieldLabels();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-green-600/30">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl text-slate-900 mb-2">Detalles de la Sesión</h1>
          <p className="text-slate-600">
            {user.fullName} • {user.role}
          </p>
        </div>

        {/* Session Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 space-y-6">
          {/* User Info Banner */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-green-900 font-medium">Perfil Cargado</p>
                <p className="text-green-700 text-sm">Datos personales ya guardados. Solo necesitas los detalles de la sesión.</p>
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label htmlFor="serviceType" className="block text-sm text-slate-700 mb-2">
              {labels.serviceType} <span className="text-red-500">*</span>
            </label>
            <select
              id="serviceType"
              value={formData.serviceTypeId}
              onChange={(e) => handleInputChange('serviceTypeId', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.serviceTypeId ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-green-500'}`}
            >
              <option value="">Selecciona un tipo de servicio</option>
              {serviceTypes.map(s => (
                <option key={s.id} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
            {errors.serviceTypeId && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.serviceTypeId}
              </p>
            )}
          </div>

          {/* Accompaniment Course */}
          <div>
            <label htmlFor="accompanimentCourse" className="block text-sm text-slate-700 mb-2">
              {labels.accompanimentCourse} <span className="text-slate-500">(Opcional)</span>
            </label>
            <select
              id="accompanimentCourse"
              value={formData.accompanimentCourseId}
              onChange={(e) => handleInputChange('accompanimentCourseId', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg transition-all outline-none focus:border-green-500"
            >
              <option value="">Ninguna</option>
              {accompanimentCourses.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Estimated Hours */}
          <div>
            <label htmlFor="hours" className="block text-sm text-slate-700 mb-2">
              Horas Estimadas <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="hours"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                placeholder="ej., 2, 1.5, 3"
                step="0.5"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${
                  errors.estimatedHours ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-green-500'
                }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 text-sm">horas</span>
              </div>
            </div>
            {errors.estimatedHours && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.estimatedHours}
              </p>
            )}
            <p className="text-slate-500 text-xs mt-1">Ingrese la duración estimada de esta sesión</p>
          </div>

          {/* Authorization + Comments */}
          <div>
            <label className="flex items-center gap-3 mb-2">
              <input type="checkbox" checked={Boolean(formData.authorization)} onChange={(e) => handleInputChange('authorization', e.target.checked)} />
              <span className="text-sm text-slate-700">Autorizo el envío de correos relacionados con esta sesión</span>
            </label>
            <label htmlFor="comments" className="block text-sm text-slate-700 mb-2 mt-3">
              {labels.comments} <span className="text-slate-500">(Opcional)</span>
            </label>
            <textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              placeholder="Notas o comentarios sobre la sesión"
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg transition-all outline-none focus:border-green-500 resize-none"
            />
          </div>

          {/* Current Date/Time Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-slate-500">Fecha</p>
                <p className="text-slate-900 font-medium">
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Hora</p>
                <p className="text-slate-900 font-medium">
                  {new Date().toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30"
          >
            Enviar Asistencia
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Info Footer */}
        <p className="text-center text-slate-500 text-xs mt-4">
          La sesión será registrada con tus datos de perfil
        </p>
      </motion.div>
    </div>
  );
}
