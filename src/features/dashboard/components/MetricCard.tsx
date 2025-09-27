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
    <Card className={`bg-gov-white ${colors.border} h-full`}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
        <CardTitle className='text-xs font-medium text-gov-gray-a'>
          {title}
        </CardTitle>
        <Icon className={`h-3 w-3 ${colors.iconColor}`} />
      </CardHeader>
      <CardContent className='pt-0 pb-2'>
        <div className={`text-lg font-bold ${colors.valueColor}`}>
          {value}
        </div>
        <p className={`text-xs ${variant === 'critical' ? 'text-gov-secondary font-medium' : 'text-gov-gray-b'}`}>
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}