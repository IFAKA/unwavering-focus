export async function sendMessageToTab(
  tabId: number,
  message: unknown
): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tabId, message);
        } catch (retryError) {
          console.error(
            'Failed to send message after content script injection:',
            retryError
          );
        }
      }, 100);
    } catch (injectionError) {
      console.error(
        'Failed to inject content script for tab:',
        tabId,
        injectionError
      );
    }
  }
}
