"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");

test("new Firefox options page opens in a full tab and is bundled for AMO", () => {
  const m = JSON.parse(read("manifest.json"));
  assert.equal(m.version, "2.8.0");
  assert.deepEqual(m.options_ui,{page:"options.html",open_in_tab:true});
  assert.equal(m.action.default_popup,"popup.html");
  assert.match(read("popup.js"),/runtime\.openOptionsPage\(\)/);
  const workflow=read(".github/workflows/amo-package.yml");
  assert.match(workflow,/options\.html options\.js/);
});

test("popup displays a compact dashboard rather than editable schedule fields", () => {
  const popup=read("popup.html");
  assert.match(popup,/width:354px/);
  assert.match(popup,/id="status"/);
  assert.match(popup,/id="used-min"/);
  assert.match(popup,/id="break-min"/);
  assert.match(popup,/id="window-chips"/);
  assert.match(popup,/id="enabled"/);
  assert.match(popup,/id="distractionFree"/);
  assert.match(popup,/id="strict-state"/);
  assert.match(popup,/id="open-settings"/);
  assert.doesNotMatch(popup,/type="time"/);
  assert.doesNotMatch(popup,/id="lockDays"/);
  assert.doesNotMatch(popup,/id="schedule-list"/);
  assert.doesNotMatch(popup,/id="dailyLimit"/);
  assert.doesNotMatch(popup,/id="save"/);
  assert.doesNotMatch(read("popup.js"),/\bconfirm\s*\(/);
});

test("options editor is spacious, responsive and renders 24-hour time inputs", () => {
  const html=read("options.html");
  assert.match(html,/<meta name="viewport"/);
  assert.match(html,/width:min\(1080px/);
  assert.match(html,/@media\(max-width:620px\)/);
  assert.match(html,/id="schedule-list"/);
  assert.match(html,/id="add-schedule"/);
  assert.match(html,/id="selection-count"/);
  assert.match(html,/id="schedule-error"/);
  assert.match(html,/id="save"/);
  assert.match(html,/24-hour HH:MM/);
  assert.doesNotMatch(html,/type="time"/);
  const javascript=read("options.js");
  assert.match(javascript,/input\.type = 'text'/);
  assert.match(javascript,/input\.placeholder = 'HH:MM'/);
  assert.match(javascript,/Schedule\.validateWindows\(windows\)/);
  assert.match(javascript,/index < 2/);
  assert.match(javascript,/windows\.splice\(index,1\)/);
  assert.match(javascript,/activeCount\(\) <= 2/);
});

test("Strict Mode asks for inline, informed consent rather than browser confirm", () => {
  const html=read("options.html");
  const code=read("options.js");
  assert.match(html,/id="lock-consent-row"/);
  assert.match(html,/id="lock-consent"/);
  assert.match(html,/locks all ScrollSentinel settings/);
  assert.match(code,/if \(days && !el\('lock-consent'\)\.checked\)/);
  assert.match(code,/consentRequired/);
  assert.match(code,/el\('save'\)\.disabled = saving \|\| locked \|\| Boolean\(error\) \|\| consentRequired/);
  assert.doesNotMatch(code,/\bconfirm\s*\(/);
  assert.doesNotMatch(code,/\balert\s*\(/);
});

test("quick controls respect Strict Mode and preserve current windows", () => {
  const js=read("popup.js");
  assert.match(js,/current\.locked/);
  assert.match(js,/if \(latest\.locked\) throw new Error/);
  assert.match(js,/Schedule\.normalizeWindows\(latest\.windows\)/);
  assert.match(js,/lockDays: 0/);
  assert.match(js,/key === 'enabled'/);
  assert.match(js,/key === 'distractionFree'/);
  assert.match(js,/const latest = await api\.runtime\.sendMessage\(\{type:'status'\}\)/);
});

test("content security: extension pages use local scripts and safe DOM APIs", () => {
  for (const page of ["popup.html","options.html"]) {
    const html=read(page);
    assert.doesNotMatch(html,/<script[^>]*src="https?:\/\//);
    assert.doesNotMatch(html,/<script(?![^>]*\bsrc)[^>]*>[\s\S]*?<\/script>/);
  }
  for (const file of ["popup.js","options.js"]) {
    const code=read(file);
    assert.doesNotThrow(()=>new vm.Script(code,{filename:file}));
    assert.doesNotMatch(code,/\.innerHTML\s*=/);
  }
});
