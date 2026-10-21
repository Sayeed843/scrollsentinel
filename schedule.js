/* ScrollSentinel daily schedule model.
 * Compatible with saved two-window settings from previous releases.
 * Selected: min 2, max 3. The first two slots cannot be deleted.
 * Every slot can be edited; optional custom slots can be removed.
 * Every configured range must be nonoverlapping (even when unchecked).
 * Uses the device's local time, just as earlier versions did.
 */
(() => {
  'use strict';
  const defaults = [
    {start:'12:00', end:'14:00', selected:true},
    {start:'22:00', end:'23:30', selected:true}
  ];
  const validTime = time => typeof time === 'string' &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const minute = time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  function normalizeWindows(windows) {
    if (!Array.isArray(windows) || windows.length < 2 || windows.length > 4) {
      return defaults.map(w => ({...w}));
    }
    return windows.map(window => ({
      start: typeof window?.start === 'string' ? window.start : '',
      end: typeof window?.end === 'string' ? window.end : '',
      // Older releases did not have a selection flag. Both were enabled.
      selected: window?.selected !== false
    }));
  }
  const activeWindows = windows =>
    normalizeWindows(windows).filter(w => w.selected);
  const selectedCount = windows => activeWindows(windows).length;
  const completeWindow = w =>
    Boolean(w && validTime(w.start) && validTime(w.end) && w.start !== w.end);

  // Overnight ranges split at midnight. Endpoints are exclusive, so two
  // schedules may meet at 14:00 without counting as overlapping.
  function segments(window) {
    const start = minute(window.start), end = minute(window.end);
    return start < end ? [[start, end]] : [[start, 1440], [0, end]];
  }
  function overlaps(left, right) {
    if (!completeWindow(left) || !completeWindow(right)) return false;
    return segments(left).some(([a,b]) =>
      segments(right).some(([c,d]) => a < d && c < b));
  }
  function validateWindows(windows) {
    if (!Array.isArray(windows) || windows.length < 2 || windows.length > 4) {
      return 'Keep the 2 original schedules; you may add up to 2 more.';
    }
    for (let i = 0; i < windows.length; i++) {
      const w = windows[i];
      if (!w || typeof w.selected !== 'boolean') {
        return 'Invalid selection in schedule ' + (i + 1) + '.';
      }
      if (!completeWindow(w)) {
        return 'Set valid and different start/end times for schedule ' + (i + 1) + '.';
      }
    }
    for (let i = 0; i < windows.length; i++) {
      for (let j = i + 1; j < windows.length; j++) {
        if (overlaps(windows[i], windows[j])) {
          return 'Schedule ' + (i + 1) + ' overlaps schedule ' + (j + 1) +
            '. Change their times to avoid overlap.';
        }
      }
    }
    const count = windows.filter(w => w.selected).length;
    if (count < 2 || count > 3) {
      return 'Select at least 2 and no more than 3 schedules.';
    }
    return null;
  }
  const inside = (window, minutes) => {
    if (!completeWindow(window)) return false;
    const start = minute(window.start), end = minute(window.end);
    return start < end
      ? minutes >= start && minutes < end
      : minutes >= start || minutes < end; // Supports overnight windows.
  };
  const scheduleAllows = (settings, now = new Date()) =>
    !settings.enabled ||
    activeWindows(settings.windows).some(w => inside(w, now.getHours() * 60 + now.getMinutes()));

  function nextStartSeconds(windows, now = new Date()) {
    const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const starts = activeWindows(windows)
      .filter(completeWindow)
      .map(w => ((minute(w.start) - minutes + 1440) % 1440) * 60);
    return starts.length ? Math.min(...starts) : null;
  }
  globalThis.ScrollSentinelSchedule = Object.freeze({
    defaults: defaults.map(w => ({...w})),
    validTime, normalizeWindows, activeWindows, selectedCount,
    validateWindows, overlaps, scheduleAllows, nextStartSeconds, inside
  });
})();
