'use strict';

// ---------- Constantes ----------
const KEY = 'finanzas.v1';
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MSHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
// Orden fijo de colores validado para daltonismo (pares adyacentes).
const BASE_CATS = [
  { id: 'viv', name: 'Vivienda', light: '#2a78d6', dark: '#3987e5' },
  { id: 'ali', name: 'Alimentación', light: '#eb6834', dark: '#d95926' },
  { id: 'tra', name: 'Transporte', light: '#1baf7a', dark: '#199e70' },
  { id: 'ser', name: 'Servicios', light: '#eda100', dark: '#c98500' },
  { id: 'oci', name: 'Ocio', light: '#e87ba4', dark: '#d55181' },
  { id: 'sal', name: 'Salud', light: '#008300', dark: '#008300' },
  { id: 'otr', name: 'Otros', light: '#6250d6', dark: '#9085e9' }
];
// Colores disponibles para categorías nuevas (paleta base + tres extra).
const COLOR_CHOICES = [
  { light: '#2a78d6', dark: '#3987e5' }, { light: '#eb6834', dark: '#d95926' }, { light: '#1baf7a', dark: '#199e70' },
  { light: '#eda100', dark: '#c98500' }, { light: '#e87ba4', dark: '#d55181' }, { light: '#008300', dark: '#008300' },
  { light: '#6250d6', dark: '#9085e9' }, { light: '#e34948', dark: '#e66767' }, { light: '#8a6a4b', dark: '#b08a64' },
  { light: '#6b6a65', dark: '#a3a29a' }
];
// Categorías base + las creadas por el usuario; "Otros" siempre al final.
function cats() {
  return BASE_CATS.filter((c) => c.id !== 'otr').concat(db.cats || [], BASE_CATS.filter((c) => c.id === 'otr'));
}
const SERIES = { inc: { light: '#2e9e4a', dark: '#4cc26b' }, exp: { light: '#e8452c', dark: '#ff6a4f' } };
const STATUS_LABEL = { none: 'Sin tope', good: 'En rango', warn: 'Cerca del tope', crit: 'Excedido' };
const ICON = {
  left: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>',
  right: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>',
  wallet: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h12v4"></path><path d="M3 7v10a2 2 0 0 0 2 2h14V9H5a2 2 0 0 1-2-2z"></path></svg>',
  down: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M19 12l-7 7-7-7"></path></svg>',
  up: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"></path><path d="M5 12l7-7 7 7"></path></svg>',
  pct: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M19 5L5 19"></path><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>',
  shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"></path></svg>',
  good: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>',
  warn: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v9"></path><path d="M12 18.5v.5"></path></svg>',
  crit: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10"></path><path d="M17 7L7 17"></path></svg>',
  none: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"></path></svg>',
  repeat: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4"></path><path d="M3 11V9a3 3 0 0 1 3-3h15"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v2a3 3 0 0 1-3 3H3"></path></svg>'
};

