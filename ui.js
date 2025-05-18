// ui.js - Module for handling user interface elements in a stealthy way

// Array of different UI methods to use for displaying answers
const UI_METHODS = [
  'overlay',       // Semi-transparent overlay
  'tooltip',       // Tooltip-style popup
  'console',       // Enhanced console output
  'notification',  // Browser notification
  'canvas'         // Hidden canvas with text
];

// Constants for styling
const THEME_COLORS = {
  dark: {
    background: 'rgba(30, 30, 30, 0.85)',
    text: '#eee',
    accent: '#3a8ee6'
  },
  light: {
    background: 'rgba(240, 240, 240, 0.9)',
    text: '#222',
    accent: '#0066cc'
  },
  minimal: {
    background: 'rgba(0, 0, 0, 0.7)',
    text: '#fff',
    accent: '#ccc'
  }
};

// Track UI elements to avoid duplication
let activeElements = [];

// Entry point for showing answers - chooses a random UI method
export function showAnswer(answer) {
  try {
    // Select a random UI method
    const methodIndex = Math.floor(Math.random() * UI_METHODS.length);
    const method = UI_METHODS[methodIndex];
    
    // Select a random theme
    const themes = Object.keys(THEME_COLORS);
    const theme = themes[Math.floor(Math.random() * themes.length)];
    
    // Remove any existing UI elements
    removeActiveElements();
    
    // Call the appropriate UI method
    switch (method) {
      case 'tooltip':
        showTooltip(answer, theme);
        break;
      case 'console':
        showConsole(answer);
        break;
      case 'notification':
        showNotification(answer);
        break;
      case 'canvas':
        showCanvas(answer, theme);
        break;
      case 'overlay':
      default:
        showOverlay(answer, theme);
    }
  } catch (error) {
    console.error("UI error:", error);
    // Fall back to console method if all else fails
    showConsole(answer);
  }
}

// Method 1: Semi-transparent overlay
function showOverlay(answer, theme = 'dark') {
  try {
    const colors = THEME_COLORS[theme];
    
    // Create overlay container
    const overlay = document.createElement('div');
    
    // Generate a random ID to make it harder to detect
    const randomId = 'ext_' + Math.random().toString(36).substring(2, 10);
    overlay.id = randomId;
    
    // Apply minimal styling directly
    overlay.style.position = 'fixed';
    overlay.style.top = '20px';
    overlay.style.right = '20px';
    overlay.style.maxWidth = '400px';
    overlay.style.maxHeight = '80vh';
    overlay.style.overflow = 'auto';
    overlay.style.backgroundColor = colors.background;
    overlay.style.color = colors.text;
    overlay.style.padding = '12px';
    overlay.style.borderRadius = '5px';
    overlay.style.fontFamily = 'inherit';
    overlay.style.fontSize = '14px';
    overlay.style.lineHeight = '1.4';
    overlay.style.zIndex = '2147483647';
    overlay.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    overlay.style.transition = 'opacity 0.2s';
    overlay.style.opacity = '0';
    overlay.style.textAlign = 'left';
    
    // Create close button
    const closeBtn = document.createElement('div');
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.width = '16px';
    closeBtn.style.height = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.lineHeight = '16px';
    closeBtn.style.textAlign = 'center';
    closeBtn.style.opacity = '0.7';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', function() {
      overlay.style.opacity = '0';
      setTimeout(function() { 
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        activeElements = activeElements.filter(el => el !== overlay);
      }, 200);
    });
    
    // Create content
    const content = document.createElement('div');
    content.style.marginTop = '10px';
    content.textContent = answer;
    
    // Assemble overlay
    overlay.appendChild(closeBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    activeElements.push(overlay);
    
    // Use setTimeout to avoid synchronous layout operations
    setTimeout(function() { 
      overlay.style.opacity = '1'; 
    }, 10);
    
    // Auto-dismiss after a while
    setTimeout(function() {
      if (document.body.contains(overlay)) {
        overlay.style.opacity = '0';
        setTimeout(function() { 
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          activeElements = activeElements.filter(el => el !== overlay);
        }, 200);
      }
    }, 12000);
  } catch (error) {
    console.error("Overlay error:", error);
    showConsole(answer);
  }
}

