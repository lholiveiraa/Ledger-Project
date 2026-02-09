
import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  activeStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, activeStep }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;

          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center relative flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                  isCompleted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' :
                  isActive ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-600 scale-110' :
                  'bg-slate-100 text-slate-400 border-2 border-slate-200'
                }`}>
                  {isCompleted ? <Check size={16} /> : idx + 1}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                </div>
                {/* Line connection */}
                {idx < steps.length - 1 && (
                  <div className={`absolute left-[50%] top-4 w-full h-0.5 -z-0 ${
                    idx < activeStep ? 'bg-indigo-600' : 'bg-slate-100'
                  }`} />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
