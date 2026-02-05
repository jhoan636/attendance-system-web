import { useState, useEffect } from 'react';
import { CheckCircle2, Scan, Fingerprint, Shield, ChevronRight } from 'lucide-react';
import { IDCard } from './IDCard';

export function BiometricTerminal() {
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showCard, setShowCard] = useState(true);

  useEffect(() => {
    // Auto-trigger scan animation after 1 second
    const timer = setTimeout(() => {
      handleScan();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setShowCard(false);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);
    }, 2000);
  };

  return (
    <div className="relative">
      {/* ID Card being scanned */}
      <div 
        className={`absolute -left-32 top-1/2 -translate-y-1/2 transition-all duration-1000 ${
          showCard ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
        }`}
      >
        <IDCard />
      </div>

      {/* Biometric Terminal */}
      <div className="w-96 h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl border-4 border-slate-700 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b-2 border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-white text-lg">Access Terminal</h2>
              <p className="text-slate-400 text-xs">Biometric Verification System</p>
            </div>
          </div>
        </div>

        {/* Screen Display */}
        <div className="p-6 h-[calc(100%-80px)] flex flex-col">
          {/* Main display area */}
          <div className={`flex-1 rounded-xl p-6 transition-all duration-500 ${
            isVerified 
              ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500' 
              : isScanning 
              ? 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-2 border-blue-500'
              : 'bg-slate-800/50 border-2 border-slate-600'
          }`}>
            {!isScanning && !isVerified && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Scan className="w-20 h-20 text-slate-400 mb-4 animate-pulse" />
                <p className="text-slate-300 text-xl mb-2">Ready to Scan</p>
                <p className="text-slate-500 text-sm">Present your ID card to the scanner</p>
              </div>
            )}

            {isScanning && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative mb-6">
                  <Fingerprint className="w-24 h-24 text-blue-400 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <p className="text-blue-300 text-xl mb-2">Scanning...</p>
                <p className="text-blue-400 text-sm">Verifying biometric data</p>
                
                {/* Scanning progress bars */}
                <div className="w-full mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs text-blue-300">
                    <span>ID Authentication</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-blue-300">
                    <span>Biometric Match</span>
                    <span>87%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse transition-all duration-1000" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            )}

            {isVerified && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative mb-6">
                  <CheckCircle2 className="w-24 h-24 text-green-400 animate-pulse" />
                  <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"></div>
                </div>
                <p className="text-green-400 text-2xl mb-4">ID Verified</p>
                
                <div className="w-full bg-slate-900/50 rounded-lg p-4 mb-4 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-green-300 text-lg">Welcome, Alejandro (Monitor)</p>
                  </div>
                  <p className="text-green-400/80 text-sm mb-2">Data Preloaded</p>
                  
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Access Level:</span>
                      <span className="text-green-400">Security Monitor</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <span className="text-slate-300">Security Operations</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clearance:</span>
                      <span className="text-green-400">Level 3</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-green-300 text-sm">
                  <span>Access Granted</span>
                  <ChevronRight className="w-4 h-4 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Scanner indicator lights */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isVerified ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-slate-600'
            }`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isScanning ? 'bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse' : 'bg-slate-600'
            }`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              !isScanning && !isVerified ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-slate-600'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Scanning beam effect */}
      {isScanning && (
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
      )}
    </div>
  );
}
