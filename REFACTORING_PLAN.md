# 🔧 Refactoring Plan - Unwavering Focus

## 🚨 Critical Files Requiring Immediate Refactoring

### 1. `src/content.ts` (2647 lines → 2347 over limit)
**CRITICAL PRIORITY** - This is the largest file and needs immediate attention.

#### Proposed Structure:
```
src/content/
├── index.ts                    # Main entry point (50 lines)
├── modal/
│   ├── modal-manager.ts        # Modal creation and management (200 lines)
│   ├── modal-focus.ts          # Focus management system (150 lines)
│   ├── modal-animations.ts     # Animation logic (100 lines)
│   └── modal-types.ts          # Modal-related types (50 lines)
├── actions/
│   ├── action-executor.ts      # Action execution logic (150 lines)
│   ├── breathing-exercise.ts   # Box breathing functionality (200 lines)
│   ├── timer-manager.ts        # Timer functionality (150 lines)
│   └── thought-manager.ts      # Thought saving functionality (100 lines)
├── ui/
│   ├── pinned-task.ts          # Pinned task UI (150 lines)
│   ├── countdown-timer.ts      # Countdown timer UI (150 lines)
│   └── confirmation.ts         # Confirmation dialogs (100 lines)
├── audio/
│   ├── audio-manager.ts        # Audio playback logic (100 lines)
│   └── audio-fallbacks.ts      # Audio fallback methods (100 lines)
└── utils/
    ├── container-manager.ts    # Top-right container management (100 lines)
    └── scroll-handlers.ts      # Scroll event handlers (100 lines)
```

### 2. `src/utils/urlUtils.ts` (1200 lines → 900 over limit)
**HIGH PRIORITY** - Large utility file needs organization.

#### Proposed Structure:
```
src/utils/url/
├── index.ts                    # Main exports (50 lines)
├── domain-utils.ts             # Domain parsing and validation (200 lines)
├── url-parser.ts               # URL parsing utilities (200 lines)
├── redirect-handler.ts         # Redirect logic (200 lines)
├── storage-utils.ts            # URL-related storage (150 lines)
└── url-types.ts                # URL-related types (100 lines)
```

### 3. `src/background.ts` (1096 lines → 796 over limit)
**HIGH PRIORITY** - Background script needs modularization.

#### Proposed Structure:
```
src/background/
├── index.ts                    # Main entry point (50 lines)
├── services/
│   ├── storage-service.ts      # Storage management (200 lines)
│   ├── notification-service.ts # Notification handling (150 lines)
│   └── timer-service.ts        # Timer management (150 lines)
├── handlers/
│   ├── message-handler.ts      # Message routing (200 lines)
│   ├── tab-handler.ts          # Tab management (150 lines)
│   └── alarm-handler.ts        # Alarm handling (100 lines)
└── utils/
    ├── background-utils.ts     # Background utilities (100 lines)
    └── background-types.ts     # Background types (50 lines)
```

### 4. `src/utils/youtubeUtils.ts` (400 lines → 100 over limit)
**MEDIUM PRIORITY** - YouTube utilities need organization.

#### Proposed Structure:
```
src/utils/youtube/
├── index.ts                    # Main exports (50 lines)
├── youtube-blocker.ts          # YouTube blocking logic (150 lines)
├── youtube-detection.ts        # YouTube page detection (100 lines)
└── youtube-types.ts            # YouTube-related types (50 lines)
```

### 5. `src/components/popup/PopupMain.tsx` (329 lines → 29 over limit)
**MEDIUM PRIORITY** - Component needs extraction.

#### Proposed Structure:
```
src/components/popup/
├── PopupMain.tsx               # Main component (150 lines)
├── components/
│   ├── MetricsSection.tsx      # Metrics display (100 lines)
│   └── QuickActions.tsx        # Quick action buttons (100 lines)
└── hooks/
    └── usePopupData.ts         # Popup data management (50 lines)
```

### 6. `src/components/search/SearchItem.tsx` (328 lines → 28 over limit)
**MEDIUM PRIORITY** - Search component needs extraction.

#### Proposed Structure:
```
src/components/search/
├── SearchItem.tsx              # Main component (150 lines)
├── components/
│   ├── SearchItemActions.tsx   # Action buttons (100 lines)
│   └── SearchItemContent.tsx   # Content display (100 lines)
└── hooks/
    └── useSearchItem.ts        # Search item logic (50 lines)
```

