'use strict';

// ---------- Constantes ----------
const KEY = 'finanzas.v1';
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MSHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
// Orden fijo de colores validado para daltonismo (pares adyacentes).
const CATS = [
  { id: 'viv', name: 'Vivienda', light: '#2a78d6', dark: '#3987e5' },
  { id: 'ali', name: 'Alimentación', light: '#eb6834', dark: '#d95926' },
  { id: 'tra', name: 'Transporte', light: '#1baf7a', dark: '#199e70' },
  { id: 'ser', name: 'Servicios', light: '#eda100', dark: '#c98500' },
  { id: 'oci', name: 'Ocio', light: '#e87ba4', dark: '#d55181' },
  { id: 'sal', name: 'Salud', light: '#008300', dark: '#008300' },
  { id: 'otr', name: 'Otros', light: '#6250d6', dark: '#9085e9' }
];
const CAT_IDS = new Set(CATS.map((c) => c.id));
const SERIES = { inc: { light: '#2a78d6', dark: '#3987e5' }, exp: { light: '#eb6834', dark: '#d95926' } };
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
const catById = (id) => CATS.find((c) => c.id === id) || CATS[CATS.length - 1];
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
function emptyDb() { return { v: 1, currency: 'S/', startBalance: 0, txs: [], recurring: {}, once: {} }; }

