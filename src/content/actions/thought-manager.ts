import { FEATURE_CONSTANTS } from '../../constants';

/**
 * Saves a thought to storage
 */
export function saveThought(text: string): void {
  if (!text.trim()) return;
  
  // Save to storage
  chrome.runtime.sendMessage({
    type: FEATURE_CONSTANTS.MESSAGE_TYPES.SAVE_SEARCH,
    query: text
  }).catch(console.error);
}

/**
 * Gets all saved thoughts from storage
 */
export async function getSavedThoughts(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['savedThoughts'], (result) => {
      const thoughts = result.savedThoughts || [];
      resolve(thoughts);
    });
  });
}

/**
 * Deletes a thought from storage
 */
export async function deleteThought(text: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['savedThoughts'], (result) => {
      const thoughts = result.savedThoughts || [];
      const filteredThoughts = thoughts.filter((thought: string) => thought !== text);
      
      chrome.storage.local.set({ savedThoughts: filteredThoughts }, () => {
        resolve();
      });
    });
  });
}

/**
 * Clears all saved thoughts
 */
export async function clearAllThoughts(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove('savedThoughts', () => {
      resolve();
    });
  });
}

/**
 * Searches through saved thoughts
 */
export async function searchThoughts(query: string): Promise<string[]> {
  const thoughts = await getSavedThoughts();
  const lowerQuery = query.toLowerCase();
  
  return thoughts.filter(thought => 
    thought.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Gets the count of saved thoughts
 */
export async function getThoughtCount(): Promise<number> {
  const thoughts = await getSavedThoughts();
  return thoughts.length;
}

/**
 * Checks if a thought already exists
 */
export async function thoughtExists(text: string): Promise<boolean> {
  const thoughts = await getSavedThoughts();
  return thoughts.includes(text);
}
