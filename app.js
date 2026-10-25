/* ============================================================
   Pantry & Plan — app logic
   No build step, no dependencies. State lives in localStorage.
   ============================================================ */
(function () {
  'use strict';

  const { DAYS, MEALS, AISLES, UNITS, TAGS, RECIPES, PRESET_WEEK } = window.MEAL_DATA;

  const STORAGE_KEY = 'pantry-plan.v1';
  const VERSION = 1;
  const CALORIE_TARGET = 2000;

  const GRADIENTS = [
    ['#f6dcc4', '#eebfa0'],
    ['#e7edd8', '#c8d9b3'],
    ['#f4e3cf', '#e3c19f'],
    ['#e2e8ef', '#c1cfdd'],
    ['#f6e1dc', '#edbdb4'],
    ['#f0e7d0', '#dcc797'],
    ['#e3ebe0', '#bfd2bf'],
    ['#f0e0e6', '#dbbcc7'],
    ['#f5e6c8', '#e7cf9f'],
    ['#e9e4f0', '#cfc4e2']
  ];

  const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-6.5 0-2.6-1.4-4.6-3-6.2-.6 1.4-1.6 2.3-2.7 2.8.2-3.4-1.2-6.5-3.8-8.1.2 3.2-1 5-2.3 6.6C6 12 5 13.7 5 15.5 5 19.3 8 22 12 22Z"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16.5 3.13A4 4 0 0 1 16.5 11"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    'calendar-check': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8.5 16.5l2 2 4-4"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    cart: '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.3 5-6"/>'
  };

  const PLURALS = {
    tomato: 'tomatoes',
    potato: 'potatoes',
    'cherry tomato': 'cherry tomatoes',
    'baby potato': 'baby potatoes',
    'bell pepper': 'bell peppers',
    'spring onion': 'spring onions'
  };

  /* ---------- tiny helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function num(value, fallback) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function fmtNum(value) { return new Intl.NumberFormat('en-US').format(Math.round(value)); }
  function deepClone(value) { return JSON.parse(JSON.stringify(value)); }
  function slugify(value) {
    return String(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 42) || 'recipe';
  }
  function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
    return Math.abs(hash);
  }
  function gradientFor(id) {
    const pair = GRADIENTS[hashString(String(id)) % GRADIENTS.length];
    return `linear-gradient(145deg, ${pair[0]}, ${pair[1]})`;
  }
  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /* ---------- quantity formatting ---------- */

  const NICE_FRACTIONS = [
    [0.125, '⅛'],
    [0.25, '¼'],
    [1 / 3, '⅓'],
    [0.5, '½'],
    [2 / 3, '⅔'],
    [0.75, '¾']
  ];

  function formatQty(qty) {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return '';
    const whole = Math.floor(n + 1e-9);
    const frac = n - whole;
    for (let i = 0; i < NICE_FRACTIONS.length; i += 1) {
      const [value, glyph] = NICE_FRACTIONS[i];
      if (Math.abs(frac - value) < 0.04) return `${whole || ''}${glyph}`;
    }
    const rounded = Math.round(n * 10) / 10;
    return String(rounded);
  }

  function unitLabel(unit, qty) {
    if (unit === 'piece') return '';
    const plural = Math.abs(Number(qty) - 1) > 0.001;
    switch (unit) {
      case 'g':
      case 'ml':
      case 'tbsp':
      case 'tsp':
        return unit;
      case 'pinch':
        return plural ? 'pinches' : 'pinch';
      case 'bunch':
        return plural ? 'bunches' : 'bunch';
      default:
        return plural ? `${unit}s` : unit;
    }
  }

  function amountLabel(qty, unit) {
    const q = formatQty(qty);
    if (!q) return '';
    if (unit === 'piece') return `× ${q}`;
    const unitText = unitLabel(unit, qty);
    return unitText ? `${q} ${unitText}` : q;
  }

  function pluralize(name, qty) {
    if (Math.abs(Number(qty) - 1) < 0.001) return name;
    if (PLURALS[name]) return PLURALS[name];
    if (/(s|x|ch|sh)$/i.test(name)) return `${name}es`;
    if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`;
    return `${name}s`;
  }

  function itemParts(item) {
    if (Array.isArray(item.parts) && item.parts.length) return item.parts;
    if (item.unit != null && item.qty != null) return [{ unit: item.unit, qty: Number(item.qty) }];
    return [];
  }

  function partAmount(part, compact) {
    if (compact && part.unit === 'piece') return `${formatQty(part.qty)} pcs`;
    return amountLabel(part.qty, part.unit);
  }

  function itemAmount(item) {
    const parts = itemParts(item);
    if (!parts.length) return '';
    if (parts.length === 1) return amountLabel(parts[0].qty, parts[0].unit);
    return parts.map((part) => partAmount(part, true)).filter(Boolean).join(' + ');
  }

  function shoppingLine(item) {
    if (item.extraId) return item.name;
    const parts = itemParts(item);
    if (!parts.length) return item.name;
    if (parts.length === 1) {
      const [part] = parts;
      if (part.unit === 'piece') return `${formatQty(part.qty)} ${pluralize(item.name, part.qty)}`;
      const unitText = unitLabel(part.unit, part.qty);
      return `${formatQty(part.qty)} ${unitText} ${item.name}`.replace(/\s+/g, ' ');
    }
    const amounts = parts.map((part) => partAmount(part, true)).filter(Boolean).join(' + ');
    return `${item.name} — ${amounts}`;
  }

  /* ---------- dates ---------- */

  function pad(number) { return String(number).padStart(2, '0'); }
  function isoDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function parseISO(value) {
    const parts = String(value).split('-').map(Number);
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, 12, 0, 0, 0);
  }
  function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    copy.setHours(12, 0, 0, 0);
    return copy;
  }
  function mondayOf(date) {
    const copy = new Date(date);
    copy.setHours(12, 0, 0, 0);
    const offset = (copy.getDay() + 6) % 7;
    copy.setDate(copy.getDate() - offset);
    return copy;
  }
  const todayKey = () => isoDate(new Date());

  /* ---------- state ---------- */

  let state;
  let currentWeek;
  let view = 'planner';
  let dragFrom = null;
  let lastFocused = null;
  let confirmCallback = null;

  const ui = {
    search: '',
    filter: 'all',
    detailId: null,
    detailFrom: null,
    editingId: null,
    picker: { day: 'mon', meal: 'dinner', recipeId: null, search: '' }
  };

  function seedState() {
    const week = isoDate(mondayOf(new Date()));
    const plan = {};
    PRESET_WEEK.forEach(([slot, recipeId]) => { plan[slot] = { recipeId }; });
    return {
      version: VERSION,
      recipes: deepClone(RECIPES),
      plans: { [week]: plan },
      checked: {},
      extras: {},
      theme: null
    };
  }

  function migrateChecked(checked) {
    Object.keys(checked).forEach((week) => {
      const map = checked[week];
      if (!map || typeof map !== 'object') return;
      Object.keys(map).forEach((key) => {
        if (key.startsWith('extra||')) return;
        const segments = key.split('||');
        if (segments.length < 3) return;
        const mergedKey = segments.slice(0, -1).join('||');
        if (!map[mergedKey]) map[mergedKey] = map[key];
        delete map[key];
      });
    });
    return checked;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === VERSION && Array.isArray(parsed.recipes)) {
          return {
            version: VERSION,
            recipes: parsed.recipes,
            plans: parsed.plans || {},
            checked: migrateChecked(parsed.checked || {}),
            extras: parsed.extras || {},
            theme: parsed.theme || null
          };
        }
      }
    } catch (error) {
      console.warn('Could not read the saved plan. Starting fresh.', error);
    }
    return seedState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Could not save the plan.', error);
    }
  }

  function applyTheme() {
    let theme = state.theme;
    if (!theme) {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    const button = $('#themeToggle');
    if (button) {
      const next = theme === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-label', `Switch to ${next} theme`);
      button.title = `Switch to ${next} theme`;
    }
  }

  function toggleTheme() {
    const active = document.documentElement.getAttribute('data-theme');
    state.theme = active === 'dark' ? 'light' : 'dark';
    saveState();
    applyTheme();
  }

  /* ---------- plan access ---------- */

  function getPlan() { return state.plans[currentWeek] || {}; }

  function setEntry(slot, entry) {
    if (!state.plans[currentWeek]) state.plans[currentWeek] = {};
    state.plans[currentWeek][slot] = entry;
    saveState();
  }

  function removeEntry(slot) {
    const plan = state.plans[currentWeek];
    if (!plan || !plan[slot]) return;
    delete plan[slot];
    saveState();
  }

  function getRecipe(id) { return state.recipes.find((recipe) => recipe.id === id) || null; }
  function slotParts(slot) {
    const parts = String(slot).split('-');
    return { day: parts[0], meal: parts.slice(1).join('-') };
  }
  function dayLabel(key) { const day = DAYS.find((item) => item.key === key); return day ? day.label : key; }
  function mealLabel(key) { const meal = MEALS.find((item) => item.key === key); return meal ? meal.label : key; }
  function shelfLabel(meal) { return mealLabel(meal).toLowerCase(); }

  function countPlanned() {
    return Object.values(getPlan()).filter((entry) => entry && (entry.recipeId || entry.custom)).length;
  }

  function plannedCalories() {
    let total = 0;
    Object.values(getPlan()).forEach((entry) => {
      if (!entry || !entry.recipeId) return;
      const recipe = getRecipe(entry.recipeId);
      if (recipe && recipe.nutrition) total += Number(recipe.nutrition.calories) || 0;
    });
    return total;
  }

  function weekDates() {
    const monday = parseISO(currentWeek);
    return DAYS.map((day, index) => addDays(monday, index));
  }

  function weekRangeLabel() {
    const start = parseISO(currentWeek);
    const end = addDays(start, 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    const dayOnly = new Intl.DateTimeFormat('en-US', { day: 'numeric' });
    const startText = short.format(start);
    const endText = sameMonth ? dayOnly.format(end) : short.format(end);
    return `${startText} – ${endText}, ${end.getFullYear()}`;
  }

  function weekEyebrow() {
    const thisMonday = isoDate(mondayOf(new Date()));
    const diff = Math.round((parseISO(currentWeek) - parseISO(thisMonday)) / 86400000);
    if (diff === 0) return 'This week';
    if (diff === 7) return 'Next week';
    if (diff === -7) return 'Last week';
    return 'Week plan';
  }

  function firstEmptySlot() {
    const plan = getPlan();
    for (let d = 0; d < DAYS.length; d += 1) {
      for (let m = 0; m < MEALS.length; m += 1) {
        const slot = `${DAYS[d].key}-${MEALS[m].key}`;
        if (!plan[slot]) return slot;
      }
    }
    return null;
  }

  function defaultPickerSlot() {
    const empty = firstEmptySlot();
    if (empty) return slotParts(empty);
    const now = new Date();
    const day = DAYS[(now.getDay() + 6) % 7].key;
    const hour = now.getHours();
    const meal = hour < 11 ? 'breakfast' : hour < 15 ? 'lunch' : hour < 21 ? 'dinner' : 'snack';
    return { day, meal };
  }

  /* ---------- toasts & loading ---------- */

  function toast(message) {
    const stack = $('#toastStack');
    if (!stack) return;
    const element = document.createElement('div');
    element.className = 'toast';
    element.innerHTML = `${icon('check')}<span>${esc(message)}</span>`;
    stack.appendChild(element);
    while (stack.children.length > 3) stack.firstElementChild.remove();
    setTimeout(() => {
      element.classList.add('is-leaving');
      setTimeout(() => element.remove(), 220);
    }, 3400);
  }

  /* ---------- modal plumbing ---------- */

  function showModal(id, focusSelector) {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    document.body.classList.add('modal-open');
    window.setTimeout(() => {
      const target = focusSelector
        ? backdrop.querySelector(focusSelector)
        : backdrop.querySelector('.modal-close') || backdrop.querySelector('button');
      if (target) target.focus();
    }, 40);
  }

  function hideModal(id) {
    const backdrop = document.getElementById(id);
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    if (!$$('.modal-backdrop:not([hidden])').length) {
      document.body.classList.remove('modal-open');
    }
    if (lastFocused && document.contains(lastFocused)) {
      try { lastFocused.focus({ preventScroll: true }); } catch (error) { /* noop */ }
      lastFocused = null;
    }
  }

  function confirmAction(options) {
    const opts = options || {};
    const content = $('#confirmContent');
    if (!content) return;
    content.innerHTML = `
      <div class="confirm-body">
        <span class="confirm-emoji" aria-hidden="true">${opts.emoji || '⚠️'}</span>
        <h2>${esc(opts.title || 'Are you sure?')}</h2>
        <p>${esc(opts.message || '')}</p>
      </div>
      <div class="confirm-actions">
        <button class="btn btn-ghost" type="button" id="confirmCancel" data-close>Cancel</button>
        <button class="btn ${opts.danger ? 'btn-danger' : 'btn-primary'}" type="button" id="confirmGo">${esc(opts.confirmLabel || 'Confirm')}</button>
      </div>`;
    confirmCallback = opts.onConfirm || null;
    showModal('confirmModal', '#confirmCancel');
    const go = $('#confirmGo');
    if (go) {
      go.addEventListener('click', () => {
        const callback = confirmCallback;
        confirmCallback = null;
        hideModal('confirmModal');
        if (callback) callback();
      }, { once: true });
    }
  }

  /* ---------- planner ---------- */

  function statCard(options) {
    const meter = options.meter == null ? '' : `<div class="stat-meter"><span style="width:${clamp(options.meter, 0, 100)}%"></span></div>`;
    const suffix = options.suffix ? `<em>${esc(options.suffix)}</em>` : '';
    return `<div class="stat${options.accent ? ' is-accent' : ''}">
      <div class="stat-top">
        <span class="stat-label">${esc(options.label)}</span>
        <span class="stat-icon">${icon(options.iconName)}</span>
      </div>
      <span class="stat-value">${options.value}${suffix}</span>
      <span class="stat-sub">${esc(options.sub)}</span>
      ${meter}
    </div>`;
  }

  function emptySlotHtml(slot, day, meal) {
    const label = `${day.label} ${meal.label}`;
    return `<button class="slot empty" type="button" data-action="slot" data-slot="${slot}" aria-label="Add a meal for ${esc(label)}">
      ${icon('plus')}<span>Add meal</span>
    </button>`;
  }

  function filledSlotHtml(slot, entry, day, meal) {
    const recipe = entry.recipeId ? getRecipe(entry.recipeId) : null;
    const title = recipe ? recipe.title : (entry.custom || 'Custom meal');
    const emoji = recipe ? recipe.emoji : '🍽️';
    const kcal = recipe && recipe.nutrition ? Number(recipe.nutrition.calories) || 0 : 0;
    const label = `${day.label} ${meal.label}`;
    return `<div class="slot filled${recipe ? '' : ' is-custom'}" data-action="slot" data-slot="${slot}"
      draggable="true" role="button" tabindex="0"
      aria-label="${esc(label)}: ${esc(title)}. Open meal, or drag to move.">
      <span class="slot-emoji" aria-hidden="true">${esc(emoji)}</span>
      <span class="slot-title">${esc(title)}</span>
      <span class="slot-kcal">${kcal ? `${fmtNum(kcal)} kcal` : 'Custom meal'}</span>
      <button class="slot-remove" type="button" data-action="unplan" data-slot="${slot}"
        aria-label="Remove ${esc(title)} from ${esc(label)}">${icon('close')}</button>
    </div>`;
  }

  function renderPlanner() {
    const entries = getPlan();
    const dates = weekDates();
    const today = todayKey();
    const totalSlots = DAYS.length * MEALS.length;
    const planned = countPlanned();
    const open = totalSlots - planned;
    const uniqueRecipes = new Set(
      Object.values(entries).filter((entry) => entry && entry.recipeId).map((entry) => entry.recipeId)
    ).size;
    const calories = plannedCalories();
    const average = Math.round(calories / 7);
    const shopping = buildShoppingList();
    const checked = shopping.items.filter((item) => item.checked).length;

    const eyebrow = $('#weekEyebrow');
    const title = $('#weekTitle');
    const sub = $('#weekSub');
    if (!eyebrow || !title || !sub) return;

    eyebrow.textContent = weekEyebrow();
    title.textContent = weekRangeLabel();
    if (!planned) {
      sub.textContent = 'A fresh week — add a meal or let auto-fill do the work.';
    } else if (!open) {
      sub.textContent = `All ${totalSlots} meals planned · ${uniqueRecipes} recipe${uniqueRecipes === 1 ? '' : 's'} in rotation.`;
    } else {
      sub.textContent = `${planned} of ${totalSlots} meals planned · ${open} slot${open === 1 ? '' : 's'} still open.`;
    }

    const stats = $('#stats');
    if (stats) {
      stats.innerHTML = [
        statCard({
          label: 'Meals planned',
          value: String(planned),
          suffix: `/${totalSlots}`,
          sub: open ? `${open} slot${open === 1 ? '' : 's'} open` : 'Week complete',
          iconName: 'calendar-check',
          accent: true
        }),
        statCard({
          label: 'Avg kcal / day',
          value: fmtNum(average),
          sub: open ? `${fmtNum(CALORIE_TARGET)} daily target` : 'A full week of food',
          iconName: 'flame',
          meter: (average / CALORIE_TARGET) * 100
        }),
        statCard({
          label: 'Recipes on rotation',
          value: String(uniqueRecipes),
          sub: `${state.recipes.length} in your cookbook`,
          iconName: 'book'
        }),
        statCard({
          label: 'Grocery items',
          value: String(shopping.items.length),
          sub: checked ? `${checked} checked off` : 'Nothing checked yet',
          iconName: 'cart'
        })
      ].join('');
    }

    const board = $('#board');
    if (board) {
      board.innerHTML = DAYS.map((day, index) => {
        const date = dates[index];
        const isToday = isoDate(date) === today;
        const dayCalories = MEALS.reduce((sum, meal) => {
          const entry = entries[`${day.key}-${meal.key}`];
          if (!entry || !entry.recipeId) return sum;
          const recipe = getRecipe(entry.recipeId);
          return sum + (recipe && recipe.nutrition ? Number(recipe.nutrition.calories) || 0 : 0);
        }, 0);
        const percent = clamp((dayCalories / CALORIE_TARGET) * 100, 0, 100);
        const slots = MEALS.map((meal) => {
          const slot = `${day.key}-${meal.key}`;
          const entry = entries[slot];
          return `<div class="slot-cell">
            <span class="meal-label">${meal.label}</span>
            ${entry ? filledSlotHtml(slot, entry, day, meal) : emptySlotHtml(slot, day, meal)}
          </div>`;
        }).join('');
        return `<section class="day-col${isToday ? ' is-today' : ''}" aria-label="${esc(day.label)}">
          <div class="day-head">
            <div class="day-id">
              <span class="dow">${day.short}</span>
              <span class="day-num">${date.getDate()}</span>
            </div>
            <span class="day-kcal">${dayCalories ? `<b>${fmtNum(dayCalories)}</b> kcal` : '—'}</span>
          </div>
          <div class="day-meter" aria-hidden="true"><span style="width:${percent}%"></span></div>
          <div class="slots">${slots}</div>
        </section>`;
      }).join('');
    }
  }

  function openSlot(slot) {
    const entry = getPlan()[slot];
    if (!entry) {
      openPicker(slot);
      return;
    }
    if (entry.recipeId) {
      openDetail(entry.recipeId, slot);
      return;
    }
    openPicker(slot);
  }

  function moveOrSwap(from, to) {
    if (!from || !to || from === to) return;
    const plan = state.plans[currentWeek];
    if (!plan || !plan[from]) return;
    const moving = plan[from];
    const target = plan[to] || null;
    plan[to] = moving;
    if (target) plan[from] = target;
    else delete plan[from];
    saveState();
    renderAll();
    const parts = slotParts(to);
    toast(`Moved to ${dayLabel(parts.day)} ${shelfLabel(parts.meal)}.`);
  }

  function bindBoardDragEvents() {
    const board = $('#board');
    if (!board) return;

    board.addEventListener('dragstart', (event) => {
      const slot = event.target.closest('.slot[draggable="true"]');
      if (!slot) return;
      dragFrom = slot.dataset.slot;
      event.dataTransfer.effectAllowed = 'move';
      try { event.dataTransfer.setData('text/plain', dragFrom); } catch (error) { /* noop */ }
      slot.classList.add('dragging');
    });

    board.addEventListener('dragend', () => {
      dragFrom = null;
      $$('.slot.dragging, .slot.drop-target').forEach((element) => {
        element.classList.remove('dragging', 'drop-target');
      });
    });

    board.addEventListener('dragover', (event) => {
      const slot = event.target.closest('.slot');
      if (!slot || !dragFrom) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      $$('.slot.drop-target').forEach((element) => {
        if (element !== slot) element.classList.remove('drop-target');
      });
      if (slot.dataset.slot !== dragFrom) slot.classList.add('drop-target');
    });

    board.addEventListener('dragleave', (event) => {
      const slot = event.target.closest('.slot');
      if (slot) slot.classList.remove('drop-target');
    });

    board.addEventListener('drop', (event) => {
      const slot = event.target.closest('.slot');
      if (!slot || !dragFrom) return;
      event.preventDefault();
      const from = dragFrom;
      const to = slot.dataset.slot;
      dragFrom = null;
      $$('.slot.dragging, .slot.drop-target').forEach((element) => {
        element.classList.remove('dragging', 'drop-target');
      });
      moveOrSwap(from, to);
    });

    board.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const slot = event.target.closest('.slot[data-action="slot"]');
      if (!slot) return;
      event.preventDefault();
      openSlot(slot.dataset.slot);
    });
  }

  /* ---------- recipes ---------- */

  function tagChip(tag) {
    const tone = tag === 'vegetarian' || tag === 'vegan' || tag === 'high-protein'
      ? ' is-green'
      : tag === 'quick' ? ' is-accent' : '';
    return `<span class="tag${tone}">${esc(TAGS[tag] || tag)}</span>`;
  }

  function searchText(recipe) {
    const tags = (recipe.tags || []).map((tag) => TAGS[tag] || tag);
    const types = (recipe.types || []).map((type) => mealLabel(type));
    const ingredients = (recipe.ingredients || []).map((item) => item.name);
    return [recipe.title, recipe.description, tags.join(' '), types.join(' '), ingredients.join(' ')]
      .join(' ')
      .toLowerCase();
  }

  function renderFilters() {
    const wrap = $('#filters');
    if (!wrap) return;
    if (!wrap.dataset.ready) {
      const chips = ['<button class="chip" type="button" data-filter="all">All recipes</button>', '<span class="chip-sep" aria-hidden="true"></span>'];
      MEALS.forEach((meal) => {
        chips.push(`<button class="chip" type="button" data-filter="type:${meal.key}">${esc(meal.label)}</button>`);
      });
      chips.push('<span class="chip-sep" aria-hidden="true"></span>');
      Object.keys(TAGS).forEach((key) => {
        chips.push(`<button class="chip" type="button" data-filter="tag:${key}">${esc(TAGS[key])}</button>`);
      });
      wrap.innerHTML = chips.join('');
      wrap.dataset.ready = '1';
    }
    $$('.chip', wrap).forEach((chip) => {
      const active = chip.dataset.filter === ui.filter;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function recipeMatches(recipe) {
    if (ui.filter === 'all') return true;
    if (ui.filter.indexOf('type:') === 0) return (recipe.types || []).includes(ui.filter.slice(5));
    if (ui.filter.indexOf('tag:') === 0) return (recipe.tags || []).includes(ui.filter.slice(4));
    return true;
  }

  function filteredRecipes() {
    const term = ui.search.trim().toLowerCase();
    return state.recipes.filter((recipe) => {
      if (!recipeMatches(recipe)) return false;
      return !term || searchText(recipe).includes(term);
    });
  }

  function recipeCardHtml(recipe) {
    const description = recipe.description || 'A new favourite waiting to happen.';
    const tags = (recipe.tags || []).slice(0, 2).map(tagChip).join('');
    const course = mealLabel((recipe.types || [])[0]);
    return `<article class="recipe-card">
      <button class="card-hit" type="button" data-action="open-recipe" data-id="${esc(recipe.id)}" aria-label="View ${esc(recipe.title)}"></button>
      <div class="recipe-hero" style="background:${gradientFor(recipe.id)}" aria-hidden="true">
        <span class="recipe-type">${esc(course)}</span>
        <span class="recipe-emoji">${esc(recipe.emoji)}</span>
      </div>
      <div class="recipe-body">
        <div class="recipe-meta">${icon('clock')} ${Number(recipe.minutes) || 0} min <span class="meta-dot"></span> ${fmtNum(recipe.nutrition ? recipe.nutrition.calories : 0)} kcal</div>
        <h3>${esc(recipe.title)}</h3>
        <p class="recipe-desc">${esc(description)}</p>
        <div class="card-foot">
          <div class="tag-row">${tags}</div>
          <button class="card-add" type="button" data-action="quick-plan" data-id="${esc(recipe.id)}" aria-label="Add ${esc(recipe.title)} to your plan">
            ${icon('plus')} Add
          </button>
        </div>
      </div>
    </article>`;
  }

  function renderRecipeGrid() {
    const grid = $('#recipeGrid');
    if (!grid) return;
    const matches = filteredRecipes();
    const active = Boolean(ui.search.trim()) || ui.filter !== 'all';
    const sub = $('#recipeSub');
    if (sub) {
      sub.textContent = active
        ? `${matches.length} matching recipe${matches.length === 1 ? '' : 's'}.`
        : `${state.recipes.length} recipe${state.recipes.length === 1 ? '' : 's'} in your cookbook · click a card for the full recipe.`;
    }
    if (!matches.length) {
      grid.innerHTML = state.recipes.length
        ? `<div class="empty">
            <span class="empty-emoji" aria-hidden="true">🔍</span>
            <h3>No recipes found</h3>
            <p>Try another search, or clear the filters to see the whole cookbook.</p>
            <button class="btn btn-outline" type="button" data-action="clear-filters">Clear filters</button>
          </div>`
        : `<div class="empty">
            <span class="empty-emoji" aria-hidden="true">🍳</span>
            <h3>Your cookbook is empty</h3>
            <p>Add the first recipe and start building a week worth looking forward to.</p>
            <button class="btn btn-primary" type="button" data-action="new-recipe">Add a recipe</button>
          </div>`;
      return;
    }
    grid.innerHTML = matches.map(recipeCardHtml).join('');
  }

  function renderRecipes() {
    renderFilters();
    renderRecipeGrid();
  }

  /* ---------- recipe detail ---------- */

  function detailHtml(recipe) {
    const types = (recipe.types || []).map((type) => mealLabel(type)).join(' · ');
    const tags = (recipe.tags || []).map(tagChip).join('');
    const ingredients = (recipe.ingredients || []).map((item) => `<label class="ing-item">
      <input type="checkbox">
      <span class="ing-check">${icon('check')}</span>
      <span class="ing-name">${esc(item.name)}</span>
      <span class="ing-qty">${esc(amountLabel(item.qty, item.unit))}</span>
    </label>`).join('');
    const steps = (recipe.steps || []).map((step) => `<li>${esc(step)}</li>`).join('');
    const nutrition = recipe.nutrition || {};
    const planned = ui.detailFrom && getPlan()[ui.detailFrom] && getPlan()[ui.detailFrom].recipeId === recipe.id;

    return `<div class="modal-head">
      <div>
        <p class="eyebrow">${esc(types)} recipe</p>
        <h2 id="detailTitle">${esc(recipe.title)}</h2>
        <div class="tag-row" style="margin-top:8px">${tags}</div>
      </div>
      <button class="modal-close" type="button" data-close aria-label="Close recipe">${icon('close')}</button>
    </div>
    <div class="detail-hero" style="background:${gradientFor(recipe.id)}">
      <span class="detail-emoji" style="background:rgba(255,255,255,.38)" aria-hidden="true">${esc(recipe.emoji)}</span>
      <div class="detail-heading">
        <p class="detail-desc">${esc(recipe.description || 'A house favourite.')}</p>
        <div class="detail-meta">
          <span>${icon('clock')} ${Number(recipe.minutes) || 0} min</span>
          <span>${icon('flame')} ${fmtNum(nutrition.calories || 0)} kcal / serving</span>
          <span>${icon('users')} Serves ${Number(recipe.servings) || 2}</span>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-grid">
        <section>
          <h3>Ingredients · serves ${Number(recipe.servings) || 2}</h3>
          <div class="ing-list">${ingredients || '<p class="form-note">No ingredients listed yet.</p>'}</div>
        </section>
        <section>
          <h3>Method</h3>
          ${steps ? `<ol class="steps">${steps}</ol>` : '<p class="form-note">No method written yet.</p>'}
        </section>
      </div>
    </div>
    <div class="nutrition-strip">
      <div class="nutrition-cell"><strong>${fmtNum(nutrition.calories || 0)}</strong><span>Calories</span></div>
      <div class="nutrition-cell"><strong>${fmtNum(nutrition.protein || 0)} g</strong><span>Protein</span></div>
      <div class="nutrition-cell"><strong>${fmtNum(nutrition.carbs || 0)} g</strong><span>Carbs</span></div>
      <div class="nutrition-cell"><strong>${fmtNum(nutrition.fat || 0)} g</strong><span>Fat</span></div>
    </div>
    <div class="modal-actions">
      <div class="action-cluster">
        <button class="btn btn-ghost" type="button" data-action="detail-edit">${icon('edit')} Edit</button>
        <button class="btn btn-ghost text-danger" type="button" data-action="detail-delete">${icon('trash')} Delete</button>
      </div>
      <div class="action-cluster">
        ${planned ? `<button class="btn btn-ghost" type="button" data-action="detail-unplan">Remove from plan</button>` : ''}
        <button class="btn btn-primary" type="button" data-action="detail-plan">${icon('plus')} Add to plan</button>
      </div>
    </div>`;
  }

  function openDetail(recipeId, fromSlot) {
    const recipe = getRecipe(recipeId);
    if (!recipe) {
      toast('That recipe is no longer in your cookbook.');
      renderAll();
      return;
    }
    ui.detailId = recipeId;
    ui.detailFrom = fromSlot || null;
    const content = $('#detailContent');
    if (!content) return;
    content.innerHTML = detailHtml(recipe);
    showModal('detailModal');
  }

  /* ---------- picker ---------- */

  function pickerRecipes() {
    const term = ui.picker.search.trim().toLowerCase();
    let list = state.recipes.filter((recipe) => !(ui.picker.recipeId && recipe.id === ui.picker.recipeId));
    if (term) list = list.filter((recipe) => searchText(recipe).includes(term));
    return list.slice().sort((a, b) => {
      const aMatch = (a.types || []).includes(ui.picker.meal) ? 0 : 1;
      const bMatch = (b.types || []).includes(ui.picker.meal) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.title.localeCompare(b.title);
    });
  }

  function pickerListHtml(list) {
    if (!list.length) return '<p class="picker-empty">No recipes match that search. Try another word, or add a one-off meal below.</p>';
    return list.map((recipe) => `<button class="pick-row" type="button" data-action="picker-add" data-id="${esc(recipe.id)}">
      <span class="pick-emoji" style="background:${gradientFor(recipe.id)}" aria-hidden="true">${esc(recipe.emoji)}</span>
      <span class="pick-info">
        <strong>${esc(recipe.title)}</strong>
        <span>${Number(recipe.minutes) || 0} min · ${fmtNum(recipe.nutrition ? recipe.nutrition.calories : 0)} kcal · serves ${Number(recipe.servings) || 2}</span>
      </span>
      <span class="pick-add">${icon('plus')}</span>
    </button>`).join('');
  }

  function pickerHtml() {
    const prepop = ui.picker.recipeId ? getRecipe(ui.picker.recipeId) : null;
    const dayOptions = DAYS.map((day) => `<option value="${day.key}" ${day.key === ui.picker.day ? 'selected' : ''}>${esc(day.label)}</option>`).join('');
    const mealOptions = MEALS.map((meal) => `<option value="${meal.key}" ${meal.key === ui.picker.meal ? 'selected' : ''}>${esc(meal.label)}</option>`).join('');
    return `<div class="modal-head">
      <div>
        <p class="eyebrow">Add to plan</p>
        <h2>${prepop ? 'Find it a home' : "What's cooking?"}</h2>
      </div>
      <button class="modal-close" type="button" data-close aria-label="Close">${icon('close')}</button>
    </div>
    <div class="picker-bar">
      <label class="field-label">Day
        <select id="pickerDay">${dayOptions}</select>
      </label>
      <label class="field-label">Meal
        <select id="pickerMeal">${mealOptions}</select>
      </label>
    </div>
    <div class="picker-target">
      <span>Adding to</span>
      <strong id="pickerTargetLabel">${esc(dayLabel(ui.picker.day))} · ${esc(mealLabel(ui.picker.meal))}</strong>
    </div>
    ${prepop ? `<div class="prepop-row">
      <span class="prepop-emoji" aria-hidden="true">${esc(prepop.emoji)}</span>
      <div class="prepop-copy">
        <strong>${esc(prepop.title)}</strong>
        <span>${Number(prepop.minutes) || 0} min · ${fmtNum(prepop.nutrition ? prepop.nutrition.calories : 0)} kcal</span>
      </div>
      <button class="btn btn-primary" type="button" data-action="picker-add" data-id="${esc(prepop.id)}">${icon('plus')} Add</button>
    </div>` : ''}
    <div class="picker-search">
      ${icon('search')}
      <input id="pickerSearch" type="search" placeholder="Search ${state.recipes.length} recipes" value="${esc(ui.picker.search)}" autocomplete="off" aria-label="Search recipes">
    </div>
    <div class="picker-list" id="pickerList">${pickerListHtml(pickerRecipes())}</div>
    <div class="custom-meal">
      <p>Can't find it? Add a one-off meal</p>
      <div class="custom-meal-row">
        <input id="customMealInput" type="text" maxlength="60" placeholder="e.g. Leftovers night" aria-label="Custom meal name">
        <button class="btn btn-dark" type="button" data-action="add-custom">Add meal</button>
      </div>
    </div>`;
  }

  function renderPicker() {
    const content = $('#pickerContent');
    if (content) content.innerHTML = pickerHtml();
  }

  function renderPickerList() {
    const list = $('#pickerList');
    if (list) list.innerHTML = pickerListHtml(pickerRecipes());
  }

  function syncPickerTarget() {
    const label = $('#pickerTargetLabel');
    if (label) label.textContent = `${dayLabel(ui.picker.day)} · ${mealLabel(ui.picker.meal)}`;
    renderPickerList();
  }

  function openPicker(slot, recipeId) {
    let day;
    let meal;
    if (slot) {
      const parts = slotParts(slot);
      day = parts.day;
      meal = parts.meal;
    } else {
      const parts = defaultPickerSlot();
      day = parts.day;
      meal = parts.meal;
    }
    ui.picker = { day, meal, recipeId: recipeId || null, search: '' };
    renderPicker();
    showModal('pickerModal', '#pickerSearch');
  }

  function addRecipeToSlot(recipeId, day, meal) {
    const recipe = getRecipe(recipeId);
    if (!recipe) {
      toast('That recipe is no longer in your cookbook.');
      return;
    }
    setEntry(`${day}-${meal}`, { recipeId });
    hideModal('pickerModal');
    hideModal('detailModal');
    renderAll();
    toast(`${recipe.title} is on the menu for ${dayLabel(day)} ${shelfLabel(meal)}.`);
  }

  function addCustomMeal() {
    const input = $('#customMealInput');
    if (!input) return;
    const title = input.value.trim();
    if (!title) {
      input.focus();
      toast('Give that meal a name first.');
      return;
    }
    setEntry(`${ui.picker.day}-${ui.picker.meal}`, { custom: title });
    hideModal('pickerModal');
    renderAll();
    toast(`"${title}" added to ${dayLabel(ui.picker.day)} ${shelfLabel(ui.picker.meal)}.`);
  }

  /* ---------- recipe form ---------- */

  function ingredientRowHtml(ingredient) {
    const item = ingredient || {};
    const unit = item.unit || 'g';
    const aisle = item.aisle || 'Pantry';
    const qty = item.qty == null ? '' : item.qty;
    return `<div class="ing-row">
      <input class="ing-name" type="text" placeholder="Ingredient" maxlength="60" value="${esc(item.name || '')}" aria-label="Ingredient name">
      <input class="ing-qty" type="number" step="0.25" min="0" placeholder="Qty" value="${esc(qty)}" aria-label="Quantity">
      <select class="ing-unit" aria-label="Unit">
        ${UNITS.map((value) => `<option value="${value}" ${unit === value ? 'selected' : ''}>${value === 'piece' ? 'whole' : value}</option>`).join('')}
      </select>
      <select class="ing-aisle" aria-label="Aisle">
        ${AISLES.map((entry) => `<option value="${esc(entry.key)}" ${aisle === entry.key ? 'selected' : ''}>${esc(entry.key)}</option>`).join('')}
      </select>
      <button class="ing-remove" type="button" data-action="remove-ingredient" aria-label="Remove ingredient">${icon('close')}</button>
    </div>`;
  }

  function nutritionField(name, label, value, max) {
    return `<label class="field"><span>${esc(label)}</span><input name="${name}" type="number" min="0" max="${max}" value="${Number(value) || 0}"></label>`;
  }

  function recipeFormHtml(recipe) {
    const editing = Boolean(recipe.id);
    const types = recipe.types || [];
    const tags = recipe.tags || [];
    const nutrition = recipe.nutrition || {};
    const ingredients = recipe.ingredients && recipe.ingredients.length ? recipe.ingredients : [{}];
    const steps = (recipe.steps || []).join('\n');
    return `<form id="recipeForm" novalidate>
      <div class="modal-head">
        <div>
          <p class="eyebrow">${editing ? 'Edit recipe' : 'New recipe'}</p>
          <h2>${editing ? 'Tidy up a favourite' : 'Add to the cookbook'}</h2>
        </div>
        <button class="modal-close" type="button" data-close aria-label="Close editor">${icon('close')}</button>
      </div>
      <div class="form-body">
        <div class="form-row" style="grid-template-columns:minmax(0,1fr) 80px">
          <label class="field">
            <span>Recipe name</span>
            <input id="recipeTitle" name="title" type="text" maxlength="80" placeholder="e.g. Lemon herb chicken" value="${esc(recipe.title || '')}" required>
          </label>
          <label class="field">
            <span>Icon</span>
            <input class="emoji-input" name="emoji" type="text" maxlength="4" value="${esc(recipe.emoji || '🍽️')}" aria-label="Recipe emoji">
          </label>
        </div>
        <div class="form-row">
          <label class="field"><span>Minutes</span><input name="minutes" type="number" min="0" max="600" value="${Number(recipe.minutes) || 0}"></label>
          <label class="field"><span>Servings</span><input name="servings" type="number" min="1" max="20" value="${Number(recipe.servings) || 2}"></label>
        </div>
        <label class="field">
          <span>Short description</span>
          <textarea name="description" rows="2" maxlength="160" placeholder="One delicious sentence">${esc(recipe.description || '')}</textarea>
        </label>
        <fieldset>
          <legend>Best for</legend>
          <div class="check-chips">
            ${MEALS.map((meal) => `<label class="check-chip"><input type="checkbox" name="types" value="${meal.key}" ${types.includes(meal.key) ? 'checked' : ''}><span>${esc(meal.label)}</span></label>`).join('')}
          </div>
        </fieldset>
        <fieldset>
          <legend>Tags</legend>
          <div class="check-chips">
            ${Object.keys(TAGS).map((key) => `<label class="check-chip"><input type="checkbox" name="tags" value="${key}" ${tags.includes(key) ? 'checked' : ''}><span>${esc(TAGS[key])}</span></label>`).join('')}
          </div>
        </fieldset>
        <fieldset>
          <legend>Nutrition per serving</legend>
          <div class="form-row four">
            ${nutritionField('calories', 'Calories', nutrition.calories, 5000)}
            ${nutritionField('protein', 'Protein (g)', nutrition.protein, 500)}
            ${nutritionField('carbs', 'Carbs (g)', nutrition.carbs, 500)}
            ${nutritionField('fat', 'Fat (g)', nutrition.fat, 500)}
          </div>
        </fieldset>
        <fieldset>
          <legend>Ingredients</legend>
          <div class="ing-rows" id="ingredientRows">${ingredients.map(ingredientRowHtml).join('')}</div>
          <button class="add-ing-btn" type="button" data-action="add-ingredient">${icon('plus')} Add ingredient</button>
          <p class="form-note">Quantities are for the servings above. The shopping list adds them up across the week.</p>
        </fieldset>
        <label class="field">
          <span>Method — one step per line</span>
          <textarea name="steps" rows="5" placeholder="Prep the vegetables&#10;Sear the chicken&#10;Serve with lemon">${esc(steps)}</textarea>
        </label>
        <p class="form-error" id="formError" hidden></p>
      </div>
      <div class="modal-actions">
        <span class="form-note">${editing ? 'Changes update every planned meal.' : 'Saved in this browser.'}</span>
        <div class="action-cluster">
          <button class="btn btn-ghost" type="button" data-close>Cancel</button>
          <button class="btn btn-primary" type="submit">${editing ? 'Save changes' : 'Save recipe'}</button>
        </div>
      </div>
    </form>`;
  }

  function openRecipeForm(recipe) {
    ui.editingId = recipe ? recipe.id : null;
    const base = recipe || {
      emoji: '🍽️',
      types: ['dinner'],
      tags: [],
      minutes: 25,
      servings: 2,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ingredients: [],
      steps: []
    };
    const content = $('#formContent');
    if (!content) return;
    content.innerHTML = recipeFormHtml(base);
    const form = $('#recipeForm');
    if (form) form.addEventListener('submit', onRecipeSubmit);
    showModal('formModal', '#recipeTitle');
  }

  function showFormError(message) {
    const error = $('#formError');
    if (!error) return;
    error.hidden = false;
    error.textContent = message;
  }

  function onRecipeSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();

    if (!title) {
      showFormError('Give your recipe a name.');
      const titleInput = $('#recipeTitle');
      if (titleInput) titleInput.focus();
      return;
    }

    const types = $$('input[name="types"]:checked', form).map((input) => input.value);
    if (!types.length) {
      showFormError('Pick at least one meal time.');
      return;
    }
    const tags = $$('input[name="tags"]:checked', form).map((input) => input.value);

    const ingredients = $$('.ing-row', form).map((row) => {
      const nameInput = row.querySelector('.ing-name');
      const qtyInput = row.querySelector('.ing-qty');
      const unitInput = row.querySelector('.ing-unit');
      const aisleInput = row.querySelector('.ing-aisle');
      return {
        name: nameInput ? nameInput.value.trim() : '',
        qty: clamp(num(qtyInput ? qtyInput.value : 0, 0), 0, 99999),
        unit: unitInput ? unitInput.value : 'g',
        aisle: aisleInput ? aisleInput.value : 'Other'
      };
    }).filter((item) => item.name);

    const steps = String(data.get('steps') || '')
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean);

    const recipe = {
      id: ui.editingId || `${slugify(title)}-${Date.now().toString(36)}`,
      title,
      emoji: String(data.get('emoji') || '').trim() || '🍽️',
      description: String(data.get('description') || '').trim(),
      types,
      tags,
      minutes: clamp(num(data.get('minutes'), 0), 0, 600),
      servings: clamp(num(data.get('servings'), 2), 1, 20),
      nutrition: {
        calories: clamp(num(data.get('calories'), 0), 0, 5000),
        protein: clamp(num(data.get('protein'), 0), 0, 500),
        carbs: clamp(num(data.get('carbs'), 0), 0, 500),
        fat: clamp(num(data.get('fat'), 0), 0, 500)
      },
      ingredients,
      steps
    };

    const index = state.recipes.findIndex((entry) => entry.id === recipe.id);
    if (index >= 0) state.recipes[index] = recipe;
    else state.recipes.unshift(recipe);

    saveState();
    hideModal('formModal');
    renderAll();
    toast(index >= 0 ? 'Recipe updated.' : 'Recipe added to your cookbook.');
  }

  function confirmDeleteRecipe(recipeId) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return;
    let uses = 0;
    Object.keys(state.plans).forEach((week) => {
      const plan = state.plans[week] || {};
      Object.keys(plan).forEach((slot) => {
        const entry = plan[slot];
        if (entry && entry.recipeId === recipeId) uses += 1;
      });
    });

    confirmAction({
      emoji: '🗑️',
      title: `Delete ${recipe.title}?`,
      message: uses
        ? `It's used in ${uses} planned meal${uses === 1 ? '' : 's'}. Those slots will be emptied too.`
        : 'It will disappear from your cookbook. This cannot be undone.',
      confirmLabel: 'Delete recipe',
      danger: true,
      onConfirm: () => {
        state.recipes = state.recipes.filter((entry) => entry.id !== recipeId);
        Object.keys(state.plans).forEach((week) => {
          const plan = state.plans[week] || {};
          Object.keys(plan).forEach((slot) => {
            if (plan[slot] && plan[slot].recipeId === recipeId) delete plan[slot];
          });
        });
        saveState();
        hideModal('detailModal');
        renderAll();
        toast('Recipe deleted.');
      }
    });
  }

  /* ---------- shopping list ---------- */

  function buildShoppingList() {
    const items = new Map();
    const recipesUsed = new Set();
    const plan = getPlan();

    Object.keys(plan).forEach((slot) => {
      const entry = plan[slot];
      if (!entry || !entry.recipeId) return;
      const recipe = getRecipe(entry.recipeId);
      if (!recipe) return;
      recipesUsed.add(recipe.id);
      (recipe.ingredients || []).forEach((ingredient) => {
        if (!ingredient.name) return;
        const qty = Number(ingredient.qty);
        if (!Number.isFinite(qty) || qty <= 0) return;
        const unit = ingredient.unit || 'g';
        const aisle = ingredient.aisle || 'Other';
        const key = `${aisle}||${ingredient.name.toLowerCase()}`;
        if (!items.has(key)) {
          items.set(key, {
            key,
            name: ingredient.name,
            aisle,
            extraId: null,
            parts: []
          });
        }
        const item = items.get(key);
        const part = item.parts.find((entry) => entry.unit === unit);
        if (part) part.qty += qty;
        else item.parts.push({ unit, qty });
      });
    });

    const extras = state.extras[currentWeek] || [];
    extras.forEach((extra) => {
      items.set(`extra||${extra.id}`, {
        key: `extra||${extra.id}`,
        name: extra.name,
        unit: null,
        qty: null,
        aisle: extra.aisle || 'Other',
        extraId: extra.id
      });
    });

    const checked = state.checked[currentWeek] || {};
    const all = Array.from(items.values()).map((item) => ({
      ...item,
      checked: Boolean(checked[item.key])
    }));

    const groups = AISLES.map((aisle) => ({
      ...aisle,
      items: all
        .filter((item) => item.aisle === aisle.key)
        .sort((a, b) => {
          if (a.checked !== b.checked) return a.checked ? 1 : -1;
          return a.name.localeCompare(b.name);
        })
    })).filter((group) => group.items.length);

    return { items: all, groups, recipesUsed: recipesUsed.size };
  }

  function shopSubText(shop) {
    if (!shop.items.length) return 'Nothing to buy yet — plan a meal and this fills itself.';
    const checked = shop.items.filter((item) => item.checked).length;
    return `${shop.items.length} item${shop.items.length === 1 ? '' : 's'} · ${checked} checked · ${shop.recipesUsed} recipe${shop.recipesUsed === 1 ? '' : 's'}`;
  }

  function renderShopSummary(shop) {
    const summary = $('#shopSummary');
    if (!summary) return;
    const total = shop.items.length;
    const checked = shop.items.filter((item) => item.checked).length;
    const percent = total ? Math.round((checked / total) * 100) : 0;
    const planned = countPlanned();
    const done = total > 0 && checked === total;

    summary.innerHTML = `<div class="shop-progress">
      <div class="ring" style="--p:${percent}" role="img" aria-label="${percent}% of groceries collected">
        <span class="ring-label">${percent}<small>%</small></span>
      </div>
      <div class="shop-progress-copy">
        <strong>${checked} of ${total}</strong>
        <span>items collected</span>
      </div>
    </div>
    <div class="shop-stats">
      <div class="shop-stat"><span>Recipes this week</span><b>${shop.recipesUsed}</b></div>
      <div class="shop-stat"><span>Meals planned</span><b>${planned}</b></div>
      <div class="shop-stat"><span>Aisles to visit</span><b>${shop.groups.length}</b></div>
    </div>
    ${done ? `<div class="shop-progress-note">${icon('check')} All done — happy cooking.</div>` : ''}`;
  }

  function shopItemHtml(item) {
    const checked = item.checked ? ' is-checked' : '';
    const extra = item.extraId ? ' is-extra' : '';
    return `<div class="shop-item${checked}${extra}" data-key="${esc(item.key)}">
      <label class="shop-label">
        <input class="shop-check-input" type="checkbox" data-key="${esc(item.key)}" ${item.checked ? 'checked' : ''}>
        <span class="tick">${icon('check')}</span>
        <span class="item-name">${esc(item.name)}</span>
        <span class="item-qty">${esc(itemAmount(item))}</span>
      </label>
      ${item.extraId ? `<button class="item-remove" type="button" data-action="remove-extra" data-id="${esc(item.extraId)}" aria-label="Remove ${esc(item.name)} from the list">${icon('close')}</button>` : ''}
    </div>`;
  }

  function renderShopLists(shop) {
    const lists = $('#shopLists');
    if (!lists) return;
    if (!shop.items.length) {
      lists.innerHTML = `<div class="empty">
        <span class="empty-emoji" aria-hidden="true">🧺</span>
        <h3>Your basket is empty</h3>
        <p>Plan a few meals and the shopping list builds itself, grouped by aisle.</p>
        <button class="btn btn-primary" type="button" data-action="go-planner">Open the planner</button>
      </div>`;
      return;
    }
    lists.innerHTML = shop.groups.map((group) => `<section class="aisle-group">
      <div class="aisle-head">
        <span class="aisle-icon" aria-hidden="true">${group.icon}</span>
        <h3>${esc(group.key)}</h3>
        <span class="aisle-count">${group.items.length}</span>
      </div>
      <div class="aisle-items">${group.items.map(shopItemHtml).join('')}</div>
    </section>`).join('');
  }

  function renderShopping() {
    const shop = buildShoppingList();
    const sub = $('#shopSub');
    if (sub) sub.textContent = shopSubText(shop);
    const title = $('#shopListTitle');
    if (title) {
      const label = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(parseISO(currentWeek));
      title.textContent = `Week of ${label}`;
    }
    renderShopSummary(shop);
    renderShopLists(shop);
  }

  function toggleShopItem(input) {
    const key = input.dataset.key;
    if (!key) return;
    if (!state.checked[currentWeek]) state.checked[currentWeek] = {};
    if (input.checked) state.checked[currentWeek][key] = true;
    else delete state.checked[currentWeek][key];
    saveState();
    const row = input.closest('.shop-item');
    if (row) row.classList.toggle('is-checked', input.checked);
    const shop = buildShoppingList();
    renderShopSummary(shop);
    const sub = $('#shopSub');
    if (sub) sub.textContent = shopSubText(shop);
  }

  function onAddExtra(event) {
    event.preventDefault();
    const input = $('#extraName');
    const aisleSelect = $('#extraAisle');
    const name = input ? input.value.trim() : '';
    if (!name) {
      if (input) input.focus();
      return;
    }
    if (!state.extras[currentWeek]) state.extras[currentWeek] = [];
    state.extras[currentWeek].push({
      id: `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      name,
      aisle: aisleSelect ? aisleSelect.value : 'Other'
    });
    saveState();
    if (input) input.value = '';
    renderShopping();
    if (input) input.focus();
    toast('Added to your list.');
  }

  function removeExtra(id) {
    const list = state.extras[currentWeek] || [];
    const item = list.find((entry) => entry.id === id);
    state.extras[currentWeek] = list.filter((entry) => entry.id !== id);
    if (state.checked[currentWeek]) delete state.checked[currentWeek][`extra||${id}`];
    saveState();
    renderShopping();
    toast(item ? `"${item.name}" removed.` : 'Item removed.');
  }

  function resetChecks() {
    const checked = state.checked[currentWeek] || {};
    if (!Object.keys(checked).length) {
      toast('Nothing is checked off yet.');
      return;
    }
    state.checked[currentWeek] = {};
    saveState();
    renderShopping();
    toast('All checkmarks cleared.');
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) { /* fall through */ }
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.focus();
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch (error) {
      return false;
    }
  }

  function copyShoppingList() {
    const shop = buildShoppingList();
    if (!shop.items.length) {
      toast('Plan some meals first — the list is empty.');
      return;
    }
    const lines = [`PANTRY & PLAN — ${weekRangeLabel()}`, ''];
    shop.groups.forEach((group) => {
      lines.push(group.key.toUpperCase());
      group.items.forEach((item) => {
        lines.push(`  [${item.checked ? 'x' : ' '}] ${shoppingLine(item)}`);
      });
      lines.push('');
    });
    copyText(lines.join('\n')).then((ok) => {
      toast(ok ? 'Shopping list copied to your clipboard.' : 'Could not access the clipboard.');
    });
  }

  function printShopping() {
    setView('shopping');
    window.setTimeout(() => window.print(), 180);
  }

  /* ---------- week actions ---------- */

  function autoFillWeek() {
    if (!state.plans[currentWeek]) state.plans[currentWeek] = {};
    const plan = state.plans[currentWeek];
    const empty = [];
    DAYS.forEach((day) => {
      MEALS.forEach((meal) => {
        const slot = `${day.key}-${meal.key}`;
        if (!plan[slot]) empty.push({ slot, meal: meal.key });
      });
    });
    if (!empty.length) {
      toast('This week is already full. Clear a slot to make room.');
      return;
    }

    const used = new Set(
      Object.values(plan).filter((entry) => entry && entry.recipeId).map((entry) => entry.recipeId)
    );
    const pools = {};
    MEALS.forEach((meal) => {
      pools[meal.key] = shuffle(state.recipes.filter((recipe) => (recipe.types || []).includes(meal.key)));
    });

    let added = 0;
    empty.forEach(({ slot, meal }) => {
      const pool = pools[meal] || [];
      if (!pool.length) return;
      const pick = pool.find((recipe) => !used.has(recipe.id)) || pool[Math.floor(Math.random() * pool.length)];
      plan[slot] = { recipeId: pick.id };
      used.add(pick.id);
      added += 1;
    });

    if (!added) {
      toast('No recipes fit those meal times yet. Add a recipe first.');
      return;
    }
    saveState();
    renderAll();
    toast(`${added} meal${added === 1 ? '' : 's'} added. The week is taking shape.`);
  }

  function clearWeek() {
    const planned = countPlanned();
    if (!planned) {
      toast('This week is already empty.');
      return;
    }
    confirmAction({
      emoji: '🧹',
      title: 'Clear this week?',
      message: `This removes ${planned} planned meal${planned === 1 ? '' : 's'} for ${weekRangeLabel()}. Your recipes and shopping extras stay.`,
      confirmLabel: 'Clear week',
      danger: true,
      onConfirm: () => {
        delete state.plans[currentWeek];
        delete state.checked[currentWeek];
        saveState();
        renderAll();
        toast('Week cleared. A fresh start.');
      }
    });
  }

  function shiftWeek(days) {
    currentWeek = isoDate(addDays(parseISO(currentWeek), days));
    renderAll();
  }

  /* ---------- view, actions, boot ---------- */

  function renderAll() {
    renderPlanner();
    renderRecipes();
    renderShopping();
  }

  function setView(next) {
    const valid = ['planner', 'recipes', 'shopping'];
    const target = valid.includes(next) ? next : 'planner';
    view = target;
    $$('.view').forEach((section) => {
      section.hidden = section.id !== `view-${target}`;
    });
    $$('.tab').forEach((tab) => {
      const active = tab.dataset.view === target;
      tab.classList.toggle('is-active', active);
      if (active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    if (location.hash !== `#${target}`) {
      try {
        history.replaceState(null, '', `#${target}`);
      } catch (error) {
        location.hash = target;
      }
    }
    if (target === 'planner') renderPlanner();
    else if (target === 'recipes') renderRecipes();
    else renderShopping();
  }

  function handleAction(element, event) {
    const action = element.dataset.action;
    switch (action) {
      case 'slot':
        event.preventDefault();
        openSlot(element.dataset.slot);
        break;

      case 'unplan':
        event.preventDefault();
        event.stopPropagation();
        removeEntry(element.dataset.slot);
        hideModal('detailModal');
        renderAll();
        toast('Meal removed from your week.');
        break;

      case 'open-recipe':
        openDetail(element.dataset.id);
        break;

      case 'quick-plan':
        openPicker(null, element.dataset.id);
        break;

      case 'detail-plan':
        openPicker(null, ui.detailId);
        break;

      case 'detail-edit': {
        const recipe = getRecipe(ui.detailId);
        hideModal('detailModal');
        if (recipe) openRecipeForm(recipe);
        break;
      }

      case 'detail-delete':
        confirmDeleteRecipe(ui.detailId);
        break;

      case 'detail-unplan':
        if (ui.detailFrom) {
          removeEntry(ui.detailFrom);
          hideModal('detailModal');
          renderAll();
          toast('Removed from your plan.');
        }
        break;

      case 'picker-add':
        addRecipeToSlot(element.dataset.id, ui.picker.day, ui.picker.meal);
        break;

      case 'add-custom':
        addCustomMeal();
        break;

      case 'add-ingredient': {
        const rows = $('#ingredientRows');
        if (!rows) break;
        rows.insertAdjacentHTML('beforeend', ingredientRowHtml());
        const added = rows.lastElementChild;
        const nameInput = added ? added.querySelector('.ing-name') : null;
        if (nameInput) nameInput.focus();
        break;
      }

      case 'remove-ingredient': {
        const row = element.closest('.ing-row');
        if (!row) break;
        const rows = $$('.ing-row', row.parentElement);
        if (rows.length <= 1) {
          $$('input', row).forEach((input) => { input.value = ''; });
          const nameInput = row.querySelector('.ing-name');
          if (nameInput) nameInput.focus();
        } else {
          row.remove();
        }
        break;
      }

      case 'new-recipe':
        openRecipeForm(null);
        break;

      case 'copy-list':
        copyShoppingList();
        break;

      case 'print-list':
        printShopping();
        break;

      case 'reset-checks':
        resetChecks();
        break;

      case 'remove-extra':
        removeExtra(element.dataset.id);
        break;

      case 'go-planner':
        setView('planner');
        break;

      case 'clear-filters': {
        ui.search = '';
        ui.filter = 'all';
        const searchInput = $('#recipeSearch');
        if (searchInput) searchInput.value = '';
        renderFilters();
        renderRecipeGrid();
        break;
      }

      default:
        break;
    }
  }

  function populateAisles() {
    const select = $('#extraAisle');
    if (!select) return;
    select.innerHTML = AISLES.map((aisle) => `<option value="${esc(aisle.key)}">${esc(aisle.key)}</option>`).join('');
  }

  function bindEvents() {
    const themeToggle = $('#themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    const newRecipe = $('#newRecipeBtn');
    if (newRecipe) newRecipe.addEventListener('click', () => openRecipeForm(null));

    const prevWeek = $('#prevWeek');
    if (prevWeek) prevWeek.addEventListener('click', () => shiftWeek(-7));

    const nextWeek = $('#nextWeek');
    if (nextWeek) nextWeek.addEventListener('click', () => shiftWeek(7));

    const todayBtn = $('#todayBtn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        currentWeek = isoDate(mondayOf(new Date()));
        renderAll();
      });
    }

    const autoFill = $('#autoFillBtn');
    if (autoFill) autoFill.addEventListener('click', autoFillWeek);

    const clear = $('#clearWeekBtn');
    if (clear) clear.addEventListener('click', clearWeek);

    $$('.tab').forEach((tab) => {
      tab.addEventListener('click', () => setView(tab.dataset.view));
    });

    const search = $('#recipeSearch');
    if (search) {
      search.addEventListener('input', () => {
        ui.search = search.value;
        renderRecipeGrid();
      });
    }

    const filters = $('#filters');
    if (filters) {
      filters.addEventListener('click', (event) => {
        const chip = event.target.closest('.chip');
        if (!chip) return;
        ui.filter = chip.dataset.filter;
        renderFilters();
        renderRecipeGrid();
      });
    }

    const extraForm = $('#extraForm');
    if (extraForm) extraForm.addEventListener('submit', onAddExtra);

    document.addEventListener('click', (event) => {
      const closer = event.target.closest('[data-close]');
      if (closer) {
        const backdrop = closer.closest('.modal-backdrop');
        if (backdrop) hideModal(backdrop.id);
        return;
      }
      const actionElement = event.target.closest('[data-action]');
      if (actionElement) handleAction(actionElement, event);
    });

    document.addEventListener('change', (event) => {
      const target = event.target;
      if (target.classList.contains('shop-check-input')) {
        toggleShopItem(target);
        return;
      }
      if (target.id === 'pickerDay') {
        ui.picker.day = target.value;
        syncPickerTarget();
        return;
      }
      if (target.id === 'pickerMeal') {
        ui.picker.meal = target.value;
        syncPickerTarget();
      }
    });

    document.addEventListener('input', (event) => {
      if (event.target.id === 'pickerSearch') {
        ui.picker.search = event.target.value;
        renderPickerList();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const open = $$('.modal-backdrop:not([hidden])');
      if (open.length) hideModal(open[open.length - 1].id);
    });

    $$('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('mousedown', (event) => {
        if (event.target === backdrop) hideModal(backdrop.id);
      });
    });

    window.addEventListener('hashchange', () => {
      const next = location.hash.replace('#', '');
      if (next !== view) setView(next);
    });

    bindBoardDragEvents();
  }

  function init() {
    state = loadState();
    currentWeek = isoDate(mondayOf(new Date()));
    applyTheme();
    populateAisles();
    bindEvents();
    renderAll();
    const initial = location.hash.replace('#', '');
    setView(['planner', 'recipes', 'shopping'].includes(initial) ? initial : 'planner');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
