## Product Requirements Document (PRD) / AI Coding Prompt

**Project Title:** Unwavering Focus Chrome Extension

**Version:** 3.0

---

### 1. Introduction

The "Unwavering Focus" Chrome Extension is designed to empower the user to maximize productivity, eliminate digital distractions, and cultivate a disciplined approach to daily activities. It aims to provide immediate, practical steps to overcome uncertainty and fear of distraction, ensuring focused action without paralysis. The core philosophy is to build authority over one's time and attention, fostering a mindset of excellence and continuous improvement, aligned with principles of autonomy and wealth creation (broadly defined as mastery over self and environment).

**Core Philosophy: "Later" Concept**
The extension implements a "Later" mindset where users can capture thoughts, ideas, and distractions for later review, freeing their mind to focus on current tasks. This is reinforced through immediate confirmation feedback and a trust-based system that assures users their thoughts are safely stored.

This document outlines the features, user experience, and technical specifications required for its development, emphasizing maintainable code, clean architecture, and modern web development best practices.

### 2. Goals & Objectives

* To provide a seamless, non-intrusive mechanism for deferring thoughts and ideas for later review.
* To effectively block and manage access to distracting websites (social media, news feeds).
* To promote eye health and regular breaks through timely reminders.
* To prevent tab overload and encourage focused browsing.
* To offer a personal performance tracking dashboard that reinforces discipline and long-term goals.
* To ensure the extension is performant, secure, and user-friendly.
* To implement Apple Watch design principles across all UI components for optimal glanceability and minimal interaction.
* To provide immediate feedback for all user actions to reinforce the "Later" concept.
* To implement great animations following Emil Kowalski's principles for natural, fast, and accessible motion.
* To provide a bulletproof focus system that eliminates all edge cases and ensures reliable user interaction.

### 3. Key Features & User Experience (UX)

#### 3.1. Thought Capture & "Later" Management (TCLM)

**Objective:** Prevent "rabbit-holing" by deferring thoughts and ideas for later review.

