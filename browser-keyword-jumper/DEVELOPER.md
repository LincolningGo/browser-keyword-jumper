# Developer Documentation

## Architecture Overview

Browser Keyword Jumper is built using Manifest V3 and follows a modular architecture with clear separation of concerns.

### Core Components

1. **Background Service Worker** (`background.js`)
   - Handles omnibox events
   - Manages keyword matching and navigation
   - Coordinates between different components

2. **Configuration Manager** (`config-manager.js`)
   - Handles CRUD operations for keyword configurations
   - Manages data validation and storage
   - Provides import/export functionality

3. **Keyword Matcher** (`keyword-matcher.js`)
   - Implements matching algorithms (exact, fuzzy, prefix)
   - Handles keyword resolution and scoring

4. **Suggestion Engine** (`suggestion-engine.js`)
   - Provides intelligent suggestions for omnibox
   - Formats suggestions for display

5. **Popup Interface** (`popup.html`, `popup.js`, `popup.css`)
   - User interface for configuration management
   - Real-time validation and feedback

## Development Setup

### Prerequisites

- Chrome/Chromium browser (version 88+)
- Basic knowledge of JavaScript, HTML, CSS
- Text editor or IDE

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd browser-keyword-jumper
   ```

2. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `toURL/browser-keyword-jumper` directory

3. Make changes to the code
4. Reload the extension in Chrome extensions page
5. Test your changes

### File Structure

```
toURL/browser-keyword-jumper/
├── manifest.json              # Extension manifest
├── background.js              # Service worker
├── popup.html                 # Popup UI
├── popup.js                   # Popup logic
├── popup.css                  # Popup styles
├── config-manager.js          # Configuration management
├── keyword-matcher.js         # Keyword matching
├── suggestion-engine.js       # Suggestion system
├── models.js                  # Data models
├── icons/                     # Extension icons
├── _locales/                  # Internationalization
└── test-*.js                  # Test files
```

## API Reference

### ConfigManager Class

The ConfigManager handles all configuration-related operations.

#### Methods

```javascript
// Get all keyword configurations
async getConfig(): Promise<KeywordConfig[]>

// Save keyword configurations
async saveConfig(config: KeywordConfig[]): Promise<void>

// Validate configuration data
validateConfig(config: KeywordConfig[]): ValidationResult

// Export configuration as JSON
async exportConfig(): Promise<string>

// Import configuration from JSON
async importConfig(jsonData: string): Promise<KeywordConfig[]>

// Add a new keyword
async addKeyword(keyword: string, url: string, description?: string): Promise<void>

// Update existing keyword
async updateKeyword(id: string, keyword: string, url: string, description?: string): Promise<void>

// Delete keyword by ID
async deleteKeyword(id: string): Promise<void>
```

### KeywordMatcher Class

Handles keyword matching logic with different strategies.

#### Methods

```javascript
// Find exact match for input
exactMatch(input: string, keywords: KeywordConfig[]): KeywordConfig | null

// Find fuzzy matches (sorted by relevance)
fuzzyMatch(input: string, keywords: KeywordConfig[]): KeywordConfig[]

// Find prefix matches
prefixMatch(input: string, keywords: KeywordConfig[]): KeywordConfig[]

// Get best match using combined strategy
getBestMatch(input: string, keywords: KeywordConfig[]): KeywordConfig | null
```

### SuggestionEngine Class

Provides intelligent suggestions for the omnibox.

#### Methods

```javascript
// Get suggestions for input
getSuggestions(input: string, keywords: KeywordConfig[]): Suggestion[]

// Format keyword as suggestion
formatSuggestion(keyword: KeywordConfig): Suggestion

