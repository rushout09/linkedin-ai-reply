(function() {
  const SELECTORS = {
    linkedinContainer: 'div.feed-shared-update-v2'
  };
  let pluginEnabled = true;
  const processed = new WeakSet();

  function scan() {
    if (!pluginEnabled) return;
    document.querySelectorAll(SELECTORS.linkedinContainer).forEach(processLinkedIn);
  }

  const observer = new MutationObserver(() => scan());
  chrome.storage.local.get(['enabled'], (items) => {
    pluginEnabled = items.enabled !== false;
    if (pluginEnabled) {
      observer.observe(document.body, { childList: true, subtree: true });
      scan();
    }
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      pluginEnabled = changes.enabled.newValue !== false;
      if (pluginEnabled) {
        observer.observe(document.body, { childList: true, subtree: true });
        scan();
      } else {
        observer.disconnect();
      }
    }
  });

  function processLinkedIn(container) {
    if (processed.has(container)) return;
    const textElem = container.querySelector('.feed-shared-update-v2__description');
    if (!textElem) return;
    processed.add(container);
    addButton(container, textElem.innerText);
  }

  function addButton(container, content) {
    const btn = document.createElement('button');
    btn.textContent = 'Generate AI Reply';
    btn.className = 'reply-generator-button';
    btn.addEventListener('click', () => generateReply(btn, content));
    // Mark platform type for action button behavior
    btn.dataset.platform = 'linkedin';
    container.appendChild(btn);
  }
  
  // Function to auto-comment on a LinkedIn post
  function commentOnPost(button, reply) {
    const container = button.closest(SELECTORS.linkedinContainer);
    if (!container) return;
    // Open the comment box
    const toggleBtn = container.querySelector('button[aria-label="Comment"]')
      || container.querySelector('button[aria-label="Leave a comment"]');
    if (toggleBtn) toggleBtn.click();
    // Wait for comment input to appear
    const interval = setInterval(() => {
      const editor = container.querySelector('div[contenteditable="true"][role="textbox"]');
      if (editor) {
        clearInterval(interval);
        editor.focus();
        editor.innerText = reply;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        // Find and click the Post button
        const postBtn = Array.from(container.querySelectorAll('button'))
          .find(el => el.innerText.trim() === 'Comment');
        if (postBtn) postBtn.click();
      }
    }, 500);
  }

  function generateReply(button, content) {
    if (button.disabled) return;
    button.disabled = true;
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    button.parentNode.insertBefore(spinner, button.nextSibling);

    chrome.storage.local.get(['prompt'], (items) => {
      const prompt = items.prompt || 'Provide a friendly reply based on the content';
      chrome.runtime.sendMessage(
        { type: 'generateReply', content: content, prompt: prompt },
        (response) => {
          spinner.remove();
          button.disabled = false;
          if (!response || response.error) {
            alert('Error: ' + (response && response.error));
            return;
          }
          const replyContainer = document.createElement('div');
          replyContainer.className = 'reply-generator-container';
          const replyText = document.createElement('div');
          replyText.className = 'reply-text';
          replyText.textContent = response.reply;
          replyContainer.appendChild(replyText);

          // Create action button: Comment on LinkedIn or copy for others
          let actionBtn;
          actionBtn = document.createElement('button');
          actionBtn.textContent = 'Comment';
          actionBtn.className = 'reply-generator-action';
          actionBtn.addEventListener('click', () => commentOnPost(button, response.reply));

          const regenBtn = document.createElement('button');
          regenBtn.textContent = 'Regenerate';
          regenBtn.className = 'reply-generator-action';
          regenBtn.addEventListener('click', () => {
            replyContainer.remove();
            generateReply(button, content);
          });

          replyContainer.appendChild(actionBtn);
          replyContainer.appendChild(regenBtn);
          button.parentNode.insertBefore(replyContainer, button.nextSibling);
        }
      );
    });
  }
})();