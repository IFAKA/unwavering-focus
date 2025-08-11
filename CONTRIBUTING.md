# Contributing to Unwavering Focus

Thank you for your interest in contributing to Unwavering Focus! We welcome contributions from the community to help make this Chrome extension even better.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Chrome browser for testing

### Development Setup
1. **Fork and clone** the repository
   ```bash
   git clone https://github.com/yourusername/unwavering-focus.git
   cd unwavering-focus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Load extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project

## 🎯 Development Guidelines

### Code Style
- **TypeScript**: Use TypeScript for all new code
- **React**: Follow React best practices and hooks
- **ESLint**: Run `npm run lint` before committing
- **Prettier**: Use `npm run format` for consistent formatting

### Architecture Principles
- **Apple Watch Design**: All UI components must follow Apple Watch design principles
- **Clean Architecture**: Maintain separation of concerns
- **Fast Animations**: Keep animations under 300ms following Emil Kowalski's principles
- **Bulletproof Focus**: Implement comprehensive focus management

### File Structure
```
src/
├── components/          # React components
│   ├── popup/          # Extension popup UI
│   ├── ui/             # Reusable UI components
│   └── metrics/        # Dashboard metrics
├── services/           # Business logic
├── hooks/              # Custom React hooks
├── constants/          # App constants
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

## 🐛 Bug Reports

When reporting bugs, please include:
- **Chrome version** and operating system
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Console errors** (if any)
- **Screenshots** (if applicable)

## 💡 Feature Requests

We welcome feature requests! Please:
- **Describe the problem** you're trying to solve
- **Explain your proposed solution**
- **Consider the impact** on existing features
- **Follow Apple Watch design principles** for UI changes

## 🔧 Pull Request Process

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test thoroughly** in Chrome with the extension loaded

4. **Run linting and formatting**
   ```bash
   npm run lint
   npm run format
   ```

5. **Commit your changes** with clear commit messages
   ```bash
   git commit -m "feat: add new feature description"
   ```

6. **Push to your fork** and create a pull request

7. **Wait for review** and address any feedback

### Commit Message Format
Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests

## 🎨 Design Guidelines

### Apple Watch Design Principles
- **Glanceable**: Information visible in 2-3 seconds
- **Minimal**: 80% content reduction for essential info only
- **Focused**: Single-tap interactions, no nested menus
- **Responsive**: Fast animations under 300ms

### Color Palette
- **Blue**: #007aff (Primary actions)
- **Green**: #34c759 (Success states)
- **Orange**: #ff9500 (Warnings)
- **Red**: #ff3b30 (Errors)
- **Purple**: #5856d6 (Secondary actions)

### Typography
- **Font**: SF Pro Display (system fallback)
- **Sizes**: 10px, 12px, 13px, 14px, 16px, 18px
- **Weights**: Regular, Medium, Bold

## 🧪 Testing

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Popup UI renders correctly
- [ ] Settings page works properly
- [ ] Keyboard shortcuts function
- [ ] Eye care reminders trigger
- [ ] Tab limiter enforces limits
- [ ] Distraction blocker works
- [ ] Smart search captures thoughts

### Automated Testing
Run the test suite (when implemented):
```bash
npm test
```

## 📝 Documentation

When adding new features:
- **Update README.md** with new features
- **Add JSDoc comments** to functions
- **Update type definitions** in `src/types/`
- **Document configuration options**

## 🤝 Community Guidelines

- **Be respectful** and inclusive
- **Help others** learn and contribute
- **Provide constructive feedback**
- **Follow the project's code of conduct**

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and community support
- **Email**: For direct support (support@unwaveringfocus.com)

## 🎉 Recognition

Contributors will be recognized in:
- **README.md** acknowledgments
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to Unwavering Focus! 🎯
