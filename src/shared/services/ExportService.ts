import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityLog } from '@domain/entities/ActivityLog';
import { formatDateTime } from '@shared/utils/formatters';

export type ExportFormat = 'excel' | 'csv' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Mapeo de tipos de actividad a español
const activityTypeLabels: Record<string, string> = {
  user_login: 'Inicio de sesión',
  user_logout: 'Cierre de sesión',
  station_created: 'Estación creada',
  station_updated: 'Estación actualizada',
  station_deleted: 'Estación eliminada',
  measurement_recorded: 'Medición registrada',
  alert_triggered: 'Alerta activada',
  alert_resolved: 'Alerta resuelta',
  report_generated: 'Reporte generado',
  report_downloaded: 'Reporte descargado',
  system_maintenance: 'Mantenimiento del sistema',
  data_export: 'Exportación de datos',
  configuration_changed: 'Configuración modificada',
  backup_created: 'Respaldo creado',
  threshold_updated: 'Umbral actualizado'
};

const statusLabels: Record<string, string> = {
  success: 'Exitoso',
  warning: 'Advertencia',
  error: 'Error',
  info: 'Información'
};

export class ExportService {
  /**
   * Exporta datos de actividad en el formato especificado
   */
  static async exportActivityData(
    data: ActivityLog[],
    options: ExportOptions
  ): Promise<void> {
    const filename = options.filename || this.generateFilename(options.format);
    
    switch (options.format) {
      case 'excel':
        await this.exportToExcel(data, filename, options);
        break;
      case 'csv':
        await this.exportToCSV(data, filename, options);
        break;
      case 'pdf':
        await this.exportToPDF(data, filename, options);
        break;
      default:
        throw new Error(`Formato de exportación no soportado: ${options.format}`);
    }
  }

  /**
   * Exporta a Excel (.xlsx)
   */
  private static async exportToExcel(
    data: ActivityLog[],
    filename: string,
    options: ExportOptions
  ): Promise<void> {
    // Preparar datos para Excel
    const excelData = data.map(log => ({
      'Fecha y Hora': formatDateTime(log.timestamp),
      'Tipo de Actividad': activityTypeLabels[log.activity_type] || log.activity_type,
      'Título': log.title,
      'Descripción': log.description,
      'Estado': statusLabels[log.status] || log.status,
      'Usuario': log.user_name || 'Sistema',
      'Estación': log.station_name || 'N/A',
      'Dirección IP': log.ip_address || 'N/A',
      ...(options.includeMetadata && log.metadata ? {
        'Metadata': JSON.stringify(log.metadata)
      } : {})
    }));

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Hoja principal con datos
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 20 }, // Fecha y Hora
      { wch: 25 }, // Tipo de Actividad
      { wch: 30 }, // Título
      { wch: 50 }, // Descripción
      { wch: 12 }, // Estado
      { wch: 20 }, // Usuario
      { wch: 25 }, // Estación
      { wch: 15 }, // IP
      ...(options.includeMetadata ? [{ wch: 30 }] : []) // Metadata
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Historial de Actividad');

    // Agregar hoja de resumen si hay datos
    if (data.length > 0) {
      const summaryData = this.generateSummaryData(data);
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');
    }