## 🛠️ Refactoring Process

### Phase 1: Critical Files (Week 1)
1. **Refactor `src/content.ts`** - Break into modular structure
2. **Refactor `src/utils/urlUtils.ts`** - Organize URL utilities
3. **Refactor `src/background.ts`** - Modularize background script

### Phase 2: Medium Priority Files (Week 2)
1. **Refactor `src/utils/youtubeUtils.ts`** - Organize YouTube utilities
2. **Refactor `src/components/popup/PopupMain.tsx`** - Extract components
3. **Refactor `src/components/search/SearchItem.tsx`** - Extract components

### Phase 3: Testing and Validation (Week 3)
1. **Update imports** across the codebase
2. **Write tests** for new modules
3. **Validate functionality** - ensure no regressions
4. **Update documentation** - reflect new structure

## 📋 Refactoring Guidelines

### 1. Single Responsibility Principle
- Each file should have one clear purpose
- Functions should be focused and cohesive
- Avoid mixing concerns in single files

### 2. Dependency Management
- Use barrel exports (index.ts) for clean imports
- Avoid circular dependencies
- Keep dependencies minimal and focused

### 3. Type Safety
- Maintain strict TypeScript typing
- Create dedicated type files for complex types
- Use interfaces over types for object shapes

### 4. Testing Strategy
- Write unit tests for extracted functions
- Ensure test coverage for critical paths
- Validate integration between modules

### 5. Documentation
- Update JSDoc comments for all functions
- Document complex algorithms
- Maintain clear API documentation

## 🎯 Success Criteria

### Before Refactoring
- 6 files exceed 300 lines
- Total excess: 4200 lines
- Average excess: 700 lines per file

### After Refactoring
- 0 files exceed 300 lines
- All files under 300 lines
- Maintained functionality
- Improved maintainability

## 🚀 Implementation Steps

### Step 1: Create New Directory Structure
```bash
# Create new directories
mkdir -p src/content/{modal,actions,ui,audio,utils}
mkdir -p src/utils/url
mkdir -p src/background/{services,handlers,utils}
mkdir -p src/utils/youtube
mkdir -p src/components/popup/{components,hooks}
mkdir -p src/components/search/{components,hooks}
```

### Step 2: Extract Functions
- Identify related functions in large files
- Move them to appropriate new files
- Update imports and exports
- Maintain type safety

### Step 3: Update Imports
- Update all import statements across the codebase
- Use barrel exports for clean imports
- Verify no circular dependencies

### Step 4: Test and Validate
- Run the application
- Test all functionality
- Verify no regressions
- Update tests as needed

### Step 5: Documentation
- Update README.md
- Update inline documentation
- Create migration guide if needed

## 🔍 Quality Assurance

### Automated Checks
- Run `npm run check-size` after each refactoring
- Ensure all files are under 300 lines
- Run `npm run lint` to check code quality
- Run `npm run format` for consistent formatting

### Manual Validation
- Test all user workflows
- Verify extension functionality
- Check for performance regressions
- Validate accessibility features

## 📊 Progress Tracking

### Week 1 Goals
- [ ] Refactor `src/content.ts` (2647 → <300 lines)
- [ ] Refactor `src/utils/urlUtils.ts` (1200 → <300 lines)
- [ ] Refactor `src/background.ts` (1096 → <300 lines)

### Week 2 Goals
- [ ] Refactor `src/utils/youtubeUtils.ts` (400 → <300 lines)
- [ ] Refactor `src/components/popup/PopupMain.tsx` (329 → <300 lines)
- [ ] Refactor `src/components/search/SearchItem.tsx` (328 → <300 lines)

### Week 3 Goals
- [ ] Update all imports across codebase
- [ ] Write comprehensive tests
- [ ] Validate all functionality
- [ ] Update documentation

## 🎉 Expected Benefits

### Code Quality
- Improved maintainability
- Better testability
- Easier debugging
- Reduced cognitive load

### Development Speed
- Faster feature development
- Easier code reviews
- Better collaboration
- Reduced merge conflicts

### Long-term Sustainability
- Easier onboarding for new developers
- Better code organization
- Reduced technical debt
- Improved scalability

---

**Remember**: The 300-line limit is absolute. Every file must be under this limit before new features can be added. This refactoring is critical for the long-term health of the codebase.
