/* ScrollSentinel popup: four schedule slots, two originals + two removable customs. */
'use strict';
const el = id => document.getElementById(id);
const Schedule = globalThis.ScrollSentinelSchedule;
let windows = Schedule.defaults.map(w => ({...w}));
let locked = false;
let working = false;
let announcement = '';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function selectionCount() {
  return windows.filter(w => w.selected).length;
}
function validation() {
  const error = Schedule.validateWindows(windows);
  const message = el('schedule-error');
  message.textContent = error || announcement || '✓ Schedules ready to save';
  message.classList.toggle('form-valid', !error);
  el('selection-count').textContent =
    selectionCount() + ' selected / ' + windows.length + ' created';
  el('add-schedule').disabled = locked || working || windows.length >= 4;
  el('save').disabled = locked || working || Boolean(error);
  return error;
}
function displaySchedules() {
  const list = el('schedule-list');
  list.replaceChildren();
  windows.forEach((w, index) => {
    const original = index < 2;
    const card = element('article', 'card');
    const header = element('div', 'schedule-head');
    const checkboxLabel = element('label', 'check-label');
    const checkbox = element('input');
    checkbox.type = 'checkbox';
    checkbox.checked = w.selected;
    checkbox.disabled = locked || working;
    checkbox.setAttribute('aria-label', 'Enable schedule ' + (index + 1));
    checkbox.addEventListener('change', () => {
      const before = w.selected;
      w.selected = checkbox.checked;
      const count = selectionCount();
      if (count < 2 || count > 3) {
        w.selected = before;
        checkbox.checked = before;
        announcement = count < 2
          ? 'At least two schedules must stay selected.'
          : 'At most three schedules can be selected.';
      } else announcement = '';
      validation();
    });
    checkboxLabel.append(checkbox, element('span', '', 'Schedule ' + (index + 1)));
    header.appendChild(checkboxLabel);
    if (original) {
      header.appendChild(element('span', 'origin', 'Original · editable'));
    } else {
      const del = element('button', 'button delete', '✕ Delete');
      del.type = 'button';
      del.disabled = locked || working;
      del.setAttribute('aria-label', 'Delete custom schedule ' + (index + 1));
      del.addEventListener('click', () => {
        windows.splice(index, 1);
        announcement = 'Custom schedule deleted. Save to keep this change.';
        displaySchedules();
      });
      header.appendChild(del);
    }
    card.appendChild(header);
    const times = element('div', 'times');
    for (const [key,caption] of [['start','From'], ['end','Until']]) {
      if (key === 'end') times.appendChild(element('span', 'time-divider', '→'));
      const label = element('label', 'time-label');
      label.appendChild(element('span', '', caption));
      const input = element('input');
      input.type = 'time';
      input.value = w[key] || '';
      input.disabled = locked || working;
      input.setAttribute('aria-label', 'Schedule ' + (index + 1) + ' ' + caption.toLowerCase());
      input.addEventListener('input', () => {
        w[key] = input.value;
        announcement = '';
        validation();
      });
      label.appendChild(input);
      times.appendChild(label);
    }
    card.appendChild(times);
    list.appendChild(card);
  });
  validation();
}

function toggleControls() {
  for (const id of ['enabled','dailyLimit','distractionFree','lockDays']) {
    el(id).disabled = locked || working;
  }
  displaySchedules();
}

async function load() {
  try {
    const s = await browser.runtime.sendMessage({type:'status'});
    windows = Schedule.normalizeWindows(s.windows);
    locked = s.locked;
    el('enabled').checked = s.enabled;
    el('dailyLimit').value = s.dailyLimit;
    el('distractionFree').checked = s.distractionFree;
    el('status').textContent = s.allowed ? '🟢 YouTube available' : '🔴 YouTube blocked';
    el('usage').textContent = 'Today: ' + Math.floor(s.usedSeconds / 60) + ' / ' + s.dailyLimit + ' min';
    el('lockDays').value = '0';
    el('lockStatus').textContent = locked
      ? '🔒 Strict Mode locked until ' + new Date(s.lockUntil).toLocaleString()
      : '🔓 Settings unlocked';
    announcement = '';
    toggleControls();
  } catch (error) {
    el('schedule-error').textContent = 'Unable to load settings: ' + String(error);
    el('save').disabled = true;
  }
}
el('add-schedule').addEventListener('click', () => {
  if (locked || working || windows.length >= 4) return;
  windows.push({start:'', end:'', selected:false});
  announcement = 'Set both times for the new schedule, then save.';
  displaySchedules();
});
el('save').addEventListener('click', async () => {
  if (locked || working) return;
  announcement = '';
  if (validation()) return;
  const days = Number(el('lockDays').value);
  const dailyLimit = Number(el('dailyLimit').value);
  if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1440) {
    announcement = 'Daily limit must be between 1 and 1440 minutes.';
    validation();
    return;
  }
  if (days && !confirm('Lock your schedules and settings for ' + days +
    ' days? You will not be able to edit or delete schedules in Strict Mode.')) return;
  working = true;
  toggleControls();
  try {
    const result = await browser.runtime.sendMessage({
      type:'save', enabled:el('enabled').checked,
      windows:windows.map(w => ({...w})),
      dailyLimit, distractionFree:el('distractionFree').checked, lockDays:days
    });
    if (!result.ok) {
      announcement = result.error || 'Unable to save settings.';
      working = false;
      toggleControls();
      el('schedule-error').textContent = announcement;
      el('schedule-error').classList.remove('form-valid');
      return;
    }
    working = false;
    await load();
    announcement = '✓ Settings saved successfully';
    validation();
  } catch (error) {
    working = false;
    toggleControls();
    el('schedule-error').textContent = 'Save failed: ' + String(error);
    el('schedule-error').classList.remove('form-valid');
  }
});
load();
