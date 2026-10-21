"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = filename => fs.readFileSync(path.join(root, filename), "utf8");
function schedule() {
  const sandbox = {};
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read("schedule.js"), sandbox, {filename: "schedule.js"});
  return sandbox.ScrollSentinelSchedule;
}
const w = (start, end, selected = true) => ({start, end, selected});
const original = () => [w("12:00", "14:00"), w("22:00", "23:30")];

test("old two-window settings migrate with both slots selected", () => {
  const model = schedule();
  const prev = [{start: "12:00",end:"14:00"},{start:"22:00",end:"23:30"}];
  const migrated = model.normalizeWindows(prev);
  assert.equal(migrated.length, 2);
  assert.equal(model.selectedCount(migrated), 2);
  assert.equal(model.validateWindows(migrated), null);
  assert.equal(migrated[0].start, "12:00");
  assert.equal(migrated[1].end, "23:30");
});

test("exactly two or three selected schedules are allowed; four is rejected", () => {
  const model = schedule();
  assert.equal(model.validateWindows(original()), null);
  const four = [...original(), w("07:00","08:00",false),w("17:00","18:00",true)];
  assert.equal(model.validateWindows(four), null);
  four[2].selected = true;
  assert.match(model.validateWindows(four), /no more than 3/);
  four[0].selected = false;
  four[1].selected = false;
  four[3].selected = false;
  assert.match(model.validateWindows(four), /at least 2/);
  assert.match(model.validateWindows([w("12:00","13:00")]), /2 original/);
  assert.match(model.validateWindows([...four, w("18:00","19:00")]), /up to 2/);
});

test("overlap is forbidden even when one of the schedules is unchecked", () => {
  const model = schedule();
  const schedules = [...original(),w("13:30","15:00",false)];
  assert.match(model.validateWindows(schedules), /overlaps schedule 3/);
  assert.equal(model.overlaps(schedules[0],schedules[2]),true);
});

test("back-to-back intervals are valid and editable originals are supported", () => {
  const model = schedule();
  const times = [w("10:00","11:45"),w("20:00","23:30",false),w("11:45","12:20",true)];
  assert.equal(model.validateWindows(times),null);
  assert.equal(model.overlaps(times[0],times[2]),false);
});

test("overnight overlap is rejected across midnight", () => {
  const model = schedule();
  assert.equal(model.overlaps(w("22:00","01:00"), w("00:30","02:00")), true);
  assert.equal(model.overlaps(w("23:00","00:30"), w("00:30","02:00")), false);
  assert.equal(model.overlaps(w("22:00","01:00"), w("12:00","14:00")), false);
  assert.match(model.validateWindows([w("22:00","01:00"),w("00:30","02:00")]), /overlaps/);
});

test("invalid or missing times cannot be saved, including custom slots", () => {
  const model = schedule();
  assert.match(model.validateWindows([...original(),w("","",false)]), /start\/end/);
  assert.match(model.validateWindows([w("15:00","15:00"),original()[1]]), /start\/end/);
  assert.match(model.validateWindows([w("25:00","26:00"),original()[1]]), /start\/end/);
  assert.match(model.validateWindows([w("12:00","14:00",true),{start:"22:00",end:"23:30",selected:undefined}]), /selection/);
});

test("unchecked slots never grant YouTube access", () => {
  const model = schedule();
  const settings = {enabled: true, windows: [w("12:00","14:00",false),w("22:00","23:30",true),w("16:00","17:00",true)]};
  assert.equal(model.scheduleAllows(settings, new Date(2026,9,22,13,0)),false);
  assert.equal(model.scheduleAllows(settings, new Date(2026,9,22,16,30)),true);
  assert.equal(model.scheduleAllows(settings, new Date(2026,9,22,22,15)),true);
  assert.equal(model.scheduleAllows({...settings,enabled:false},new Date(2026,9,22,10,0)),true);
});

test("countdown uses only checked schedules", () => {
  const model = schedule();
  const windows = [w("12:00","14:00",false), w("22:00","23:30"),w("17:00","19:00")];
  assert.equal(model.nextStartSeconds(windows,new Date(2026,9,22,16,0,0)),3600);
  assert.equal(model.nextStartSeconds(windows,new Date(2026,9,22,18,0,0)),4*3600);
});

test("manifest and UI load the shared schedule script in the right order", () => {
  const manifest = JSON.parse(read("manifest.json"));
  assert.deepEqual(manifest.background.scripts, ["schedule.js","background.js"]);
  assert.deepEqual(manifest.content_scripts[0].js, ["schedule.js","quest-stories.js","guard.js"]);
  const popup = read("popup.html");
  assert.ok(popup.indexOf('src="schedule.js"') < popup.indexOf('src="popup.js"'));
  assert.match(popup, /id="add-schedule"/);
  assert.match(popup, /id="schedule-list"/);
  const background = read("background.js");
  assert.match(background, /Schedule\.validateWindows\(msg\.windows\)/);
  assert.match(background, /s\.windows=Schedule\.normalizeWindows\(s\.windows\)/);
  const guard = read("guard.js");
  assert.match(guard, /Schedule\.activeWindows\(state\.windows\)/);
  assert.match(guard, /Schedule\.nextStartSeconds\(windows\)/);
});

test("Strict Mode continues to guard all settings including schedules", () => {
  const code = read("background.js");
  assert.match(code, /if\(s\.lockUntil>Date\.now\(\)\)return \{ok:false/);
  const popup = read("popup.js");
  assert.match(popup, /el\(id\)\.disabled = locked \|\| working/);
  assert.match(popup, /del\.disabled = locked \|\| working/);
  assert.match(popup, /index < 2/); // first two slots never offer delete
  assert.match(popup, /windows\.splice\(index, 1\)/); // only custom delete
  assert.match(popup, /selectionCount\(\) <= 2/);
});
