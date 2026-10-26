import * as L from './logic.js';

const KEY = 'bam-v1';
const COORD_DEF = [-36.83, -73.05]; // Concepción, si no hay GPS
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const nombreEj = id => Object.values(L.GRUPOS).flatMap(G => G.ej).concat(L.ABS).find(e => e.id === id)?.n ?? id;

let db = cargar();
let tab = db.actual ? 'hoy' : 'inicio';
let musculo = null;
let form = { min: null, grupos: [] };
let clima = null;
let exSel = null;
let audio = null, wake = null;

function cargar() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && Array.isArray(d.sesiones)) {
    for (const s of d.sesiones) { // versiones previas: abdominales como 'abs' y fuera de los grupos
      s.series.forEach(x => x.g === 'abs' && (x.g = 'core'));
      if (s.abs && !s.grupos.includes('core')) s.grupos.push('core');
    }
    return { basicos: {}, ...d };
  } } catch {}
  return { sesiones: [], actual: null, basicos: {} };
}
const guardar = () => localStorage.setItem(KEY, JSON.stringify(db));

// ---------- clima (Open-Meteo, sin clave; se guarda una vez por día) ----------
async function obtenerClima() {
  const dia = new Date().toDateString();
  try { const c = JSON.parse(localStorage.getItem('bam-clima')); if (c?.dia === dia) return c; } catch {}
  const [la, lo] = await new Promise(r => navigator.geolocation
    ? navigator.geolocation.getCurrentPosition(p => r([p.coords.latitude, p.coords.longitude]), () => r(COORD_DEF), { timeout: 6000, maximumAge: 36e5 })
    : r(COORD_DEF));
  const j = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la.toFixed(2)}&longitude=${lo.toFixed(2)}&current=temperature_2m&daily=weather_code,precipitation_probability_max&timezone=auto&forecast_days=1`)).json();
  const prob = j.daily.precipitation_probability_max[0] ?? 0;
  const c = { dia, temp: Math.round(j.current.temperature_2m), prob, ...L.interpretarClima(j.daily.weather_code[0], prob) };
  localStorage.setItem('bam-clima', JSON.stringify(c));
  return c;
}

// ---------- vistas ----------
const minElegido = () => form.min ?? clima?.min ?? 60;
const kgTxt = (e, kg) => e.kg === null ? 'peso corporal' : e.kg === 0 ? `lastre ${kg} kg` : `${kg} kg`;

const COLOR = { piernas: '#e5484d', espalda: '#4c8dff', empuje: '#f0b429', brazos: '#3fb950', potencia: '#a371f7', core: '#ff8c42' };
const BASICOS = [['agua', '💧 Llevar la botella de agua'], ['snack', '🍎 Snack saludable'], ['elongar', '🧘 Elongar']];
const diaHoy = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD local
const nombreGrupo = g => `${L.GRUPOS[g].icono} ${L.GRUPOS[g].nombre}`;

function vistaInicio() {
  const b = db.basicos[diaHoy()] || {}, hechos = BASICOS.filter(([k]) => b[k]).length;
  const M = musculo && L.MUSCULOS[musculo];
  const info = !M ? '<div class="sub" style="text-align:center">Toca un músculo para ver su grupo y qué ejercicios lo trabajan.</div>' :
    `<h3 style="color:${COLOR[M[1]]}">${M[0]}</h3><div class="sub">Grupo: ${nombreGrupo(M[1])}</div>
     <ul class="lista">${L.ejerciciosDe(musculo).map(e => `<li><b style="color:var(--txt)">${e.n}</b> · ${L.GRUPOS[e.g].nombre}</li>`).join('')}</ul>
     ${M ? `<button class="btn sec" data-act="entrenarGrupo" data-v="${M[1]}">Entrenar ${L.GRUPOS[M[1]].nombre}</button>` : ''}`;
  return `<div class="sub" style="letter-spacing:.04em"><b style="color:var(--ac)">BaM</b> · Becoming a Machine</div>
  <h1>${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
  ${new Date().getDay() === 1 ? tarjetaLunes() : ''}
  <div class="card"><h2>Básicos de hoy <span class="sub">${hechos}/${BASICOS.length}${hechos === BASICOS.length ? ' · ✓ listo' : ''}</span></h2>
    ${BASICOS.map(([k, t]) => `<label class="switch" style="padding:8px 0"><span>${t}</span><input type="checkbox" data-act="basico" data-v="${k}" ${b[k] ? 'checked' : ''}></label>`).join('')}</div>
  <div class="card"><h2>Mapa muscular</h2>${silueta()}
    <div class="fila sub" style="justify-content:center;gap:12px;margin:6px 0 10px">${Object.entries(COLOR).filter(([g]) => g !== 'potencia').map(([g, c]) => `<span><b style="color:${c}">●</b> ${L.GRUPOS[g].nombre.split(' ')[0]}</span>`).join('')}</div>
    ${info}</div>
  <button class="btn" data-act="tab" data-tab="hoy">🥋 Ir a entrenar</button>`;
}

function tarjetaLunes() {
  const r = L.resumenAnterior(db.sesiones), dif = r.sesiones - r.antes;
  const stat = (v, t) => `<div><div style="font-size:24px;font-weight:700">${v}</div><div class="sub">${t}</div></div>`;
  return `<div class="card" style="border:2px solid var(--ac)"><h2>📅 Tu semana pasada</h2>
    <div class="fila" style="justify-content:space-around;text-align:center">${stat(`${r.sesiones}/${L.META}`, 'sesiones')}${stat(r.minutos, 'minutos')}${stat(r.series, 'series')}</div>
    <div class="sub" style="margin:8px 0">${dif > 0 ? `▲ ${dif} ${dif > 1 ? 'sesiones' : 'sesión'} más que la semana anterior` : dif < 0 ? `▼ ${-dif} menos que la semana anterior` : 'Igual que la semana anterior'}
      · Trabajaste: ${[...r.grupos].filter(g => L.GRUPOS[g]).map(g => L.GRUPOS[g].icono).join(' ') || '—'}</div>
    ${r.ganados.length ? `<div>${r.ganados.map(l => `<span title="${l.t}" style="font-size:22px">${l.i}</span>`).join(' ')} <span class="sub">${r.ganados.length} logro${r.ganados.length > 1 ? 's' : ''}</span></div>` : ''}
    <p style="margin:10px 0 0;font-weight:600">${r.msg}</p></div>`;
}

// Silueta anatómica: puntos del lado derecho (x ≥ 100) suavizados con Catmull-Rom y espejados.
// Frente en x 0–200, espalda desplazada +200.
const suave = pts => {
  const n = pts.length, f = p => p.map(v => +v.toFixed(1)).join(',');
  let d = `M${f(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]];
    d += `C${f([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${f([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${f(p2)}`;
  }
  return d + 'Z';
};
const espejo = pts => pts.map(([x, y]) => [200 - x, y]);
const mover = (pts, dx) => pts.map(([x, y]) => [x + dx, y]);
const CONTORNO_DER = [[108, 46], [109, 60], [124, 66], [140, 72], [152, 82], [156, 100], [157, 124], [160, 148], [165, 170], [165, 196], [163, 214],
  [166, 232], [161, 248], [154, 244], [153, 228], [153, 212], [150, 184], [147, 160], [146, 140], [143, 118], [138, 110], [134, 128], [130, 150],
  [128, 166], [134, 184], [138, 204], [138, 232], [132, 262], [128, 278], [132, 300], [128, 322], [121, 342], [126, 354], [118, 358], [108, 356],
  [108, 342], [106, 318], [106, 296], [105, 276], [104, 244], [102, 218], [100, 210]];
