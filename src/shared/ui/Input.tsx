import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-label-caps text-on-surface-variant">
        {label}
      </label>
      
      <input
        {...props}
        className={`input-field ${error ? 'border-error bg-error/5 text-error focus:ring-error' : ''} ${className}`}
      />
      
      {error && (
        <span className="text-xs text-error font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
