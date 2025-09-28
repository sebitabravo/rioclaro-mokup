import React, { useState, useEffect } from 'react';
import { HelpCircle, Play, X } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { OnboardingTour, OnboardingStep } from './OnboardingTour';
import { useOnboarding } from '@shared/hooks/useOnboarding';
import { useAuth } from '@features/auth/stores/AuthStore';

interface OnboardingManagerProps {
  tourSteps: OnboardingStep[];
  tourType: 'hasSeenDashboardTour' | 'hasSeenAdminTour' | 'hasSeenReportsTour' | 'hasSeenAlertsTour';
  autoStart?: boolean;
  showPrompt?: boolean;
  promptTitle?: string;
  promptDescription?: string;
}

export function OnboardingManager({
  tourSteps,
  tourType,
  autoStart = false,
  showPrompt = true,
  promptTitle = '¿Primera vez aquí?',
  promptDescription = 'Te ayudamos con un tour rápido para que conozcas todas las funciones.'
}: OnboardingManagerProps) {
  const { user } = useAuth();
  const {
    shouldShowTour,
    markTourCompleted,
    shouldShowInitialTour,
    completeFirstLogin,
    isFirstTimeUser
  } = useOnboarding();

  const [showTour, setShowTour] = useState(false);
  const [showFirstTimePrompt, setShowFirstTimePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  // Verificar si debe mostrar el tour automáticamente
  useEffect(() => {
    if (!user) return;

    // Mostrar automáticamente si es primera vez y está configurado para autostart
    if (autoStart && shouldShowInitialTour() && tourType === 'hasSeenDashboardTour') {
      setShowTour(true);
      return;
    }

    // Mostrar prompt si es primera vez en esta sección y no se ha visto el tour
    if (showPrompt && shouldShowTour(tourType) && !promptDismissed) {
      // Pequeño delay para que la página cargue completamente
      const timer = setTimeout(() => {
        setShowFirstTimePrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, autoStart, showPrompt, tourType, shouldShowTour, shouldShowInitialTour, promptDismissed]);

  const startTour = () => {
    setShowFirstTimePrompt(false);
    setShowTour(true);
  };

  const closeTour = () => {
    setShowTour(false);
  };

  const completeTour = () => {
    markTourCompleted(tourType);
    if (isFirstTimeUser && tourType === 'hasSeenDashboardTour') {
      completeFirstLogin();
    }
    setShowTour(false);
  };

  const dismissPrompt = () => {
    setShowFirstTimePrompt(false);
    setPromptDismissed(true);
  };

  const skipTourForNow = () => {
    setShowFirstTimePrompt(false);
    setPromptDismissed(true);
    // No marcar como completado, solo ocultar por esta sesión
  };

  return (
    <>
      {/* Tour Component */}
      <OnboardingTour
        steps={tourSteps}
        isOpen={showTour}
        onClose={closeTour}
        onComplete={completeTour}
        title={`Tour: ${
          tourType === 'hasSeenDashboardTour' ? 'Dashboard Principal' :
          tourType === 'hasSeenAdminTour' ? 'Panel de Administración' :
          tourType === 'hasSeenReportsTour' ? 'Análisis y Reportes' :
          'Configuración de Alertas'
        }`}
      />

      {/* First Time Prompt */}
      {showFirstTimePrompt && (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm">
          <Card className="p-4 bg-white dark:bg-gray-800 shadow-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {promptTitle}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  {promptDescription}
                </p>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={startTour}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Play className="h-3 w-3" />
                    <span>Iniciar Tour</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTourForNow}
                    className="text-xs text-gray-500"
                  >
                    Más tarde
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={dismissPrompt}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Manual Tour Trigger (Always available) */}
      {!showFirstTimePrompt && (
        <div className="fixed bottom-4 right-4 z-30">
          <Button
            variant="outline"
            size="sm"
            onClick={startTour}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Ayuda</span>
          </Button>
        </div>
      )}
    </>
  );
}

// Componente simplificado para uso rápido
interface QuickOnboardingProps {
  tourSteps: OnboardingStep[];
  tourType: 'hasSeenDashboardTour' | 'hasSeenAdminTour' | 'hasSeenReportsTour' | 'hasSeenAlertsTour';
}

export function QuickOnboarding({ tourSteps, tourType }: QuickOnboardingProps) {
  return (
    <OnboardingManager
      tourSteps={tourSteps}
      tourType={tourType}
      autoStart={tourType === 'hasSeenDashboardTour'}
      showPrompt={true}
    />
  );
}