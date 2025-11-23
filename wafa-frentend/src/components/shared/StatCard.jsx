import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Reusable StatCard component for displaying statistics
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main stat value
 * @param {string} props.description - Optional description
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.trend - 'up', 'down', or null
 * @param {string} props.trendValue - Trend percentage/value
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional classes
 */
export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  loading = false,
  className = '',
}) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <div className="flex items-center gap-2 mt-1">
            {trendValue && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-green-600',
                  trend === 'down' && 'text-red-600',
                  !trend && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && '↑ '}
                {trend === 'down' && '↓ '}
                {trendValue}
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
