import { IBreathingPhase, IBreathingSettings } from './breathing-exercise';

/**
 * Audio manager for breathing cues
 */
export class BreathingAudioManager {
  private audioContext: AudioContext | null = null;
  private settings: IBreathingSettings = {
    audioEnabled: true,
    hapticEnabled: true,
    audioVolume: 0.03
  };
  
  async init(): Promise<void> {
    try {
      await this.getBreathingBoxSettings();
      
      if (this.settings.audioEnabled && (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined')) {
        this.audioContext = new (AudioContext || (window as any).webkitAudioContext)();
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      }
    } catch (error) {
      console.warn('Audio context not available:', error);
      this.settings.audioEnabled = false;
    }
  }
  
  async getBreathingBoxSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['breathingBox'], (result) => {
        const settings = result.breathingBox || {};
        this.settings = {
          audioEnabled: settings.audioEnabled !== false,
          hapticEnabled: settings.hapticEnabled !== false,
          audioVolume: settings.audioVolume || 0.03
        };
        resolve();
      });
    });
  }
  
  playAudioCue(phase: IBreathingPhase): void {
    if (!this.settings.audioEnabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Different frequencies for different phases
      let frequency = 800; // Default
      let duration = 0.2;
      
      switch (phase.audioCue) {
        case 'inhale':
          frequency = 600; // Lower pitch for inhale
          duration = 0.3;
          break;
        case 'hold':
          frequency = 800; // Medium pitch for hold
          duration = 0.1;
          break;
        case 'exhale':
          frequency = 1000; // Higher pitch for exhale
          duration = 0.3;
          break;
      }
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(this.settings.audioVolume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(this.settings.audioVolume * 0.3, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing audio cue:', error);
    }
  }
}
