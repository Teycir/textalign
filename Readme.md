# TextAlign

A Chrome extension that enhances reading experience by providing customizable text alignment controls for web content.

## Features

- Customizable text alignment (left, center, right, justify)
- Optimal reading width setting (66 characters)
- Dynamic content detection and automatic alignment
- Performance-optimized implementation
- Supports various content types (articles, blog posts, main content areas)

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

After installation:

1. Click the extension icon in your browser toolbar
2. Select your preferred text alignment option
3. Toggle the optimal width setting if desired
4. Changes will be applied immediately to the current page

## Technical Details

The extension uses:
- Chrome Storage API for saving user preferences
- MutationObserver for detecting dynamic content changes
- Performance-optimized stylesheet injection
- Debounced event handling for better performance
- Custom font-face settings for improved vertical alignment

## Development

To modify the extension:

1. Make changes to the source files
2. Refresh the extension in `chrome://extensions/`
3. Reload the target page to see your changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your chosen license here]
