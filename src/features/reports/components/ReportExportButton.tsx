import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileBarChart } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@shared/components/ui/dropdown-menu';
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

interface ReportExportButtonProps {
  data: unknown[];
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  dateRange?: {
    start: string;
    end: string;
  };
  reportType: string;
}

export function ReportExportButton({
  data,
  disabled = false,
  className = '',
  size = 'default',
  dateRange,
  reportType
}: ReportExportButtonProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (disabled || data.length === 0) return;

    setIsExporting(format);

    try {
      const fileName = `${reportType}_${dateRange?.start || 'data'}_${dateRange?.end || new Date().toISOString().split('T')[0]}`;

      // Simplificado para el demo - en producción usaría ExportService apropiado
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      // Simular delay para UX
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch {
      // Error en exportación - se podría mostrar un toast o notificación de error
    } finally {
      setIsExporting(null);
    }
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    excel: FileSpreadsheet,
    pdf: FileText,
    json: FileBarChart,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled || data.length === 0}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {(['csv', 'excel', 'pdf', 'json'] as ExportFormat[]).map((format) => {
          const Icon = formatIcons[format];
          const isLoading = isExporting === format;

          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              <Icon className="h-4 w-4 mr-2" />
              {format.toUpperCase()}
              {isLoading && <span className="ml-auto text-xs">...</span>}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled className="text-xs text-gray-500">
          {data.length} registros
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}