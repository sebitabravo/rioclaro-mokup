import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector del elemento objetivo
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
  videoUrl?: string; // URL opcional para video tutorial
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  title?: string;
}

export function OnboardingTour({
  steps,
  isOpen,
  onClose,
  onComplete,
  title = 'Tour Interactivo'
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  const currentStepData = steps[currentStep];

  // Encontrar y hacer scroll al elemento objetivo
  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const element = document.querySelector(currentStepData.target);
    if (element) {
      setTargetElement(element);

      // Hacer scroll suave al elemento
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });

      // Agregar highlight al elemento
      element.classList.add('onboarding-highlight');

      // Cleanup anterior
      return () => {
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
          el.classList.remove('onboarding-highlight');
        });
      };
    }
  }, [currentStep, currentStepData, isOpen]);

  // Cleanup al cerrar
  useEffect(() => {
    if (!isOpen) {
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
      });
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen || !currentStepData) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

      {/* Tour Card */}
      <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Card className="w-96 max-w-[90vw] p-6 bg-white dark:bg-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Paso {currentStep + 1} de {steps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              {currentStepData.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Video Tutorial (si está disponible) */}
            {currentStepData.videoUrl && (
              <div className="mt-4">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Video tutorial disponible
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(currentStepData.videoUrl, '_blank')}
                    >
                      Ver Video
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-3 w-3" />
              <span>Anterior</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-gray-500"
              >
                Omitir Tour
              </Button>

              <Button
                onClick={nextStep}
                size="sm"
                className="flex items-center space-x-1"
              >
                <span>
                  {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </span>
                {currentStep < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* CSS Styles for Highlighting */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 51 !important;
          border: 2px solid #3b82f6 !important;
          border-radius: 6px !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
          animation: onboarding-pulse 2s infinite;
        }

        @keyframes onboarding-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
          }
        }
      `}</style>
    </>
  );
}