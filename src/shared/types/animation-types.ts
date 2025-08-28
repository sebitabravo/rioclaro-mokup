// Tipos para configuraciones de animación
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string;
  repeat?: number;
  [key: string]: unknown;
}