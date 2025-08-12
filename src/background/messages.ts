import StorageService from '../services/storage';
import { sendMessageToTab } from './tabs';

const storage = StorageService.getInstance();

export async function handleMessage(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
): Promise<void> {
  try {
    switch (message.type) {
      case 'GET_CONFIG':
      case 'GET_STORAGE_DATA':
        const config = await storage.get('config');
        const storageTabCount = await storage.get('tabCount') || 0;
        const savedSearches = await storage.get('savedSearches') || [];
        const distractingDomains = await storage.get('distractingDomains') || [];
        sendResponse({ 
          success: true, 
          config,
          tabCount: storageTabCount,
          savedSearches,
          distractingDomains
        });
        break;

      case 'UPDATE_CONFIG':
        await storage.set('config', message.config);
        sendResponse({ success: true });
        break;

      case 'GET_SAVED_SEARCHES':
        const searches = (await storage.get('savedSearches')) || [];
        sendResponse({ success: true, data: searches });
        break;

      case 'SAVE_SEARCH':
        const existingSearches = (await storage.get('savedSearches')) || [];
        const newSearch = {
          id: Date.now().toString(),
          query: message.query,
          timestamp: Date.now(),
        };
        const updatedSearches = [newSearch, ...existingSearches.slice(0, 9)]; // Keep only 10 searches
        await storage.set('savedSearches', updatedSearches);
        sendResponse({ success: true, data: newSearch });
        break;

      case 'DELETE_SEARCH':
        const currentSearches = (await storage.get('savedSearches')) || [];
        const filteredSearches = currentSearches.filter(
          (s: any) => s.id !== message.id
        );
        await storage.set('savedSearches', filteredSearches);
        sendResponse({ success: true });
        break;

      case 'GET_DISTRACTING_DOMAINS':
        const domains = (await storage.get('distractingDomains')) || [];
        sendResponse({ success: true, data: domains });
        break;

      case 'ADD_DISTRACTING_DOMAINS':
        const currentDomains = (await storage.get('distractingDomains')) || [];
        const newDomain = {
          id: Date.now().toString(),
          domain: message.domain,
          timestamp: Date.now(),
        };
        const updatedDomains = [newDomain, ...currentDomains];
        await storage.set('distractingDomains', updatedDomains);
        sendResponse({ success: true, data: newDomain });
        break;

      case 'REMOVE_DISTRACTING_DOMAIN':
        const existingDomains = (await storage.get('distractingDomains')) || [];
        const filteredDomains = existingDomains.filter(
          (d: any) => d.id !== message.id
        );
        await storage.set('distractingDomains', filteredDomains);
        sendResponse({ success: true });
        break;

      case 'GET_TAB_COUNT':
        const currentTabCount = (await storage.get('tabCount')) || 0;
        sendResponse({ success: true, data: currentTabCount });
        break;

      case 'RESET_EYE_CARE_ALARM':
        const { resetEyeCareAlarm } = await import('./eye-care');
        await resetEyeCareAlarm();
        sendResponse({ success: true });
        break;

      case 'SEND_MESSAGE_TO_TAB':
        if (message.tabId) {
          await sendMessageToTab(message.tabId, message.tabMessage);
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'No tab ID provided' });
        }
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}