    // Descargar archivo
    XLSX.writeFile(wb, filename);
  }

  /**
   * Exporta a CSV
   */
  private static async exportToCSV(
    data: ActivityLog[],
    filename: string,
    _options: ExportOptions
  ): Promise<void> {
    // Preparar datos para CSV
    const csvData = data.map(log => ({
      'Fecha y Hora': formatDateTime(log.timestamp),
      'Tipo de Actividad': activityTypeLabels[log.activity_type] || log.activity_type,
      'Título': log.title,
      'Descripción': log.description,
      'Estado': statusLabels[log.status] || log.status,
      'Usuario': log.user_name || 'Sistema',
      'Estación': log.station_name || 'N/A',
      'Dirección IP': log.ip_address || 'N/A'
    }));

    // Convertir a CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    // Crear y descargar archivo
    const blob = new Blob(['\uFEFF' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    this.downloadBlob(blob, filename);
  }

  /**
   * Exporta a PDF profesional
   */
  private static async exportToPDF(
    data: ActivityLog[],
    filename: string,
    options: ExportOptions
  ): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colores del gobierno
    const govBlue = '#1e40af';
    const govGray = '#6b7280';
    const govDark = '#1f2937';

    // Header del documento
    this.addPDFHeader(doc, pageWidth);
    
    let currentY = 50;

    // Título del reporte
    doc.setFontSize(18);
    doc.setTextColor(govDark);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIAL DE ACTIVIDADES DEL SISTEMA', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setTextColor(govGray);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Monitoreo Río Claro', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

    // Información del reporte
    const reportInfo = [
      `Fecha de generación: ${formatDateTime(new Date().toISOString())}`,
      `Período: ${options.dateRange ? 
        `${formatDateTime(options.dateRange.start)} - ${formatDateTime(options.dateRange.end)}` : 
        'Todos los registros'}`,
      `Total de registros: ${data.length}`
    ];

    doc.setFontSize(10);
    doc.setTextColor(govGray);
    reportInfo.forEach(info => {
      doc.text(info, 20, currentY);
      currentY += 5;
    });

    currentY += 10;

    // Preparar datos para la tabla
    const tableData = data.map(log => [
      formatDateTime(log.timestamp),
      activityTypeLabels[log.activity_type] || log.activity_type,
      log.title,
      statusLabels[log.status] || log.status,
      log.user_name || 'Sistema',
      log.station_name || 'N/A'
    ]);

    // Configurar tabla
    autoTable(doc, {
      head: [['Fecha/Hora', 'Tipo', 'Actividad', 'Estado', 'Usuario', 'Estación']],
      body: tableData,
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: govDark,
      },
      headStyles: {
        fillColor: govBlue,
        textColor: '#ffffff',
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: '#f8fafc',
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Fecha
        1: { cellWidth: 35 }, // Tipo
        2: { cellWidth: 50 }, // Actividad
        3: { cellWidth: 20 }, // Estado
        4: { cellWidth: 25 }, // Usuario
        5: { cellWidth: 25 }, // Estación
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data: { pageNumber: number }) => {
        // Footer en cada página
        this.addPDFFooter(doc, pageWidth, pageHeight, data.pageNumber);
      }
    });

    // Agregar página de resumen si hay muchos datos
    if (data.length > 10) {
      doc.addPage();
      this.addPDFSummaryPage(doc, data, pageWidth);
    }

    // Descargar PDF
    doc.save(filename);
  }

  /**
   * Agrega header profesional al PDF
   */
  private static addPDFHeader(doc: jsPDF, pageWidth: number): void {
    const govBlue = '#1e40af';
    
    // Línea superior
    doc.setDrawColor(govBlue);
    doc.setLineWidth(2);
    doc.line(10, 15, pageWidth - 10, 15);
    
    // Logo placeholder y título
    doc.setFontSize(16);
    doc.setTextColor(govBlue);
    doc.setFont('helvetica', 'bold');
    doc.text('🌊 SISTEMA MONITOREO', 20, 25);
    
    doc.setFontSize(12);
    doc.setTextColor('#6b7280');
    doc.setFont('helvetica', 'normal');
    doc.text('Río Claro', 20, 32);
    
    // Fecha en el header
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, pageWidth - 60, 25);
  }

  /**
   * Agrega footer al PDF
   */
  private static addPDFFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number): void {
    const govGray = '#6b7280';
    
    // Línea inferior
    doc.setDrawColor(govGray);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);
    
    // Número de página
    doc.setFontSize(8);
    doc.setTextColor(govGray);
    doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    
    // Texto del gobierno
    doc.text('Gobierno Regional de La Araucanía - Sistema de Monitoreo Hídrico', pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  /**
   * Agrega página de resumen al PDF
   */
  private static addPDFSummaryPage(doc: jsPDF, data: ActivityLog[], pageWidth: number): void {
    const govBlue = '#1e40af';
    const govDark = '#1f2937';
    
    let currentY = 40;
    
    // Título de resumen
    doc.setFontSize(16);
    doc.setTextColor(govBlue);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 20;
    
    // Estadísticas generales
    const stats = this.generateSummaryData(data);
    
    doc.setFontSize(12);
    doc.setTextColor(govDark);
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
   * Genera datos de resumen
   */
  private static generateSummaryData(data: ActivityLog[]): Array<{Tipo: string, Cantidad: number}> {
    const typeCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {};
    
    data.forEach(log => {
      typeCount[log.activity_type] = (typeCount[log.activity_type] || 0) + 1;
      statusCount[log.status] = (statusCount[log.status] || 0) + 1;
    });
    
    const summary = [
      { Tipo: 'Total de actividades', Cantidad: data.length },
      ...Object.entries(statusCount).map(([status, count]) => ({
        Tipo: `Actividades ${statusLabels[status] || status}`,
        Cantidad: count
      })),
      ...Object.entries(typeCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({
          Tipo: activityTypeLabels[type] || type,
          Cantidad: count
        }))
    ];
    
    return summary;
  }

  /**
   * Genera nombre de archivo con timestamp
   */
  private static generateFilename(format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const extensions = {
      excel: 'xlsx',
      csv: 'csv',
      pdf: 'pdf'
    };
    
    return `historial_actividad_${timestamp}.${extensions[format]}`;
  }

  /**
   * Descarga un blob como archivo
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
