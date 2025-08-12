import { VideoState, VideoFocusConfig } from '../types';

export class VideoFocusManager {
  private config: VideoFocusConfig;
  private currentState: VideoState = { isPlaying: false, platform: '' };
  private observer: MutationObserver | null = null;
  private videoElements: Set<HTMLVideoElement> = new Set();
  private focusIndicator: HTMLElement | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: VideoFocusConfig) {
    this.config = config;
  }

  public start() {
    if (!this.config.enabled) return;

    this.detectVideoElements();
    this.setupObserver();
    this.createFocusIndicator();

    // Check for videos periodically (but clear any existing interval first)
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.detectVideoElements();
    }, 2000);
  }

  public stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.removeFocusIndicator();
    this.videoElements.clear();
    this.currentState = { isPlaying: false, platform: '' };
  }

  public updateConfig(newConfig: VideoFocusConfig) {
    this.config = newConfig;

    if (newConfig.enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  public getCurrentState(): VideoState {
    return { ...this.currentState };
  }

  public isVideoPlaying(): boolean {
    return this.currentState.isPlaying;
  }

  private detectVideoElements() {
    const videos = document.querySelectorAll('video');
    const newVideoElements = new Set<HTMLVideoElement>();

    videos.forEach(video => {
      if (!this.videoElements.has(video)) {
        this.setupVideoListeners(video);
        newVideoElements.add(video);
      }
    });

    this.videoElements = new Set([...this.videoElements, ...newVideoElements]);
    this.updateVideoState();
  }

  private setupVideoListeners(video: HTMLVideoElement) {
    const events = ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata'];

    events.forEach(event => {
      video.addEventListener(event, () => {
        this.updateVideoState();
      });
    });
  }

  private setupObserver() {
    this.observer = new MutationObserver(mutations => {
      let shouldCheck = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (
                element.tagName === 'VIDEO' ||
                element.querySelector('video')
              ) {
                shouldCheck = true;
                break;
              }
            }
          }
        }
      }

      if (shouldCheck) {
        setTimeout(() => {
          this.detectVideoElements();
        }, 100);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private updateVideoState() {
    let isPlaying = false;
    let platform = this.detectPlatform();
    let title = '';
    let duration = 0;
    let currentTime = 0;

    // Check all video elements
    for (const video of this.videoElements) {
      if (!video.paused && !video.ended && video.currentTime > 0) {
        isPlaying = true;
        title = this.extractVideoTitle();
        duration = video.duration || 0;
        currentTime = video.currentTime || 0;
        break;
      }
    }

    const newState: VideoState = {
      isPlaying,
      platform,
      title,
      duration,
      currentTime,
    };

    // Only update if state actually changed
    if (JSON.stringify(newState) !== JSON.stringify(this.currentState)) {
      this.currentState = newState;
      this.updateFocusIndicator();
      this.notifyBackgroundScript();
    }
  }

  private detectPlatform(): string {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('youtube.com')) {
      // Check for YouTube Music specifically
      if (hostname === 'music.youtube.com') {
        return 'youtube-music';
      }
      return 'youtube';
    }
    if (hostname.includes('netflix.com')) return 'netflix';
    if (hostname.includes('vimeo.com')) return 'vimeo';
    if (hostname.includes('dailymotion.com')) return 'dailymotion';
    if (hostname.includes('twitch.tv')) return 'twitch';
    if (hostname.includes('facebook.com') || hostname.includes('fb.com'))
      return 'facebook';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('tiktok.com')) return 'tiktok';

    return 'other';
  }

  private extractVideoTitle(): string {
    // Try to get title from various sources
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('youtube.com')) {
      const titleElement = document.querySelector(
        'h1.ytd-video-primary-info-renderer, h1.title'
      );
      return titleElement?.textContent?.trim() || '';
    }

    if (hostname.includes('netflix.com')) {
      const titleElement = document.querySelector('[data-uia="title"]');
      return titleElement?.textContent?.trim() || '';
    }

    // Generic fallback
    return document.title || '';
  }



  private createFocusIndicator() {
    if (!this.config.showIndicator) return;

    this.focusIndicator = document.createElement('div');
    this.focusIndicator.id = 'unwavering-focus-indicator';
    this.focusIndicator.innerHTML = `
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
    this.focusIndicator.style.cssText = `
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
    const content = this.focusIndicator.querySelector(
      '.focus-indicator-content'
    ) as HTMLElement;
    if (content) {
      content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
      `;
    }

    document.body.appendChild(this.focusIndicator);
  }

  private updateFocusIndicator() {
    if (!this.focusIndicator || !this.config.showIndicator) return;

    if (this.currentState.isPlaying) {
      this.focusIndicator.style.transform = 'translateX(0)';
      this.focusIndicator.style.opacity = '1';
    } else {
      this.focusIndicator.style.transform = 'translateX(100%)';
      this.focusIndicator.style.opacity = '0';
    }
  }

  private removeFocusIndicator() {
    if (this.focusIndicator) {
      this.focusIndicator.remove();
      this.focusIndicator = null;
    }
  }

  private notifyBackgroundScript() {
    chrome.runtime
      .sendMessage({
        type: 'VIDEO_FOCUS_STATE_CHANGED',
        state: this.currentState,
      })
      .catch(error => {
        console.error('Error notifying background script:', error);
      });
  }
}

export { supportsVideoFocus } from './video-platform-detector';
