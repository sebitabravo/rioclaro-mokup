import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // En producción, aquí podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, úsalo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Algo salió mal
            </h1>

            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Puedes intentar recargar la página o contactar al soporte técnico si el problema persiste.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Detalles técnicos (desarrollo)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  <div className="font-semibold text-red-600 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {this.state.error.stack}
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="font-semibold mb-1">Component Stack:</div>
                      <div className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gov-primary border border-gov-primary rounded-md hover:bg-gov-primary hover:text-white transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </button>

              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gov-primary border border-gov-primary rounded-md hover:bg-gov-primary-dark transition-colors"
              >
                Recargar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar en componentes funcionales si necesitan manejar errores
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: string) => {
    // En desarrollo, mostrar en consola
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error handled by useErrorHandler:', error, errorInfo);
    }

    // En producción, enviar a servicio de logging
    // errorReportingService.captureException(error, { extra: { errorInfo } });

    // Lanzar el error para que sea capturado por ErrorBoundary
    throw error;
  };

  return { handleError };
};

// Componente HOC para envolver componentes que necesiten error boundary
export const withErrorBoundary = <T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};