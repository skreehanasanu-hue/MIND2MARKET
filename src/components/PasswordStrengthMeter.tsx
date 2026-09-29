import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function evaluatePasswordStrength(password: string) {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Contains uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Contains number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Contains special symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let score = 0;
  let label = 'Very Weak';
  let color = 'bg-slate-300';
  let textColor = 'text-slate-500';

  if (password.length === 0) {
    score = 0;
    label = 'Enter a password';
    color = 'bg-slate-200';
    textColor = 'text-slate-400';
  } else if (metCount <= 2) {
    score = 1;
    label = 'Weak';
    color = 'bg-rose-500';
    textColor = 'text-rose-600';
  } else if (metCount === 3) {
    score = 2;
    label = 'Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-600';
  } else if (metCount === 4) {
    score = 3;
    label = 'Good';
    color = 'bg-blue-500';
    textColor = 'text-blue-600';
  } else {
    score = 4;
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-600';
  }

  return { criteria, metCount, score, label, color, textColor };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const { criteria, score, label, color, textColor } = evaluatePasswordStrength(password);

  return (
    <div className="mt-2.5 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 font-medium">Password Strength</span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= step ? color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-500">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {c.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={c.met ? 'text-slate-700 font-medium' : 'text-slate-400'}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
