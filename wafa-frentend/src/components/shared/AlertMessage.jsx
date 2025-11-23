import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Reusable AlertMessage component for displaying alerts
 * @param {Object} props
 * @param {string} props.variant - 'default', 'success', 'warning', or 'error'
 * @param {string} props.title - Alert title
 * @param {string} props.description - Alert description/message
 * @param {React.ReactNode} props.children - Additional content
 */
export function AlertMessage({
  variant = 'default',
  title,
  description,
  children,
  className = '',
}) {
  const icons = {
    default: <Info className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
  };

  const variantClasses = {
    default: '',
    success: 'border-green-200 bg-green-50 text-green-900',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    error: 'border-red-200 bg-red-50 text-red-900',
  };

  return (
    <Alert className={`${variantClasses[variant]} ${className}`}>
      {icons[variant]}
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
      {children}
    </Alert>
  );
}
