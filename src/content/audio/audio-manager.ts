/**
 * Improved audio playing function with better error handling and fallbacks
 */
export async function playAudioWithFallback(
  audioPath: string, 
  volume: number, 
  sendResponse: (response: any) => void
): Promise<void> {
  try {
    // Check if we're on a restricted page
    if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
      console.log('Audio playback not allowed on chrome:// URLs');
      sendResponse({ error: 'Audio not allowed on this page' });
      return;
    }

    // Check if user has interacted with the page (required for autoplay)
    if (!document.hasFocus() || document.visibilityState !== 'visible') {
      console.log('Page not focused or visible, using fallback methods');
      await tryFallbackMethods(sendResponse);
      return;
    }

    // Try to create and play audio
    const audio = new Audio(chrome.runtime.getURL(audioPath));
    audio.volume = volume;
    
    // Add error handling for audio loading
    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      // Try fallback methods
      tryFallbackMethods(sendResponse);
    });
    
    // Try to play the audio
    try {
      await audio.play();
      sendResponse({ success: true });
    } catch (playError) {
      console.error('Error playing audio:', playError);
      // Try fallback methods
      await tryFallbackMethods(sendResponse);
    }
  } catch (error) {
    console.error('Error creating audio:', error);
    // Try fallback methods
    await tryFallbackMethods(sendResponse);
  }
}

/**
 * Fallback methods when audio fails
 */
async function tryFallbackMethods(sendResponse: (response: any) => void): Promise<void> {
  // Method 1: Try vibration (if supported and user has interacted)
  try {
    if (typeof navigator.vibrate === 'function') {
      // Check if user has interacted with the page and vibration is allowed
      if (document.hasFocus() && document.visibilityState === 'visible') {
        // Use a shorter vibration pattern to avoid blocking
        navigator.vibrate(100);
        sendResponse({ success: true, method: 'vibration' });
        return;
      }
    }
  } catch (vibrationError) {
    console.error('Vibration failed:', vibrationError);
  }

  // Method 2: Try to create a simple beep using Web Audio API
  try {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required for autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Lower volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      sendResponse({ success: true, method: 'web-audio' });
      return;
    }
  } catch (webAudioError) {
    console.error('Web Audio API failed:', webAudioError);
  }

  // Method 3: Try to show a visual notification
  try {
    showVisualNotification();
    sendResponse({ success: true, method: 'visual' });
    return;
  } catch (visualError) {
    console.error('Visual notification failed:', visualError);
  }

  // If all methods fail
  sendResponse({ error: 'All audio methods failed' });
}

/**
 * Visual notification fallback
 */
function showVisualNotification(): void {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 999999;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInOut 2s ease-in-out;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  
  notification.textContent = '👁️ Eye Care Reminder';
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Remove after animation
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 2000);
}
