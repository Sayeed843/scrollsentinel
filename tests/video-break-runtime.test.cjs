"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const script = filename => fs.readFileSync(path.join(root,filename),"utf8");

async function environment(options = {}) {
  let now = options.now ?? Date.UTC(2026,9,22,15,0,0);
  let focused = options.focused !== false;
  const storage = {
    enabled: options.enabled ?? false,
    windows:[{start:"12:00",end:"14:00",selected:true},{start:"22:00",end:"23:30",selected:true}],
    dailyLimit:90,
    usedSeconds:0,
    videoWatchedSeconds: options.watched ?? 0,
    restUntilMs: options.restUntil ?? 0
  };
  const listeners = [];
  const sent = [];
  const current = {
    id:11,
    url:options.url ?? "https://www.facebook.com/watch/"
  };
  class FakeDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const event = () => ({addListener() {}});
  const browser = {
    storage:{local:{
      async get(keys) {
        if (keys === null) return {...storage};
        if (Array.isArray(keys)) return Object.fromEntries(keys.map(key => [key,storage[key]]));
        return {...storage};
      },
      async set(patch) { Object.assign(storage,patch); }
    }},
    tabs:{
      async query(query) { return query.active ? [current] : [current]; },
      async sendMessage(tab, payload) { sent.push({tab,payload}); }
    },
    windows:{async getLastFocused(){return {focused};},onFocusChanged:event()},
    runtime:{onMessage:{addListener(fn){listeners.push(fn);}},onStartup:event()},
    alarms:{create(){},onAlarm:event()}
  };
  browser.tabs.onActivated=event();
  const sandbox={browser,URL,Date:FakeDate};
  sandbox.globalThis=sandbox;
  for(const filename of ["schedule.js","break-core.js","background.js"]){
    vm.runInNewContext(script(filename),sandbox,{filename,timeout:1200});
  }
  // The background's initial async broadcast may still be in-flight.
  await Promise.resolve();
  async function send(type,host=current.url, playing=true) {
    const sender={tab:{id:current.id,url:current.url},url:host};
    const matching=listeners.map(fn=>fn({type,playing},sender)).filter(result=>result!==undefined);
    assert.equal(matching.length,1,type+" should have exactly one response provider");
    return await matching[0];
  }
  return {
    storage,sent,send,
    setNow(ts){now=ts;},
    addSeconds(s){now+=s*1000;},
    setFocused(value){focused=value;},
    setTabURL(value){current.url=value;}
  };
}

test("foreground video heartbeat triggers shared break at 3600 seconds",async()=>{
  const e=await environment({watched:3599,url:"https://www.facebook.com/watch/"});
  const data=await e.send("videoActivity", "https://www.facebook.com/watch/");
  assert.equal(data.resting,true);
  assert.equal(data.watchedSeconds,3600);
  assert.equal(data.restRemainingSeconds,120);
  assert.equal(e.storage.restUntilMs>0,true);
  assert.ok(e.sent.some(x=>x.payload.type==="videoBreak")||e.storage.videoWatchedSeconds===3600);
  const stable=await e.send("videoActivity","https://www.facebook.com/watch/");
  assert.equal(stable.watchedSeconds,3600);
  e.addSeconds(60);
  const halfway=await e.send("videoBreakStatus");
  assert.equal(halfway.stageIndex,2);
  assert.equal(halfway.restRemainingSeconds,60);
  e.addSeconds(60);
  const finished=await e.send("videoBreakStatus");
  assert.equal(finished.resting,false);
  assert.equal(finished.secondsUntilBreak,3600);
  assert.equal(e.storage.videoWatchedSeconds,0);
  assert.equal(e.storage.restUntilMs,0);
});

test("activity from an unsupported website cannot increase shared watch budget",async()=>{
  const e=await environment({watched:75});
  const state=await e.send("videoActivity","https://example.org/video");
  assert.equal(state.watchedSeconds,75);
  assert.equal(e.storage.videoWatchedSeconds,75);
  const fake=await e.send("videoActivity","https://facebook.com.evil.example/watch");
  assert.equal(fake.watchedSeconds,75);
});

test("background ignores video playback when browser is not focused",async()=>{
  const e=await environment({watched:75,focused:false,url:"https://www.tiktok.com/@user/video/123"});
  const state=await e.send("videoActivity","https://www.tiktok.com/@user/video/123");
  assert.equal(state.watchedSeconds,75);
});

test("YouTube blocked hours never count towards additional video break",async()=>{
  const e=await environment({watched:75,enabled:true,url:"https://www.youtube.com/watch?v=123"});
  const state=await e.send("videoActivity","https://www.youtube.com/watch?v=123");
  assert.equal(state.watchedSeconds,75);
});

test("Instagram, Facebook, TikTok and YouTube are all accepted by the same counter",async()=>{
  for(const url of [
    "https://www.instagram.com/reels/",
    "https://www.facebook.com/watch/",
    "https://www.tiktok.com/@channel/video/123",
    "https://www.youtube.com/watch?v=123"
  ]) {
    const e=await environment({watched:75,enabled:false,url});
    const result=await e.send("videoActivity",url);
    assert.equal(result.watchedSeconds,76,url);
  }
});
