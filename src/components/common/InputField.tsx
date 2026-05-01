'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps extends InputProps {
  icon: LucideIcon;
  containerClassName?: string;
  isPassword?: boolean;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ icon: Icon, className, containerClassName, isPassword = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={cn('relative flex items-center', containerClassName)}>
        <Icon className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input 
          ref={ref} 
          className={cn('pl-9', isPassword ? 'pr-10' : '', className)} 
          type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
          {...props} 
        />
        {isPassword && (
          <button 
            type="button" 
            className="absolute right-3 h-4 w-4 text-muted-foreground hover:text-foreground" 
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
