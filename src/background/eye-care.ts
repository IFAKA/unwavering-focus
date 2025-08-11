import StorageService from '../services/storage';

const storage = StorageService.getInstance();

// Handle eye care reminders
export async function setupEyeCareAlarm(): Promise<void> {
  const config = await storage.get('config');
  if (config?.eyeCare.enabled) {
    // Clear existing alarms
    await chrome.alarms.clear('eyeCare20');
    await chrome.alarms.clear('eyeCare20Second');

    // Create the 20-minute alarm
    await chrome.alarms.create('eyeCare20', {
      delayInMinutes: 20,
      periodInMinutes: 20,
    });

    // Store the next alarm time for countdown
    const nextAlarmTime = Date.now() + 20 * 60 * 1000;
    await storage.set('nextEyeCareAlarm', nextAlarmTime);
  }
}

export async function handleEyeCareNotification(): Promise<void> {
  const config = await storage.get('config');
  if (!config?.eyeCare.enabled) return;

  // Get all tabs
  const tabs = await chrome.tabs.query({});

  // Send notification to all tabs
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'SHOW_EYE_CARE_NOTIFICATION',
          message:
            'Time for a 20-second eye break! Look at something 20 feet away.',
        });
      } catch (error) {
        console.log('Could not send eye care notification to tab:', tab.id);
      }
    }
  }

  // Play start sound
  await playEyeCareStartSound();

  // Set up 20-second timer
  setTimeout(async () => {
    await playEyeCareEndSound();
  }, 20000);
}

export async function playEyeCareStartSound(): Promise<void> {
  const config = await storage.get('config');
  if (!config?.eyeCare.enabled) return;

  try {
    // Get all tabs
    const tabs = await chrome.tabs.query({});

    // Send sound play message to all tabs
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'PLAY_EYE_CARE_START_SOUND',
            volume: config.eyeCare.soundVolume || 0.5,
          });
        } catch (error) {
          console.log('Could not send eye care start sound to tab:', tab.id);
        }
      }
    }
  } catch (error) {
    console.error('Error playing eye care start sound:', error);
  }
}

export async function playEyeCareEndSound(): Promise<void> {
  const config = await storage.get('config');
  if (!config?.eyeCare.enabled) return;

  try {
    // Get all tabs
    const tabs = await chrome.tabs.query({});

    // Send sound play message to all tabs
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'PLAY_EYE_CARE_END_SOUND',
            volume: config.eyeCare.soundVolume || 0.5,
          });
        } catch (error) {
          console.log('Could not send eye care end sound to tab:', tab.id);
        }
      }
    }
  } catch (error) {
    console.error('Error playing eye care end sound:', error);
  }
}

export async function resetEyeCareAlarm(): Promise<void> {
  const config = await storage.get('config');
  if (config?.eyeCare.enabled) {
    await setupEyeCareAlarm();
  }
}
