import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Reusable EmptyState component for empty data states
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.title - Empty state title
 * @param {string} props.description - Empty state description
 * @param {React.ReactNode} props.action - Action button/component
 */
export function EmptyState({
  icon,
  title = 'No data found',
  description,
  action,
  className = '',
}) {
  return (
    <Card className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </Card>
  );
}

/**
 * PageSkeleton component for loading states
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  );
}