const CONTORNO = [...CONTORNO_DER, ...espejo(CONTORNO_DER.slice(0, -1).reverse())];
// [músculo, puntos, ¿central? (no se espeja)]
const FRENTE = [
  ['deltoides', [[138, 72], [150, 78], [156, 94], [152, 110], [144, 106], [140, 90]]],
  ['pectorales', [[101, 74], [120, 72], [138, 80], [142, 94], [134, 110], [116, 116], [101, 112]]],
  ['biceps', [[144, 110], [152, 114], [156, 130], [154, 146], [148, 148], [145, 132]]],
  ['antebrazos', [[148, 154], [158, 158], [163, 178], [162, 206], [155, 208], [151, 182]]],
  ['oblicuos', [[113, 118], [132, 114], [130, 140], [126, 164], [113, 172], [114, 144]]],
  ['abdominales', [[90, 118], [110, 118], [112, 142], [111, 170], [100, 182], [89, 170], [88, 142]], true],
  ['cuadriceps', [[106, 214], [118, 198], [132, 200], [136, 226], [132, 260], [118, 272], [109, 262], [107, 240]]],
  ['aductores', [[101, 212], [110, 206], [111, 228], [106, 250], [102, 236]]],
  ['gemelos', [[110, 288], [122, 284], [130, 300], [126, 326], [118, 336], [112, 320]]],
];
const ESPALDA = [
  ['trapecio', [[100, 56], [110, 60], [134, 72], [118, 84], [108, 110], [100, 124], [92, 110], [82, 84], [66, 72], [90, 60]], true],
  ['deltoides_post', [[138, 72], [150, 78], [156, 94], [152, 110], [144, 106], [140, 90]]],
  ['dorsales', [[104, 100], [120, 90], [136, 104], [134, 126], [126, 150], [108, 160], [102, 140]]],
  ['triceps', [[144, 108], [154, 112], [158, 130], [154, 148], [146, 146], [144, 128]]],
  ['antebrazos', [[148, 154], [158, 158], [163, 178], [162, 206], [155, 208], [151, 182]]],
  ['lumbares', [[90, 150], [110, 150], [114, 176], [100, 184], [86, 176]], true],
  ['gluteos', [[101, 188], [118, 182], [134, 192], [136, 212], [124, 224], [104, 220]]],
  ['isquios', [[104, 228], [124, 228], [134, 236], [131, 264], [118, 274], [108, 264]]],
  ['gemelos', [[108, 282], [124, 280], [132, 300], [126, 322], [116, 326], [110, 310]]],
];
function silueta() {
  const forma = dx => ([m, pts, central]) => {
    const sel = m === musculo, c = COLOR[L.MUSCULOS[m][1]];
    const attrs = `data-act="musculo" data-v="${m}" fill="${c}" fill-opacity="${sel ? .95 : .42}" stroke="${sel ? '#fff' : c}" stroke-opacity="${sel ? 1 : .7}" stroke-width="${sel ? 2 : 1}" style="cursor:pointer"`;
    return (central ? [pts] : [pts, espejo(pts)]).map(p => `<path d="${suave(mover(p, dx))}" ${attrs}><title>${L.MUSCULOS[m][0]}</title></path>`).join('');
  };
  const cuerpo = dx => `<ellipse cx="${100 + dx}" cy="28" rx="15" ry="20" fill="#26324d" stroke="#3a4a6e"/><path d="${suave(mover(CONTORNO, dx))}" fill="#26324d" stroke="#3a4a6e" stroke-width="1.5"/>`;
  const detalle = `<g stroke="#0f1420" stroke-opacity=".55" fill="none" pointer-events="none">
    <path d="M100,118 V178 M91,134 H109 M90,150 H110 M90,164 H110"/><path d="M300,60 V184"/></g>`;
  return `<svg viewBox="0 0 400 365" width="100%" style="max-width:440px;display:block;margin:auto" role="img" aria-label="Silueta muscular interactiva">
    ${cuerpo(0)}${cuerpo(200)}${FRENTE.map(forma(0)).join('')}${ESPALDA.map(forma(200)).join('')}${detalle}
    <text x="100" y="364" text-anchor="middle">Frente</text><text x="300" y="364" text-anchor="middle">Espalda</text></svg>`;
}

