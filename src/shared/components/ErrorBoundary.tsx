import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import {
  AppError,
  ApiError,
  isAppError,
  isValidationError,
  isNetworkError,
  isApiError,
  getUserFriendlyMessage,
  createErrorLogger
} from '@shared/types/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | AppError;
  errorInfo?: ErrorInfo;
  appError?: AppError;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorLogger = createErrorLogger();

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error | AppError): State {
    const appError = isAppError(error) ? error : undefined;
    return {
      hasError: true,
      error,
      appError
    };
  }

  componentDidCatch(error: Error | AppError, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      appError: isAppError(error) ? error : undefined
    });

    // Log del error usando el sistema tipado
    if (isAppError(error)) {
      this.errorLogger.logError(error);
    } else {
      // Para errores no tipados, crear un AppError
      const normalizedError = new (class extends AppError {
        getUserMessage() { return 'Ocurrió un error inesperado'; }
      })(
        error.message,
        'REACT_ERROR',
        500,
        true,
        {
          originalName: error.name,
          componentStack: errorInfo.componentStack
        }
      );
      this.errorLogger.logError(normalizedError);
    }

    if (process.env.NODE_ENV === 'development') {
       
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      appError: undefined
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private getErrorIcon() {
    const { appError } = this.state;

    if (isNetworkError(appError)) {
      return <AlertTriangle className="h-12 w-12 text-orange-500" />;
    }
    if (isApiError(appError) && (appError as ApiError).statusCode === 401) {
      return <AlertTriangle className="h-12 w-12 text-blue-500" />;
    }
    if (isValidationError(appError)) {
      return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }

    return <AlertTriangle className="h-12 w-12 text-red-500" />;
  }

  private getErrorTitle() {
    const { appError } = this.state;

    if (isNetworkError(appError)) {
      return 'Problema de conexión';
    }
    if (isApiError(appError)) {
      const apiError = appError as ApiError;
      if (apiError.statusCode === 401) return 'Sesión expirada';
      if (apiError.statusCode === 403) return 'Sin permisos';
      if (apiError.statusCode === 404) return 'No encontrado';
      if (apiError.statusCode >= 500) return 'Error del servidor';
    }
    if (isValidationError(appError)) {
      return 'Datos incorrectos';
    }

    return 'Algo salió mal';
  }

  private getUserMessage() {
    const { appError, error } = this.state;

    if (appError) {
      return appError.getUserMessage();
    }

    if (error) {
      return getUserFriendlyMessage(error);
    }

    return 'Ha ocurrido un error inesperado. Puedes intentar recargar la página o contactar al soporte técnico si el problema persiste.';
  }

  private shouldShowRetryButton() {
    const { appError } = this.state;

    // Para errores de red o errores temporales, mostrar botón de reintentar
    if (isNetworkError(appError)) return true;
    if (isApiError(appError) && (appError as ApiError).statusCode >= 500) return true;

    // Para errores de validación o autorización, no mostrar reintentar
    if (isValidationError(appError)) return false;
    if (isApiError(appError) && (appError as ApiError).statusCode === 401) return false;

    return true;
  }

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, úsalo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto con manejo de errores tipados
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              {this.getErrorIcon()}
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {this.getErrorTitle()}
            </h1>

            <p className="text-gray-600 mb-6">
              {this.getUserMessage()}
            </p>

            {/* Mostrar errores de validación específicos */}
            {isValidationError(this.state.appError) && (
              <div className="mb-6 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Errores encontrados:
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {this.state.appError.fieldErrors.map((fieldError, index) => (
                    <li key={index}>
                      <strong>{fieldError.field}:</strong> {fieldError.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Detalles técnicos (desarrollo)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  <div className="font-semibold text-red-600 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  {this.state.appError && (
                    <div className="mb-2">
                      <div><strong>Código:</strong> {this.state.appError.code}</div>
                      <div><strong>Status:</strong> {this.state.appError.statusCode}</div>
                      <div><strong>Timestamp:</strong> {this.state.appError.timestamp}</div>
                      {this.state.appError.context && (
                        <div><strong>Contexto:</strong> {JSON.stringify(this.state.appError.context, null, 2)}</div>
                      )}
                    </div>
                  )}
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
              {this.shouldShowRetryButton() && (
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gov-primary border border-gov-primary rounded-md hover:bg-gov-primary hover:text-white transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </button>
              )}

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
  const errorLogger = createErrorLogger();

  const handleError = (error: Error | AppError, errorInfo?: string) => {
    // Normalizar el error a AppError si no lo es
    const appError = isAppError(error) ? error : new (class extends AppError {
      getUserMessage() { return 'Ocurrió un error inesperado'; }
    })(
      error.message,
      'COMPONENT_ERROR',
      500,
      true,
      { errorInfo, originalName: error.name }
    );

    // Log del error
    errorLogger.logError(appError);

    // En desarrollo, mostrar en consola con más detalles
    if (process.env.NODE_ENV === 'development') {
       
      console.error('Error handled by useErrorHandler:', {
        error: appError.toJSON(),
        originalError: error,
        errorInfo
      });
    }

    // Lanzar el error para que sea capturado por ErrorBoundary
    throw appError;
  };

  /**
   * Maneja errores de forma async sin lanzar excepciones
   */
  const handleAsyncError = async (error: Error | AppError, errorInfo?: string): Promise<void> => {
    const appError = isAppError(error) ? error : new (class extends AppError {
      getUserMessage() { return 'Ocurrió un error inesperado'; }
    })(
      error.message,
      'ASYNC_ERROR',
      500,
      true,
      { errorInfo, originalName: error.name }
    );

    errorLogger.logError(appError);

    if (process.env.NODE_ENV === 'development') {
       
      console.error('Async error handled:', appError.toJSON());
    }

    // En lugar de lanzar, se podría mostrar un toast o notificación
    // Por ahora solo loggeamos el error
  };

  return {
    handleError,
    handleAsyncError,
    isAppError,
    isValidationError,
    isNetworkError,
    isApiError
  };
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