// ---------- Utilidades ----------
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayISO = () => isoOf(new Date());
const currentMonth = () => todayISO().slice(0, 7);
const parseKey = (k) => k.split('-').map(Number);
const addMonths = (k, n) => { const [y, m] = parseKey(k); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
const daysIn = (k) => { const [y, m] = parseKey(k); return new Date(y, m, 0).getDate(); };
const monthLabel = (k) => { const [y, m] = parseKey(k); return MONTHS[m - 1] + ' ' + y; };
const monthName = (k) => MONTHS[parseKey(k)[1] - 1];
const monthShort = (k) => MSHORT[parseKey(k)[1] - 1];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isDark = () => matchMedia('(prefers-color-scheme: dark)').matches;
const col = (c) => (isDark() ? c.dark : c.light);
const catById = (id) => cats().find((c) => c.id === id) || BASE_CATS[BASE_CATS.length - 1];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const fmt = (n) => db.currency + ' ' + Math.round(n).toLocaleString('en-US');
const fmt2 = (n) => db.currency + ' ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kfmt = (v) => (v === 0 ? '0' : v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + 'k' : String(Math.round(v)));
const parseAmount = (s) => { const n = Number(String(s).replace(/\s/g, '').replace(',', '.')); return isFinite(n) ? n : NaN; };
function niceCeil(v) {
  if (v <= 0) return 1000;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

// ---------- Datos ----------
function emptyDb() { return { v: 1, currency: 'S/', startBalance: 0, cats: [], txs: [], loans: [], accounts: [], fixed: [], goals: [], lastAcc: '', recurring: {}, once: {} }; }
const dayNum = (v) => { const n = Math.round(Number(v)); return n >= 1 && n <= 31 ? n : null; };
const round2 = (n) => Math.round(n * 100) / 100;

function normalize(d) {
  const out = emptyDb();
  if (!d || typeof d !== 'object') return out;
  if (typeof d.currency === 'string' && d.currency.length <= 4) out.currency = d.currency;
  out.startBalance = Number(d.startBalance) || 0;
  const hex = /^#[0-9a-f]{6}$/i;
  if (Array.isArray(d.cats)) {
    out.cats = d.cats
      .filter((c) => c && /^c_[a-z0-9]{3,16}$/.test(c.id) && typeof c.name === 'string' && c.name.trim() && hex.test(c.light) && hex.test(c.dark))
      .slice(0, 30)
      .map((c) => ({ id: c.id, name: c.name.trim().slice(0, 24), light: c.light, dark: c.dark }));
  }
  const CAT_IDS = new Set(BASE_CATS.map((c) => c.id).concat(out.cats.map((c) => c.id)));
  if (Array.isArray(d.txs)) {
    out.txs = d.txs
      .filter((t) => t && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && isFinite(Number(t.amount)) && Number(t.amount) > 0)
      .map((t) => ({
        id: String(t.id || uid()),
        type: t.type === 'ingreso' ? 'ingreso' : 'gasto',
        amount: Math.round(Number(t.amount) * 100) / 100,
        cat: CAT_IDS.has(t.cat) ? t.cat : 'otr',
        date: t.date,
        note: String(t.note || '').slice(0, 120),
        acc: typeof t.acc === 'string' ? t.acc.slice(0, 40) : '',
        fixedId: typeof t.fixedId === 'string' ? t.fixedId.slice(0, 40) : ''
      }));
  }
  if (Array.isArray(d.fixed)) {
    out.fixed = d.fixed
      .filter((f) => f && typeof f.name === 'string' && f.name.trim() && Number(f.amount) > 0 && dayNum(f.day))
      .slice(0, 60)
      .map((f) => ({
        id: String(f.id || uid()),
        name: f.name.trim().slice(0, 60),
        type: f.type === 'ingreso' ? 'ingreso' : 'gasto',
        amount: round2(Number(f.amount)),
        cat: CAT_IDS.has(f.cat) ? f.cat : 'otr',
        acc: typeof f.acc === 'string' ? f.acc.slice(0, 40) : '',
        day: dayNum(f.day)
      }));
  }
  if (Array.isArray(d.goals)) {
    out.goals = d.goals
      .filter((g) => g && typeof g.name === 'string' && g.name.trim() && Number(g.target) > 0)
      .slice(0, 30)
      .map((g) => ({
        id: String(g.id || uid()),
        name: g.name.trim().slice(0, 60),
        target: round2(Number(g.target)),
        saved: round2(Math.max(0, Number(g.saved) || 0)),
        deadline: /^\d{4}-\d{2}$/.test(g.deadline) ? g.deadline : ''
      }));
  }
  if (Array.isArray(d.accounts)) {
    out.accounts = d.accounts
      .filter((a) => a && typeof a.name === 'string' && a.name.trim())
      .slice(0, 30)
      .map((a) => {
        const kind = a.kind === 'tarjeta' ? 'tarjeta' : 'cuenta';
        return {
          id: String(a.id || uid()),
          name: a.name.trim().slice(0, 40),
          kind,
          balance: kind === 'cuenta' ? round2(Number(a.balance) || 0) : 0,
          debt: kind === 'tarjeta' ? round2(Number(a.debt) || 0) : 0,
          limit: kind === 'tarjeta' && Number(a.limit) > 0 ? round2(Number(a.limit)) : null,
          closeDay: kind === 'tarjeta' ? dayNum(a.closeDay) : null,
          payDay: kind === 'tarjeta' ? dayNum(a.payDay) : null,
          updated: /^\d{4}-\d{2}-\d{2}$/.test(a.updated) ? a.updated : todayISO()
        };
      });
  }
  out.lastAcc = typeof d.lastAcc === 'string' ? d.lastAcc.slice(0, 40) : '';
  if (Array.isArray(d.loans)) {
    out.loans = d.loans
      .filter((l) => l && isFinite(Number(l.amount)) && Number(l.amount) > 0 && typeof l.desc === 'string' && l.desc.trim())
      .map((l) => ({
        id: String(l.id || uid()),
        amount: Math.round(Number(l.amount) * 100) / 100,
        desc: l.desc.trim().slice(0, 80),
        date: /^\d{4}-\d{2}-\d{2}$/.test(l.date) ? l.date : todayISO(),
        paid: l.paid === true
      }));
  }
  if (d.recurring && typeof d.recurring === 'object') {
    for (const id of Object.keys(d.recurring)) {
      if (!CAT_IDS.has(id) || !Array.isArray(d.recurring[id])) continue;
      out.recurring[id] = d.recurring[id]
        .filter((e) => e && /^\d{4}-\d{2}$/.test(e.from) && (e.amount === null || (isFinite(e.amount) && e.amount >= 0)))
        .map((e) => ({ from: e.from, amount: e.amount === null ? null : Number(e.amount) }))
        .sort((a, b) => (a.from < b.from ? -1 : 1));
    }
  }
  if (d.once && typeof d.once === 'object') {
    for (const k of Object.keys(d.once)) {
      const v = d.once[k];
      if (/^\d{4}-\d{2}\|[a-z0-9_]+$/.test(k) && CAT_IDS.has(k.split('|')[1]) && (v === null || (isFinite(v) && v >= 0))) out.once[k] = v === null ? null : Number(v);
    }
  }
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalize(JSON.parse(raw)) : emptyDb();
  } catch (e) {
    return emptyDb();
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { toast('No se pudo guardar en este dispositivo.'); }
}

let db = load();
const ui = { tab: 'inicio', month: currentMonth(), hoverCat: null, editing: null, q: '', fCat: '', fAcc: '', allMonths: false };
const charts = {};

// ---------- Topes (recurrentes con historial + excepciones de un mes) ----------
// recurring[cat] = [{from:'YYYY-MM', amount}] → el tope vigente es la última entrada con from <= mes.
// once['YYYY-MM|cat'] = monto → excepción que aplica solo a ese mes.
function capRec(cat, key) {
  let v = null;
  for (const e of db.recurring[cat] || []) if (e.from <= key) v = e.amount;
  return v;
}
const onceKey = (cat, key) => key + '|' + cat;
function capFor(cat, key) {
  const k = onceKey(cat, key);
  return hasOwn(db.once, k) ? db.once[k] : capRec(cat, key);
}
function isRecurring(cat, key) { return !hasOwn(db.once, onceKey(cat, key)) && capRec(cat, key) != null; }
function setRec(cat, key, amount) {
  const arr = (db.recurring[cat] || []).filter((e) => e.from !== key);
  arr.push({ from: key, amount });
  arr.sort((a, b) => (a.from < b.from ? -1 : 1));
  db.recurring[cat] = arr;
}
function setCap(cat, key, amount) {
  if (hasOwn(db.once, onceKey(cat, key))) db.once[onceKey(cat, key)] = amount;
  else setRec(cat, key, amount);
}
function toggleRecurring(cat, key, on) {
  const now = capFor(cat, key);
  if (now == null) return;
  const k = onceKey(cat, key);
  if (on) { delete db.once[k]; setRec(cat, key, now); return; }
  // "Solo este mes": el monto queda como excepción y los demás meses vuelven al tope recurrente anterior.
  db.once[k] = now;
  db.recurring[cat] = (db.recurring[cat] || []).filter((e) => e.from !== key);
}

// ---------- Cálculos ----------
function monthStats(key) {
  const byCat = {};
  cats().forEach((c) => { byCat[c.id] = 0; });
  let inc = 0, exp = 0;
  for (const t of db.txs) {
    if (t.date.slice(0, 7) !== key) continue;
    if (t.type === 'ingreso') inc += t.amount;
    else { exp += t.amount; byCat[hasOwn(byCat, t.cat) ? t.cat : 'otr'] += t.amount; }
  }
  return { inc, exp, byCat };
}
function balanceUpTo(key) {
  let b = db.startBalance;
  for (const t of db.txs) if (t.date.slice(0, 7) <= key) b += t.type === 'ingreso' ? t.amount : -t.amount;
  return b;
}
function capRows(key) {
  const st = monthStats(key);
  return cats().map((c) => {
    const cap = capFor(c.id, key);
    const spent = st.byCat[c.id];
    const pct = cap ? (spent / cap) * 100 : cap === 0 && spent > 0 ? 999 : 0;
    const status = cap == null ? 'none' : pct > 100 ? 'crit' : pct >= 90 ? 'warn' : 'good';
    return { cat: c, cap, spent, pct, status, recurring: isRecurring(c.id, key) };
  });
}

// Curva monótona (Fritsch–Carlson): suave y sin rebasar los datos.
function smooth(pts) {
  const n = pts.length;
  if (n === 0) return '';
  if (n === 1) return 'M ' + pts[0][0] + ' ' + pts[0][1];
  const d = [], t = [];
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
  t[0] = d[0];
  t[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / d[i], b = t[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * d[i]; t[i + 1] = k * b * d[i]; }
  }
  const f = (v) => v.toFixed(1);
  let p = 'M ' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  for (let i = 0; i < n - 1; i++) {
    const h = pts[i + 1][0] - pts[i][0];
    p += ' C ' + f(pts[i][0] + h / 3) + ' ' + f(pts[i][1] + (t[i] * h) / 3) + ' ' +
      f(pts[i + 1][0] - h / 3) + ' ' + f(pts[i + 1][1] - (t[i + 1] * h) / 3) + ' ' + f(pts[i + 1][0]) + ' ' + f(pts[i + 1][1]);
  }
  return p;
}
const areaOf = (pts, line, base) => line + ' L ' + pts[pts.length - 1][0].toFixed(1) + ' ' + base + ' L ' + pts[0][0].toFixed(1) + ' ' + base + ' Z';
const chartWidth = () => Math.max(260, Math.min(720, document.documentElement.clientWidth) - 32 - 34);
// Ancho para dos tarjetas lado a lado.
const pairWidth = () => Math.max(130, Math.floor((Math.min(720, document.documentElement.clientWidth) - 32 - 12) / 2) - 24);

// ---------- Vistas ----------
function monthBar() {
  const isNow = ui.month === currentMonth();
  return '<div class="monthbar">' +
    '<button class="icon-btn" type="button" data-action="prev" aria-label="Mes anterior">' + ICON.left + '</button>' +
    '<h1>' + monthLabel(ui.month) + '</h1>' +
    (isNow ? '' : '<button class="pill-btn" type="button" data-action="today">Hoy</button>') +
    '<button class="icon-btn" type="button" data-action="next" aria-label="Mes siguiente">' + ICON.right + '</button>' +
    '</div>';
}

function chip(status) { return '<span class="chip ' + status + '">' + ICON[status] + STATUS_LABEL[status] + '</span>'; }

function delta(cur, prev, upIsGood, prevKey) {
  if (!prev) return '<div class="dl muted">Sin datos del mes anterior</div>';
  const d = ((cur - prev) / prev) * 100;
  const up = d >= 0;
  return '<div class="dl ' + (up === upIsGood ? 'good' : 'bad') + '">' + (up ? '↑ ' : '↓ ') + Math.abs(d).toFixed(1) + '% vs ' + monthShort(prevKey).toLowerCase() + '</div>';
}

function kpi(icon, iconColor, label, value, foot, wide) {
  return '<div class="card' + (wide ? ' wide' : '') + '"><div class="kpi-label"><span class="kpi-icon" style="color:' + iconColor + '">' + icon + '</span>' + label + '</div>' +
    '<div class="kpi-value">' + value + '</div>' + foot + '</div>';
}

function renderInicio() {
  const key = ui.month;
  if (!db.txs.length) {
    return monthBar() + '<div class="card empty"><h2>Aún no hay movimientos</h2>' +
      '<p>Registra tus ingresos y gastos con el botón +. Si quieres ver cómo se ve la app, carga datos de ejemplo y luego bórralos desde Ajustes.</p>' +
      '<div class="btn-row" style="width:100%;max-width:360px"><button class="btn primary" type="button" data-action="add">Registrar movimiento</button>' +
      '<button class="btn" type="button" data-action="sample">Cargar ejemplo</button></div></div>' +
      '<div class="stack" style="margin-top:12px">' + renderAlerts() + renderHero() + renderAccounts() + renderGoals() + renderLoans() + '</div>';
  }
  const prevKey = addMonths(key, -1);
  const st = monthStats(key), pv = monthStats(prevKey);
  const sav = st.inc - st.exp;
  const rows = capRows(key).filter((r) => r.cap != null);
  const exceeded = rows.filter((r) => r.status === 'crit').length;
  const isNow = key === currentMonth();

  let html = monthBar() + '<div class="stack">' + renderAlerts() + renderHero() + '<div class="cards">';
  if (db.accounts.length) {
    const n = db.accounts.filter((a) => a.kind === 'cuenta').length;
    const debt = cardsDebt();
    html += kpi(ICON.wallet, col(SERIES.inc), 'Saldo en cuentas', fmt(accountsTotal()),
      debt > 0 ? '<div class="dl bad">Deuda tarjetas ' + fmt(debt) + '</div>'
        : '<div class="dl muted">' + n + (n === 1 ? ' cuenta' : ' cuentas') + ' · ' + new Date(lastAccountUpdate() + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) + '</div>');
  } else {
    html += kpi(ICON.wallet, col(SERIES.inc), isNow ? 'Saldo disponible' : 'Saldo al cierre', fmt(balanceUpTo(key)),
      '<div class="dl ' + (sav >= 0 ? 'good' : 'bad') + '">' + (sav >= 0 ? '+ ' : '− ') + fmt(Math.abs(sav)) + ' este mes</div>');
  }
  html += kpi(ICON.down, col(SERIES.inc), 'Ingresos', fmt(st.inc), delta(st.inc, pv.inc, true, prevKey));
  html += kpi(ICON.up, col(SERIES.exp), 'Gastos', fmt(st.exp), delta(st.exp, pv.exp, false, prevKey));
  html += kpi(ICON.pct, 'var(--good-text)', 'Tasa de ahorro', st.inc > 0 ? ((sav / st.inc) * 100).toFixed(1) + '%' : '—',
    '<div class="dl muted">' + (st.inc > 0 ? fmt(Math.max(0, sav)) + ' de ' + fmt(st.inc) : 'Sin ingresos este mes') + '</div>');
  html += kpi(ICON.shield, 'var(--ink)', 'Topes respetados',
    rows.length ? (rows.length - exceeded) + ' <small>de ' + rows.length + '</small>' : '—',
    !rows.length ? '<div class="dl muted">Define topes en la pestaña Topes</div>'
      : exceeded ? '<div class="dl bad">' + exceeded + (exceeded === 1 ? ' categoría excedida' : ' categorías excedidas') + '</div>'
        : '<div class="dl good">Todas dentro del tope</div>', true);
  html += '</div>';
  html += renderAccounts() + renderCardUsage() + renderTrendChart(key) + renderDonut(key, st) + renderCumChart(key, rows) + '<div class="cards pair">' + renderWeeks(key) + renderRing(key, st) + '</div>' + renderCapBars(rows) + renderSmallSpend(key, st) + renderGoals() + renderLoans();
  html += '</div>';
  return html;
}

function renderTrendChart(key) {
  const keys = [];
  for (let i = 5; i >= 0; i--) keys.push(addMonths(key, -i));
  const stats = keys.map(monthStats);
  const inc = stats.map((s) => s.inc), exp = stats.map((s) => s.exp);
  const W = chartWidth(), H = 200, L = 36, R = 10, T = 12, B = 26;
  const pw = W - L - R, ph = H - T - B, base = T + ph;
  const ymax = niceCeil(Math.max(1, ...inc, ...exp) * 1.05);
  const xs = keys.map((_, i) => L + (i * pw) / (keys.length - 1));
  const Y = (v) => T + ph - (v / ymax) * ph;
  const pi = inc.map((v, i) => [xs[i], Y(v)]), pe = exp.map((v, i) => [xs[i], Y(v)]);
  const li = smooth(pi), le = smooth(pe);
  const ci = col(SERIES.inc), ce = col(SERIES.exp);
  let g = '';
  for (let k = 0; k <= 4; k++) {
    const v = (ymax * k) / 4, y = Y(v).toFixed(1);
    g += '<line class="gl" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"></line>' +
      '<text class="yl" x="' + (L - 6) + '" y="' + (Number(y) + 4) + '" text-anchor="end">' + kfmt(v) + '</text>';
  }
  keys.forEach((k, i) => {
    g += '<text class="xl' + (i === keys.length - 1 ? ' on' : '') + '" x="' + xs[i].toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + monthShort(k) + '</text>';
  });
  const last = keys.length - 1;
  charts.trend = {
    W, xs,
    info: (i) => ({
      ys: [Y(inc[i]), Y(exp[i])],
      html: '<strong>' + monthLabel(keys[i]) + '</strong>' +
        '<span><span><i style="background:' + ci + '"></i>Ingresos</span><b>' + fmt(inc[i]) + '</b></span>' +
        '<span><span><i style="background:' + ce + '"></i>Gastos</span><b>' + fmt(exp[i]) + '</b></span>' +
        '<span><span>Ahorro</span><b>' + fmt(inc[i] - exp[i]) + '</b></span>'
    })
  };
  return '<section class="card" aria-label="Ingresos vs. gastos"><div class="card-head"><div><h2>Ingresos vs. gastos</h2><div class="sub">Últimos 6 meses · toca el gráfico para ver el detalle</div></div>' +
    '<div class="legend"><span><i style="background:' + ci + '"></i>Ingresos</span><span><i style="background:' + ce + '"></i>Gastos</span></div></div>' +
    '<div class="chart" data-chart="trend"><div class="tip" hidden></div>' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Ingresos y gastos de los últimos 6 meses">' + g +
    '<path d="' + areaOf(pi, li, base) + '" fill="' + ci + '" fill-opacity="0.08"></path>' +
    '<path d="' + areaOf(pe, le, base) + '" fill="' + ce + '" fill-opacity="0.08"></path>' +
    '<path class="ln" d="' + li + '" stroke="' + ci + '"></path>' +
    '<path class="ln" d="' + le + '" stroke="' + ce + '"></path>' +
    '<circle cx="' + xs[last] + '" cy="' + pi[last][1] + '" r="4.5" fill="' + ci + '" stroke="var(--surface)" stroke-width="2"></circle>' +
    '<circle cx="' + xs[last] + '" cy="' + pe[last][1] + '" r="4.5" fill="' + ce + '" stroke="var(--surface)" stroke-width="2"></circle>' +
    '<line class="cross" x1="0" x2="0" y1="' + T + '" y2="' + base + '"></line>' +
    '<circle class="hdot" r="5" fill="' + ci + '" stroke="var(--surface)" stroke-width="2"></circle>' +
    '<circle class="hdot" r="5" fill="' + ce + '" stroke="var(--surface)" stroke-width="2"></circle>' +
    '</svg></div></section>';
}

function renderDonut(key, st) {
  const total = st.exp;
  const r = 66, C = 2 * Math.PI * r, gap = total > 0 ? 3 : 0;
  let acc = 0, segs = '';
  const all = cats();
  const active = all.filter((c) => st.byCat[c.id] > 0);
  for (const c of active) {
    const len = (st.byCat[c.id] / total) * C;
    const dim = ui.hoverCat && ui.hoverCat !== c.id;
    segs += '<circle cx="90" cy="90" r="' + r + '" fill="none" stroke="' + col(c) + '" stroke-opacity="' + (dim ? 0.28 : 1) + '" stroke-width="24" ' +
      'stroke-dasharray="' + Math.max(0.5, len - (active.length > 1 ? gap : 0)).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-acc).toFixed(2) + '" transform="rotate(-90 90 90)"></circle>';
    acc += len;
  }
  if (!total) segs = '<circle cx="90" cy="90" r="' + r + '" fill="none" stroke="var(--track)" stroke-width="24"></circle>';
  const hc = ui.hoverCat ? catById(ui.hoverCat) : null;
  const center = hc
    ? '<small>' + esc(hc.name) + '</small><strong>' + fmt(st.byCat[hc.id]) + '</strong><em>' + (total ? ((st.byCat[hc.id] / total) * 100).toFixed(1) : '0') + '% del total</em>'
    : '<small>Total gastado</small><strong>' + fmt(total) + '</strong><em>' + monthName(key) + '</em>';
  const items = all.map((c) => {
    const v = st.byCat[c.id];
    const cls = 'cat-item' + (ui.hoverCat === c.id ? ' on' : ui.hoverCat ? ' dim' : '');
    return '<button type="button" class="' + cls + '" data-action="hl" data-cat="' + c.id + '" aria-pressed="' + (ui.hoverCat === c.id) + '">' +
      '<span class="sw" style="background:' + col(c) + '"></span><span class="name">' + esc(c.name) + '</span>' +
      '<span class="pct">' + (total ? ((v / total) * 100).toFixed(1) : '0.0') + '%</span><span class="amt">' + fmt(v) + '</span></button>';
  }).join('');
  return '<section class="card" aria-label="Gastos por categoría"><div class="card-head"><div><h2>Gastos por categoría</h2><div class="sub">Toca una categoría para resaltarla</div></div></div>' +
    '<div class="donut-wrap"><div class="donut"><svg viewBox="0 0 180 180" role="img" aria-label="Distribución de gastos por categoría">' + segs + '</svg><div class="center">' + center + '</div></div>' +
    '<div class="cat-list">' + items + '</div></div></section>';
}

function renderCumChart(key, capRowsWith) {
  const days = daysIn(key);
  const now = currentMonth();
  const elapsed = key < now ? days : key === now ? Number(todayISO().slice(8, 10)) : 0;
  const pj = projectMonth(key);
  const proj = pj ? pj.proj : null;
  const daily = new Array(days).fill(0);
  for (const t of db.txs) if (t.type === 'gasto' && t.date.slice(0, 7) === key) daily[Number(t.date.slice(8, 10)) - 1] += t.amount;
  const cum = [];
  let run = 0;
  for (let d = 0; d < elapsed; d++) { run += daily[d]; cum.push(run); }
  const capTotal = capRowsWith.reduce((a, r) => a + r.cap, 0);
  const hasCap = capRowsWith.length > 0;
  const W = chartWidth(), H = 190, L = 36, R = 10, T = 14, B = 26;
  const pw = W - L - R, ph = H - T - B, base = T + ph;
  const ymax = niceCeil(Math.max(run, hasCap ? capTotal : 0, proj || 0, 1) * 1.08);
  const X = (d) => L + (d * pw) / (days - 1);
  const Y = (v) => T + ph - (v / ymax) * ph;
  const pts = cum.map((v, d) => [X(d), Y(v)]);
  const line = smooth(pts);
  const c1 = col(SERIES.inc);
  let g = '';
  for (let k = 0; k <= 4; k++) {
    const v = (ymax * k) / 4, y = Y(v).toFixed(1);
    g += '<line class="gl" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"></line>' +
      '<text class="yl" x="' + (L - 6) + '" y="' + (Number(y) + 4) + '" text-anchor="end">' + kfmt(v) + '</text>';
  }
  [1, 8, 15, 22, days].forEach((d, i) => {
    g += '<text class="xl" x="' + X(d - 1).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + (i === 0 ? 'start' : i === 4 ? 'end' : 'middle') + '">' + d + ' ' + monthShort(key).toLowerCase() + '</text>';
  });
  if (hasCap) {
    const yc = Y(capTotal).toFixed(1);
    g += '<line class="capline" x1="' + L + '" x2="' + (W - R) + '" y1="' + yc + '" y2="' + yc + '"></line>' +
      '<text class="caplabel" x="' + (W - R) + '" y="' + (Number(yc) - 6) + '" text-anchor="end">Topes ' + fmt(capTotal) + '</text>';
  }
  let summary;
  if (!elapsed) summary = 'Este mes aún no empieza';
  else if (!hasCap) summary = 'Gastado: ' + fmt(run) + ' · sin topes definidos';
  else if (key === now) summary = 'Vas en ' + fmt(run) + ' de ' + fmt(capTotal) + ' (' + Math.round((run / Math.max(1, capTotal)) * 100) + '%) · ' +
    (days - elapsed === 0 ? 'último día' : days - elapsed === 1 ? 'queda 1 día' : 'quedan ' + (days - elapsed) + ' días');
  else summary = 'Cerraste en ' + fmt(run) + ' de ' + fmt(capTotal) + ' (' + Math.round((run / Math.max(1, capTotal)) * 100) + '%)';
  charts.cum = elapsed ? {
    W, xs: pts.map((p) => p[0]),
    info: (i) => ({
      ys: [pts[i][1]],
      html: '<strong>' + (i + 1) + ' de ' + monthName(key).toLowerCase() + '</strong>' +
        '<span><span>Acumulado</span><b>' + fmt(cum[i]) + '</b></span><span><span>Gasto del día</span><b>' + fmt(daily[i]) + '</b></span>'
    })
  } : null;
  const lastDot = pts.length ? '<circle cx="' + pts[pts.length - 1][0] + '" cy="' + pts[pts.length - 1][1] + '" r="4.5" fill="' + c1 + '" stroke="var(--surface)" stroke-width="2"></circle>' : '';
  return '<section class="card" aria-label="Gasto acumulado del mes"><div class="card-head"><div><h2>Gasto acumulado del mes</h2><div class="sub">' + summary + '</div></div>' +
    '<div class="legend"><span><i style="background:' + c1 + '"></i>Acumulado</span>' + (hasCap ? '<span><i class="dash"></i>Suma de topes</span>' : '') + '</div></div>' +
    '<div class="chart" data-chart="cum"><div class="tip" hidden></div>' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Gasto acumulado por día">' + g +
    (pts.length ? '<path d="' + areaOf(pts, line, base) + '" fill="' + c1 + '" fill-opacity="0.08"></path><path class="ln" d="' + line + '" stroke="' + c1 + '"></path>' : '') +
    (pj && pts.length ? '<path d="M ' + pts[pts.length - 1][0] + ' ' + pts[pts.length - 1][1] + ' L ' + X(days - 1) + ' ' + Y(proj) + '" fill="none" stroke="' + c1 + '" stroke-width="2" stroke-dasharray="5 4" opacity="0.7"></path>' +
      '<circle cx="' + X(days - 1) + '" cy="' + Y(proj) + '" r="3.5" fill="var(--surface)" stroke="' + c1 + '" stroke-width="2"></circle>' : '') +
    lastDot +
    '<line class="cross" x1="0" x2="0" y1="' + T + '" y2="' + base + '"></line>' +
    '<circle class="hdot" r="5" fill="' + c1 + '" stroke="var(--surface)" stroke-width="2"></circle>' +
    '</svg></div>' + (pj ? renderProjection(pj, capRowsWith) : '') + '</section>';
}

// Proyección del gasto del mes actual: lo gastado + fijos pendientes + ritmo diario de los gastos variables.
function projectMonth(key) {
  if (key !== currentMonth()) return null;
  const st = monthStats(key);
  const elapsed = Number(todayISO().slice(8, 10));
  const remaining = daysIn(key) - elapsed;
  const fixedPaid = db.txs.filter((t) => t.type === 'gasto' && t.fixedId && t.date.slice(0, 7) === key).reduce((a, t) => a + t.amount, 0);
  const fixedPending = db.fixed.filter((f) => f.type === 'gasto' && !fixedStatus(f, key).done).reduce((a, f) => a + f.amount, 0);
  const daily = (st.exp - fixedPaid) / elapsed;
  const restVar = daily * remaining;
  return { st, remaining, fixedPending, daily, restVar, proj: st.exp + fixedPending + restVar };
}

// Resumen de la proyección, dentro de la tarjeta de gasto acumulado.
function renderProjection(pj, rows) {
  const { st, remaining, fixedPending, daily, restVar, proj } = pj;
  const hasCap = rows.length > 0;
  const capTotal = rows.reduce((a, r) => a + r.cap, 0);
  const max = Math.max(proj, hasCap ? capTotal : 0, 1);
  const w = (v) => ((v / max) * 100).toFixed(2) + '%';
  const over = hasCap && proj > capTotal;
  const diff = Math.abs(proj - capTotal);
  const verdict = !hasCap ? '<div class="dl muted">Define topes en la pestaña Topes para comparar</div>'
    : over ? '<div class="dl bad">Superaría los topes por ' + fmt(diff) + '</div>'
      : '<div class="dl good">Dentro de los topes, con ' + fmt(diff) + ' de holgura</div>';
  const saving = st.inc > 0 ? '<div class="dl ' + (st.inc - proj >= 0 ? 'good' : 'bad') + '">Ahorro proyectado ' + fmt(st.inc - proj) + '</div>' : '';
  return '<div class="proj-foot">' +
    '<div class="sub" style="margin:0">Gastado ' + fmt(st.exp) + ' + fijos pendientes ' + fmt(fixedPending) + ' + ritmo de ' + fmt(daily) + ' por día × ' + remaining + (remaining === 1 ? ' día' : ' días') + '</div>' +
    '<div class="proj-value"><span>Proyección al cierre</span><strong>' + fmt(proj) + '</strong></div>' +
    '<div class="proj-track" role="img" aria-label="Gastado, proyectado y topes">' +
    '<span style="width:' + w(st.exp) + ';background:var(--grad)"></span>' +
    '<span style="width:' + w(fixedPending) + ';background:var(--accent);opacity:.55"></span>' +
    '<span style="width:' + w(restVar) + ';background:var(--accent);opacity:.25"></span>' +
    (hasCap ? '<i class="proj-cap" style="left:' + w(capTotal) + '"></i>' : '') + '</div>' +
    '<div class="legend" style="margin-top:8px"><span><i style="background:var(--grad)"></i>Gastado</span><span><i style="background:var(--accent);opacity:.55"></i>Fijos pendientes</span><span><i style="background:var(--accent);opacity:.25"></i>Ritmo restante</span>' + (hasCap ? '<span><i class="dash"></i>Topes ' + fmt(capTotal) + '</span>' : '') + '</div>' +
    verdict + saving + '</div>';
}

// Gasto por semana del mes: barras por bloque de 7 días.
function renderWeeks(key) {
  const days = daysIn(key);
  const daily = new Array(days).fill(0);
  for (const t of db.txs) if (t.type === 'gasto' && t.date.slice(0, 7) === key) daily[Number(t.date.slice(8, 10)) - 1] += t.amount;
  const ranges = [[1, 7], [8, 14], [15, 21], [22, days]];
  const vals = ranges.map(([a, b]) => { let s = 0; for (let d = a; d <= b; d++) s += daily[d - 1]; return s; });
  const W = pairWidth(), H = 170, L = 8, R = 8, T = 24, B = 26;
  const pw = W - L - R, ph = H - T - B, base = T + ph;
  const ymax = niceCeil(Math.max(1, ...vals) * 1.15);
  const slot = pw / ranges.length, bw = Math.min(64, slot * 0.56);
  const c = col(SERIES.exp);
  let g = '';
  ranges.forEach(([a, b], i) => {
    const v = vals[i], h = (v / ymax) * ph;
    const x = L + i * slot + (slot - bw) / 2, cx = (x + bw / 2).toFixed(1), y = (base - h).toFixed(1);
    g += '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="8" fill="' + c + '" opacity="' + (v ? 1 : 0.18) + '"></rect>' +
      '<text x="' + cx + '" y="' + (base - h - 6).toFixed(1) + '" text-anchor="middle" style="font-size:12px;font-weight:650;fill:var(--ink);font-variant-numeric:tabular-nums">' + (v ? kfmt(v) : '0') + '</text>' +
      '<text class="xl" x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle">S' + (i + 1) + '</text>';
  });
  const top = vals.indexOf(Math.max(...vals));
  const topLabel = ranges[top][0] + '–' + ranges[top][1];
  return '<section class="card" aria-label="Gasto por semana"><div class="card-head"><div><h2>Gasto por semana</h2>' +
    '<div class="sub">' + (Math.max(...vals) ? 'Semana más alta: días ' + topLabel + ' · ' + fmt(vals[top]) : 'Aún no hay gastos este mes') + '</div></div></div>' +
    '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Gasto por semana del mes">' +
    '<line class="gl" x1="' + L + '" x2="' + (W - R) + '" y1="' + base + '" y2="' + base + '"></line>' + g + '</svg></div></section>';
}

// Tasa de ahorro en anillo: qué parte de tus ingresos te queda.
function renderRing(key, st) {
  const sav = st.inc - st.exp;
  const hasInc = st.inc > 0;
  const rate = hasInc ? Math.max(0, Math.min(100, (sav / st.inc) * 100)) : 0;
  const r = 62, C = 2 * Math.PI * r;
  const ring = '<svg viewBox="0 0 160 160" role="img" aria-label="Tasa de ahorro ' + rate.toFixed(0) + '%">' +
    '<defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent)"></stop><stop offset="1" style="stop-color:var(--accent-2)"></stop></linearGradient></defs>' +
    '<circle cx="80" cy="80" r="' + r + '" fill="none" stroke="var(--track)" stroke-width="18"></circle>' +
    (rate > 0 ? '<circle cx="80" cy="80" r="' + r + '" fill="none" stroke="url(#ring-grad)" stroke-width="18" stroke-linecap="round" stroke-dasharray="' + (C * rate / 100).toFixed(2) + ' ' + C.toFixed(2) + '" transform="rotate(-90 80 80)"></circle>' : '') +
    '<text x="80" y="82" text-anchor="middle" style="font-size:28px;font-weight:700;fill:var(--ink)">' + (hasInc ? rate.toFixed(0) + '%' : '—') + '</text>' +
    '<text x="80" y="102" text-anchor="middle" style="font-size:12px;fill:var(--muted)">ahorrado</text></svg>';
  return '<section class="card" aria-label="Tasa de ahorro"><div class="card-head"><div><h2>Tasa de ahorro</h2><div class="sub">Lo que te queda de tus ingresos este mes</div></div></div>' +
    '<div class="donut-wrap"><div class="ring">' + ring + '</div><div class="cat-list">' +
    '<div class="sub" style="margin:0">Ingresos</div><div class="kpi-value" style="margin:0;font-size:20px">' + fmt(st.inc) + '</div>' +
    '<div class="sub" style="margin:10px 0 0">Gastos</div><div class="kpi-value" style="margin:0;font-size:20px">' + fmt(st.exp) + '</div>' +
    '<div class="sub" style="margin:10px 0 0">Te queda</div><div class="kpi-value" style="margin:0;font-size:20px;color:' + (sav >= 0 ? 'var(--good-text)' : 'var(--bad-text)') + '">' + (sav < 0 ? '− ' : '') + fmt(Math.abs(sav)) + '</div>' +
    '</div></div></section>';
}

// Avance de cada tope: cuánto llevas gastado en cada categoría con tope definido.
function renderCapBars(rows) {
  if (!rows.length) return '';
  const items = rows.map((r) => {
    const p = r.pct === 999 ? 100 : Math.min(100, r.pct);
    return '<div class="cap-bar-row"><div class="cap-bar-top"><span class="sw" style="background:' + col(r.cat) + '"></span>' +
      '<span class="name">' + esc(r.cat.name) + '</span><span class="cap-bar-amt">' + fmt(r.spent) + ' / ' + fmt(r.cap) + '</span></div>' +
      '<div class="track"><div class="bar ' + r.status + '" style="width:' + p.toFixed(1) + '%"></div></div></div>';
  }).join('');
  return '<section class="card" aria-label="Topes por categoría"><div class="card-head"><div><h2>Avance de topes</h2><div class="sub">Cuánto llevas gastado frente a cada tope</div></div></div>' + items + '</section>';
}

// Uso de cada tarjeta: deuda frente a la línea de crédito. Menos de 30% es lo recomendable.
function renderCardUsage() {
  const cards = db.accounts.filter((a) => a.kind === 'tarjeta');
  if (!cards.length) return '';
  const items = cards.map((c) => {
    const hasLimit = c.limit > 0;
    const pct = hasLimit ? (c.debt / c.limit) * 100 : 0;
    const status = !hasLimit ? 'none' : pct > 60 ? 'crit' : pct >= 30 ? 'warn' : 'good';
    return '<div class="cap-bar-row"><div class="cap-bar-top"><span class="name">' + esc(c.name) + '</span>' +
      '<span class="cap-bar-amt">' + fmt(c.debt) + (hasLimit ? ' / ' + fmt(c.limit) : '') + '</span></div>' +
      (hasLimit
        ? '<div class="track"><div class="bar ' + status + '" style="width:' + Math.min(100, pct).toFixed(1) + '%"></div></div>' +
          '<div class="sub" style="margin:0">' + pct.toFixed(0) + '% usado · ' + fmt(Math.max(0, c.limit - c.debt)) + ' disponible</div>'
        : '<div class="sub" style="margin:0">Agrega la línea de crédito en la tarjeta para ver el uso</div>') + '</div>';
  }).join('');
  return '<section class="card" aria-label="Uso de tarjetas"><div class="card-head"><div><h2>Uso de tarjetas</h2>' +
    '<div class="sub">Lo que debes frente a tu línea de crédito. Menos de 30% es lo recomendable.</div></div></div>' + items + '</section>';
}

// Gastos hormiga: compras pequeñas y frecuentes que suman mucho al final del mes.
const SMALL_TX = 20;
function renderSmallSpend(key, st) {
  const small = db.txs.filter((t) => t.type === 'gasto' && t.date.slice(0, 7) === key && t.amount < SMALL_TX);
  const total = small.reduce((a, t) => a + t.amount, 0);
  const share = st.exp ? (total / st.exp) * 100 : 0;
  const byCat = {};
  for (const t of small) { const id = cats().some((c) => c.id === t.cat) ? t.cat : 'otr'; byCat[id] = (byCat[id] || 0) + t.amount; }
  const top = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a]).slice(0, 3);
  const rows = top.map((id) => {
    const c = catById(id);
    return '<div class="cap-bar-row"><div class="cap-bar-top"><span class="sw" style="background:' + col(c) + '"></span>' +
      '<span class="name">' + esc(c.name) + '</span><span class="cap-bar-amt">' + fmt(byCat[id]) + '</span></div>' +
      '<div class="track"><div class="bar goal" style="width:' + ((byCat[id] / total) * 100).toFixed(1) + '%"></div></div></div>';
  }).join('');
  return '<section class="card" aria-label="Gastos hormiga"><div class="card-head"><div><h2>Gastos hormiga</h2>' +
    '<div class="sub">Compras menores a ' + fmt(SMALL_TX) + ' · ' + small.length + (small.length === 1 ? ' compra' : ' compras') + '</div></div></div>' +
    (small.length
      ? '<div class="kpi-value">' + fmt(total) + '</div><div class="sub" style="margin:0 0 4px">' + share.toFixed(1) + '% de tus gastos del mes</div>' + rows
      : '<div class="dl good">Este mes no hay compras pequeñas registradas</div>') + '</section>';
}