function vistaHoy() {
  const r = L.resumenSemana(db.sesiones), min = minElegido();
  const plan = form.grupos.length ? L.armarRutina(min, form.grupos) : null;
  const climaHtml = !clima ? '<span class="sub">Consultando el clima…</span>' : clima.error ? '<span class="sub">Sin datos de clima (sin conexión)</span>' :
    `<div class="fila"><span style="font-size:38px">${clima.i}</span><div><b>${clima.txt}, ${clima.temp} °C</b>
     <div class="sub">Lluvia ${clima.prob}% · ${clima.lluvia ? 'día de lluvia: probablemente haya menos tiempo, prioriza lo esencial' : 'buen día: puede que haya más tiempo para entrenar'}</div></div></div>`;
  return `<h1>${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
  <div class="card">${climaHtml}</div>
  <div class="card"><h2>Semana: ${r.sesiones}/${L.META} sesiones</h2><div class="barra"><i style="width:${Math.min(100, r.sesiones / L.META * 100)}%"></i></div>
    <div class="sub">${r.pendientes.length ? 'Falta: ' + r.pendientes.map(g => L.GRUPOS[g].icono + ' ' + L.GRUPOS[g].nombre).join(' · ') : '¡Todos los grupos trabajados esta semana!'}</div></div>
  <div class="card"><h2>¿Cuánto tiempo esperas entrenar?</h2>
    <div class="fila chips">${[30, 45, 60, 75, 90].map(m => `<button data-act="min" data-v="${m}" class="${m === min ? 'sel' : ''}">${m} min</button>`).join('')}</div>
    ${clima?.min ? `<div class="sub" style="margin-top:6px">Sugerido por el clima: ${clima.min} min</div>` : ''}</div>
  <div class="card"><h2>¿Qué grupo muscular?</h2><div class="grupos">
    ${Object.entries(L.GRUPOS).map(([g, G]) => `<button data-act="grupo" data-v="${g}" class="${form.grupos.includes(g) ? 'sel' : ''}">${G.icono} ${G.nombre}<span class="tag ${r.grupos.has(g) ? '' : 'pend'}">${r.grupos.has(g) ? '✓ hecho esta semana' : 'pendiente'}</span></button>`).join('')}</div></div>
  ${plan ? vistaPlan(plan) : '<div class="sub" style="text-align:center">Elige uno o más grupos para armar la rutina.</div>'}`;
}

