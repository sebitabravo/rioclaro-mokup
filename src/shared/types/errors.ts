// Sistema de manejo de errores tipados para Clean Architecture
// Siguiendo principios DDD y Clean Architecture

// ==========================================
// Base Error Classes
// ==========================================

/**
 * Clase base para todos los errores de la aplicación
 */
export abstract class AppError extends Error {
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    isOperational: boolean = true,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.isOperational = isOperational;

    // Mantener el stack trace para debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializa el error para logging o respuestas API
   */
  toJSON(): ErrorResponse {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }

  /**
   * Retorna un mensaje amigable para el usuario
   */
  abstract getUserMessage(): string;
}

// ==========================================
// Domain Errors (Business Logic)
// ==========================================

/**
 * Errores relacionados con reglas de negocio
 */
export class DomainError extends AppError {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message, code, 422, true, context);
  }

  getUserMessage(): string {
    return this.message; // Los errores de dominio suelen ser mostrados directamente
  }
}

/**
 * Error cuando una entidad no es encontrada
 */
export class EntityNotFoundError extends DomainError {
  constructor(
    entityName: string,
    identifier: string | number,
    context?: Record<string, unknown>
  ) {
    super(
      `${entityName} con identificador '${identifier}' no fue encontrado`,
      'ENTITY_NOT_FOUND',
      { entityName, identifier, ...context }
    );
  }

  getUserMessage(): string {
    const entityName = this.context?.entityName as string;
    return `${entityName} no encontrado`;
  }
}

/**
 * Error cuando ya existe una entidad con los mismos datos únicos
 */
export class EntityAlreadyExistsError extends DomainError {
  constructor(
    entityName: string,
    field: string,
    value: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Ya existe ${entityName} con ${field}: ${value}`,
      'ENTITY_ALREADY_EXISTS',
      { entityName, field, value, ...context }
    );
  }

  getUserMessage(): string {
    const entityName = this.context?.entityName as string;
    const field = this.context?.field as string;
    return `Ya existe un ${entityName} con ese ${field}`;
  }
}

// ==========================================
// Validation Errors
// ==========================================

export interface ValidationFieldError {
  field: string;
  value: unknown;
  message: string;
  code: string;
}

/**
 * Error de validación con detalles específicos por campo
 */
export class ValidationError extends DomainError {
  constructor(
    public readonly fieldErrors: ValidationFieldError[],
    context?: Record<string, unknown>
  ) {
    const message = `Errores de validación: ${fieldErrors.map(e => e.message).join(', ')}`;
    super(message, 'VALIDATION_ERROR', { fieldErrors, ...context });
  }

  getUserMessage(): string {
    return 'Algunos campos contienen errores. Por favor, revisa la información ingresada.';
  }

  /**
   * Obtiene errores por campo para mostrar en formularios
   */
  getFieldErrors(): Record<string, string> {
    return this.fieldErrors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);
  }
}

// ==========================================
// Infrastructure Errors
// ==========================================

/**
 * Errores de infraestructura (red, base de datos, APIs externas)
 */
export class InfrastructureError extends AppError {
  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message, code, statusCode, true, context);
  }

  getUserMessage(): string {
    return 'Ocurrió un problema técnico. Por favor, inténtalo nuevamente.';
  }
}

/**
 * Error de conexión de red
 */
export class NetworkError extends InfrastructureError {
  constructor(
    url: string,
    method: string = 'GET',
    context?: Record<string, unknown>
  ) {
    super(
      `Error de conexión al intentar ${method} ${url}`,
      'NETWORK_ERROR',
      503,
      { url, method, ...context }
    );
  }

  getUserMessage(): string {
    return 'Problema de conexión. Verifica tu internet e inténtalo nuevamente.';
  }
}

/**
 * Error de API externa
 */
export class ApiError extends InfrastructureError {
  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    context?: Record<string, unknown>
  ) {
    super(
      message,
      'API_ERROR',
      statusCode,
      { endpoint, ...context }
    );
  }

  getUserMessage(): string {
    if (this.statusCode >= 500) {
      return 'El servidor está experimentando problemas. Inténtalo más tarde.';
    }
    if (this.statusCode === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }
    if (this.statusCode === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }
    if (this.statusCode === 401) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    return 'Ocurrió un error en el servidor. Inténtalo nuevamente.';
  }
}

/**
 * Error de base de datos
 */
export class DatabaseError extends InfrastructureError {
  constructor(
    operation: string,
    details?: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Error en base de datos durante operación: ${operation}${details ? ` - ${details}` : ''}`,
      'DATABASE_ERROR',
      500,
      { operation, details, ...context }
    );
  }

  getUserMessage(): string {
    return 'Error interno del sistema. El equipo técnico ha sido notificado.';
  }
}

// ==========================================
// Application Errors (Use Cases)
// ==========================================

/**
 * Errores específicos de la aplicación (use cases)
 */
export class ApplicationError extends AppError {
  constructor(
    message: string,
    code: string,
    statusCode: number = 400,
    context?: Record<string, unknown>
  ) {
    super(message, code, statusCode, true, context);
  }

  getUserMessage(): string {
    return this.message;
  }
}

