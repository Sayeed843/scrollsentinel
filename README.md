# 🛡️ ScrollSentinel

<img src="icons/scrollsentinel.svg" alt="ScrollSentinel app icon" width="110" align="right">

**Take control of your scroll.** A distraction-control and cybersecurity-learning Firefox extension.

ScrollSentinel provides **scheduled blocking and focus controls for YouTube**, plus a shared **60-minute video-watching / 2-minute wellness-break cycle** across YouTube, Facebook, Instagram and TikTok (in Firefox Desktop). The app also includes 12 illustrated cybersecurity quests. All settings and approximate usage counters stay on your device.

> **Release status:** The Mozilla Store currently has publicly approved **v2.5.3**. The GitHub source is now **v2.8.0**, with PNG icons, configurable YouTube schedules, the four-platform video wellness break, and a **redesigned compact popup plus a full-tab Settings page**. Store users do **not** get these changes until v2.8.0 is submitted, signed and published.

## 🌍 Platform support — v2.7.0 development version

| Website | Scheduled blocking / daily limit | 60-minute video-watching break |
| --- | --- | --- |
| **YouTube** | ✅ Adjustable 2–3 viewing windows, daily browsing limit, focus screen, Strict Mode and distraction reduction | ✅ Plays up to 60 minutes of observed video before a two-minute rest |
| **Facebook / Reels / Videos** | ⏳ Not yet implemented | ✅ Shared timer and rest screen on detected HTML5 videos |
| **Instagram / Reels** | ⏳ Not yet implemented | ✅ Shared timer and rest screen on detected HTML5 videos |
| **TikTok** | ⏳ Not yet implemented | ✅ Shared timer and rest screen on detected HTML5 videos |

**Important:** The non-YouTube websites have **only the video wellness break**, not YouTube's schedule limits, Strict Mode site blocking, or Distraction-Free controls. Facebook, Instagram and TikTok viewing controls are planned for later releases. These new browser-site permissions require approval when Mozilla publishes a new extension version.

**Brand identity:** The ScrollSentinel shield surrounds scrolling-feed lines and a lock, symbolizing focused browsing without tying the icon to a particular social platform. The add-on keeps its original internal Firefox extension ID for compatibility.

**v2.5.3 artwork fix:** The Least Privilege padlock is now positioned above the DATA card, keeping both its title and description visible. An automated regression check protects against the overlap returning.

### Mozilla Add-ons submission update (v2.5.3)

The initial Mozilla validation of v2.5.2 succeeded with two `Unsafe assignment to innerHTML` warnings, one in `guard.js` and one in `quest-stories.js`. Version **2.5.3** removes all `innerHTML` assignments and instead parses **extension-owned, fixed** UI/story markup into an inert document before importing its DOM nodes.

The application does not insert user-controlled strings or YouTube page data into these templates. The tests now enforce that no `innerHTML` writes are reintroduced. Revalidate **the new ZIP** on Mozilla Add-ons; passing the project tests is not a guarantee that AMO has no other warnings.

### Firefox icon compatibility update (v2.5.4)

Firefox's installed Add-ons Manager displayed the generic puzzle-piece icon even after the Store listing image was set. The original SVG is retained as a vector source, while size-matched **16, 32, 48, 64, 96 and 128 px PNG files** have been included. Both extension icons and toolbar action icons now reference PNG. Although Firefox supports SVG icons, using exact-size PNG images avoids SVG-specific rendering or packaging surprises.

**Important:** The publicly approved Mozilla Store release is still v2.5.3. The PNG icon changes will reach Store users only when the newer v2.8.0 version is signed and published.

