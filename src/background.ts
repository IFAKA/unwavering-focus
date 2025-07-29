import StorageService from './services/storage';
import { shouldRedirect, extractDomain } from './utils/urlUtils';
import { getDateString } from './utils/habitUtils';
import { DistractingDomain, ExtensionConfig } from './types';

const storage = StorageService.getInstance();

// Initialize default configuration
const defaultConfig: ExtensionConfig = {
  smartSearch: { enabled: true },
  distractionBlocker: { enabled: true, domains: [] },
  eyeCare: { enabled: true, soundVolume: 0.5 },
  tabLimiter: { maxTabs: 3, excludedDomains: [] },
  focusPage: {
    motivationalMessage: "Enfócate. Tu tiempo es oro.",
    habits: [],
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
    console.log('Existing storage data:', existingData);
    
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
      console.log('Initializing extension with default configuration');
      await storage.setMultiple(completeData);
    } else {
      console.log('Extension already configured, ensuring defaults are set');
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
    await chrome.alarms.create('eyeCare20', { delayInMinutes: 20, periodInMinutes: 20 });
  }
}

// Handle eye care notification
async function handleEyeCareNotification() {
  const config = await storage.get('config');
  if (!config?.eyeCare.enabled) return;

  console.log('Playing eye care notification sound');

  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(config.eyeCare.soundVolume, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    console.log('Eye care sound played successfully');
  } catch (error) {
    console.error('Error playing eye care sound:', error);
  }

  // Show notification
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icon.svg'),
      title: 'Eye Care Reminder',
      message: 'Look 20 feet away for 20 seconds.'
    });
    console.log('Eye care notification created');
  } catch (error) {
    console.error('Error creating notification:', error);
  }

  // Set 20-second timer for second notification
  setTimeout(async () => {
    if (config?.eyeCare.enabled) {
      console.log('Playing second eye care notification sound');
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(config.eyeCare.soundVolume, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        console.log('Second eye care sound played successfully');
      } catch (error) {
        console.error('Error playing second eye care sound:', error);
      }
    }
  }, 20000);
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

  console.log(`Tab created. Total tabs: ${tabs.length}, Non-excluded (excluding new): ${nonExcludedTabs.length}, Limit: ${maxTabs}`);

  if (nonExcludedTabs.length >= maxTabs) {
    console.log(`Tab limit exceeded. Closing the newly created tab.`);
    // Close the newly created tab instead of the oldest
    if (tab.id) {
      await chrome.tabs.remove(tab.id);
      console.log(`Closed newly created tab ${tab.id}`);
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
    console.log(`Updating tab count: ${tabCount}`);
    await storage.set('tabCount', tabCount);
  } catch (error) {
    console.error('Error updating tab count:', error);
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed, initializing...');
  await initializeStorage();
  await setupEyeCareAlarm();
  await updateTabCount();
});

// Also initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension starting up...');
  await initializeStorage();
  await updateTabCount();
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === 'eyeCare20') {
    await handleEyeCareNotification();
  }
});

// Handle tab events
chrome.tabs.onUpdated.addListener(handleTabUpdate);
chrome.tabs.onCreated.addListener(handleTabCreated);
chrome.tabs.onRemoved.addListener(updateTabCount);

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log('Background script received message:', message);
  
  try {
    switch (message.type) {
      case 'GET_STORAGE_DATA':
        console.log('Handling GET_STORAGE_DATA request');
        // Get actual data from storage
        storage.getAll().then(data => {
          const responseData = {
            savedSearches: data.savedSearches || [],
            distractingDomains: data.distractingDomains || [],
            habitEntries: data.habitEntries || [],
            config: data.config || defaultConfig,
            tabCount: data.tabCount || 0
          };
          console.log('Sending storage data:', responseData);
          sendResponse(responseData);
        });
        break;
      
      case 'GET_TAB_COUNT':
        console.log('Handling GET_TAB_COUNT request');
        updateTabCount().then(() => {
          storage.get('tabCount').then(tabCount => {
            console.log('Sending tab count:', tabCount);
            sendResponse({ tabCount: tabCount || 0 });
          });
        });
        break;
      
      case 'SAVE_SEARCH':
        console.log('Handling SAVE_SEARCH request:', message.query);
        storage.get('savedSearches').then(searches => {
          const currentSearches = searches || [];
          const newSearch = {
            id: Date.now().toString(),
            query: message.query,
            timestamp: Date.now()
          };
          currentSearches.push(newSearch);
          storage.set('savedSearches', currentSearches).then(() => {
            console.log('Search saved successfully');
            sendResponse({ success: true });
          });
        });
        break;
      
      case 'DELETE_SEARCH':
        console.log('Handling DELETE_SEARCH request:', message.id);
        storage.get('savedSearches').then(searches => {
          const currentSearches = searches || [];
          const filteredSearches = currentSearches.filter(s => s.id !== message.id);
          storage.set('savedSearches', filteredSearches).then(() => {
            console.log('Search deleted successfully');
            sendResponse({ success: true });
          });
        });
        break;
      
      case 'UPDATE_HABIT_ENTRY':
        console.log('Handling UPDATE_HABIT_ENTRY request');
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
            console.log('Habit entry updated successfully');
            sendResponse({ success: true });
          });
        });
        break;
      
      case 'UPDATE_CONFIG':
        console.log('Handling UPDATE_CONFIG request');
        storage.set('config', message.config).then(() => {
          console.log('Config updated successfully');
          sendResponse({ success: true });
        });
        break;
      
      case 'TEST_EYE_CARE':
        console.log('Handling TEST_EYE_CARE request');
        handleEyeCareNotification().then(() => {
          console.log('Eye care test completed');
          sendResponse({ success: true });
        });
        break;
      
      case 'CHECK_DISTRACTING_DOMAIN':
        console.log('Handling CHECK_DISTRACTING_DOMAIN request:', message.url);
        storage.get('config').then(config => {
          if (!config?.distractionBlocker?.enabled) {
            sendResponse({ shouldBlock: false, shouldShowOverlay: false });
            return;
          }

          const domain = extractDomain(message.url);
          const distractingDomain = config.distractionBlocker.domains.find(d => d.domain === domain);
          
          if (!distractingDomain) {
            sendResponse({ shouldBlock: false, shouldShowOverlay: false });
            return;
          }

          // Check if it's a homepage visit (not specific content)
          const isHomepage = !message.url.includes('/') || message.url.split('/').length <= 3;
          
          if (!isHomepage) {
            sendResponse({ shouldBlock: false, shouldShowOverlay: false });
            return;
          }

          // Check daily limit
          const today = new Date().toISOString().split('T')[0];
          if (distractingDomain.lastResetDate !== today) {
            // Reset counter for new day
            distractingDomain.currentCount = 0;
            distractingDomain.lastResetDate = today;
          }

          const remainingVisits = Math.max(0, distractingDomain.dailyLimit - distractingDomain.currentCount);
          
          if (remainingVisits <= 0) {
            // Daily limit exceeded - redirect to focus page
            sendResponse({ 
              shouldBlock: true, 
              shouldShowOverlay: false,
              domain: domain, 
              remainingVisits: 0 
            });
          } else {
            // Still have visits left - show overlay
            distractingDomain.currentCount++;
            storage.set('config', config).then(() => {
              sendResponse({ 
                shouldBlock: false,
                shouldShowOverlay: true,
                domain: domain, 
                remainingVisits: remainingVisits - 1 
              });
            });
          }
        });
        break;
      
      default:
        console.log('Unknown message type:', message.type);
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ error: 'Internal error' });
  }
  
  return true; // Keep message channel open for async response
}); 