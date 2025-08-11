// Modal-related type definitions

export interface IModalState {
  modal: HTMLElement | null;
  input: HTMLTextAreaElement | null;
  focusAttempts: number;
  focusTimeoutId: ReturnType<typeof setTimeout> | null;
  isFocusAttempting: boolean;
  isAnimating: boolean;
  countdownTimerElement: HTMLElement | null;
  topRightContainer: HTMLElement | null;
  lastEnterTime: number;
  saveConfirmationTimeout: ReturnType<typeof setTimeout> | null;
}

export interface IModalConfig {
  doubleEnterTimeout: number;
  animationTiming: {
    quickOpen: number;
    quickClose: number;
    quickCloseDelay: number;
    confirmationFadeOut: number;
    confirmationFadeIn: number;
    confirmationAutoClose: number;
  };
  opacity: {
    hidden: number;
    visible: number;
  };
  transform: {
    initial: string;
    final: string;
  };
  scale: {
    springIn: number;
  };
  easing: {
    spring: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface IModalContent {
  content: HTMLElement | null;
  actionButton: HTMLButtonElement | null;
}

export interface IFocusStrategy {
  name: string;
  maxAttempts: number;
  timeout: number;
  description: string;
}

export interface IModalAnimationState {
  prefersReducedMotion: boolean;
  isVisible: boolean;
  isAnimating: boolean;
}
