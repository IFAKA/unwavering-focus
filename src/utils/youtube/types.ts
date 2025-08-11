// YouTube-specific distraction blocking types and interfaces

export interface YouTubeDistractionConfig {
  hideSecondary: boolean;
  hideMasthead: boolean;
  hideOwner: boolean;
  hideButtonShape: boolean;
  hideAuthorThumbnail: boolean;
  hideSegmentedButtons: boolean;
  hideGridShelf: boolean;
  hideMiniGuide: boolean;
  hideSections: boolean;
  hideStart: boolean;
  hideButtons: boolean;
}

export const defaultYouTubeConfig: YouTubeDistractionConfig = {
  hideSecondary: true,
  hideMasthead: true,
  hideOwner: true,
  hideButtonShape: true,
  hideAuthorThumbnail: true,
  hideSegmentedButtons: true,
  hideGridShelf: true,
  hideMiniGuide: true,
  hideSections: true,
  hideStart: true,
  hideButtons: true
};

export type YouTubePageType = 'video' | 'search' | 'other';
