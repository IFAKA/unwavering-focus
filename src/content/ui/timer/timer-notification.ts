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
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 20px; animation: pulse 2s infinite;">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12,6 12,12 16,14"></polyline>
    </svg>
  `;
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = 'Time\'s Up!';
  title.style.cssText = `
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 16px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `;
  
  // Create message
  const message = document.createElement('p');
  message.textContent = 'Great job staying focused! Take a short break and then get back to work.';
  message.style.cssText = `
    font-size: 18px;
    line-height: 1.6;
    margin: 0 0 32px 0;
    opacity: 0.9;
  `;
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Got it!';
  closeButton.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  `;
  
  // Add hover effect to button
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.transform = 'translateY(-2px)';
  });
  
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.transform = 'translateY(0)';
  });
  
  // Assemble the notification
  content.appendChild(icon);
  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(closeButton);
  overlay.appendChild(content);
  
  // Add to page
  document.body.appendChild(overlay);
  
  // Add CSS animations
  const style = document.createElement('style');
  style.setAttribute('data-timer-completion-style', 'true');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);
  
  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    content.style.transform = 'scale(1)';
  });
  
  // Play completion sound
  playTimerCompletionSound();
  
  // Handle close
  const closeOverlay = (): void => {
    overlay.style.opacity = '0';
    content.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      overlay.remove();
      style.remove();
      chrome.storage.local.remove('timerCompletionOverlay');
    }, 300);
  };
  
  // Close on button click
  closeButton.addEventListener('click', closeOverlay);
  
  // Close on escape key
  const handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      closeOverlay();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (document.getElementById('timer-completion-overlay')) {
      closeOverlay();
    }
  }, 10000);
}

/**
 * Plays timer completion sound
 */
function playTimerCompletionSound(): void {
  try {
    const audio = new Audio(chrome.runtime.getURL('sounds/eye-care-beep.mp3'));
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Fallback: try to play a simple beep using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Could not play timer completion sound');
      }
    });
  } catch (error) {
    console.log('Could not play timer completion sound');
  }
}
