"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname,"..");
const read = name => fs.readFileSync(path.join(root,name),"utf8");

function engine(){
  const sandbox={};sandbox.globalThis=sandbox;
  vm.runInNewContext(read("break-core.js"),sandbox,{filename:"break-core.js"});
  return sandbox.ScrollSentinelBreak;
}
test("60 minutes across all four video sites triggers one 120-second rest",()=>{
  const e=engine(), now=2000000000000;
  const almost={videoWatchedSeconds:3599,restUntilMs:0};
  const done=e.advance(almost,now);
  assert.equal(done.videoWatchedSeconds,3600);
  assert.equal(done.restUntilMs,now+120000);
  assert.equal(e.view(done,now).resting,true);
  assert.equal(e.view(done,now).restRemainingSeconds,120);
  assert.equal(e.advance(done,now+500).videoWatchedSeconds,3600);
  assert.equal(e.advance(done,now+500).restUntilMs,now+120000);
});
test("four phases are precisely 30 seconds, then countdown finishes",()=>{
  const e=engine(),now=1800000000000;
  const rest=e.advance({videoWatchedSeconds:3599,restUntilMs:0},now);
  const phases=[
    [0,0,30,120],[29999,0,1,91],[30000,1,30,90],
    [59999,1,1,61],[60000,2,30,60],[89999,2,1,31],
    [90000,3,30,30],[119999,3,1,1]
  ];
  for(const [ms,index,remainingInStage,remainingOverall] of phases){
    const state=e.view(rest,now+ms);
    assert.equal(state.stageIndex,index,"phase at "+ms+"ms");
    assert.equal(state.stageRemainingSeconds,remainingInStage,"phase countdown at "+ms+"ms");
    assert.equal(state.restRemainingSeconds,remainingOverall,"overall countdown at "+ms+"ms");
  }
  const resumed=e.view(rest,now+120000);
  assert.equal(resumed.resting,false);
  assert.equal(resumed.watchedSeconds,0);
  assert.equal(resumed.secondsUntilBreak,3600);
  assert.equal(resumed.restUntilMs,0);
});
test("rest state persists across page reload and a browser restart",()=>{
  const e=engine(),now=1800000000000;
  const stored=e.advance({videoWatchedSeconds:3599,restUntilMs:0},now);
  const sameState=JSON.parse(JSON.stringify(stored));
  assert.equal(e.view(sameState,now+46000).stageIndex,1);
  assert.equal(e.view(sameState,now+46000).restRemainingSeconds,74);
  assert.equal(e.settle(sameState,now+120001).videoWatchedSeconds,0);
  assert.equal(e.advance(sameState,now+120001).videoWatchedSeconds,1);
});
test("malformed local storage cannot create negative or infinite counters",()=>{
  const e=engine();
  assert.equal(e.normalize({videoWatchedSeconds:-1,restUntilMs:NaN}).videoWatchedSeconds,0);
  assert.equal(e.normalize({videoWatchedSeconds:Infinity,restUntilMs:Infinity}).videoWatchedSeconds,0);
  assert.equal(e.normalize({videoWatchedSeconds:99999,restUntilMs:0}).videoWatchedSeconds,3600);
});
test("video-rest animation is locally drawn, not a remote image",()=>{
  const sandbox={};sandbox.globalThis=sandbox;
  vm.runInNewContext(read("break-visual.js"),sandbox,{filename:"break-visual.js"});
  const visual=sandbox.ScrollSentinelBreakVisual;
  assert.match(visual.villageSVG, /viewBox="0 0 1100 530"/);
  assert.match(visual.villageSVG, /<svg/);
  assert.match(visual.villageSVG, /<path/);
  assert.match(visual.styles, /rotate\(-360deg\)/);
  assert.match(visual.styles, /prefers-reduced-motion/);
  assert.doesNotMatch(read("break.js"), /\.innerHTML\s*=/);
  assert.doesNotMatch(read("break-visual.js"), /\bfetch\s*\(/);
});
test("manifest loads break engine before background and content-script UI",()=>{
  const manifest=JSON.parse(read("manifest.json"));
  assert.deepEqual(manifest.background.scripts,["schedule.js","break-core.js","background.js"]);
  const breakScripts=manifest.content_scripts.find(s=>s.js.includes("break.js"));
  assert.ok(breakScripts);
  assert.equal(breakScripts.all_frames,true);
  assert.deepEqual(breakScripts.js,["break-core.js","break-visual.js","break.js"]);
  for(const domain of ["youtube.com","facebook.com","tiktok.com","instagram.com"]){
    assert.ok(breakScripts.matches.some(m=>m.includes(domain)), domain+" content-script match");
    assert.ok(manifest.host_permissions.some(m=>m.includes(domain)), domain+" host permission");
  }
  assert.ok(manifest.content_scripts[0].matches.every(p=>/youtube\.com|youtu\.be/.test(p)),
    "site scheduling is still YouTube-only");
  assert.equal(manifest.browser_specific_settings.gecko.data_collection_permissions.required[0],"none");
});
test("background validates a focused tab, supported origin, and YouTube schedule",()=>{
  const source=read("background.js");
  for(const domain of ["youtube.com","facebook.com","instagram.com","tiktok.com"]){
    assert.ok(source.includes(domain));
  }
  assert.match(source,/if \(!\['status','save','tick'\]\.includes\(msg\?\.type\)\) return undefined/);
  assert.match(source,/isVideoPlatform\(sender\.tab\.url\) \|\| !isVideoPlatform\(sender\.url\)/);
  assert.match(source,/if \(!win\.focused \|\| !active\.some\(t => t\.id === sender\.tab\.id\)\)/);
  assert.match(source,/if \(!settings\.allowed\) return Breaks\.view\(current\)/);
  assert.match(source,/api\.storage\.local\.set\(current\)/);
});
test("screen break pauses and does not restart video",()=>{
  const source=read("break.js");
  assert.match(source,/video\.pause\(\)/);
  assert.match(source,/state\?\.resting && event\.target\?\.tagName === 'VIDEO'/);
  assert.match(source,/setInterval\(sample, 1000\)/);
  assert.match(source,/120-remaining/);
  assert.doesNotMatch(source,/video\.play\(\)/);
});
test("popup and Mozilla package include visible Screen Break status",()=>{
  const html=read("popup.html");
  assert.match(html,/id="wellness-status"/);
  assert.match(html,/TikTok/);
  assert.match(read("popup.js"),/type:'videoBreakStatus'/);
  const packageWorkflow=read(".github/workflows/amo-package.yml");
  for(const entry of ["break-core.js","break-visual.js","break.js"]){
    assert.ok(packageWorkflow.includes(entry),entry);
  }
});
