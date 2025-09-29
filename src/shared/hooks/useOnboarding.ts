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

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  hasSeenDashboardTour: false,
  hasSeenAdminTour: false,
  hasSeenReportsTour: false,
  hasSeenAlertsTour: false,
  isFirstLogin: true
};

export function useOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(() => ({
    ...DEFAULT_ONBOARDING_STATE
  }));
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = user ? `${ONBOARDING_STORAGE_KEY}_${user.id}` : null;

  // Cargar estado del localStorage al inicializar
  useEffect(() => {
    if (!user || !isAuthenticated || !storageKey) {
      setOnboardingState({ ...DEFAULT_ONBOARDING_STATE });
      setIsLoaded(false);
      return;
    }

    const savedState = localStorage.getItem(storageKey);

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setOnboardingState({ ...DEFAULT_ONBOARDING_STATE, ...parsed });
      } catch (error) {
        console.warn('Error loading onboarding state:', error);
        setOnboardingState({ ...DEFAULT_ONBOARDING_STATE });
      }
    } else {
      setOnboardingState({ ...DEFAULT_ONBOARDING_STATE });
    }

    setIsLoaded(true);
  }, [user, isAuthenticated, storageKey]);

  // Guardar estado cuando cambie
  const saveState = (newState: Partial<OnboardingState>) => {
    if (!storageKey) return;

    setOnboardingState(prevState => {
      const updatedState = { ...prevState, ...newState };
      localStorage.setItem(storageKey, JSON.stringify(updatedState));
      return updatedState;
    });

    setIsLoaded(true);
  };

  // Marcar tour como completado
  const markTourCompleted = (tourType: keyof OnboardingState) => {
    saveState({ [tourType]: true });
  };

  // Verificar si debe mostrar el tour inicial
  const shouldShowInitialTour = () => {
    if (!isLoaded) return false;
    return onboardingState.isFirstLogin && !onboardingState.hasSeenDashboardTour;
  };

  // Verificar si debe mostrar tour específico
  const shouldShowTour = (tourType: keyof OnboardingState) => {
    if (!isLoaded) return false;
    return !onboardingState[tourType];
  };

  // Resetear onboarding (para testing o re-onboarding)
  const resetOnboarding = () => {
    if (!storageKey) return;

    setOnboardingState({ ...DEFAULT_ONBOARDING_STATE });
    localStorage.setItem(storageKey, JSON.stringify(DEFAULT_ONBOARDING_STATE));
    setIsLoaded(true);
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
    isLoaded,

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