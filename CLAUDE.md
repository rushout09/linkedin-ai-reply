# CLAUDE.md

> **Read first:** if a Notion connector is available in this session, read the page
> "Working Context (read me first)" and follow it. It holds the user's own preferences and
> working rules. If there is no such page, skip this silently.

Chrome extension (Manifest V3) that generates AI replies to LinkedIn posts using the user's OpenAI API key. Install steps are in [README.md](README.md).

## Commands
- No build, package manager, tests or linter. Plain JS/HTML/CSS: `background.js` (service worker), `content.js` and `content.css` (injected on linkedin.com), `popup.html` and `popup.js`.
- Run: `chrome://extensions` > Developer mode > Load unpacked > select this folder. Reload the extension there after every edit.

## Rules
- Default branch is `main`. No CI or deploy config is visible in the repo.
- Host permission is limited to `https://api.openai.com/*` in `manifest.json`; keep permissions minimal and do not add hosts without asking.
- Never hardcode an API key; the key is entered by the user in the popup.
