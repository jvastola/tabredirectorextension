const excludePatternsInput = document.getElementById('exclude-patterns');
const saveButton = document.getElementById('save-btn');

// Load exclude patterns from storage on page load
chrome.storage.sync.get('excludePatterns', (data) => {
  excludePatternsInput.value = data.excludePatterns ? data.excludePatterns.join('\n') : '';
});

// Save exclude patterns to storage when the save button is clicked
saveButton.addEventListener('click', () => {
  const patterns = excludePatternsInput.value.split('\n').filter(pattern => pattern.trim() !== '');
  chrome.storage.sync.set({ excludePatterns: patterns }, () => {
    console.log('Exclude patterns saved');
  });
});