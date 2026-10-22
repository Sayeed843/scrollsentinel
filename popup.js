/* ScrollSentinel compact popup. Detailed editing lives on options.html. */
'use strict';
const api = browser;
const Schedule = globalThis.ScrollSentinelSchedule;
const el = id => document.getElementById(id);
let current = null;
let busy = false;

function feedback(message = '', isSuccess = false) {
  const box = el('feedback');
  box.textContent = message;
  box.classList.toggle('hidden', !message);
  box.classList.toggle('success', isSuccess);
}
function controls() {
  const unavailable = busy || !current || current.locked;
  el('enabled').disabled = unavailable;
  el('distractionFree').disabled = unavailable;
}
function updateStatus(state) {
  const enabled = state.enabled;
  const allowed = state.allowed;
  const title = !enabled ? 'YouTube blocking off' : allowed ? 'YouTube is available' : 'YouTube is blocked';
  el('status').textContent = title;
  el('status-dot').classList.toggle('allow', allowed);
  el('status-description').textContent = !enabled
    ? 'Schedule protection is currently switched off.'
    : allowed
      ? 'Enjoy your selected viewing time mindfully.'
      : state.scheduled
        ? 'Today’s browsing allowance is exhausted.'
        : 'Outside your selected viewing hours.';
}
function render(status, eyeBreak) {
  current = status;
  updateStatus(status);
  el('enabled').checked = status.enabled;
  el('distractionFree').checked = status.distractionFree;
  const used = Math.floor(status.usedSeconds / 60);
  el('used-min').textContent = String(used);
  el('daily-limit').textContent = String(status.dailyLimit);
  el('usage-bar').style.width = Math.min(100, Math.max(0, used / status.dailyLimit * 100)) + '%';
  if (eyeBreak.resting) {
    el('break-min').textContent = String(eyeBreak.restRemainingSeconds);
    el('break-unit').textContent = 'sec rest';
    el('break-bar').style.width = Math.max(0, 100 - eyeBreak.restRemainingSeconds / 120 * 100) + '%';
  } else {
    el('break-min').textContent = String(Math.ceil(eyeBreak.secondsUntilBreak / 60));
    el('break-unit').textContent = 'min left';
    el('break-bar').style.width = Math.max(0, (60 - eyeBreak.secondsUntilBreak / 60) / 60 * 100) + '%';
  }
  const selected = Schedule.activeWindows(status.windows);
  const chips = el('window-chips');
  chips.replaceChildren();
  for (const interval of selected) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = interval.start + ' – ' + interval.end;
    chips.appendChild(chip);
  }
  if (!selected.length) {
    const empty = document.createElement('span');
    empty.className = 'no-windows';
    empty.textContent = 'No active windows';
    chips.appendChild(empty);
  }
  el('schedule-total').textContent = '· ' + selected.length + ' active';
  el('strict-state').textContent = status.locked
    ? '🔒 Strict Mode active until ' + new Date(status.lockUntil).toLocaleString()
    : '🔓 Strict Mode is off · schedules editable in Settings';
  controls();
}
async function refresh() {
  const [status, eyeBreak] = await Promise.all([
    api.runtime.sendMessage({type:'status'}),
    api.runtime.sendMessage({type:'videoBreakStatus'})
  ]);
  render(status, eyeBreak);
}
async function saveQuickSetting(key, checked) {
  if (!current || busy || current.locked) return;
  busy = true;
  controls();
  feedback('');
  try {
    // Always save the latest settings to avoid overwriting edits from an open
    // Options tab or changes to schedule selection since popup opening.
    const latest = await api.runtime.sendMessage({type:'status'});
    if (latest.locked) throw new Error('Strict Mode is active; settings are locked.');
    const response = await api.runtime.sendMessage({
      type:'save',
      enabled: key === 'enabled' ? checked : latest.enabled,
      distractionFree: key === 'distractionFree' ? checked : latest.distractionFree,
      windows: Schedule.normalizeWindows(latest.windows),
      dailyLimit: latest.dailyLimit,
      lockDays: 0
    });
    if (!response?.ok) throw new Error(response?.error || 'The setting was not saved.');
    await refresh();
    feedback('✓ Quick setting saved', true);
  } catch (error) {
    feedback(String(error?.message || error));
    try { await refresh(); } catch (_) {}
  } finally {
    busy = false;
    controls();
  }
}
el('enabled').addEventListener('change', event => saveQuickSetting('enabled', event.target.checked));
el('distractionFree').addEventListener('change', event => saveQuickSetting('distractionFree', event.target.checked));
el('open-settings').addEventListener('click', async () => {
  feedback('');
  try {
    await api.runtime.openOptionsPage();
    window.close();
  } catch (error) {
    feedback('Could not open Settings: ' + String(error?.message || error));
  }
});
refresh().catch(error => {
  feedback('Unable to load ScrollSentinel settings: ' + String(error?.message || error));
  controls();
});