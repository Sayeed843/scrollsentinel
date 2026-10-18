const api = browser;
let state = null;
let overlay = null;
let countdownNode = null;
let subtitleNode = null;
let windowsNode = null;
let statusNode = null;
let motivationTextNode = null;
let motivationHintNode = null;
let motivationIndex = 0;
const cyberChallenges = [
  ['Your next skill unlock: Networking.', 'Try learning what DNS does and why HTTPS matters.'],
  ['Firewall says NO to distractions, YES to skills.', 'Spend 10 minutes understanding TCP vs. UDP.'],
  ['Become the defender, not the doom-scroller.', 'Read about the principle of least privilege.'],
  ['Patch your knowledge before your next break.', 'Learn why software updates close security vulnerabilities.'],
  ['One more video? Access denied. One more skill? Granted!', 'Explore hashing and why passwords should be salted.'],
  ['A security mindset starts with curiosity.', 'Find out how multi-factor authentication works.'],
  ['Your focus is protected like a zero-trust network.', 'Learn the meaning of verify explicitly.'],
  ['Trade 15 minutes of scrolling for a Linux command.', 'Practice ls, grep, or chmod in your own terminal.'],
  ['A little threat modeling beats endless scrolling.', 'Identify an asset, a threat, and a possible mitigation.'],
  ['The strongest firewall is your attention.', 'Discover what phishing looks like and how to spot it.'],
  ['Today’s side quest: learn a security acronym.', 'Start with CIA: Confidentiality, Integrity, Availability.'],
  ['Hack your habits, not somebody else’s system. 😎', 'Practice cybersecurity only in systems you own or are authorized to test.']
];
// Fixed half-hour slots mean refreshing the page cannot unlock a new tip.
const MOTIVATION_INTERVAL_MS = 30 * 60 * 1000;
let motivationSlot = null;
let motivationCardNode = null;
function showMotivationForCurrentSlot() {
  if (!overlay || !motivationTextNode || !motivationHintNode) return;
  const slot = Math.floor(Date.now() / MOTIVATION_INTERVAL_MS);
  if (slot === motivationSlot) return;
  motivationSlot = slot;
  motivationIndex = ((slot % cyberChallenges.length) + cyberChallenges.length) % cyberChallenges.length;
  motivationTextNode.textContent = cyberChallenges[motivationIndex][0];
  motivationHintNode.textContent = cyberChallenges[motivationIndex][1];
  showQuestVisual(motivationIndex);
  if (motivationCardNode) {
    motivationCardNode.classList.remove('motivation-reveal');
    void motivationCardNode.offsetWidth;
    motivationCardNode.classList.add('motivation-reveal');
  }
}



/* Each challenge has its own visual language, not merely a different quote.
   All effects are local CSS/SVG: no animation libraries or external requests. */