// Cuentas (saldo a favor) y tarjetas de crédito (deuda). Los movimientos con cuenta asignada las actualizan solos.
const accountsTotal = () => db.accounts.reduce((a, x) => a + (x.kind === 'cuenta' ? x.balance : 0), 0);
const cardsDebt = () => db.accounts.reduce((a, x) => a + (x.kind === 'tarjeta' ? x.debt : 0), 0);
const accById = (id) => db.accounts.find((x) => x.id === id);

// dir = +1 aplica el movimiento a su cuenta; -1 lo revierte (al editar o eliminar).
function applyTx(tx, dir) {
  const a = tx.acc ? accById(tx.acc) : null;
  if (!a) return;
  const s = tx.type === 'gasto' ? 1 : -1;
  if (a.kind === 'tarjeta') a.debt = round2(a.debt + dir * s * tx.amount);
  else a.balance = round2(a.balance - dir * s * tx.amount);
  a.updated = todayISO();
}
const lastAccountUpdate = () => db.accounts.reduce((m, x) => (x.updated > m ? x.updated : m), '');
const shortDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

function renderAccounts() {
  const accs = db.accounts.filter((a) => a.kind === 'cuenta');
  const cards = db.accounts.filter((a) => a.kind === 'tarjeta');
  const debt = cardsDebt();
  let html = '<section class="card" aria-label="Cuentas y tarjetas"><div class="card-head"><div><h2>Cuentas y tarjetas</h2><div class="sub">' +
    (db.accounts.length
      ? (accs.length ? 'Disponible: <b>' + fmt2(accountsTotal()) + '</b>' : 'Sin cuentas') + (cards.length ? ' · Deuda en tarjetas: <b>' + fmt2(debt) + '</b>' : '')
      : 'Aún no registras cuentas ni tarjetas') +
    '</div></div><button class="pill-btn" type="button" data-action="new-account">+ Agregar</button></div>';
  if (!db.accounts.length) html += '<p class="sub" style="margin:0">Agrega tus cuentas (ahorros, sueldo, Yape, efectivo…) y tarjetas de crédito. Al registrar un gasto eliges con qué pagaste y el saldo o la deuda se actualiza solo.</p>';
  if (accs.length && cards.length) html += '<div class="group-label">Cuentas</div>';
  for (const a of accs) {
    html += '<button type="button" class="tx" data-action="edit-account" data-id="' + esc(a.id) + '">' +
      '<span class="body"><span class="t1">' + esc(a.name) + '</span><span class="t2">Actualizado el ' + esc(shortDate(a.updated)) + '</span></span>' +
      '<span class="amt' + (a.balance < 0 ? '' : ' in') + '">' + fmt2(a.balance) + '</span></button>';
  }
  if (cards.length) html += '<div class="group-label">Tarjetas de crédito</div>';
  for (const c of cards) {
    const used = c.limit ? Math.min(100, (c.debt / c.limit) * 100) : 0;
    const st = !c.limit ? 'none' : used >= 90 ? 'crit' : used >= 70 ? 'warn' : 'good';
    const cy = cardCycle(c);
    html += '<button type="button" class="tx card-tx" data-action="edit-account" data-id="' + esc(c.id) + '">' +
      '<span class="body"><span class="t1">' + esc(c.name) + '</span>' +
      (cy ? '<span class="t2' + (cy.billed > 0 && cy.days <= 5 ? ' due' : '') + '">' + (cy.billed > 0 ? 'Pagar ' + fmt2(cy.billed) + ' hasta el ' + dayMonth(cy.pay) : 'Nada por pagar este ciclo') + '</span>' : '') +
      '<span class="t2">' +
      (c.limit ? 'Disponible ' + fmt(Math.max(0, c.limit - c.debt)) + ' de ' + fmt(c.limit) : 'Actualizado el ' + esc(shortDate(c.updated))) + '</span>' +
      (c.limit ? '<span class="track" style="margin-top:6px"><span class="bar ' + st + '" style="display:block;width:' + used.toFixed(1) + '%"></span></span>' : '') +
      '</span><span class="amt debt">' + (c.debt > 0 ? '− ' : '') + fmt2(Math.abs(c.debt)) + '</span></button>';
  }
  return html + '</section>';
}

