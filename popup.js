document.addEventListener('DOMContentLoaded', function() {
  const alignmentSelect = document.getElementById('alignment');
  const optimizeWidthCheckbox = document.getElementById('optimizeWidth');
  const textRenderingSelect = document.getElementById('textRendering');
  const applyButton = document.getElementById('apply');
  const statusText = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(
    ['alignment', 'optimizeWidth', 'textRendering'], 
    function(data) {
      if (data.alignment) {
        alignmentSelect.value = data.alignment;
      }
      if (data.optimizeWidth !== undefined) {
        optimizeWidthCheckbox.checked = data.optimizeWidth;
      }
      if (data.textRendering) {
        textRenderingSelect.value = data.textRendering;
      }
    }
  );
  
  // Apply settings to current tab
  applyButton.addEventListener('click', function() {
    // Show loading status
    statusText.textContent = 'Applying...';
    statusText.style.color = '#777';
    
    const settings = {
      alignment: alignmentSelect.value,
      optimizeWidth: optimizeWidthCheckbox.checked,
      textRendering: textRenderingSelect.value
    };
    
    // Save to storage
    chrome.storage.local.set(settings, function() {
      // Send message to background script instead of directly to tab
      // This fixes the "Receiving end does not exist" error
      chrome.runtime.sendMessage(
        { action: 'applySettings', settings: settings },
        response => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError);
            statusText.textContent = 'Error: ' + chrome.runtime.lastError.message;
            statusText.style.color = '#f44336';
            return;
          }
          
          if (response && response.success) {
            statusText.textContent = 'Settings applied!';
            statusText.style.color = '#4caf50';
            
            // Clear status after 2 seconds
            setTimeout(() => {
              statusText.textContent = '';
            }, 2000);
          } else {
            statusText.textContent = response ? response.message : 'Error applying settings';
            statusText.style.color = '#f44336';
          }
        }
      );
    });
  });
});
