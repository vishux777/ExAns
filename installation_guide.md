# Installation and Usage Guide

## Installing the Extension

### Chrome/Edge Installation
1. Download and extract the extension files to a folder on your computer.
2. Open Chrome or Edge and navigate to `chrome://extensions` or `edge://extensions`.
3. Enable "Developer mode" using the toggle in the top right corner.
4. Click "Load unpacked" and select the folder containing the extension files.
5. The Chrome Background Theme extension should now be installed.

### Firefox Installation
1. Download and extract the extension files to a folder on your computer.
2. Open Firefox and navigate to `about:debugging`.
3. Click "This Firefox" in the left sidebar.
4. Click "Load Temporary Add-on" and select the `manifest.json` file in the extension folder.
5. The Chrome Background Theme extension should now be installed.

## Using the Extension

The extension offers a discreet way to interact with it:

### Method: Double-Click Trigger
1. Navigate to a page with a question or problem.
2. Double-click anywhere on the page with the left mouse button.
3. The extension will analyze the page content and display the answer.

## Answer Display Methods

The extension uses various discreet methods to show answers:

1. **Overlay**: A small window appears in the top-right corner of the page.
2. **Tooltip**: A tooltip appears near your mouse cursor.
3. **Console**: The answer is printed to the browser's developer console (press F12 to view).
4. **Notification**: A browser notification shows the answer.
5. **Canvas**: A canvas element appears in the bottom-right corner of the page.

The display method is randomly selected each time to avoid detection patterns.

## Toggling the Extension

To toggle the extension on or off:
1. Press `Ctrl+Shift+S` (or `Command+Shift+S` on Mac) while on any webpage.
2. A notification will confirm whether the extension is enabled or disabled.

## Troubleshooting

- If the extension doesn't respond to triggers, try refreshing the page.
- If answers aren't displaying, check the browser console (F12) for any error messages.
- Make sure the page has fully loaded before attempting to use the extension.
- Some websites with strict Content Security Policies may interfere with the extension's functionality.