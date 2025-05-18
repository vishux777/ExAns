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