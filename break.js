/* ScrollSentinel Screen Break.
 * Approximate playback timer shared across YouTube, Facebook, TikTok, Instagram.
 * The extension pauses HTML5 video at 60 minutes, then displays a non-skippable
 * two-minute illustration with four 30-second prompts on the top-level tab.
 * It never automatically resumes playback. No user data leaves Firefox.
 */
(() => {
  'use strict';
  if (globalThis.__scrollSentinelBreakInstalled) return;
  globalThis.__scrollSentinelBreakInstalled = true;
  const api = browser;
  const isTop = window === window.top;
  const visual = globalThis.ScrollSentinelBreakVisual;
  const model = globalThis.ScrollSentinelBreak;
  if (!visual || !model) return;
  let state = null, overlay = null, view = null;
  let stageIndex = -1, busy = false, lastIdleCheck = 0;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function svgInto(target) {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(visual.villageSVG, 'image/svg+xml');
    if (parsed.documentElement.localName !== 'svg' ||
        parsed.getElementsByTagName('parsererror').length) return;
    target.appendChild(document.importNode(parsed.documentElement, true));
  }
  function makeOverlay() {
    if (overlay || !isTop || !document.documentElement) return;
    overlay = node('div');
    overlay.id = 'scrollsentinel-rest-screen';
    overlay.style.cssText = 'position:fixed!important;inset:0!important;z-index:2147483647!important;display:block!important;';
    const root = overlay.attachShadow({mode:'closed'});
    const style = node('style');
    style.textContent = visual.styles;
    root.appendChild(style);
    const screen = node('main','rest-screen');
    screen.setAttribute('role','dialog');
    screen.setAttribute('aria-modal','true');
    screen.setAttribute('aria-label','ScrollSentinel video break');
    const backdrop = node('div','backdrop');
    backdrop.setAttribute('aria-hidden','true');
    svgInto(backdrop);
    screen.appendChild(backdrop);
    const panel = node('section','panel');
    panel.appendChild(node('div','overline','🌿 SCROLLSENTINEL · MEADOW RESET'));
    panel.appendChild(node('h1','', 'A moment for your eyes 🌤️'));
    const intro = node('p','subline','You have watched about ');
    intro.append(node('b','', '60 minutes of video'),
      document.createTextNode(' across your social platforms. Playback is paused for a 2-minute reset.'));
    panel.appendChild(intro);
    const artwork = node('div','artwork');
    const face = node('div','face');
    face.setAttribute('aria-hidden','true');
    const eyes = node('div','eyes');
    for (let k = 0; k < 2; k++) {
      const eye = node('div','eye');
      const track = node('div','orbit');
      track.appendChild(node('div','iris'));
      eye.appendChild(track);
      eyes.appendChild(eye);
    }
    face.appendChild(eyes);
    face.appendChild(node('div','face-caption','GENTLE COUNTER-CLOCKWISE GAZE'));
    const breath = node('div','breath-orb','◌');
    breath.setAttribute('aria-hidden','true');
    const walk = node('div','footsteps','🚶');
    walk.setAttribute('aria-hidden','true');
    artwork.append(face,breath,walk);
    panel.appendChild(artwork);
    const phase = node('div','phase-label');
    phase.setAttribute('aria-live','polite');
    const instruction = node('p','instruction');
    panel.append(phase,instruction);
    const timer = node('div','counter','02:00');
    timer.setAttribute('role','timer');
    panel.append(timer,node('div','counter-label','BREAK TIME REMAINING'));
    const progress = node('div','progress');
    const bar = node('div','progress-bar');
    bar.setAttribute('role','progressbar');
    bar.setAttribute('aria-label','Two-minute screen break progress');
    bar.setAttribute('aria-valuemin','0');
    bar.setAttribute('aria-valuemax','120');
    progress.appendChild(bar);
    panel.appendChild(progress);
    const stages = node('div','stages');
    for (const text of ['30s · Eyes','30s · Breathing','30s · Walking','30s · Breathing']) {
      stages.appendChild(node('div','stage',text));
    }
    panel.appendChild(stages);
    const footnote = node('p','footnote',
      'Use comfortable movements only. Stop any exercise if it feels uncomfortable. ');
    footnote.appendChild(node('b','', 'Video will not restart automatically.'));
    panel.appendChild(footnote);
    screen.appendChild(panel);
    root.appendChild(screen);
    document.documentElement.appendChild(overlay);
    view = {face,breath,walk,phase,instruction,timer,bar,stages:Array.from(stages.children)};
    stageIndex = -1;
  }
  function removeOverlay() {
    if (overlay) overlay.remove();
    overlay = null;
    view = null;
    stageIndex = -1;
  }
  function pauseVideos() {
    for (const video of document.querySelectorAll('video')) {
      if (!video.paused) {
        try { video.pause(); } catch (_) {}
      }
    }
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(()=>{});
    }
  }
  function playingVisibleVideo() {
    if (document.visibilityState !== 'visible') return false;
    for (const video of document.querySelectorAll('video')) {
      if (video.paused || video.ended || video.readyState < 2 ||
          video.playbackRate <= 0) continue;
      const rect = video.getBoundingClientRect();
      if (rect.width < 60 || rect.height < 40) continue;
      const left = Math.max(0, rect.left), top = Math.max(0, rect.top);
      const right = Math.min(window.innerWidth, rect.right);
      const bottom = Math.min(window.innerHeight, rect.bottom);
      const visibleArea = Math.max(0,right-left) * Math.max(0,bottom-top);
      if (visibleArea >= 0.15 * rect.width * rect.height) return true;
    }
    return false;
  }
  function render() {
    if (!state?.resting) return;
    pauseVideos();
    if (!isTop) return;
    makeOverlay();
    if (!view) return;
    // Use a shared deadline so refreshes and visits to another site do not
    // restart the rest timer or prematurely unlock video playback.
    const remaining = Math.max(0,Math.ceil((state.restUntilMs - Date.now())/1000));
    const elapsed = Math.min(120,120-remaining);
    const index = Math.min(3,Math.floor(elapsed/30));
    if (index !== stageIndex) {
      stageIndex = index;
      const stage = model.stages[index];
      view.phase.textContent =
        String(index+1).padStart(2,'0')+' / 04 · '+stage.label;
      view.instruction.textContent = stage.instruction;
      view.face.hidden = index !== 0;
      view.breath.hidden = index !== 1 && index !== 3;
      view.walk.hidden = index !== 2;
      for (let n=0;n<4;n++) {
        view.stages[n].classList.toggle('active',n===index);
        view.stages[n].classList.toggle('done',n<index);
      }
      if (index === 0) {
        const passed = Math.max(0,30-Math.max(1,remaining-90));
        for (const orbit of view.face.querySelectorAll('.orbit')) {
          orbit.style.setProperty('--eye-delay', '-'+passed+'s');
        }
      }
    }
    view.timer.textContent =
      String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');
    view.bar.style.width = (elapsed/120*100)+'%';
    view.bar.setAttribute('aria-valuenow',String(elapsed));
  }
  function update(next) {
    if (!next || typeof next.restUntilMs !== 'number') return;
    state = next;
    if (state.resting) render();
    else removeOverlay();
  }
  async function sample() {
    if (busy) return;
    const now = Date.now();
    if (state?.resting) render();
    const playing = !state?.resting && playingVisibleVideo();
    if (!playing && !state?.resting && now - lastIdleCheck < 4000) return;
    if (!playing) lastIdleCheck = now;
    busy = true;
    try {
      const response = await api.runtime.sendMessage(playing
        ? {type:'videoActivity',playing:true}
        : {type:'videoBreakStatus'});
      update(response);
    } catch (_) {
      // Extension may be reloading or unloading; leave the website usable.
    } finally {
      busy = false;
    }
  }
  // Prevent websites from immediately auto-restarting the paused video.
  document.addEventListener('play', event => {
    if (state?.resting && event.target?.tagName === 'VIDEO') {
      try { event.target.pause(); } catch (_) {}
    }
  },true);
  api.runtime.onMessage.addListener(message => {
    if (message?.type === 'videoBreak') update(message.state);
  });
  sample();
  setInterval(sample, 1000);
})();
