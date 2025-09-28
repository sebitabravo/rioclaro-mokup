import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/stores/AuthStore';

export interface OnboardingState {
  hasSeenDashboardTour: boolean;
  hasSeenAdminTour: boolean;
  hasSeenReportsTour: boolean;
  hasSeenAlertsTour: boolean;
  isFirstLogin: boolean;
}

const ONBOARDING_STORAGE_KEY = 'rioclaro_onboarding_state';

export function useOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasSeenDashboardTour: false,
    hasSeenAdminTour: false,
    hasSeenReportsTour: false,
    hasSeenAlertsTour: false,
    isFirstLogin: true
  });

  // Cargar estado del localStorage al inicializar
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const savedState = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setOnboardingState(parsed);
      } catch (error) {
        console.warn('Error loading onboarding state:', error);
      }
    }
  }, [user, isAuthenticated]);

  // Guardar estado cuando cambie
  const saveState = (newState: Partial<OnboardingState>) => {
    if (!user) return;

    const updatedState = { ...onboardingState, ...newState };
    setOnboardingState(updatedState);
    localStorage.setItem(
      `${ONBOARDING_STORAGE_KEY}_${user.id}`,
      JSON.stringify(updatedState)
    );
  };

  // Marcar tour como completado
  const markTourCompleted = (tourType: keyof OnboardingState) => {
    saveState({ [tourType]: true });
  };

  // Verificar si debe mostrar el tour inicial
  const shouldShowInitialTour = () => {
    return onboardingState.isFirstLogin && !onboardingState.hasSeenDashboardTour;
  };

  // Verificar si debe mostrar tour específico
  const shouldShowTour = (tourType: keyof OnboardingState) => {
    return !onboardingState[tourType];
  };

  // Resetear onboarding (para testing o re-onboarding)
  const resetOnboarding = () => {
    if (!user) return;

    const initialState: OnboardingState = {
      hasSeenDashboardTour: false,
      hasSeenAdminTour: false,
      hasSeenReportsTour: false,
      hasSeenAlertsTour: false,
      isFirstLogin: true
    };

    setOnboardingState(initialState);
    localStorage.setItem(
      `${ONBOARDING_STORAGE_KEY}_${user.id}`,
      JSON.stringify(initialState)
    );
  };

  // Marcar como usuario experimentado
  const markAsExperiencedUser = () => {
    saveState({
      hasSeenDashboardTour: true,
      hasSeenAdminTour: true,
      hasSeenReportsTour: true,
      hasSeenAlertsTour: true,
      isFirstLogin: false
    });
  };

  // Completar primer login
  const completeFirstLogin = () => {
    saveState({ isFirstLogin: false });
  };

  return {
    // State
    onboardingState,
    isFirstTimeUser: onboardingState.isFirstLogin,

    // Checkers
    shouldShowInitialTour,
    shouldShowTour,

    // Actions
    markTourCompleted,
    completeFirstLogin,
    resetOnboarding,
    markAsExperiencedUser,

    // Helpers
    canAccessAdminTour: user?.role === 'Administrador',
    canAccessAlertsTour: user?.role === 'Administrador' || user?.role === 'Técnico'
  };
}