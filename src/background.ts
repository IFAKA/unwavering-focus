import StorageService from './services/storage';
import { extractDomain, isHomepage } from './utils/urlUtils';
import { DistractingDomain, DEFAULT_CONFIG, SearchQuery, HabitEntry, VideoState } from './types';

const storage = StorageService.getInstance();

// Use centralized default configuration
const defaultConfig = DEFAULT_CONFIG;

// Video focus state tracking
let videoFocusStates = new Map<number, VideoState>();

// Modal state tracking per tab
let tabModalStates = new Map<number, Set<string>>();

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
        tabLimiter: { enabled: true, maxTabs: 3, excludedDomains: existingData.config.tabLimiter?.excludedDomains || [] }
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
    // Play start sound (inverted version) - signals the start of the 20-minute period
    await playEyeCareStartSound();
    
    // Reset the next alarm time for countdown display
    const nextAlarmTime = Date.now() + (20 * 60 * 1000);
    await storage.set('nextEyeCareAlarm', nextAlarmTime);
    
    // Set up 20-second follow-up
    setTimeout(async () => {
      const currentConfig = await storage.get('config');
      if (currentConfig?.eyeCare.enabled) {
        // Play end sound (original version) - signals the start of the 20-second period
        await playEyeCareEndSound();
      }
    }, 20000); // 20 seconds
    
  } catch (error) {
    console.error('Error in eye care notification:', error);
  }
}

