import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapPin } from 'lucide-react';
import { MetricCard } from '../MetricCard';

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: '2.5m',
    subtitle: 'Normal range',
    icon: MapPin
  };

  it('should render with basic props', () => {
    render(<MetricCard {...defaultProps} />);

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('2.5m')).toBeInTheDocument();
    expect(screen.getByText('Normal range')).toBeInTheDocument();
  });

  it('should render with success variant styling', () => {
    render(<MetricCard {...defaultProps} variant="success" />);

    const valueElement = screen.getByText('2.5m');
    expect(valueElement).toHaveClass('text-gov-green');
  });

  it('should render with critical variant styling', () => {
    render(<MetricCard {...defaultProps} variant="critical" />);

    const valueElement = screen.getByText('2.5m');
    expect(valueElement).toHaveClass('text-gov-secondary');
  });

  it('should render with warning variant styling', () => {
    render(<MetricCard {...defaultProps} variant="warning" />);

    const valueElement = screen.getByText('2.5m');
    expect(valueElement).toHaveClass('text-gov-orange');
  });

  it('should render with normal variant styling by default', () => {
    render(<MetricCard {...defaultProps} />);

    const valueElement = screen.getByText('2.5m');
    expect(valueElement).toHaveClass('text-gov-black');
  });

  it('should render numeric values correctly', () => {
    render(<MetricCard {...defaultProps} value={42} />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should apply critical styling to subtitle for critical variant', () => {
    render(
      <MetricCard
        {...defaultProps}
        variant="critical"
        subtitle="¡2 críticas!"
      />
    );

    const subtitleElement = screen.getByText('¡2 críticas!');
    expect(subtitleElement).toHaveClass('text-gov-secondary');
    expect(subtitleElement).toHaveClass('font-medium');
  });

  it('should apply normal styling to subtitle for non-critical variants', () => {
    render(<MetricCard {...defaultProps} variant="success" />);

    const subtitleElement = screen.getByText('Normal range');
    expect(subtitleElement).toHaveClass('text-gov-gray-b');
    expect(subtitleElement).not.toHaveClass('font-medium');
  });
});