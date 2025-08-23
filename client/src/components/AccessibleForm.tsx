import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  required = false,
  description,
  children,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className={cn(
          'block text-sm font-medium text-gray-700',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </label>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-gray-600"
        >
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
          className: cn(
            (children as React.ReactElement).props?.className || '',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          ),
        })}
      </div>
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <svg 
            className="h-4 w-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  description?: string;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  title,
  description,
  children,
  className,
  ...props
}) => {
  return (
    <form 
      className={cn('space-y-6', className)}
      noValidate // We handle validation ourselves
      {...props}
    >
      {title && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      
      {children}
    </form>
  );
};