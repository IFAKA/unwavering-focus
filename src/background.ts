import StorageService from './services/storage';
import { shouldRedirect, extractDomain, isHomepage } from './utils/urlUtils';
import { getDateString } from './utils/habitUtils';
import { DistractingDomain, ExtensionConfig } from './types';

const storage = StorageService.getInstance();

// Initialize default configuration
const defaultConfig: ExtensionConfig = {
  smartSearch: { 
    enabled: true,
    searchAllEnabled: true 
  },
  distractionBlocker: { enabled: true, domains: [] },
  eyeCare: { enabled: true, soundVolume: 0.5 },
  tabLimiter: { maxTabs: 3, excludedDomains: [] },
  focusPage: {
    motivationalMessage: "Enfócate. Tu tiempo es oro.",
    habits: [],
    pillars: [],
    reinforcementMessages: {
      high: "Your discipline forges your excellence.",
      medium: "Stay consistent. Progress builds momentum.",
      low: "Regain control. Small actions today build momentum."
    }
  }
};

// Initialize storage with default values
async function initializeStorage() {
  try {
    const existingData = await storage.getAll();
    
    // Always ensure we have the complete data structure
    const completeData = {
      savedSearches: existingData.savedSearches || [],
      distractingDomains: existingData.distractingDomains || [],
      habitEntries: existingData.habitEntries || [],
      config: existingData.config || defaultConfig,
      tabCount: existingData.tabCount || 0
    };
    
    // If no config exists, initialize with defaults
    if (!existingData.config) {
      await storage.setMultiple(completeData);
    } else {
      // Ensure default values are set even if config exists
      const updatedConfig = {
        ...defaultConfig,
        ...existingData.config,
        // Force these specific defaults
        distractionBlocker: { enabled: true, domains: existingData.config.distractionBlocker?.domains || [] },
        eyeCare: { enabled: true, soundVolume: existingData.config.eyeCare?.soundVolume || 0.5 },
        tabLimiter: { maxTabs: 3, excludedDomains: existingData.config.tabLimiter?.excludedDomains || [] }
      };
      completeData.config = updatedConfig;
      await storage.set('config', updatedConfig);
    }
    
    // Always update tab count on initialization
    await updateTabCount();
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Handle eye care reminders
async function setupEyeCareAlarm() {
  const config = await storage.get('config');
  if (config?.eyeCare.enabled) {
    // Clear existing alarms
    await chrome.alarms.clear('eyeCare20');
    await chrome.alarms.clear('eyeCare20Second');
    
    // Create the 20-minute alarm
    await chrome.alarms.create('eyeCare20', { delayInMinutes: 20, periodInMinutes: 20 });
    
    // Store the next alarm time for countdown
    const nextAlarmTime = Date.now() + (20 * 60 * 1000);
    await storage.set('nextEyeCareAlarm', nextAlarmTime);
  }
}

// Handle eye care notification
async function handleEyeCareNotification() {
  const config = await storage.get('config');
  if (!config?.eyeCare.enabled) return;

  try {
    // Play end sound (original version) - signals the start of the 20-minute period
    await playEyeCareEndSound();
    
    // Reset the next alarm time for countdown display
    const nextAlarmTime = Date.now() + (20 * 60 * 1000);
    await storage.set('nextEyeCareAlarm', nextAlarmTime);
    
    // Set up 20-second follow-up
    setTimeout(async () => {
      const currentConfig = await storage.get('config');
      if (currentConfig?.eyeCare.enabled) {
        // Play start sound (inverted version) - signals the start of the 20-second period
        await playEyeCareStartSound();
      }
    }, 20000); // 20 seconds
    
  } catch (error) {
    console.error('Error in eye care notification:', error);
  }
}

// Play eye care start sound (inverted - low to high)
async function playEyeCareStartSound() {
  try {
    const config = await storage.get('config');
    const volume = config?.eyeCare?.soundVolume || 0.5;
    
    // Try to play in active tab first
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    let soundPlayed = false;
    
    for (const tab of tabs) {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          await chrome.tabs.sendMessage(tab.id!, { 
            type: 'PLAY_EYE_CARE_START_SOUND',
            volume: volume
          });
          soundPlayed = true;
          break;
        } catch (error) {
          // Continue to next tab
          continue;
        }
      }
    }
    
    // If no content script available, inject script to play sound
    if (!soundPlayed && tabs.length > 0) {
      const tab = tabs[0];
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: (volume) => {
              const audio = new Audio(chrome.runtime.getURL('sounds/eye-care-start.mp3'));
              audio.volume = volume;
              audio.play();
            },
            args: [volume]
          });
        } catch (error) {
          console.error('Failed to inject start sound script:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error playing eye care start sound:', error);
  }
}

