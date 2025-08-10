# Unwavering Focus Chrome Extension

A Chrome extension designed to maximize productivity, eliminate digital distractions, and cultivate disciplined focus. Built with React, TypeScript, and Chrome Extension Manifest V3.

## Features

### ✅ **Smart Search Management**
- Press `Alt+Shift+I` to save search queries for later
- Access saved searches from the extension popup
- Perform searches or delete them as needed

### ✅ **Distraction Blocker**
- Block access to distracting websites after reaching daily limits
- Configure domains and daily limits in options
- **Enabled by default**

### ✅ **YouTube Distraction Blocking**
- Automatically hides distracting elements on YouTube pages
- Removes recommended videos, comments, and engagement buttons
- Works on video pages and search results
- **Enabled by default**

### ✅ **Eye Care Reminder (20-20-20)**
- Get reminded every 20 minutes to look 20 feet away for 20 seconds
- **Corrected sound order**: Start sound (low-to-high) for 20-minute reminder, end sound (high-to-low) for 20-second reminder
- Configurable sound volume
- **Enabled by default**

### ✅ **Tab Limiter**
- Limit the number of open tabs (default: 3)
- Configure excluded domains that don't count toward the limit
- **Toggleable feature** - can be enabled/disabled
- **Enabled by default**

### ✅ **Video Focus Mode**
- Automatically detects when videos are playing on supported platforms
- Prevents tab switching while videos are playing (optional)
- Shows a focus indicator when video is active
- Supports YouTube, Netflix, Vimeo, Twitch, Facebook, Instagram, TikTok
- **Excludes YouTube Music** (music.youtube.com) - designed for audio listening, not video watching
- Works with any HTML5 video elements
- **Enabled by default**

### ✅ **Focus Page & Performance Dashboard**
- Track daily habits and consistency
- View mastery scores and reinforcement messages
- Access via popup or when redirected from blocked sites

### ✅ **Options Page**
- Full configuration for all features
- Customize motivational messages
- Set up pillar habits for tracking

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Build Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unwavering-focus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project

## Usage

### Basic Usage

1. **Extension Popup**: Click the extension icon in the toolbar to access:
   - Saved searches
   - Quick actions (Focus Page, Options)
   - Status overview

2. **Smart Search**: 
   - Press `Alt+Shift+I` on any webpage
   - Enter or edit your search query
   - Access saved searches from the popup

3. **Options**: 
   - Click "Options" in the popup or go to extension settings
   - Configure all features and settings

4. **Focus Page**: 
   - Click "Focus Page" in the popup
   - Track your daily habits and view performance

### Default Settings

- **Distraction Blocker**: Enabled
- **Eye Care**: Enabled (20-minute intervals)
- **Tab Limiter**: 3 tabs maximum
- **Smart Search**: Enabled

## Development

### Project Structure
```
src/
├── background.ts          # Service worker (background script)
├── content.ts            # Content script for Smart Search & YouTube blocking
├── popup.tsx            # Extension popup UI
├── options.tsx          # Options page UI
├── focus-page.tsx       # Focus page UI
├── services/
│   └── storage.ts       # Chrome storage abstraction
├── utils/
│   ├── urlUtils.ts      # URL parsing and domain utilities
│   ├── habitUtils.ts    # Habit tracking utilities
│   └── youtubeUtils.ts  # YouTube distraction blocking utilities
├── types/
│   └── index.ts         # TypeScript type definitions
└── assets/
    └── icon.svg         # Extension icon
```

### Available Scripts

- `npm run build` - Build the extension for production
- `npm run dev` - Build in development mode with watch
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: SCSS with CSS Modules
- **Bundler**: Webpack 5
- **Chrome APIs**: Manifest V3
- **Storage**: chrome.storage.local

## Troubleshooting

### Common Issues

1. **Extension not loading**: 
   - Ensure you're loading the `dist` folder, not the root project
   - Check that "Developer mode" is enabled in Chrome extensions

2. **Features not working**:
   - Reload the extension after making changes
   - Check the browser console for error messages
   - Ensure all permissions are granted

3. **Build errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check that Node.js version is 14 or higher

### Debug Mode

The extension includes comprehensive console logging for debugging:
- Background script logs all message handling
- React components log data loading and errors
- YouTube distraction blocker logs element detection and hiding
- Check browser console for detailed information

### YouTube Distraction Blocking Technical Details

The YouTube distraction blocking uses a multi-layered approach:

1. **Direct ID targeting**: `document.getElementById('secondary')`
2. **Class/ID pattern matching**: Elements with classes/IDs containing "secondary", "related", "recommendations"
3. **YouTube-specific selectors**: 
   - `ytd-watch-next-secondary-results-renderer`
   - `#secondary #contents`
   - `#secondary ytd-watch-next-secondary-results-renderer`
