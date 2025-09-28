import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileBarChart } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useRoleCheck } from '@shared/hooks/useAuthHooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@shared/components/ui/dropdown-menu';
import { ExportService } from '@shared/services/ExportService';
import type { ExportFormat } from '@shared/types/export-types';
import type { ActivityLog } from '@domain/entities/ActivityLog';

interface ExportButtonProps<T = unknown> {
  data: T[];
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  dateRange?: {
    start: string;
    end: string;
  };
  exportType?: string;
  filename?: string;
}

export function ExportButton<T = unknown>({
  data,
  disabled = false,
  className = '',
  size = 'default',
  dateRange,
  exportType = 'data',
  filename
}: ExportButtonProps<T>) {
  const { canExportData } = useRoleCheck();
  const [isExporting, setIsExporting] = useState(false);

  // Si el usuario no tiene permisos de exportación, no mostrar el botón
  if (!canExportData) {
    return null;
  }

  const handleExport = async (format: ExportFormat) => {
    if (isExporting || data.length === 0) return;

    setIsExporting(true);
    try {
      const exportFilename = filename || `${exportType}_${new Date().toISOString().split('T')[0]}`;

      await ExportService.exportActivityData(
        data as ActivityLog[], // Type assertion for ActivityLog array
        {
          format,
          filename: exportFilename,
          includeMetadata: true,
          dateRange
        }
      );
    } catch (error) {
      // Error handling - log error and could show toast notification in production
       
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <FileBarChart className="h-4 w-4" />;
      case 'csv':
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case 'excel':
        return 'Excel (.xlsx)';
      case 'pdf':
        return 'PDF';
      case 'csv':
        return 'CSV';
      default:
        return String(format).toUpperCase();
    }
  };

  const formats: ExportFormat[] = ['csv', 'excel', 'pdf'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled || isExporting || data.length === 0}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {formats.map((format, index) => (
          <div key={format}>
            <DropdownMenuItem onClick={() => handleExport(format)}>
              {getFormatIcon(format)}
              <span className="ml-2">{getFormatLabel(format)}</span>
            </DropdownMenuItem>
            {index < formats.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}