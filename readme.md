# Chrome Background Theme(Don't go on name)

**Made by DarkExpoliter(VK). Have a look at license before use.**

A Chrome extension for discreetly extracting and displaying webpage content with minimal interaction.

---

## 📋 Overview

Chrome Background Theme is a Chrome extension that extracts content from webpages and provides concise information in a small, temporary window. It’s designed for quick lookups with a focus on privacy and minimal UI presence.

> **⚠️ Note**: This extension is for educational purposes only. Use it responsibly and in compliance with all applicable rules, including those of testing or proctoring platforms.

---

## 🚀 Features

- **Quick Extraction**: Double-click to extract content from any webpage.
- **Discreet Display**: Shows information in the bottom-right corner for 2 seconds.
- **Privacy-Focused**: Minimal webpage interaction, no persistent UI.

---

## 🛠️ Installation

### Chrome/Edge
1. Clone or download the repository:
   ```
   git clone https://github.com/<your-username>/chrome-background-theme.git
   ```
2. Navigate to the extensions page:
   ```
   chrome://extensions
   ```
3. Enable Developer Mode:
   - Toggle the "Developer mode" switch in the top-right corner.
4. Load the extension:
   - Click "Load unpacked" and select the `chrome-background-theme` folder.

### Firefox (Temporary)
1. Clone or download the repository:
   ```
   git clone https://github.com/<your-username>/chrome-background-theme.git
   ```
2. Open Firefox debugging:
   ```
   about:debugging
   ```
3. Load the add-on:
   - Click "This Firefox" → "Load Temporary Add-on".
   - Select `manifest.json` from the `chrome-background-theme` folder.

---

## 📖 Usage

1. Open a webpage:
   ```
   https://example.com
   ```
2. Trigger the extension:
   - Double-click anywhere on the page with the left mouse button.
3. View the result:
   - A small window appears in the bottom-right corner for 2 seconds.

---

## 🔑 Replacing the API Key

The extension uses the Mistral AI API. Replace the default API key with your own:

1. **Get a Mistral AI API Key**:
   - Visit [Mistral AI](https://mistral.ai) and sign up/log in.
   - Generate an API key from your dashboard.

2. **Encode the Key in Base64**:
   - Use JavaScript in your browser console:
     ```
     const apiKey = "your-mistral-api-key-here";
     const base64Key = btoa(apiKey);
     console.log(base64Key);
     ```
   - Or use an online tool: [Base64 Encode](https://www.base64encode.org/).

3. **Update `background.js`**:
   - Open `background.js` in a text editor.
   - Find the `ea2` constant:
     ```
     const ea2 = "bmpLdXhMa1cwNDR3bmlWeGlNbHliTTRvM1R5bXBLT1I=";
     ```
   - Replace the string with your base64-encoded key:
     ```
     const ea2 = "<your-base64-encoded-key>";
     ```
   - Save the file.

4. **Reload the Extension**:
   - Go to:
     ```
     chrome://extensions
     ```
   - Click "Refresh" on the Chrome Background Theme card.

> **🔒 Security Note**: Keep your API key confidential. Do not commit it to version control in plain text.

---

## 📁 File Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (contains API key)
├── content_script.js      # Injected content script
├── proxy.js               # API call proxy
├── extractor.js           # DOM extraction utilities
├── ui.js                  # UI rendering utilities
├── installation_guide.md  # Installation instructions
├── extension_structure.md # File structure overview
├── README.md              # This file
```

---

## 🐞 Troubleshooting

- **Extension Not Responding**:
  - Ensure the page is fully loaded.
  - Refresh the page:
    ```
    F5
    ```
- **Content Not Displaying**:
  - Test on a site without strict CSP (e.g., Wikipedia).
  - Open:
    ```
    https://wikipedia.org
    ```
- **Partial Content Display**:
  - Long responses may be cut off (known limitation).
- **API Key Errors**:
  - Verify your API key in `background.js`.
  - Check Mistral AI API docs for limits.

---

## 🤝 Contributing

Maintained by DarkExpoliter(VK). Contributions are welcome!

1. Fork the repository:
   ```
   https://github.com/<your-username>/chrome-background-theme/fork
   ```
2. Make changes and submit a pull request.

---

## 📜 License

Still working on it.

---

## ⚖️ Disclaimer

Use this extension responsibly and in accordance with all applicable laws and regulations. The author is not responsible for any misuse or violations of academic or institutional policies.
