import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'normal' | 'success' | 'warning' | 'critical';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'normal'
}: MetricCardProps) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          iconColor: 'text-gov-green',
          valueColor: 'text-gov-green',
          border: 'border-gov-accent'
        };
      case 'warning':
        return {
          iconColor: 'text-gov-orange',
          valueColor: 'text-gov-orange',
          border: 'border-gov-orange'
        };
      case 'critical':
        return {
          iconColor: 'text-gov-secondary',
          valueColor: 'text-gov-secondary',
          border: 'border-gov-secondary'
        };
      default:
        return {
          iconColor: 'text-gov-primary',
          valueColor: 'text-gov-black',
          border: 'border-gov-accent'
        };
    }
  };

  const colors = getColors();

  return (
    <Card
      className={`bg-gov-white ${colors.border} h-full`}
      data-testid="dashboard-metric-card"
      role="region"
      aria-labelledby={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}
      aria-describedby={`metric-${title.toLowerCase().replace(/\s+/g, '-')}-desc`}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
        <CardTitle
          id={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className='text-xs font-medium text-gov-gray-a'
        >
          {title}
        </CardTitle>
        <Icon
          className={`h-3 w-3 ${colors.iconColor}`}
          aria-hidden="true"
          role="img"
          aria-label={`Ícono de ${title}`}
        />
      </CardHeader>
      <CardContent className='pt-0 pb-2'>
        <div
          className={`text-lg font-bold ${colors.valueColor} transition-all duration-300 ease-in-out`}
          aria-label={`Valor actual: ${value}`}
        >
          {value}
        </div>
        <p
          id={`metric-${title.toLowerCase().replace(/\s+/g, '-')}-desc`}
          className={`text-xs ${variant === 'critical' ? 'text-gov-secondary font-medium' : 'text-gov-gray-b'}`}
          aria-label={`Estado: ${subtitle}`}
        >
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}