// Préstamos realizados: dinero prestado a otros, pendiente o ya cobrado (no altera el saldo).
function renderLoans() {
  const byDate = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  const pending = db.loans.filter((l) => !l.paid).sort(byDate);
  const paid = db.loans.filter((l) => l.paid).sort(byDate);
  const total = pending.reduce((a, l) => a + l.amount, 0);
  let html = '<section class="card" aria-label="Préstamos realizados"><div class="card-head"><div><h2>Préstamos realizados</h2><div class="sub">' +
    (pending.length ? 'Por cobrar: <b>' + fmt2(total) + '</b> · ' + pending.length + (pending.length === 1 ? ' préstamo' : ' préstamos') : 'No tienes préstamos por cobrar') +
    '</div></div><button class="pill-btn" type="button" data-action="new-loan">+ Agregar</button></div>';
  if (!db.loans.length) html += '<p class="sub" style="margin:0">Anota aquí el dinero que prestas para no olvidarlo.</p>';
  for (const l of pending.concat(paid)) {
    html += '<button type="button" class="tx' + (l.paid ? ' paid' : '') + '" data-action="edit-loan" data-id="' + esc(l.id) + '">' +
      '<span class="body"><span class="t1">' + esc(l.desc) + '</span><span class="t2">' + esc(shortDate(l.date)) + (l.paid ? ' · Cobrado' : ' · Pendiente') + '</span></span>' +
      '<span class="amt">' + fmt2(l.amount) + '</span></button>';
  }
  return html + '</section>';
}

// ---------- Total general, tarjetas, fijos y metas ----------
const loansPending = () => db.loans.reduce((a, l) => a + (l.paid ? 0 : l.amount), 0);
const dayInMonth = (key, d) => key + '-' + pad(Math.min(d, daysIn(key)));
const daysUntil = (iso) => Math.round((new Date(iso + 'T12:00:00') - new Date(todayISO() + 'T12:00:00')) / 864e5);
const dayMonth = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
const whenTxt = (n) => (n <= 0 ? 'hoy' : n === 1 ? 'mañana' : 'en ' + n + ' días');

// Lo que tienes menos lo que debes: cuentas (o saldo calculado) + préstamos por cobrar − deuda de tarjetas.
function netWorth() {
  const hasAcc = db.accounts.some((a) => a.kind === 'cuenta');
  const cash = hasAcc ? accountsTotal() : balanceUpTo(currentMonth());
  const owed = loansPending(), debt = cardsDebt();
  return { hasAcc, cash, owed, debt, total: cash + owed - debt };
}

// Próximo pago de una tarjeta y cuánto corresponde a ese estado de cuenta.
// Los consumos posteriores al cierre pasan al siguiente estado de cuenta.
function cardCycle(c) {
  if (!c.closeDay || !c.payDay) return null;
  const today = todayISO(), cm = currentMonth();
  let pay = dayInMonth(cm, c.payDay);
  if (pay < today) pay = dayInMonth(addMonths(cm, 1), c.payDay);
  const pm = pay.slice(0, 7);
  let close = dayInMonth(pm, c.closeDay);
  if (close >= pay) close = dayInMonth(addMonths(pm, -1), c.closeDay);
  const after = db.txs.reduce((a, t) => (t.acc === c.id && t.date > close ? a + (t.type === 'gasto' ? t.amount : -t.amount) : a), 0);
  return { pay, close, billed: Math.max(0, round2(c.debt - after)), next: round2(Math.max(0, after)), days: daysUntil(pay) };
}

// Estado de un gasto fijo en un mes: registrado, pendiente (ya llegó su día) o programado.
function fixedStatus(f, key) {
  const date = dayInMonth(key, f.day);
  const done = db.txs.some((t) => t.fixedId === f.id && t.date.slice(0, 7) === key);
  return { date, done, due: !done && date <= todayISO() };
}
function registerFixed(f, key) {
  const st = fixedStatus(f, key);
  if (st.done) return null;
  const tx = { id: uid(), type: f.type, amount: f.amount, cat: f.type === 'gasto' ? f.cat : 'otr', date: st.date, note: f.name, acc: accById(f.acc) ? f.acc : '', fixedId: f.id };
  db.txs.push(tx);
  applyTx(tx, 1);
  return tx;
}

