/**
 * Video focus indicator management
 */
export class VideoFocusIndicator {
  private indicator: HTMLElement | null = null;

  create(config: { showIndicator: boolean }): void {
    if (!config.showIndicator) return;

    this.indicator = document.createElement('div');
    this.indicator.id = 'unwavering-focus-indicator';
    this.indicator.innerHTML = `
      <div class="focus-indicator-content">
        <div class="focus-icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="focus-text">Focus Mode</div>
      </div>
    `;

    // Add styles
    this.indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 999999;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease, opacity 0.3s ease;
      pointer-events: none;
      opacity: 0;
    `;

    // Add styles for the content to display icon and text side by side
    const content = this.indicator.querySelector(
      '.focus-indicator-content'
    ) as HTMLElement;
    if (content) {
      content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
      `;
    }

    document.body.appendChild(this.indicator);
  }

  update(isPlaying: boolean, config: { showIndicator: boolean }): void {
    if (!this.indicator || !config.showIndicator) return;

    if (isPlaying) {
      this.indicator.style.transform = 'translateX(0)';
      this.indicator.style.opacity = '1';
    } else {
      this.indicator.style.transform = 'translateX(100%)';
      this.indicator.style.opacity = '0';
    }
  }

  remove(): void {
    if (this.indicator) {
      this.indicator.remove();
      this.indicator = null;
    }
  }
}