// Play eye care start sound (inverted - low to high) - used for 20-minute reminder
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
          const response = await chrome.tabs.sendMessage(tab.id!, { 
            type: 'PLAY_EYE_CARE_START_SOUND',
            volume: volume
          });
          if (response && response.success) {
            soundPlayed = true;
            console.log('Eye care start sound played successfully via content script');
            break;
          } else if (response && response.method) {
            soundPlayed = true;
            console.log(`Eye care start sound played via fallback: ${response.method}`);
            break;
          }
        } catch (error) {
          console.log('Content script not available for tab:', tab.url);
          continue;
        }
      }
    }
    
    // If no content script available or audio failed, inject script to play sound
    if (!soundPlayed && tabs.length > 0) {
      const tab = tabs[0];
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: (volume) => {
              // Improved audio injection with better error handling
              const playAudioWithFallbacks = async () => {
                try {
                  // Check if we're on a restricted page
                  if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
                    console.log('Audio playback not allowed on chrome:// URLs');
                    return;
                  }

                  // Try to create and play audio
                  const audio = new Audio(chrome.runtime.getURL('sounds/eye-care-start.mp3'));
                  audio.volume = volume;
                  
                  try {
                    await audio.play();
                    console.log('Audio played successfully');
                  } catch (playError) {
                    console.error('Failed to play audio:', playError);
                    
                    // Try Web Audio API as fallback
                    try {
                      if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
                        const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
                        
                        // Resume audio context if it's suspended (required for autoplay policy)
                        if (audioContext.state === 'suspended') {
                          await audioContext.resume();
                        }
                        
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Lower volume
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.3);
                        
                        console.log('Web Audio API fallback used');
                        return;
                      }
                    } catch (webAudioError) {
                      console.error('Web Audio API failed:', webAudioError);
                    }
                    
                    // Try vibration as final fallback
                    try {
                      if (typeof navigator.vibrate === 'function' && document.hasFocus() && document.visibilityState === 'visible') {
                        // Use a simple vibration pattern to avoid blocking
                        navigator.vibrate(100);
                        console.log('Vibration fallback used');
                        return;
                      }
                    } catch (vibrationError) {
                      console.error('Vibration failed:', vibrationError);
                    }
                    
                    // Show visual notification as last resort
                    try {
                      const notification = document.createElement('div');
                      notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(0, 0, 0, 0.9);
                        color: white;
                        padding: 12px 16px;
                        border-radius: 8px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 14px;
                        z-index: 999999;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        animation: fadeInOut 2s ease-in-out;
                      `;
                      
                      const style = document.createElement('style');
                      style.textContent = `
                        @keyframes fadeInOut {
                          0% { opacity: 0; transform: translateY(-10px); }
                          20% { opacity: 1; transform: translateY(0); }
                          80% { opacity: 1; transform: translateY(0); }
                          100% { opacity: 0; transform: translateY(-10px); }
                        }
                      `;
                      
                      notification.textContent = '👁️ Eye Care Reminder';
                      document.head.appendChild(style);
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.remove();
                        style.remove();
                      }, 2000);
                      
                      console.log('Visual notification fallback used');
                    } catch (visualError) {
                      console.error('Visual notification failed:', visualError);
                    }
                  }
                } catch (error) {
                  console.error('Failed to create audio:', error);
                }
              };
              
              playAudioWithFallbacks();
            },
            args: [volume]
          });
          console.log('Audio injection script executed');
        } catch (error) {
          console.error('Failed to inject start sound script:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error playing eye care start sound:', error);
  }
}

// Play eye care end sound (original - high to low) - used for 20-second reminder
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
          const response = await chrome.tabs.sendMessage(tab.id!, { 
            type: 'PLAY_EYE_CARE_END_SOUND',
            volume: volume
          });
          if (response && response.success) {
            soundPlayed = true;
            console.log('Eye care end sound played successfully via content script');
            break;
          } else if (response && response.method) {
            soundPlayed = true;
            console.log(`Eye care end sound played via fallback: ${response.method}`);
            break;
          }
        } catch (error) {
          console.log('Content script not available for tab:', tab.url);
          continue;
        }
      }
    }
    
    // If no content script available or audio failed, inject script to play sound
    if (!soundPlayed && tabs.length > 0) {
      const tab = tabs[0];
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: (volume) => {
              // Improved audio injection with better error handling
              const playAudioWithFallbacks = async () => {
                try {
                  // Check if we're on a restricted page
                  if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
                    console.log('Audio playback not allowed on chrome:// URLs');
                    return;
                  }

                  // Try to create and play audio
                  const audio = new Audio(chrome.runtime.getURL('sounds/eye-care-beep.mp3'));
                  audio.volume = volume;
                  
                  try {
                    await audio.play();
                    console.log('Audio played successfully');
                  } catch (playError) {
                    console.error('Failed to play audio:', playError);
                    
                    // Try Web Audio API as fallback
                    try {
                      if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
                        const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
                        
                        // Resume audio context if it's suspended (required for autoplay policy)
                        if (audioContext.state === 'suspended') {
                          await audioContext.resume();
                        }
                        
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Lower volume
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.3);
                        
                        console.log('Web Audio API fallback used');
                        return;
                      }
                    } catch (webAudioError) {
                      console.error('Web Audio API failed:', webAudioError);
                    }
                    
                    // Try vibration as final fallback
                    try {
                      if (typeof navigator.vibrate === 'function' && document.hasFocus() && document.visibilityState === 'visible') {
                        // Use a simple vibration pattern to avoid blocking
                        navigator.vibrate(100);
                        console.log('Vibration fallback used');
                        return;
                      }
                    } catch (vibrationError) {
                      console.error('Vibration failed:', vibrationError);
                    }
                    
                    // Show visual notification as last resort
                    try {
                      const notification = document.createElement('div');
                      notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(0, 0, 0, 0.9);
                        color: white;
                        padding: 12px 16px;
                        border-radius: 8px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 14px;
                        z-index: 999999;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        animation: fadeInOut 2s ease-in-out;
                      `;
                      
                      const style = document.createElement('style');
                      style.textContent = `
                        @keyframes fadeInOut {
                          0% { opacity: 0; transform: translateY(-10px); }
                          20% { opacity: 1; transform: translateY(0); }
                          80% { opacity: 1; transform: translateY(0); }
                          100% { opacity: 0; transform: translateY(-10px); }
                        }
                      `;
                      
                      notification.textContent = '👁️ Eye Care Break';
                      document.head.appendChild(style);
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.remove();
                        style.remove();
                      }, 2000);
                      
                      console.log('Visual notification fallback used');
                    } catch (visualError) {
                      console.error('Visual notification failed:', visualError);
                    }
                  }
                } catch (error) {
                  console.error('Failed to create audio:', error);
                }
              };
              
              playAudioWithFallbacks();
            },
            args: [volume]
          });
          console.log('Audio injection script executed');
        } catch (error) {
          console.error('Failed to inject end sound script:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error playing eye care end sound:', error);
  }
}



