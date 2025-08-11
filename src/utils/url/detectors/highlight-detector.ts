/**
 * Detects "Copy link to Highlight" URLs
 */
export function isCopyLinkToHighlight(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hash = urlObj.hash;
    
    // Check for the "Copy link to Highlight" pattern: #:~:text=...
    const highlightPattern = /#:~:text=/;
    return highlightPattern.test(hash);
  } catch {
    return false;
  }
}

/**
 * Extracts highlighted text from "Copy link to Highlight" URLs
 */
export function extractHighlightedText(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hash = urlObj.hash;
    
    // Check for the "Copy link to Highlight" pattern: #:~:text=...
    const highlightPattern = /#:~:text=(.+)/;
    const match = hash.match(highlightPattern);
    
    if (match && match[1]) {
      // Decode the URL-encoded text
      const decodedText = decodeURIComponent(match[1]);
      return decodedText;
    }
    
    return null;
  } catch {
    return null;
  }
}
