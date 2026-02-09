import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  UserPlus,
  Briefcase,
  GraduationCap,
  User,
  Users,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { UserRole, User as UserType } from "@/types";
import { database, ApiErrorWithFields } from '@/lib/database';

interface RegistrationScreenProps {
  cedula: string;
  onRegister: (user: Omit<UserType, "createdAt">) => Promise<void>; 
}

export function RegistrationScreen({
  cedula,
  onRegister,
}: RegistrationScreenProps) {
  const [step, setStep] = useState<"role" | "details">("role");
  const [selectedRole, setSelectedRole] =
    useState<UserRole | null>(null);
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    academicProgramId: "",
    department: "",
    campusId: "",
    semester: "",
    roleAccessCode: "",
  } as const;

  const [formData, setFormData] = useState(() => ({ ...initialFormData }));
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );
  const [serverError, setServerError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles: {
    value: UserRole;
    label: string;
    icon: any;
    color: string;
    description: string;
  }[] = [
      {
        value: "Profesor",
        label: "Profesor",
        icon: Briefcase,
        color: "from-purple-500 to-purple-600",
        description: "Miembro de la facultad o instructor",
      },
      {
        value: "Monitor",
        label: "Monitor",
        icon: User,
        color: "from-blue-500 to-blue-600",
        description: "Asistente de enseñanza o monitor rizoma",
      },
      {
        value: "Estudiante",
        label: "Estudiante",
        icon: GraduationCap,
        color: "from-green-500 to-green-600",
        description: "Estudiante matriculado",
      },
      {
        value: "Invitado",
        label: "Invitado",
        icon: Users,
        color: "from-yellow-500 to-yellow-600",
        description: "Persona invitada a la actividad",
      },
    ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Reset the whole form when switching role to avoid stale values
    setFormData({ ...initialFormData });
    setErrors({});
    setTimeout(() => setStep("details"), 300);
  };

  const [campuses, setCampuses] = useState<Array<{ id: number; name: string }>>([]);
  const [programs, setPrograms] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const c = await database.getCampuses();
        setCampuses(c || []);
      } catch (e) {
        console.error('Error loading campuses', e);
      }
      try {
        const p = await database.getAcademicPrograms();
        setPrograms(p || []);
      } catch (e) {
        console.error('Error loading programs', e);
      }
    })();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "El nombre es requerido";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Formato de correo inválido";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (
      !/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone =
        "Número de teléfono inválido (10-15 dígitos)";
    }

    // Campus required for all roles
    if (!formData.campusId.trim()) {
      newErrors.campusId = "La sede es requerida";
    }

    // Academic program required for Estudiante, Monitor, Profesor
    if (
      (selectedRole === "Estudiante" ||
        selectedRole === "Monitor" ||
        selectedRole === "Profesor") &&
      !formData.academicProgramId.trim()
    ) {
      newErrors.academicProgramId = "La carrera/programa es requerida";
    }

    // Semester required for Estudiante and Monitor
    if (
      (selectedRole === "Estudiante" || selectedRole === "Monitor") &&
      !formData.semester.trim()
    ) {
      newErrors.semester = "El semestre es requerido";
    } else if (
      (selectedRole === "Estudiante" || selectedRole === "Monitor") &&
      !/^\d+$/.test(formData.semester.trim())
    ) {
      newErrors.semester = "El semestre debe ser un número entero";
    }

    // Role access code required for Profesor, Monitor (not for Invitado)
    if (
      (selectedRole === "Profesor" || selectedRole === "Monitor") &&
      !formData.roleAccessCode.trim()
    ) {
      newErrors.roleAccessCode = "El código de acceso es requerido";
    }

    // Additional check to ensure semester is a valid integer between 1 and 10 if provided
    const sem = Number(formData.semester.trim());
    if ((selectedRole === "Estudiante" || selectedRole === "Monitor") && formData.semester.trim()) {
      if (!Number.isInteger(sem)) {
        newErrors.semester = "El semestre debe ser un número entero";
      } else if (sem < 1 || sem > 10) {
        newErrors.semester = "El semestre debe estar entre 1 y 10";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;


  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !validateForm()) return;

    setServerError("");
    setIsSubmitting(true);

    const user: Omit<UserType, "createdAt"> = {
      cedula,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: selectedRole,
      ...(formData.academicProgramId ? { academicProgramId: formData.academicProgramId } : {}),
      ...(formData.campusId ? { campusId: formData.campusId } : {}),
      ...(formData.semester ? { semester: formData.semester.trim() } : {}),
      ...(selectedRole === "Invitado" 
        ? { roleAccessCode: "INV-2026" }
        : formData.roleAccessCode ? { roleAccessCode: formData.roleAccessCode.trim() } : {}),
      ...((selectedRole === "Estudiante" || selectedRole === "Monitor") && formData.semester
        ? { semester: Number(formData.semester.trim()) }
        : {}),
    };

    try {
      await onRegister(user);
    } catch (error: any) {
      console.error('Error registering user:', error);
      
      // Mapear ciertas propiedades del backend al frontend
      const fieldMapping: Record<string, string> = {
        'nationalId': 'cedula',
        'academicProgramId': 'academicProgramId',
        'campusId': 'campusId',
        'firstName': 'firstName',
        'lastName': 'lastName',
        'email': 'email',
        'phone': 'phone',
        'semester': 'semester',
        'roleAccessCode': 'roleAccessCode'
      };

      if (error instanceof ApiErrorWithFields && error.fieldErrors) {
        const mappedErrors: Record<string, string> = {};
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          const mappedField = fieldMapping[field] || field;
          mappedErrors[mappedField] = message;
        }
        setErrors(mappedErrors);
        setServerError("Por favor corrige los errores en el formulario");
      } else {
        setServerError(error?.message ?? "Error al registrar usuario. Contactar al administrador.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (step === "role") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl text-slate-900 mb-2">
              Nuevo Usuario
            </h1>
            <p className="text-slate-600">
              Cedula: {cedula} • Vamos a crear tu perfil
            </p>
          </div>

          {/* Role Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-xl text-slate-900 mb-6">
              Selecciona Tu Rol
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 border-2 border-slate-200 rounded-xl hover:border-green-500 transition-all text-left group"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg text-slate-900 mb-1">
                      {role.label}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {role.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={() => {
              setStep("role");
              setSelectedRole(null);
              setFormData({ ...initialFormData });
              setErrors({});
            }}
            className="text-green-600 hover:text-blue-700 text-sm mb-4 inline-flex items-center gap-1"
          >
            ← Cambiar Rol
          </button>
          <h1 className="text-2xl text-slate-900 mb-2">
            Completa Tu Perfil
          </h1>
          <p className="text-slate-600">
            Rol:{" "}
            <span className="font-medium text-green-600">
              {selectedRole}
            </span>{" "}
            • ID: {cedula}
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 space-y-6"
        >
          {/* Server Error Alert */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-bold text-sm mb-1">Error</p>
                <p className="text-red-700 text-sm">{serverError}</p>
              </div>
            </motion.div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-sm text-slate-500 uppercase tracking-wide mb-4">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm text-slate-700 mb-2"
                >
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange(
                      "firstName",
                      e.target.value,
                    )
                  }
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.firstName
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-green-500"
                    }`}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm text-slate-700 mb-2"
                >
                  Apellido{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange(
                      "lastName",
                      e.target.value,
                    )
                  }
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.lastName
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-green-500"
                    }`}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm text-slate-500 uppercase tracking-wide mb-4">
              Información de Contacto
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-slate-700 mb-2"
                >
                  Correo Electrónico{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleInputChange("email", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.email
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-green-500"
                    }`}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm text-slate-700 mb-2"
                >
                  Teléfono{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.phone
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-green-500"
                    }`}
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role-Specific Information */}
          <div>
            <h3 className="text-sm text-slate-500 uppercase tracking-wide mb-4">
              Información Académica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="campus" className="block text-sm text-slate-700 mb-2">
                  Sede <span className="text-red-500">*</span>
                </label>
                <select
                  id="campus"
                  value={formData.campusId}
                  onChange={(e) => handleInputChange('campusId', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.campusId ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-green-500'
                    }`}
                >
                  <option value="">Selecciona una sede</option>
                  {campuses.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
                {errors.campusId && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.campusId}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="program" className="block text-sm text-slate-700 mb-2">
                  Carrera/Programa {((selectedRole === 'Estudiante' || selectedRole === 'Monitor' || selectedRole === 'Profesor') && <span className="text-red-500">*</span>)}
                </label>
                <select
                  id="program"
                  value={formData.academicProgramId}
                  onChange={(e) => handleInputChange('academicProgramId', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.academicProgramId ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-green-500'
                    }`}
                >
                  <option value="">Selecciona un programa</option>
                  {programs.map(p => (
                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                  ))}
                </select>
                {errors.academicProgramId && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.academicProgramId}
                  </p>
                )}
              </div>
            </div>

            {/* Semester for students/monitors */}
            {(selectedRole === 'Estudiante' || selectedRole === 'Monitor') && (
              <div className="mt-4">
                <label htmlFor="semester" className="block text-sm text-slate-700 mb-2">
                  Semestre <span className="text-red-500">*</span>
                </label>
                <input
                  id="semester"
                  type="number"
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', e.target.value.replace(/\D/g, ''))}
                  placeholder="ej., 3"
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.semester ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-green-500'
                    }`}
                />
                {errors.semester && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.semester}
                  </p>
                )}
              </div>
            )}

            {/* Role access code for certain roles (not for Invitado) */}
            {(selectedRole === 'Profesor' || selectedRole === 'Monitor') && (
              <div className="mt-4">
                <label htmlFor="roleAccessCode" className="block text-sm text-slate-700 mb-2">
                  Código de Acceso <span className="text-red-500">*</span>
                </label>
                <input
                  id="roleAccessCode"
                  type="text"
                  value={formData.roleAccessCode}
                  onChange={(e) => handleInputChange('roleAccessCode', e.target.value)}
                  placeholder="Código privado"
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-lg transition-all outline-none ${errors.roleAccessCode ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-green-500'
                    }`}
                />
                {errors.roleAccessCode && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.roleAccessCode}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-white font-medium ${
              isSubmitting
                ? 'bg-slate-400 cursor-not-allowed shadow-slate-400/20'
                : 'bg-green-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                Completar Registro
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}



