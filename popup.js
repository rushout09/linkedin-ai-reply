document.addEventListener('DOMContentLoaded', () => {
  const enableCheckbox = document.getElementById('enableCheckbox');
  const linkedinPromptInput = document.getElementById('linkedinPromptInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveSettingsButton = document.getElementById('saveSettingsButton');
  const refreshButton = document.getElementById('refreshButton');

  chrome.storage.local.get(['enabled', 'prompt', 'linkedinPrompt', 'apiKey'], (items) => {
    enableCheckbox.checked = items.enabled !== false;
    const defaultLinkedIn = 'Provide a professional reply based on the content.';
    linkedinPromptInput.value = items.linkedinPrompt !== undefined
      ? items.linkedinPrompt
      : (items.prompt || defaultLinkedIn);
    apiKeyInput.value = items.apiKey || '';
  });

  saveSettingsButton.addEventListener('click', () => {
    chrome.storage.local.set({
      enabled: enableCheckbox.checked,
      linkedinPrompt: linkedinPromptInput.value,
      apiKey: apiKeyInput.value
    }, () => {
      alert('Settings saved');
    });
  });

  refreshButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
    });
  });
});