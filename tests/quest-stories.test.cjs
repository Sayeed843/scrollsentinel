"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(projectRoot, name), "utf8");

function createStoryEngine() {
  const script = read("quest-stories.js");
  // Minimal DOMParser/DOM adapter. It records the parsed trusted SVG markup
  // so the Node tests can check scene content without browser dependencies.
  // Real XML/Firefox rendering is still a separate browser acceptance test.
  const sandbox = {
    document: {
      createElementNS(namespaceURI, tagName) {
        return {
          namespaceURI,
          tagName,
          attributes: {},
          innerHTML: "",
          setAttribute(name, value) { this.attributes[name] = value; },
          appendChild(node) { this.innerHTML += node.markup; }
        };
      },
      importNode(node) { return node; }
    },
    DOMParser: class {
      parseFromString(markup, type) {
        assert.equal(type, "image/svg+xml");
        assert.match(markup, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg">/);
        return {
          documentElement: {
            localName: "svg",
            childNodes: [{ markup: markup.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "") }]
          },
          getElementsByTagName() { return []; }
        };
      }
    }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(script, sandbox, { filename: "quest-stories.js", timeout: 1000 });
  return sandbox.ScrollSentinelStories;
}

const names = [
  "packets", "access", "patch", "hash", "mfa",
  "shield", "terminal", "radar", "phishing", "triad", "code"
];

test("all 11 additional illustrated stories are registered", () => {
  const engine = createStoryEngine();
  assert.deepEqual(Array.from(engine.storyTypes), names);
  assert.equal(engine.create("nonexistent"), null);
});

test("each story generates nonempty balanced SVG content with success outcome", () => {
  const engine = createStoryEngine();
  for (const name of names) {
    const node = engine.create(name);
    assert.equal(node.tagName, "svg", name);
    assert.equal(node.attributes.viewBox, "0 0 520 260", name);
    assert.ok(node.innerHTML.length > 900, name);
    const opened = (node.innerHTML.match(/<g(?=[\s>])/g) || []).length;
    const closed = (node.innerHTML.match(/<\/g>/g) || []).length;
    assert.equal(opened, closed, name + ": SVG group tags must balance");
    assert.match(node.innerHTML, /🎉|✓|🏆/, name + ": needs a completion state");
    assert.match(node.innerHTML, /ss-enter/, name + ": needs step-by-step reveal");
  }
});

test("phishing and patching have clear before-and-after outcomes", () => {
  const engine = createStoryEngine();
  assert.match(engine.create("phishing").innerHTML, /SCAMMER/);
  assert.match(engine.create("phishing").innerHTML, /REPORTED/);
  assert.match(engine.create("patch").innerHTML, /version 1.0/);
  assert.match(engine.create("patch").innerHTML, /version 1.1/);
});

test("Least Privilege lock does not cover DATA card text", () => {
  const engine = createStoryEngine();
  const svg = engine.create("access").innerHTML;
  // DATA card: x=382..490, y=97..169. The padlock extends roughly
  // 17px horizontally and from -20px to +26px vertically from its anchor.
  const dataCard = {left: 382, right: 490, top: 97, bottom: 169};
  assert.match(svg, /DATA/);
  assert.match(svg, /sensitive/);
  const match = svg.match(/transform="translate\((\d+) (\d+)\)"[^>]*><path d="M-10 0v-10/);
  assert.ok(match, "Padlock position should be identifiable in the SVG");
  const [x, y] = match.slice(1).map(Number);
  const padlock = {left: x-17, right: x+17, top: y-20, bottom: y+26};
  const overlaps = padlock.left < dataCard.right &&
    padlock.right > dataCard.left &&
    padlock.top < dataCard.bottom &&
    padlock.bottom > dataCard.top;
  assert.equal(overlaps, false, "Lock must remain outside the DATA card");
});

test("Mozilla validation warning: no unsafe innerHTML writes", () => {
  for (const sourceFile of ["guard.js", "quest-stories.js"]) {
    assert.doesNotMatch(
      read(sourceFile), /\.innerHTML\s*=/,
      sourceFile + " must use inert parsing and imported DOM nodes"
    );
  }
  assert.match(read("guard.js"), /appendTrustedMarkup\(panel, panelMarkup\)/);
  assert.match(read("quest-stories.js"), /new DOMParser\(\)\.parseFromString/);
});

test("the scenes are implemented locally and support reduced motion", () => {
  const engine = createStoryEngine();
  assert.match(engine.styles, /prefers-reduced-motion/);
  assert.match(engine.styles, /ss-draw/);
  // The standard SVG xmlns URL is a namespace identifier, not a network call.
  assert.doesNotMatch(read("quest-stories.js"), /\b(fetch\s*\(|XMLHttpRequest|WebSocket|import\s*\()/);
});

test("Firefox loads the story engine before the guarding UI", () => {
  const manifest = JSON.parse(read("manifest.json"));
  const scriptNames = manifest.content_scripts[0].js;
  assert.deepEqual(scriptNames, ["quest-stories.js", "guard.js"]);
  assert.equal(manifest.name, "ScrollSentinel");
  assert.deepEqual(Array.from(manifest.browser_specific_settings.gecko.data_collection_permissions.required), ["none"]);
  assert.equal(manifest.browser_specific_settings.gecko.id, "youtube-focus-hours@example.org");
});

test("quest rotates every 30 minutes, each story replays every 5 minutes", () => {
  const guard = read("guard.js");
  assert.doesNotThrow(() => new vm.Script(guard, {filename: "guard.js"}));
  assert.match(guard, /MOTIVATION_INTERVAL_MS\s*=\s*30\s*\*\s*60\s*\*\s*1000/);
  assert.match(guard, /STORY_REPLAY_INTERVAL_MS\s*=\s*5\s*\*\s*60\s*\*\s*1000/);
  assert.match(guard, /function replayCurrentQuestStory\(/);
  assert.match(guard, /makeNetworkPeopleAnimation\(\)/);
  assert.match(guard, /net-celebration/);
  assert.match(guard, /document\.visibilityState\s*!==\s*'visible'/);
  assert.match(guard, /setInterval\(replayCurrentQuestStory,\s*1000\)/);
});

test("the extension still targets YouTube only in this release", () => {
  const manifest = JSON.parse(read("manifest.json"));
  assert.ok(manifest.content_scripts[0].matches.every(s => /youtube\.com|youtu\.be/.test(s)));
  assert.ok(manifest.host_permissions.every(s => /youtube\.com|youtu\.be/.test(s)));
});

test("Firefox extension and toolbar icons use correctly sized PNG assets", () => {
  const manifest = JSON.parse(read("manifest.json"));
  for (const [size, relativePath] of Object.entries(manifest.icons)) {
    assert.ok(relativePath.endsWith(".png"), "Expected PNG: " + relativePath);
    const bytes = fs.readFileSync(path.join(projectRoot, relativePath));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", relativePath);
    assert.equal(bytes.readUInt32BE(16), Number(size), relativePath + " width");
    assert.equal(bytes.readUInt32BE(20), Number(size), relativePath + " height");
  }
  for (const [size, relativePath] of Object.entries(manifest.action.default_icon)) {
    assert.equal(relativePath, manifest.icons[size]);
  }
  assert.ok(read("popup.html").includes('src="icons/scrollsentinel-48.png"'));
  assert.ok(read(".github/workflows/amo-package.yml").includes("icons/scrollsentinel-*.png"));
});
