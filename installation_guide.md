# Installation and Usage Guide

## Installing the Extension

### Chrome/Edge Installation
1. Download and extract the extension files to a folder on your computer.
2. Open Chrome or Edge and navigate to `chrome://extensions` or `edge://extensions`.
3. Enable "Developer mode" using the toggle in the top right corner.
4. Click "Load unpacked" and select the folder containing the extension files.
5. The Study Assistant extension should now appear in your browser toolbar.

### Firefox Installation
1. Download and extract the extension files to a folder on your computer.
2. Open Firefox and navigate to `about:debugging`.
3. Click "This Firefox" in the left sidebar.
4. Click "Load Temporary Add-on" and select the `manifest.json` file in the extension folder.
5. The Study Assistant extension should now appear in your browser toolbar.

## Using the Extension

The extension offers multiple ways to interact with it, all designed to be discreet:

### Method 1: Gesture Recognition
1. Navigate to a page with a question or problem.
2. Press and hold the middle mouse button (scroll wheel).
3. While holding, draw a "Z" shape with your mouse.
4. Release the middle mouse button.
5. The extension will analyze the page content and display the answer.

### Method 2: Clipboard Trigger
1. Navigate to a page with a question or problem.
2. Copy any text that includes the phrase "?analyze" (e.g., copy "What's the answer?analyze").
3. Paste this text anywhere on the page.
4. The extension will analyze the page content and display the answer.

### Method 3: Context Menu
1. Navigate to a page with a question or problem.
2. Select (highlight) the text of the question.
3. Right-click on the selected text.
4. Choose "Analyze Selection" from the context menu.
5. The extension will analyze the selected text and display insights.

## Answer Display Methods

The extension uses various discreet methods to show answers:

1. **Overlay**: A small window appears in the top-right corner of the page.
2. **Tooltip**: A tooltip appears near your mouse cursor.
3. **Console**: The answer is printed to the browser's developer console (press F12 to view).
4. **Notification**: A browser notification shows the answer.
5. **Canvas**: A canvas element appears in the bottom-right corner of the page.

The display method is randomly selected each time to avoid detection patterns.

## Disabling the Extension

To temporarily disable the extension:
1. Click the extension icon in the browser toolbar.
2. The icon will change to indicate the disabled state.
3. Click again to re-enable.

## Troubleshooting

- If the extension doesn't respond to triggers, try refreshing the page.
- If answers aren't displaying, check the browser console (F12) for any error messages.
- Make sure the page has fully loaded before attempting to use the extension.
- Some websites with strict Content Security Policies may interfere with the extension's functionality.
