const api=browser;
let state=null,overlay=null;
const distractionSelectors=['ytd-rich-grid-renderer','ytd-rich-section-renderer','ytd-watch-next-secondary-results-renderer','ytd-comments','ytd-reel-shelf-renderer','ytd-guide-entry-renderer a[href^="/shorts"]','ytd-mini-guide-entry-renderer a[href^="/shorts"]','ytd-notification-topbar-button-renderer','ytd-compact-video-renderer'];
const css=document.createElement('style');css.id='focus-hours-styles';css.textContent=distractionSelectors.join(',')+'{display:none!important}';
function update(s){state=s;const blocked=!s.allowed; if(s.distractionFree){if(!css.isConnected)document.documentElement.appendChild(css);}else css.remove();
 if(!blocked){overlay?.remove();overlay=null;document.documentElement.style.removeProperty('overflow');return;}
 if(!overlay){overlay=document.createElement('div');overlay.id='focus-hours-overlay';overlay.style.cssText='position:fixed!important;inset:0!important;z-index:2147483647!important;background:#101114!important;color:white!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;font:18px system-ui!important;padding:24px!important;box-sizing:border-box!important';document.documentElement.appendChild(overlay);}
 overlay.replaceChildren();const box=document.createElement('div'),h=document.createElement('h1'),p=document.createElement('p'),q=document.createElement('p');h.textContent='YouTube Focus Hours';h.style.cssText='font-size:30px;margin:0 0 22px';p.textContent=s.scheduled?'Daily YouTube time budget exhausted.':'YouTube is outside your allowed viewing hours.';q.textContent='Allowed: '+s.windows.map(w=>w.start+'–'+w.end).join(' • ');q.style.color='#aaa';box.append(h,p,q);overlay.appendChild(box);document.documentElement.style.setProperty('overflow','hidden','important');
}
async function refresh(){try{update(await api.runtime.sendMessage({type:'status'}));}catch{}}
api.runtime.onMessage.addListener(msg=>{if(msg.type==='check')update(msg.state);});
refresh();setInterval(refresh,10000);
setInterval(async()=>{if(state?.allowed&&state.enabled&&document.visibilityState==='visible'&&document.hasFocus()){try{update(await api.runtime.sendMessage({type:'activity'}));}catch{}}},1000);
new MutationObserver(()=>{if(state&&!state.allowed&&overlay&&!overlay.isConnected)document.documentElement.appendChild(overlay);if(state?.distractionFree&& !css.isConnected)document.documentElement.appendChild(css);}).observe(document.documentElement,{childList:true});
setInterval(()=>{if(!state?.distractionFree)return;const toggle=document.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]');if(toggle)toggle.click();},2500);
