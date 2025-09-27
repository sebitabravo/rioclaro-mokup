import {
  ApiError,
  NetworkError,
  InfrastructureError,
  AppError
} from '@shared/types/errors';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Nueva interfaz para resultados tipados (sin errores en la respuesta)
export interface ApiResult<T = unknown> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        localStorage.removeItem("access_token");
      }
    }
  }

  /**
   * Método de request mejorado que lanza errores tipados
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // Error de red o conectividad
      throw new NetworkError(
        url,
        options.method || 'GET',
        {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          endpoint,
          headers: Object.keys(headers)
        }
      );
    }

    let responseData: unknown;
    const responseHeaders: Record<string, string> = {};

    // Extraer headers de respuesta
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    try {
      responseData = await response.json();
    } catch (parseError) {
      // Error al parsear JSON
      throw new InfrastructureError(
        'Error al parsear respuesta del servidor',
        'RESPONSE_PARSE_ERROR',
        response.status,
        {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }
      );
    }

    // Si la respuesta no es exitosa, lanzar ApiError apropiado
    if (!response.ok) {
      const errorMessage = this.extractErrorMessage(responseData);

      throw new ApiError(
        errorMessage,
        response.status,
        endpoint,
        {
          statusText: response.statusText,
          responseData,
          method: options.method || 'GET'
        }
      );
    }

    return {
      data: responseData as T,
      status: response.status,
      headers: responseHeaders
    };
  }

  /**
   * Extrae el mensaje de error de la respuesta del API
   */
  private extractErrorMessage(responseData: unknown): string {
    if (typeof responseData === 'object' && responseData !== null) {
      const data = responseData as Record<string, unknown>;

      // Intentar diferentes campos comunes para mensajes de error
      if (typeof data.detail === 'string') return data.detail;
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error === 'string') return data.error;

      // Si hay un array de errores (común en APIs de validación)
      if (Array.isArray(data.errors)) {
        const firstError = data.errors[0];
        if (typeof firstError === 'string') return firstError;
        if (typeof firstError === 'object' && firstError !== null) {
          const errorObj = firstError as Record<string, unknown>;
          if (typeof errorObj.message === 'string') return errorObj.message;
        }
      }
    }

    return 'Error en la solicitud al servidor';
  }

  /**
   * Método request legacy para compatibilidad hacia atrás
   * @deprecated Usar los métodos tipados (get, post, etc.) que lanzan errores
   */
  private async requestLegacy<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const result = await this.request<T>(endpoint, options);
      return { data: result.data };
    } catch (error) {
      if (error instanceof AppError) {
        return { error: error.getUserMessage() };
      }
      return { error: 'Error desconocido' };
    }
  }

  /**
   * Métodos HTTP que lanzan errores tipados
   */
  async get<T>(endpoint: string): Promise<T> {
    const result = await this.request<T>(endpoint, { method: "GET" });
    return result.data;
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    return result.data;
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
    return result.data;
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
    return result.data;
  }

  async delete<T = void>(endpoint: string): Promise<T> {
    const result = await this.request<T>(endpoint, { method: "DELETE" });
    return result.data;
  }

  /**
   * Métodos legacy para compatibilidad hacia atrás
   * @deprecated Usar los métodos que lanzan errores tipados
   */
  async getLegacy<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.requestLegacy<T>(endpoint, { method: "GET" });
  }

  async postLegacy<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.requestLegacy<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async putLegacy<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.requestLegacy<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patchLegacy<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.requestLegacy<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async deleteLegacy<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.requestLegacy<T>(endpoint, { method: "DELETE" });
  }
}

const API_BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL || "http://localhost:8000/api";
export const apiClient = new ApiClient(API_BASE_URL);