* **Trigger:** User presses the keyboard shortcut `Option+Shift+I`.
* **Action:**
    1.  A small, non-intrusive, floating input modal appears centrally on the current active tab/window with natural spring-like animation.
    2.  If text is selected on the page, this text should pre-populate the input field. The user can edit or type new text.
    3.  **Bulletproof Focus System:** The input field automatically focuses with comprehensive error handling and multiple fallback strategies.
    4.  Upon pressing `Enter` in the input field:
        * The thought/idea is saved to a persistent list (within Chrome's `chrome.storage.local`).
        * A confirmation notification appears: "Saved for later" with the captured text.
        * The input modal immediately disappears with natural exit animation.
        * **Crucially, no new tab is opened, and no search is performed at this moment.**
* **Accessing Saved Items:**
    1.  User clicks the extension icon in the Chrome toolbar. This opens the extension's pop-up UI.
    2.  The pop-up UI displays a clear, scrollable list of all saved thoughts/ideas.
    3.  Each listed item should have:
        * The item text itself (truncated if too long).
        * Action buttons that appear on hover: Search (🔍), Copy (📋), Delete (✕).
        * Hover-activated buttons for clean interface with smooth transitions.
    4.  An optional "Search All" button that opens all current items as searches in separate new tabs.
    5. **Auto-remove behavior:** After performing a search (individual or bulk), the item(s) are automatically removed from the list.
    6. **Configurable Search All:** Users can enable/disable the "Search All" feature from settings.
    7. **Copy feedback:** When copying items, show "Copied!" confirmation with item preview.

#### 3.2. Distraction Blocker & Doomscrolling Prevention (DBDP)

**Objective:** Control access to distracting content and homepages while allowing specific content access.

* **Configurable List:** User can define a list of "distracting domains" (e.g., `facebook.com`, `twitter.com`, `youtube.com`, `reddit.com`).
* **Homepage Access Limiter:**
    1.  For each defined distracting domain, the user sets a **maximum number of homepage visits per day** (e.g., 3 for Facebook, 5 for Reddit).
    2.  The extension tracks these visits using `chrome.storage.local`.
    3.  When a user attempts to navigate to a *homepage* URL of a distracting domain (e.g., `https://www.facebook.com/`, `https://www.youtube.com/`), the counter for that domain increments.
    4.  If the counter for a domain reaches its daily limit, any subsequent attempts to access that domain's *homepage* for the rest of the day will immediately **redirect to the "Focus Page"** (see 3.5).
    5. **Overlay System:** When a user has remaining visits, show a modal overlay with visit count and "Continue/Go Back" options.
* **Content Exception:** The system *must not* redirect if the URL indicates specific content access (e.g., `https://www.youtube.com/watch?v=XYZ`, `https://www.youtube.com/results?search_query=ABC`, `https://www.reddit.com/r/programming/comments/123/`). This allows direct search, video watching, or sub-content access without triggering the homepage limit or redirection. Implementation should use robust URL pattern matching (e.g., regular expressions) to differentiate homepages from specific content paths.
* **Custom Element Hider (Optional - V2 Consideration):** User can select and hide specific HTML elements on any configured website (e.g., news feeds, suggested videos). This feature might be deferred to a V2 for initial release simplicity.

#### 3.3. "20-20-20" Eye Care Reminder

**Objective:** Promote eye health and short breaks to reduce strain.

* **Timer:** A background timer runs in 20-minute intervals while the user is actively browsing.
* **First Notification:** After 20 minutes, a **subtle, configurable audio cue** plays, and a **small, non-intrusive visual notification** (e.g., a small pop-up in the corner or a temporary change to the extension icon) appears with a message like "Look 20 feet away for 20 seconds."
* **Second Notification:** After an additional 20 seconds, a **second subtle audio cue** plays, indicating the break is over.
* **Configurability:** Users can enable/disable the feature, adjust sound volume, and potentially customize the sound.
* **Countdown Display:** Show remaining time in the popup with proper 20-minute and 20-second cycle management.

#### 3.4. Tab Limiter

**Objective:** Prevent tab overload and encourage focused browsing.

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
* **Layout:** A clean, minimalistic full-page HTML page following Apple Watch design principles.
* **Core Components:**
    1.  **Header Metrics:** Display the 3 most important metrics (Mastery Score, Habit Count, Pillar Count) in distinct cards.
    2.  **Two-Column Layout:** Left column for Core Pillars, right column for Today's Habits.
    3.  **Quick Actions:** One primary action (Configure) and two secondary actions (Back, Work).
    4.  **Today's Habits:** A compact, scrollable list with one-tap status updates (Excellent ⭐, Good ✓, Not Done ✕).
    5.  **Status Indicators:** Minimal, glanceable status dots at the bottom.
    6.  **Empty State:** Helpful guidance when no habits or pillars are configured.
* **Habit Tracking:**
    * **Configurable Habits:** User defines 3-5 "pillar habits" (e.g., "Morning Exercise", "Deep Work (2h)", "Journaling"). These are set in the extension's options page.
    * **Visual Status:** For each habit, display current status with color-coded badges (Excellent/Good/Not Done).
    * **Quick Daily Input:** For the *current day's* habits, display three clear buttons: "Excellent" (⭐), "Good" (✓), "Not Done" (✕). Clicking one records the status and the buttons disappear.
    * **Consistency Score:** Show mastery percentage prominently in the header.
* **Dynamic Reinforcement Message:** Below the dashboard, a text area that displays a message dynamically generated based on the overall mastery score or consistency trends (e.g., "Your discipline forges your excellence." if high, or "Regain control. Small actions today build momentum." if low). These messages should be user-customizable in the options.

#### 3.6. Extension Pop-up UI

* Accessible by clicking the extension icon.
* **Apple Watch Design:** Follows all Apple Watch design principles for glanceability.
* **Header Metrics:** Eye care countdown and tab counter in prominent cards.
* **Quick Actions:** Primary action (Search All) and secondary actions (Focus, Settings).
* **Saved Items List:** Compact, scrollable list with hover-activated action buttons.
* **Empty State:** Helpful guidance when no items exist.
* **Status Indicators:** Minimal status dots at the bottom.
* **Feedback Systems:** Copy confirmation and search status feedback.

#### 3.7. Options Page

* Full configuration for all features with auto-save functionality.
* **Apple Watch Design:** Follows all Apple Watch design principles.
* **Tabbed Interface:** Focus, Blocker, Care sections for organized configuration.
* **Header Metrics:** Key metrics displayed in compact cards.
* **Smart Thought Management:** Enable/disable features, configure Search All toggle.
* **Distraction Blocker:** Add/remove distracting domains, set daily homepage limits per domain.
* **20-20-20 Reminder:** Enable/disable, sound selection, test functionality.
* **Tab Limiter:** Set max tabs, add/remove domain/subdomain exclusions.
* **Focus Page:** Customize motivational messages, define pillar habits, reset daily counters.
* **Auto-Save:** All settings changes automatically save without explicit user confirmation.

### 4. Apple Watch Design System

**Core Requirement:** All UI components must follow Apple Watch design principles for optimal glanceability and minimal interaction.

#### 4.1. Core Directives

* **Drastic Content Reduction:** Eliminate approximately 80% of current content, displaying only essential information.
* **Glanceable Design:** Optimize for 2-3 second interactions.
* **Compact Card Layouts:** Utilize card-based elements for all primary content.
* **Minimal Interaction:** Limit user input to simple, one-tap actions. Avoid nested menus or complex workflows.
* **Metric Prioritization:** Focus on the 2-3 most critical metrics, ensuring they are immediately visible.
* **Clear Visual Hierarchy:** Implement a prominent primary action with supporting secondary actions.

#### 4.2. Design System Requirements

**Theming:**
* Dark theme as default, with full support for a light theme.
* CSS custom properties for consistent theming across all components.

**Geometry:**
* Rounded Corners: Apply a 12px border-radius consistently.
* Compact Spacing: Adhere to a strict spacing scale (4px, 8px, 12px, 16px, 20px).

**Typography:**
* Utilize the SF Pro Display font family exclusively.
* Font sizes: 10px, 12px, 13px, 14px, 16px, 18px for hierarchy.

**Color Palette:**
* Employ standard iOS-style colors:
  * Blue: #007aff
  * Green: #34c759
  * Orange: #ff9500
  * Red: #ff3b30
  * Purple: #5856d6

**Animations:**
* Use minimal animations and transitions, prioritizing responsiveness.
* Hover effects and subtle transforms for feedback.

#### 4.3. Layout Structure

**Header:**
* Display the 2-3 most important metrics within distinct cards.
* Metric cards with icons, values, and labels.

**Quick Actions:**
* Feature one primary action and two secondary actions, clearly identifiable.
* Consistent button styling with hover effects.

**Content:**
* A compact, scrollable list, limited to a maximum of 3-5 high-priority items.
* "+X more" indicators for longer lists.

**Footer:**
* Include minimal, glanceable status indicators.
* Status dots with tooltips for feature status.

#### 4.4. Interaction Principles

**Single-Tap Engagement:**
* All actions must be completable with a single tap.
* No nested menus or complex workflows.

**Immediate Feedback:**
* Provide instant visual feedback for every user action.
* Hover effects and status changes.
* Confirmation messages for critical actions.

**Auto-Save:**
* All settings changes must be automatically saved without explicit user confirmation.
* No save buttons required.

#### 4.5. Information Architecture Guidelines

**Priority by Frequency:**
* Information and actions should be prioritized based on user frequency of use.
* Most common actions should be most prominent.

**At-a-Glance Status:**
* Display counts and status indicators for immediate comprehension.
* Color-coded badges and status dots.

**Iconography & Color:**
* Utilize clear icons and color coding for rapid recognition.
* Consistent icon usage across all components.

**Text Truncation:**
* Implement ellipsis for any long text content to maintain conciseness.
* Tooltips for full text on hover.

#### 4.6. Feedback Systems

**Confirmation Feedback:**
* "Saved for later" notification when capturing thoughts.
* "Copied!" confirmation when copying items.
* Search status feedback ("Searching..." → "Completed").
* Settings auto-save feedback.

**Visual Feedback:**
* Hover states for all interactive elements.
* Loading states for async operations.
* Status indicators for feature states.

### 5. Animation System & Emil Kowalski's Principles

**Core Requirement:** All animations must follow Emil Kowalski's principles for great animations, ensuring natural, fast, and accessible motion.

#### 5.1. Animation Principles

**Fast Animations:**
* All animations under 300ms for snappy, responsive feel.
* Quick open: 180ms for immediate response.
* Quick close: 200ms for natural exit.
* Confirmation animations: 100-150ms for fast feedback.

**Natural Motion:**
* Use spring-like easing curves for organic, natural movement.
* Primary easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for spring-like feel.
* Secondary easing: `cubic-bezier(0.0, 0.0, 0.2, 1)` for ease-out interactions.
* Custom easing curves for specific interactions.

**Purposeful Animations:**
* Only animate state changes and transitions that enhance user understanding.
* Focus on meaningful interactions rather than decorative motion.
* Use animations to guide user attention and provide feedback.

**Accessibility:**
* Respect `prefers-reduced-motion` media query for users who prefer minimal animations.
* Provide instant alternatives for users with motion sensitivity.
* Ensure animations don't interfere with screen readers or assistive technologies.

**Interruptible:**
* Animations can be interrupted and smoothly transition to new states.
* Use CSS transitions for interruptible animations.
* Implement proper cleanup for interrupted animations.

**Hardware Accelerated:**
* Use only `transform` and `opacity` properties for optimal performance.
* Avoid animating layout properties (width, height, padding, margin).
* Leverage GPU acceleration for smooth 60fps animations.

#### 5.2. Bulletproof Focus System

**Core Requirement:** Implement a comprehensive focus system that eliminates all edge cases and ensures reliable user interaction.

**Focus Management:**
* **Multiple Focus Strategies:** Implement 4 different focus strategies that are tried in sequence.
* **Comprehensive Readiness Checks:** DOM containment, visibility, dimensions, CSS visibility.
* **Race Condition Prevention:** Prevent multiple simultaneous focus attempts.
* **Input Recreation:** Automatically recreate input elements if missing.
* **Focus Verification:** Verify that focus was actually successful before proceeding.

**Timing Strategies:**
* **First 10 attempts:** `requestAnimationFrame` for immediate response.
* **Next 10 attempts:** Short timeouts (150ms) for persistence.
* **Final 5 attempts:** Longer timeouts (300ms) for edge cases.
* **Maximum attempts:** 25 attempts for maximum reliability.

**Error Handling:**
* **Comprehensive try-catch blocks** around all focus operations.
* **Multiple fallback methods** for different scenarios.
* **Graceful degradation** when focus fails.
* **User feedback** for focus failures.

#### 5.3. Animation Implementation Details

**Modal Animations:**
* **Entrance:** Spring-like scale and translate with natural motion.
* **Exit:** Smooth fade with ease-in timing.
* **Focus:** Immediate focus with multiple fallback strategies.

**Interactive Elements:**
* **Hover effects:** Subtle scale and translate transforms.
* **Selection feedback:** Smooth transitions with spring-like easing.
* **Button interactions:** Quick, responsive feedback.

**State Transitions:**
* **Loading states:** Smooth opacity transitions.
* **Error states:** Immediate feedback with clear messaging.
* **Success states:** Quick confirmation with natural motion.

**Performance Optimization:**
* **Hardware acceleration:** Use `transform3d` for GPU acceleration.
* **Debouncing:** Prevent animation conflicts and performance issues.
* **Cleanup:** Proper cleanup of animation frames and timeouts.

### 6. Technical Specifications & Best Practices

* **Technology Stack:**
    * **Manifest V3:** The extension *must* be built using Chrome Extension Manifest V3 for security and future compatibility.
    * **Frontend:** React (preferred for components, state management, and reusability) or Vue.js for the pop-up, options page, and Focus Page.
    * **State Management:** Minimal, context-based state management for React/Vue, or simple `chrome.storage.local` directly for persistent data. Avoid heavy libraries like Redux unless truly necessary for complexity.
    * **Styling:** SCSS/CSS Modules for scoped and maintainable styles. Prioritize clean, minimalistic UI following Apple Watch design principles.
    * **Bundler:** Webpack or Vite for efficient bundling and development workflow.
* **Architecture:**
    * **Clean Architecture / Layered Design:**
        * **Presentation Layer (UI):** React/Vue components for pop-up, options, Focus Page following Apple Watch design principles.
        * **Application Layer (Services/Use Cases):** Business logic, interaction with Chrome APIs (e.g., `chrome.storage`, `chrome.tabs`, `chrome.alarms`). This layer should be framework-agnostic.
        * **Infrastructure Layer (Chrome API Wrapper):** Abstractions/wrappers around `chrome` APIs to make them testable and replaceable.
    * **Background Script:** Handle `chrome.alarms` for 20-20-20, `chrome.tabs.onUpdated` for DBDP, `chrome.tabs.onCreated`/`onRemoved` for Tab Limiter. Use event-driven programming.
    * **Content Scripts:** Inject UI elements (like the TCLM input modal) into active tabs only when needed. Use isolated worlds.
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
    * **Hardware Acceleration:** Use `transform` and `opacity` for animations to leverage GPU acceleration.
* **Security:**
    * **CSP (Content Security Policy):** Strict CSP defined in `manifest.json`.
    * **Sanitize User Input:** If any user-generated content is displayed, ensure it's properly sanitized.
    * **Minimize Permissions:** Request only the necessary permissions in `manifest.json` (e.g., `activeTab`, `storage`, `tabs`, `scripting`).
* **Testing (Guidance for AI):**
    * Emphasize writing unit tests for core logic (e.g., URL matching, habit tracking logic).
    * Consider basic integration tests for interactions between components and Chrome APIs.

### 7. Development Workflow (Implied for AI)

* Modular development, focusing on one feature at a time.
* Clear separation of concerns for easy debugging and future enhancements.
* Prioritize core functionality first, then refine UI/UX following Apple Watch design principles.
* All UI components must adhere to the Apple Watch design system from initial development.
* Implement feedback systems early to reinforce user trust in the "Later" concept.
* All animations must follow Emil Kowalski's principles for great animations.
* Implement the bulletproof focus system early to ensure reliable user interaction.

### 8. Deliverables

* Complete Chrome Extension source code, ready for packaging.
* `manifest.json` configured for Manifest V3.
* README.md with build instructions, usage, and configuration options.
* All UI components following Apple Watch design principles for optimal glanceability.
* Comprehensive feedback systems for user actions.
* **Animation System:** Fast, natural, and accessible animations following Emil Kowalski's principles.
* **Bulletproof Focus System:** Comprehensive focus management with multiple fallback strategies.
* (Optional, but good to think about) Basic test suite.