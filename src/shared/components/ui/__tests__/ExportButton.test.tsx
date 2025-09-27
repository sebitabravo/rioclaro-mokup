import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportButton } from '../export-button';

vi.mock('@shared/services/ExportService', () => ({
  ExportService: {
    exportActivityData: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('ExportButton', () => {
  const mockData = [
    { id: 1, name: 'Test Data 1' },
    { id: 2, name: 'Test Data 2' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<ExportButton data={mockData} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('should be disabled when data is empty', () => {
    render(<ExportButton data={[]} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    expect(button).toBeDisabled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ExportButton data={mockData} disabled={true} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<ExportButton data={mockData} className="custom-class" />);

    const button = screen.getByRole('button', { name: /exportar/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<ExportButton data={mockData} size="sm" />);

    let button = screen.getByRole('button', { name: /exportar/i });
    expect(button).toHaveClass('h-9');

    rerender(<ExportButton data={mockData} size="lg" />);
    button = screen.getByRole('button', { name: /exportar/i });
    expect(button).toHaveClass('h-11');
  });

  it('should show dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    render(<ExportButton data={mockData} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });
  });

  it('should call ExportService when format is selected', async () => {
    const { ExportService } = await import('@shared/services/ExportService');
    const user = userEvent.setup();

    render(<ExportButton data={mockData} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    const csvOption = screen.getByText('CSV');
    await user.click(csvOption);

    await waitFor(() => {
      expect(ExportService.exportActivityData).toHaveBeenCalledWith(
        mockData,
        expect.objectContaining({
          format: 'csv',
          filename: expect.stringContaining('data_'),
          includeMetadata: true
        })
      );
    });
  });

  it('should use custom filename when provided', async () => {
    const { ExportService } = await import('@shared/services/ExportService');
    const user = userEvent.setup();

    render(<ExportButton data={mockData} filename="custom-file" />);

    const button = screen.getByRole('button', { name: /exportar/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
    });

    const excelOption = screen.getByText('Excel (.xlsx)');
    await user.click(excelOption);

    await waitFor(() => {
      expect(ExportService.exportActivityData).toHaveBeenCalledWith(
        mockData,
        expect.objectContaining({
          format: 'excel',
          filename: 'custom-file'
        })
      );
    });
  });

  it('should include date range when provided', async () => {
    const { ExportService } = await import('@shared/services/ExportService');
    const user = userEvent.setup();
    const dateRange = {
      start: '2024-01-01',
      end: '2024-01-31'
    };

    render(<ExportButton data={mockData} dateRange={dateRange} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    const pdfOption = screen.getByText('PDF');
    await user.click(pdfOption);

    await waitFor(() => {
      expect(ExportService.exportActivityData).toHaveBeenCalledWith(
        mockData,
        expect.objectContaining({
          format: 'pdf',
          dateRange
        })
      );
    });
  });

  it('should show loading state during export', async () => {
    const { ExportService } = await import('@shared/services/ExportService');
    const user = userEvent.setup();

    let resolveExport: () => void;
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });

    vi.mocked(ExportService.exportActivityData).mockReturnValueOnce(exportPromise);

    render(<ExportButton data={mockData} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    const csvOption = screen.getByText('CSV');
    await user.click(csvOption);

    await waitFor(() => {
      expect(screen.getByText('Exportando...')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /exportando/i })).toBeDisabled();

    resolveExport!();

    await waitFor(() => {
      expect(screen.getByText('Exportar')).toBeInTheDocument();
    });
  });

  it('should handle export errors gracefully', async () => {
    const { ExportService } = await import('@shared/services/ExportService');
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(ExportService.exportActivityData).mockRejectedValueOnce(
      new Error('Export failed')
    );

    render(<ExportButton data={mockData} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    const csvOption = screen.getByText('CSV');
    await user.click(csvOption);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error exporting data:', expect.any(Error));
    });

    await waitFor(() => {
      expect(screen.getByText('Exportar')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should not export when already exporting', async () => {
    const { ExportService } = await import('@shared/services/ExportService');
    const user = userEvent.setup();

    let resolveExport: () => void;
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });

    vi.mocked(ExportService.exportActivityData).mockReturnValueOnce(exportPromise);

    render(<ExportButton data={mockData} />);

    const button = screen.getByRole('button', { name: /exportar/i });

    await user.click(button);
    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    const csvOption = screen.getByText('CSV');
    await user.click(csvOption);

    await waitFor(() => {
      expect(screen.getByText('Exportando...')).toBeInTheDocument();
    });

    await user.click(button);
    await waitFor(() => {
      expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
    });

    const excelOption = screen.getByText('Excel (.xlsx)');
    await user.click(excelOption);

    expect(ExportService.exportActivityData).toHaveBeenCalledTimes(1);

    resolveExport!();
  });

  it('should render correct icons for each format', async () => {
    const user = userEvent.setup();
    render(<ExportButton data={mockData} />);

    const button = screen.getByRole('button', { name: /exportar/i });
    await user.click(button);

    await waitFor(() => {
      const csvItem = screen.getByText('CSV').closest('[role="menuitem"]');
      const excelItem = screen.getByText('Excel (.xlsx)').closest('[role="menuitem"]');
      const pdfItem = screen.getByText('PDF').closest('[role="menuitem"]');

      expect(csvItem).toBeInTheDocument();
      expect(excelItem).toBeInTheDocument();
      expect(pdfItem).toBeInTheDocument();
    });
  });

  it('should use custom exportType in filename when provided', async () => {
    const { ExportService } = await import('@shared/services/ExportService');
    const user = userEvent.setup();

    render(<ExportButton data={mockData} exportType="reports" />);

    const button = screen.getByRole('button', { name: /exportar/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    const csvOption = screen.getByText('CSV');
    await user.click(csvOption);

    await waitFor(() => {
      expect(ExportService.exportActivityData).toHaveBeenCalledWith(
        mockData,
        expect.objectContaining({
          filename: expect.stringContaining('reports_')
        })
      );
    });
  });
});