// Play eye care end sound (original - high to low)
async function playEyeCareEndSound() {
  try {
    const config = await storage.get('config');
    const volume = config?.eyeCare?.soundVolume || 0.5;
    
    // Try to play in active tab first
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    let soundPlayed = false;
    
    for (const tab of tabs) {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          await chrome.tabs.sendMessage(tab.id!, { 
            type: 'PLAY_EYE_CARE_END_SOUND',
            volume: volume
          });
          soundPlayed = true;
          break;
        } catch (error) {
          // Continue to next tab
          continue;
        }
      }
    }
    
    // If no content script available, inject script to play sound
    if (!soundPlayed && tabs.length > 0) {
      const tab = tabs[0];
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: (volume) => {
              const audio = new Audio(chrome.runtime.getURL('sounds/eye-care-beep.mp3'));
              audio.volume = volume;
              audio.play();
            },
            args: [volume]
          });
        } catch (error) {
          console.error('Failed to inject end sound script:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error playing eye care end sound:', error);
  }
}

// Handle distraction blocking
async function handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  const config = await storage.get('config');
  if (!config?.distractionBlocker.enabled) return;

  const shouldBlock = shouldRedirect(tab.url, config.distractionBlocker.domains.map(d => d.domain));
  
  if (shouldBlock) {
    const domain = extractDomain(tab.url);
    const distractingDomain = config.distractionBlocker.domains.find(d => d.domain === domain);
    
    if (distractingDomain) {
      const today = getDateString();
      
      // Reset counter if it's a new day
      if (distractingDomain.lastResetDate !== today) {
        distractingDomain.currentCount = 0;
        distractingDomain.lastResetDate = today;
      }
      
      // Increment counter
      distractingDomain.currentCount++;
      
      // Check if limit exceeded
      if (distractingDomain.currentCount > distractingDomain.dailyLimit) {
        // Redirect to focus page
        await chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL('focus-page.html')
        });
        return;
      }
      
      // Update storage
      await storage.set('config', config);
    }
  }
}

// Handle tab limiting
async function handleTabCreated(tab: chrome.tabs.Tab) {
  const config = await storage.get('config');
  if (!config?.tabLimiter) return;

  const { maxTabs, excludedDomains } = config.tabLimiter;
  
  // Get all tabs
  const tabs = await chrome.tabs.query({});
  
  // Count non-excluded tabs (excluding the newly created tab)
  const nonExcludedTabs = tabs.filter((t: chrome.tabs.Tab) => {
    if (!t.url || t.id === tab.id) return false; // Exclude the new tab from count
    const domain = extractDomain(t.url);
    return !excludedDomains.some(excluded => 
      domain === excluded || domain.endsWith(`.${excluded}`)
    );
  });

  if (nonExcludedTabs.length >= maxTabs) {
    // Close the newly created tab instead of the oldest
    if (tab.id) {
      await chrome.tabs.remove(tab.id);
    }
  }
  
  // Update tab count after any changes
  await updateTabCount();
}

// Handle tab counting
async function updateTabCount() {
  try {
    const tabs = await chrome.tabs.query({});
    const tabCount = tabs.length;
    await storage.set('tabCount', tabCount);
  } catch (error) {
    console.error('Error updating tab count:', error);
  }
}

// Handle commands (keyboard shortcuts)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-smart-search') {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        const tab = tabs[0];
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          let modalShown = false;
          
          // Try to send message to content script first
          try {
            await chrome.tabs.sendMessage(tab.id!, { type: 'SHOW_SMART_SEARCH_MODAL' });
            modalShown = true;
          } catch (error) {
            // Content script not available, try injection
          }
          
          // If content script failed, inject script directly
          if (!modalShown) {
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id! },
                files: ['content.js']
              });
              // Try sending message again after injecting
              setTimeout(async () => {
                try {
                  await chrome.tabs.sendMessage(tab.id!, { type: 'SHOW_SMART_SEARCH_MODAL' });
                } catch (error) {
                  console.error('Could not show smart search modal:', error);
                }
              }, 100);
            } catch (error) {
              console.error('Failed to inject content script:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling smart search command:', error);
    }
  }
});

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
  await setupEyeCareAlarm();
  await updateTabCount();
});

// Also initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  await initializeStorage();
  await setupEyeCareAlarm();
  await updateTabCount();
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === 'eyeCare20') {
    await handleEyeCareNotification();
  }
});

