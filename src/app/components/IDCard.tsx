import { Fingerprint, Shield } from 'lucide-react';

export function IDCard() {
  return (
    <div className="w-64 h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-xl shadow-2xl overflow-hidden relative transform rotate-6 hover:rotate-0 transition-transform duration-300">
      {/* Card shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
      
      {/* Holographic pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
        }}></div>
      </div>

      {/* Card content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-white" />
              <p className="text-white text-xs">SecureTech Solutions</p>
            </div>
            <p className="text-blue-200 text-[10px]">Employee Access Card</p>
          </div>
          
          {/* Chip */}
          <div className="w-10 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md shadow-lg">
            <div className="w-full h-full p-1">
              <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-sm grid grid-cols-3 gap-[1px]">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-yellow-600/30 rounded-[1px]"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Employee info */}
        <div className="space-y-1">
          <div>
            <p className="text-blue-200 text-[10px] uppercase tracking-wide">Employee</p>
            <p className="text-white">Alejandro Martinez</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-[10px]">ID: SM-2847</p>
              <p className="text-blue-200 text-[10px]">Dept: Security</p>
            </div>
            <Fingerprint className="w-8 h-8 text-blue-300/50" />
          </div>
        </div>
      </div>

      {/* Magnetic stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-900/80 flex items-center justify-center">
        <div className="w-[90%] h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-sm"></div>
      </div>

      {/* NFC indicator */}
      <div className="absolute top-2 right-2">
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/40 rounded-full"></div>
          <div className="absolute w-3 h-3 border-2 border-white/40 rounded-full"></div>
          <div className="absolute w-2 h-2 border-2 border-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
