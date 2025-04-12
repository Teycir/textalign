// Keep background script minimal for ManifestV3 as recommended in search result [2]
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings on installation
  chrome.storage.local.get(
    ['alignment', 'optimizeWidth', 'textRendering'],
    function(data) {
      const defaults = {};
      
      if (!data.alignment) {
        defaults.alignment = 'left';
      }
      
      if (data.optimizeWidth === undefined) {
        defaults.optimizeWidth = false;
      }
      
      if (!data.textRendering) {
        defaults.textRendering = 'auto';
      }
      
      if (Object.keys(defaults).length > 0) {
        chrome.storage.local.set(defaults);
      }
    }
  );
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applySettings') {
    // Send message to all tabs to apply settings
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      // Handle case with no tabs
      if (tabs.length === 0) {
        sendResponse({success: false, message: 'No tabs to update'});
        return;
      }
      
      let successCount = 0;
      let processedCount = 0;
      let totalCount = tabs.length;
      
      for (let tab of tabs) {
        try {
          // Skip chrome:// URLs as they can't be injected
          if (tab.url && tab.url.startsWith('chrome://')) {
            processedCount++;
            
            if (processedCount === totalCount) {
              sendResponse({success: true, message: `Applied to ${successCount} of ${totalCount} tabs`});
            }
            continue;
          }
          
          chrome.tabs.sendMessage(
            tab.id,
            { action: 'applySettings', settings: message.settings },
            response => {
              processedCount++;
              
              if (chrome.runtime.lastError) {
                // Log specific connection errors, possibly expected for restricted tabs
                console.warn(`Could not connect to content script in tab ${tab.id}: ${chrome.runtime.lastError.message}`);
              } else if (response && response.status === 200) {
                // Success: Content script received message and responded positively
                console.log('Settings applied in tab:', tab.id);
                successCount++;
              } else {
                 // Handle cases where content script responded, but not with expected status (if applicable)
                 console.warn(`Unexpected response from content script in tab ${tab.id}:`, response);
              }
              
              // When all tabs have been processed, respond to the original sender
              if (processedCount === totalCount) {
                sendResponse({success: true, message: `Applied to ${successCount} of ${totalCount} tabs`});
              }
            }
          );
        } catch (error) {
          processedCount++;
          console.error('Error sending message to tab:', tab.id, error);
          
          if (processedCount === totalCount) {
            sendResponse({success: true, message: `Applied to ${successCount} of ${totalCount} tabs`});
          }
        }
      }
    });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});