function vistaPlan(plan) {
  if (!plan.ej.length && !plan.conAbs) return `<div class="card"><h2>Rutina propuesta</h2><div class="sub">No alcanza el tiempo para ejercicios: sube los minutos o quita los abdominales.</div></div>`;
  return `<div class="card"><h2>Rutina propuesta</h2><ul class="lista">
    <li>Calentamiento de articulaciones · 5 min</li>
    ${plan.ej.map(e => `<li><b style="color:var(--txt)">${e.n}</b> · ${e.s} × ${e.r}${e.x ? ' ' + e.x : ''} · ${kgTxt(e, L.sugerirKg(db.sesiones, e))}</li>`).join('')}
    ${plan.conAbs ? `<li><b style="color:var(--txt)">🔥 Core: abdominales con disco</b> · ${L.ABS_RONDAS} rondas fijas · ${Math.round(L.ABS_SEG / 60)} min</li>` : ''}
    <li>Elongar · 5 min</li></ul>
    ${plan.sobraMin >= 5 ? `<div class="sub">Sobran ~${plan.sobraMin} min: úsalos para técnica de BJJ o movilidad.</div>` : ''}
    <button class="btn" data-act="empezar">Empezar</button></div>`;
}

function vistaEntreno() {
  const a = db.actual;
  const total = a.ej.reduce((n, e) => n + e.s, 0) + (a.abs ? L.ABS_RONDAS * L.ABS.length : 0);
  const hechas = Object.keys(a.hechos).length;
  return `<h1>${a.grupos.map(g => L.GRUPOS[g].icono + ' ' + L.GRUPOS[g].nombre).join(' + ')}</h1>
  <div class="sub">Plan ${a.min} min · <span id="reloj">${transcurrido()}</span> · ${hechas}/${total} series</div>
  <div class="barra"><i style="width:${hechas / total * 100}%"></i></div>
  ${bloqueFijo('cal', '1 · Calentamiento de articulaciones', L.CALENTAMIENTO)}
  ${a.ej.map((e, i) => tarjetaEj(e, i)).join('')}
  ${a.abs ? tarjetaAbs() : ''}
  ${bloqueFijo('elo', `${a.abs ? 4 : 3} · Elongar`, L.ELONGACION)}
  <button class="btn" data-act="terminar">Terminar y guardar</button>
  <button class="btn sec" data-act="cancelar">Descartar sesión</button>`;
}

const transcurrido = () => db.actual ? `${Math.floor((Date.now() - new Date(db.actual.inicio)) / 60000)} min` : '';

function bloqueFijo(k, titulo, items) {
  const ok = db.actual[k];
  return `<div class="card bloque ${ok ? 'ok' : ''}"><h3>${titulo} (5 min)</h3><ul class="lista">${items.map(i => `<li>${i}</li>`).join('')}</ul>
    <div class="fila"><button class="mini" data-act="fijo" data-v="${k}">⏱ Iniciar 5:00</button>${ok ? '<span class="sub">✓ hecho</span>' : ''}</div></div>`;
}