/**
 * Error de autorización
 */
export class UnauthorizedError extends ApplicationError {
  constructor(
    action: string,
    resource?: string,
    context?: Record<string, unknown>
  ) {
    super(
      `No autorizado para realizar la acción: ${action}${resource ? ` en ${resource}` : ''}`,
      'UNAUTHORIZED',
      401,
      { action, resource, ...context }
    );
  }

  getUserMessage(): string {
    return 'No tienes permisos para realizar esta acción.';
  }
}

/**
 * Error de negocio específico del dominio
 */
export class BusinessRuleError extends ApplicationError {
  constructor(
    rule: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(
      message,
      'BUSINESS_RULE_VIOLATION',
      422,
      { rule, ...context }
    );
  }

  getUserMessage(): string {
    return this.message;
  }
}

// ==========================================
// Specific Domain Errors for this App
// ==========================================

/**
 * Errores específicos de estaciones de monitoreo
 */
export class StationError extends DomainError {
  constructor(
    message: string,
    code: string,
    stationId?: number,
    context?: Record<string, unknown>
  ) {
    super(message, `STATION_${code}`, { stationId, ...context });
  }
}

/**
 * Error cuando las coordenadas de una estación son inválidas
 */
export class InvalidCoordinatesError extends StationError {
  constructor(
    latitude: number,
    longitude: number,
    context?: Record<string, unknown>
  ) {
    super(
      `Coordenadas inválidas: latitud ${latitude}, longitud ${longitude}`,
      'INVALID_COORDINATES',
      undefined,
      { latitude, longitude, ...context }
    );
  }

  getUserMessage(): string {
    return 'Las coordenadas ingresadas no son válidas.';
  }
}

/**
 * Error cuando el umbral de una estación es inválido
 */
export class InvalidThresholdError extends StationError {
  constructor(
    threshold: number,
    context?: Record<string, unknown>
  ) {
    super(
      `Umbral inválido: ${threshold}. Debe ser un valor positivo.`,
      'INVALID_THRESHOLD',
      undefined,
      { threshold, ...context }
    );
  }

  getUserMessage(): string {
    return 'El umbral debe ser un valor positivo.';
  }
}

/**
 * Errores específicos de mediciones
 */
export class MeasurementError extends DomainError {
  constructor(
    message: string,
    code: string,
    measurementId?: number,
    context?: Record<string, unknown>
  ) {
    super(message, `MEASUREMENT_${code}`, { measurementId, ...context });
  }
}

/**
 * Error cuando una medición está fuera del rango válido
 */
export class MeasurementOutOfRangeError extends MeasurementError {
  constructor(
    value: number,
    minValue: number,
    maxValue: number,
    context?: Record<string, unknown>
  ) {
    super(
      `Medición fuera de rango: ${value}. Debe estar entre ${minValue} y ${maxValue}`,
      'OUT_OF_RANGE',
      undefined,
      { value, minValue, maxValue, ...context }
    );
  }

  getUserMessage(): string {
    const { minValue, maxValue } = this.context as { minValue: number; maxValue: number };
    return `La medición debe estar entre ${minValue} y ${maxValue}.`;
  }
}

// ==========================================
// Error Response Types
// ==========================================

export interface ErrorResponse {
  name: string;
  message: string;
  code: string;
  statusCode: number;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  fieldErrors: ValidationFieldError[];
}

// ==========================================
// Error Utilities
// ==========================================

/**
 * Type guards para identificar tipos específicos de errores
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isDomainError = (error: unknown): error is DomainError => {
  return error instanceof DomainError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isInfrastructureError = (error: unknown): error is InfrastructureError => {
  return error instanceof InfrastructureError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

/**
 * Convierte errores desconocidos a AppError
 */
export const normalizeError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      { originalName: error.name, stack: error.stack }
    );
  }

  return new ApplicationError(
    'Error desconocido',
    'UNKNOWN_ERROR',
    500,
    { originalError: error }
  );
};

/**
 * Extrae el código de estado HTTP de un error
 */
export const getErrorStatusCode = (error: unknown): number => {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
};

/**
 * Extrae un mensaje amigable para el usuario
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.getUserMessage();
  }
  return 'Ocurrió un error inesperado. Por favor, inténtalo nuevamente.';
};

// ==========================================
// Error Handler para logging
// ==========================================

export interface ErrorLogger {
  logError(error: AppError): void;
}

export class ConsoleErrorLogger implements ErrorLogger {
  logError(error: AppError): void {
    if (process.env.NODE_ENV === 'development') {
       
      console.error('🚨 Error:', error.toJSON());
    }
  }
}

// En producción, se podría usar un servicio como Sentry
export class ProductionErrorLogger implements ErrorLogger {
  logError(error: AppError): void {
    // Integración con servicio de logging en producción
    // Sentry.captureException(error);
     
    console.error('Error logged to external service:', error.code);
  }
}

/**
 * Factory para crear el logger apropiado según el entorno
 */
export const createErrorLogger = (): ErrorLogger => {
  return process.env.NODE_ENV === 'production'
    ? new ProductionErrorLogger()
    : new ConsoleErrorLogger();
};