// Method 2: Tooltip-style popup that appears near the mouse position
function showTooltip(answer, theme = 'dark') {
  try {
    const colors = THEME_COLORS[theme];
    
    // Get last mouse position
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Event listener to track mouse position
    const trackMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    // Add mouse tracking (will be removed after tooltip is shown)
    document.addEventListener('mousemove', trackMouse);
    
    // Delay tooltip creation slightly to get accurate mouse position
    setTimeout(() => {
      // Remove the mouse tracking listener
      document.removeEventListener('mousemove', trackMouse);
      
      // Create tooltip container
      const tooltip = document.createElement('div');
      
      // Generate a random ID
      const randomId = 'tip_' + Math.random().toString(36).substring(2, 10);
      tooltip.id = randomId;
      
      // Apply minimal styling directly
      tooltip.style.position = 'fixed';
      tooltip.style.maxWidth = '350px';
      tooltip.style.backgroundColor = colors.background;
      tooltip.style.color = colors.text;
      tooltip.style.padding = '10px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '13px';
      tooltip.style.lineHeight = '1.4';
      tooltip.style.zIndex = '2147483647';
      tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      tooltip.style.transition = 'opacity 0.15s';
      tooltip.style.opacity = '0';
      tooltip.style.textAlign = 'left';
      tooltip.style.pointerEvents = 'auto';
      
      // Position the tooltip near the mouse but not directly under it
      // Also ensure it stays within viewport bounds
      const tooltipX = Math.min(mouseX + 15, window.innerWidth - 360);
      const tooltipY = Math.min(mouseY + 15, window.innerHeight - 200);
      
      tooltip.style.left = tooltipX + 'px';
      tooltip.style.top = tooltipY + 'px';
      
      // Set content
      tooltip.textContent = answer;
      
      // Add a subdued attribution
      const attribution = document.createElement('div');
      attribution.style.marginTop = '8px';
      attribution.style.fontSize = '11px';
      attribution.style.opacity = '0.7';
      attribution.textContent = 'Press Esc to close';
      tooltip.appendChild(attribution);
      
      // Add to document
      document.body.appendChild(tooltip);
      activeElements.push(tooltip);
      
      // Fade in
      setTimeout(() => {
        tooltip.style.opacity = '1';
      }, 10);
      
      // Add escape key listener to close
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          tooltip.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(tooltip)) {
              document.body.removeChild(tooltip);
            }
            activeElements = activeElements.filter(el => el !== tooltip);
          }, 150);
          document.removeEventListener('keydown', escHandler);
        }
      };
      
      document.addEventListener('keydown', escHandler);
      
      // Auto-dismiss after a while
      setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(tooltip)) {
            document.body.removeChild(tooltip);
          }
          activeElements = activeElements.filter(el => el !== tooltip);
          document.removeEventListener('keydown', escHandler);
        }, 150);
      }, 10000);
      
    }, 50);
  } catch (error) {
    console.error("Tooltip error:", error);
    showConsole(answer);
  }
}

// Method 3: Enhanced console output
function showConsole(answer) {
  try {
    // Create a styled message for the console
    const styles = [
      'color: #ffffff',
      'background: #2a2a2a',
      'padding: 10px',
      'border-radius: 4px',
      'font-family: Arial, sans-serif',
      'font-size: 12px',
      'line-height: 1.4',
      'margin: 10px 0'
    ].join(';');
    
    // Display with different console methods to make it more visible
    console.log('%c Answer to your question:', styles);
    console.info('%c ' + answer, styles);
    
    // Also show a small notification that the answer is in console
    showNotification("Answer available in browser console (F12)");
  } catch (error) {
    console.error("Console display error:", error);
    // Just use regular console as fallback
    console.log("Answer to your question:");
    console.log(answer);
  }
}

// Method 4: Browser notification
export function showNotification(message) {
  try {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.info("This browser does not support notifications");
      return;
    }
    
    // Check if we already have permission
    if (Notification.permission === "granted") {
      createNotification(message);
    } 
    // If permission is not denied, request it
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          createNotification(message);
        }
      });
    }
    
    function createNotification(msg) {
      // Create a simple notification
      const notification = new Notification("Study Assistant", {
        body: msg,
        icon: chrome.runtime.getURL("icon-48.png")
      });
      
      // Close the notification after a few seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  } catch (error) {
    console.error("Notification error:", error);
  }
}

// Method 5: Hidden canvas with text (very stealthy)
function showCanvas(answer, theme = 'dark') {
  try {
    const colors = THEME_COLORS[theme];
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    
    // Generate a random ID
    const randomId = 'cnv_' + Math.random().toString(36).substring(2, 10);
    canvas.id = randomId;
    
    // Set size
    canvas.width = 400;
    canvas.height = 300;
    
    // Style it to be visible but discrete
    canvas.style.position = 'fixed';
    canvas.style.bottom = '20px';
    canvas.style.right = '20px';
    canvas.style.zIndex = '2147483646';
    canvas.style.border = '1px solid ' + colors.accent;
    canvas.style.borderRadius = '4px';
    canvas.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 0.2s';
    
    // Add to document
    document.body.appendChild(canvas);
    activeElements.push(canvas);
    
    // Draw on the canvas
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = colors.text;
    ctx.font = '14px Arial, sans-serif';
    
    // Word wrap text on the canvas
    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      
      context.fillText(line, x, y);
      return y;
    };
    
    // Add a title
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('Answer:', 20, 30);
    
    // Add the actual text
    ctx.fillStyle = colors.text;
    ctx.font = '14px Arial, sans-serif';
    wrapText(ctx, answer, 20, 60, canvas.width - 40, 20);
    
    // Add close instructions
    ctx.fillStyle = colors.accent;
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Click to close', canvas.width - 100, canvas.height - 15);
    
    // Add click handler to close
    canvas.addEventListener('click', () => {
      canvas.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
        activeElements = activeElements.filter(el => el !== canvas);
      }, 200);
    });
    
    // Fade in
    setTimeout(() => {
      canvas.style.opacity = '1';
    }, 10);
    
    // Auto-dismiss after a while
    setTimeout(() => {
      canvas.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
        activeElements = activeElements.filter(el => el !== canvas);
      }, 200);
    }, 12000);
    
  } catch (error) {
    console.error("Canvas error:", error);
    showConsole(answer);
  }
}

// Remove any active UI elements to avoid duplication
function removeActiveElements() {
  for (const element of activeElements) {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  }
  activeElements = [];
}
