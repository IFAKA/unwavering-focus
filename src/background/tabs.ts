import StorageService from '../services/storage';
import { extractDomain, isHomepage } from '../utils/urlUtils';
import { DistractingDomain } from '../types';

const storage = StorageService.getInstance();

// Helper function to send messages to tabs with content script injection fallback
export async function sendMessageToTab(tabId: number, message: any): Promise<void> {
  try {
    // First try to send the message directly
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.log('Content script not ready for tab:', tabId, 'Injecting content script...');
    try {
      // If content script is not ready, inject it first
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
      
      // Wait a bit for the content script to initialize
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tabId, message);
        } catch (retryError) {
          console.error('Failed to send message after content script injection:', retryError);
        }
      }, 100);
    } catch (injectionError) {
      console.error('Failed to inject content script for tab:', tabId, injectionError);
    }
  }
}

export async function handleTabCreated(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return;
  }

  const domain = extractDomain(tab.url);
  const config = await storage.get('config');
  
  // Check if this is a distracting domain
  if (config?.distractionBlocker.enabled) {
    const distractingDomains = await storage.get('distractingDomains') || [];
    const isDistracting = distractingDomains.some((d: DistractingDomain) => d.domain === domain);
    
    if (isDistracting) {
      // Close the tab immediately
      if (tab.id) {
        await chrome.tabs.remove(tab.id);
        return;
      }
    }
  }
  
  // Update tab count
  await updateTabCount();
}

export async function updateTabCount(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({});
    const validTabs = tabs.filter(tab => 
      tab.url && 
      !tab.url.startsWith('chrome://') && 
      !tab.url.startsWith('chrome-extension://')
    );
    
    await storage.set('tabCount', validTabs.length);
  } catch (error) {
    console.error('Error updating tab count:', error);
  }
}

export async function handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): Promise<void> {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    const domain = extractDomain(tab.url);
    const config = await storage.get('config');
    
    // Check tab limiter
    if (config?.tabLimiter.enabled) {
      const maxTabs = config.tabLimiter.maxTabs;
      const excludedDomains = config.tabLimiter.excludedDomains || [];
      
      // Skip if domain is excluded
      if (excludedDomains.includes(domain)) {
        return;
      }
      
      // Get all tabs
      const allTabs = await chrome.tabs.query({});
      const validTabs = allTabs.filter(t => 
        t.url && 
        !t.url.startsWith('chrome://') && 
        !t.url.startsWith('chrome-extension://') &&
        !excludedDomains.includes(extractDomain(t.url))
      );
      
      if (validTabs.length > maxTabs) {
        // Find tabs to close (keep the most recent ones)
        const tabsToClose = validTabs
          .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0))
          .slice(0, validTabs.length - maxTabs);
        
        // Close old tabs
        for (const tabToClose of tabsToClose) {
          if (tabToClose.id && tabToClose.id !== activeInfo.tabId) {
            await chrome.tabs.remove(tabToClose.id);
          }
        }
      }
    }
    
    // Check distraction blocker
    if (config?.distractionBlocker.enabled) {
      const distractingDomains = await storage.get('distractingDomains') || [];
      const isDistracting = distractingDomains.some((d: DistractingDomain) => d.domain === domain);
      
      if (isDistracting) {
        // Close the tab
        await chrome.tabs.remove(activeInfo.tabId);
        return;
      }
    }
    
    // Update tab count
    await updateTabCount();
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
}

export async function handleTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): Promise<void> {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.startsWith('chrome-extension://') || tab.url.startsWith('chrome://')) return;
    try {
      const config = await storage.get('config');
      if (config?.distractionBlocker?.enabled) {
        const domain = extractDomain(tab.url);
        const distractingDomain = config.distractionBlocker.domains.find((d: DistractingDomain) => d.domain === domain);
        if (distractingDomain) {
          try {
            await chrome.tabs.sendMessage(tabId, { type: 'CHECK_DISTRACTING_DOMAIN', url: tab.url });
          } catch {
            try {
              await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
              setTimeout(async () => {
                try {
                  await chrome.tabs.sendMessage(tabId, { type: 'CHECK_DISTRACTING_DOMAIN', url: tab.url });
                } catch (error) {
                  console.error('Failed to send message after injection:', error);
                }
              }, 1000);
            } catch (injectionError) {
              console.error('Failed to inject content script:', injectionError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling tab update:', error);
    }
  }
}

export function clearTabStateForRemovedTab(tabId: number): void {
  // This function is no longer needed as state is managed by StorageService
  // Keeping it for now as it might be called from other parts of the app
  // If it's truly unused, it can be removed.
}


