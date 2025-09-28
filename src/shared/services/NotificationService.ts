export type NotificationLevel = 'info' | 'warning' | 'critical' | 'emergency';
export type SoundType = 'alert' | 'warning' | 'critical' | 'emergency' | 'success';

export interface NotificationOptions {
  title: string;
  body: string;
  level: NotificationLevel;
  playSound?: boolean;
  soundType?: SoundType;
  persistent?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class NotificationService {
  private hasPermission = false;
  private audioContext?: AudioContext;
  private sounds: Map<SoundType, AudioBuffer> = new Map();

  constructor() {
    this.checkPermission();
    this.initializeAudio();
  }

  // Verificar y solicitar permisos de notificación
  async checkPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones push');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    // Solicitar permiso
    const permission = await Notification.requestPermission();
    this.hasPermission = permission === 'granted';
    return this.hasPermission;
  }

  // Inicializar contexto de audio para sonidos
  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSounds();
    } catch (error) {
      console.warn('Audio no disponible:', error);
    }
  }

  // Cargar sonidos predefinidos (usando Web Audio API para generar tonos)
  private async loadSounds() {
    if (!this.audioContext) return;

    const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer => {
      const sampleRate = this.audioContext!.sampleRate;
      const buffer = this.audioContext!.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        const angle = (i / sampleRate) * frequency * 2 * Math.PI;
        switch (type) {
          case 'sine':
            data[i] = Math.sin(angle) * 0.3;
            break;
          case 'square':
            data[i] = Math.sign(Math.sin(angle)) * 0.3;
            break;
          case 'triangle':
            data[i] = (2 / Math.PI) * Math.asin(Math.sin(angle)) * 0.3;
            break;
        }

        // Fade out para evitar clicks
        if (i > data.length - 1000) {
          data[i] *= (data.length - i) / 1000;
        }
      }

      return buffer;
    };

    try {
      // Definir diferentes sonidos para diferentes tipos de alerta
      this.sounds.set('success', createTone(800, 0.2));
      this.sounds.set('info', createTone(600, 0.3));
      this.sounds.set('warning', createTone(400, 0.5, 'triangle'));
      this.sounds.set('alert', createTone(300, 0.7, 'square'));
      this.sounds.set('critical', createTone(200, 1.0, 'square'));
      this.sounds.set('emergency', createTone(150, 1.5, 'square'));
    } catch (error) {
      console.warn('Error creando sonidos:', error);
    }
  }

  // Reproducir sonido
  private async playSound(soundType: SoundType) {
    if (!this.audioContext || !this.sounds.has(soundType)) return;

    try {
      // Resumir contexto de audio si está suspendido
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.sounds.get(soundType)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configurar volumen según el tipo
      const volume = soundType === 'emergency' || soundType === 'critical' ? 0.7 : 0.5;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

      source.start();

      // Para alertas críticas y emergencias, repetir el sonido
      if (soundType === 'emergency' || soundType === 'critical') {
        setTimeout(() => this.playSound(soundType), 1000);
        setTimeout(() => this.playSound(soundType), 2000);
      }
    } catch (error) {
      console.warn('Error reproduciendo sonido:', error);
    }
  }

  // Mostrar notificación
  async showNotification(options: NotificationOptions): Promise<void> {
    // Verificar permisos
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      console.warn('Sin permisos para mostrar notificaciones');
      return;
    }

    // Reproducir sonido si está habilitado
    if (options.playSound && options.soundType) {
      await this.playSound(options.soundType);
    }

    // Configurar iconos y prioridad según el nivel
    const iconMap: Record<NotificationLevel, string> = {
      info: '🔵',
      warning: '⚠️',
      critical: '🔴',
      emergency: '🚨'
    };

    const priorityMap: Record<NotificationLevel, 'low' | 'normal' | 'high'> = {
      info: 'low',
      warning: 'normal',
      critical: 'high',
      emergency: 'high'
    };

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: iconMap[options.level],
        badge: iconMap[options.level],
        tag: `rioclaro-${options.level}-${Date.now()}`,
        requireInteraction: options.level === 'critical' || options.level === 'emergency',
        silent: false,
        vibrate: options.level === 'critical' || options.level === 'emergency' ? [200, 100, 200] : undefined,
        actions: options.actions,
        data: {
          level: options.level,
          timestamp: Date.now()
        }
      });

      // Auto-cerrar notificaciones no críticas después de un tiempo
      if (!options.persistent && options.level !== 'critical' && options.level !== 'emergency') {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Manejar clics en la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

    } catch (error) {
      console.error('Error mostrando notificación:', error);
    }
  }

  // Métodos de conveniencia para diferentes tipos de alertas
  async showInfo(title: string, body: string) {
    return this.showNotification({
      title,
      body,
      level: 'info',
      playSound: true,
      soundType: 'info'
    });
  }

  async showWarning(title: string, body: string) {
    return this.showNotification({
      title,
      body,
      level: 'warning',
      playSound: true,
      soundType: 'warning'
    });
  }

  async showCritical(title: string, body: string, persistent = true) {
    return this.showNotification({
      title,
      body,
      level: 'critical',
      playSound: true,
      soundType: 'critical',
      persistent,
      actions: [
        { action: 'view', title: 'Ver Detalles', icon: '👁️' },
        { action: 'dismiss', title: 'Cerrar', icon: '❌' }
      ]
    });
  }

  async showEmergency(title: string, body: string) {
    return this.showNotification({
      title,
      body,
      level: 'emergency',
      playSound: true,
      soundType: 'emergency',
      persistent: true,
      actions: [
        { action: 'emergency', title: 'Protocolo Emergencia', icon: '🚨' },
        { action: 'contact', title: 'Contactar Técnico', icon: '📞' },
        { action: 'view', title: 'Ver Detalles', icon: '👁️' }
      ]
    });
  }

  // Verificar si las notificaciones están disponibles
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Obtener estado de permisos
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

export const notificationService = new NotificationService();