function tarjetaEj(e, n) {
  const a = db.actual;
  let todas = true;
  const filas = Array.from({ length: e.s }, (_, i) => {
    const k = `${e.id}:${i}`, h = a.hechos[k], v = h || a.inp[k] || {};
    if (!h) todas = false;
    return `<div class="serie ${h ? 'hecho' : ''}"><span class="sub">${i + 1}</span>
      ${e.kg === null ? '<span class="sub">corporal</span>' : `<input inputmode="decimal" data-k="${k}" data-f="kg" value="${esc(v.kg ?? e.kgSug)}" aria-label="kg serie ${i + 1}">`}
      <input inputmode="numeric" data-k="${k}" data-f="reps" value="${esc(v.reps ?? (L.tope(e.r) || ''))}" aria-label="reps serie ${i + 1}">
      <button data-act="serie" data-k="${k}">${h ? '✓' : 'Serie lista'}</button></div>`;
  }).join('');
  return `<div class="card bloque ${todas ? 'ok' : ''}"><h3>2.${n + 1} · ${e.n}</h3>
    <div class="sub">${e.s} × ${e.r}${e.x ? ' ' + e.x : ''} · descanso ${e.d} s${e.kg !== null ? ` · sugerido ${e.kgSug} kg` : ''}</div>
    <div class="serie sub"><span></span><span>${e.kg === null ? '' : 'kg'}</span><span>reps</span><span></span></div>${filas}</div>`;
}

function tarjetaAbs() {
  const a = db.actual;
  let html = '';
  for (let r = 0; r < L.ABS_RONDAS; r++) {
    html += `<div class="sub" style="margin-top:10px">Ronda ${r + 1}</div>` + L.ABS.map((x, i) => {
      const k = `abs:${r}:${i}`, h = a.hechos[k];
      return `<div class="serie ${h ? 'hecho' : ''}"><span></span><span style="grid-column:2/4">${x.n} <span class="sub">× ${x.r}</span></span><button data-act="abs1" data-k="${k}">${h ? '✓' : 'Lista'}</button></div>`;
    }).join('');
  }
  return `<div class="card bloque"><h3>3 · 🔥 Core · abdominales con disco</h3><div class="sub">Rutina fija: solo cambia el peso del disco.</div>
    <div class="fila sub">Disco <input inputmode="decimal" data-k="abskg" value="${esc(a.absKg)}" style="width:70px;background:var(--panel2);color:var(--txt);border:1px solid #33405f;border-radius:8px;padding:6px;text-align:center"> kg · ${L.ABS_DESC_EJ} s entre ejercicios, ${L.ABS_DESC_RONDA} s entre rondas</div>${html}</div>`;
}

