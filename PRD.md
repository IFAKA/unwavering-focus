## Product Requirements Document (PRD) / AI Coding Prompt

**Project Title:** Unwavering Focus Chrome Extension

**Version:** 1.0

---

### 1. Introduction

The "Unwavering Focus" Chrome Extension is designed to empower the user to maximize productivity, eliminate digital distractions, and cultivate a disciplined approach to daily activities. It aims to provide immediate, practical steps to overcome uncertainty and fear of distraction, ensuring focused action without paralysis. The core philosophy is to build authority over one's time and attention, fostering a mindset of excellence and continuous improvement, aligned with principles of autonomy and wealth creation (broadly defined as mastery over self and environment).

This document outlines the features, user experience, and technical specifications required for its development, emphasizing maintainable code, clean architecture, and modern web development best practices.

### 2. Goals & Objectives

* To provide a seamless, non-intrusive mechanism for deferring non-urgent searches.
* To effectively block and manage access to distracting websites (social media, news feeds).
* To promote eye health and regular breaks through timely reminders.
* To prevent tab overload and encourage focused Browse.
* To offer a personal performance tracking dashboard that reinforces discipline and long-term goals.
* To ensure the extension is performant, secure, and user-friendly.

### 3. Key Features & User Experience (UX)

#### 3.1. Smart Search Management (SSM)

**Objective:** Prevent "rabbit-holing" by deferring non-urgent searches.

