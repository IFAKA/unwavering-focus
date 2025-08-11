import { YouTubeDistractionConfig } from './types';

/**
 * Hides a YouTube element with optional setting check
 */
export function hideElement(element: HTMLElement, setting?: keyof YouTubeDistractionConfig): void {
  if (element && !element.dataset.unwaveringFocusHidden) {
    element.dataset.unwaveringFocusHidden = 'true';
    element.style.display = 'none';
    element.style.visibility = 'hidden';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
  }
}

/**
 * Restores a hidden YouTube element
 */
export function restoreElement(element: HTMLElement): void {
  if (element && element.dataset.unwaveringFocusHidden) {
    delete element.dataset.unwaveringFocusHidden;
    element.style.display = '';
    element.style.visibility = '';
    element.style.opacity = '';
    element.style.pointerEvents = '';
  }
}

/**
 * Hides video page specific elements
 */
export function hideVideoPageElements(config: YouTubeDistractionConfig): void {
  if (config.hideSecondary) {
    // Hide secondary info (likes, dislikes, share, etc.)
    const secondaryElements = document.querySelectorAll('#secondary, #secondary-inner, #meta, #meta-contents');
    secondaryElements.forEach(el => hideElement(el as HTMLElement, 'hideSecondary'));
  }

  if (config.hideMasthead) {
    // Hide masthead (top navigation)
    const mastheadElements = document.querySelectorAll('#masthead, #masthead-container');
    mastheadElements.forEach(el => hideElement(el as HTMLElement, 'hideMasthead'));
  }

  if (config.hideOwner) {
    // Hide channel owner info
    const ownerElements = document.querySelectorAll('#owner, #owner-name, #owner-sub-count');
    ownerElements.forEach(el => hideElement(el as HTMLElement, 'hideOwner'));
  }

  if (config.hideButtonShape) {
    // Hide button shapes (like/dislike buttons)
    const buttonShapeElements = document.querySelectorAll('[data-a11y-order]');
    buttonShapeElements.forEach(el => hideElement(el as HTMLElement, 'hideButtonShape'));
  }

  if (config.hideAuthorThumbnail) {
    // Hide author thumbnail
    const authorThumbnailElements = document.querySelectorAll('#author-thumbnail, #avatar-btn');
    authorThumbnailElements.forEach(el => hideElement(el as HTMLElement, 'hideAuthorThumbnail'));
  }

  if (config.hideSegmentedButtons) {
    // Hide segmented buttons (like/dislike)
    const segmentedButtonElements = document.querySelectorAll('#segmented-like-button, #segmented-dislike-button');
    segmentedButtonElements.forEach(el => hideElement(el as HTMLElement, 'hideSegmentedButtons'));
  }

  if (config.hideGridShelf) {
    // Hide grid shelf (recommended videos)
    const gridShelfElements = document.querySelectorAll('#grid-shelf, #related');
    gridShelfElements.forEach(el => hideElement(el as HTMLElement, 'hideGridShelf'));
  }

  if (config.hideMiniGuide) {
    // Hide mini guide (sidebar)
    const miniGuideElements = document.querySelectorAll('#mini-guide, #guide-content');
    miniGuideElements.forEach(el => hideElement(el as HTMLElement, 'hideMiniGuide'));
  }

  if (config.hideSections) {
    // Hide sections (comments, etc.)
    const sectionElements = document.querySelectorAll('#sections, #comments');
    sectionElements.forEach(el => hideElement(el as HTMLElement, 'hideSections'));
  }

  if (config.hideStart) {
    // Hide start button
    const startElements = document.querySelectorAll('#start');
    startElements.forEach(el => hideElement(el as HTMLElement, 'hideStart'));
  }

  if (config.hideButtons) {
    // Hide various buttons
    const buttonElements = document.querySelectorAll('#buttons, #top-level-buttons');
    buttonElements.forEach(el => hideElement(el as HTMLElement, 'hideButtons'));
  }
}

/**
 * Hides search page specific elements
 */
export function hideSearchPageElements(config: YouTubeDistractionConfig): void {
  if (config.hideMasthead) {
    // Hide masthead on search page
    const mastheadElements = document.querySelectorAll('#masthead, #masthead-container');
    mastheadElements.forEach(el => hideElement(el as HTMLElement, 'hideMasthead'));
  }

  if (config.hideMiniGuide) {
    // Hide mini guide on search page
    const miniGuideElements = document.querySelectorAll('#mini-guide, #guide-content');
    miniGuideElements.forEach(el => hideElement(el as HTMLElement, 'hideMiniGuide'));
  }
}

/**
 * Hides common elements across all YouTube pages
 */
export function hideCommonElements(config: YouTubeDistractionConfig): void {
  if (config.hideMasthead) {
    // Hide masthead on all pages
    const mastheadElements = document.querySelectorAll('#masthead, #masthead-container');
    mastheadElements.forEach(el => hideElement(el as HTMLElement, 'hideMasthead'));
  }

  if (config.hideMiniGuide) {
    // Hide mini guide on all pages
    const miniGuideElements = document.querySelectorAll('#mini-guide, #guide-content');
    miniGuideElements.forEach(el => hideElement(el as HTMLElement, 'hideMiniGuide'));
  }
}