const questThemes = [
  {name:'DNS / HTTPS', icon:'🌐', main:'DNS → IP', detail:'HTTPS · TLS', hue:'cyan', effect:'network'},
  {name:'TCP / UDP', icon:'📡', main:'SYN → SYN-ACK → ACK', detail:'TCP · reliable delivery', hue:'blue', effect:'packets'},
  {name:'LEAST PRIVILEGE', icon:'🗝️', main:'DENY BY DEFAULT', detail:'Only the access you need', hue:'gold', effect:'access'},
  {name:'PATCH MANAGEMENT', icon:'🛠️', main:'v1.0 → v1.1', detail:'Close vulnerabilities early', hue:'green', effect:'patch'},
  {name:'PASSWORD HASHING', icon:'🔐', main:'password + salt', detail:'SHA-256 · one-way concept', hue:'violet', effect:'hash'},
  {name:'MULTI-FACTOR AUTH', icon:'📱', main:'FACTOR 1 + FACTOR 2', detail:'Something you know + have', hue:'gold', effect:'mfa'},
  {name:'ZERO TRUST', icon:'🛡️', main:'VERIFY EVERY REQUEST', detail:'Never trust automatically', hue:'cyan', effect:'shield'},
  {name:'LINUX TERMINAL', icon:'⌨️', main:'$ chmod 600 secret', detail:'Permissions · owner only', hue:'green', effect:'terminal'},
  {name:'THREAT MODELING', icon:'🎯', main:'ASSET → THREAT → CONTROL', detail:'Understand risks', hue:'red', effect:'radar'},
  {name:'PHISHING DETECTION', icon:'🎣', main:'SUSPICIOUS LINK', detail:'Inspect sender & domain', hue:'red', effect:'phishing'},
  {name:'CIA TRIAD', icon:'🔺', main:'C  ·  I  ·  A', detail:'Confidentiality · Integrity · Availability', hue:'violet', effect:'triad'},
  {name:'ETHICAL SECURITY', icon:'💻', main:'AUTHORIZED TESTING', detail:'Build skills responsibly', hue:'blue', effect:'code'}
];
let fxLayerNode = null;
let questThemeNode = null;
let questGraphicNode = null;
function showQuestVisual(index) {
  if (!fxLayerNode || !questGraphicNode) return;
  const theme = questThemes[index];
  const scene = questGraphicNode.closest('.scene');
  if (scene) {
    scene.dataset.quest = theme.effect;
    scene.dataset.hue = theme.hue;
  }
  if (questThemeNode) questThemeNode.textContent = theme.icon + ' ' + theme.name;
  // Assign text using textContent; visuals use only built-in SVG shapes.
  questGraphicNode.replaceChildren();
  const symbol = document.createElement('div');
  symbol.className = 'quest-symbol';
  symbol.textContent = theme.icon;
  const key = document.createElement('div');
  key.className = 'quest-key';
  key.textContent = theme.main;
  const detail = document.createElement('div');
  detail.className = 'quest-detail';
  detail.textContent = theme.detail;
  const sceneTitle = document.createElement('div');
  sceneTitle.className = 'quest-graphic-label';
  sceneTitle.textContent = 'VISUAL SIMULATION // ' + theme.name;
  questGraphicNode.append(sceneTitle, symbol, key, detail);

  fxLayerNode.replaceChildren();
  const items = theme.effect === 'network' ? ['DNS','TLS','443','🔒','IP','DNS'] :
    theme.effect === 'packets' ? ['SYN','ACK','TCP','UDP','ACK'] :
    theme.effect === 'access' ? ['403','✓','DENY','READ','✓'] :
    theme.effect === 'patch' ? ['PATCH','✓','v1.1','✓','CVE'] :
    theme.effect === 'hash' ? ['a4f2','9c1b','SHA','0f2a','b3e8'] :
    theme.effect === 'mfa' ? ['OTP','••••','2FA','✓','🔑'] :
    theme.effect === 'shield' ? ['VERIFY','✓','🔒','TRUST?','✓'] :
    theme.effect === 'terminal' ? ['> grep', '$ ls', 'chmod', 'sudo?', '$ whoami'] :
    theme.effect === 'radar' ? ['ASSET','RISK','THREAT','CTRL'] :
    theme.effect === 'phishing' ? ['⚠','URL?','SENDER','⚠','VERIFY'] :
    theme.effect === 'triad' ? ['C','I','A','C','I','A'] :
    ['sudo','{ }','✓','SSH','SECURE'];
  items.forEach((value,i) => {
    const item = document.createElement('span');
    item.className = 'cyber-particle';
    item.textContent = value;
    item.style.setProperty('--n',i);
    item.style.left = (8 + ((i*17 + 9)%82)) + '%';
    item.style.top = (14 + ((i*23 + 7)%67)) + '%';
    item.style.animationDelay = (-i * 1.7) + 's';
    fxLayerNode.appendChild(item);
  });
}

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
const pageCSS = "\n:host{all:initial}*{box-sizing:border-box}.scene{font-family:Inter,system-ui,-apple-system,sans-serif;min-height:100vh;background:radial-gradient(ellipse at 28% 80%,#1c2c45 0,transparent 48%),#090f1b;color:#f7fbff;overflow:auto;position:relative;display:flex;justify-content:center;align-items:center}.scene:before{content:\"\";pointer-events:none;position:absolute;inset:0;background:linear-gradient(90deg,transparent 0 97%,#35bbf508 98%);background-size:60px 60px;opacity:.45}.layout{width:min(1120px,94vw);position:relative;padding:46px 12px 24px}.brand{text-align:center}.badge{font-size:40px;filter:drop-shadow(0 0 15px #35bdf580);animation:float 4s ease-in-out infinite}.eyebrow{font-size:11px;letter-spacing:3px;color:#53c9ed;margin:10px 0}.brand h1{font-size:clamp(28px,3.5vw,52px);margin:4px 0 8px;line-height:1.1}.brand em{font-style:normal;color:#43c6fc}.tagline{color:#b7c4d4;font-size:clamp(13px,1.4vw,16px)}.columns{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:clamp(18px,4vw,80px);margin-top:35px}.art{height:335px;position:relative;isolation:isolate}.floor{position:absolute;bottom:19px;left:1%;width:98%;height:3px;background:linear-gradient(90deg,transparent,#68acdd70,transparent)}.door{position:absolute;bottom:25px;right:10%;width:43%;height:250px;border:8px solid #334964;border-radius:20px;background:radial-gradient(circle,#3f5269,#172439 75%);box-shadow:0 0 0 5px #0e1b2a,0 0 30px #ef455b35;overflow:hidden;animation:warning 3s ease-in-out infinite}.door:before{content:\"\";position:absolute;inset:5px;border:2px dashed #f94d69a6;border-radius:10px}.play{position:absolute;top:35%;left:33%;background:#ff3d56;border-radius:19px;padding:18px 24px;color:white;font-size:36px;box-shadow:0 5px 30px #ff3d5655}.lock{position:absolute;top:0;right:5px;font-size:32px}.scan{position:absolute;left:0;right:0;height:3px;background:#5ed9ff;box-shadow:0 0 12px #5ed9ff;animation:scan 4s linear infinite}.stop{position:absolute;bottom:42px;right:4%;background:#e73a56;color:#fff;font-weight:900;letter-spacing:1px;line-height:1.2;padding:18px 9px;border-radius:50%;border:5px solid white;box-shadow:0 5px 20px #e73a5680;text-align:center;font-size:13px;z-index:4;animation:tilt 3s ease-in-out infinite}.guard{position:absolute;bottom:30px;left:29%;width:125px;height:200px;z-index:3;animation:float 3.5s ease-in-out infinite}.cap{position:absolute;left:19px;top:4px;background:#2357a2;border:4px solid #368ff1;color:#ffc93c;border-radius:55% 55% 12% 12%;text-align:center;font-size:20px;width:88px;height:36px;z-index:2}.guard-head{position:absolute;top:30px;left:23px;width:84px;height:78px;background:#f7ae82;border-radius:40%;border:5px solid #132438;display:grid;place-items:center}.guard-head span{color:#121822;font-weight:bold;font-size:20px;white-space:nowrap;transform:rotate(-5deg)}.guard-body{position:absolute;bottom:0;left:9px;height:98px;width:107px;background:#2863aa;border:5px solid #183e71;border-radius:25px 25px 15px 15px;display:grid;place-items:center;font-size:48px;color:#ffda61}.guard-arm{position:absolute;top:104px;left:90px;z-index:4;transform:rotate(-30deg);font-size:35px;animation:halt 2s ease-in-out infinite}.intruder{position:absolute;bottom:30px;left:3%;height:180px;width:120px;animation:sneak 2s ease-in-out infinite}.hood{position:absolute;top:36px;left:5px;width:102px;height:104px;border-radius:50% 50% 40% 40%;background:#252d3b;border:7px solid #46536c;display:grid;place-items:center;z-index:1}.face{width:74px;height:65px;background:#1b2331;border-radius:40%;display:flex;align-items:center;justify-content:center;gap:13px}.face i{display:block;width:14px;height:20px;border-radius:50%;background:white;position:relative}.face i:after{content:\"\";position:absolute;top:8px;left:6px;width:5px;height:8px;border-radius:50%;background:#111}.intruder-body{position:absolute;bottom:0;left:10px;height:70px;width:100px;border-radius:40px 40px 10px 10px;background:#202937;border:4px solid #43516c}.bubble{position:absolute;top:0;left:0;width:140px;padding:9px 8px;background:#f0f6ff;color:#17283d;border-radius:14px;text-align:center;font-weight:700;font-size:12px;z-index:3;transform:rotate(-7deg)}.info{padding:8px;min-width:0}.blocked{color:#ff6980;font-size:12px;font-weight:800;letter-spacing:1.8px}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff415d;margin-right:7px;box-shadow:0 0 10px #ff415d;animation:blink 1.5s linear infinite}.info h2{font-size:clamp(24px,2.7vw,35px);line-height:1.25;margin:20px 0 22px;font-weight:750}.count-card{border:1px solid #34526b;border-radius:16px;padding:21px 24px;background:#122034;box-shadow:inset 0 0 24px #122d4622}.count-label{color:#abbfd1;font-size:12px;letter-spacing:1.3px;font-weight:700}.count{font-size:clamp(29px,4.6vw,58px);color:#55cfff;font-weight:800;letter-spacing:3px;font-variant-numeric:tabular-nums;text-shadow:0 0 20px #4bbcff40;margin-top:5px}.windows{margin-top:25px}.windows strong{font-size:12px;color:#b8c6d8;letter-spacing:1px}.window{margin-top:10px;color:#90e9b5;font-size:17px}.extra{font-size:14px;color:#aebacc;margin-top:26px}footer{text-align:center;margin-top:24px;color:#8296a8;font-size:10px;letter-spacing:1px}footer span{color:#9ee6b5}@keyframes sneak{0%,100%{transform:translateX(0) rotate(0)}50%{transform:translateX(11px) rotate(4deg)}}@keyframes halt{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(-17deg)}}@keyframes scan{0%{top:0}100%{top:100%}}@keyframes warning{0%,100%{box-shadow:0 0 20px #ee365230}50%{box-shadow:0 0 30px #ed365280}}@keyframes tilt{0%,100%{transform:rotate(3deg)}50%{transform:rotate(-3deg)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@media(max-width:760px){.scene{display:block}.layout{padding:22px 10px}.columns{grid-template-columns:1fr;gap:14px;margin-top:10px}.art{height:215px;width:min(430px,100%);margin:auto;transform:scale(.75);transform-origin:center center;margin-bottom:-45px}.info{max-width:500px;margin:auto;text-align:center}.info h2{margin:15px 0}.count-card{padding:15px}.tagline{margin:8px auto}.windows{margin-top:15px}.extra{margin-top:15px}footer{margin-top:20px}}@media(max-height:570px) and (min-width:761px){.layout{padding:12px}.columns{margin-top:5px}.art{transform:scale(.82);transform-origin:center}.brand h1{font-size:28px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}\n\n/* Responsive layout: fit typical laptop and desktop Firefox content viewports. */\n:host{display:block!important;width:100%!important;height:100%!important}\n.scene{width:100%;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;align-items:center}\n.layout{width:min(1120px,96%);padding:clamp(10px,2vh,24px) 12px;max-width:100%;margin:auto}\n.badge{font-size:clamp(21px,3vh,34px)}\n.eyebrow{font-size:10px;margin:5px 0}\n.brand h1{font-size:clamp(24px,3.4vw,40px);margin:3px 0}\n.tagline{margin:6px 0;font-size:13px}\n.columns{grid-template-columns:minmax(0,0.95fr) minmax(0,1.05fr);gap:clamp(14px,2.5vw,40px);margin-top:clamp(8px,1.8vh,18px)}\n.art{height:clamp(180px,37vh,320px);width:100%;min-width:0;transform-origin:center center}\n.door{height:min(250px,90%);width:44%;right:9%;bottom:8px}\n.guard{bottom:12px;left:26%}\n.intruder{bottom:12px}\n.floor{bottom:7px}\n.stop{bottom:16px}\n.info{padding:4px 0}\n.info h2{font-size:clamp(19px,2.4vw,30px);line-height:1.15;margin:clamp(7px,1.5vh,13px) 0}\n.blocked{font-size:10px}\n.count-card{padding:clamp(10px,1.5vh,17px) 18px}\n.count{font-size:clamp(27px,4vw,48px);margin-top:0}\n.count-label{font-size:11px}\n.windows{margin-top:clamp(10px,2vh,17px)}\n.window{margin-top:4px;font-size:14px}\n.extra{font-size:12px;margin:10px 0 0}\nfooter{margin-top:clamp(12px,2vh,22px);font-size:9px}\n.motivation{margin-top:12px;border:1px solid #2e5570;border-radius:12px;background:#102338;padding:12px 14px;min-height:83px}\n.motivation-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;font-weight:800;font-size:10px;letter-spacing:1px;color:#56cefc}\n.motivation-text{font-size:clamp(13px,1.3vw,15px);line-height:1.35;margin:6px 0 0;color:#e4edf9}\n.motivation-hint{font-size:11px;color:#9aacbf;margin:5px 0 0}\n.motivation-next{background:transparent;color:#8fdcf5;border:1px solid #365b75;border-radius:7px;cursor:pointer;font-size:11px;padding:5px 9px;min-height:30px}\n.motivation-next:focus-visible{outline:2px solid #58ceff;outline-offset:2px}\n@media(max-width:850px){\n .columns{grid-template-columns:1fr;gap:4px}\n .art{height:150px;max-width:360px;margin:0 auto;transform:scale(.55);transform-origin:50% 70%;margin-top:-32px;margin-bottom:-28px}\n .info{max-width:590px;width:100%;margin:0 auto;text-align:center}\n .info h2{font-size:clamp(19px,4vw,26px)}\n .count{font-size:clamp(29px,7vw,43px)}\n .layout{padding:12px 14px}\n .windows{margin-top:8px}\n .motivation{text-align:left}\n .extra{margin-top:8px}\n}\n@media(max-height:750px) and (min-width:851px){\n .layout{padding:8px 12px}\n .badge{font-size:23px}\n .columns{margin-top:6px}\n .art{height:230px}\n .door{height:205px}\n .guard,.intruder{transform-origin:bottom;scale:.86}\n .info h2{font-size:22px;margin:7px 0}\n .count{font-size:35px}\n .count-card{padding:8px 15px}\n .motivation{padding:8px 12px;min-height:68px;margin-top:8px}\n .motivation-text{font-size:13px}\n .motivation-hint{margin-top:2px}\n .windows{margin-top:8px}\n footer{margin-top:10px}\n}\n@media(max-height:570px) and (min-width:851px){\n .badge{display:none}\n .eyebrow{margin:2px}\n .tagline{display:none}\n .brand h1{font-size:25px}\n .columns{margin-top:1px}\n .art{height:200px}\n .info h2{font-size:19px;margin:5px 0}\n .count{font-size:30px}\n .extra,footer{display:none}\n}\n@media(max-width:540px){\n .art{height:124px;transform:scale(.47);margin-top:-40px;margin-bottom:-30px}\n .brand h1{font-size:26px}\n .eyebrow{letter-spacing:1px}\n .count-card{padding:9px}\n .motivation{padding:10px}\n .tagline{font-size:12px}\n}\n@media(prefers-reduced-motion:reduce){.motivation *{animation:none!important}}\n\n.motivation{position:relative;overflow:hidden}\n.motivation-reveal{animation:questEnter .85s cubic-bezier(.2,.7,.25,1) both}\n.motivation-reveal::after{content:\"\";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 0%,#66d7ff24 45%,transparent 65%);transform:translateX(-120%);animation:questSweep 1.15s ease-out both}\n@keyframes questEnter{0%{opacity:.25;transform:translateY(9px);border-color:#53cfff}55%{opacity:1;transform:translateY(-2px);box-shadow:0 0 24px #35bdf52b}100%{opacity:1;transform:translateY(0);box-shadow:none}}\n@keyframes questSweep{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}\n@media(prefers-reduced-motion:reduce){.motivation-reveal,.motivation-reveal::after{animation:none!important}}\n\n\n/* QUEST-FIRST V3: the block reason is intentionally subdued. */\n:host{all:initial;display:block!important;width:100%;height:100%}\n.scene{--quest-accent:#58d6ff;--quest-soft:#58d6ff25;--quest-glow:#58d6ff4c;\n  position:relative;height:100%;min-height:0;width:100%;display:flex;align-items:center;\n  justify-content:center;overflow:auto;background:#08111e;isolation:isolate}\n.scene[data-hue=\"green\"]{--quest-accent:#81edbb;--quest-soft:#81edbb22;--quest-glow:#81edbb44}\n.scene[data-hue=\"red\"]{--quest-accent:#ff899a;--quest-soft:#ff899a22;--quest-glow:#ff899a44}\n.scene[data-hue=\"violet\"]{--quest-accent:#c1adff;--quest-soft:#c1adff22;--quest-glow:#c1adff44}\n.scene[data-hue=\"gold\"]{--quest-accent:#ffe08d;--quest-soft:#ffe08d22;--quest-glow:#ffe08d44}\n.scene[data-hue=\"blue\"]{--quest-accent:#7facff;--quest-soft:#7facff22;--quest-glow:#7facff44}\n.scene:before{background:linear-gradient(90deg,#27485b1a 1px,transparent 1px),linear-gradient(#27485b1a 1px,transparent 1px);background-size:56px 56px;opacity:.5}\n.cyber-fx{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}\n.cyber-fx:before{content:\"\";position:absolute;inset:-20%;background:radial-gradient(ellipse at 28% 50%,var(--quest-soft),transparent 55%);animation:ambientPulse 9s ease-in-out infinite}\n.cyber-particle{position:absolute;color:var(--quest-accent);font:600 clamp(11px,1.3vw,17px) ui-monospace,SFMono-Regular,monospace;opacity:.19;\n  border:1px solid currentColor;border-radius:8px;padding:6px 9px;letter-spacing:1px;white-space:nowrap;animation:cyberFloat 13s ease-in-out infinite}\n.scene[data-quest=\"packets\"] .cyber-particle{animation:packetsFlow 9s linear infinite;border-radius:3px}\n.scene[data-quest=\"terminal\"] .cyber-particle{border:0;animation:terminalPop 7s steps(3,end) infinite}\n.scene[data-quest=\"hash\"] .cyber-particle{border:0;animation:hashFlicker 5s steps(3,end) infinite}\n.scene[data-quest=\"radar\"] .cyber-fx:after{content:\"\";position:absolute;inset:0;background:conic-gradient(from 45deg at 50% 50%,transparent 0deg,var(--quest-soft) 30deg,transparent 55deg);animation:radarSweep 14s linear infinite;opacity:.35}\n.scene[data-quest=\"shield\"] .cyber-particle{border-radius:50%;animation:shieldPulse 7s ease-in-out infinite}\n.scene[data-quest=\"phishing\"] .cyber-particle{animation:phishShake 8s ease-in-out infinite}\n.scene[data-quest=\"triad\"] .cyber-particle{border-radius:12px 12px 2px 2px;animation:triadOrbit 12s ease-in-out infinite}\n.scene[data-quest=\"patch\"] .cyber-particle{animation:patchRise 10s ease-in-out infinite}\n.scene[data-quest=\"access\"] .cyber-particle{animation:accessBlink 6s ease-in-out infinite}\n.scene[data-quest=\"mfa\"] .cyber-particle{animation:mfaSwitch 8s steps(2,end) infinite}\n.scene[data-quest=\"network\"] .cyber-particle{border-radius:50%;animation:networkSignal 9s ease-in-out infinite}\n.scene[data-quest=\"code\"] .cyber-particle{animation:codeDrift 11s linear infinite}\n.layout{z-index:1;position:relative;width:min(1140px,95%);padding:clamp(12px,2.8vh,26px) 8px;margin:auto}\n.brand{text-align:center;margin-bottom:clamp(12px,2.8vh,25px)}\n.brand .eyebrow{font-size:11px;letter-spacing:2px;color:#8bb9d1}\n.brand h1{font-size:clamp(24px,3.4vw,42px);margin:5px 0 8px}\n.brand em{color:var(--quest-accent)}\n.tagline{font-size:13px;margin:0;color:#b6c6da}\n.quest-stage{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(270px,.7fr);gap:clamp(15px,2.8vw,42px);align-items:center}\n.quest-primary{position:relative;min-width:0;padding:clamp(17px,2.7vw,28px);border:1px solid var(--quest-accent);\n  border-radius:22px;background:linear-gradient(150deg,#13283ccf,#0c1a2fe8);box-shadow:0 0 48px var(--quest-soft),inset 0 0 22px #0a111b70}\n.quest-topline{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;font-size:12px;letter-spacing:1.4px;font-weight:800;color:var(--quest-accent)}\n.interval-chip{font-size:9px;letter-spacing:1px;border:1px solid #42637b;border-radius:30px;padding:6px 9px;color:#a8c4d7}\n.quest-theme{text-align:center;color:var(--quest-accent);font-size:clamp(12px,1.7vw,17px);font-weight:850;letter-spacing:2px;margin-top:clamp(14px,2vh,24px)}\n.quest-visual{height:clamp(145px,24vh,230px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;position:relative;\n  border-radius:16px;margin:12px auto;overflow:hidden;background:radial-gradient(ellipse at 50% 60%,var(--quest-soft),transparent 60%);}\n.quest-visual:before{content:\"\";position:absolute;width:min(35vw,200px);height:min(35vw,200px);border-radius:50%;\n  border:2px dashed var(--quest-accent);opacity:.32;animation:visualSpin 22s linear infinite}\n.quest-visual:after{content:\"\";position:absolute;width:65%;height:1px;background:linear-gradient(90deg,transparent,var(--quest-accent),transparent);opacity:.5;bottom:22%;animation:visualScan 6s ease-in-out infinite}\n.quest-symbol{font-size:clamp(38px,6vw,72px);z-index:1;filter:drop-shadow(0 0 22px var(--quest-glow));animation:visualBob 5s ease-in-out infinite}\n.quest-key{z-index:1;color:#fff;font:bold clamp(12px,1.8vw,21px) ui-monospace,monospace;text-align:center;overflow-wrap:anywhere}\n.quest-detail{z-index:1;color:#b4d5e3;font:12px ui-monospace,monospace;text-align:center}\n.quest-graphic-label{position:absolute;top:10px;left:14px;color:#7797ad;font:10px ui-monospace,monospace;letter-spacing:1px}\n.motivation{border:0;background:none;border-radius:0;margin:0;padding:0;min-height:0;text-align:center;overflow:visible}\n.motivation-text{font-size:clamp(19px,2.8vw,29px);line-height:1.22;color:white;margin:8px 0;font-weight:800}\n.motivation-hint{font-size:clamp(13px,1.5vw,17px);color:#b7dcef;line-height:1.4;margin:6px 0}\n.quest-note{text-align:center;color:#8fa8bd;font-size:12px;margin:15px 0 0}\n.access-summary{min-width:0;padding:clamp(8px,1.5vw,18px);border-left:1px solid #385067}\n.blocked{color:#acbeca;font-size:10px;letter-spacing:1.1px}\n.dot{background:#9ea9b4;box-shadow:none;animation:none}\n.access-message{color:#bdc7d5;font-size:clamp(13px,1.3vw,17px);line-height:1.4;margin:8px 0 18px}\n.count-card{padding:12px 15px;background:#111f2da6;border-color:#395165;box-shadow:none}\n.count{font-size:clamp(25px,3.4vw,40px);color:var(--quest-accent);letter-spacing:2px;text-shadow:none}\n.count-label{font-size:10px}\n.windows{margin-top:18px}\n.windows strong{color:#91adbf;font-size:10px}\n.window{color:#a1ddbe;font-size:14px}\n.extra{font-size:12px;color:#899fb0;margin-top:14px}\nfooter{margin-top:clamp(12px,2vh,22px);color:#657e92;font-size:10px}\n@keyframes ambientPulse{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.55;transform:scale(1.12)}}\n@keyframes cyberFloat{0%,100%{transform:translateY(0) rotate(-4deg);opacity:.08}50%{transform:translateY(-24px) rotate(4deg);opacity:.32}}\n@keyframes packetsFlow{0%{transform:translate(-55px,12px);opacity:0}25%{opacity:.38}80%{opacity:.38}100%{transform:translate(110px,-15px);opacity:0}}\n@keyframes terminalPop{0%,100%{opacity:.04}30%,55%{opacity:.48}65%{opacity:.1}}\n@keyframes hashFlicker{0%,100%{opacity:.13;filter:blur(1px)}40%{opacity:.43;filter:none}}\n@keyframes radarSweep{to{transform:rotate(360deg)}}\n@keyframes shieldPulse{0%,100%{transform:scale(.85);opacity:.12}45%{transform:scale(1.1);opacity:.4}}\n@keyframes phishShake{0%,90%,100%{transform:translateX(0);opacity:.12}93%{transform:translateX(-7px);opacity:.5}96%{transform:translateX(6px)}}\n@keyframes triadOrbit{0%,100%{transform:translate(-10px,7px);opacity:.2}50%{transform:translate(12px,-11px);opacity:.4}}\n@keyframes patchRise{0%{transform:translateY(25px);opacity:0}40%{opacity:.38}100%{transform:translateY(-40px);opacity:0}}\n@keyframes accessBlink{0%,100%{opacity:.12}50%{opacity:.48}}\n@keyframes mfaSwitch{0%,100%{opacity:.12}50%{opacity:.48}}\n@keyframes networkSignal{0%,100%{transform:scale(.8);opacity:.06}50%{transform:scale(1.24);opacity:.42}}\n@keyframes codeDrift{0%{transform:translateY(-35px);opacity:0}35%{opacity:.37}100%{transform:translateY(35px);opacity:0}}\n@keyframes visualSpin{to{transform:rotate(360deg)}}\n@keyframes visualBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}\n@keyframes visualScan{0%,100%{transform:translateY(0);opacity:.2}50%{transform:translateY(-70px);opacity:.6}}\n@media(max-width:800px){\n  .quest-stage{grid-template-columns:1fr;gap:12px}\n  .quest-primary{padding:16px}\n  .quest-visual{height:145px;margin:7px 0}\n  .quest-symbol{font-size:44px}\n  .quest-theme{margin-top:10px}\n  .motivation-text{font-size:21px}\n  .access-summary{border-left:0;border-top:1px solid #395268;padding:12px 3px;display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;align-items:center}\n  .blocked,.access-message,.extra{grid-column:1/-1}\n  .access-message,.extra{margin:3px 0}\n  .windows{margin:0}\n  .count-card{padding:10px}\n  .count{font-size:28px}\n}\n@media(max-width:480px){\n  .layout{padding:12px 4px}\n  .quest-primary{padding:13px}\n  .quest-visual{height:132px}\n  .quest-theme{font-size:12px}\n  .quest-graphic-label{font-size:8px}\n  .quest-key{font-size:13px}\n  .motivation-text{font-size:18px}\n  .motivation-hint{font-size:13px}\n  .access-summary{grid-template-columns:1fr}\n  .count{font-size:30px}\n  .windows{margin:3px 0}\n  .tagline{font-size:11px}\n}\n@media(max-height:680px) and (min-width:801px){\n  .layout{padding:6px 8px}\n  .brand{margin-bottom:8px}\n  .brand h1{font-size:29px}\n  .quest-primary{padding:12px 18px}\n  .quest-theme{margin-top:8px}\n  .quest-visual{height:145px;margin:5px auto}\n  .quest-symbol{font-size:42px}\n  .motivation-text{font-size:20px}\n  .motivation-hint{font-size:13px}\n  .quest-note{margin-top:6px}\n  footer{margin-top:8px}\n}\n@media(prefers-reduced-motion:reduce){\n  .cyber-fx:before,.cyber-particle,.quest-symbol,.quest-visual:before,.quest-visual:after{animation:none!important}\n  .cyber-particle{opacity:.11}\n}\n";

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
    '<div class="cyber-fx" aria-hidden="true" id="fh-fx"></div>' +
    '<main class="layout" role="main">' +
      '<header class="brand"><div class="eyebrow">🛡️ SCROLLSENTINEL // CYBERSECURITY TRAINING</div>' +
      '<h1>Scroll<em>Sentinel</em></h1><p class="tagline">Guard your focus. Learn cybersecurity. Scroll on your schedule.</p></header>' +
      '<div class="quest-stage">' +
        '<section class="quest-primary" aria-label="Current cybersecurity side quest">' +
          '<div class="quest-topline"><span>🧠 CYBERSECURITY SIDE QUEST</span><span class="interval-chip">NEW EVERY 30 MIN</span></div>' +
          '<div class="quest-theme" id="fh-theme">🔐 CYBERSECURITY</div>' +
          '<div class="quest-visual" id="fh-graphic" aria-hidden="true"></div>' +
          '<div class="motivation"><h2 id="fh-motivation" class="motivation-text"></h2><p id="fh-motivation-hint" class="motivation-hint"></p></div>' +
          '<p class="quest-note">One challenge at a time. Learn it, practice it, then move on.</p>' +
        '</section>' +
        '<aside class="access-summary" aria-label="YouTube access status">' +
          '<div class="blocked"><span class="dot"></span>YOUTUBE ACCESS PAUSED</div>' +
          '<p class="access-message" id="fh-message">YouTube is outside your allowed viewing hours.</p>' +
          '<div class="count-card"><div class="count-label">⏱ NEXT VIEWING WINDOW IN</div><div class="count" id="fh-count" role="timer">--:--:--</div></div>' +
          '<div class="windows"><strong>YOUR ACCESS WINDOWS</strong><div id="fh-windows"></div></div>' +
          '<p class="extra" id="fh-extra">Focus mode is protecting your study time.</p>' +
        '</aside>' +
      '</div>' +
      '<footer>FOCUS SYSTEM ACTIVE · STAY CURIOUS · PRACTICE ONLY ON AUTHORIZED SYSTEMS</footer>' +
    '</main>';
  shadow.appendChild(panel);
  countdownNode = shadow.getElementById('fh-count');
  subtitleNode = shadow.getElementById('fh-message');
  windowsNode = shadow.getElementById('fh-windows');
  statusNode = shadow.getElementById('fh-extra');
  motivationTextNode = shadow.getElementById('fh-motivation');
  motivationHintNode = shadow.getElementById('fh-motivation-hint');
  motivationCardNode = shadow.querySelector('.quest-primary');
  fxLayerNode = shadow.getElementById('fh-fx');
  questGraphicNode = shadow.getElementById('fh-graphic');
  questThemeNode = shadow.getElementById('fh-theme');
  motivationSlot = null;
  showMotivationForCurrentSlot();
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
    if (overlay) {overlay.remove();overlay = null; motivationSlot = null; fxLayerNode = null; questGraphicNode = null; questThemeNode = null; motivationCardNode = null;}
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
// A clock-based interval keeps the same challenge across reloads.
setInterval(showMotivationForCurrentSlot, 1000);
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
