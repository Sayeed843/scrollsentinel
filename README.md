# 🎯 YouTube Focus Hours

**A Firefox extension that helps you use YouTube on your schedule—not YouTube's.**

YouTube Focus Hours combines **scheduled access**, an **estimated daily browsing-time limit**, **7- or 14-day Strict Mode**, and a **Distraction-Free YouTube** view. It is open source and stores its settings locally.

> **Project status:** Development prototype (v2.1.0). The code is on GitHub, but **no Mozilla-signed public or unlisted release has been published yet**. See [Installation](#-installation) for what works now and how permanent installation will work after signing.

## ✨ Features and what they do

| Feature | What it does | Important details |
| --- | --- | --- |
| ⏰ **Scheduled YouTube Access** | Allows YouTube only during the daily time windows you set and shows a blocking screen outside them. | Defaults: **12:00 PM–2:00 PM** and **10:00 PM–11:30 PM**, local computer time. Two windows are supported in the current popup. |
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
| 🎭 **Animated Security Guard Block Page** | A playful animated firewall scene shows a security guard turning away a distracted visitor, with an access-denied sign and live countdown to the next access window. | Animations respect reduced-motion accessibility preferences. When the daily budget is exhausted, the page shows **TOMORROW** instead of the next window countdown. |
| 🛡️ **Custom Shield Extension Icon** | A shield with a play symbol and padlock identifies the add-on in Firefox. | Lightweight SVG asset in `icons/focus-shield.svg`. |
| 🧩 **Firefox Toolbar Popup** | Shows access status, time used, viewing windows, daily limit, filter switch and Strict Mode controls. | Settings are saved with **Save settings**. |
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

1. Open this repository: [github.com/Sayeed843/youtube-focus-hours](https://github.com/Sayeed843/youtube-focus-hours).
2. Click **Code → Download ZIP** and **extract** the ZIP, or clone it:
   ```bash
   git clone https://github.com/Sayeed843/youtube-focus-hours.git
   cd youtube-focus-hours
   ```
3. In Firefox, enter **`about:debugging#/runtime/this-firefox`** in the address bar.
4. Click **Load Temporary Add-on…**.
5. Select the extracted project's **`manifest.json`** file.
6. Open the **Extensions** (puzzle-piece) menu, choose **YouTube Focus Hours**, adjust your settings, and click **Save settings**.

**Reminder:** Temporary add-ons are unloaded when you **restart Firefox**. To test again, repeat steps 3–5. In `about:debugging`, use **Reload** after you edit the extension's source files.

**Mozilla reference:** [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).

### Option B — Permanent installation from Mozilla Add-ons (when published)

**This option is not available for this project yet.** After the extension passes Mozilla's submission/review process and receives a **public listing**, users will be able to:

1. Open its official **addons.mozilla.org** listing.
2. Click **Add to Firefox**.
3. Review the permissions and click **Add**.
4. Open the extension's toolbar popup and configure it.

A listed, signed extension remains installed across Firefox restarts; approved updates are distributed through Mozilla Add-ons. **There is no official listing link for this project at present.**

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

1. Toggle **Enable blocking** on.
2. Set the first and second allowed viewing windows (or leave the defaults).
3. Choose the **daily minute limit** (default: 90).
4. Enable **Distraction-Free YouTube** if you want to reduce recommendations, comments and suggested videos.
5. For Strict Mode, choose **No lock**, **7 days**, or **14 days**.
6. Click **Save settings**. A 7- or 14-day lock requires confirmation and then prevents editing settings inside the popup until it expires.

**Tip:** Test your schedule **without** Strict Mode first. Strict Mode cannot be reversed through the popup before expiry.

## 📁 Project structure

```text
youtube-focus-hours/
├── manifest.json    # WebExtension metadata and permissions
├── background.js    # Time windows, usage budget, local state and Strict Mode
├── guard.js         # YouTube overlay, activity reports and UI filtering
├── popup.html       # Popup user interface
├── icons/
│   └── focus-shield.svg # Extension icon
├── popup.js         # Popup behavior and settings management
├── README.md        # Documentation
├── LICENSE          # MIT license
└── .gitignore       # Ignored build artifacts
```

## 🔍 Known limitations & testing

This is an **early development version**, **not** a verified Mozilla Add-ons release. No automated browser acceptance test suite has been run. Before relying on it, please test:

- Time transitions at **12:00**, **14:00**, **22:00**, and **23:30** in your local time zone.
- Budget consumption and blocking when the 90-minute limit is reached.
- Reset on the next local calendar day.
- Strict Mode lock behavior, expiry, and Firefox restart behavior (using a signed install when available).
- Multiple tabs, window focus, background audio/video and single-page YouTube navigation.
- Whether the YouTube filters still work after interface updates.

YouTube may change HTML selectors; the filters and autoplay reduction are best effort. The blocker is a **page overlay**; it does not block mobile YouTube apps or network traffic.

## 🛡️ Privacy

Settings, lock information and approximate usage counters are stored **locally** in Firefox extension storage. This project does not implement user accounts, remote telemetry or an analytics backend. YouTube itself may still collect data when you browse its service. Review the code and permissions before installing.

## 🤖 AI assistance acknowledgment

**This project was planned and developed with the assistance of ChatGPT by OpenAI.** ChatGPT helped design and generate the extension code, feature behavior and documentation. The repository owner is responsible for reviewing, testing, maintaining and publishing the software. AI-generated code may contain mistakes.

## 📄 License

Released under the **MIT License**. See [LICENSE](LICENSE).

---

**Source code:** [Sayeed843/youtube-focus-hours](https://github.com/Sayeed843/youtube-focus-hours) · **Issues and feedback:** [GitHub Issues](https://github.com/Sayeed843/youtube-focus-hours/issues)
