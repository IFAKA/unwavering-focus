import { VideoState, VideoFocusConfig } from '../types';
import { VideoFocusIndicator } from './video-focus-indicator';

export class VideoFocusManager {
  private config: VideoFocusConfig;
  private currentState: VideoState = { isPlaying: false, platform: '' };
  private observer: MutationObserver | null = null;
  private videoElements: Set<HTMLVideoElement> = new Set();
  private focusIndicator: VideoFocusIndicator;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private overlayElement: HTMLElement | null = null;

  constructor(config: VideoFocusConfig) {
    this.config = config;
    this.focusIndicator = new VideoFocusIndicator();
  }

  public start() {
    if (!this.config.enabled) return;

    this.detectVideoElements();
    this.setupObserver();
    this.focusIndicator.create(this.config);
    this.setupMouseMovementPrevention();

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

    this.focusIndicator.remove();
    this.removeMouseMovementPrevention();
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
      this.focusIndicator.update(this.currentState.isPlaying, this.config);
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



  private setupMouseMovementPrevention() {
    if (!this.config.preventMouseMovement) return;

    this.mouseMoveListener = (e: MouseEvent) => {
      if (this.currentState.isPlaying) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('mousemove', this.mouseMoveListener, { passive: false });
    document.addEventListener('click', this.mouseMoveListener, { passive: false });
    document.addEventListener('dblclick', this.mouseMoveListener, { passive: false });
  }

  private removeMouseMovementPrevention() {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
      document.removeEventListener('click', this.mouseMoveListener);
      document.removeEventListener('dblclick', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }

    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
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
