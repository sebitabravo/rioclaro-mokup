import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@shared/components/ui/button';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  showIcon?: boolean;
  iconSize?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  showIcon = false,
  iconSize = 'sm',
  disabled = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Calcular posición del tooltip
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollLeft + 8;
        break;
    }

    // Ajustar si se sale de la pantalla
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;

    setTooltipPosition({ top, left });
  };

  // Mostrar tooltip
  const showTooltip = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  // Ocultar tooltip
  const hideTooltip = () => {
    if (trigger === 'click') return; // Solo se cierra con el botón X en modo click
    setIsVisible(false);
  };

  // Cerrar tooltip (para modo click)
  const closeTooltip = () => {
    setIsVisible(false);
  };

  // Recalcular posición cuando se muestra
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
      return () => {
        window.removeEventListener('scroll', calculatePosition);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible, position]);

  // Manejar eventos según el trigger
  const triggerProps = trigger === 'hover'
    ? {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip
      }
    : {
        onClick: () => isVisible ? closeTooltip() : showTooltip()
      };

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block"
        {...triggerProps}
      >
        <div className="flex items-center space-x-1">
          {children}
          {showIcon && (
            <HelpCircle
              className={`${iconSizes[iconSize]} text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help`}
            />
          )}
        </div>
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 max-w-xs"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left
          }}
        >
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-start justify-between">
              <p className="leading-relaxed">{content}</p>
              {trigger === 'click' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeTooltip}
                  className="ml-2 p-0 h-auto text-gray-300 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${
                position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                'left-[-4px] top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Componente helper para agregar tooltips rápidamente
interface QuickTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  size?: 'sm' | 'md' | 'lg';
}

export function QuickTooltip({
  content,
  position = 'top',
  trigger = 'hover',
  size = 'sm'
}: QuickTooltipProps) {
  return (
    <Tooltip
      content={content}
      position={position}
      trigger={trigger}
      showIcon={true}
      iconSize={size}
    >
      <span></span>
    </Tooltip>
  );
}