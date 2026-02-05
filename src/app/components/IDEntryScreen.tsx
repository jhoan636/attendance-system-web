import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, CheckCircle2, UserPlus, Shield } from 'lucide-react';
import logo from '@/assets/logo.png';


interface IDEntryScreenProps {
  onLookup: (cedula: string, isNewUser: boolean) => void;
  isLoading: boolean;
}

export function IDEntryScreen({ onLookup, isLoading }: IDEntryScreenProps) {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');

  const validateCedula = (value: string): boolean => {
    // Validación básica: solo números, 6-12 dígitos
    const regex = /^\d{6,12}$/;
    return regex.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateCedula(cedula)) {
      setError('Por favor ingrese un número de cédula válido (6-12 dígitos)');
      return;
    }

    onLookup(cedula, false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo permite dígitos
    setCedula(value);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className="flex justify-center mb-4"
          >
            <img
              src={logo}
              alt="Logo Aula Taller"
              className="w-32 h-32 object-contain"
            />
          </motion.div>

          <h1 className="text-3xl text-slate-900 mb-2">Sistema de Asistencia</h1>
          <p className="text-slate-600">Ingrese su documento de identidad para continuar</p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Input */}
            <div>
              <label htmlFor="cedula" className="block text-sm text-slate-700 mb-2">
                Cédula Nacional
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cedula"
                  value={cedula}
                  onChange={handleInputChange}
                  placeholder="Ingrese su número de cédula"
                  maxLength={12}
                  disabled={isLoading}
                  className={`w-full px-4 py-4 pr-12 bg-slate-50 border-2 rounded-xl text-lg transition-all outline-none ${error
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-200'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
              <p className="text-slate-500 text-xs mt-2">Formato: 6-12 dígitos (solo números)</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!cedula || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 " />
                  Consultando base de datos...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar Cédula
                </>
              )}
            </button>
          </form>

          {/* Info Cards */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-slate-600 text-sm mb-3">¿Qué sucede ahora?</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-sm">Usuario Existente</p>
                  <p className="text-slate-500 text-xs">Tu perfil se cargará automáticamente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-sm">Usuario Nuevo</p>
                  <p className="text-slate-500 text-xs">Registro rápido con datos mínimos</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Control de asistencia • Plataforma Educativa - Politécnico Jaime isaza Cadavid
        </p>
      </motion.div>
    </div>
  );
}