// Handle tab limiting
async function handleTabCreated(tab: chrome.tabs.Tab) {
  const config = await storage.get('config');
  if (!config?.tabLimiter?.enabled) return;

  const { maxTabs, excludedDomains } = config.tabLimiter;
  
  // Get all tabs
  const tabs = await chrome.tabs.query({});
  
  // Count non-excluded tabs (excluding the newly created tab)
  const nonExcludedTabs = tabs.filter((t: chrome.tabs.Tab) => {
    if (!t.url || t.id === tab.id) return false; // Exclude the new tab from count
    const domain = extractDomain(t.url);
    return !excludedDomains.some((excluded: string) => 
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

// Handle tab switching prevention during video focus
async function handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
  const config = await storage.get('config');
  if (!config?.videoFocus?.enabled || !config?.videoFocus?.preventTabSwitch) return;

  // Check if any tab has a video playing
  let hasVideoPlaying = false;
  for (const [, state] of videoFocusStates) {
    if (state.isPlaying) {
      hasVideoPlaying = true;
      break;
    }
  }

  if (hasVideoPlaying) {
    // Check if the newly activated tab is the one with the video
    const videoPlayingTab = Array.from(videoFocusStates.entries()).find(([, state]) => state.isPlaying);
    
    if (videoPlayingTab && videoPlayingTab[0] !== activeInfo.tabId) {
      // Try to switch back to the video tab
      try {
        const videoTabId = videoPlayingTab[0];
        
        // First check if the video tab still exists
        try {
          const videoTab = await chrome.tabs.get(videoTabId);
          if (!videoTab) {
            // Tab doesn't exist, remove it from our tracking
            videoFocusStates.delete(videoTabId);
            return;
          }
        } catch (tabError) {
          // Tab doesn't exist, remove it from our tracking
          videoFocusStates.delete(videoTabId);
          return;
        }
        
        // Now try to switch to the video tab
        await chrome.tabs.update(videoTabId, { active: true });
        
        // Show a notification to the user
        try {
          await chrome.tabs.sendMessage(activeInfo.tabId, {
            type: 'VIDEO_FOCUS_BLOCKED_TAB_SWITCH',
            message: 'Tab switching blocked while video is playing'
          });
        } catch (messageError) {
          // If content script not available, inject a temporary notification
          try {
            await chrome.scripting.executeScript({
              target: { tabId: activeInfo.tabId },
              func: (message) => {
                const notification = document.createElement('div');
                notification.style.cssText = `
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: rgba(0, 0, 0, 0.9);
                  color: white;
                  padding: 20px;
                  border-radius: 10px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 16px;
                  z-index: 999999;
                  text-align: center;
                  max-width: 300px;
                `;
                notification.innerHTML = `
                  <div style="margin-bottom: 10px;">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
                  <div>${message}</div>
                  <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
                    Return to video tab to continue
                  </div>
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                  notification.remove();
                }, 3000);
              },
              args: ['Tab switching blocked while video is playing']
            });
          } catch (scriptError) {
            console.error('Failed to inject notification script:', scriptError);
          }
        }
      } catch (error) {
        console.error('Error switching back to video tab:', error);
        // If we can't switch to the video tab, remove it from tracking
        if (videoPlayingTab) {
          videoFocusStates.delete(videoPlayingTab[0]);
        }
      }
    }
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
    // Skip chrome-extension URLs to avoid permission errors
    if (tab.url.startsWith('chrome-extension://') || tab.url.startsWith('chrome://')) {
      return;
    }
    
    // Check if this is a distracting domain that needs overlay
    try {
      const config = await storage.get('config');
      if (config?.distractionBlocker?.enabled) {
        const domain = extractDomain(tab.url);
        const distractingDomain = config.distractionBlocker.domains.find((d: DistractingDomain) => d.domain === domain);
        
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
              }, 1000); // Increased timeout
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
chrome.tabs.onRemoved.addListener((tabId) => {
  // Clean up modal states for the removed tab
  tabModalStates.delete(tabId);
  
  // Clean up video focus states for the removed tab
  if (videoFocusStates.has(tabId)) {
    videoFocusStates.delete(tabId);
    console.log('Cleaned up video focus state for removed tab:', tabId);
  }
  
  updateTabCount();
});
chrome.tabs.onActivated.addListener(handleTabActivated);

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
        return true; // Keep message channel open for async response
      
      case 'GET_TAB_COUNT':
        updateTabCount().then(() => {
          storage.get('tabCount').then(tabCount => {
            sendResponse({ tabCount: tabCount || 0 });
          });
        });
        return true; // Keep message channel open for async response
      
      case 'SAVE_SEARCH':
        storage.get('savedSearches').then((searches: SearchQuery[] | undefined) => {
          const currentSearches: SearchQuery[] = searches || [];
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
        storage.get('savedSearches').then((searches: SearchQuery[] | undefined) => {
          const currentSearches: SearchQuery[] = searches || [];
          const filteredSearches = currentSearches.filter((s: SearchQuery) => s.id !== message.id);
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
        storage.get('habitEntries').then((entries: HabitEntry[] | undefined) => {
          const currentEntries: HabitEntry[] = entries || [];
          const existingIndex = currentEntries.findIndex((e: HabitEntry) => 
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
          
          // Check if YouTube distraction config was updated and notify YouTube tabs
          if (message.config.youtubeDistraction) {
            console.log('YouTube distraction config updated, notifying YouTube tabs');
            console.log('YouTube distraction config:', message.config.youtubeDistraction);
            chrome.tabs.query({ url: '*://*.youtube.com/*' }).then(tabs => {
              console.log('Found YouTube tabs:', tabs.length);
              tabs.forEach(tab => {
                if (tab.id) {
                  console.log('Sending config update to tab:', tab.id);
                  chrome.tabs.sendMessage(tab.id, {
                    type: 'UPDATE_YOUTUBE_DISTRACTION_CONFIG',
                    config: message.config.youtubeDistraction
                  }).catch(error => {
                    console.error('Error sending YouTube config update to tab:', error);
                  });
                }
              });
            });
          }
          
          // Check if video focus config was updated and notify all tabs
          if (message.config.videoFocus) {
            console.log('Video focus config updated, notifying all tabs');
            chrome.tabs.query({}).then(tabs => {
              tabs.forEach(tab => {
                if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                  chrome.tabs.sendMessage(tab.id, {
                    type: 'UPDATE_VIDEO_FOCUS_CONFIG',
                    config: message.config.videoFocus
                  }).catch(error => {
                    console.error('Error sending video focus config update to tab:', error);
                  });
                }
              });
            });
          }
          
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
          console.log('Looking for domain in:', config.distractionBlocker.domains.map((d: DistractingDomain) => d.domain));
          
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
            distractingDomain.timeUsedToday = 0;
            distractingDomain.lastResetDate = today;
            console.log('Reset time counter for new day');
          }

          const remainingMinutes = Math.max(0, distractingDomain.dailyTimeLimit - distractingDomain.timeUsedToday);
          console.log('Remaining minutes:', remainingMinutes, 'Time used today:', distractingDomain.timeUsedToday, 'Daily limit:', distractingDomain.dailyTimeLimit);
          
          if (remainingMinutes <= 0) {
            console.log('No time left, redirecting to focus page');
            // No time left - redirect to focus page
            sendResponse({ 
              shouldBlock: true, 
              shouldShowOverlay: false,
              domain: domain,
              remainingMinutes: 0 
            });
          } else {
            console.log('Showing overlay with remaining time');
            // Show overlay with remaining time
            sendResponse({ 
              shouldBlock: false, 
              shouldShowOverlay: true,
              domain: domain,
              remainingMinutes: remainingMinutes 
            });
          }
        }).catch(error => {
          console.error('Error in CHECK_DISTRACTING_DOMAIN:', error);
          sendResponse({ shouldBlock: false, shouldShowOverlay: false });
        });
        return true; // Keep message channel open for async response
      
      case 'SHOULD_SHOW_MODAL': {
        console.log('Handling SHOULD_SHOW_MODAL request:', message);
        const tabId = sender.tab?.id;
        if (!tabId) {
          console.log('No tab ID found, allowing modal');
          sendResponse(true);
          return;
        }
        
        // Get or create the set of domains that have shown modals for this tab
        if (!tabModalStates.has(tabId)) {
          tabModalStates.set(tabId, new Set());
        }
        const tabDomains = tabModalStates.get(tabId)!;
        
        // Check if modal has been shown for this domain in this tab
        const shouldShow = !tabDomains.has(message.domain);
        if (shouldShow) {
          tabDomains.add(message.domain);
          console.log('Modal will be shown for domain:', message.domain, 'in tab:', tabId);
        } else {
          console.log('Modal already shown for domain:', message.domain, 'in tab:', tabId, 'skipping');
        }
        
        sendResponse(shouldShow);
        return true; // Keep message channel open for async response
      }
      
      case 'CLEAR_MODAL_STATE': {
        console.log('Handling CLEAR_MODAL_STATE request:', message);
        const clearTabId = sender.tab?.id;
        if (clearTabId && tabModalStates.has(clearTabId)) {
          const domainsToClear = tabModalStates.get(clearTabId)!;
          if (message.domain) {
            domainsToClear.delete(message.domain);
            console.log('Cleared modal state for domain:', message.domain, 'in tab:', clearTabId);
          } else {
            domainsToClear.clear();
            console.log('Cleared all modal states for tab:', clearTabId);
          }
        }
        sendResponse({ success: true });
        return true; // Keep message channel open for async response
      }
      
      case 'GET_DOMAIN_TIME_INFO': {
        console.log('Handling GET_DOMAIN_TIME_INFO request:', message.domain);
        storage.get('config').then(config => {
          if (!config?.distractionBlocker?.enabled) {
            sendResponse({ remainingMinutes: 0 });
            return;
          }

          const domain = message.domain;
          const distractingDomain = config.distractionBlocker.domains.find((d: DistractingDomain) => {
            const configuredDomain = d.domain.toLowerCase();
            const requestedDomain = domain.toLowerCase();
            
            // Exact match
            if (configuredDomain === requestedDomain) return true;
            
            // www subdomain match (www.facebook.com matches facebook.com)
            if (requestedDomain.startsWith('www.') && requestedDomain.slice(4) === configuredDomain) return true;
            
            // Subdomain match (facebook.com matches www.facebook.com)
            if (configuredDomain.startsWith('www.') && configuredDomain.slice(4) === requestedDomain) return true;
            
            return false;
          });
          
          if (distractingDomain) {
            const remainingMinutes = Math.max(0, distractingDomain.dailyTimeLimit - distractingDomain.timeUsedToday);
            sendResponse({ remainingMinutes });
          } else {
            sendResponse({ remainingMinutes: 0 });
          }
        }).catch(error => {
          console.error('Error getting domain time info:', error);
          sendResponse({ remainingMinutes: 0 });
        });
        return true; // Keep message channel open for async response
      }
      
      case 'INCREMENT_DISTRACTING_DOMAIN': {
        console.log('Handling INCREMENT_DISTRACTING_DOMAIN request:', message.domain);
        storage.get('config').then(config => {
          if (!config?.distractionBlocker?.enabled) {
            sendResponse({ success: false });
            return;
          }

          // Use the same flexible domain matching
          const distractingDomain = config.distractionBlocker.domains.find((d: DistractingDomain) => {
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
            // Add 1 minute of time used
            distractingDomain.timeUsedToday += 1;
            console.log('Added 1 minute for domain:', message.domain, 'Total time used today:', distractingDomain.timeUsedToday);
            storage.set('config', config).then(() => {
              sendResponse({ success: true });
            });
          } else {
            console.log('Domain not found for increment:', message.domain);
            sendResponse({ success: false });
          }
        });
        return true; // Keep message channel open for async response
      }
      
      case 'UPDATE_YOUTUBE_DISTRACTION_CONFIG':
        console.log('Handling UPDATE_YOUTUBE_DISTRACTION_CONFIG request:', message.config);
        storage.get('config').then(config => {
          if (config) {
            config.youtubeDistraction = { ...config.youtubeDistraction, ...message.config };
            storage.set('config', config).then(() => {
              // Notify all YouTube tabs about the config change
              chrome.tabs.query({ url: '*://*.youtube.com/*' }).then(tabs => {
                tabs.forEach(tab => {
                  if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, {
                      type: 'UPDATE_YOUTUBE_DISTRACTION_CONFIG',
                      config: message.config
                    }).catch(error => {
                      console.error('Error sending YouTube config update to tab:', error);
                    });
                  }
                });
              });
              sendResponse({ success: true });
            });
          } else {
            sendResponse({ error: 'Config not found' });
          }
        });
        break;
      
      case 'VIDEO_FOCUS_STATE_CHANGED':
        console.log('Handling VIDEO_FOCUS_STATE_CHANGED request:', message.state);
        if (sender.tab?.id) {
          videoFocusStates.set(sender.tab.id, message.state);
          console.log('Updated video focus state for tab:', sender.tab.id, message.state);
        }
        sendResponse({ success: true });
        break;
      
      case 'UPDATE_VIDEO_FOCUS_CONFIG':
        console.log('Handling UPDATE_VIDEO_FOCUS_CONFIG request:', message.config);
        storage.get('config').then(config => {
          if (config) {
            config.videoFocus = { ...config.videoFocus, ...message.config };
            storage.set('config', config).then(() => {
              // Notify all tabs about the config change
              chrome.tabs.query({}).then(tabs => {
                tabs.forEach(tab => {
                  if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                    chrome.tabs.sendMessage(tab.id, {
                      type: 'UPDATE_VIDEO_FOCUS_CONFIG',
                      config: message.config
                    }).catch(error => {
                      console.error('Error sending video focus config update to tab:', error);
                    });
                  }
                });
              });
              sendResponse({ success: true });
            });
          } else {
            sendResponse({ error: 'Config not found' });
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