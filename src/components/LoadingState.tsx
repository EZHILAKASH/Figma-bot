import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const steps = [
  'Transmitting design screenshot...',
  'Analyzing spatial layouts & grids...',
  'Extracting color palettes & typography tokens...',
  'Structuring semantic layout elements...',
  'Injecting target platform design systems...',
  'Writing clean high-fidelity component code...',
  'Adding realistic mockup variables...',
  'Finalizing compilation & preview sandbox...',
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md shadow-xl min-h-[300px] w-full max-w-lg mx-auto animate-pulse">
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Glowing backdrop rings */}
        <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-xl animate-pulse" />
        <div className="absolute inset-2 rounded-full border border-violet-500/30 border-dashed animate-spin duration-1000" />
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>

      <div className="mt-8 space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight">AI Component Generation Active</h3>
        
        {/* Step Text Container */}
        <div className="h-6 overflow-hidden relative w-80 max-w-full mx-auto">
          <p className="text-xs text-white/60 font-medium transition-transform duration-500">
            {steps[currentStep]}
          </p>
        </div>

        {/* Step Indicator dots */}
        <div className="flex justify-center items-center space-x-1.5 pt-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-6 bg-violet-400'
                  : idx < currentStep
                  ? 'w-1.5 bg-violet-400/40'
                  : 'w-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
      
      <p className="text-[10px] text-white/30 font-medium mt-10 max-w-[280px]">
        Usually takes between 15-25 seconds depending on design complexity.
      </p>
    </div>
  );
}