function renderAlerts() {
  const items = [];
  for (const c of db.accounts.filter((a) => a.kind === 'tarjeta')) {
    const cy = cardCycle(c);
    if (cy && cy.billed > 0 && cy.days <= 5) {
      items.push('<div class="alert ' + (cy.days <= 1 ? 'crit' : 'warn') + '">' + ICON.warn +
        '<span>Paga <b>' + fmt2(cy.billed) + '</b> de tu ' + esc(c.name) + ' ' + whenTxt(cy.days) + ' (' + dayMonth(cy.pay) + ').</span>' +
        '<button class="link-btn" type="button" data-action="edit-account" data-id="' + esc(c.id) + '">Pagar</button></div>');
    }
  }
  const pend = db.fixed.filter((f) => fixedStatus(f, currentMonth()).due);
  if (pend.length) {
    const tot = pend.reduce((a, f) => a + (f.type === 'gasto' ? f.amount : 0), 0);
    items.push('<div class="alert warn">' + ICON.repeat + '<span>' + pend.length + (pend.length === 1 ? ' fijo pendiente' : ' fijos pendientes') +
      ' de registrar este mes' + (tot ? ' (' + fmt(tot) + ')' : '') + '.</span><button class="link-btn" type="button" data-action="go-fixed">Ver</button></div>');
  }
  return items.join('');
}

function renderHero() {
  if (!db.accounts.length && !db.loans.length) return '';
  const nw = netWorth();
  return '<section class="card hero" aria-label="Total general"><div class="kpi-label">Total general</div>' +
    '<div class="hero-value' + (nw.total < 0 ? ' neg' : '') + '">' + (nw.total < 0 ? '− ' : '') + fmt2(Math.abs(nw.total)) + '</div>' +
    '<div class="hero-rows">' +
    '<span><span>' + (nw.hasAcc ? 'Cuentas' : 'Saldo según movimientos') + '</span><b>+ ' + fmt2(nw.cash) + '</b></span>' +
    (nw.owed ? '<span><span>Préstamos por cobrar</span><b>+ ' + fmt2(nw.owed) + '</b></span>' : '') +
    (nw.debt ? '<span><span>Deuda en tarjetas</span><b class="neg">− ' + fmt2(nw.debt) + '</b></span>' : '') +
    '</div></section>';
}

function renderGoals() {
  let html = '<section class="card" aria-label="Metas de ahorro"><div class="card-head"><div><h2>Metas de ahorro</h2><div class="sub">' +
    (db.goals.length ? 'Ahorrado: <b>' + fmt2(db.goals.reduce((a, g) => a + g.saved, 0)) + '</b> de ' + fmt2(db.goals.reduce((a, g) => a + g.target, 0)) : 'Define para qué estás ahorrando') +
    '</div></div><button class="pill-btn" type="button" data-action="new-goal">+ Agregar</button></div>';
  if (!db.goals.length) html += '<p class="sub" style="margin:0">Por ejemplo: viaje, fondo de emergencia o una compra grande. Ve sumando lo que apartas y mira cuánto te falta.</p>';
  for (const g of db.goals) {
    const pct = Math.min(100, (g.saved / g.target) * 100);
    const left = Math.max(0, g.target - g.saved);
    let sub = left ? 'Faltan ' + fmt(left) : '¡Meta cumplida!';
    if (left && g.deadline) {
      const months = Math.max(1, (parseKey(g.deadline)[0] - parseKey(currentMonth())[0]) * 12 + parseKey(g.deadline)[1] - parseKey(currentMonth())[1] + 1);
      sub += ' · ' + fmt(left / months) + ' por mes hasta ' + monthShort(g.deadline).toLowerCase() + ' ' + parseKey(g.deadline)[0];
    }
    html += '<button type="button" class="tx goal" data-action="edit-goal" data-id="' + esc(g.id) + '"><span class="body">' +
      '<span class="goal-top"><span class="t1">' + esc(g.name) + '</span><span class="pct">' + Math.round(pct) + '%</span></span>' +
      '<span class="track"><span class="bar ' + (pct >= 100 ? 'good' : 'goal') + '" style="display:block;width:' + pct.toFixed(1) + '%"></span></span>' +
      '<span class="t2">' + fmt(g.saved) + ' de ' + fmt(g.target) + ' · ' + sub + '</span></span></button>';
  }
  return html + '</section>';
}