function normalize(d) {
  const out = emptyDb();
  if (!d || typeof d !== 'object') return out;
  if (typeof d.currency === 'string' && d.currency.length <= 4) out.currency = d.currency;
  out.startBalance = Number(d.startBalance) || 0;
  if (Array.isArray(d.txs)) {
    out.txs = d.txs
      .filter((t) => t && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && isFinite(Number(t.amount)) && Number(t.amount) > 0)
      .map((t) => ({
        id: String(t.id || uid()),
        type: t.type === 'ingreso' ? 'ingreso' : 'gasto',
        amount: Math.round(Number(t.amount) * 100) / 100,
        cat: CAT_IDS.has(t.cat) ? t.cat : 'otr',
        date: t.date,
        note: String(t.note || '').slice(0, 120)
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
      if (/^\d{4}-\d{2}\|[a-z]{3}$/.test(k) && (v === null || (isFinite(v) && v >= 0))) out.once[k] = v === null ? null : Number(v);
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
const ui = { tab: 'inicio', month: currentMonth(), hoverCat: null, editing: null };
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
  CATS.forEach((c) => { byCat[c.id] = 0; });
  let inc = 0, exp = 0;
  for (const t of db.txs) {
    if (t.date.slice(0, 7) !== key) continue;
    if (t.type === 'ingreso') inc += t.amount;
    else { exp += t.amount; byCat[t.cat] += t.amount; }
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
  return CATS.map((c) => {
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
      '<button class="btn" type="button" data-action="sample">Cargar ejemplo</button></div></div>';
  }
  const prevKey = addMonths(key, -1);
  const st = monthStats(key), pv = monthStats(prevKey);
  const sav = st.inc - st.exp;
  const rows = capRows(key).filter((r) => r.cap != null);
  const exceeded = rows.filter((r) => r.status === 'crit').length;
  const isNow = key === currentMonth();

  let html = monthBar() + '<div class="stack"><div class="cards">';
  html += kpi(ICON.wallet, col(SERIES.inc), isNow ? 'Saldo disponible' : 'Saldo al cierre', fmt(balanceUpTo(key)),
    '<div class="dl ' + (sav >= 0 ? 'good' : 'bad') + '">' + (sav >= 0 ? '+ ' : '− ') + fmt(Math.abs(sav)) + ' este mes</div>');
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
  html += renderTrendChart(key) + renderDonut(key, st) + renderCumChart(key, rows);
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
  const active = CATS.filter((c) => st.byCat[c.id] > 0);
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
    ? '<small>' + hc.name + '</small><strong>' + fmt(st.byCat[hc.id]) + '</strong><em>' + (total ? ((st.byCat[hc.id] / total) * 100).toFixed(1) : '0') + '% del total</em>'
    : '<small>Total gastado</small><strong>' + fmt(total) + '</strong><em>' + monthName(key) + '</em>';
  const items = CATS.map((c) => {
    const v = st.byCat[c.id];
    const cls = 'cat-item' + (ui.hoverCat === c.id ? ' on' : ui.hoverCat ? ' dim' : '');
    return '<button type="button" class="' + cls + '" data-action="hl" data-cat="' + c.id + '" aria-pressed="' + (ui.hoverCat === c.id) + '">' +
      '<span class="sw" style="background:' + col(c) + '"></span><span class="name">' + c.name + '</span>' +
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
  const daily = new Array(days).fill(0);
  for (const t of db.txs) if (t.type === 'gasto' && t.date.slice(0, 7) === key) daily[Number(t.date.slice(8, 10)) - 1] += t.amount;
  const cum = [];
  let run = 0;
  for (let d = 0; d < elapsed; d++) { run += daily[d]; cum.push(run); }
  const capTotal = capRowsWith.reduce((a, r) => a + r.cap, 0);
  const hasCap = capRowsWith.length > 0;
  const W = chartWidth(), H = 190, L = 36, R = 10, T = 14, B = 26;
  const pw = W - L - R, ph = H - T - B, base = T + ph;
  const ymax = niceCeil(Math.max(run, hasCap ? capTotal : 0, 1) * 1.08);
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
    lastDot +
    '<line class="cross" x1="0" x2="0" y1="' + T + '" y2="' + base + '"></line>' +
    '<circle class="hdot" r="5" fill="' + c1 + '" stroke="var(--surface)" stroke-width="2"></circle>' +
    '</svg></div></section>';
}

function renderMovimientos() {
  const key = ui.month;
  const st = monthStats(key);
  const list = db.txs.filter((t) => t.date.slice(0, 7) === key).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  let html = monthBar() + '<div class="stack"><div class="card"><div class="summary-row">' +
    '<div>Ingresos<b>' + fmt(st.inc) + '</b></div><div>Gastos<b>' + fmt(st.exp) + '</b></div><div>Balance<b>' + fmt(st.inc - st.exp) + '</b></div></div></div>';
  if (!list.length) {
    html += '<div class="card empty"><p>No hay movimientos en ' + monthName(key).toLowerCase() + '.</p><button class="btn primary" type="button" data-action="add">Registrar movimiento</button></div>';
  } else {
    let lastDate = '';
    html += '<div>';
    for (const t of list) {
      if (t.date !== lastDate) {
        lastDate = t.date;
        const d = new Date(t.date + 'T12:00:00');
        const label = d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
        html += '<div class="tx-day">' + esc(label.charAt(0).toUpperCase() + label.slice(1)) + '</div>';
      }
      const c = catById(t.cat);
      const isIn = t.type === 'ingreso';
      html += '<button type="button" class="tx" data-action="edit" data-id="' + esc(t.id) + '">' +
        '<span class="badge">' + (isIn ? '<span style="color:var(--good-text);font-size:20px;font-weight:650">+</span>' : '<span class="sw" style="width:14px;height:14px;border-radius:5px;background:' + col(c) + '"></span>') + '</span>' +
        '<span class="body"><span class="t1">' + (isIn ? 'Ingreso' : c.name) + '</span><span class="t2">' + (t.note ? esc(t.note) : 'Sin nota') + '</span></span>' +
        '<span class="amt' + (isIn ? ' in' : '') + '">' + (isIn ? '+ ' : '− ') + fmt2(t.amount) + '</span></button>';
    }
    html += '</div>';
  }
  return html + '</div>';
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
    html += '<div class="cap-row"><div class="cap-top"><span class="sw" style="background:' + col(r.cat) + '"></span><span class="name">' + r.cat.name + '</span>' + chip(r.status) + '</div>' +
      '<div class="cap-detail">' + detail + '</div>' +
      '<div class="track"><div class="bar ' + r.status + '" style="width:' + (r.cap == null ? 0 : Math.min(100, r.pct).toFixed(1)) + '%"></div></div>' +
      '<div class="cap-controls"><label class="field grow">Tope mensual<span class="money"><span class="cur">' + esc(db.currency) + '</span>' +
      '<input class="input" type="text" inputmode="decimal" placeholder="Sin tope" data-cap="' + r.cat.id + '" value="' + (r.cap == null ? '' : r.cap) + '" aria-label="Tope mensual de ' + r.cat.name + '"></span></label>' +
      '<div class="check-wrap"><label class="check"><input type="checkbox" data-rec="' + r.cat.id + '"' + (r.recurring ? ' checked' : '') + (r.cap == null ? ' disabled' : '') + '>Repetir cada mes</label>' +
      '<span class="hint">' + hint + '</span></div></div></div>';
  }
  return html + '</div></div>';
}

function renderAjustes() {
  const standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const curOpts = ['S/', 'US$', '$', '€'].map((c) => '<option value="' + c + '"' + (db.currency === c ? ' selected' : '') + '>' + c + '</option>').join('');
  return '<div class="monthbar"><h1>Ajustes</h1></div><div class="stack settings">' +
    '<div class="card"><h2>General</h2><div class="row2" style="margin-top:12px">' +
    '<label class="field">Moneda<select class="select" id="set-currency">' + curOpts + '</select></label>' +
    '<label class="field">Saldo inicial<span class="money"><span class="cur">' + esc(db.currency) + '</span><input class="input" id="set-start" type="text" inputmode="decimal" value="' + (db.startBalance || '') + '" placeholder="0"></span></label>' +
    '</div><p>El saldo inicial es el dinero que tenías antes del primer movimiento registrado.</p></div>' +
    '<div class="card"><h2>Respaldo</h2><p>Tus datos se guardan solo en este teléfono. Exporta un respaldo de vez en cuando (por ejemplo a iCloud Drive o WhatsApp) para no perderlos si cambias de equipo o borras los datos de Safari.</p>' +
    '<div class="btn-row" style="margin-top:12px"><button class="btn" type="button" data-action="export">Exportar respaldo</button><button class="btn" type="button" data-action="import">Importar respaldo</button></div></div>' +
    (standalone ? '' : '<div class="card"><h2>Instalar en el iPhone</h2><ol><li>Abre esta página en <b>Safari</b>.</li><li>Toca el botón <b>Compartir</b> (cuadrado con flecha).</li><li>Elige <b>Agregar a inicio</b> y confirma.</li></ol><p>Se abrirá a pantalla completa como una app y funcionará sin internet.</p></div>') +
    '<div class="card"><h2>Datos</h2><p>Hay ' + db.txs.length + ' movimientos guardados.</p>' +
    '<div class="btn-row" style="margin-top:12px"><button class="btn" type="button" data-action="sample">Cargar datos de ejemplo</button><button class="btn danger" type="button" data-action="wipe">Borrar todo</button></div></div>' +
    '<p style="text-align:center;font-size:12px;color:var(--muted)">Mis finanzas · versión 1.0</p></div>';
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
  fs.innerHTML = '<legend>Categoría</legend>' + CATS.map((c) =>
    '<label><input type="radio" name="cat" value="' + c.id + '"' + (c.id === selected ? ' checked' : '') + '><span><span class="sw" style="background:' + col(c) + '"></span>' + c.name + '</span></label>').join('');
}

function syncTypeUI() {
  const isIn = form.elements.type.value === 'ingreso';
  document.getElementById('f-cats').hidden = isIn;
}

function openSheet(tx) {
  ui.editing = tx ? tx.id : null;
  document.getElementById('sheet-title').textContent = tx ? 'Editar movimiento' : 'Nuevo movimiento';
  document.getElementById('sheet-cur').textContent = db.currency;
  document.getElementById('f-delete').hidden = !tx;
  document.getElementById('f-error').textContent = '';
  form.elements.type.value = tx ? tx.type : 'gasto';
  buildCatChoices(tx ? tx.cat : 'ali');
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
    date, note: document.getElementById('f-note').value.trim().slice(0, 120)
  };
  const i = db.txs.findIndex((t) => t.id === tx.id);
  if (i >= 0) db.txs[i] = tx; else db.txs.push(tx);
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
      db.txs = db.txs.filter((t) => t.id !== ui.editing);
      save(); sheet.close(); render(); toast('Movimiento eliminado.');
    }
  }
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

document.addEventListener('change', (e) => {
  const t = e.target;
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
