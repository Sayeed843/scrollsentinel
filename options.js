/* ScrollSentinel full Settings tab.
 * Original schedule slots are always present; only custom slots can be removed.
 * Shared background model enforces every limit (including Strict Mode).
 */
'use strict';
const api = browser;
const Schedule = globalThis.ScrollSentinelSchedule;
const el = id => document.getElementById(id);
let windows = Schedule.defaults.map(w => ({...w}));
let locked = false;
let saving = false;
let message = '';
let messageIsError = false;

function node(tag, cls, text) {
  const item = document.createElement(tag);
  if (cls) item.className = cls;
  if (text !== undefined) item.textContent = text;
  return item;
}
function notice(text, isError = false) {
  message = text;
  messageIsError = isError;
  validate();
}
function activeCount() {
  return windows.filter(w => w.selected).length;
}
function updateConsent() {
  const requestedDays = Number(el('lockDays').value);
  const row = el('lock-consent-row');
  row.classList.toggle('hidden', !requestedDays || locked);
  el('lock-consent').disabled = locked || saving || !requestedDays;
}
function validate() {
  const error = Schedule.validateWindows(windows);
  const consentRequired = !locked && Number(el('lockDays').value) > 0 &&
    !el('lock-consent').checked;
  el('selection-count').textContent =
    activeCount() + ' of ' + windows.length + ' schedules selected · 2–3 required';
  el('add-schedule').disabled = locked || saving || windows.length >= 4;
  el('save').disabled = saving || locked || Boolean(error) || consentRequired;
  el('schedule-error').textContent = error ||
    (messageIsError ? message : '✓ No overlapping schedules');
  el('schedule-error').classList.toggle('good', !error && !messageIsError);
  if (error || consentRequired) {
    el('save-feedback').textContent = error ||
      'Confirm Strict Mode before saving the ' + el('lockDays').value + '-day lock.';
    el('save-feedback').classList.remove('good');
  } else if (message) {
    el('save-feedback').textContent = message;
    el('save-feedback').classList.toggle('good', !messageIsError);
  } else {
    el('save-feedback').textContent = 'Ready to save your focus preferences.';
    el('save-feedback').classList.add('good');
  }
  return error;
}
function renderSchedules() {
  const list = el('schedule-list');
  list.replaceChildren();
  windows.forEach((interval, index) => {
    const original = index < 2;
    const card = node('article', 'schedule-card');
    if (!interval.selected) card.classList.add('unselected');
    const meta = node('div', 'schedule-meta');
    const checkboxLabel = node('label', 'schedule-title');
    const checkbox = node('input');
    checkbox.type = 'checkbox';
    checkbox.checked = interval.selected;
    checkbox.disabled = locked || saving;
    checkbox.setAttribute('aria-label', 'Select schedule ' + (index+1));
    checkbox.addEventListener('change', () => {
      const old = interval.selected;
      interval.selected = checkbox.checked;
      const count = activeCount();
      if (count < 2 || count > 3) {
        interval.selected = old;
        checkbox.checked = old;
        notice(count < 2
          ? 'At least two schedules must remain selected.'
          : 'You can select at most three schedules.', true);
      } else {
        card.classList.toggle('unselected', !interval.selected);
        notice('Changes are not saved yet.');
      }
    });
    checkboxLabel.append(
      checkbox,
      node('span', 'schedule-number', String(index+1)),
      node('span','', 'Schedule ' + (index+1))
    );
    meta.appendChild(checkboxLabel);
    if (original) {
      meta.appendChild(node('span','schedule-origin','Original · editable, cannot delete'));
    } else {
      const remove = node('button','delete','Delete custom schedule');
      remove.type = 'button';
      remove.disabled = locked || saving;
      remove.setAttribute('aria-label','Delete custom schedule ' + (index+1));
      remove.addEventListener('click', () => {
        if (interval.selected && activeCount() <= 2) {
          notice('Select another schedule before deleting this selected one.', true);
          return;
        }
        windows.splice(index,1);
        message = 'Custom schedule removed. Save to keep this change.';
        messageIsError = false;
        renderSchedules();
      });
      meta.appendChild(remove);
    }
    const timeGroup = node('div','time-group');
    for (const [key,caption] of [['start','Starts at'],['end','Ends at']]) {
      if (key === 'end') timeGroup.appendChild(node('span','time-arrow','→'));
      const label = node('label','time-label');
      label.appendChild(node('span','',caption));
      const input = node('input');
      input.type = 'text'; // Always 24-hour HH:MM regardless of OS locale.
      input.inputMode = 'numeric';
      input.maxLength = 5;
      input.placeholder = 'HH:MM';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.value = interval[key] || '';
      input.disabled = locked || saving;
      input.setAttribute('aria-label','Schedule '+(index+1)+' '+caption.toLowerCase()+' in 24-hour format');
      input.addEventListener('input', () => {
        interval[key] = input.value.trim();
        notice('Changes are not saved yet.');
      });
      label.appendChild(input);
      timeGroup.appendChild(label);
    }
    card.append(meta,timeGroup);
    list.appendChild(card);
  });
  validate();
}
function toggleInputs() {
  for (const id of ['enabled','dailyLimit','distractionFree','lockDays']) {
    el(id).disabled = locked || saving;
  }
  updateConsent();
  renderSchedules();
}
async function load() {
  const [s, eyeBreak] = await Promise.all([
    api.runtime.sendMessage({type:'status'}),
    api.runtime.sendMessage({type:'videoBreakStatus'})
  ]);
  windows = Schedule.normalizeWindows(s.windows);
  locked = s.locked;
  el('enabled').checked = s.enabled;
  el('dailyLimit').value = s.dailyLimit;
  el('distractionFree').checked = s.distractionFree;
  el('lockDays').value = '0';
  el('lock-consent').checked = false;
  el('status').textContent = !s.enabled ? '● Schedule protection off' :
    s.allowed ? '● YouTube available now' : '● YouTube blocked now';
  el('usage').textContent = 'Today: ' + Math.floor(s.usedSeconds/60) +
    ' of ' + s.dailyLimit + ' minutes used';
  el('lockStatus').textContent = locked
    ? '🔒 Strict Mode active until ' + new Date(s.lockUntil).toLocaleString() +
      '. All settings are read-only until then.'
    : '🔓 Strict Mode off · You can edit your settings.';
  el('wellness-status').textContent = eyeBreak.resting
    ? '🌿 Break in progress: ' + eyeBreak.restRemainingSeconds + ' seconds remaining.'
    : '🌿 Next break after ' + Math.ceil(eyeBreak.secondsUntilBreak/60) +
      ' more minutes of video playback.';
  el('wellness-bar').style.width = eyeBreak.resting
    ? Math.max(0,100-eyeBreak.restRemainingSeconds/120*100)+'%'
    : Math.max(0,(60-eyeBreak.secondsUntilBreak/60)/60*100)+'%';
  message = '';
  messageIsError = false;
  toggleInputs();
}
function markUnsubmitted() {
  notice('Unsaved changes — press Save changes when ready.');
}
el('add-schedule').addEventListener('click', () => {
  if (locked || saving || windows.length >= 4) return;
  windows.push({start:'',end:'',selected:false});
  message = 'Enter a unique start and end time for your custom schedule.';
  messageIsError = false;
  renderSchedules();
});
for (const id of ['enabled','dailyLimit','distractionFree']) {
  el(id).addEventListener('change', markUnsubmitted);
}
el('lockDays').addEventListener('change', () => {
  el('lock-consent').checked = false;
  updateConsent();
  markUnsubmitted();
});
el('lock-consent').addEventListener('change', validate);
el('save').addEventListener('click', async () => {
  if (locked || saving) return;
  message = '';
  messageIsError = false;
  const error = validate();
  if (error) return;
  const days = Number(el('lockDays').value);
  if (days && !el('lock-consent').checked) {
    notice('Confirm Strict Mode before saving.',true);
    return;
  }
  const dailyLimit = Number(el('dailyLimit').value);
  if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1440) {
    notice('Daily limit must be between 1 and 1440 minutes.',true);
    return;
  }
  saving = true;
  toggleInputs();
  try {
    const response = await api.runtime.sendMessage({
      type:'save',
      enabled:el('enabled').checked,
      distractionFree:el('distractionFree').checked,
      windows:windows.map(w => ({start:w.start,end:w.end,selected:w.selected})),
      dailyLimit,
      lockDays:days
    });
    if (!response?.ok) throw new Error(response?.error || 'Could not save settings.');
    saving = false;
    await load();
    notice('✓ Settings saved successfully.',false);
  } catch (reason) {
    saving = false;
    toggleInputs();
    notice('Save failed: ' + String(reason?.message || reason),true);
  }
});
load().catch(error => {
  notice('Unable to load settings: ' + String(error?.message || error),true);
  el('save').disabled = true;
  el('add-schedule').disabled = true;
});