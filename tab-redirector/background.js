// Map to store URLs and their corresponding tab IDs
const urlTabMap = new Map();

// Helper function to get the base URL without parameters or fragments
function getBaseUrl(url) {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
}

// Helper function to check if a URL matches any of the exclude patterns
function isExcluded(url, excludePatterns) {
  for (const pattern of excludePatterns) {
    if (url.includes(pattern)) {
      return true;
    }
  }
  return false;
}

// Listen for new tab creation events
chrome.tabs.onCreated.addListener(async (tab) => {
  const baseUrl = getBaseUrl(tab.pendingUrl || tab.url);
  console.log('New tab created:', tab.url);
  console.log('Base URL:', baseUrl);

  // Load exclude patterns from storage
  chrome.storage.sync.get('excludePatterns', (data) => {
    const excludePatterns = data.excludePatterns || [];
    console.log('Exclude patterns:', excludePatterns);

    // Check if the current URL is excluded
    if (isExcluded(tab.url, excludePatterns)) {
      console.log('URL is excluded, not redirecting');
      // Add the new tab to the map even if it's excluded
      urlTabMap.set(tab.url, tab.id);
      console.log('Current map:', urlTabMap);
      return;
    }

    console.log('Checking for existing tabs with the same base URL');

    // Check if a tab with the same base URL is already open
    for (const [tabUrl, tabId] of urlTabMap.entries()) {
      const existingBaseUrl = getBaseUrl(tabUrl);
      console.log('Existing tab URL:', tabUrl, 'Base URL:', existingBaseUrl);

      if (existingBaseUrl === baseUrl) {
        console.log('Matching tab found, navigating to existing tab:', tabId);
        // Navigate to the existing tab
        chrome.tabs.update(tabId, { active: true });
        chrome.tabs.remove(tab.id);
        return;
      }
    }

    console.log('No matching tab found, adding new tab to map');
    // Add the new tab to the map
    urlTabMap.set(tab.url, tab.id);
    console.log('Current map:', urlTabMap);
  });
});

// Clean up the map when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('Tab closed:', tabId);

  for (const [url, id] of urlTabMap.entries()) {
    if (id === tabId) {
      console.log('Removing closed tab from map:', url);
      urlTabMap.delete(url);
      console.log('Current map:', urlTabMap);
      break;
    }
  }
});