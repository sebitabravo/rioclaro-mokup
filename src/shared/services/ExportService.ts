import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityLog } from '@domain/entities/ActivityLog';
import { formatDateTime } from '@shared/utils/formatters';

import type {
  ExportFormat,
  ExportOptions,
  ExcelExportRow,
  CSVExportRow,
  PDFTableRow,
  SummaryDataItem,
  ActivityStatistics,
  PDFPageInfo,
  FileGenerationResult
} from '@shared/types/export-types';

import {
  ACTIVITY_TYPE_LABELS,
  STATUS_LABELS,
  PDF_COLORS,
  EXCEL_COLUMN_WIDTHS,
  PDF_COLUMN_WIDTHS,
  FILE_EXTENSIONS,
  getActivityTypeLabel,
  getStatusLabel,
  sanitizeForCSV,
  formatExportTimestamp,
  validateActivityLog,
  ExportError,
  DataValidationError
} from '@shared/types/export-types';

export class ExportService {
  /**
   * Exporta datos de actividad en el formato especificado con type safety completo
   */
  static async exportActivityData(
    data: ActivityLog[],
    options: ExportOptions
  ): Promise<FileGenerationResult> {
    try {
      // Validación de entrada
      this.validateExportData(data, options);

      const filename = options.filename || this.generateFilename(options.format);

      switch (options.format) {
        case 'excel':
          await this.exportToExcel(data, filename, options);
          break;
        case 'csv':
          await this.exportToCSV(data, filename);
          break;
        case 'pdf':
          await this.exportToPDF(data, filename, options);
          break;
        default:
          // Esta línea nunca debería ejecutarse debido al type checking
          throw new ExportError(
            `Formato de exportación no soportado: ${options.format}`,
            options.format
          );
      }

      return {
        success: true,
        filename,
        size: this.estimateFileSize(data, options.format)
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      if (error instanceof ExportError) {
        throw error;
      }

      throw new ExportError(
        `Error durante la exportación: ${errorMessage}`,
        options.format,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Valida los datos de entrada antes de la exportación
   */
  private static validateExportData(data: ActivityLog[], options: ExportOptions): void {
    if (!Array.isArray(data)) {
      throw new DataValidationError(
        'Los datos deben ser un array de ActivityLog',
        options.format,
        data
      );
    }

    if (data.length === 0) {
      throw new DataValidationError(
        'No hay datos para exportar',
        options.format,
        data
      );
    }

    // Validar que todos los elementos sean ActivityLog válidos
    const invalidLogs = data.filter(log => !validateActivityLog(log));
    if (invalidLogs.length > 0) {
      throw new DataValidationError(
        `Se encontraron ${invalidLogs.length} registros inválidos en los datos`,
        options.format,
        invalidLogs
      );
    }
  }

  /**
   * Estima el tamaño del archivo basado en el formato y datos
   */
  private static estimateFileSize(data: ActivityLog[], format: ExportFormat): number {
    const baseSize = data.length * 200; // Estimación base por registro

    switch (format) {
      case 'excel':
        return Math.round(baseSize * 1.5); // Excel es más compacto
      case 'csv':
        return Math.round(baseSize * 0.8); // CSV es más ligero
      case 'pdf':
        return Math.round(baseSize * 2.5); // PDF incluye formato y metadatos
      default:
        return baseSize;
    }
  }

  /**
   * Exporta a Excel (.xlsx) con type safety completo
   */
  private static async exportToExcel(
    data: ActivityLog[],
    filename: string,
    options: ExportOptions
  ): Promise<void> {
    try {
      // Generar datos tipados para Excel
      const excelData: ExcelExportRow[] = data.map((log): ExcelExportRow => {
        const baseRow: ExcelExportRow = {
          'Fecha y Hora': formatExportTimestamp(log.timestamp),
          'Tipo de Actividad': getActivityTypeLabel(log.activity_type),
          'Título': log.title,
          'Descripción': log.description,
          'Estado': getStatusLabel(log.status),
          'Usuario': log.user_name || 'Sistema',
          'Estación': log.station_name || 'N/A',
          'Dirección IP': log.ip_address || 'N/A'
        };

        // Agregar metadata si está habilitada
        if (options.includeMetadata && log.metadata) {
          baseRow['Metadata'] = JSON.stringify(log.metadata, null, 2);
        }

        return baseRow;
      });

      const wb = XLSX.utils.book_new();

      // Crear hoja principal con datos tipados
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Configurar anchos de columna usando constantes tipadas
      const columnWidths = [
        { wch: EXCEL_COLUMN_WIDTHS.timestamp },
        { wch: EXCEL_COLUMN_WIDTHS.activityType },
        { wch: EXCEL_COLUMN_WIDTHS.title },
        { wch: EXCEL_COLUMN_WIDTHS.description },
        { wch: EXCEL_COLUMN_WIDTHS.status },
        { wch: EXCEL_COLUMN_WIDTHS.user },
        { wch: EXCEL_COLUMN_WIDTHS.station },
        { wch: EXCEL_COLUMN_WIDTHS.ip },
        ...(options.includeMetadata ? [{ wch: EXCEL_COLUMN_WIDTHS.metadata }] : [])
      ];
      ws['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Historial de Actividad');

      // Agregar hoja de resumen si hay datos
      if (data.length > 0) {
        const summaryData = this.generateSummaryData(data);
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');
      }

      XLSX.writeFile(wb, filename);

    } catch (error) {
      throw new ExportError(
        `Error generando archivo Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'excel',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Exporta a CSV con type safety completo
   */
  private static async exportToCSV(
    data: ActivityLog[],
    filename: string,
  ): Promise<void> {
    try {
      // Generar datos tipados para CSV
      const csvData: CSVExportRow[] = data.map((log): CSVExportRow => ({
        'Fecha y Hora': formatExportTimestamp(log.timestamp),
        'Tipo de Actividad': getActivityTypeLabel(log.activity_type),
        'Título': log.title,
        'Descripción': log.description,
        'Estado': getStatusLabel(log.status),
        'Usuario': log.user_name || 'Sistema',
        'Estación': log.station_name || 'N/A',
        'Dirección IP': log.ip_address || 'N/A'
      }));

      // Type-safe header extraction
      const sampleRow = csvData[0];
      if (!sampleRow) {
        throw new DataValidationError('No hay datos para exportar a CSV', 'csv', data);
      }

      const headers = Object.keys(sampleRow) as Array<keyof CSVExportRow>;

      // Type-safe CSV content generation
      const csvContent = [
        headers.join(','),
        ...csvData.map(row =>
          headers.map(header => {
            const cellValue = row[header];
            return sanitizeForCSV(String(cellValue));
          }).join(',')
        )
      ].join('\n');

      // Crear blob con BOM para UTF-8
      const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });

      this.downloadBlob(blob, filename);

    } catch (error) {
      throw new ExportError(
        `Error generando archivo CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'csv',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Exporta a PDF profesional con type safety completo
   */
  private static async exportToPDF(
    data: ActivityLog[],
    filename: string,
    options: ExportOptions
  ): Promise<void> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      this.addPDFHeader(doc, pageWidth);

      let currentY = 50;

      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(PDF_COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTORIAL DE ACTIVIDADES DEL SISTEMA', pageWidth / 2, currentY, { align: 'center' });

      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(PDF_COLORS.secondary);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Monitoreo Río Claro', pageWidth / 2, currentY, { align: 'center' });

      currentY += 15;

      // Información del reporte
      const reportInfo = [
        `Fecha de generación: ${formatExportTimestamp(new Date().toISOString())}`,
        `Período: ${options.dateRange ?
          `${formatExportTimestamp(options.dateRange.start)} - ${formatExportTimestamp(options.dateRange.end)}` :
          'Todos los registros'}`,
        `Total de registros: ${data.length}`
      ];

      doc.setFontSize(10);
      doc.setTextColor(PDF_COLORS.secondary);
      reportInfo.forEach(info => {
        doc.text(info, 20, currentY);
        currentY += 5;
      });

      currentY += 10;

      // Generar datos de tabla tipados
      const tableData: string[][] = data.map((log): string[] => [
        formatExportTimestamp(log.timestamp),
        getActivityTypeLabel(log.activity_type),
        log.title,
        getStatusLabel(log.status),
        log.user_name || 'Sistema',
        log.station_name || 'N/A'
      ]);

      // Configurar tabla con tipos seguros
      autoTable(doc, {
        head: [['Fecha/Hora', 'Tipo', 'Actividad', 'Estado', 'Usuario', 'Estación']],
        body: tableData,
        startY: currentY,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: PDF_COLORS.text,
        },
        headStyles: {
          fillColor: PDF_COLORS.primary,
          textColor: '#ffffff',
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: '#f8fafc',
        },
        columnStyles: {
          0: { cellWidth: PDF_COLUMN_WIDTHS.timestamp },
          1: { cellWidth: PDF_COLUMN_WIDTHS.activityType },
          2: { cellWidth: PDF_COLUMN_WIDTHS.title },
          3: { cellWidth: PDF_COLUMN_WIDTHS.status },
          4: { cellWidth: PDF_COLUMN_WIDTHS.user },
          5: { cellWidth: PDF_COLUMN_WIDTHS.station },
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data) => {
          const pageInfo: PDFPageInfo = {
            pageNumber: data.pageNumber,
            pageCount: data.pageCount || undefined,
            currentY: data.cursor?.y || undefined
          };
          this.addPDFFooter(doc, pageWidth, pageHeight, pageInfo);
        }
      });

      // Agregar página de resumen si hay suficientes datos
      if (data.length > 10) {
        doc.addPage();
        this.addPDFSummaryPage(doc, data, pageWidth);
      }

      doc.save(filename);

    } catch (error) {
      throw new ExportError(
        `Error generando archivo PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'pdf',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Agrega header profesional al PDF con tipos seguros
   */
  private static addPDFHeader(doc: jsPDF, pageWidth: number): void {
    doc.setDrawColor(PDF_COLORS.primary);
    doc.setLineWidth(2);
    doc.line(10, 15, pageWidth - 10, 15);

    doc.setFontSize(16);
    doc.setTextColor(PDF_COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('🌊 SISTEMA MONITOREO', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(PDF_COLORS.secondary);
    doc.setFont('helvetica', 'normal');
    doc.text('Río Claro', 20, 32);

    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, pageWidth - 60, 25);
  }

  /**
   * Agrega footer al PDF con tipos seguros
   */
  private static addPDFFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageInfo: PDFPageInfo): void {
    doc.setDrawColor(PDF_COLORS.secondary);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);

    doc.setFontSize(8);
    doc.setTextColor(PDF_COLORS.secondary);

    const pageText = pageInfo.pageCount
      ? `Página ${pageInfo.pageNumber} de ${pageInfo.pageCount}`
      : `Página ${pageInfo.pageNumber}`;

    doc.text(pageText, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text('Gobierno Regional de La Araucanía - Sistema de Monitoreo Hídrico', pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  /**
   * Agrega página de resumen al PDF con tipos seguros
   */
  private static addPDFSummaryPage(doc: jsPDF, data: ActivityLog[], pageWidth: number): void {
    let currentY = 40;

    doc.setFontSize(16);
    doc.setTextColor(PDF_COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', pageWidth / 2, currentY, { align: 'center' });

    currentY += 20;

    const stats = this.generateSummaryData(data);

    doc.setFontSize(12);
    doc.setTextColor(PDF_COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Estadísticas Generales:', 20, currentY);

    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    stats.forEach(stat => {
      doc.text(`• ${stat.Tipo}: ${stat.Cantidad}`, 25, currentY);
      currentY += 6;
    });
  }

  /**
   * Genera datos de resumen con tipos seguros
   */
  private static generateSummaryData(data: ActivityLog[]): SummaryDataItem[] {
    const typeCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {};

    data.forEach(log => {
      typeCount[log.activity_type] = (typeCount[log.activity_type] || 0) + 1;
      statusCount[log.status] = (statusCount[log.status] || 0) + 1;
    });

    const summary: SummaryDataItem[] = [
      { Tipo: 'Total de actividades', Cantidad: data.length },
      ...Object.entries(statusCount).map(([status, count]): SummaryDataItem => ({
        Tipo: `Actividades ${getStatusLabel(status)}`,
        Cantidad: count
      })),
      ...Object.entries(typeCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([type, count]): SummaryDataItem => ({
          Tipo: getActivityTypeLabel(type),
          Cantidad: count
        }))
    ];

    return summary;
  }

  /**
   * Genera nombre de archivo con timestamp de forma type-safe
   */
  private static generateFilename(format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = FILE_EXTENSIONS[format];

    return `historial_actividad_${timestamp}.${extension}`;
  }

  /**
   * Descarga un blob como archivo con manejo de errores
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);

    } catch (error) {
      throw new ExportError(
        `Error descargando archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'csv' // Default to CSV for download errors
      );
    }
  }
}