function renderMovimientos() {
  const key = ui.month;
  const st = monthStats(key);
  let html = monthBar() + '<div class="stack"><div class="card"><div class="summary-row">' +
    '<div>Ingresos<b>' + fmt(st.inc) + '</b></div><div>Gastos<b>' + fmt(st.exp) + '</b></div><div>Balance<b>' + fmt(st.inc - st.exp) + '</b></div></div></div>';
  html += renderFixed(key);
  const catOpts = '<option value="">Categorías</option><option value="ingreso"' + (ui.fCat === 'ingreso' ? ' selected' : '') + '>Solo ingresos</option>' +
    cats().map((c) => '<option value="' + c.id + '"' + (ui.fCat === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('');
  const accOpts = '<option value="">Cuentas</option><option value="-"' + (ui.fAcc === '-' ? ' selected' : '') + '>Sin cuenta</option>' +
    db.accounts.map((a) => '<option value="' + esc(a.id) + '"' + (ui.fAcc === a.id ? ' selected' : '') + '>' + esc(a.name) + '</option>').join('');
  html += '<div class="card filters"><label class="sr-only" for="q">Buscar</label>' +
    '<input class="input" id="q" type="search" placeholder="Buscar por nota, categoría o cuenta" value="' + esc(ui.q) + '" autocomplete="off">' +
    '<div class="row2"><select class="select" id="f-cat-filter" aria-label="Filtrar por categoría">' + catOpts + '</select>' +
    '<select class="select" id="f-acc-filter" aria-label="Filtrar por cuenta">' + accOpts + '</select></div>' +
    '<div class="filters-foot"><label class="check"><input type="checkbox" id="f-all"' + (ui.allMonths ? ' checked' : '') + '>Todos los meses</label>' +
    '<button class="pill-btn" type="button" data-action="export-csv">Exportar a Excel</button></div></div>';
  return html + '<div id="tx-list">' + renderTxList() + '</div></div>';
}

function filteredTxs() {
  const q = ui.q.trim().toLowerCase();
  return db.txs.filter((t) => {
    if (!ui.allMonths && t.date.slice(0, 7) !== ui.month) return false;
    if (ui.fCat === 'ingreso' ? t.type !== 'ingreso' : ui.fCat && (t.type !== 'gasto' || t.cat !== ui.fCat)) return false;
    if (ui.fAcc === '-' ? accById(t.acc) : ui.fAcc && t.acc !== ui.fAcc) return false;
    if (q) {
      const acc = accById(t.acc);
      const hay = (t.note + ' ' + (t.type === 'ingreso' ? 'ingreso' : catById(t.cat).name) + ' ' + (acc ? acc.name : '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function renderTxList() {
  const list = filteredTxs();
  const filtering = ui.q.trim() || ui.fCat || ui.fAcc || ui.allMonths;
  if (!list.length) {
    return '<div class="card empty"><p>' + (filtering ? 'No hay movimientos con esos filtros.' : 'No hay movimientos en ' + monthName(ui.month).toLowerCase() + '.') + '</p>' +
      (filtering ? '' : '<button class="btn primary" type="button" data-action="add">Registrar movimiento</button>') + '</div>';
  }
  let html = '';
  if (filtering) {
    const inc = list.reduce((a, t) => a + (t.type === 'ingreso' ? t.amount : 0), 0), exp = list.reduce((a, t) => a + (t.type === 'gasto' ? t.amount : 0), 0);
    html += '<div class="result-sum">' + list.length + (list.length === 1 ? ' resultado' : ' resultados') + (exp ? ' · Gastos ' + fmt2(exp) : '') + (inc ? ' · Ingresos ' + fmt2(inc) : '') + '</div>';
  }
  let lastDate = '';
  for (const t of list) {
    if (t.date !== lastDate) {
      lastDate = t.date;
      const opts = { weekday: 'long', day: 'numeric', month: 'long' };
      if (ui.allMonths) opts.year = 'numeric';
      const label = new Date(t.date + 'T12:00:00').toLocaleDateString('es-PE', opts);
      html += '<div class="tx-day">' + esc(label.charAt(0).toUpperCase() + label.slice(1)) + '</div>';
    }
    const c = catById(t.cat);
    const isIn = t.type === 'ingreso';
    html += '<button type="button" class="tx" data-action="edit" data-id="' + esc(t.id) + '">' +
      '<span class="badge">' + (isIn ? '<span style="color:var(--good-text);font-size:20px;font-weight:650">+</span>' : '<span class="sw" style="width:14px;height:14px;border-radius:5px;background:' + col(c) + '"></span>') + '</span>' +
      '<span class="body"><span class="t1">' + (isIn ? 'Ingreso' : esc(c.name)) + '</span><span class="t2">' + (esc([t.note, t.acc && accById(t.acc) ? accById(t.acc).name : ''].filter(Boolean).join(' · ')) || 'Sin nota') + '</span></span>' +
      '<span class="amt' + (isIn ? ' in' : '') + '">' + (isIn ? '+ ' : '− ') + fmt2(t.amount) + '</span></button>';
  }
  return html;
}

function renderFixed(key) {
  const sorted = db.fixed.slice().sort((a, b) => a.day - b.day);
  const pend = sorted.filter((f) => fixedStatus(f, key).due);
  let html = '<section class="card" id="fixed-card" aria-label="Fijos mensuales"><div class="card-head"><div><h2>Fijos mensuales</h2><div class="sub">' +
    (sorted.length ? (pend.length ? pend.length + ' por registrar en ' + monthName(key).toLowerCase() : 'Al día en ' + monthName(key).toLowerCase()) : 'Alquiler, servicios, suscripciones, sueldo…') +
    '</div></div><button class="pill-btn" type="button" data-action="new-fixed">+ Agregar</button></div>';
  if (!sorted.length) html += '<p class="sub" style="margin:0">Agrega lo que se repite cada mes. Cuando llegue su día te avisaré y lo registras con un toque.</p>';
  for (const f of sorted) {
    const s = fixedStatus(f, key);
    const acc = accById(f.acc);
    const status = s.done ? '<span class="chip good">' + ICON.good + 'Registrado</span>'
      : s.due ? '<button class="pill-btn small" type="button" data-action="reg-fixed" data-id="' + esc(f.id) + '">Registrar</button>'
        : '<span class="chip none">Día ' + f.day + '</span>';
    html += '<div class="fixed-row"><button type="button" class="fixed-main" data-action="edit-fixed" data-id="' + esc(f.id) + '">' +
      '<span class="t1">' + esc(f.name) + '</span><span class="t2">' + (f.type === 'ingreso' ? 'Ingreso' : esc(catById(f.cat).name)) + ' · día ' + f.day + (acc ? ' · ' + esc(acc.name) : '') + '</span></button>' +
      '<span class="amt' + (f.type === 'ingreso' ? ' in' : '') + '">' + fmt2(f.amount) + '</span>' + status + '</div>';
  }
  if (pend.length > 1) html += '<button class="btn block" type="button" data-action="reg-all-fixed" style="margin-top:10px">Registrar los ' + pend.length + ' pendientes</button>';
  return html + '</section>';
}

function renderTopes() {
  const key = ui.month;
  const rows = capRows(key);
  const withCap = rows.filter((r) => r.cap != null);
  const capTotal = withCap.reduce((a, r) => a + r.cap, 0);
  const spentTotal = rows.reduce((a, r) => a + r.spent, 0);
  let html = monthBar() + '<div class="stack"><div class="card"><div class="card-head" style="margin-bottom:6px"><div><h2>Topes de gasto</h2>' +
    '<div class="sub">Con «Repetir cada mes» el tope se aplica desde ' + monthName(key).toLowerCase() + ' en adelante y se renueva el día 1. Desmárcalo para que ese monto valga solo en ' + monthName(key).toLowerCase() + '.</div></div>' +
    '<span class="chip none">' + ICON.repeat + 'Reinicio: 1 ' + monthShort(addMonths(key, 1)).toLowerCase() + '</span></div>' +
    '<div class="summary-row" style="margin-top:12px"><div>Suma de topes<b>' + (withCap.length ? fmt(capTotal) : '—') + '</b></div><div>Gastado<b>' + fmt(spentTotal) + '</b></div><div>Disponible<b>' + (withCap.length ? fmt(capTotal - withCap.reduce((a, r) => a + r.spent, 0)) : '—') + '</b></div></div></div>';
  html += '<div class="card">';
  for (const r of rows) {
    let detail = fmt(r.spent) + ' gastado';
    if (r.cap != null) {
      detail += ' de ' + fmt(r.cap) + ' · ' + Math.round(Math.min(r.pct, 999)) + '%';
      detail += r.spent > r.cap ? ' · ' + fmt(r.spent - r.cap) + ' por encima' : ' · quedan ' + fmt(r.cap - r.spent);
    }
    const hint = r.cap == null ? 'Escribe un monto para activar' : r.recurring ? 'Se aplica todos los meses' : 'Solo ' + monthName(key).toLowerCase();
    html += '<div class="cap-row"><div class="cap-top"><span class="sw" style="background:' + col(r.cat) + '"></span><span class="name">' + esc(r.cat.name) + '</span>' + chip(r.status) +
      (r.cat.id.startsWith('c_') ? '<button class="link-btn" type="button" data-action="edit-cat" data-cat="' + r.cat.id + '">Editar</button>' : '') + '</div>' +
      '<div class="cap-detail">' + detail + '</div>' +
      '<div class="track"><div class="bar ' + r.status + '" style="width:' + (r.cap == null ? 0 : Math.min(100, r.pct).toFixed(1)) + '%"></div></div>' +
      '<div class="cap-controls"><label class="field grow">Tope mensual<span class="money"><span class="cur">' + esc(db.currency) + '</span>' +
      '<input class="input" type="text" inputmode="decimal" placeholder="Sin tope" data-cap="' + r.cat.id + '" value="' + (r.cap == null ? '' : r.cap) + '" aria-label="Tope mensual de ' + esc(r.cat.name) + '"></span></label>' +
      '<div class="check-wrap"><label class="check"><input type="checkbox" data-rec="' + r.cat.id + '"' + (r.recurring ? ' checked' : '') + (r.cap == null ? ' disabled' : '') + '>Repetir cada mes</label>' +
      '<span class="hint">' + hint + '</span></div></div></div>';
  }
  return html + '</div><button class="btn block" type="button" data-action="new-cat">+ Nueva categoría</button></div>';
}

function renderAjustes() {
  const standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const curOpts = ['S/', 'US$', '$', '€'].map((c) => '<option value="' + c + '"' + (db.currency === c ? ' selected' : '') + '>' + c + '</option>').join('');
  return '<div class="monthbar"><h1>Ajustes</h1></div><div class="stack settings">' +
    '<div class="card"><h2>General</h2><div class="row2" style="margin-top:12px">' +
    '<label class="field">Moneda<select class="select" id="set-currency">' + curOpts + '</select></label>' +
    '<label class="field">Saldo inicial<span class="money"><span class="cur">' + esc(db.currency) + '</span><input class="input" id="set-start" type="text" inputmode="decimal" value="' + (db.startBalance || '') + '" placeholder="0"></span></label>' +
    '</div><p>El saldo inicial es el dinero que tenías antes del primer movimiento registrado. Si agregas cuentas bancarias en Inicio, la tarjeta de saldo muestra el total de tus cuentas.</p></div>' +
    '<div class="card"><h2>Respaldo</h2><p>Tus datos se guardan solo en este teléfono. Exporta un respaldo de vez en cuando (por ejemplo a iCloud Drive o WhatsApp) para no perderlos si cambias de equipo o borras los datos de Safari.</p>' +
    '<div class="btn-row" style="margin-top:12px"><button class="btn" type="button" data-action="export">Exportar respaldo</button><button class="btn" type="button" data-action="import">Importar respaldo</button></div>' +
    '<p>Para analizar tus movimientos en Excel o Numbers:</p><div class="btn-row" style="margin-top:8px"><button class="btn" type="button" data-action="export-csv-all">Exportar todo a Excel</button></div></div>' +
    (standalone ? '' : '<div class="card"><h2>Instalar en el iPhone</h2><ol><li>Abre esta página en <b>Safari</b>.</li><li>Toca el botón <b>Compartir</b> (cuadrado con flecha).</li><li>Elige <b>Agregar a inicio</b> y confirma.</li></ol><p>Se abrirá a pantalla completa como una app y funcionará sin internet.</p></div>') +
    '<div class="card"><h2>Datos</h2><p>Hay ' + db.txs.length + ' movimientos guardados.</p>' +
    '<div class="btn-row" style="margin-top:12px"><button class="btn" type="button" data-action="sample">Cargar datos de ejemplo</button><button class="btn danger" type="button" data-action="wipe">Borrar todo</button></div></div>' +
    '<p style="text-align:center;font-size:12px;color:var(--muted)">Mis finanzas · versión 1.1</p></div>';
}

function render() {
  const view = document.getElementById('view');
  charts.trend = null; charts.cum = null;
  const fn = { inicio: renderInicio, movimientos: renderMovimientos, topes: renderTopes, ajustes: renderAjustes }[ui.tab];
  view.innerHTML = fn();
  document.querySelectorAll('.tab').forEach((b) => { if (b.dataset.tab === ui.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  bindChart('trend');
  bindChart('cum');
}

// ---------- Interacción de gráficos (toque / mouse) ----------
function bindChart(id) {
  const wrap = document.querySelector('[data-chart="' + id + '"]');
  const m = charts[id];
  if (!wrap || !m) return;
  const svg = wrap.querySelector('svg'), tip = wrap.querySelector('.tip');
  const cross = svg.querySelector('.cross'), dots = Array.from(svg.querySelectorAll('.hdot'));
  const show = (clientX) => {
    const r = svg.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * m.W;
    let best = 0, bd = Infinity;
    m.xs.forEach((xx, i) => { const d = Math.abs(xx - x); if (d < bd) { bd = d; best = i; } });
    const info = m.info(best), cx = m.xs[best];
    cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.style.opacity = 1;
    info.ys.forEach((y, k) => { if (dots[k]) { dots[k].setAttribute('cx', cx); dots[k].setAttribute('cy', y); dots[k].style.opacity = 1; } });
    tip.innerHTML = info.html;
    tip.hidden = false;
    const px = (cx / m.W) * r.width, tw = tip.offsetWidth;
    tip.style.left = Math.max(0, Math.min(r.width - tw, px - tw / 2)) + 'px';
    tip.style.top = '-8px';
  };
  const hide = () => { tip.hidden = true; cross.style.opacity = 0; dots.forEach((d) => { d.style.opacity = 0; }); };
  svg.addEventListener('pointerdown', (e) => show(e.clientX));
  svg.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.pressure > 0) show(e.clientX); });
  svg.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
  wrap._hide = hide;
}
document.addEventListener('pointerdown', (e) => {
  document.querySelectorAll('[data-chart]').forEach((w) => { if (!w.contains(e.target) && w._hide) w._hide(); });
});

// ---------- Formulario de movimiento ----------
const sheet = document.getElementById('sheet');
const form = document.getElementById('tx-form');

function buildCatChoices(selected) {
  const fs = document.getElementById('f-cats');
  fs.innerHTML = '<legend>Categoría</legend>' + cats().map((c) =>
    '<label><input type="radio" name="cat" value="' + c.id + '"' + (c.id === selected ? ' checked' : '') + '><span><span class="sw" style="background:' + col(c) + '"></span>' + esc(c.name) + '</span></label>').join('');
}

function syncTypeUI() {
  const isIn = form.elements.type.value === 'ingreso';
  document.getElementById('f-cats').hidden = isIn;
  document.getElementById('f-acc-label').textContent = isIn ? 'Depositado en' : 'Pagado con';
}

function buildAccChoices(selected) {
  const sel = document.getElementById('f-acc');
  const opt = (a) => '<option value="' + esc(a.id) + '">' + esc(a.name) + '</option>';
  const accs = db.accounts.filter((a) => a.kind === 'cuenta'), cards = db.accounts.filter((a) => a.kind === 'tarjeta');
  sel.innerHTML = '<option value="">Ninguna (no actualiza saldos)</option>' +
    (accs.length ? '<optgroup label="Cuentas">' + accs.map(opt).join('') + '</optgroup>' : '') +
    (cards.length ? '<optgroup label="Tarjetas de crédito">' + cards.map(opt).join('') + '</optgroup>' : '');
  sel.value = selected && accById(selected) ? selected : '';
  sel.closest('.field').hidden = !db.accounts.length;
}

function openSheet(tx) {
  ui.editing = tx ? tx.id : null;
  document.getElementById('sheet-title').textContent = tx ? 'Editar movimiento' : 'Nuevo movimiento';
  document.getElementById('sheet-cur').textContent = db.currency;
  document.getElementById('f-delete').hidden = !tx;
  document.getElementById('f-error').textContent = '';
  form.elements.type.value = tx ? tx.type : 'gasto';
  buildCatChoices(tx ? tx.cat : 'ali');
  buildAccChoices(tx ? tx.acc : db.lastAcc);
  document.getElementById('f-amount').value = tx ? String(tx.amount) : '';
  let date = tx ? tx.date : todayISO();
  if (!tx && ui.month !== currentMonth()) date = ui.month + '-01';
  document.getElementById('f-date').value = date;
  document.getElementById('f-note').value = tx ? tx.note : '';
  syncTypeUI();
  sheet.showModal();
  if (!tx) setTimeout(() => document.getElementById('f-amount').focus(), 60);
}

form.addEventListener('change', (e) => { if (e.target.name === 'type') syncTypeUI(); });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseAmount(document.getElementById('f-amount').value);
  const date = document.getElementById('f-date').value;
  const err = document.getElementById('f-error');
  if (!(amount > 0)) { err.textContent = 'Escribe un monto mayor que cero.'; return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { err.textContent = 'Elige una fecha.'; return; }
  const type = form.elements.type.value === 'ingreso' ? 'ingreso' : 'gasto';
  const catEl = form.querySelector('input[name="cat"]:checked');
  const tx = {
    id: ui.editing || uid(), type,
    amount: Math.round(amount * 100) / 100,
    cat: type === 'gasto' && catEl ? catEl.value : 'otr',
    date, note: document.getElementById('f-note').value.trim().slice(0, 120),
    acc: document.getElementById('f-acc').value
  };
  const i = db.txs.findIndex((t) => t.id === tx.id);
  if (i >= 0) { applyTx(db.txs[i], -1); db.txs[i] = tx; } else db.txs.push(tx);
  applyTx(tx, 1);
  db.lastAcc = tx.acc;
  save();
  sheet.close();
  ui.month = date.slice(0, 7);
  render();
  capAlert(tx);
});

function capAlert(tx) {
  if (tx.type !== 'gasto') { toast('Ingreso registrado: ' + fmt2(tx.amount)); return; }
  const key = tx.date.slice(0, 7);
  const cap = capFor(tx.cat, key);
  const name = catById(tx.cat).name;
  if (cap == null) { toast('Gasto registrado en ' + name + '.'); return; }
  const spent = monthStats(key).byCat[tx.cat];
  const pct = cap > 0 ? (spent / cap) * 100 : 999;
  if (pct > 100) toast('Pasaste el tope de ' + name + ': ' + fmt(spent) + ' de ' + fmt(cap) + '.');
  else if (pct >= 90) toast('Atención: llevas ' + Math.round(pct) + '% del tope de ' + name + ' (' + fmt(spent) + ' de ' + fmt(cap) + ').');
  else toast('Gasto registrado. ' + name + ': ' + Math.round(pct) + '% del tope.');
}

// ---------- Categorías personalizadas ----------
const COLOR_NAMES = ['Azul', 'Naranja', 'Turquesa', 'Amarillo', 'Rosado', 'Verde', 'Violeta', 'Rojo', 'Marrón', 'Gris'];
const catSheet = document.getElementById('cat-sheet');
const catForm = document.getElementById('cat-form');

function openCatSheet(cat) {
  ui.editingCat = cat ? cat.id : null;
  document.getElementById('cat-title').textContent = cat ? 'Editar categoría' : 'Nueva categoría';
  document.getElementById('c-name').value = cat ? cat.name : '';
  document.getElementById('c-error').textContent = '';
  document.getElementById('c-delete').hidden = !cat;
  const used = new Set(cats().map((c) => c.light));
  let sel = cat ? COLOR_CHOICES.findIndex((o) => o.light === cat.light) : COLOR_CHOICES.findIndex((o) => !used.has(o.light));
  if (sel < 0) sel = 0;
  document.getElementById('c-colors').innerHTML = '<legend>Color</legend>' + COLOR_CHOICES.map((o, i) =>
    '<label><input type="radio" name="color" value="' + i + '" aria-label="' + COLOR_NAMES[i] + '"' + (i === sel ? ' checked' : '') + '><span style="background:' + col(o) + '"></span></label>').join('');
  catSheet.showModal();
  if (!cat) setTimeout(() => document.getElementById('c-name').focus(), 60);
}

catForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('c-name').value.trim().slice(0, 24);
  const err = document.getElementById('c-error');
  if (!name) { err.textContent = 'Escribe un nombre.'; return; }
  if (cats().some((c) => c.id !== ui.editingCat && c.name.toLowerCase() === name.toLowerCase())) { err.textContent = 'Ya existe una categoría con ese nombre.'; return; }
  const picked = catForm.querySelector('input[name="color"]:checked');
  const color = COLOR_CHOICES[picked ? Number(picked.value) : 0] || COLOR_CHOICES[0];
  const editing = ui.editingCat;
  if (editing) {
    const c = db.cats.find((x) => x.id === editing);
    if (c) { c.name = name; c.light = color.light; c.dark = color.dark; }
  } else {
    db.cats.push({ id: 'c_' + uid().replace(/[^a-z0-9]/g, '').slice(-10), name, light: color.light, dark: color.dark });
  }
  save();
  catSheet.close();
  render();
  toast(editing ? 'Categoría actualizada.' : 'Categoría «' + name + '» creada. Ya puedes ponerle un tope.');
});

function deleteCat(id) {
  const c = db.cats.find((x) => x.id === id);
  if (!c) return;
  const n = db.txs.filter((t) => t.cat === id).length;
  if (!confirm('¿Eliminar «' + c.name + '»?' + (n ? ' Sus ' + n + ' movimientos pasarán a Otros.' : '') + ' También se borrarán sus topes.')) return;
  db.txs.forEach((t) => { if (t.cat === id) t.cat = 'otr'; });
  delete db.recurring[id];
  Object.keys(db.once).forEach((k) => { if (k.endsWith('|' + id)) delete db.once[k]; });
  db.cats = db.cats.filter((x) => x.id !== id);
  save();
  catSheet.close();
  render();
  toast('Categoría eliminada.');
}

// ---------- Cuentas ----------
const accountSheet = document.getElementById('account-sheet');
const accountForm = document.getElementById('account-form');

const accKind = () => (accountForm.elements.akind.value === 'tarjeta' ? 'tarjeta' : 'cuenta');
function syncAccountKind() {
  const isCard = accKind() === 'tarjeta';
  document.getElementById('a-balance-row').hidden = isCard;
  document.getElementById('a-debt-row').hidden = !isCard;
  document.getElementById('a-limit-row').hidden = !isCard;
  document.getElementById('a-days-row').hidden = !isCard;
  document.getElementById('a-name').placeholder = isCard ? 'Ej. Visa BCP' : 'Ej. BCP Ahorros';
}
accountForm.addEventListener('change', (e) => { if (e.target.name === 'akind') syncAccountKind(); });

function openAccountSheet(acc) {
  ui.editingAccount = acc ? acc.id : null;
  const isCard = !!(acc && acc.kind === 'tarjeta');
  document.getElementById('account-title').textContent = acc ? (isCard ? 'Tarjeta de crédito' : 'Actualizar cuenta') : 'Nueva cuenta o tarjeta';
  document.querySelectorAll('#account-sheet .cur-dyn').forEach((s) => { s.textContent = db.currency; });
  accountForm.elements.akind.value = isCard ? 'tarjeta' : 'cuenta';
  document.getElementById('a-kind-row').hidden = !!acc;
  document.getElementById('a-name').value = acc ? acc.name : '';
  document.getElementById('a-balance').value = acc && !isCard ? String(acc.balance) : '';
  document.getElementById('a-debt').value = isCard ? String(acc.debt) : '';
  document.getElementById('a-limit').value = isCard && acc.limit ? String(acc.limit) : '';
  document.getElementById('a-close').value = isCard && acc.closeDay ? String(acc.closeDay) : '';
  document.getElementById('a-payday').value = isCard && acc.payDay ? String(acc.payDay) : '';
  const cy = isCard ? cardCycle(acc) : null;
  document.getElementById('p-amount').placeholder = cy && cy.billed > 0 ? String(cy.billed) : '0.00';
  const sources = db.accounts.filter((a) => a.kind === 'cuenta');
  document.getElementById('a-pay').hidden = !isCard || !sources.length;
  document.getElementById('p-amount').value = '';
  document.getElementById('p-from').innerHTML = sources.map((a) => '<option value="' + esc(a.id) + '">' + esc(a.name) + ' (' + esc(fmt2(a.balance)) + ')</option>').join('');
  document.getElementById('a-delete').hidden = !acc;
  document.getElementById('a-delete').textContent = isCard ? 'Eliminar tarjeta' : 'Eliminar cuenta';
  document.getElementById('a-error').textContent = '';
  syncAccountKind();
  accountSheet.showModal();
  if (!acc) setTimeout(() => document.getElementById('a-name').focus(), 60);
}

accountForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const kind = accKind();
  const name = document.getElementById('a-name').value.trim().slice(0, 40);
  const raw = document.getElementById(kind === 'tarjeta' ? 'a-debt' : 'a-balance').value.trim();
  const value = parseAmount(raw === '' && kind === 'tarjeta' ? '0' : raw);
  const limitRaw = document.getElementById('a-limit').value.trim();
  const limit = limitRaw === '' ? null : parseAmount(limitRaw);
  const err = document.getElementById('a-error');
  if (!name) { err.textContent = 'Escribe un nombre.'; return; }
  if (raw === '' && kind === 'cuenta') { err.textContent = 'Escribe el saldo actual (puede ser 0).'; return; }
  if (!isFinite(value)) { err.textContent = 'Escribe un monto válido.'; return; }
  if (limit !== null && !(limit > 0)) { err.textContent = 'La línea de crédito debe ser mayor que cero.'; return; }
  const closeRaw = document.getElementById('a-close').value.trim(), payRaw = document.getElementById('a-payday').value.trim();
  const closeDay = closeRaw ? dayNum(closeRaw) : null, payDay = payRaw ? dayNum(payRaw) : null;
  if (kind === 'tarjeta' && ((closeRaw && !closeDay) || (payRaw && !payDay))) { err.textContent = 'Los días deben estar entre 1 y 31.'; return; }
  const editing = ui.editingAccount;
  if (editing) {
    const a = accById(editing);
    if (a) {
      const before = a.kind === 'tarjeta' ? a.debt : a.balance;
      if (before !== round2(value)) a.updated = todayISO();
      a.name = name;
      if (a.kind === 'tarjeta') { a.debt = round2(value); a.limit = limit === null ? null : round2(limit); a.closeDay = closeDay; a.payDay = payDay; }
      else a.balance = round2(value);
    }
  } else {
    db.accounts.push({
      id: uid(), name, kind,
      balance: kind === 'cuenta' ? round2(value) : 0,
      debt: kind === 'tarjeta' ? round2(value) : 0,
      limit: kind === 'tarjeta' && limit !== null ? round2(limit) : null,
      closeDay: kind === 'tarjeta' ? closeDay : null,
      payDay: kind === 'tarjeta' ? payDay : null,
      updated: todayISO()
    });
  }
  save();
  accountSheet.close();
  render();
  toast(editing ? 'Datos actualizados.' : kind === 'tarjeta' ? 'Tarjeta agregada.' : 'Cuenta agregada.');
});

// Pagar la tarjeta es una transferencia: baja la deuda y el saldo de la cuenta, pero no cuenta como gasto.
function payCard() {
  const card = accById(ui.editingAccount);
  const from = accById(document.getElementById('p-from').value);
  const pInput = document.getElementById('p-amount');
  const amount = parseAmount(pInput.value.trim() || pInput.placeholder);
  const err = document.getElementById('a-error');
  if (!card || !from) return;
  if (!(amount > 0)) { err.textContent = 'Escribe el monto del pago.'; return; }
  card.debt = round2(card.debt - amount);
  from.balance = round2(from.balance - amount);
  card.updated = from.updated = todayISO();
  save();
  accountSheet.close();
  render();
  toast('Pago de ' + fmt2(amount) + ' registrado. Deuda de ' + card.name + ': ' + fmt2(Math.max(0, card.debt)) + '.');
}

function deleteAccount(id) {
  if (!confirm('¿Eliminar? Los movimientos ya registrados se mantienen, pero quedarán sin cuenta asignada.')) return;
  db.txs.forEach((t) => { if (t.acc === id) t.acc = ''; });
  if (db.lastAcc === id) db.lastAcc = '';
  db.accounts = db.accounts.filter((a) => a.id !== id);
  save();
  accountSheet.close();
  render();
  toast('Cuenta eliminada.');
}

// ---------- Fijos mensuales ----------
const fixedSheet = document.getElementById('fixed-sheet');
const fixedForm = document.getElementById('fixed-form');
const setDynCur = (root) => root.querySelectorAll('.cur-dyn').forEach((s) => { s.textContent = db.currency; });

function syncFixedType() {
  const isIn = fixedForm.elements.xtype.value === 'ingreso';
  document.getElementById('x-cat-row').hidden = isIn;
  document.getElementById('x-acc-label').textContent = isIn ? 'Depositado en' : 'Pagado con';
}
fixedForm.addEventListener('change', (e) => { if (e.target.name === 'xtype') syncFixedType(); });

function openFixedSheet(f) {
  ui.editingFixed = f ? f.id : null;
  setDynCur(fixedSheet);
  document.getElementById('fixed-title').textContent = f ? 'Editar fijo mensual' : 'Nuevo fijo mensual';
  fixedForm.elements.xtype.value = f ? f.type : 'gasto';
  document.getElementById('x-name').value = f ? f.name : '';
  document.getElementById('x-amount').value = f ? String(f.amount) : '';
  document.getElementById('x-day').value = f ? String(f.day) : '';
  document.getElementById('x-cat').innerHTML = cats().map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
  document.getElementById('x-cat').value = f ? f.cat : 'viv';
  document.getElementById('x-acc').innerHTML = '<option value="">Ninguna</option>' + db.accounts.map((a) => '<option value="' + esc(a.id) + '">' + esc(a.name) + '</option>').join('');
  document.getElementById('x-acc').value = f && accById(f.acc) ? f.acc : '';
  document.getElementById('x-acc-row').hidden = !db.accounts.length;
  document.getElementById('x-delete').hidden = !f;
  document.getElementById('x-error').textContent = '';
  syncFixedType();
  fixedSheet.showModal();
  if (!f) setTimeout(() => document.getElementById('x-name').focus(), 60);
}

fixedForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('x-name').value.trim().slice(0, 60);
  const amount = parseAmount(document.getElementById('x-amount').value);
  const day = dayNum(document.getElementById('x-day').value.trim());
  const err = document.getElementById('x-error');
  if (!name) { err.textContent = 'Escribe un nombre.'; return; }
  if (!(amount > 0)) { err.textContent = 'Escribe un monto mayor que cero.'; return; }
  if (!day) { err.textContent = 'El día debe estar entre 1 y 31.'; return; }
  const data = {
    name, amount: round2(amount), day,
    type: fixedForm.elements.xtype.value === 'ingreso' ? 'ingreso' : 'gasto',
    cat: document.getElementById('x-cat').value || 'otr',
    acc: document.getElementById('x-acc').value
  };
  const editing = ui.editingFixed;
  if (editing) Object.assign(db.fixed.find((x) => x.id === editing) || {}, data);
  else db.fixed.push(Object.assign({ id: uid() }, data));
  save();
  fixedSheet.close();
  render();
  toast(editing ? 'Fijo actualizado.' : 'Fijo agregado. Te avisaré el día ' + day + ' de cada mes.');
});

