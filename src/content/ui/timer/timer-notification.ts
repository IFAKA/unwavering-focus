/**
 * Shows timer completion notification
 */
export function showTimerCompletionNotification(): void {
  // Check if overlay already exists to prevent duplicates
  if (document.getElementById('timer-completion-overlay')) {
    return;
  }
  
  // Create full-screen overlay
  const overlay = document.createElement('div');
  overlay.id = 'timer-completion-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  `;
  
  // Create notification content
  const content = document.createElement('div');
  content.style.cssText = `
    text-align: center;
    color: white;
    max-width: 400px;
    padding: 40px 20px;
    transform: scale(0.9);
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  `;
  
  // Create timer icon with animation
  const icon = document.createElement('div');
  icon.innerHTML = `
    <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-bottom: 20px;">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
      <polyline points="12,6 12,12 16,14" stroke-width="2"/>
    </svg>
  `;
  icon.style.cssText = `
    color: #34c759;
    margin-bottom: 20px;
    animation: pulse 2s infinite;
  `;
  
  // Create title
  const title = document.createElement('h1');
  title.textContent = "Time's Up!";
  title.style.cssText = `
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 10px 0;
    color: white;
  `;
  
  // Create subtitle
  const subtitle = document.createElement('p');
  subtitle.textContent = "Your timer has completed. Did you finish your task or want to continue working?";
  subtitle.style.cssText = `
    font-size: 16px;
    font-weight: 400;
    margin: 0 0 30px 0;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  `;
  
  // Create action buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  `;
  
  // Continue button
  const continueButton = document.createElement('button');
  continueButton.textContent = "Continue Working";
  continueButton.style.cssText = `
    background: #007aff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
  `;
  
  continueButton.addEventListener('mouseenter', () => {
    continueButton.style.background = '#0056cc';
    continueButton.style.transform = 'translateY(-1px)';
  });
  
  continueButton.addEventListener('mouseleave', () => {
    continueButton.style.background = '#007aff';
    continueButton.style.transform = 'translateY(0)';
  });
  
  // Finish Task button
  const breakButton = document.createElement('button');
  breakButton.textContent = "Finish Task";
  breakButton.style.cssText = `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
  `;
  
  breakButton.addEventListener('mouseenter', () => {
    breakButton.style.background = 'rgba(255, 255, 255, 0.2)';
    breakButton.style.transform = 'translateY(-1px)';
  });
  
  breakButton.addEventListener('mouseleave', () => {
    breakButton.style.background = 'rgba(255, 255, 255, 0.1)';
    breakButton.style.transform = 'translateY(0)';
  });
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Add click handlers
  const closeOverlay = () => {
    // Remove the timer completion flag to sync across all tabs
    chrome.storage.local.remove('timerCompletionOverlay');
    
    if (prefersReducedMotion) {
      // Instant close for users who prefer reduced motion
      overlay.remove();
      style.remove();
    } else {
      // Smooth close animation for users who don't mind motion
      overlay.style.opacity = '0';
      content.style.transform = 'scale(0.9)';
      setTimeout(() => {
        overlay.remove();
        style.remove();
      }, 300);
    }
  };
  
  continueButton.addEventListener('click', closeOverlay);
  breakButton.addEventListener('click', () => {
    closeOverlay();
    // Navigate to focus page in the same tab
    window.location.href = chrome.runtime.getURL('focus-page.html');
  });
  
  // Add ESC key handler
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeOverlay();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  // Assemble the notification
  buttonContainer.appendChild(continueButton);
  buttonContainer.appendChild(breakButton);
  
  content.appendChild(icon);
  content.appendChild(title);
  content.appendChild(subtitle);
  content.appendChild(buttonContainer);
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  
  // Add CSS animation
  const style = document.createElement('style');
  style.setAttribute('data-timer-completion-style', 'true');
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
  
  // Animate in
  if (prefersReducedMotion) {
    // Instant appearance for users who prefer reduced motion
    overlay.style.opacity = '1';
    content.style.transform = 'scale(1)';
  } else {
    // Smooth animation for users who don't mind motion
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      content.style.transform = 'scale(1)';
    });
  }
  
  // Play distinct timer completion sound using Web Audio API
  // This creates a unique ascending chime pattern (C-E-G) to distinguish from eye care sounds
  try {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required for autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create a distinct timer completion sound (different from eye care)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Timer completion sound: ascending chime pattern (C-E-G)
      // This is distinctly different from eye care sounds which use single tones
      const now = audioContext.currentTime;
      
      // First note: C5 (523.25 Hz) - 0.3s duration
      oscillator.frequency.setValueAtTime(523.25, now);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      // Second note: E5 (659.25 Hz) - 0.3s duration
      oscillator.frequency.setValueAtTime(659.25, now + 0.3);
      gainNode.gain.setValueAtTime(0.1, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      // Third note: G5 (783.99 Hz) - 0.3s duration
      oscillator.frequency.setValueAtTime(783.99, now + 0.6);
      gainNode.gain.setValueAtTime(0.1, now + 0.6);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
      
      oscillator.start(now);
      oscillator.stop(now + 0.9);
      
      console.log('Timer completion chime played (C-E-G pattern)');
    } else {
      // Fallback: try vibration with distinct pattern
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]);
      }
    }
  } catch (error) {
    console.log('Could not play timer completion sound:', error);
    // Final fallback: simple vibration
    try {
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]);
      }
    } catch (vibrationError) {
      console.log('Vibration also failed:', vibrationError);
    }
  }
}