* **Trigger:** User presses the keyboard shortcut `Option+Shift+S`.
* **Action:**
    1.  A small, non-intrusive, floating input modal appears centrally on the current active tab/window.
    2.  If text is selected on the page, this text should pre-populate the input field. The user can edit or type new text.
    3.  Upon pressing `Enter` in the input field:
        * The search query is saved to a persistent list (within Chrome's `chrome.storage.local`).
        * The input modal immediately disappears.
        * **Crucially, no new tab is opened, and no search is performed at this moment.**
* **Accessing Saved Searches:**
    1.  User clicks the extension icon in the Chrome toolbar. This opens the extension's pop-up UI.
    2.  The pop-up UI displays a clear, scrollable list of all saved search queries.
    3.  Each listed query should have:
        * The query text itself.
        * A clickable element (e.g., a "Search" button or the query text itself) that, when clicked, opens a new tab with the search results (default search engine or configurable).
        * A discrete "X" or "Delete" button to remove the query from the list.
    4.  An optional "Search All" button that opens all current queries in separate new tabs (with a confirmation dialog if many).

#### 3.2. Distraction Blocker & Doomscrolling Prevention (DBDP)

**Objective:** Control access to distracting content and homepages while allowing specific content access.

* **Configurable List:** User can define a list of "distracting domains" (e.g., `facebook.com`, `twitter.com`, `youtube.com`, `reddit.com`).
* **Homepage Access Limiter:**
    1.  For each defined distracting domain, the user sets a **maximum number of homepage visits per day** (e.g., 3 for Facebook, 5 for Reddit).
    2.  The extension tracks these visits using `chrome.storage.local`.
    3.  When a user attempts to navigate to a *homepage* URL of a distracting domain (e.g., `https://www.facebook.com/`, `https://www.youtube.com/`), the counter for that domain increments.
    4.  If the counter for a domain reaches its daily limit, any subsequent attempts to access that domain's *homepage* for the rest of the day will immediately **redirect to the "Focus Page"** (see 3.5).
* **Content Exception:** The system *must not* redirect if the URL indicates specific content access (e.g., `https://www.youtube.com/watch?v=XYZ`, `https://www.youtube.com/results?search_query=ABC`, `https://www.reddit.com/r/programming/comments/123/`). This allows direct search, video watching, or sub-content access without triggering the homepage limit or redirection. Implementation should use robust URL pattern matching (e.g., regular expressions) to differentiate homepages from specific content paths.
* **Custom Element Hider (Optional - V2 Consideration):** User can select and hide specific HTML elements on any configured website (e.g., news feeds, suggested videos). This feature might be deferred to a V2 for initial release simplicity.

#### 3.3. "20-20-20" Eye Care Reminder

**Objective:** Promote eye health and short breaks to reduce strain.

* **Timer:** A background timer runs in 20-minute intervals while the user is actively Browse.
* **First Notification:** After 20 minutes, a **subtle, configurable audio cue** plays, and a **small, non-intrusive visual notification** (e.g., a small pop-up in the corner or a temporary change to the extension icon) appears with a message like "Look 20 feet away for 20 seconds."
* **Second Notification:** After an additional 20 seconds, a **second subtle audio cue** plays, indicating the break is over.
* **Configurability:** Users can enable/disable the feature, adjust sound volume, and potentially customize the sound.

#### 3.4. Tab Limiter

**Objective:** Prevent tab overload and encourage focused Browse.

* **Configurable Limit:** User sets a maximum number of active tabs allowed.
* **Alerts:** When the tab count reaches the limit, a visual alert (e.g., a badge on the extension icon, a small pop-up) is displayed.
* **Action on Limit Exceeded:** When a new tab is attempted to be opened *after* the limit is reached, the extension should:
    1.  Prevent the new tab from fully loading.
    2.  Present a prompt to the user:
        * "You've reached your tab limit. Close an existing tab to open a new one."
        * Options: "Close Oldest Tab", "Show All Tabs (and choose)", "Cancel New Tab".
* **Exclusion List (Domain/Subdomain-based):**
    1.  User can specify domains (e.g., `google.com`) or **specific subdomains** (e.g., `mail.google.com`, `docs.google.com`, `reddit.com/r/specific_sub`) whose tabs will **not count** towards the total tab limit. This is critical for work scenarios requiring multiple tabs from a specific service or project.

#### 3.5. Focus Page & Performance Dashboard (FPD)

**Objective:** Redirect distractions, provide motivation, and track key personal performance metrics.

* **Trigger:** This page is displayed when a user is redirected by the DBDP feature. It can also be accessed directly via a button in the extension pop-up.
* **Layout:** A clean, minimalistic full-page HTML page.
* **Core Components:**
    1.  **Main Message Area:** A configurable motivational message (e.g., "Enfócate. Tu tiempo es oro." / "Unwavering Focus. Your time is your wealth.")
    2.  **"Daily Mastery" Performance Dashboard:**
        * **Configurable Habits:** User defines 3-5 "pillar habits" (e.g., "Morning Exercise", "Deep Work (2h)", "Journaling"). These are set in the extension's options page.
        * **Visual Tracking Grid:** For each habit, display a horizontal row of small circles/squares representing the last **30 days** (configurable period).
        * **Color-coded Status:**
            * **Bright Green:** Habit completed with excellence.
            * **Light Green:** Habit completed adequately/well.
            * **Orange:** Habit partially completed or completed with significant effort/struggle.
            * **Red:** Habit not completed.
            * **Gray/Outline:** Future days or unrecorded.
        * **Quick Daily Input:** For the *current day's* habits, display three clear buttons next to each: "Excellent", "Good", "Not Done". Clicking one records the status for that habit for the day, and the buttons for that habit become disabled/disappear until the next day.
        * **Consistency Score:** Next to each habit, show a percentage indicating consistency over the displayed period (e.g., "85% (30 days)").
        * **Overall "Mastery Score":** A prominent number or percentage representing the average consistency across all defined habits for the displayed period.
    3.  **Dynamic Reinforcement Message:** Below the dashboard, a text area that displays a message dynamically generated based on the overall mastery score or consistency trends (e.g., "Your discipline forges your excellence." if high, or "Regain control. Small actions today build momentum." if low). These messages should be user-customizable in the options.
    4.  **Simplified Trend Graphs (Optional):** Small, line graphs (similar to the image provided) for each habit showing the trend over the last 30 days, visually representing "MAKE", "RISE", "KEEP" concepts.

#### 3.6. Extension Pop-up UI

* Accessible by clicking the extension icon.
* Displays the Smart Search Management list (as described in 3.1).
* Provides quick toggles for key features (e.g., enable/disable Distraction Blocker).
* Link to the full "Options" page.
* Link to the "Focus Page".
* Current tab count vs. limit.

#### 3.7. Options Page

* Full configuration for all features:
    * Smart Search Management: Clear all saved searches.
    * Distraction Blocker: Add/remove distracting domains, set daily homepage limits per domain.
    * 20-20-20 Reminder: Enable/disable, sound selection.
    * Tab Limiter: Set max tabs, add/remove domain/subdomain exclusions.
    * Focus Page: Customize motivational messages, define pillar habits, reset daily counters.

### 4. Technical Specifications & Best Practices

* **Technology Stack:**
    * **Manifest V3:** The extension *must* be built using Chrome Extension Manifest V3 for security and future compatibility.
    * **Frontend:** React (preferred for components, state management, and reusability) or Vue.js for the pop-up, options page, and Focus Page.
    * **State Management:** Minimal, context-based state management for React/Vue, or simple `chrome.storage.local` directly for persistent data. Avoid heavy libraries like Redux unless truly necessary for complexity.
    * **Styling:** SCSS/CSS Modules for scoped and maintainable styles. Prioritize clean, minimalistic UI.
    * **Bundler:** Webpack or Vite for efficient bundling and development workflow.
* **Architecture:**
    * **Clean Architecture / Layered Design:**
        * **Presentation Layer (UI):** React/Vue components for pop-up, options, Focus Page.
        * **Application Layer (Services/Use Cases):** Business logic, interaction with Chrome APIs (e.g., `chrome.storage`, `chrome.tabs`, `chrome.alarms`). This layer should be framework-agnostic.
        * **Infrastructure Layer (Chrome API Wrapper):** Abstractions/wrappers around `chrome` APIs to make them testable and replaceable.
    * **Background Script:** Handle `chrome.alarms` for 20-20-20, `chrome.tabs.onUpdated` for DBDP, `chrome.tabs.onCreated`/`onRemoved` for Tab Limiter. Use event-driven programming.
    * **Content Scripts:** Inject UI elements (like the SSM input modal) into active tabs only when needed. Use isolated worlds.
* **Code Quality & Maintainability:**
    * **Functional Programming (where applicable):** Embrace immutable data structures, pure functions, and avoid side effects where possible, especially in logic related to data manipulation and transformations.
    * **Modularity:** Break down code into small, reusable modules.
    * **Clear Naming Conventions:** Intuitive names for variables, functions, components.
    * **Error Handling:** Robust error handling for Chrome API calls and user interactions.
    * **Linting:** ESLint with recommended rules for React/TypeScript/JavaScript.
    * **Formatting:** Prettier for consistent code formatting.
    * **TypeScript (Strongly Recommended):** For improved code clarity, maintainability, and reduced bugs, especially as the codebase grows.
    * **Comments:** Use comments judiciously for complex logic or non-obvious parts.
* **Performance:**
    * **Lightweight:** Minimize resource consumption (CPU, memory).
    * **Efficient Storage:** Use `chrome.storage.local` for persistent data. Avoid `chrome.storage.sync` for large data sets.
    * **Debouncing/Throttling:** For events that fire frequently (e.g., tab updates, resizing).
* **Security:**
    * **CSP (Content Security Policy):** Strict CSP defined in `manifest.json`.
    * **Sanitize User Input:** If any user-generated content is displayed, ensure it's properly sanitized.
    * **Minimize Permissions:** Request only the necessary permissions in `manifest.json` (e.g., `activeTab`, `storage`, `tabs`, `scripting` for content scripts).
* **Testing (Guidance for AI):**
    * Emphasize writing unit tests for core logic (e.g., URL matching, habit tracking logic).
    * Consider basic integration tests for interactions between components and Chrome APIs.

### 5. Development Workflow (Implied for AI)

* Modular development, focusing on one feature at a time.
* Clear separation of concerns for easy debugging and future enhancements.
* Prioritize core functionality first, then refine UI/UX.

### 6. Deliverables

* Complete Chrome Extension source code, ready for packaging.
* `manifest.json` configured for Manifest V3.
* README.md with build instructions, usage, and configuration options.
* (Optional, but good to think about) Basic test suite.