function deleteFixed(id) {
  if (!confirm('¿Eliminar este fijo? Los movimientos ya registrados se mantienen.')) return;
  db.fixed = db.fixed.filter((f) => f.id !== id);
  save();
  fixedSheet.close();
  render();
  toast('Fijo eliminado.');
}

// ---------- Metas de ahorro ----------
const goalSheet = document.getElementById('goal-sheet');
const goalForm = document.getElementById('goal-form');

function openGoalSheet(g) {
  ui.editingGoal = g ? g.id : null;
  setDynCur(goalSheet);
  document.getElementById('goal-title').textContent = g ? 'Meta de ahorro' : 'Nueva meta';
  document.getElementById('g-name').value = g ? g.name : '';
  document.getElementById('g-target').value = g ? String(g.target) : '';
  document.getElementById('g-saved').value = g ? String(g.saved) : '';
  document.getElementById('g-deadline').value = g ? g.deadline : '';
  document.getElementById('g-add').value = '';
  document.getElementById('g-add-box').hidden = !g;
  document.getElementById('g-delete').hidden = !g;
  document.getElementById('g-error').textContent = '';
  goalSheet.showModal();
  if (!g) setTimeout(() => document.getElementById('g-name').focus(), 60);
}

goalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('g-name').value.trim().slice(0, 60);
  const target = parseAmount(document.getElementById('g-target').value);
  const savedRaw = document.getElementById('g-saved').value.trim();
  const saved = savedRaw === '' ? 0 : parseAmount(savedRaw);
  const deadline = document.getElementById('g-deadline').value;
  const err = document.getElementById('g-error');
  if (!name) { err.textContent = 'Escribe un nombre.'; return; }
  if (!(target > 0)) { err.textContent = 'Escribe el monto de la meta.'; return; }
  if (!(saved >= 0)) { err.textContent = 'El monto ahorrado no es válido.'; return; }
  const data = { name, target: round2(target), saved: round2(saved), deadline: /^\d{4}-\d{2}$/.test(deadline) ? deadline : '' };
  const editing = ui.editingGoal;
  if (editing) Object.assign(db.goals.find((x) => x.id === editing) || {}, data);
  else db.goals.push(Object.assign({ id: uid() }, data));
  save();
  goalSheet.close();
  render();
  toast(editing ? 'Meta actualizada.' : 'Meta creada.');
});

