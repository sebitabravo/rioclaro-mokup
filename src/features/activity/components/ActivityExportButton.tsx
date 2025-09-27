import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileBarChart } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@shared/components/ui/dropdown-menu';
import { ExportService } from '@shared/services/ExportService';
import type { ExportFormat } from '@shared/types/export-types';
import { ActivityLog } from '@domain/entities/ActivityLog';

interface ActivityExportButtonProps {
  data: ActivityLog[];
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  dateRange?: {
    start: string;
    end: string;
  };
}

export const ActivityExportButton: React.FC<ActivityExportButtonProps> = ({
  data,
  disabled = false,
  className = '',
  size = 'default',
  dateRange
}) => {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (disabled || data.length === 0) return;

    try {
      setIsExporting(format);
      
      await ExportService.exportActivityData(data, {
        format,
        includeMetadata: format === 'excel', // Solo incluir metadata en Excel
        dateRange
      });

      // Simular delay para UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch {
      // Error en exportación - se podría mostrar un toast o notificación de error
    } finally {
      setIsExporting(null);
    }
  };

  const getButtonText = () => {
    if (isExporting) {
      switch (isExporting) {
        case 'excel': return 'Generando Excel...';
        case 'csv': return 'Generando CSV...';
        case 'pdf': return 'Generando PDF...';
      }
    }
    return 'Exportar';
  };

  const exportOptions = [
    {
      format: 'excel' as ExportFormat,
      icon: FileSpreadsheet,
      label: 'Excel (.xlsx)',
      description: 'Incluye metadatos y múltiples hojas',
      color: 'text-gov-green'
    },
    {
      format: 'csv' as ExportFormat,
      icon: FileText,
      label: 'CSV (.csv)',
      description: 'Formato compatible con cualquier programa',
      color: 'text-gov-primary'
    },
    {
      format: 'pdf' as ExportFormat,
      icon: FileBarChart,
      label: 'PDF Profesional',
      description: 'Reporte gubernamental con estadísticas',
      color: 'text-gov-secondary'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled || data.length === 0 || isExporting !== null}
          className={`gap-2 ${className}`}
        >
          <Download className="h-4 w-4" />
          {getButtonText()}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium">Exportar datos</p>
          <p className="text-xs text-muted-foreground">
            {data.length} registro{data.length !== 1 ? 's' : ''} disponible{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {exportOptions.map(option => {
          const IconComponent = option.icon;
          const isCurrentlyExporting = isExporting === option.format;
          
          return (
            <DropdownMenuItem
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={isExporting !== null}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <IconComponent className={`h-4 w-4 ${option.color}`} />
                <span className="font-medium">{option.label}</span>
                {isCurrentlyExporting && (
                  <div className="ml-auto">
                    <div className="h-4 w-4 border-2 border-gov-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                {option.description}
              </p>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground">
            💡 Tip: PDF incluye diseño profesional gubernamental
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActivityExportButton;
