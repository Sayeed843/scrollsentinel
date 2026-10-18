# YouTube Focus Hours 🎯

A privacy-focused Firefox extension for intentional YouTube use. Restrict browsing to scheduled sessions, enforce a daily usage budget, and reduce distracting UI elements.

## Features

| Feature | Behavior |
| --- | --- |
| Scheduled access | Default allowed windows: **12:00–14:00** and **22:00–23:30** |
| Daily usage budget | Default **90 minutes/day**, approximated using focused YouTube-tab activity |
| Strict Mode | Locks extension settings for **7 or 14 days** |
| Distraction-Free Mode | Hides recommendations, suggested videos, comments, Shorts navigation/shelves and notifications; attempts to turn autoplay off |
| Privacy-first | Uses local browser storage; no server or analytics service |

Access times are based on your computer's local clock and daily usage resets at local midnight.

## Development installation

1. Clone or download this repository.
2. Open Firefox and visit `about:debugging#/runtime/this-firefox`.
3. Select **Load Temporary Add-on**.
4. Choose the repository's `manifest.json`.
5. Open the extension popup, adjust settings if needed, and select **Save settings**. To lock your choices, choose a 7- or 14-day Strict Mode duration **before saving**.

Temporary add-ons disappear when Firefox restarts. Permanent Firefox installation requires appropriate packaging and signing through Mozilla.

## Project files

```text
manifest.json    Extension metadata and required permissions
background.js    Schedule checks, time budget, local persistence, strict-lock rules
guard.js         Blocking overlay, activity reporting, distraction filtering
popup.html       Popup layout and styles
popup.js         Settings UI and saving logic
README.md        Project documentation
LICENSE          MIT license
.gitignore       Ignored build artifacts
```

## How the rules work

YouTube is available only when both conditions are true: the current time falls within an allowed viewing window, and the day's usage budget has not been exhausted. The daily budget estimates time spent actively browsing a focused YouTube tab; it is **not** an exact measure of video playback. The content script adds a blocking overlay outside permitted sessions and hides selected distracting elements during allowed sessions.

### Strict Mode caveat

Strict Mode prevents editing settings **within the extension** until the lock expires. It **cannot** stop a Firefox user from disabling or uninstalling the add-on, deleting extension storage, using a different profile/browser, modifying unpacked files, or manipulating the local computer clock. It is a self-discipline tool, **not a tamper-proof enforcement system**.

### Limitations

- This is a **development prototype**, not a Mozilla-reviewed or signed release.
- Background video playback and some multi-tab scenarios may not count toward the budget accurately.
- YouTube's HTML and navigation change frequently; selectors may need maintenance.
- Autoplay disabling is best effort.
- Blocking is an on-page overlay, not an operating-system-wide restriction.

## Testing checklist

- Confirm allowed/blocked transitions at 12:00, 14:00, 22:00 and 23:30.
- Confirm the 90-minute limit blocks access after it is reached.
- Confirm usage resets after local midnight.
- Check strict-lock persistence and expiry after browser restart.
- Check the popup and filtering in recent Firefox versions.
- Test tab switching, multiple windows and YouTube SPA navigation.

No automated browser acceptance tests have been run as part of this initial repository publication. Please test before relying on the extension.

## AI assistance disclosure

**This project was planned and developed with the assistance of ChatGPT by OpenAI.** ChatGPT helped design and generate the extension code, feature behavior, and documentation. The repository owner is responsible for reviewing, testing, maintaining, and publishing the software. AI-generated code may contain mistakes.

## License

MIT — see [LICENSE](LICENSE).