// Reset eye care alarm when config changes
async function resetEyeCareAlarm() {
  const config = await storage.get('config');
  if (config?.eyeCare.enabled) {
    await setupEyeCareAlarm();
  } else {
    // Clear alarms if disabled
    await chrome.alarms.clear('eyeCare20');
    await chrome.alarms.clear('eyeCare20Second');
    await storage.remove('nextEyeCareAlarm');
  }
}

// Handle tab events
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if this is a distracting domain that needs overlay
    try {
      const config = await storage.get('config');
      if (config?.distractionBlocker?.enabled) {
        const domain = extractDomain(tab.url);
        const distractingDomain = config.distractionBlocker.domains.find(d => d.domain === domain);
        
        if (distractingDomain && isHomepage(tab.url)) {
          // Try to send message to content script
          try {
            await chrome.tabs.sendMessage(tabId, { type: 'CHECK_DISTRACTING_DOMAIN', url: tab.url });
          } catch (error) {
            // Content script not available, inject it
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
              });
              // Wait a bit then try sending message again
              setTimeout(async () => {
                try {
                  await chrome.tabs.sendMessage(tabId, { type: 'CHECK_DISTRACTING_DOMAIN', url: tab.url });
                } catch (error) {
                  console.error('Failed to send message after injection:', error);
                }
              }, 500);
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
});
chrome.tabs.onCreated.addListener(handleTabCreated);
chrome.tabs.onRemoved.addListener(updateTabCount);

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  
  try {
    switch (message.type) {
      case 'GET_STORAGE_DATA':
        Promise.all([
          storage.get('savedSearches'),
          storage.get('distractingDomains'),
          storage.get('habitEntries'),
          storage.get('config'),
          storage.get('tabCount'),
          storage.get('nextEyeCareAlarm')
        ]).then(([savedSearches, distractingDomains, habitEntries, config, tabCount, nextEyeCareAlarm]) => {
          const completeData = {
            savedSearches: savedSearches || [],
            distractingDomains: distractingDomains || [],
            habitEntries: habitEntries || [],
            config: config || defaultConfig,
            tabCount: tabCount || 0,
            nextEyeCareAlarm
          };
          
          sendResponse(completeData);
        }).catch(error => {
          console.error('Error getting storage data:', error);
          sendResponse({
            savedSearches: [],
            distractingDomains: [],
            habitEntries: [],
            config: defaultConfig,
            tabCount: 0,
            nextEyeCareAlarm: undefined
          });
        });
        break;
      
      case 'GET_TAB_COUNT':
        updateTabCount().then(() => {
          storage.get('tabCount').then(tabCount => {
            sendResponse({ tabCount: tabCount || 0 });
          });
        });
        break;
      
      case 'SAVE_SEARCH':
        storage.get('savedSearches').then(searches => {
          const currentSearches = searches || [];
          const newSearch = {
            id: Date.now().toString(),
            query: message.query,
            timestamp: Date.now()
          };
          currentSearches.push(newSearch);
          storage.set('savedSearches', currentSearches).then(() => {
            sendResponse({ success: true });
          });
        });
        break;
      
      case 'DELETE_SEARCH':
        storage.get('savedSearches').then(searches => {
          const currentSearches = searches || [];
          const filteredSearches = currentSearches.filter(s => s.id !== message.id);
          storage.set('savedSearches', filteredSearches).then(() => {
            sendResponse({ success: true });
          });
        });
        break;
      
      case 'CLEAR_ALL_SEARCHES':
        storage.set('savedSearches', []).then(() => {
          sendResponse({ success: true });
        });
        break;
      
      case 'UPDATE_HABIT_ENTRY':
        storage.get('habitEntries').then(entries => {
          const currentEntries = entries || [];
          const existingIndex = currentEntries.findIndex(e => 
            e.habitId === message.habitId && e.date === message.date
          );
          
          if (existingIndex >= 0) {
            currentEntries[existingIndex].status = message.status;
          } else {
            currentEntries.push({
              habitId: message.habitId,
              date: message.date,
              status: message.status
            });
          }
          
          storage.set('habitEntries', currentEntries).then(() => {
            sendResponse({ success: true });
          });
        });
        break;
      
      case 'UPDATE_CONFIG':
        console.log('Handling UPDATE_CONFIG request:', message.config);
        storage.set('config', message.config).then(async () => {
          console.log('Config saved successfully');
          // Reset eye care alarm if config changed
          await resetEyeCareAlarm();
          sendResponse({ success: true });
        }).catch(error => {
          console.error('Error saving config:', error);
          sendResponse({ error: 'Failed to save config' });
        });
        break;
      
      case 'CHECK_DISTRACTING_DOMAIN':
        console.log('Handling CHECK_DISTRACTING_DOMAIN request:', message.url);
        storage.get('config').then(config => {
          console.log('Current config:', config);
          console.log('Distraction blocker enabled:', config?.distractionBlocker?.enabled);
          console.log('Distracting domains:', config?.distractionBlocker?.domains);
          
          if (!config?.distractionBlocker?.enabled) {
            console.log('Distraction blocker disabled');
            sendResponse({ shouldBlock: false, shouldShowOverlay: false });
            return;
          }

          const domain = extractDomain(message.url);
          console.log('Extracted domain:', domain);
          console.log('Looking for domain in:', config.distractionBlocker.domains.map(d => d.domain));
          
          // More flexible domain matching
          const distractingDomain = config.distractionBlocker.domains.find(d => {
            const configuredDomain = d.domain.toLowerCase();
            const extractedDomain = domain.toLowerCase();
            
            // Exact match
            if (configuredDomain === extractedDomain) return true;
            
            // www subdomain match (www.facebook.com matches facebook.com)
            if (extractedDomain.startsWith('www.') && extractedDomain.slice(4) === configuredDomain) return true;
            
            // Subdomain match (facebook.com matches www.facebook.com)
            if (configuredDomain.startsWith('www.') && configuredDomain.slice(4) === extractedDomain) return true;
            
            return false;
          });
          
          console.log('Found distracting domain:', distractingDomain);
          
          if (!distractingDomain) {
            console.log('Domain not in distracting list');
            sendResponse({ shouldBlock: false, shouldShowOverlay: false });
            return;
          }

          // Check if it's a homepage (not specific content)
          const isHomepageResult = isHomepage(message.url);
          console.log('Is homepage:', isHomepageResult);
          console.log('URL being checked:', message.url);
          if (!isHomepageResult) {
            console.log('Not a homepage, allowing access');
            sendResponse({ shouldBlock: false, shouldShowOverlay: false });
            return;
          }

          const today = new Date().toISOString().split('T')[0];
          if (distractingDomain.lastResetDate !== today) {
            distractingDomain.currentCount = 0;
            distractingDomain.lastResetDate = today;
            console.log('Reset counter for new day');
          }

          const remainingVisits = Math.max(0, distractingDomain.dailyLimit - distractingDomain.currentCount);
          console.log('Remaining visits:', remainingVisits, 'Current count:', distractingDomain.currentCount, 'Daily limit:', distractingDomain.dailyLimit);
          
          if (remainingVisits <= 0) {
            console.log('No visits left, redirecting to focus page');
            // No visits left - redirect to focus page
            sendResponse({ 
              shouldBlock: true, 
              shouldShowOverlay: false,
              domain: domain,
              remainingVisits: 0 
            });
          } else {
            console.log('Showing overlay with remaining visits');
            // Show overlay with remaining visits
            sendResponse({ 
              shouldBlock: false, 
              shouldShowOverlay: true,
              domain: domain,
              remainingVisits: remainingVisits 
            });
          }
        });
        break;
      
      case 'INCREMENT_DISTRACTING_DOMAIN':
        console.log('Handling INCREMENT_DISTRACTING_DOMAIN request:', message.domain);
        storage.get('config').then(config => {
          if (!config?.distractionBlocker?.enabled) {
            sendResponse({ success: false });
            return;
          }

          // Use the same flexible domain matching
          const distractingDomain = config.distractionBlocker.domains.find(d => {
            const configuredDomain = d.domain.toLowerCase();
            const requestedDomain = message.domain.toLowerCase();
            
            // Exact match
            if (configuredDomain === requestedDomain) return true;
            
            // www subdomain match (www.facebook.com matches facebook.com)
            if (requestedDomain.startsWith('www.') && requestedDomain.slice(4) === configuredDomain) return true;
            
            // Subdomain match (facebook.com matches www.facebook.com)
            if (configuredDomain.startsWith('www.') && configuredDomain.slice(4) === requestedDomain) return true;
            
            return false;
          });
          
          if (distractingDomain) {
            distractingDomain.currentCount++;
            console.log('Incremented counter for domain:', message.domain, 'New count:', distractingDomain.currentCount);
            storage.set('config', config).then(() => {
              sendResponse({ success: true });
            });
          } else {
            console.log('Domain not found for increment:', message.domain);
            sendResponse({ success: false });
          }
        });
        break;
      
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ error: 'Internal error' });
  }
  
  return true; // Keep message channel open for async response
}); 