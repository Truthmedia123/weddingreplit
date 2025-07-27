import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(({ 
  children, 
  className, 
  loading = false, 
  loadingText = 'Loading...', 
  disabled,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props 
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <Button
      ref={ref}
      className={cn(
        // Ensure minimum touch target size (44x44px)
        'min-h-[44px] min-w-[44px]',
        // High contrast focus ring
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
        // Disabled state with proper contrast
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div 
            className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
            aria-hidden="true"
          />
          <span className="sr-only">{loadingText}</span>
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';