function goalAdd() {
  const g = db.goals.find((x) => x.id === ui.editingGoal);
  const amt = parseAmount(document.getElementById('g-add').value);
  if (!g) return;
  if (!(amt > 0)) { document.getElementById('g-error').textContent = 'Escribe el monto del abono.'; return; }
  g.saved = round2(g.saved + amt);
  save();
  goalSheet.close();
  render();
  toast(g.saved >= g.target ? '¡Cumpliste la meta «' + g.name + '»!' : 'Abono sumado: ' + fmt2(amt) + '. Llevas ' + Math.round((g.saved / g.target) * 100) + '%.');
}

function deleteGoal(id) {
  if (!confirm('¿Eliminar esta meta?')) return;
  db.goals = db.goals.filter((g) => g.id !== id);
  save();
  goalSheet.close();
  render();
  toast('Meta eliminada.');
}

// ---------- Exportar a Excel (CSV) ----------
async function exportCsv(list, name) {
  const q = (s) => '"' + String(s).replace(/"/g, '""') + '"';
  const rows = [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Cuenta', 'Monto'].map(q).join(',')];
  for (const t of list.slice().sort((a, b) => (a.date < b.date ? -1 : 1))) {
    const acc = accById(t.acc);
    rows.push([t.date, t.type === 'ingreso' ? 'Ingreso' : 'Gasto', t.type === 'ingreso' ? '' : catById(t.cat).name, t.note, acc ? acc.name : ''].map(q).join(',') +
      ',' + (t.type === 'ingreso' ? t.amount : -t.amount).toFixed(2));
  }
  const file = new File(['﻿' + rows.join('\r\n')], name, { type: 'text/csv' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ---------- Préstamos ----------
const loanSheet = document.getElementById('loan-sheet');
const loanForm = document.getElementById('loan-form');

function openLoanSheet(loan) {
  ui.editingLoan = loan ? loan.id : null;
  document.getElementById('loan-title').textContent = loan ? 'Editar préstamo' : 'Nuevo préstamo';
  document.getElementById('loan-cur').textContent = db.currency;
  document.getElementById('l-amount').value = loan ? String(loan.amount) : '';
  document.getElementById('l-desc').value = loan ? loan.desc : '';
  document.getElementById('l-paid').checked = !!(loan && loan.paid);
  document.getElementById('l-paid-row').hidden = !loan;
  document.getElementById('l-delete').hidden = !loan;
  document.getElementById('l-error').textContent = '';
  loanSheet.showModal();
  if (!loan) setTimeout(() => document.getElementById('l-amount').focus(), 60);
}

loanForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseAmount(document.getElementById('l-amount').value);
  const desc = document.getElementById('l-desc').value.trim().slice(0, 80);
  const err = document.getElementById('l-error');
  if (!(amount > 0)) { err.textContent = 'Escribe un monto mayor que cero.'; return; }
  if (!desc) { err.textContent = 'Escribe una descripción, por ejemplo a quién le prestaste.'; return; }
  const editing = ui.editingLoan;
  if (editing) {
    const l = db.loans.find((x) => x.id === editing);
    if (l) { l.amount = Math.round(amount * 100) / 100; l.desc = desc; l.paid = document.getElementById('l-paid').checked; }
  } else {
    db.loans.push({ id: uid(), amount: Math.round(amount * 100) / 100, desc, date: todayISO(), paid: false });
  }
  save();
  loanSheet.close();
  render();
  toast(editing ? 'Préstamo actualizado.' : 'Préstamo registrado: ' + fmt2(amount) + '.');
});

function deleteLoan(id) {
  if (!confirm('¿Eliminar este préstamo?')) return;
  db.loans = db.loans.filter((l) => l.id !== id);
  save();
  loanSheet.close();
  render();
  toast('Préstamo eliminado.');
}

// ---------- Respaldo ----------
async function exportBackup() {
  const data = JSON.stringify(db, null, 2);
  const name = 'finanzas-respaldo-' + todayISO() + '.json';
  const file = new File([data], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Respaldo de Mis finanzas' }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

document.getElementById('import-file').addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const data = normalize(JSON.parse(await f.text()));
    if (!confirm('¿Reemplazar los datos actuales por el respaldo (' + data.txs.length + ' movimientos)?')) return;
    db = data; save(); render(); toast('Respaldo importado.');
  } catch (err) {
    toast('El archivo no es un respaldo válido.');
  }
});

// ---------- Datos de ejemplo ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function loadSample() {
  const r = rng(20261030);
  const now = currentMonth(), today = Number(todayISO().slice(8, 10));
  const first = addMonths(now, -5);
  const out = emptyDb();
  out.currency = db.currency;
  out.startBalance = 15000;
  const plan = {
    ali: { base: 1400, n: 10, notes: ['Supermercado', 'Mercado', 'Panadería', 'Delivery'] },
    tra: { base: 460, n: 9, notes: ['Taxi', 'Combustible', 'Bus', 'Estacionamiento'] },
    oci: { base: 500, n: 4, notes: ['Cine', 'Restaurante', 'Salida con amigos', 'Streaming'] },
    sal: { base: 200, n: 2, notes: ['Farmacia', 'Consulta médica'] },
    otr: { base: 180, n: 2, notes: ['Regalo', 'Compras varias'] }
  };
  for (let i = 0; i < 6; i++) {
    const key = addMonths(first, i);
    const lastDay = key === now ? today : daysIn(key);
    const add = (type, cat, amount, day, note) => {
      if (day > lastDay) return;
      out.txs.push({ id: uid(), type, cat, amount: Math.round(amount * 100) / 100, date: key + '-' + pad(day), note });
    };
    add('ingreso', 'otr', [8200, 8200, 8650, 8200, 8900, 8400][i], 1, 'Sueldo');
    if (r() > 0.55) add('ingreso', 'otr', 400 + Math.round(r() * 8) * 100, 12 + Math.floor(r() * 12), 'Trabajo independiente');
    add('gasto', 'viv', 2200, 1, 'Alquiler');
    [['Luz', 140], ['Agua', 60], ['Internet', 129], ['Celular', 89]].forEach(([n, v], k) => add('gasto', 'ser', v * (0.9 + r() * 0.25), 5 + k, n));
    for (const cat of Object.keys(plan)) {
      const p = plan[cat];
      const total = p.base * (0.75 + r() * 0.5);
      const w = Array.from({ length: p.n }, () => 0.3 + r());
      const sw = w.reduce((a, b) => a + b, 0);
      w.forEach((x) => add('gasto', cat, (x / sw) * total, 1 + Math.floor(r() * daysIn(key)), p.notes[Math.floor(r() * p.notes.length)]));
    }
  }
  out.recurring = {
    viv: [{ from: first, amount: 2500 }], ali: [{ from: first, amount: 1600 }], tra: [{ from: first, amount: 500 }],
    ser: [{ from: first, amount: 500 }], oci: [{ from: first, amount: 550 }], otr: [{ from: first, amount: 300 }]
  };
  db = out;
  save();
}

// ---------- Avisos ----------
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
}

// ---------- Eventos ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;
  if (a === 'tab') { ui.tab = el.dataset.tab; ui.hoverCat = null; render(); window.scrollTo(0, 0); }
  else if (a === 'prev') { ui.month = addMonths(ui.month, -1); ui.hoverCat = null; render(); }
  else if (a === 'next') { ui.month = addMonths(ui.month, 1); ui.hoverCat = null; render(); }
  else if (a === 'today') { ui.month = currentMonth(); render(); }
  else if (a === 'add') openSheet(null);
  else if (a === 'edit') { const t = db.txs.find((x) => x.id === el.dataset.id); if (t) openSheet(t); }
  else if (a === 'close-sheet') sheet.close();
  else if (a === 'delete-tx') {
    if (ui.editing && confirm('¿Eliminar este movimiento?')) {
      const old = db.txs.find((t) => t.id === ui.editing);
      if (old) applyTx(old, -1);
      db.txs = db.txs.filter((t) => t.id !== ui.editing);
      save(); sheet.close(); render(); toast('Movimiento eliminado.');
    }
  }
  else if (a === 'new-fixed') openFixedSheet(null);
  else if (a === 'edit-fixed') { const f = db.fixed.find((x) => x.id === el.dataset.id); if (f) openFixedSheet(f); }
  else if (a === 'close-fixed') fixedSheet.close();
  else if (a === 'delete-fixed') { if (ui.editingFixed) deleteFixed(ui.editingFixed); }
  else if (a === 'reg-fixed' || a === 'reg-all-fixed') {
    const list = a === 'reg-fixed' ? db.fixed.filter((f) => f.id === el.dataset.id) : db.fixed.filter((f) => fixedStatus(f, ui.month).due);
    const done = list.map((f) => registerFixed(f, ui.month)).filter(Boolean);
    save(); render();
    if (done.length === 1) capAlert(done[0]); else toast(done.length + ' fijos registrados.');
  }
  else if (a === 'go-fixed') { ui.tab = 'movimientos'; ui.month = currentMonth(); render(); const fc = document.getElementById('fixed-card'); if (fc) fc.scrollIntoView(); }
  else if (a === 'new-goal') openGoalSheet(null);
  else if (a === 'edit-goal') { const g = db.goals.find((x) => x.id === el.dataset.id); if (g) openGoalSheet(g); }
  else if (a === 'close-goal') goalSheet.close();
  else if (a === 'goal-add') goalAdd();
  else if (a === 'delete-goal') { if (ui.editingGoal) deleteGoal(ui.editingGoal); }
  else if (a === 'export-csv') exportCsv(filteredTxs(), 'movimientos-' + (ui.allMonths ? 'todos' : ui.month) + '.csv');
  else if (a === 'export-csv-all') exportCsv(db.txs, 'movimientos-todos-' + todayISO() + '.csv');
  else if (a === 'new-account') openAccountSheet(null);
  else if (a === 'edit-account') { const x = db.accounts.find((y) => y.id === el.dataset.id); if (x) openAccountSheet(x); }
  else if (a === 'close-account') accountSheet.close();
  else if (a === 'pay-card') payCard();
  else if (a === 'delete-account') { if (ui.editingAccount) deleteAccount(ui.editingAccount); }
  else if (a === 'new-loan') openLoanSheet(null);
  else if (a === 'edit-loan') { const l = db.loans.find((x) => x.id === el.dataset.id); if (l) openLoanSheet(l); }
  else if (a === 'close-loan') loanSheet.close();
  else if (a === 'delete-loan') { if (ui.editingLoan) deleteLoan(ui.editingLoan); }
  else if (a === 'new-cat') openCatSheet(null);
  else if (a === 'edit-cat') { const c = db.cats.find((x) => x.id === el.dataset.cat); if (c) openCatSheet(c); }
  else if (a === 'close-cat') catSheet.close();
  else if (a === 'delete-cat') { if (ui.editingCat) deleteCat(ui.editingCat); }
  else if (a === 'hl') { ui.hoverCat = ui.hoverCat === el.dataset.cat ? null : el.dataset.cat; render(); }
  else if (a === 'export') exportBackup();
  else if (a === 'import') document.getElementById('import-file').click();
  else if (a === 'sample') {
    if (db.txs.length && !confirm('Esto reemplaza tus datos actuales por datos de ejemplo. ¿Continuar?')) return;
    loadSample(); ui.month = currentMonth(); ui.tab = 'inicio'; render(); toast('Datos de ejemplo cargados.');
  }
  else if (a === 'wipe') {
    if (!confirm('¿Borrar todos los movimientos y topes de este teléfono? No se puede deshacer.')) return;
    const cur = db.currency; db = emptyDb(); db.currency = cur; save(); render(); toast('Datos borrados.');
  }
});

// Filtros de Movimientos: solo se redibuja la lista para no perder el foco del buscador.
const refreshTxList = () => { const el = document.getElementById('tx-list'); if (el) el.innerHTML = renderTxList(); };
document.addEventListener('input', (e) => { if (e.target.id === 'q') { ui.q = e.target.value; refreshTxList(); } });

document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'f-cat-filter') { ui.fCat = t.value; refreshTxList(); return; }
  if (t.id === 'f-acc-filter') { ui.fAcc = t.value; refreshTxList(); return; }
  if (t.id === 'f-all') { ui.allMonths = t.checked; refreshTxList(); return; }
  if (t.dataset.cap) {
    const raw = t.value.trim();
    const v = raw === '' ? null : parseAmount(raw);
    if (v !== null && !(v >= 0)) { toast('Escribe un monto válido.'); render(); return; }
    setCap(t.dataset.cap, ui.month, v === null ? null : Math.round(v * 100) / 100);
    save(); render();
  } else if (t.dataset.rec) {
    toggleRecurring(t.dataset.rec, ui.month, t.checked);
    save(); render();
  } else if (t.id === 'set-currency') {
    db.currency = t.value; save(); render();
  } else if (t.id === 'set-start') {
    const v = parseAmount(t.value || '0');
    db.startBalance = isFinite(v) ? v : 0; save(); render();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.cap) e.target.blur();
});

let resizeTimer = null;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (ui.tab === 'inicio') render(); }, 150); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

// ---------- Arranque ----------
render();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
