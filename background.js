chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'generateReply') {
    chrome.storage.local.get(['apiKey'], (items) => {
      const apiKey = items.apiKey;
      if (!apiKey) {
        sendResponse({ error: 'No API key set' });
        return;
      }
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'user', content: `${message.prompt}: ${message.content}` }
          ],
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.choices && data.choices.length > 0) {
            sendResponse({ reply: data.choices[0].message.content });
          } else {
            sendResponse({ error: 'No reply generated' });
          }
        })
        .catch(err => {
          sendResponse({ error: err.toString() });
        });
    });
    return true; // keep sendResponse channel open for async
  }
});