// Avoid heavy calculations during page load as shown in search result [1]
let alignmentApplied = false;
let settings = null;
let observer = null;
let styleElement = null;

// Load settings once and cache them
async function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(['alignment', 'optimizeWidth'], data => {
      settings = {
        alignment: data.alignment || 'left',
        optimizeWidth: data.optimizeWidth !== undefined ? data.optimizeWidth : false
      };
      resolve(settings);
    });
  });
}

// Efficiently apply styles using a stylesheet instead of inline styles
// This reduces DOM manipulation as suggested in search results [1] and [3]
function createStylesheet() {
  // Remove existing stylesheet if it exists
  if (styleElement) {
    styleElement.remove();
  }
  
  styleElement = document.createElement('style');
  styleElement.id = 'textalign-pro-styles';
  
  // Build CSS based on settings
  let css = '';
  
  // Common text selectors - targeting main content areas
  const selectors = [
    'article', 'main p', '.content p', '.post-content p', 
    '.article-content p', '.entry-content p', '.blog-post p',
    '[role="main"] p', '.story-body p', 'section p'
  ].join(', ');
  
  css += `${selectors} {
    text-align: ${settings.alignment};
  }`;
  
  if (settings.optimizeWidth) {
    css += `
      ${selectors} {
        max-width: 66ch;
        margin-left: auto;
        margin-right: auto;
      }
    `;
  }
  
  // Apply font-face with ascent-override to fix vertical alignment issues
  // Based on search result [4] for fixing text alignment in Chrome
  css += `
    @font-face {
      font-family: 'system-ui';
      src: local('system-ui');
      ascent-override: 100%;
    }
  `;
  
  styleElement.textContent = css;
  document.head.appendChild(styleElement);
}

// Main function to apply text alignment - optimized to run less frequently
async function applyTextAlignment() {
  if (!settings) {
    await loadSettings();
  }
  
  if (!alignmentApplied) {
    createStylesheet();
    alignmentApplied = true;
  }
}

// Listen for messages from popup using a more efficient approach
// Based on search result [3] about message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applySettings') {
    settings = message.settings;
    alignmentApplied = false;
    applyTextAlignment();
    sendResponse({status: 200, message: 'Settings applied'});
  }
  return true; // Indicates async response
});

// Initialize observer to detect content changes
// Using a debounced approach to avoid excessive processing
function initObserver() {
  let timeout;
  observer = new MutationObserver(mutations => {
    // Debounce to avoid multiple rapid executions as recommended in search result [1]
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // Only update if we detect significant content changes
      const textNodesAdded = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === 1 && (
            node.tagName === 'P' || 
            node.tagName === 'ARTICLE' || 
            node.tagName === 'SECTION'
          )
        )
      );
      
      if (textNodesAdded) {
        applyTextAlignment();
      }
    }, 500);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize with a slight delay to prioritize page loading
window.addEventListener('DOMContentLoaded', () => {
  // Delay execution to improve page load performance
  setTimeout(() => {
    applyTextAlignment().then(() => {
      initObserver();
    });
  }, 100);
});