4. **Dynamic monitoring**: MutationObserver continuously watches for new elements
5. **Periodic checks**: Additional checks every 2 seconds for robustness

## Current Status

✅ **Core Features Working**:
- Extension loads and displays UI correctly
- Popup, Options, and Focus pages render without errors
- Default configuration applied (Distraction Blocker: Enabled, Eye Care: Enabled, Tab Limiter: 3)
- Message passing between components functional
- **Alt+Shift+I opens modal on current page** (not popup)
- **Tab counting and limiting working correctly**
- **Configuration saving working**
- **Eye Care test button with working sound**
- **Distraction blocker with full-screen overlay**
- **Stoic quotes API integration**
- **YouTube distraction blocking with multi-layered detection**
- **Corrected eye care sound order**

## ✅ **Features Implemented**

✅ **Smart Search Management**:
- Alt+Shift+I shortcut opens a **clean, centered input modal** (like the image)
- Pre-populates with selected text if any
- Saves searches to persistent storage
- Displays saved searches in popup
- **Smart URL handling**: If saved item is a URL, clicking search navigates directly to the URL
- **Clean URL display**: URLs show without protocol (https://), www subdomain, and trailing slashes
- **Regular search**: Non-URL items perform Google search as before
- **Hover interactions**: Search actions appear on hover with smooth animations
- **Modal animations**: Smooth fade in/out animations with immediate response to Enter key
- **Synchronized feedback**: "Saved for later" confirmation appears immediately when modal closes
- **Scrollable list**: Saved items list scrolls when there are many items
- **Golden ratio design**: Popup uses golden ratio proportions (300px × 485px) for optimal aesthetics
- **Reverse chronological order**: Newest items appear at the top of the list
- Click to perform searches or delete them

✅ **Distraction Blocker**:
- Configurable distracting domains with daily visit limits
- **Redirects to Focus Page when limit exceeded**
- Shows overlay with remaining visits
- Allows specific content access (not just homepages)

✅ **YouTube Distraction Blocking**:
- Automatically detects YouTube pages and hides distracting elements
- **Video pages**: Hides secondary content (recommended videos sidebar), comments, like/dislike buttons, download/clip buttons
- **Search pages**: Hides grid shelves and mini guide elements
- **Multi-layered detection**: Uses multiple selectors to ensure comprehensive element hiding
- **Dynamic content**: Continuously monitors for new distracting elements with MutationObserver
- **Debug logging**: Console logs to track element detection and hiding
- **Configurable**: Each element type can be enabled/disabled in options

✅ **Video Focus Mode**:
- Automatically detects video playback on supported platforms
- **Prevents tab switching** while videos are playing (configurable)
- **Shows clean focus indicator** with smooth slide animation when video is active
- **Supports multiple platforms**: YouTube, Netflix, Vimeo, Twitch, Facebook, Instagram, TikTok
- **Excludes YouTube Music** (music.youtube.com) - designed for audio listening, not video watching
- **Works with any HTML5 video elements** on any website
- **Real-time state tracking** with background script communication
- **Configurable settings**: Enable/disable, prevent tab switching, show indicator, auto-detect videos
- **Visual feedback**: Notification when tab switching is blocked

✅ **Eye Care Reminder (20-20-20)**:
- **Visual countdown timer in popup** showing time until next reminder
- **Corrected sound order**: Start sound (low-to-high) for 20-minute reminder, end sound (high-to-low) for 20-second reminder
- **Uses macOS system beep sound** for notifications
- **Simple beep-only approach** - no visual notifications or alerts
- 20-minute intervals with 20-second follow-up beep
- Configurable volume and enable/disable
- **Test button in options page** (now working properly)

✅ **Tab Limiter**:
- Correctly counts non-excluded tabs
- Enforces tab limit (default: 3)
- **Closes newly created tab when limit is reached (not exceeded)**
- Updates tab count in popup
- **Toggleable feature** - can be enabled/disabled in settings

✅ **Focus Page**:
- Clean, motivational interface
- **Random Stoic quotes from API**
- Habit tracking with visual grid
- Performance dashboard with consistency scores

✅ **Extension Popup**:
- **Real-time eye care countdown timer**
- Tab counter with current/limit display
- Saved searches list with click-to-search
- Feature status indicators
- Quick access to Focus Page and Options

🔄 **In Development**:
- Advanced distraction blocking with domain-specific limits
- Real-time habit tracking updates
- Enhanced UI animations and transitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Note**: This extension is designed to be simple and functional. The current implementation focuses on core functionality with a clean, minimal UI. Advanced features and complex state management can be added incrementally as needed. 