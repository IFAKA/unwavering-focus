import { 
  ANIMATION_CONSTANTS, 
  UI_CONSTANTS 
} from '../../constants';
import { BreathingAudioManager } from './breathing-audio-manager';

export interface IBreathingPhase {
  name: string;
  duration: number;
  scale: number;
  opacity: number;
  borderColor: string;
  backgroundColor: string;
  audioCue: string;
  hapticPattern: number[];
}

export interface IBreathingSettings {
  audioEnabled: boolean;
  hapticEnabled: boolean;
  audioVolume: number;
}

/**
 * Starts the box breathing exercise
 */
export function startBoxBreathing(text: string): void {
  // Create box breathing visualizer with Apple Watch styling
  const breathingElement = document.createElement('div');
  breathingElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_PRIMARY};
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    opacity: 0;
    transition: opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING};
  `;
  
  // Create the breathing circle with Apple Watch design
  const circle = document.createElement('div');
  circle.style.cssText = `
    width: 160px;
    height: 160px;
    border: 2px solid ${UI_CONSTANTS.COLORS.ACCENT_PRIMARY};
    border-radius: ${UI_CONSTANTS.BORDER_RADIUS.FULL};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    font-size: ${UI_CONSTANTS.FONT_SIZE.XL};
    font-weight: ${UI_CONSTANTS.FONT_WEIGHT.SEMIBOLD};
    transition: all 4s ${ANIMATION_CONSTANTS.EASING.EASE_IN_OUT};
    position: relative;
    background: rgba(0, 122, 255, 0.05);
    box-shadow: ${UI_CONSTANTS.SHADOWS.LARGE};
    transform: scale(${ANIMATION_CONSTANTS.SCALE.SPRING_IN});
  `;
  
  // Create instruction text with Apple Watch typography
  const instruction = document.createElement('div');
  instruction.style.cssText = `
    position: absolute;
    bottom: ${UI_CONSTANTS.SPACING.XXXL};
    left: 50%;
    transform: translateX(-50%);
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    font-size: ${UI_CONSTANTS.FONT_SIZE.MD};
    font-weight: ${UI_CONSTANTS.FONT_WEIGHT.MEDIUM};
    text-align: center;
    max-width: 400px;
    line-height: 1.4;
    opacity: 0;
    transition: opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING};
  `;
  
  if (text.trim()) {
    instruction.innerHTML = `
      <div style="margin-bottom: ${UI_CONSTANTS.SPACING.MD}; font-size: ${UI_CONSTANTS.FONT_SIZE.SM}; opacity: 0.7; color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};">Focus on:</div>
      <div style="white-space: pre-wrap; font-weight: ${UI_CONSTANTS.FONT_WEIGHT.NORMAL};">${text}</div>
    `;
  } else {
    instruction.innerHTML = `
      <div style="font-size: ${UI_CONSTANTS.FONT_SIZE.SM}; opacity: 0.7; color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};">Press ESC or tap outside to stop</div>
      <div style="font-size: ${UI_CONSTANTS.FONT_SIZE.SM}; opacity: 0.6; color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY}; margin-top: ${UI_CONSTANTS.SPACING.SM};">Audio cues and haptic feedback help you practice with eyes closed</div>
    `;
  }
  
  breathingElement.appendChild(circle);
  breathingElement.appendChild(instruction);
  document.body.appendChild(breathingElement);
  
  // Animate in with spring effect
  requestAnimationFrame(() => {
    breathingElement.style.opacity = '1';
    circle.style.transform = 'scale(1)';
    instruction.style.opacity = '1';
  });
  
  // Start the breathing cycle
  startBreathingCycle(circle, breathingElement);
}

/**
 * Starts the breathing cycle with phases
 */
function startBreathingCycle(circle: HTMLElement, breathingElement: HTMLElement): void {
  const phases: IBreathingPhase[] = [
    { 
      name: 'Inhale', 
      duration: 4000, 
      scale: 1.15, 
      opacity: 1,
      borderColor: UI_CONSTANTS.COLORS.ACCENT_PRIMARY,
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      audioCue: 'inhale',
      hapticPattern: [100, 50, 100]
    },
    { 
      name: 'Hold', 
      duration: 4000, 
      scale: 1.15, 
      opacity: 0.9,
      borderColor: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
      backgroundColor: 'rgba(142, 142, 147, 0.05)',
      audioCue: 'hold',
      hapticPattern: [200]
    },
    { 
      name: 'Exhale', 
      duration: 4000, 
      scale: 0.85, 
      opacity: 0.8,
      borderColor: UI_CONSTANTS.COLORS.ACCENT_PRIMARY,
      backgroundColor: 'rgba(0, 122, 255, 0.05)',
      audioCue: 'exhale',
      hapticPattern: [50, 100, 50]
    },
    { 
      name: 'Hold', 
      duration: 4000, 
      scale: 0.85, 
      opacity: 0.7,
      borderColor: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
      backgroundColor: 'rgba(142, 142, 147, 0.03)',
      audioCue: 'hold',
      hapticPattern: [200]
    }
  ];
  
  let currentPhase = 0;
  let isActive = true;
  
  // Initialize audio context
  const audioManager = new BreathingAudioManager();
  
  function updateBreathing(): void {
    if (!isActive) return;
    
    const phase = phases[currentPhase];
    circle.textContent = phase.name;
    circle.style.transform = `scale(${phase.scale})`;
    circle.style.opacity = phase.opacity.toString();
    circle.style.borderColor = phase.borderColor;
    circle.style.background = phase.backgroundColor;
    
    // Play audio and haptic cues at the start of each phase
    audioManager.playAudioCue(phase);
    playHapticFeedback(phase);
    
    setTimeout(() => {
      if (isActive) {
        currentPhase = (currentPhase + 1) % phases.length;
        updateBreathing();
      }
    }, phase.duration);
  }
  
  // Initialize audio context and start the breathing cycle
  audioManager.init().then(() => {
    updateBreathing();
  });
  
  // Handle close events with smooth animations
  const closeBreathing = (): void => {
    isActive = false;
    
    // Animate out with spring effect
    breathingElement.style.opacity = '0';
    circle.style.transform = `scale(${ANIMATION_CONSTANTS.SCALE.SPRING_IN})`;
    const instructionElement = breathingElement.querySelector('div:last-child') as HTMLElement;
    if (instructionElement) {
      instructionElement.style.opacity = '0';
    }
    
    setTimeout(() => {
      breathingElement.remove();
    }, ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE);
  };
  
  // ESC key to close
  const handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      closeBreathing();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  
  // Click outside to close
  const handleClick = (e: MouseEvent): void => {
    if (e.target === breathingElement) {
      closeBreathing();
      breathingElement.removeEventListener('click', handleClick);
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  breathingElement.addEventListener('click', handleClick);
}

/**
 * Plays haptic feedback for breathing phases
 */
function playHapticFeedback(phase: IBreathingPhase): void {
  try {
    if (typeof navigator.vibrate === 'function' && document.hasFocus()) {
      navigator.vibrate(phase.hapticPattern);
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
}
