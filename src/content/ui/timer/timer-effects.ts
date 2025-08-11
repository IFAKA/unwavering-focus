/**
 * Adds hover effects to the timer element
 */
export function addHoverEffects(timerElement: HTMLElement): void {
  timerElement.addEventListener('mouseenter', () => {
    // Create cancel text overlay
    const cancelText = document.createElement('div');
    cancelText.textContent = 'Cancel';
    cancelText.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;
      background: rgba(220, 38, 38, 0.9);
      border-radius: 8px 0 0 8px;
    `;
    cancelText.id = 'cancel-overlay';
    timerElement.appendChild(cancelText);
  });
  
  timerElement.addEventListener('mouseleave', () => {
    // Remove cancel text overlay
    const cancelText = timerElement.querySelector('#cancel-overlay');
    if (cancelText) {
      cancelText.remove();
    }
  });
}
