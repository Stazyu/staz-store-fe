import React, { InputHTMLAttributes, forwardRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  error,
  icon,
  className = '',
  type = 'text',
  showPasswordToggle = false,
  onTogglePassword,
  ...props
}, ref) => {
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={`block w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
            rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            ${icon ? 'pl-10' : 'pl-3'} pr-10`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {type === 'password' ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;