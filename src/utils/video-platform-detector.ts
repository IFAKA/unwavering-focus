/**
 * Helper function to check if current page supports video focus
 */
export function supportsVideoFocus(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  const supportedDomains = [
    'youtube.com',
    'netflix.com',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'facebook.com',
    'fb.com',
    'instagram.com',
    'tiktok.com',
  ];

  // Exclude YouTube Music
  if (hostname === 'music.youtube.com') {
    return false;
  }

  return supportedDomains.some(domain => hostname.includes(domain));
}
