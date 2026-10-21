/* ScrollSentinel: shared video-break state machine.
 * Every 60 minutes of observed, foreground video playback across supported
 * sites triggers a 120-second wellness break (four 30-second stages).
 * State persists locally and does not reset at midnight or on tab reload.
 */
(() => {
  'use strict';
  const WATCH_SECONDS = 60 * 60;
  const REST_SECONDS = 2 * 60;
  const STAGE_SECONDS = 30;
  const stages = Object.freeze([
    Object.freeze({id:'eyes', label:'GENTLE EYE MOVEMENT', instruction:'Trace a comfortable counter-clockwise circle with your gaze. Stop if it feels uncomfortable.'}),
    Object.freeze({id:'breath1', label:'BREATHE SLOWLY', instruction:'Relax your shoulders. Breathe in gently, then breathe out slowly.'}),
    Object.freeze({id:'walk', label:'TAKE A SHORT WALK', instruction:'Stand up if comfortable and take a few steps away from the screen.'}),
    Object.freeze({id:'breath2', label:'ONE MORE DEEP BREATH', instruction:'Breathe slowly once more. The screen can wait until you finish.'})
  ]);
  const number = value => Number.isFinite(value) ? Math.floor(value) : 0;
  const normalize = input => ({
    videoWatchedSeconds: Math.max(0, Math.min(WATCH_SECONDS, number(input?.videoWatchedSeconds))),
    restUntilMs: Math.max(0, number(input?.restUntilMs))
  });
  function settle(input, now = Date.now()) {
    const s = normalize(input);
    if (s.restUntilMs && now >= s.restUntilMs) {
      return {videoWatchedSeconds:0, restUntilMs:0};
    }
    return s;
  }
  function view(input, now = Date.now()) {
    const s = settle(input, now);
    const remainingMs = Math.max(0, s.restUntilMs - now);
    const remaining = remainingMs ? Math.ceil(remainingMs / 1000) : 0;
    const elapsed = remaining ? REST_SECONDS - remaining : 0;
    const index = remaining ? Math.min(3, Math.floor(elapsed / STAGE_SECONDS)) : -1;
    return {
      resting: remaining > 0,
      restUntilMs: s.restUntilMs,
      restRemainingSeconds: remaining,
      watchedSeconds: s.videoWatchedSeconds,
      secondsUntilBreak: WATCH_SECONDS - s.videoWatchedSeconds,
      stageIndex: index,
      stageRemainingSeconds: remaining ? STAGE_SECONDS - (elapsed % STAGE_SECONDS) : 0
    };
  }
  function advance(input, now = Date.now()) {
    const s = settle(input, now);
    if (s.restUntilMs) return s;
    const watched = Math.min(WATCH_SECONDS, s.videoWatchedSeconds + 1);
    return {
      videoWatchedSeconds: watched,
      restUntilMs: watched >= WATCH_SECONDS ? now + REST_SECONDS * 1000 : 0
    };
  }
  globalThis.ScrollSentinelBreak = Object.freeze({
    WATCH_SECONDS, REST_SECONDS, STAGE_SECONDS, stages,
    normalize, settle, view, advance
  });
})();
