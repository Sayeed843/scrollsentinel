const api = browser;
let state = null;
let overlay = null;
let countdownNode = null;
let subtitleNode = null;
let windowsNode = null;
let statusNode = null;

const distractionSelectors = [
  'ytd-rich-grid-renderer', 'ytd-rich-section-renderer',
  'ytd-watch-next-secondary-results-renderer', 'ytd-comments',
  'ytd-reel-shelf-renderer', 'ytd-guide-entry-renderer a[href^="/shorts"]',
  'ytd-mini-guide-entry-renderer a[href^="/shorts"]',
  'ytd-notification-topbar-button-renderer', 'ytd-compact-video-renderer'
];
const filterStyle = document.createElement('style');
filterStyle.id = 'focus-hours-filter';
filterStyle.textContent = distractionSelectors.join(',') + '{display:none!important}';

// Keep styles in the isolated extension shadow root so YouTube cannot accidentally
// restyle the blocker and its CSS does not bleed into the rest of YouTube.
const pageCSS = "\n:host{all:initial}*{box-sizing:border-box}.scene{font-family:Inter,system-ui,-apple-system,sans-serif;min-height:100vh;background:radial-gradient(ellipse at 28% 80%,#1c2c45 0,transparent 48%),#090f1b;color:#f7fbff;overflow:auto;position:relative;display:flex;justify-content:center;align-items:center}.scene:before{content:\"\";pointer-events:none;position:absolute;inset:0;background:linear-gradient(90deg,transparent 0 97%,#35bbf508 98%);background-size:60px 60px;opacity:.45}.layout{width:min(1120px,94vw);position:relative;padding:46px 12px 24px}.brand{text-align:center}.badge{font-size:40px;filter:drop-shadow(0 0 15px #35bdf580);animation:float 4s ease-in-out infinite}.eyebrow{font-size:11px;letter-spacing:3px;color:#53c9ed;margin:10px 0}.brand h1{font-size:clamp(28px,3.5vw,52px);margin:4px 0 8px;line-height:1.1}.brand em{font-style:normal;color:#43c6fc}.tagline{color:#b7c4d4;font-size:clamp(13px,1.4vw,16px)}.columns{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:clamp(18px,4vw,80px);margin-top:35px}.art{height:335px;position:relative;isolation:isolate}.floor{position:absolute;bottom:19px;left:1%;width:98%;height:3px;background:linear-gradient(90deg,transparent,#68acdd70,transparent)}.door{position:absolute;bottom:25px;right:10%;width:43%;height:250px;border:8px solid #334964;border-radius:20px;background:radial-gradient(circle,#3f5269,#172439 75%);box-shadow:0 0 0 5px #0e1b2a,0 0 30px #ef455b35;overflow:hidden;animation:warning 3s ease-in-out infinite}.door:before{content:\"\";position:absolute;inset:5px;border:2px dashed #f94d69a6;border-radius:10px}.play{position:absolute;top:35%;left:33%;background:#ff3d56;border-radius:19px;padding:18px 24px;color:white;font-size:36px;box-shadow:0 5px 30px #ff3d5655}.lock{position:absolute;top:0;right:5px;font-size:32px}.scan{position:absolute;left:0;right:0;height:3px;background:#5ed9ff;box-shadow:0 0 12px #5ed9ff;animation:scan 4s linear infinite}.stop{position:absolute;bottom:42px;right:4%;background:#e73a56;color:#fff;font-weight:900;letter-spacing:1px;line-height:1.2;padding:18px 9px;border-radius:50%;border:5px solid white;box-shadow:0 5px 20px #e73a5680;text-align:center;font-size:13px;z-index:4;animation:tilt 3s ease-in-out infinite}.guard{position:absolute;bottom:30px;left:29%;width:125px;height:200px;z-index:3;animation:float 3.5s ease-in-out infinite}.cap{position:absolute;left:19px;top:4px;background:#2357a2;border:4px solid #368ff1;color:#ffc93c;border-radius:55% 55% 12% 12%;text-align:center;font-size:20px;width:88px;height:36px;z-index:2}.guard-head{position:absolute;top:30px;left:23px;width:84px;height:78px;background:#f7ae82;border-radius:40%;border:5px solid #132438;display:grid;place-items:center}.guard-head span{color:#121822;font-weight:bold;font-size:20px;white-space:nowrap;transform:rotate(-5deg)}.guard-body{position:absolute;bottom:0;left:9px;height:98px;width:107px;background:#2863aa;border:5px solid #183e71;border-radius:25px 25px 15px 15px;display:grid;place-items:center;font-size:48px;color:#ffda61}.guard-arm{position:absolute;top:104px;left:90px;z-index:4;transform:rotate(-30deg);font-size:35px;animation:halt 2s ease-in-out infinite}.intruder{position:absolute;bottom:30px;left:3%;height:180px;width:120px;animation:sneak 2s ease-in-out infinite}.hood{position:absolute;top:36px;left:5px;width:102px;height:104px;border-radius:50% 50% 40% 40%;background:#252d3b;border:7px solid #46536c;display:grid;place-items:center;z-index:1}.face{width:74px;height:65px;background:#1b2331;border-radius:40%;display:flex;align-items:center;justify-content:center;gap:13px}.face i{display:block;width:14px;height:20px;border-radius:50%;background:white;position:relative}.face i:after{content:\"\";position:absolute;top:8px;left:6px;width:5px;height:8px;border-radius:50%;background:#111}.intruder-body{position:absolute;bottom:0;left:10px;height:70px;width:100px;border-radius:40px 40px 10px 10px;background:#202937;border:4px solid #43516c}.bubble{position:absolute;top:0;left:0;width:140px;padding:9px 8px;background:#f0f6ff;color:#17283d;border-radius:14px;text-align:center;font-weight:700;font-size:12px;z-index:3;transform:rotate(-7deg)}.info{padding:8px;min-width:0}.blocked{color:#ff6980;font-size:12px;font-weight:800;letter-spacing:1.8px}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff415d;margin-right:7px;box-shadow:0 0 10px #ff415d;animation:blink 1.5s linear infinite}.info h2{font-size:clamp(24px,2.7vw,35px);line-height:1.25;margin:20px 0 22px;font-weight:750}.count-card{border:1px solid #34526b;border-radius:16px;padding:21px 24px;background:#122034;box-shadow:inset 0 0 24px #122d4622}.count-label{color:#abbfd1;font-size:12px;letter-spacing:1.3px;font-weight:700}.count{font-size:clamp(29px,4.6vw,58px);color:#55cfff;font-weight:800;letter-spacing:3px;font-variant-numeric:tabular-nums;text-shadow:0 0 20px #4bbcff40;margin-top:5px}.windows{margin-top:25px}.windows strong{font-size:12px;color:#b8c6d8;letter-spacing:1px}.window{margin-top:10px;color:#90e9b5;font-size:17px}.extra{font-size:14px;color:#aebacc;margin-top:26px}footer{text-align:center;margin-top:24px;color:#8296a8;font-size:10px;letter-spacing:1px}footer span{color:#9ee6b5}@keyframes sneak{0%,100%{transform:translateX(0) rotate(0)}50%{transform:translateX(11px) rotate(4deg)}}@keyframes halt{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(-17deg)}}@keyframes scan{0%{top:0}100%{top:100%}}@keyframes warning{0%,100%{box-shadow:0 0 20px #ee365230}50%{box-shadow:0 0 30px #ed365280}}@keyframes tilt{0%,100%{transform:rotate(3deg)}50%{transform:rotate(-3deg)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@media(max-width:760px){.scene{display:block}.layout{padding:22px 10px}.columns{grid-template-columns:1fr;gap:14px;margin-top:10px}.art{height:215px;width:min(430px,100%);margin:auto;transform:scale(.75);transform-origin:center center;margin-bottom:-45px}.info{max-width:500px;margin:auto;text-align:center}.info h2{margin:15px 0}.count-card{padding:15px}.tagline{margin:8px auto}.windows{margin-top:15px}.extra{margin-top:15px}footer{margin-top:20px}}@media(max-height:570px) and (min-width:761px){.layout{padding:12px}.columns{margin-top:5px}.art{transform:scale(.82);transform-origin:center}.brand h1{font-size:28px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}\n";