// Calculate relevance score
calculateRelevance(input: string, keyword: string): number
```

## Data Models

### KeywordConfig Interface

```javascript
interface KeywordConfig {
  id: string;           // Unique identifier (UUID)
  keyword: string;      // The keyword trigger
  url: string;         // Target URL
  description?: string; // Optional description
  createdAt: number;   // Creation timestamp
  updatedAt: number;   // Last update timestamp
}
```

### Suggestion Interface

```javascript
interface Suggestion {
  content: string;      // The suggestion text
  description: string;  // Description shown to user
}
```

### ValidationResult Interface

```javascript
interface ValidationResult {
  isValid: boolean;     // Whether validation passed
  errors: string[];     // Array of error messages
}
```

## Testing

### Running Tests

The project includes comprehensive test suites for all major components.

1. **Unit Tests**: Open `test.html` in your browser
2. **Integration Tests**: Use the various `test-*.html` files
3. **Manual Testing**: Use the verification scripts

### Test Files

- `test-models.js` - Data model tests
- `test-config-manager.js` - Configuration management tests
- `test-keyword-matcher.js` - Keyword matching tests
- `test-suggestion-engine.js` - Suggestion engine tests
- `test-background.js` - Background script tests

### Writing Tests

Follow this pattern for new tests:

```javascript
// Test suite for YourComponent
const YourComponentTests = {
  async runTests() {
    console.log('Running YourComponent tests...');
    
    try {
      await this.testBasicFunctionality();
      await this.testEdgeCases();
      await this.testErrorHandling();
      
      console.log('✅ All YourComponent tests passed');
    } catch (error) {
      console.error('❌ YourComponent tests failed:', error);
    }
  },
  
  async testBasicFunctionality() {
    // Test implementation
  }
};
```

## Code Style Guidelines

### JavaScript

- Use ES6+ features (async/await, arrow functions, destructuring)
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Handle errors gracefully with try/catch blocks
- Use const/let instead of var

### HTML

- Use semantic HTML elements
- Include proper ARIA attributes for accessibility
- Use data attributes for JavaScript hooks

### CSS

- Use CSS custom properties for theming
- Follow BEM naming convention for classes
- Use flexbox/grid for layouts
- Ensure responsive design

## Browser Compatibility

### Supported Browsers

- Chrome 88+
- Edge 88+
- Opera 74+
- Firefox 109+ (planned)

### Manifest V3 Features Used

- Service Workers (background scripts)
- Storage API (chrome.storage.sync/local)
- Omnibox API (chrome.omnibox)
- Tabs API (chrome.tabs)
- Notifications API (chrome.notifications)

## Internationalization

### Adding New Languages

1. Create a new directory in `_locales/` (e.g., `_locales/fr/`)
2. Copy `_locales/en/messages.json` to the new directory
3. Translate all message values
4. Test the extension with the new locale

### Message Format

```json
{
  "messageName": {
    "message": "Translated text",
    "description": "Context for translators"
  }
}
```

### Using Messages in Code

```javascript
// In JavaScript
const message = chrome.i18n.getMessage('messageName');

// In HTML
<span data-i18n="messageName"></span>
```

## Performance Considerations

### Storage Optimization

- Use `chrome.storage.sync` for user configurations (limited to 100KB)
- Use `chrome.storage.local` for larger data or caching
- Implement data compression for large configurations

### Memory Management

- Clean up event listeners when not needed
- Use weak references where appropriate
- Avoid memory leaks in long-running background scripts

### Response Time Optimization

- Cache frequently accessed data
- Use debouncing for user input
- Implement lazy loading for large datasets

## Security Best Practices

### Input Validation

- Validate all user inputs on both client and storage sides
- Sanitize URLs to prevent malicious redirects
- Use CSP (Content Security Policy) headers

### Permissions

- Request minimal permissions required
- Use optional permissions when possible
- Document why each permission is needed

### Data Protection

- Never store sensitive data in plain text
- Use HTTPS URLs only
- Implement proper error handling to avoid data leaks

## Debugging

### Chrome DevTools

1. **Background Script**: Go to `chrome://extensions/`, find your extension, click "service worker"
2. **Popup**: Right-click popup → "Inspect"
3. **Storage**: DevTools → Application → Storage → Extensions

### Common Issues

1. **Service Worker Not Starting**: Check for syntax errors in background.js
2. **Storage Not Syncing**: Verify user is signed into Chrome
3. **Omnibox Not Working**: Check manifest.json omnibox configuration
4. **Popup Not Loading**: Check popup.html path in manifest.json

### Logging

Use structured logging for better debugging:

```javascript
console.log('[ConfigManager]', 'Loading configuration...', { timestamp: Date.now() });
console.error('[KeywordMatcher]', 'Match failed:', error, { input, keywords });
```

## Deployment

### Preparing for Release

1. **Code Review**: Ensure all code follows guidelines
2. **Testing**: Run all test suites and manual testing
3. **Version Bump**: Update version in manifest.json
4. **Documentation**: Update README and changelog
5. **Build**: Create distribution package

### Chrome Web Store Submission

1. Create developer account
2. Prepare store listing (description, screenshots, etc.)
3. Upload extension package
4. Submit for review
5. Monitor review status and respond to feedback

### Firefox Add-ons Submission

1. Convert Manifest V3 to V2 (if needed)
2. Test with Firefox
3. Submit to addons.mozilla.org
4. Follow Mozilla's review process

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Update documentation
6. Submit pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact is considered
- [ ] Security implications are reviewed

## Troubleshooting

### Common Development Issues

**Extension not loading:**
- Check manifest.json syntax
- Verify all file paths are correct
- Look for JavaScript errors in console

**Storage not working:**
- Check permissions in manifest.json
- Verify storage API usage
- Test with different data sizes

**Omnibox not responding:**
- Check background script registration
- Verify omnibox keyword in manifest
- Test event listener registration

**Popup not displaying correctly:**
- Check CSS for layout issues
- Verify HTML structure
- Test responsive design

### Getting Help

1. Check this documentation
2. Review existing issues on GitHub
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS
   - Console errors (if any)