function vistaAvance() {
  const r = L.resumenSemana(db.sesiones), nv = L.niveles(db.sesiones);
  const conKg = [...new Set(db.sesiones.flatMap(s => s.series.filter(x => x.kg !== null && x.kg !== undefined).map(x => x.ex)))];
  if (!conKg.includes(exSel)) exSel = conKg[0];
  const stat = (v, t) => `<div><div style="font-size:26px;font-weight:700">${v}</div><div class="sub">${t}</div></div>`;
  return `<h1>Avance semanal</h1>
  <div class="card"><div class="fila" style="justify-content:space-around;text-align:center">${stat(`${r.sesiones}/${L.META}`, 'sesiones')}${stat(r.minutos, 'minutos')}${stat(r.series, 'series')}</div></div>
  <div class="card"><h2>Nivel por grupo <span class="sub">· últimas 4 semanas</span></h2>${radar(nv)}</div>
  <div class="card"><h2>Evolución de la carga</h2>${conKg.length
    ? `<select data-act="exsel">${conKg.map(id => `<option value="${esc(id)}" ${id === exSel ? 'selected' : ''}>${esc(nombreEj(id))}</option>`).join('')}</select>${grafico(L.serieKg(db.sesiones, exSel))}`
    : '<div class="sub">Aparecerá cuando registres series con peso.</div>'}</div>
  <div class="card"><h2>Logros de la semana</h2>${L.logros(db.sesiones).map(l => `<div class="logro ${l.ok ? 'ok' : ''}"><b>${l.i}</b><span>${l.t}</span></div>`).join('')}</div>
  <div class="card"><h2>Historial</h2>${db.sesiones.slice(-10).reverse().map(s => `<div style="padding:6px 0;border-bottom:1px solid var(--panel2)">
    <b>${new Date(s.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</b> · ${(s.grupos || []).map(g => L.GRUPOS[g]?.icono ?? '').join(' ')}
    <span class="sub">· ${esc(s.duracionMin)} min · ${s.series.length} series${s.abs ? ' · abs' : ''}${s.clima ? ' · ' + esc(s.clima.txt) : ''}</span></div>`).join('') || '<div class="sub">Todavía no hay sesiones.</div>'}</div>
  <div class="card"><h2>Respaldo</h2><div class="sub">Los datos viven solo en este teléfono. Descarga un respaldo de vez en cuando.</div>
    <button class="btn sec" data-act="exportar">Descargar respaldo</button>
    <label class="btn sec" style="text-align:center">Restaurar respaldo<input type="file" accept="application/json,.json" data-act="importar" hidden></label></div>`;
}

function radar(nv) {
  const gs = Object.keys(L.GRUPOS), c = 160, R = 95;
  const pt = (i, f) => { const a = -Math.PI / 2 + i * 2 * Math.PI / gs.length; return [c + Math.cos(a) * R * f, c + Math.sin(a) * R * f]; };
  const poly = f => gs.map((_, i) => pt(i, typeof f === 'function' ? f(i) : f).map(v => v.toFixed(1)).join(',')).join(' ');
  return `<svg viewBox="0 0 320 320" width="100%" style="max-width:360px;display:block;margin:auto" role="img" aria-label="Nivel por grupo muscular">
    ${[.25, .5, .75, 1].map(f => `<polygon points="${poly(f)}" fill="none" stroke="#33405f"/>`).join('')}
    ${gs.map((_, i) => `<line x1="${c}" y1="${c}" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}" stroke="#33405f"/>`).join('')}
    <polygon points="${poly(i => Math.max(.03, nv[gs[i]].vol))}" fill="rgba(229,72,77,.3)" stroke="#e5484d" stroke-width="2"/>
    <polygon points="${poly(i => Math.max(.03, nv[gs[i]].carga))}" fill="rgba(76,141,255,.3)" stroke="#4c8dff" stroke-width="2"/>
    ${gs.map((g, i) => { const [x, y] = pt(i, 1.3); return `<text x="${x}" y="${y - 6}" text-anchor="middle">${L.GRUPOS[g].icono} ${L.GRUPOS[g].nombre.split(' ')[0]}</text><text x="${x}" y="${y + 10}" text-anchor="middle" style="font-weight:600"><tspan style="fill:#e5484d">${Math.round(nv[g].vol * 100)}%</tspan> <tspan style="fill:#4c8dff">+${Math.round(nv[g].subida * 100)}%</tspan></text>`; }).join('')}
  </svg>
  <div class="sub" style="text-align:center"><b style="color:#e5484d">■</b> Volumen: series en 4 semanas (24 = 100 %) · <b style="color:#4c8dff">■</b> Carga: subida de kg desde el primer registro (+${L.SUBIDA_TOPE * 100} % llena el eje)</div>`;
}

function grafico(pts) {
  if (pts.length < 2) return `<div class="sub" style="margin-top:8px">${pts.length ? `Primer registro: ${pts[0].kg} kg. Con dos sesiones aparece la curva.` : 'Sin registros.'}</div>`;
  const W = 340, H = 190, px = 36, py = 22;
  const t = pts.map(p => +new Date(p.fecha)), t0 = t[0], dt = (t.at(-1) - t0) || 1;
  const ks = pts.map(p => p.kg), lo = Math.min(...ks), hi = Math.max(...ks), span = (hi - lo) || 1;
  const X = v => px + (v - t0) / dt * (W - px - 12), Y = k => H - py - (k - lo) / span * (H - 2 * py);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(t[i]).toFixed(1)},${Y(p.kg).toFixed(1)}`).join(' ');
  const f = v => new Date(v).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="margin-top:10px" role="img" aria-label="Carga por sesión">
    <line x1="${px}" y1="${Y(hi)}" x2="${W - 12}" y2="${Y(hi)}" stroke="#33405f" stroke-dasharray="3 4"/>
    <line x1="${px}" y1="${Y(lo)}" x2="${W - 12}" y2="${Y(lo)}" stroke="#33405f" stroke-dasharray="3 4"/>
    <text x="${px - 6}" y="${Y(hi) + 4}" text-anchor="end">${hi}</text><text x="${px - 6}" y="${Y(lo) + 4}" text-anchor="end">${lo}</text>
    <path d="${d}" fill="none" stroke="#4c8dff" stroke-width="2.5"/>
    ${pts.map((p, i) => `<circle cx="${X(t[i])}" cy="${Y(p.kg)}" r="4" fill="#4c8dff"/>`).join('')}
    <text x="${px}" y="${H - 4}">${f(t0)}</text><text x="${W - 12}" y="${H - 4}" text-anchor="end">${f(t.at(-1))}</text>
  </svg><div class="sub">kg máximo por sesión</div>`;
}

function render() {
  const enCurso = tab === 'hoy' && db.actual;
  $('#app').innerHTML = tab === 'inicio' ? vistaInicio() : tab === 'avance' ? vistaAvance() : enCurso ? vistaEntreno() : vistaHoy();
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('sel', b.dataset.tab === tab));
}

// ---------- timer de descanso (por hora de término: sigue bien si la pantalla se bloquea) ----------
let tFin = 0, tInt = null;
function timer(seg, txt) {
  tFin = Date.now() + seg * 1000;
  $('#timerTxt').textContent = txt;
  $('#timer').classList.add('on');
  clearInterval(tInt); tInt = setInterval(tick, 250); tick();
}
function tick() {
  const r = Math.max(0, Math.ceil((tFin - Date.now()) / 1000));
  $('#timerT').textContent = `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`;
  if (r > 0) return;
  clearInterval(tInt);
  navigator.vibrate?.([300, 120, 300, 120, 300]);
  pitido();
  $('#timerTxt').textContent = '¡A trabajar!';
  setTimeout(() => tFin <= Date.now() && $('#timer').classList.remove('on'), 1500);
}
function pitido() {
  if (!audio) return;
  [0, .25, .5].forEach(dt => {
    const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + dt;
    o.frequency.value = 880; g.gain.setValueAtTime(.3, t); o.connect(g).connect(audio.destination); o.start(t); o.stop(t + .15);
  });
}
async function pantallaEncendida() {
  try { if (db.actual && 'wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.onrelease = () => (wake = null); } } catch {}
}

// ---------- acciones ----------
function siguienteTxt(k) {
  const a = db.actual, todas = a.ej.flatMap(e => Array.from({ length: e.s }, (_, i) => [`${e.id}:${i}`, e.n]));
  const sig = todas.find(([kk]) => kk !== k && !a.hechos[kk]);
  return sig ? `Descanso · sigue: ${sig[1]}` : 'Descanso';
}

const acciones = {
  tab: el => { tab = el.dataset.tab; render(); scrollTo(0, 0); },
  min: el => { form.min = +el.dataset.v; render(); },
  grupo: el => { const g = el.dataset.v; form.grupos = form.grupos.includes(g) ? form.grupos.filter(x => x !== g) : [...form.grupos, g]; render(); },
  musculo: el => { musculo = musculo === el.dataset.v ? null : el.dataset.v; render(); },
  basico: el => { const d = diaHoy(); db.basicos[d] = { ...db.basicos[d], [el.dataset.v]: el.checked }; guardar(); render(); },
  entrenarGrupo: el => { form.grupos = [el.dataset.v]; tab = 'hoy'; render(); scrollTo(0, 0); },
  empezar: () => {
    const plan = L.armarRutina(minElegido(), form.grupos);
    const ultAbs = [...db.sesiones].reverse().flatMap(s => s.series).find(x => x.ex === L.ABS[0].id);
    db.actual = {
      inicio: new Date().toISOString(), min: minElegido(), grupos: [...form.grupos], abs: plan.conAbs, absKg: ultAbs?.kg ?? 10,
      clima: clima && !clima.error ? { txt: clima.txt, lluvia: clima.lluvia } : null,
      ej: plan.ej.map(e => ({ ...e, kgSug: L.sugerirKg(db.sesiones, e) })), hechos: {}, inp: {}, cal: false, elo: false,
    };
    guardar(); pantallaEncendida(); render(); scrollTo(0, 0);
  },
  fijo: el => { db.actual[el.dataset.v] = true; guardar(); render(); timer(300, el.dataset.v === 'cal' ? 'Calentamiento de articulaciones' : 'Elongar'); },
  serie: el => {
    const a = db.actual, k = el.dataset.k;
    if (a.hechos[k]) { delete a.hechos[k]; guardar(); render(); return; }
    const [ex, i] = k.split(':'), e = a.ej.find(x => x.id === ex);
    const val = f => document.querySelector(`input[data-k="${k}"][data-f="${f}"]`)?.value;
    a.hechos[k] = { kg: e.kg === null ? null : val('kg'), reps: val('reps') };
    for (let j = +i + 1; j < e.s; j++) if (!a.hechos[`${ex}:${j}`]) a.inp[`${ex}:${j}`] = { ...a.inp[`${ex}:${j}`], kg: a.hechos[k].kg ?? undefined };
    guardar(); render();
    timer(e.d, siguienteTxt(k));
  },
  abs1: el => {
    const a = db.actual, k = el.dataset.k;
    if (a.hechos[k]) { delete a.hechos[k]; guardar(); render(); return; }
    a.hechos[k] = { abs: true };
    const [, r, i] = k.split(':').map(Number);
    guardar(); render();
    if (i < L.ABS.length - 1) timer(L.ABS_DESC_EJ, `Sigue: ${L.ABS[i + 1].n}`);
    else if (r < L.ABS_RONDAS - 1) timer(L.ABS_DESC_RONDA, `Descanso · ronda ${r + 2} de ${L.ABS_RONDAS}`);
  },
  terminar: () => {
    const a = db.actual;
    const series = Object.entries(a.hechos).map(([k, h]) => {
      if (k.startsWith('abs:')) return { ex: L.ABS[+k.split(':')[2]].id, g: 'core', kg: +String(a.absKg).replace(',', '.') || 0, reps: 20 };
      const e = a.ej.find(x => x.id === k.split(':')[0]);
      return { ex: e.id, g: e.g, kg: e.kg === null ? null : +String(h.kg).replace(',', '.') || 0, reps: +h.reps || 0 };
    });
    if (!series.length && !confirm('No marcaste ninguna serie. ¿Guardar igual?')) return;
    db.sesiones.push({
      fecha: a.inicio, grupos: a.grupos, min: a.min, duracionMin: Math.round((Date.now() - new Date(a.inicio)) / 60000),
      abs: Object.keys(a.hechos).some(k => k.startsWith('abs:')), clima: a.clima, series,
    });
    db.actual = null; form.grupos = []; tab = 'avance';
    wake?.release(); guardar(); render(); scrollTo(0, 0);
  },
  cancelar: () => { if (confirm('¿Descartar la sesión en curso? Se pierden las series marcadas.')) { db.actual = null; wake?.release(); guardar(); render(); } },
  't-15': () => { tFin -= 15000; tick(); },
  't+15': () => { tFin = Math.max(tFin, Date.now()) + 15000; clearInterval(tInt); tInt = setInterval(tick, 250); tick(); },
  tfin: () => { clearInterval(tInt); $('#timer').classList.remove('on'); },
  exportar: () => {
    const u = URL.createObjectURL(new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' }));
    const l = Object.assign(document.createElement('a'), { href: u, download: `bam-${new Date().toISOString().slice(0, 10)}.json` });
    l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000);
  },
};

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el || !acciones[el.dataset.act]) return;
  if (!audio && window.AudioContext) audio = new AudioContext(); // iOS solo permite sonido tras un toque
  audio?.state === 'suspended' && audio.resume();
  acciones[el.dataset.act](el);
});

document.addEventListener('input', ev => {
  const { k, f } = ev.target.dataset;
  if (!k || !db.actual) return;
  if (k === 'abskg') db.actual.absKg = ev.target.value;
  else db.actual.inp[k] = { ...db.actual.inp[k], [f]: ev.target.value };
  guardar();
});

document.addEventListener('change', async ev => {
  const act = ev.target.dataset.act;
  if (act === 'exsel') { exSel = ev.target.value; render(); }
  if (act === 'importar' && ev.target.files[0]) {
    try {
      const d = JSON.parse(await ev.target.files[0].text());
      if (!Array.isArray(d.sesiones) || !d.sesiones.every(s => s.fecha && Array.isArray(s.series))) throw new Error();
      if (confirm(`¿Reemplazar ${db.sesiones.length} sesiones por las ${d.sesiones.length} del respaldo?`)) { db = { sesiones: d.sesiones, actual: null, basicos: d.basicos || {} }; guardar(); render(); }
    } catch { alert('El archivo no es un respaldo válido de BaM.'); }
  }
});

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { pantallaEncendida(); if ($('#timer.on')) tick(); } });
setInterval(() => { const r = $('#reloj'); if (r) r.textContent = transcurrido(); }, 15000);

render();
pantallaEncendida();
obtenerClima().then(c => { clima = c; }).catch(() => { clima = { error: true }; }).finally(() => tab !== 'avance' && !db.actual && render());
navigator.serviceWorker?.register('sw.js');