[Official ScrollSentinel Mozilla Add-ons listing](https://addons.mozilla.org/en-US/firefox/addon/scrollsentinel/)

## 🌿 Screen Break / Eye Care (v2.7.0)

After **60 minutes of observed, foreground video playback across YouTube, Facebook, Instagram and TikTok combined**, ScrollSentinel pauses the detected HTML5 video(s) and displays a **2-minute illustrated countryside village scene** with a friendly human face, animated eyes, a break countdown, and progress indicators.

| Break stage | Length | Screen prompt / animation |
| --- | --- | --- |
| **1. Eyes** | **30 seconds** | An illustrated face moves its pupils gently **counter-clockwise**. The user may follow a comfortable circle with their gaze; stop if the motion feels unpleasant. |
| **2. Breathe** | **30 seconds** | A softly expanding and contracting orb guides gentle inhaling and exhaling. |
| **3. Walk** | **30 seconds** | A walking figure invites the user to stand up or move around if comfortable. |
| **4. Breathe again** | **30 seconds** | Another calm breathing exercise closes the two-minute rest. |

**How the limit works:** Playback on the four sites contributes to a **single shared hour**, not four separate one-hour allowances. Only detected video that is playing and visible in the active, focused Firefox tab is counted (approximately one second at a time). Leaving a page open without watching video doesn't count, and time spent in the break doesn't count. After the full two minutes, the overlay clears and a fresh 60-minute video allowance begins. Videos **remain paused** until the user presses Play.

**Independent from YouTube scheduling:** YouTube still has its separate default **90-minute daily browsing budget** and selected access windows. Reaching the 60-minute video threshold triggers a two-minute rest, **not** a permanent daily ban. If YouTube's own daily budget or schedule disallows access, the rest completion does not override those rules. Facebook, Instagram and TikTok are **not scheduled-blocked** by this release.

**Persistence, accessibility and privacy:** The timer and rest deadline are stored locally in Firefox, shared across matching tabs and supported sites; reloading doesn't reset a break. The deadline is based on the computer clock, so closing Firefox for two minutes also completes the break. Illustrations are bundled CSS/SVG with no image downloads. Animations respect `prefers-reduced-motion`. The on-screen exercises are **gentle prompts**, not medical treatment, and the extension cannot verify whether anyone physically walked or breathed.

**Limitations:** This is a best-effort **Firefox browser extension**, not a system-level lock. Videos in mobile apps, other browsers, protected players or inaccessible embedded/closed-shadow/canvas-based players may not be detected or paused. A user can disable the extension, clear local extension storage or change the device clock. Use the feature to support healthy habits, not as a tamper-proof control.

### Quick visual preview for developers (no 60-minute wait)

To preview the meadow and all four timed stages without watching an hour of video:

1. Temporarily load the **v2.8.0 development** extension using Firefox `about:debugging#/runtime/this-firefox`. Select **Inspect** for the extension's background script to open its debugger console.
2. In that **extension background console** (not in a website's console), execute:

```js
await browser.storage.local.set({
  videoWatchedSeconds: 3600,
  restUntilMs: Date.now() + 120000
});
```

3. Open or reload a supported website in a normal Firefox tab, e.g., `https://www.facebook.com/`. The village overlay should appear. Observe the **four 30-second stages**; pausing and changing tabs should not restart the two-minute deadline.
4. To restore the normal counter for development, execute:

```js
await browser.storage.local.set({
  videoWatchedSeconds: 0,
  restUntilMs: 0
});
```

5. Refresh the test tab. **Do not use this developer test shortcut as normal production behavior**; it is only for testing. Users can also disable an extension or clear its storage, so the rest is not tamper-proof.

## 🎛️ Popup & Full-Tab Settings Redesign (v2.8.0)

The browser-toolbar popup is intentionally small and designed not to cut off controls on ordinary laptop displays. It shows **YouTube access status**, today's browsing-time usage, minutes until the next four-site video wellness break, compact chips for the **selected viewing schedules**, two auto-saving quick toggles and a button to open the full editor.

**Advanced schedules & settings** opens `options.html` in its own Firefox tab. The page provides:

- All **two permanent editable schedules** and **up to two removable custom schedules**.
- Checkbox selection for **2–3 active schedules** and live overlap detection, including unchecked/overnight ranges.
- **24-hour HH:MM** text fields in a roomy responsive layout, avoiding squeezed native time pickers with AM/PM labels.
- Separate YouTube daily budget, Distraction-Free toggle, Strict Mode and four-site screen-break status.
- An **inline Strict Mode acknowledgment checkbox** before saving a 7- or 14-day lock. There are no browser `confirm()` dialogs within the popup.
- Read-only Settings and disabled popup quick toggles while Strict Mode is active. The background continues to enforce the lock independently of the UI.

**Important:** Changes in the full editor are saved only when **Save changes** is pressed; quick toggles in the compact popup save immediately. Settings remain local to Firefox. <u>Browser-level visual acceptance testing should still be performed before publishing this development version to Mozilla.</u>

## ⏰ Flexible YouTube Schedules (v2.6.0)

The **full Settings tab** allows four schedule slots: two built-in schedules and up to two user-created custom schedules. The small toolbar popup only summarizes selected windows.

- **Original schedule 1:** 12:00–14:00 (selected by default). Its time may be edited, but the slot cannot be deleted.
- **Original schedule 2:** 22:00–23:30 (selected by default). Its time may be edited, but the slot cannot be deleted.
- **Custom schedules 3 and 4:** Click **+ Add schedule** to create an optional time interval. These slots can be edited, checked/unchecked, and deleted.
- **Checkbox rule:** At least **two** and at most **three** schedules must be selected. The checkbox determines whether that interval allows YouTube access.
- **No overlapping ranges:** All existing time intervals must be nonoverlapping, whether selected or not. The extension checks this in the full Settings editor and again in the background before saving. Overnight ranges (such as 22:00–01:00) are supported, including overlap detection across midnight. Adjacent intervals such as 12:00–14:00 and 14:00–15:00 are permitted.
- **Countdown:** The blocked screen lists **only selected** schedules and counts down to the next selected viewing window.
- **Backward compatible:** Two-window settings saved by earlier ScrollSentinel versions carry over automatically with both original schedules selected.
- **Strict Mode:** During an active 7- or 14-day lock, schedules cannot be added, removed, selected/deselected, or edited through the extension.

**Important overlap example:** A new 17:00–20:30 schedule will be rejected if a configured 20:00–23:30 schedule already exists (even if unchecked). Edit the earlier schedule so its time no longer overlaps.

All schedule times use the local device clock. The same daily time budget still applies across **all** selected windows.

## 🎬 Cybersecurity Learning Stories (12 animated quests)

ScrollSentinel now presents a **short, illustrated cybersecurity story for every quest** while YouTube is blocked. Each story has characters or security objects, several timed steps, and a successful learning outcome.

| # | Quest | Animated story |
| --- | --- | --- |
| 1 | 🌐 DNS / HTTPS Networking | One person connects with **four others** (DNS, IP, TLS, HTTPS). Each link activates; all five celebrate **4/4 connected**. |
| 2 | 📡 TCP / UDP | A sender delivers packets over two routes. TCP shows acknowledgment; UDP demonstrates a fast send. |
| 3 | 🗝️ Least Privilege | An employee's admin request is denied, but a read-only request is granted. |
| 4 | 🛠️ Patch Management | An engineer applies a security patch to an at-risk server, then the server becomes protected. |
| 5 | 🔐 Password Hashing | A password combines with a unique salt, becomes a hash, and is stored securely. |
| 6 | 📱 Multi-Factor Authentication | The first factor is checked, then a phone code; only after both does access succeed. |
| 7 | 🛡️ Zero Trust | Identity and device security are verified before a protected service grants access. |
| 8 | 🐧 Linux File Permissions | A Linux user inspects file permissions, executes `chmod 600`, and verifies the restrictive result. |
| 9 | 🎯 Threat Modeling | An analyst identifies a vulnerable asset and incoming threat, then applies a mitigation. |
| 10 | 🎣 Phishing Detection | A suspicious email arrives. The user checks the sender, recognizes the attempt, and reports/removes it without clicking. |
| 11 | 🔺 CIA Triad | Confidentiality, Integrity, and Availability appear in sequence to protect an asset. |
| 12 | 💻 Ethical Security | A researcher confirms authorization, enters a test lab, and completes a safe, scoped security exercise. |

### ⏲️ Timing and distraction control

- **Every 30 minutes:** The learning **quest changes** at fixed local clock slots (:00 and :30). Refreshing the page does not unlock the next quest.
- **Every 5 minutes:** While its quest remains active on a visible blocked YouTube tab, the **same story replays** from the beginning; the educational message does not change.
- **Story length:** Approximately 8–10 seconds; the completed scene stays still between replays.
- **Motion accessibility:** With `prefers-reduced-motion`, scenes show their finished, informative state without animation.
- **Performance/privacy:** The visuals use built-in SVG, CSS, and local JavaScript; no analytics, remote fonts, images, or animation service.

Stories are educational analogies, **not precise simulations of networking protocols**. For instance, the four people in the DNS/HTTPS quest symbolize connected endpoints.

## ✨ Features and what they do

| Feature | What it does | Important details |
| --- | --- | --- |
| 🌿 **Cross-platform Video Wellness Break** | After approximately **60 minutes of visible HTML5 video playback** across YouTube, Facebook, Instagram and TikTok, pauses videos and displays a **2-minute village-themed rest**. | Four 30-second stages: counter-clockwise eye movement, breathing, walking, breathing; shared local timer; does **not** auto-play videos afterward. |
| ⏰ **Scheduled YouTube Access** | Choose **2–3 active schedules** from two built-in (editable, undeletable) slots and up to two custom (removable) slots. | Built-in defaults: **12:00–14:00** and **22:00–23:30**. No overlap between any configured schedules, including unchecked ones. |
| 🚫 **Automatic YouTube Blocker** | Covers YouTube pages with a blocking overlay whenever access is not allowed. | Applies to matching YouTube browser pages; **not** a system-wide block, and it does not block other browsers or apps. |
| ⏳ **Daily Time Budget** | Stops access after your daily allowance is used, even during an allowed window. | Default: **90 minutes/day**; configurable between 1 and 1440 minutes. |
| 📈 **Approximate Usage Tracking** | Displays today's estimated minutes used versus the daily limit. | Counts activity reported by a **focused, visible YouTube tab**. It is **not** exact video playback time; behavior with multiple tabs and background audio can vary. |
| 🌙 **Daily Reset** | Starts a new time budget on a new calendar day. | Uses the device's **local date**, resetting on the first check after local midnight. |
| 🔒 **Strict Mode (7 or 14 days)** | Locks the extension's settings until the lock period ends. | Choose a duration **before** pressing Save. During the lock, settings controls are disabled and the background script rejects changes. |
| 🧠 **Distraction-Free YouTube** | Hides several distracting parts of YouTube while browsing is permitted. | Can be enabled/disabled when settings are unlocked; YouTube interface updates can affect filtering. |
| 🏠 **Hide Homepage Recommendations** | Attempts to hide the rich recommendation grid on the YouTube homepage. | Removes selected page elements from view, not from YouTube's servers. |
| 🎥 **Hide Suggested Videos** | Hides the watch-page suggestion sidebar and certain compact video items. | Direct links, searches and video playback remain available during allowed hours. |
| 💬 **Hide Comments** | Hides the YouTube comments section. | A display-level filter. |
| 📱 **Reduce Shorts Distractions** | Hides selected Shorts shelves and Shorts navigation links. | **Does not comprehensively block every direct Shorts URL** in this version. |
| 🔔 **Hide YouTube Notification Button** | Hides the corresponding YouTube toolbar element. | Does not change YouTube account notifications or Firefox notification permissions. |
| ▶️ **Autoplay Reduction** | Attempts to turn off YouTube's next-video autoplay toggle. | **Best effort**; may not work after all YouTube layout changes. |
| 🧠 **Quest-First Cybersecurity Learning** | The current cybersecurity topic takes center stage with a short illustrated learning story. | New quest every 30 minutes; no manual skip button. |
| 🌌 **Quest-Specific Animated Stories** | All 12 challenges have separate step-by-step visual stories and topic-matched backgrounds. | Each story replays every 5 minutes when its blocked tab is visible; respects reduced-motion preferences. |
| 📐 **Responsive Blocking Screen** | Adjusts art, typography, spacing and content placement for narrow or short Firefox windows. | On extremely small windows, page scrolling remains available; respects reduced-motion preferences. |
| 🎨 **Cybersecurity Training Screen** | Replaces the older cartoon guard with a cybersecurity-focused visual display and understated access countdown. | When the daily budget is exhausted, the access panel displays **TOMORROW**. |
| 🛡️ **ScrollSentinel Shield Icon** | A shield surrounding stylized scrolling feed lines and a lock identifies ScrollSentinel. | PNG icons in six sizes for Firefox and retained SVG source in `icons/scrollsentinel.svg`. |
| 🧩 **Compact Firefox Toolbar Popup** | Shows focus status, today's usage, screen-break countdown and selected viewing windows, with quick YouTube protection and Distraction-Free toggles. | Quick controls save immediately unless Strict Mode is active. Choose **Advanced schedules & settings** for the full editor. |
| ⚙️ **Full-Tab Settings Editor** | Edit or delete custom schedules, manage all four time slots, daily limit and Strict Mode in a spacious responsive layout. | Native AM/PM time picker replaced with 24-hour HH:MM fields. Strict Mode requires **inline acknowledgment**, no nested popup confirmation dialog. |
| 🔐 **Local-Only Settings** | Stores the schedule, lock expiration and estimated usage in Firefox's extension storage. | No external analytics server is used by the extension. |

### Example daily schedule

| Local time | YouTube |
| --- | --- |
| 12:00 AM–12:00 PM | 🔴 Blocked |
| 12:00 PM–2:00 PM | 🟢 Allowed **if daily budget remains** |
| 2:00 PM–10:00 PM | 🔴 Blocked |
| 10:00 PM–11:30 PM | 🟢 Allowed **if daily budget remains** |
| 11:30 PM–12:00 AM | 🔴 Blocked |

The allowed windows total **3 hours 30 minutes**, but the default **90-minute daily budget** can end access earlier. Both conditions must be satisfied for YouTube to be accessible.

### Strict Mode is not tamper-proof

Strict Mode prevents changes **through this extension's interface** until the chosen time expires. It **cannot** prevent you from disabling/uninstalling the add-on in Firefox, deleting its stored data, using another Firefox profile/browser, changing the computer clock, or editing local source code. It is a self-discipline aid, **not an anti-uninstall or parental-control security guarantee**.

## 🦊 Installation

### Option A — Temporary installation (available now; best for testing)

**Requirements:** Desktop Firefox and a downloaded copy of the repository. No Mozilla account or signing required.

1. Open this repository: [github.com/Sayeed843/scrollsentinel](https://github.com/Sayeed843/scrollsentinel).
2. Click **Code → Download ZIP** and **extract** the ZIP, or clone it:
   ```bash
   git clone https://github.com/Sayeed843/scrollsentinel.git
   cd scrollsentinel
   ```
3. In Firefox, enter **`about:debugging#/runtime/this-firefox`** in the address bar.
4. Click **Load Temporary Add-on…**.
5. Select the extracted project's **`manifest.json`** file.
6. Open the **Extensions** (puzzle-piece) menu, choose **ScrollSentinel**. Use the compact popup to check status or change a quick toggle, then choose **Advanced schedules & settings** to edit schedules and save changes.

**Reminder:** Temporary add-ons are unloaded when you **restart Firefox**. To test again, repeat steps 3–5. In `about:debugging`, use **Reload** after you edit the extension's source files.

**Mozilla reference:** [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).

### Option B — Permanent installation from Mozilla Add-ons (when published)

**ScrollSentinel v2.5.3 is already publicly available** from [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/scrollsentinel/). The newer v2.8.0 features are not included in that Store build until a new version is approved. To install the current public version:

1. Open its official **addons.mozilla.org** listing.
2. Click **Add to Firefox**.
3. Review the permissions and click **Add**.
4. Open the extension's toolbar popup and configure it.

A listed, signed extension remains installed across Firefox restarts; approved updates are distributed through Mozilla Add-ons. **Official listing:** https://addons.mozilla.org/en-US/firefox/addon/scrollsentinel/.

**Mozilla reference:** [Signing and distributing add-ons](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

### Option C — Permanent installation using a signed XPI (self-distribution, when available)

A developer may submit an add-on for **unlisted/self-distribution** signing instead of a public store listing. Once a **Mozilla-signed `.xpi`** has actually been released:

1. Download the **signed** `.xpi` from the developer's official release location.
2. Open **`about:addons`** in desktop Firefox.
3. Click the **gear icon → Install Add-on From File…**.
4. Select the signed `.xpi` and approve the permission prompt.

This installation persists after Firefox restarts. **An unsigned ZIP or an XPI made by simply renaming a ZIP will not permanently install in standard Firefox.** Self-distributed versions need a separately configured update path or users must install newer signed versions manually.

**Mozilla references:** [Self-distribution](https://extensionworkshop.com/documentation/publish/self-distribution/) · [Add-on signing](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox).

### For developers: validate and package

With Node.js/npm installed, from the repository directory:

```bash
npm install --global web-ext
web-ext lint
web-ext build
```

`web-ext build` creates a **package for submission/testing**, **not a signed permanent-install file**. Mozilla signing and any required validation/review are still necessary.

## ⚙️ Settings quick start

1. Open the **ScrollSentinel** toolbar popup to see whether YouTube is allowed now, how much daily viewing time remains, and the next video-break countdown.
2. Switch YouTube schedule protection or Distraction-Free mode on/off directly in the popup. **Quick toggles save automatically** and become read-only during Strict Mode.
3. Click **Advanced schedules & settings** in the popup. Firefox opens the full Settings page in a normal browser tab.
4. Keep/edit your original two schedule slots, optionally add up to two removable custom schedules and select **2 or 3** windows. Enter times using **24-hour HH:MM**. Resolve any overlapping time ranges (even disabled windows).
5. Choose your daily YouTube browsing limit (default **90 minutes**).
6. Optionally select Strict Mode for **7 or 14 days**. The full Settings page will require you to check an **inline acknowledgment** explaining the lock. Avoid activating Strict Mode until you've tested your schedule.
7. Click **Save changes**. The extension validates all changes again in its background code and reports any problems.

The small popup intentionally does **not** contain oversized time inputs, a complete schedule form or a nested confirmation dialog.

## 📁 Project structure

```text
scrollsentinel/
├── manifest.json    # ScrollSentinel metadata and permissions
├── schedule.js      # Shared 2–3-selection and nonoverlapping time validation
├── break-core.js    # Shared 60-minute / 2-minute persistent timer state machine
├── break-visual.js  # Locally rendered countryside and exercise animations
├── break.js         # Detect video playback, pause and show wellness overlay
├── background.js    # Active schedule enforcement, video break accounting and Strict Mode
├── quest-stories.js # 11 illustrated story scenes; Networking lives in guard.js
├── guard.js         # YouTube overlay, 30-minute quests, 5-minute story replays
├── popup.html       # Compact quick-status popup
├── options.html     # Full-tab, responsive schedule and settings editor
├── icons/
│   ├── scrollsentinel.svg # Original vector source
│   └── scrollsentinel-{16,32,48,64,96,128}.png # Browser icons
├── popup.js         # Quick toggle actions and Open Settings
├── options.js       # Schedule editor, validation and Strict Mode consent
├── tests/
│   ├── quest-stories.test.cjs # Dependency-free story and timing checks
│   ├── schedule.test.cjs      # 4-slot editing, overlap and time-selection checks
│   ├── video-break.test.cjs   # Video budget, break phases and integration checks
│   ├── video-break-runtime.test.cjs # Browser-messaging integration tests
│   └── ui.test.cjs            # Compact popup, options and Strict Mode UI tests
├── .github/workflows/
│   ├── quality.yml         # Automated JavaScript tests
│   └── amo-package.yml    # Mozilla upload ZIP and lint
├── README.md        # Documentation
├── LICENSE          # MIT license
└── .gitignore       # Ignored build artifacts
```

## 🧪 Automated quality checks

GitHub Actions validates JavaScript syntax and runs the dependency-free Node test suite on pushes and pull requests.

[![ScrollSentinel JavaScript QA](https://github.com/Sayeed843/scrollsentinel/actions/workflows/quality.yml/badge.svg)](https://github.com/Sayeed843/scrollsentinel/actions/workflows/quality.yml)

To run the same story tests locally (requires Node.js):

```bash
node --test tests/*.test.cjs
```

**These are source-level tests, not a substitute for testing the extension in a live Firefox session.**

## 🔍 Known limitations & testing

The currently public **Mozilla Add-ons release is v2.5.3**, but **v2.8.0 is still a GitHub development version**. JavaScript source checks and automated tests run using `node --test tests/*.test.cjs`; **full real-browser acceptance testing on the four supported websites has not been completed**. Before submitting a new Mozilla release, verify:

- Time transitions for default and custom schedules, including unchecked windows, boundaries touching without overlap, and overnight intervals.
- Prevention of overlaps between any configured schedules (even unchecked ones), and preventing edits/deletes during Strict Mode.
- Editing both original schedules without the possibility to delete them, deleting optional custom schedules, 2–3 selected checkboxes, and migrating v2.5.3 settings.
- Budget consumption and blocking when the 90-minute limit is reached.
- Reset on the next local calendar day.
- Strict Mode lock behavior, expiry, and Firefox restart behavior (using a signed install when available).
- Multiple tabs, window focus, background audio/video and single-page YouTube navigation.
- Break activation after 60 minutes combined active video across all four sites; play/pause and focused-tab counting.
- Automatic pausing in videos and compatible iframes; trying to restart video during the 2-minute rest.
- The village scene, face eye rotation, four 30-second stages, countdown, reduced-motion preference and narrow-screen layout.
- Time continuing across refreshes, switching platforms, Firefox restarts and after two minutes have elapsed.
- Whether the YouTube filters still work after interface updates.
- All 12 visual stories at narrow and short viewport sizes, five-minute replay timing, reduced-motion preference, and tab visibility changes.

YouTube may change HTML selectors; the filters and autoplay reduction are best effort. The blocker is a **page overlay**; it does not block mobile YouTube apps or network traffic.

## 🛡️ Privacy

Settings, lock information, approximate YouTube usage and the cross-platform video watch/rest timers are stored **locally** in Firefox extension storage. This project does not implement user accounts, remote telemetry or an analytics backend. YouTube itself may still collect data when you browse its service. Review the code and permissions before installing.

## 🤖 AI assistance acknowledgment

**This project was planned and developed with the assistance of ChatGPT by OpenAI.** ChatGPT helped design and generate the extension code, feature behavior and documentation. The repository owner is responsible for reviewing, testing, maintaining and publishing the software. AI-generated code may contain mistakes.

## 📄 License

Released under the **MIT License**. See [LICENSE](LICENSE).

---

**GitHub repository:** The official project repository is [Sayeed843/scrollsentinel](https://github.com/Sayeed843/scrollsentinel).

**Source code:** [Sayeed843/scrollsentinel](https://github.com/Sayeed843/scrollsentinel) · **Issues and feedback:** [GitHub Issues](https://github.com/Sayeed843/scrollsentinel/issues)
