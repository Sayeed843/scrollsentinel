const api = browser;
const Schedule = globalThis.ScrollSentinelSchedule;
if (!Schedule) throw new Error('ScrollSentinel schedule module missing');
const DEFAULTS = {
  enabled: true, windows: Schedule.defaults, dailyLimit: 90,
  distractionFree: true, lockUntil: 0, usageDate: '', usedSeconds: 0
};
const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const scheduleAllows = Schedule.scheduleAllows;
let mutex=Promise.resolve();
function serialized(task){const result=mutex.then(task,task);mutex=result.catch(()=>{});return result;}
async function load(){const s={...DEFAULTS,...await api.storage.local.get(null)};
 s.windows=Schedule.normalizeWindows(s.windows);
 if(s.usageDate!==dayKey()){s.usageDate=dayKey();s.usedSeconds=0;await api.storage.local.set({usageDate:s.usageDate,usedSeconds:0});}return s;}
function status(s){const scheduled=scheduleAllows(s);const budgetLeft=Math.max(0,s.dailyLimit*60-s.usedSeconds);return {...s,allowed:scheduled&&(!s.enabled||budgetLeft>0),scheduled,budgetLeft,locked:s.lockUntil>Date.now()};}
async function broadcast(){const s=status(await load());const tabs=await api.tabs.query({});await Promise.all(tabs.filter(t=>t.id&&isYoutube(t.url)).map(t=>api.tabs.sendMessage(t.id,{type:'check',state:s}).catch(()=>{})));}
function isYoutube(url){try{const h=new URL(url).hostname;return h==='youtube.com'||h.endsWith('.youtube.com')||h==='youtu.be';}catch{return false;}}
api.runtime.onMessage.addListener(msg=>serialized(async()=>{
 if(msg.type==='status')return status(await load());
 if(msg.type==='save'){
  const s=await load();if(s.lockUntil>Date.now())return {ok:false,error:'Strict Mode is active until '+new Date(s.lockUntil).toLocaleString()};
  const days=Number(msg.lockDays),limit=Number(msg.dailyLimit);
  const windowsError=Schedule.validateWindows(msg.windows);
  if(windowsError)return {ok:false,error:windowsError};
  if(typeof msg.enabled!=='boolean'||typeof msg.distractionFree!=='boolean'||![0,7,14].includes(days)||!Number.isInteger(limit)||limit<1||limit>1440)return {ok:false,error:'Invalid settings.'};
  await api.storage.local.set({enabled:msg.enabled,windows:msg.windows,dailyLimit:limit,distractionFree:msg.distractionFree,lockUntil:days?Date.now()+days*86400000:0});
  broadcast();return {ok:true};
 }
 if(msg.type==='tick'){
  const s=await load();if(!s.enabled||!scheduleAllows(s)||s.usedSeconds>=s.dailyLimit*60)return status(s);
  return status(s);
 }
}));
let lastTick=0;
api.runtime.onMessage.addListener((msg,sender)=>{
 if(msg.type!=='activity'||!sender.tab?.id)return undefined;
 return serialized(async()=>{
  const s=await load();if(!s.enabled||!scheduleAllows(s)||s.usedSeconds>=s.dailyLimit*60)return status(s);
  const active=await api.tabs.query({active:true,lastFocusedWindow:true});
  if(!active.some(t=>t.id===sender.tab.id&&isYoutube(t.url)))return status(s);
  const now=Date.now();if(now-lastTick<900)return status(s);lastTick=now;
  s.usedSeconds=Math.min(s.dailyLimit*60,s.usedSeconds+1);await api.storage.local.set({usedSeconds:s.usedSeconds});
  if(s.usedSeconds>=s.dailyLimit*60)broadcast();return status(s);
 });
});
api.alarms.create('enforce',{periodInMinutes:1});api.alarms.onAlarm.addListener(broadcast);
api.runtime.onStartup.addListener(broadcast);api.tabs.onActivated.addListener(broadcast);api.windows.onFocusChanged.addListener(broadcast);broadcast();
