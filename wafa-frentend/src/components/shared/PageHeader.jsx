import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable PageHeader component for consistent page headers
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Optional description
 * @param {React.ReactNode} props.actions - Action buttons/components
 * @param {boolean} props.showBack - Show back button
 * @param {string} props.backTo - Custom back navigation path
 * @param {React.ReactNode} props.children - Additional content
 */
export function PageHeader({
  title,
  description,
  actions,
  showBack = false,
  backTo,
  children,
  className = '',
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
      <Separator />
    </div>
  );
}