function timeUntilNextWindow(windows) {
  if (!Array.isArray(windows) || !windows.length) return null;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const starts = windows.map(w => {
    if (!/^\d\d:\d\d$/.test(w.start)) return Infinity;
    const [h, m] = w.start.split(':').map(Number);
    if (h > 23 || m > 59) return Infinity;
    const start = h * 60 + m;
    return ((start - current + 1440) % 1440) * 60;
  });
  return Math.min(...starts);
}
function formatCountdown(seconds) {
  if (!Number.isFinite(seconds)) return '—';
  seconds = Math.max(0, Math.ceil(seconds));
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return h + ':' + m + ':' + s;
}
function createOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'focus-hours-overlay';
  overlay.style.cssText = 'position:fixed!important;inset:0!important;z-index:2147483647!important;display:block!important;background:#090f1b!important;color:#fff!important;';
  const shadow = overlay.attachShadow({mode:'closed'});
  const style = document.createElement('style');
  style.textContent = pageCSS;
  shadow.appendChild(style);
  const panel = document.createElement('div');
  panel.className = 'scene';
  panel.innerHTML = 
    '<div class="stars" aria-hidden="true"></div>' +
    '<main class="layout" role="main">' +
      '<div class="brand"><div class="badge">🛡️</div><div class="eyebrow">FIREWALL ACTIVE • FOCUS PROTECTED</div><h1>YouTube <em>Focus Hours</em></h1>' +
      '<p class="tagline">The temptation has been denied by your personal firewall.</p></div>' +
      '<div class="columns"><div class="art" aria-hidden="true">' +
         '<div class="intruder"><div class="bubble">Just one video? 🥺</div><div class="hood"><div class="face"><i></i><i></i></div></div><div class="intruder-body"></div></div>' +
         '<div class="guard"><div class="cap">★</div><div class="guard-head"><span>⌐■_■</span></div><div class="guard-body">🛡</div><div class="guard-arm">✋</div></div>' +
         '<div class="door"><div class="scan"></div><div class="play">▶</div><div class="lock">🔒</div></div>' +
         '<div class="stop">ACCESS<br>DENIED</div><div class="floor"></div></div>' +
      '<section class="info" aria-label="Blocking status"><div class="blocked"><span class="dot"></span>PROTECTED SESSION</div>' +
         '<h2 id="fh-message">YouTube is outside your allowed viewing hours.</h2>' +
         '<div class="count-card"><div class="count-label">⏱ NEXT VIEWING WINDOW IN</div><div class="count" id="fh-count" role="timer">--:--:--</div></div>' +
         '<div class="windows"><strong>YOUR ACCESS WINDOWS</strong><div id="fh-windows"></div></div>' +
         '<p id="fh-extra" class="extra">Your focus is doing great work. Keep it up! 🚀</p></section></div>' +
      '<footer>SECURITY STATUS: <span>FOCUS MODE ENABLED</span> · No distractions beyond this point 🕶️</footer></main></div>';
  shadow.appendChild(panel);
  countdownNode = shadow.getElementById('fh-count');
  subtitleNode = shadow.getElementById('fh-message');
  windowsNode = shadow.getElementById('fh-windows');
  statusNode = shadow.getElementById('fh-extra');
  document.documentElement.appendChild(overlay);
}
function tickCountdown() {
  if (!state || !overlay) return;
  if (state.scheduled && state.enabled && state.budgetLeft <= 0) {
    countdownNode.textContent = 'TOMORROW';
    return;
  }
  const seconds = timeUntilNextWindow(state.windows);
  countdownNode.textContent = formatCountdown(seconds);
}
function update(nextState) {
  if (!nextState) return;
  state = nextState;
  if (state.distractionFree) {
    if (!filterStyle.isConnected) document.documentElement.appendChild(filterStyle);
  } else filterStyle.remove();

  if (state.allowed) {
    if (overlay) {overlay.remove();overlay = null;}
    document.documentElement.style.removeProperty('overflow');
    return;
  }
  if (!overlay) createOverlay();
  subtitleNode.textContent = state.scheduled
    ? 'Daily viewing budget exhausted. Firewall says: nice try! 😎'
    : 'YouTube is outside your allowed viewing hours.';
  statusNode.textContent = state.scheduled
    ? 'Your browsing budget resets after local midnight. Go recharge offline! 🌙'
    : 'Relax, the internet will still be here later. Your focus matters! 🚀';
  windowsNode.replaceChildren();
  for (const w of state.windows) {
    const item = document.createElement('div');
    item.className = 'window';
    item.textContent = '✓  ' + w.start + ' – ' + w.end;
    windowsNode.appendChild(item);
  }
  tickCountdown();
  document.documentElement.style.setProperty('overflow', 'hidden', 'important');
}
async function refresh() {
  try { update(await api.runtime.sendMessage({type:'status'})); } catch (_) {}
}
api.runtime.onMessage.addListener(message => {
  if (message.type === 'check') update(message.state);
});
refresh();
setInterval(refresh, 10000);
setInterval(tickCountdown, 1000);
setInterval(async () => {
  if (state?.allowed && state.enabled &&
      document.visibilityState === 'visible' && document.hasFocus()) {
    try {update(await api.runtime.sendMessage({type:'activity'}));} catch (_) {}
  }
}, 1000);
new MutationObserver(() => {
  if (state && !state.allowed && overlay && !overlay.isConnected) document.documentElement.appendChild(overlay);
  if (state?.distractionFree && !filterStyle.isConnected) document.documentElement.appendChild(filterStyle);
}).observe(document.documentElement, {childList:true});
setInterval(() => {
  if (!state?.distractionFree) return;
  const toggle = document.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]');
  if (toggle) toggle.click();
}, 2500);
