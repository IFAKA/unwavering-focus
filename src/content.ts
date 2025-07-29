import { getSearchUrl } from './utils/urlUtils';

// Distraction Blocker Overlay
class DistractionBlocker {
  private overlay: HTMLDivElement | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Check if current page is a distracting domain
    this.checkDistractingDomain();
  }

  private async checkDistractingDomain() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'CHECK_DISTRACTING_DOMAIN', url: window.location.href });
      if (response && response.shouldBlock) {
        // Redirect to focus page instead of showing overlay
        window.location.href = chrome.runtime.getURL('focus-page.html');
      } else if (response && response.shouldShowOverlay) {
        this.showBlockingOverlay(response.domain, response.remainingVisits);
      }
    } catch (error) {
      console.error('Error checking distracting domain:', error);
    }
  }

  private showBlockingOverlay(domain: string, remainingVisits: number) {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'distraction-blocker-overlay';
    this.overlay.innerHTML = `
      <div class="blocker-content">
        <div class="blocker-header">
          <h1>🚫 Distraction Blocked</h1>
        </div>
        <div class="blocker-body">
          <p>You're trying to visit <strong>${domain}</strong></p>
          <p>You have <strong>${remainingVisits}</strong> visits remaining today.</p>
          <p>Take a moment to reconsider. Is this visit necessary?</p>
        </div>
        <div class="blocker-actions">
          <button class="proceed-btn">Proceed Anyway</button>
          <button class="go-back-btn">Go Back</button>
        </div>
      </div>
    `;

    // Add event listeners
    const proceedBtn = this.overlay.querySelector('.proceed-btn');
    const goBackBtn = this.overlay.querySelector('.go-back-btn');

    proceedBtn?.addEventListener('click', () => {
      this.hideOverlay();
      // Allow the page to load normally
    });

    goBackBtn?.addEventListener('click', () => {
      this.hideOverlay();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    });

    document.body.appendChild(this.overlay);
  }

  private hideOverlay() {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
    }
  }
}

// Smart Search Management Modal
class SmartSearchModal {
  private modal: HTMLDivElement | null = null;
  private input: HTMLInputElement | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.show();
      }
    });
  }

  private createModal(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.className = 'unwavering-focus-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Save Search Query</h3>
            <button class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <input type="text" class="search-input" placeholder="Enter your search query...">
            <div class="modal-actions">
              <button class="save-btn">Save</button>
              <button class="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const saveBtn = modal.querySelector('.save-btn');
    const input = modal.querySelector('.search-input') as HTMLInputElement;

    closeBtn?.addEventListener('click', () => this.hide());
    cancelBtn?.addEventListener('click', () => this.hide());
    saveBtn?.addEventListener('click', () => this.saveSearch());
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.saveSearch();
      } else if (e.key === 'Escape') {
        this.hide();
      }
    });

    this.input = input;
    return modal;
  }

  private show() {
    if (this.modal) {
      document.body.removeChild(this.modal);
    }

    this.modal = this.createModal();
    document.body.appendChild(this.modal);

    // Pre-populate with selected text
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && this.input) {
      this.input.value = selectedText;
      this.input.select();
    }

    // Focus the input
    setTimeout(() => {
      this.input?.focus();
    }, 100);
  }

  private hide() {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
      this.input = null;
    }
  }

  private async saveSearch() {
    if (!this.input?.value.trim()) return;

    const query = this.input.value.trim();
    
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_SEARCH',
        query
      });
      
      this.hide();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }
}

// Initialize components
new DistractionBlocker();
new SmartSearchModal();

// Add styles for the modal and blocker
const style = document.createElement('style');
style.textContent = `
  .unwavering-focus-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 500px;
    animation: modalSlideIn 0.2s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-header {
    padding: 20px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #f3f4f6;
  }

  .modal-body {
    padding: 20px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 16px;
    margin-bottom: 20px;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .save-btn, .cancel-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-btn {
    background-color: #3b82f6;
    color: white;
  }

  .save-btn:hover {
    background-color: #2563eb;
  }

  .cancel-btn {
    background-color: #f3f4f6;
    color: #374151;
  }

  .cancel-btn:hover {
    background-color: #e5e7eb;
  }

  /* Distraction Blocker Styles */
  .distraction-blocker-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .blocker-content {
    background: white;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    animation: blockerSlideIn 0.3s ease-out;
  }

  @keyframes blockerSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .blocker-header h1 {
    color: #ef4444;
    font-size: 28px;
    margin: 0 0 20px 0;
    font-weight: 700;
  }

  .blocker-body {
    margin: 30px 0;
    color: #374151;
    line-height: 1.6;
  }

  .blocker-body p {
    margin: 15px 0;
    font-size: 16px;
  }

  .blocker-body strong {
    color: #1f2937;
    font-weight: 600;
  }

  .blocker-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 30px;
  }

  .proceed-btn, .go-back-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .proceed-btn {
    background: #ef4444;
    color: white;
  }

  .proceed-btn:hover {
    background: #dc2626;
    transform: translateY(-2px);
  }

  .go-back-btn {
    background: #6b7280;
    color: white;
  }

  .go-back-btn:hover {
    background: #4b5563;
    transform: translateY(-2px);
  }
`;

document.head.appendChild(style); 