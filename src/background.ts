import { initializeStorage } from './background/init';
import { setupEyeCareAlarm, handleEyeCareNotification } from './background/eye-care';
import { handleTabCreated, handleTabActivated, updateTabCount } from './background/tabs';
import { handleMessage } from './background/messages';

// Initialize the extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Unwavering Focus extension installed');
  await initializeStorage();
  await setupEyeCareAlarm();
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'eyeCare20') {
    await handleEyeCareNotification();
  }
});

// Handle tab events
chrome.tabs.onCreated.addListener(handleTabCreated);
chrome.tabs.onActivated.addListener(handleTabActivated);
chrome.tabs.onRemoved.addListener(() => updateTabCount());

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Handle storage changes
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'local') {
    // Update tab count when tabs change
    if (changes.tabCount) {
      await updateTabCount();
    }
    
    // Reset eye care alarm when config changes
    if (changes.config) {
      await setupEyeCareAlarm();
    }
  }
}); 