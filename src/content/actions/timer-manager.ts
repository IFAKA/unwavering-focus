import { createCountdownTimerElement } from '../ui/countdown-timer';

export interface ITimerData {
  startTime: number;
  remainingSeconds: number;
}

/**
 * Starts a timer with the specified duration
 */
export async function startTimer(text: string): Promise<void> {
  // Parse input as minutes
  const inputValue = text.trim();
  let minutes = 25; // Default 25 minutes
  
  if (inputValue) {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      minutes = Math.round(numValue);
    }
  }
  
  // Ensure minimum 1 minute
  minutes = Math.max(1, minutes);
  
  // Store timer data for cross-tab synchronization
  const timerData: ITimerData = {
    startTime: Date.now(),
    remainingSeconds: minutes * 60
  };
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ countdownTimer: timerData }, () => {
      createCountdownTimerElement();
      resolve();
    });
  });
}

/**
 * Checks if a timer already exists
 */
export async function hasExistingTimer(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['countdownTimer'], (result) => {
      if (result.countdownTimer) {
        const { startTime, remainingSeconds } = result.countdownTimer;
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const actualRemainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
        resolve(actualRemainingSeconds > 0);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Gets the current timer data
 */
export async function getTimerData(): Promise<ITimerData | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['countdownTimer'], (result) => {
      resolve(result.countdownTimer || null);
    });
  });
}

/**
 * Removes the timer
 */
export async function removeTimer(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove('countdownTimer', () => {
      resolve();
    });
  });
}

/**
 * Pauses the timer
 */
export async function pauseTimer(): Promise<void> {
  const timerData = await getTimerData();
  if (!timerData) return;
  
  const elapsedSeconds = Math.floor((Date.now() - timerData.startTime) / 1000);
  const actualRemainingSeconds = Math.max(0, timerData.remainingSeconds - elapsedSeconds);
  
  const pausedTimerData: ITimerData = {
    startTime: Date.now(),
    remainingSeconds: actualRemainingSeconds
  };
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ countdownTimer: pausedTimerData }, () => {
      resolve();
    });
  });
}

/**
 * Resumes the timer
 */
export async function resumeTimer(): Promise<void> {
  const timerData = await getTimerData();
  if (!timerData) return;
  
  const resumedTimerData: ITimerData = {
    startTime: Date.now(),
    remainingSeconds: timerData.remainingSeconds
  };
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ countdownTimer: resumedTimerData }, () => {
      resolve();
    });
  });
}

/**
 * Gets the remaining time in seconds
 */
export async function getRemainingTime(): Promise<number> {
  const timerData = await getTimerData();
  if (!timerData) return 0;
  
  const elapsedSeconds = Math.floor((Date.now() - timerData.startTime) / 1000);
  return Math.max(0, timerData.remainingSeconds - elapsedSeconds);
}

/**
 * Formats time as mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Checks if timer has completed
 */
export async function isTimerCompleted(): Promise<boolean> {
  const remainingTime = await getRemainingTime();
  return remainingTime <= 0;
}
