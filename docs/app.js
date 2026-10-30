import * as L from './logic.js';
import * as IA from './ia.js';

const KEY = 'bam-v1';
const COORD_DEF = [-36.83, -73.05]; // Concepción, si no hay GPS
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const nombreEj = id => Object.values(L.GRUPOS).flatMap(G => G.ej).concat(L.ABS).find(e => e.id === id)?.n ?? id;

let db = cargar();
let tab = db.actual ? 'hoy' : 'inicio';
let musculo = null;
let form = { min: null, grupos: [], factor: 1, plan: null, item: null };
let clima = null;
let exSel = null;
let audio = null, wake = null;
let calMsg = '';
let editando = null; // fecha del editor abierto en Entrenamiento
let lado = false, preg = null; // panel lateral abierto; { q, a, cargando } de la pregunta a Claude
const edit = {}; // cambios sin confirmar por fecha: { item, hora, min }

function cargar() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && Array.isArray(d.sesiones)) {
    for (const s of d.sesiones) { // versiones previas: abdominales como 'abs' y fuera de los grupos
      s.series.forEach(x => x.g === 'abs' && (x.g = 'core'));
      if (s.abs && !s.grupos.includes('core')) s.grupos.push('core');
    }
    return { ...defaults(), ...d };
  } } catch {}
  return { sesiones: [], actual: null, ...defaults() };
}
function defaults() {
  return { basicos: {}, perfil: {}, meta: null, actividad: [], cal: { leido: null, ev: [] }, dias: {}, comidas: {}, platos: {}, pesos: [] };
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
const diaHoy = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD local
const fechaTxt = (f, o) => L.dia(f).toLocaleDateString('es-CL', o);

function semana(fecha = new Date()) {
  if (!db.meta) return null;
  const est = L.estadoMeta(db.meta, fecha);
  if (est.fin) return { est, dias: [], items: [], pend: [], sinLugar: [] };
  const l = L.lunes(fecha), hoy = diaHoy(), fin = L.sumarDias(l, 6) < db.meta.fecha ? L.sumarDias(l, 6) : db.meta.fecha;
  const ev = db.cal.ev, deporteSemana = ev.some(e => L.lunes(e.ini) === l && L.RE_DEPORTE.test(e.t || '')) ||
    db.actividad.some(a => L.lunes(a.fecha) === l && /fútbol|bjj/i.test(a.tipo));
  const items = L.metasSemana(est.fase, deporteSemana);
  const hechas = db.sesiones.filter(s => L.lunes(s.fecha) === l);
  const pend = L.pendientes(items, hechas);
  const fechas = []; for (let f = hoy > l ? hoy : l; f <= fin; f = L.sumarDias(f, 1)) fechas.push(f);
  const dias = fechas.map(f => ({ fecha: f, d: L.dispDia(ev, f, { ahora: new Date() }), elegido: db.dias[f], hecho: db.sesiones.some(x => L.iso(x.fecha) === f) }));
  const r = L.distribuir(est.fase, pend, dias, L.horaHabitual(ev));
  return { est, l, items, hechas, pend, dias: r.dias, sinLugar: r.sinLugar };
}
const semanaDe = f => semana(L.lunes(f) === L.lunes(new Date()) ? new Date() : L.dia(f));
const diaPlan = f => semanaDe(f)?.dias.find(d => d.fecha === f);
const nombreGrupo = g => `${L.GRUPOS[g].icono} ${L.GRUPOS[g].nombre}`;

function tarjetaMeta() {
  const m = db.meta, est = m && semana().est;
  if (!m) return '';
  if (est.fin) return `<div class="card" style="border:2px solid var(--ac)"><h2>¡Llegó el día! Inscríbete en las clases de BJJ 🥋</h2><div class="sub">Crea una meta nueva más abajo.</div></div>`;
  return `<div class="card"><h2>🎯 ${esc(m.nombre)} · faltan ${est.dias} días</h2>
    <div class="sub">Semana ${est.semana + 1} de ${est.total} · Fase ${L.FASES[est.fase].n}</div>
    <div class="barra"><i style="width:${(est.semana + 1) / est.total * 100}%"></i></div><div class="sub">${L.FASES[est.fase].obj}</div></div>`;
}

function tarjetaHoy(hoy) {
  const d = db.meta && diaPlan(hoy);
  if (!d) return '';
  if (editando === hoy) return editorDia(hoy);
  const ses = d.ses, dep = d.deporte ? `<div class="sub">⚽ ${esc(d.deporte)}: cuenta como entrenamiento intenso</div>` : '';
  if (d.hecho) return `<div class="card"><h2>Hoy</h2><div>✓ Ya entrenaste hoy</div>${dep}</div>`;
  const cambiar = `<button class="btn sec" data-act="editar" data-v="${hoy}">Cambiar</button>`;
  if (ses) return `<div class="card"><h2>Hoy</h2><div>${ses.i} ${ses.n} · ${d.hora} · ${d.min} min</div><div class="sub">${d.item.fija ? '⭐ fija' : 'variable'}</div>${dep}
    <button class="btn" data-act="planEmpezar">Empezar</button>${cambiar}</div>`;
  return `<div class="card"><h2>Hoy</h2>${dep}<div class="sub">Día libre: camina o haz movilidad 20 min</div>${cambiar}</div>`;
}

function tarjetaManana() {
  const m = L.sumarDias(diaHoy(), 1), d = db.meta && diaPlan(m);
  if (!d) return '';
  if (db.dias[m] && editando !== m) return `<div class="card"><h2>Mañana · ${fechaTxt(m, { weekday: 'long' })}</h2>
    <div>Confirmado: ${d.ses ? `${d.ses.i} ${d.ses.n} a las ${d.hora} · ${d.min} min` : 'día libre'}</div>
    <button class="btn sec" data-act="editar" data-v="${m}">Cambiar</button></div>`;
  return editorDia(m);
}

// Datos del editor de un día: lo propuesto por distribuir, salvo lo que el usuario cambió.
function valoresEd(f) {
  const s = semanaDe(f), d = s?.dias.find(x => x.fecha === f), e = edit[f] || {};
  return { s, d, item: e.item ?? d?.item?.id ?? 'libre', hora: e.hora || d?.hora || L.horaHabitual(db.cal.ev), min: e.min ?? d?.min ?? 60 };
}

function editorDia(f) {
  const c = valoresEd(f), d = c.d;
  if (!d) return '';
  const hoy = diaHoy(), fase = c.s.est.fase, hh = L.hhmm;
  const disp = L.dispDia(db.cal.ev, f, { ahora: new Date() });
  const titulo = f === hoy ? 'Hoy' : `${f === L.sumarDias(hoy, 1) ? 'Mañana · ' : ''}${fechaTxt(f, { weekday: 'long', ...(f === L.sumarDias(hoy, 1) ? {} : { day: 'numeric' }) })}`;
  const ops = c.s.pend.map(it => { const x = L.sesion(it.tipo, fase); return `<option value="${it.id}" ${c.item === it.id ? 'selected' : ''}>${it.fija ? '⭐ ' : ''}${x.i} ${x.n}</option>`; }).join('');
  const ini = L.aMs(f, c.hora), fin = ini + c.min * 6e4;
  const choca = c.item !== 'libre' && db.cal.ev.find(e => !L.esBloque(e.t || '') && L.iso(e.ini) === f && +L.dia(e.ini) < fin && +L.dia(e.fin) > ini);
  const amarillo = t => `<div style="margin-top:6px;color:#f0b429">${t}</div>`;
  return `<div class="card" style="border:2px solid var(--ac)"><h2>${titulo}</h2>
    <select id="edItem${f}" data-edit="item" data-f="${f}"><option value="libre" ${c.item === 'libre' ? 'selected' : ''}>Día libre</option>${ops}</select>
    <input class="campo" type="time" id="edHora${f}" data-edit="hora" data-f="${f}" value="${c.hora}" aria-label="hora" style="margin-top:6px">
    <div class="sub" style="margin-top:6px">Huecos libres</div>
    <div class="fila chips">${disp.huecos.map(([x, y]) => `<button data-act="edHueco" data-f="${f}" data-v="${hh(x)}">${hh(x)}–${hh(y)}</button>`).join('') || '<span class="sub">Sin huecos</span>'}</div>
    ${disp.deporte ? `<div class="sub">⚽ ${esc(disp.deporte)}: ese día solo movilidad</div>` : ''}
    ${disp.choque ? amarillo(`Tu bloque de Ejercicio choca con '${esc(disp.choque)}'`) : ''}
    <div class="sub" style="margin-top:6px">Minutos</div>
    <div class="fila chips">${[30, 45, 60, 75, 90].map(n => `<button data-act="edMin" data-f="${f}" data-v="${n}" class="${n === c.min ? 'sel' : ''}">${n}</button>`).join('')}</div>
    ${choca ? amarillo(`Esa hora choca con '${esc(choca.t)}'`) : ''}
    ${calMsg ? amarillo(esc(calMsg)) : ''}
    <button class="btn" data-act="confirmarDia" data-v="${f}">Confirmar${db.calUrl ? ' y mover en el calendario' : ''}</button>
    ${db.dias[f] ? `<button class="mini" style="background:var(--panel2);margin-top:6px" data-act="soltarDia" data-v="${f}">Volver a la propuesta</button>` : ''}</div>`;
}

const tipoDiaDe = hp => hp?.deporte && !hp?.ses ? 'deporte' : hp?.ses?.tipo ?? 'descanso';
const nutDe = hp => L.dieta(db.perfil, tipoDiaDe(hp), hp?.ses ? L.minSesion(hp.ses) : 0);
const ACTIVIDADES = ['Caminata', 'Trote', 'Bici', 'Fútbol', 'Clase de BJJ', 'Movilidad', 'Otra'];

function vistaInicio() {
  const hoy = diaHoy(), hp = diaPlan(hoy), nut = nutDe(hp);
  const b = db.basicos[hoy] || {}, racha = L.racha(db.basicos, hoy);
  const metas = [
    ['mov', hp?.ses ? `🏃 ${hp.ses.n}` : '🚶 Caminar o movilidad 20 min'],
    ['agua', nut ? `💧 Agua ${String(nut.agua).replace(".", ",")} L` : '💧 Llevar la botella de agua'],
    ['prot', nut ? `🍗 Proteína ${nut.prot} g` : '🍗 Proteína en cada comida'],
    ['snack', '🍎 Snack saludable'], ['elongar', '🧘 Elongar 10 min'], ['sueno', '😴 Dormir 7 h o más'],
  ];
  const puntos = Array.from({ length: 28 }, (_, i) => { const f = L.sumarDias(hoy, i - 27);
    return `<span style="width:10px;height:10px;border-radius:50%;background:${L.diaCumplido(db.basicos[f]) ? 'var(--ok)' : 'var(--panel2)'};${f === hoy ? 'border:2px solid #fff;box-sizing:border-box' : ''}"></span>`; }).join('');
  const deHoy = db.actividad.filter(a => a.fecha === hoy);
  return `<div class="sub" style="letter-spacing:.04em"><b style="color:var(--ac)">BaM</b> · Becoming a Machine</div>
  <h1>${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
  <div class="card"><h2>Metas de hoy <span class="sub">🔥 ${racha.actual} días</span></h2>
    <div class="sub">mejor racha ${racha.mejor} · cuenta si te mueves y cumples 4 de 6</div>
    ${metas.map(([k, t]) => `<label class="switch" style="padding:8px 0"><span>${t}</span><input type="checkbox" data-act="basico" data-v="${k}" ${b[k] ? 'checked' : ''}></label>`).join('')}
    <div class="fila" style="gap:4px;margin-top:8px">${puntos}</div></div>
  <div class="card"><h2>Registrar actividad</h2>
    <div class="fila"><select id="actTipo" style="flex:2">${ACTIVIDADES.map(a => `<option>${a}</option>`).join('')}</select>
    <input id="actMin" inputmode="numeric" value="30" aria-label="minutos" style="flex:1;min-width:60px" class="campo"><button class="mini" data-act="actividad">Registrar</button></div>
    ${deHoy.map(a => `<div class="sub">${esc(a.tipo)} · ${esc(a.min)} min</div>`).join('')}</div>
  <button class="btn sec" data-act="anotarComida">🍽️ Registrar comida</button>
  <button class="btn" data-act="tab" data-tab="hoy">🥋 Ir a entrenar${hp?.ses && !hp.hecho ? ` · ${hp.ses.n} ${hp.hora}` : ''}</button>`;
}

function cardMapa() {
  const M = musculo && L.MUSCULOS[musculo];
  const info = !M ? '<div class="sub" style="text-align:center">Toca un músculo para ver su grupo y qué ejercicios lo trabajan.</div>' :
    `<h3 style="color:${COLOR[M[1]]}">${M[0]}</h3><div class="sub">Grupo: ${nombreGrupo(M[1])}</div>
     <ul class="lista">${L.ejerciciosDe(musculo).map(e => `<li><b style="color:var(--txt)">${e.n}</b> · ${L.GRUPOS[e.g].nombre}</li>`).join('')}</ul>
     <button class="btn sec" data-act="entrenarGrupo" data-v="${M[1]}">Entrenar ${L.GRUPOS[M[1]].nombre}</button>`;
  return `<div class="card"><h2>Mapa muscular</h2>${silueta()}
    <div class="fila sub" style="justify-content:center;gap:12px;margin:6px 0 10px">${Object.entries(COLOR).filter(([g]) => g !== 'potencia').map(([g, c]) => `<span><b style="color:${c}">●</b> ${L.GRUPOS[g].nombre.split(' ')[0]}</span>`).join('')}</div>
    ${info}</div>`;
}

function tarjetaLunes() {
  const r = L.resumenAnterior(db.sesiones), dif = r.sesiones - r.antes;
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
// pal = { cara, nivel }: solo el frente, con cara; los músculos se encienden con la proteína del día.
function silueta(pal) {
  const forma = dx => ([m, pts, central]) => {
    const sel = !pal && m === musculo, c = COLOR[L.MUSCULOS[m][1]];
    const attrs = `${pal ? '' : `data-act="musculo" data-v="${m}" style="cursor:pointer"`} fill="${c}" fill-opacity="${sel ? .95 : pal ? .12 + .8 * pal.nivel : .42}" stroke="${sel ? '#fff' : c}" stroke-opacity="${sel ? 1 : .7}" stroke-width="${sel ? 2 : 1}"`;
    return (central ? [pts] : [pts, espejo(pts)]).map(p => `<path d="${suave(mover(p, dx))}" ${attrs}><title>${L.MUSCULOS[m][0]}</title></path>`).join('');
  };
  const cuerpo = dx => `<ellipse cx="${100 + dx}" cy="28" rx="15" ry="20" fill="#26324d" stroke="#3a4a6e"/><path d="${suave(mover(CONTORNO, dx))}" fill="#26324d" stroke="#3a4a6e" stroke-width="1.5"/>`;
  const detalle = `<g stroke="#0f1420" stroke-opacity=".55" fill="none" pointer-events="none">
    <path d="M100,118 V178 M91,134 H109 M90,150 H110 M90,164 H110"/><path d="M300,60 V184"/></g>`;
  if (pal) return `<svg viewBox="28 0 144 362" class="${pal.cara === 2 ? 'pal-feliz' : ''}" style="width:100%;max-width:150px;display:block;margin:auto" role="img" aria-label="Tu Pal">
    ${cuerpo(0)}${FRENTE.map(forma(0)).join('')}${detalle}
    <g fill="#e8ecf4"><circle cx="94" cy="24" r="2"/><circle cx="106" cy="24" r="2"/></g>
    <path d="M93,${36 - pal.cara} Q100,${36 + pal.cara * 3} 107,${36 - pal.cara}" stroke="#e8ecf4" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  return `<svg viewBox="0 0 400 365" width="100%" style="max-width:440px;display:block;margin:auto" role="img" aria-label="Silueta muscular interactiva">
    ${cuerpo(0)}${cuerpo(200)}${FRENTE.map(forma(0)).join('')}${ESPALDA.map(forma(200)).join('')}${detalle}
    <text x="100" y="364" text-anchor="middle">Frente</text><text x="300" y="364" text-anchor="middle">Espalda</text></svg>`;
}

function vistaHoy() {
  const r = L.resumenSemana(db.sesiones), min = minElegido();
  const plan = form.grupos.length ? L.armarRutina(min, form.grupos, form.factor ?? 1) : null;
  const hoy = diaHoy(), conMeta = db.meta && !semana().est.fin;
  const climaHtml = !clima ? '<span class="sub">Consultando el clima…</span>' : clima.error ? '<span class="sub">Sin datos de clima (sin conexión)</span>' :
    `<div class="fila"><span style="font-size:38px">${clima.i}</span><div><b>${clima.txt}, ${clima.temp} °C</b>
     <div class="sub">Lluvia ${clima.prob}% · ${clima.lluvia ? 'día de lluvia: probablemente haya menos tiempo, prioriza lo esencial' : 'buen día: puede que haya más tiempo para entrenar'}</div></div></div>`;
  return `<h1>🥋 Entrenamiento</h1>
  ${new Date().getDay() === 1 ? tarjetaLunes() : ''}${tarjetaMeta()}${tarjetaHoy(hoy)}${tarjetaManana()}${conMeta ? '' : vistaMeta()}
  <h2 style="margin-top:16px">Entrena libre</h2>
  <div class="card">${climaHtml}</div>
  <div class="card"><h2>Semana: ${r.sesiones}/${L.META} sesiones</h2><div class="barra"><i style="width:${Math.min(100, r.sesiones / L.META * 100)}%"></i></div>
    <div class="sub">${r.pendientes.length ? 'Falta: ' + r.pendientes.map(g => L.GRUPOS[g].icono + ' ' + L.GRUPOS[g].nombre).join(' · ') : '¡Todos los grupos trabajados esta semana!'}</div></div>
  <div class="card"><h2>¿Cuánto tiempo esperas entrenar?</h2>
    <div class="fila chips">${[30, 45, 60, 75, 90].map(m => `<button data-act="min" data-v="${m}" class="${m === min ? 'sel' : ''}">${m} min</button>`).join('')}</div>
    ${clima?.min ? `<div class="sub" style="margin-top:6px">Sugerido por el clima: ${clima.min} min</div>` : ''}</div>
  <div class="card"><h2>¿Qué grupo muscular?</h2><div class="grupos">
    ${Object.entries(L.GRUPOS).map(([g, G]) => `<button data-act="grupo" data-v="${g}" class="${form.grupos.includes(g) ? 'sel' : ''}">${G.icono} ${G.nombre}<span class="tag ${r.grupos.has(g) ? '' : 'pend'}">${r.grupos.has(g) ? '✓ hecho esta semana' : 'pendiente'}</span></button>`).join('')}</div></div>
  ${plan ? vistaPlan(plan) : '<div class="sub" style="text-align:center">Elige uno o más grupos para armar la rutina.</div>'}
  ${cardMapa()}${conMeta ? `<h2 style="margin-top:16px">Plan</h2>${vistaMeta()}` : ''}`;
}

function vistaPlan(plan) {
  if (!plan.ej.length && !plan.conAbs) return `<div class="card"><h2>Rutina propuesta</h2><div class="sub">No alcanza el tiempo para ejercicios: sube los minutos o quita los abdominales.</div></div>`;
  return `<div class="card" id="rutina"><h2>Rutina propuesta</h2><ul class="lista">
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

const mmss = seg => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`;
function vistaCardio() {
  const a = db.actual, ses = a.ses, zs = L.zonas(db.perfil);
  const zona = z => zs ? zs.find(x => x.z === z) : null;
  const zUsadas = [...new Set((ses.bloques || []).map(b => b.z))];
  return `<h1>${ses.i} ${ses.n}</h1><div class="sub">${ses.modo || ''}</div>
  ${zUsadas.length ? `<div class="card"><h2>Zonas</h2>${zUsadas.map(z => { const Z = zona(z), N = L.ZONAS.find(x => x[0] === z);
    return `<div class="sub">${Z ? `Z${z} · ${Z.de}–${Z.a} lpm · ${Z.t}` : `Z${z} · ${N[4]}`}</div>`; }).join('')}</div>` : ''}
  ${ses.items ? `<div class="card"><ul class="lista">${ses.items.map(i => `<li>${i}</li>`).join('')}</ul></div>` : ''}
  ${ses.bloques ? `<div class="card"><h2>Bloques</h2>${ses.bloques.map((b, i) => `<div class="${i === a.paso ? '' : 'sub'}" style="padding:3px 0;${i === a.paso ? 'color:var(--ac);font-weight:700' : ''}">${b.txt} · ${mmss(b.seg)} · Z${b.z}</div>`).join('')}
    <button class="btn" data-act="secuencia">▶ Iniciar</button></div>`
    : `<button class="btn sec" data-act="movilidad">⏱ Iniciar 25:00</button>`}
  <div class="card"><h2>Al terminar</h2>
    <div class="fila sub">Minutos <input class="campo" id="cMin" inputmode="numeric" value="${L.minSesion(ses)}" style="width:70px">
    FC promedio <input class="campo" id="cFc" inputmode="numeric" placeholder="opcional" style="width:90px">
    RPE <select id="cRpe" style="width:auto">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option ${n === 7 ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
  <button class="btn" data-act="terminarCardio">Terminar y guardar</button>
  <button class="btn sec" data-act="cancelar">Descartar sesión</button>`;
}

const chip = (act, v, txt, sel) => `<button data-act="${act}" data-v="${v}" class="${sel ? 'sel' : ''}">${txt}</button>`;
function vistaMeta() {
  const m = db.meta, sp = semana();
  const linea = !m ? '' : Array.from({ length: L.estadoMeta(m, m.fecha).total }, (_, s) => {
    const act = sp && !sp.est.fin && sp.est.semana === s;
    return `<div class="sub" style="padding:4px 8px;border-left:3px solid ${act ? 'var(--ac)' : 'transparent'};${act ? 'color:var(--txt);font-weight:700' : ''}">Sem ${s + 1} · ${fechaTxt(L.sumarDias(L.lunes(m.inicio), s * 7), { day: 'numeric', month: 'short' })} · ${L.FASES[L.faseDe(s, L.estadoMeta(m, m.fecha).total)].n}</div>`;
  }).join('');
  return `<div class="card"><h2>🎯 Tu meta</h2>${m ? '' : '<div class="sub">Define una fecha y te armo el plan semana a semana.</div>'}
    <input class="campo" id="mNombre" value="${esc(m?.nombre ?? 'Volver a BJJ')}" aria-label="nombre de la meta">
    <input class="campo" id="mFecha" type="date" value="${m?.fecha ?? L.sumarDias(diaHoy(), 28)}" aria-label="fecha de la meta" style="margin-top:6px">
    <button class="btn" data-act="guardarMeta">Guardar meta</button>
    ${m ? `<div style="margin-top:10px">${linea}</div><button class="mini" style="background:var(--panel2);margin-top:8px" data-act="borrarMeta">Borrar meta</button>` : ''}</div>
  ${m ? cardMetas(sp) + cardDias(sp) : ''}`;
}

function cardMetas(sp) {
  if (sp.est.fin) return '';
  const quedan = new Set(sp.pend.map(x => x.id)), cuenta = fija => { const l = sp.items.filter(x => x.fija === fija); return `${l.filter(x => !quedan.has(x.id)).length}/${l.length}`; };
  const nom = it => { const x = L.sesion(it.tipo, sp.est.fase); return `${x.i} ${x.n}`; };
  return `<div class="card"><h2>Metas de la semana</h2>
    <div class="sub">Fijas ${cuenta(true)} · Variables ${cuenta(false)}</div>
    ${sp.items.map(it => `<div style="padding:3px 0">${quedan.has(it.id) ? '○' : '✓'} ${it.fija ? '⭐ ' : ''}${nom(it)}</div>`).join('')}
    ${sp.sinLugar.length ? `<div class="sub" style="margin-top:6px;color:#f0b429">Sin espacio esta semana: ${sp.sinLugar.map(nom).join(', ')}</div>` : ''}</div>`;
}

function cardDias(sp) {
  if (sp.est.fin) return '';
  const prox = L.estadoMeta(db.meta, L.sumarDias(sp.l, 7)), nuevaFase = !prox.fin && prox.fase !== sp.est.fase;
  const fila = d => `<div ${d.hecho ? '' : `data-act="editar" data-v="${d.fecha}"`} style="padding:5px 0;border-bottom:1px solid var(--panel2);${d.hecho ? '' : 'cursor:pointer'}">${fechaTxt(d.fecha, { weekday: 'short', day: 'numeric' })} · ${d.hecho ? '✓ hecho' : d.ses ? `${d.hora} · ${d.ses.i} ${d.ses.n} · ${d.min} min` : 'libre'}${d.mover ? ' <span class="sub">⇄ mueve el bloque</span>' : ''}${d.elegido ? ' 📌' : ''}${d.deporte ? ` <span class="sub">⚽ ${esc(d.deporte)}</span>` : ''}</div>${editando === d.fecha ? editorDia(d.fecha) : ''}`;
  return `<div class="card"><h2>Días que quedan</h2>${sp.dias.map(fila).join('') || '<div class="sub">No quedan días esta semana.</div>'}
    ${nuevaFase ? `<div class="sub" style="margin-top:8px">Próxima semana: Fase ${L.FASES[prox.fase].n}</div>` : ''}</div>`;
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

// ---------- Nutrición: objetivo → dieta del día; el cuerpo de Inicio es el Pal que reacciona a lo comido ----------
let otra = null; // { k: comida, foto, items: [{t, g}], msg, cargando } mientras se registra "otra cosa"
const comidoHoy = () => { const c = Object.values(db.comidas[diaHoy()] || {});
  return { n: c.length, kcal: c.reduce((a, x) => a + x.kcal, 0), prot: c.reduce((a, x) => a + x.prot, 0) }; };
const formOtra = () => `<div class="card">
  ${otra.foto ? `<img class="plato" src="${otra.foto}" alt="Foto del plato">` : ''}
  <label class="btn sec" style="text-align:center">📷 ${otra.foto ? 'Cambiar foto' : 'Sacar foto del plato'}<input type="file" accept="image/*" capture="environment" data-act="fotoComida" hidden></label>
  <div class="sub" style="margin-top:8px">¿Qué comiste y cuánto pesaba?</div>
  ${otra.items.map((it, i) => `<div class="fila" style="margin-top:6px"><input class="campo" style="flex:3 1 140px" data-oi="${i}" data-of="t" value="${esc(it.t)}" placeholder="Ej.: cerdo cantonés" aria-label="qué comiste"><input class="campo" style="flex:1 1 70px" data-oi="${i}" data-of="g" value="${esc(it.g)}" inputmode="numeric" placeholder="g" aria-label="gramos"></div>`).join('')}
  <button class="mini" style="background:var(--panel2);margin-top:6px" data-act="masAlim">+ Otro alimento</button>
  <div class="sub" style="margin-top:8px">${IA.clave() ? 'Claude calcula las calorías con la foto y lo que escribas. Si ya las sabes, anótalas:' : 'Anota las calorías y la proteína (o conecta Claude en ☰ para que las calcule):'}</div>
  <div class="fila" style="margin-top:6px"><input class="campo" id="oKcal" inputmode="numeric" placeholder="kcal" aria-label="kcal"><input class="campo" id="oProt" inputmode="numeric" placeholder="proteína g" aria-label="proteína"></div>
  ${otra.msg ? `<div style="margin-top:8px;color:#f0b429">${esc(otra.msg)}</div>` : ''}
  <div class="fila" style="margin-top:8px"><button class="mini" data-act="guardarOtra" data-v="${otra.k}" ${otra.cargando ? 'disabled' : ''}>${otra.cargando ? 'Analizando…' : 'Guardar'}</button><button class="mini" style="background:var(--panel2)" data-act="cancelarOtra">Cancelar</button></div></div>`;
// Foto chica (480 px, JPEG) para que quepa en localStorage.
const achicar = f => new Promise((ok, mal) => { const im = new Image(), u = URL.createObjectURL(f);
  im.onload = () => { const e = Math.min(1, 480 / im.width), c = Object.assign(document.createElement('canvas'), { width: im.width * e, height: im.height * e });
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', .6)); };
  im.onerror = mal; im.src = u; });
const miles = n => Math.round(n).toLocaleString('es-CL');
const TIPO_DIA = { descanso: 'Día de descanso', movilidad: 'Día de movilidad', z2: 'Día de cardio Z2', fuerza: 'Día de fuerza', intervalos: 'Día de intervalos', rounds: 'Día de rounds', deporte: 'Día de partido' };

function vistaNutricion() {
  const p = db.perfil, hp = diaPlan(diaHoy()), d = nutDe(hp), hoy = db.comidas[diaHoy()] || {};
  const campo = (c, t) => `<label class="sub" style="flex:1 1 90px">${t}<input class="campo" inputmode="decimal" data-perfil="${c}" value="${esc(p[c] ?? '')}"></label>`;
  const objetivo = `<div class="card"><h2>Tu objetivo</h2>
    <div class="fila chips">${Object.entries(L.OBJETIVOS).map(([k, O]) => chip('objetivo', k, `${O.i} ${O.n}`, p.objetivo === k)).join('')}</div>
    <div class="fila" style="margin-top:8px">${campo('pesoMeta', 'Peso meta (kg)')}</div>
    ${d?.kcal && p.objetivo !== 'mantener' ? (() => { const v = L.kgSemana(p), falta = +p.pesoMeta ? p.pesoMeta - p.peso : 0;
      return `<div class="sub" style="margin-top:8px">Ritmo esperado: ${v > 0 ? '+' : ''}${String(v).replace('.', ',')} kg por semana${falta && Math.sign(falta) === Math.sign(v) ? ` · llegas a ${esc(p.pesoMeta)} kg en ~${Math.ceil(falta / v)} semanas` : ''}.</div>`; })() : ''}</div>`;
  if (!d?.kcal) return `<h1>🍽️ Nutrición</h1>
    <div class="card" style="text-align:center">${silueta({ cara: 0, nivel: 0 })}<div style="margin-top:8px">Soy tu Pal. Completa tus datos en ☰ (arriba a la derecha), elige tu objetivo y te armo la dieta de cada día.</div></div>${objetivo}`;
  const c = comidoHoy(), a = L.animoPal(d, c, new Date().getHours()), m = L.menu(d, diaHoy(), db.platos[diaHoy()]);
  const barra = (t, v, meta, u, col) => `<div class="sub" style="margin-top:6px">${t} · <b style="color:var(--txt)">${miles(v)}</b> / ${miles(meta)} ${u}</div>
    <div class="barra" style="margin:3px 0"><i style="width:${Math.min(100, v / meta * 100)}%;background:${v > meta * 1.15 ? '#f0b429' : col}"></i></div>`;
  const comida = x => { const r = hoy[x.k], P = L.PLATOS[x.plato];
    return `<div class="card bloque ${r ? 'ok' : ''}"><h3>${x.nom}${x.k === 'colacion' && hp?.ses ? ' · antes o después de entrenar' : ''}</h3>
    <img class="plato" src="img/platos/${x.plato}.jpg" alt="${P.n}" loading="lazy"><b>${P.n}</b>
    <ul class="lista">${x.items.map(i => `<li>${i.txt}</li>`).join('')}<li>Verduras a gusto</li></ul>
    <div class="sub">${x.kcal} kcal · P ${x.prot} g · C ${x.cho} g · G ${x.gra} g</div>
    <details><summary>Preparación</summary><ol class="lista">${P.pasos.map(t => `<li>${t}</li>`).join('')}</ol>
      <div class="sub" style="font-size:11px">Foto: <a href="https://commons.wikimedia.org/wiki/File:${encodeURI(P.cr[2])}" target="_blank" rel="noopener">${P.cr[0]}</a> · ${P.cr[1]}</div></details>
    ${r ? '' : `<details><summary>¿Te falta algo? Otras opciones</summary>${x.alt.map(o => `<button class="alt" data-act="plato" data-k="${x.k}" data-v="${o}">
      <img src="img/platos/${o}.jpg" alt="" loading="lazy"><span>${L.PLATOS[o].n}<small class="sub">${L.PLATOS[o].ing.flat().map(i => L.ALIMENTOS[i][0]).join(', ')}</small></span></button>`).join('')}</details>`}
    ${r ? `${r.foto ? `<img class="plato" src="${r.foto}" alt="Foto de lo que comí">` : ''}<div class="fila" style="margin-top:6px"><span>✓ ${r.otra ? `${r.txt ? esc(r.txt) + ': ' : 'Otra cosa: '}${r.kcal} kcal, ${r.prot} g proteína` : 'Comí esto'}</span>${r.nota ? `<span class="sub" style="flex-basis:100%">${esc(r.nota)}</span>` : ''}<span></span><button class="mini" style="background:var(--panel2)" data-act="comida" data-v="${x.k}">Deshacer</button></div>`
      : otra?.k === x.k ? formOtra()
      : `<div class="fila" style="margin-top:6px"><button class="mini" data-act="comida" data-v="${x.k}">✓ Comí esto</button><button class="mini" style="background:var(--panel2)" data-act="otra" data-v="${x.k}">Comí otra cosa</button></div>`}</div>`; };
  const pesos = db.pesos.slice(-5).reverse();
  return `<h1>🍽️ Nutrición</h1>
  <div class="card"><div class="fila" style="flex-wrap:nowrap;align-items:flex-start">
    <div style="flex:0 0 110px">${silueta({ cara: a.cara, nivel: Math.min(1, c.prot / d.prot) })}</div>
    <div style="flex:1"><div style="background:var(--panel2);border-radius:12px;padding:10px;font-weight:600">${a.msg}</div>
      ${barra('Calorías', c.kcal, d.kcal, 'kcal', 'var(--ok)')}${barra('Proteína', c.prot, d.prot, 'g', 'var(--az)')}</div></div></div>
  <div class="card"><h2>Dieta de hoy</h2><div class="sub">${TIPO_DIA[tipoDiaDe(hp)]} · ${L.OBJETIVOS[p.objetivo].i} ${L.OBJETIVOS[p.objetivo].n}</div>
    <div class="fila" style="justify-content:space-around;text-align:center;margin-top:8px">${[[miles(d.kcal), 'kcal'], [d.prot + ' g', 'proteína'], [d.cho + ' g', 'carbohidrato'], [d.gra + ' g', 'grasa']].map(([v, t]) => `<div><div style="font-size:20px;font-weight:700">${v}</div><div class="sub">${t}</div></div>`).join('')}</div>
    <div class="sub" style="margin-top:8px">💧 Agua ${String(d.agua).replace('.', ',')} L · ${d.tip}</div></div>
  ${m.map(comida).join('')}
  <div class="card"><h2>Peso</h2><div class="fila"><input class="campo" id="pesoHoy" inputmode="decimal" placeholder="kg de hoy" aria-label="peso de hoy"><button class="mini" data-act="pesar">Registrar</button></div>
    ${pesos.map(x => `<div class="sub">${fechaTxt(x.fecha, { day: 'numeric', month: 'short' })} · ${String(x.kg).replace('.', ',')} kg</div>`).join('')}</div>
  ${objetivo}`;
}

const ICONO = { z2: '🫁', intervalos: '⏱️', rounds: '🥋', movilidad: '🧘' };
// ---------- panel lateral: datos personales y conexiones ----------
function vistaLado() {
  const p = db.perfil, zs = L.zonas(p), conClave = !!IA.clave();
  const campo = (c, t, u) => `<label class="sub" style="flex:1 1 120px">${t}<input class="campo" inputmode="decimal" data-perfil="${c}" value="${esc(p[c] ?? '')}" placeholder="${u}"></label>`;
  return `<div class="fila" style="justify-content:space-between"><h1 style="margin:0">Mis datos</h1><button class="mini" style="background:var(--panel2)" data-act="lado" aria-label="Cerrar">✕</button></div>
  <div class="card" style="margin-top:12px"><div class="fila">${campo('edad', 'Edad', 'años')}${campo('peso', 'Peso', 'kg')}${campo('altura', 'Estatura', 'cm')}${campo('fcRep', 'FC en reposo', 'lpm')}
    <label class="sub" style="flex:1 1 120px">Sexo<select data-perfil="sexo"><option value="h">Hombre</option><option value="m" ${p.sexo === 'm' ? 'selected' : ''}>Mujer</option></select></label></div>
    <div style="margin-top:10px">FC máxima: <b>${p.edad ? L.fcMax(p) + ' lpm' : '—'}</b> <span class="sub">(estimada por la edad)</span></div>
    ${zs ? `<table style="width:100%;margin-top:8px;font-size:14px;border-collapse:collapse">${zs.map(z => `<tr><td>Z${z.z}</td><td>${z.n}</td><td>${z.de}–${z.a} lpm</td></tr>`).join('')}</table>`
      : '<div class="sub" style="margin-top:6px">Con edad y FC en reposo calculo tus zonas de entrenamiento.</div>'}
    <div class="sub" style="margin-top:8px">FC en reposo: mídela al despertar, acostado, 3 días seguidos.</div></div>
  <div class="card"><h2>🤖 Claude</h2>
    ${conClave ? `<div>✓ Conectado: lee tus fotos y comidas y responde tus preguntas.</div><button class="mini" style="background:var(--panel2);margin-top:6px" data-act="claveClaude">Desconectar</button>`
      : `<div class="sub">Pega tu clave de API de Claude (console.anthropic.com → API Keys). Queda guardada solo en este teléfono.</div>
    <div class="fila" style="margin-top:6px"><input class="campo" id="claveIA" type="password" autocomplete="off" placeholder="sk-ant-…" aria-label="clave de API"><button class="mini" data-act="claveClaude">Conectar</button></div>`}
    ${conClave ? `<textarea class="campo" id="pregIA" rows="3" style="margin-top:10px" placeholder="Pregúntale algo: ¿cómo voy con la proteína esta semana?">${esc(preg?.q ?? '')}</textarea>
    <button class="btn sec" data-act="preguntar" ${preg?.cargando ? 'disabled' : ''}>${preg?.cargando ? 'Pensando…' : 'Preguntar'}</button>
    ${preg?.a ? `<div style="margin-top:8px;white-space:pre-wrap">${esc(preg.a)}</div>` : ''}` : ''}</div>
  <div class="card"><h2>📅 Google Calendar</h2>
    <input class="campo" id="calUrl" type="url" placeholder="Enlace del Apps Script (…/exec?token=…)" value="${esc(db.calUrl ?? '')}" aria-label="enlace del calendario">
    <button class="btn sec" data-act="calendario">📅 Leer mi Google Calendar</button>
    <div class="sub" style="margin-top:6px">Todo evento de tu calendario es fijo salvo el bloque 'Ejercicio': la app lo mueve al confirmar cada día.</div>
    ${calMsg ? `<div style="margin-top:8px;color:#f0b429">${esc(calMsg)}</div>` : ''}
    ${db.cal.leido ? `<div class="sub" style="margin-top:8px">Leído: ${fechaTxt(db.cal.leido, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>` : ''}</div>`;
}
// Lo que Claude ve al preguntarle: datos de la app sin fotos.
function datosIA() {
  const h = diaHoy(), hp = diaPlan(h);
  const comidas = Object.fromEntries(Object.entries(db.comidas).slice(-7).map(([f, d]) => [f, Object.fromEntries(Object.entries(d).map(([k, c]) => [k, { kcal: c.kcal, prot: c.prot, txt: c.txt }]))]));
  return { hoy: h, perfil: db.perfil, meta: db.meta, planHoy: hp?.ses ? { sesion: hp.ses.n, hora: hp.hora, min: hp.min, hecho: hp.hecho } : null,
    nutricionHoy: nutDe(hp), comidas, pesos: db.pesos.slice(-10), actividad: db.actividad.slice(-15),
    sesiones: db.sesiones.slice(-10).map(x => ({ fecha: x.fecha, tipo: x.tipo, grupos: x.grupos, min: x.min })) };
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
    <b>${new Date(s.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</b> · ${s.tipo && s.tipo !== 'fuerza' ? ICONO[s.tipo] ?? '' : (s.grupos || []).map(g => L.GRUPOS[g]?.icono ?? '').join(' ')}
    <span class="sub">· ${esc(s.duracionMin)} min${s.tipo && s.tipo !== 'fuerza' ? '' : ` · ${s.series.length} series`}${s.rpe ? ` · RPE ${esc(s.rpe)}` : ''}${s.fcProm ? ` · ${esc(s.fcProm)} lpm` : ''}${s.abs ? ' · abs' : ''}${s.clima ? ' · ' + esc(s.clima.txt) : ''}</span></div>`).join('') || '<div class="sub">Todavía no hay sesiones.</div>'}</div>
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
  $('#app').innerHTML = tab === 'inicio' ? vistaInicio() : tab === 'avance' ? vistaAvance() : tab === 'nutricion' ? vistaNutricion()
    : enCurso ? (db.actual.tipo ? vistaCardio() : vistaEntreno()) : vistaHoy();
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('sel', b.dataset.tab === tab));
  $('#lado').classList.toggle('on', lado); $('#velo').classList.toggle('on', lado);
  if (lado) $('#lado').innerHTML = vistaLado();
}

// ---------- timer de descanso (por hora de término: sigue bien si la pantalla se bloquea) ----------
let tFin = 0, tInt = null, tCb = null;
function timer(seg, txt, alTerminar) {
  tCb = alTerminar || null;
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
  if (tCb) { const cb = tCb; tCb = null; navigator.vibrate?.([300, 120, 300]); pitido(); cb(); return; }
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

// ---------- Google Calendar vía Apps Script propio (apps-script/Calendario.gs) ----------
// db.calUrl = URL /exec del script con ?token=…; vive solo en este teléfono, nunca en el repo.
async function leerCalendario(silencioso = false) {
  if (!db.calUrl) { calMsg = 'Pega primero el enlace de tu Apps Script (ver apps-script/Calendario.gs).'; render(); return; }
  try {
    if (!silencioso) { calMsg = 'Leyendo el calendario…'; render(); }
    const l = L.lunes(new Date()), u = new URL(db.calUrl);
    u.searchParams.set('desde', new Date(l + 'T00:00').toISOString());
    u.searchParams.set('hasta', new Date(L.sumarDias(l, 14) + 'T00:00').toISOString());
    const j = await (await fetch(u)).json();
    if (j.error) throw new Error(j.error === 'token' ? 'el token no coincide con el del script.' : j.error);
    db.cal = { leido: new Date().toISOString(), ev: j.ev }; calMsg = ''; guardar();
  } catch (e) { calMsg = `No se pudo leer el calendario: ${e.message}`; }
  render();
}

// Mueve (o crea) el bloque 'Ejercicio' de un día; actualiza db.cal.ev sin releer todo el calendario.
async function moverBloque(f, hora, min) {
  calMsg = 'Moviendo el bloque…'; render();
  try {
    const ini = new Date(L.aMs(f, hora)), fin = new Date(+ini + min * 6e4), u = new URL(db.calUrl);
    u.searchParams.set('accion', 'mover');
    u.searchParams.set('desde', new Date(f + 'T00:00').toISOString());
    u.searchParams.set('hasta', new Date(L.sumarDias(f, 1) + 'T00:00').toISOString());
    u.searchParams.set('ini', ini.toISOString());
    u.searchParams.set('fin', fin.toISOString());
    let j; try { j = await (await fetch(u)).json(); } catch { throw new Error('el script falló; revisa que tenga el servicio Calendar API agregado (Servicios +).'); }
    if (j.error) throw new Error(j.error === 'token' ? 'el token no coincide con el del script.' : j.error);
    // Una implementación anterior a "mover" ignora la acción y devuelve la lista de eventos: no es un éxito.
    if (!j.ok) throw new Error('el script publicado es una versión antigua. En script.google.com: Implementar → Gestionar implementaciones → editar → Nueva versión.');
    const b = db.cal.ev.find(e => L.esBloque(e.t || '') && L.iso(e.ini) === f);
    if (b) Object.assign(b, { ini: ini.toISOString(), fin: fin.toISOString() });
    else db.cal.ev.push({ t: 'Ejercicio', ini: ini.toISOString(), fin: fin.toISOString() });
    calMsg = b ? `Bloque movido a ${hora}` : `Bloque creado a las ${hora}`;
  } catch (e) { calMsg = `No se pudo mover el bloque: ${e.message}`; }
  guardar(); render();
}

// La meta de proteína de Metas de hoy se marca sola al llegar con lo registrado.
function registrarComida() {
  const h = diaHoy(), d = nutDe(diaPlan(h));
  db.basicos[h] = { ...db.basicos[h], prot: comidoHoy().prot >= d.prot };
  guardar(); render();
}

const acciones = {
  tab: el => { tab = el.dataset.tab; render(); scrollTo(0, 0); },
  min: el => { form.min = +el.dataset.v; form.factor = 1; form.plan = null; form.item = null; render(); },
  grupo: el => { const g = el.dataset.v; form.grupos = form.grupos.includes(g) ? form.grupos.filter(x => x !== g) : [...form.grupos, g]; form.factor = 1; form.plan = null; form.item = null; render(); },
  musculo: el => { musculo = musculo === el.dataset.v ? null : el.dataset.v; render(); },
  basico: el => { const d = diaHoy(); db.basicos[d] = { ...db.basicos[d], [el.dataset.v]: el.checked }; guardar(); render(); },
  entrenarGrupo: el => { form.grupos = [el.dataset.v]; tab = 'hoy'; render(); scrollTo(0, 0); },
  empezar: () => {
    const plan = L.armarRutina(minElegido(), form.grupos, form.factor ?? 1);
    const ultAbs = [...db.sesiones].reverse().flatMap(s => s.series).find(x => x.ex === L.ABS[0].id);
    db.actual = {
      inicio: new Date().toISOString(), min: minElegido(), grupos: [...form.grupos], abs: plan.conAbs, absKg: ultAbs?.kg ?? 10,
      plan: form.plan, item: form.item, factor: form.factor ?? 1,
      clima: clima && !clima.error ? { txt: clima.txt, lluvia: clima.lluvia } : null,
      ej: plan.ej.map(e => ({ ...e, kgSug: L.sugerirKg(db.sesiones, e) })), hechos: {}, inp: {}, cal: false, elo: false,
    };
    guardar(); pantallaEncendida(); render(); scrollTo(0, 0);
  },
  planEmpezar: () => {
    const d = diaPlan(diaHoy()), ses = d?.ses;
    if (!ses) return;
    tab = 'hoy';
    if (ses.tipo === 'fuerza') { form = { min: ses.min, grupos: [...ses.grupos], factor: ses.factor, plan: d.fecha, item: d.item.id }; render(); $('#rutina')?.scrollIntoView(); return; }
    db.actual = { tipo: ses.tipo, ses, inicio: new Date().toISOString(), plan: d.fecha, item: d.item.id, paso: -1 };
    guardar(); pantallaEncendida(); render(); scrollTo(0, 0);
  },
  actividad: () => {
    const min = +$('#actMin').value || 0, h = diaHoy();
    db.actividad.push({ fecha: h, tipo: $('#actTipo').value, min });
    if (min >= 15) db.basicos[h] = { ...db.basicos[h], mov: true };
    guardar(); render();
  },
  secuencia: () => {
    const bs = db.actual.ses.bloques, z = L.zonas(db.perfil);
    const paso = i => {
      if (i >= bs.length) { db.actual.paso = -1; guardar(); $('#timer').classList.remove('on'); render(); return; }
      const b = bs[i], Z = z?.find(x => x.z === b.z);
      db.actual.paso = i; guardar(); render();
      timer(b.seg, `${b.txt} · Z${b.z}${Z ? ` ${Z.de}–${Z.a} lpm` : ''}`, () => paso(i + 1));
    };
    paso(0);
  },
  movilidad: () => timer(1500, 'Movilidad + cuello'),
  terminarCardio: () => {
    const a = db.actual, v = id => $(id).value;
    db.sesiones.push({ fecha: a.inicio, tipo: a.tipo, n: a.ses.n, grupos: [], series: [], abs: false, min: L.minSesion(a.ses),
      duracionMin: +v('#cMin') || L.minSesion(a.ses), fcProm: +v('#cFc') || null, rpe: +v('#cRpe'), plan: a.plan, item: a.item });
    db.basicos[diaHoy()] = { ...db.basicos[diaHoy()], mov: true };
    db.actual = null; tab = 'avance';
    wake?.release(); guardar(); render(); scrollTo(0, 0);
  },
  guardarMeta: () => {
    const fecha = $('#mFecha').value;
    if (!fecha || fecha < diaHoy()) { calMsg = ''; alert('Elige una fecha futura para la meta.'); return; }
    db.meta = { nombre: $('#mNombre').value.trim() || 'Volver a BJJ', inicio: db.meta?.inicio ?? diaHoy(), fecha };
    guardar(); render();
  },
  borrarMeta: () => { if (confirm('¿Borrar la meta y su plan?')) { db.meta = null; guardar(); render(); } },
  editar: el => { const f = el.dataset.v; editando = editando === f ? null : f; delete edit[f]; calMsg = ''; render(); },
  edHueco: el => { const f = el.dataset.f; edit[f] = { ...edit[f], hora: el.dataset.v }; render(); },
  edMin: el => { const f = el.dataset.f; edit[f] = { ...edit[f], min: +el.dataset.v }; render(); },
  soltarDia: el => { const f = el.dataset.v; delete db.dias[f]; delete edit[f]; guardar(); render(); },
  confirmarDia: el => {
    const f = el.dataset.v, c = valoresEd(f), it = $('#edItem' + f)?.value, hr = $('#edHora' + f)?.value;
    db.dias[f] = { item: it || c.item, hora: hr || c.hora, min: c.min };
    delete edit[f]; if (editando === f) editando = null; calMsg = '';
    guardar();
    if (db.dias[f].item !== 'libre' && db.calUrl) moverBloque(f, db.dias[f].hora, db.dias[f].min); else render();
  },
  calendario: () => leerCalendario(),
  objetivo: el => { db.perfil.objetivo = el.dataset.v; guardar(); render(); },
  plato: el => { const h = diaHoy(); (db.platos[h] = db.platos[h] || {})[el.dataset.k] = el.dataset.v; guardar(); render(); },
  otra: el => { otra = { k: el.dataset.v, foto: null, items: [{ t: '', g: '' }] }; render(); },
  masAlim: () => { otra.items.push({ t: '', g: '' }); render(); },
  anotarComida: () => {
    // La comida que toca por la hora; si ya está anotada, la siguiente libre.
    const hecho = db.comidas[diaHoy()] || {}, orden = L.COMIDAS.map(c => c[0]), hr = new Date().getHours();
    const i = hr < 11 ? 0 : hr < 16 ? 1 : hr < 19 ? 2 : 3, k = [...orden.slice(i), ...orden.slice(0, i)].find(x => !hecho[x]);
    tab = 'nutricion'; otra = k ? { k, foto: null, items: [{ t: '', g: '' }] } : null; render();
    (k && $('[data-act=fotoComida]') || $('#app')).closest('.card')?.scrollIntoView({ block: 'center' });
  },
  lado: () => { lado = !lado; render(); },
  claveClaude: () => { IA.guardarClave(IA.clave() ? '' : $('#claveIA').value.trim()); preg = null; render(); },
  preguntar: async () => {
    const q = $('#pregIA').value.trim();
    if (!q) return;
    preg = { q, cargando: true }; render();
    try { preg.a = await IA.preguntar(q, datosIA()); } catch (e) { preg.a = 'No se pudo: ' + e.message; }
    preg.cargando = false; render();
  },
  cancelarOtra: () => { otra = null; render(); },
  comida: el => {
    const k = el.dataset.v, h = diaHoy(), dia = db.comidas[h] = db.comidas[h] || {};
    if (dia[k]) delete dia[k];
    else { const x = L.menu(nutDe(diaPlan(h)), h, db.platos[h]).find(x => x.k === k); dia[k] = { kcal: x.kcal, prot: x.prot }; }
    registrarComida();
  },
  guardarOtra: async el => {
    const h = diaHoy(), k = el.dataset.v, man = +$('#oKcal').value || 0, manP = +$('#oProt').value || 0;
    const txt = otra.items.filter(x => x.t.trim()).map(x => `${x.t.trim()}${+x.g ? ` ${+x.g} g` : ''}`).join(', ');
    let reg;
    if (man) reg = { kcal: man, prot: manP, txt };
    else if (!IA.clave()) { otra.msg = 'Anota las kcal o conecta Claude en ☰.'; return render(); }
    else if (!txt && !otra.foto) { otra.msg = 'Saca una foto o escribe qué comiste.'; return render(); }
    else {
      otra.cargando = true; otra.msg = ''; render();
      try { const r = await IA.estimarComida(otra.items, otra.foto); reg = { kcal: Math.round(r.kcal), prot: Math.round(r.prot), txt: r.comida, nota: r.nota }; }
      catch (e) { otra.cargando = false; otra.msg = 'No se pudo analizar: ' + e.message; return render(); }
    }
    (db.comidas[h] = db.comidas[h] || {})[k] = { ...reg, otra: true, foto: otra.foto };
    // Las fotos pesan: solo se guardan las de la última semana.
    const corte = L.sumarDias(h, -7);
    Object.entries(db.comidas).forEach(([f, d]) => f < corte && Object.values(d).forEach(c => delete c.foto));
    try { guardar(); } catch { delete db.comidas[h][k].foto; }
    otra = null; registrarComida();
  },
  pesar: () => {
    const kg = +String($('#pesoHoy').value).replace(',', '.');
    if (!(kg > 20 && kg < 300)) return;
    db.pesos = db.pesos.filter(x => x.fecha !== diaHoy()).concat({ fecha: diaHoy(), kg });
    db.perfil.peso = kg; guardar(); render();
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
      fecha: a.inicio, tipo: 'fuerza', plan: a.plan, item: a.item, factor: a.factor, grupos: a.grupos, min: a.min, duracionMin: Math.round((Date.now() - new Date(a.inicio)) / 60000),
      abs: Object.keys(a.hechos).some(k => k.startsWith('abs:')), clima: a.clima, series,
    });
    db.basicos[diaHoy()] = { ...db.basicos[diaHoy()], mov: true };
    db.actual = null; form = { min: null, grupos: [], factor: 1, plan: null, item: null }; tab = 'avance';
    wake?.release(); guardar(); render(); scrollTo(0, 0);
  },
  cancelar: () => { if (confirm('¿Descartar la sesión en curso? Se pierden las series marcadas.')) { db.actual = null; wake?.release(); guardar(); render(); } },
  't-15': () => { tFin -= 15000; tick(); },
  't+15': () => { tFin = Math.max(tFin, Date.now()) + 15000; clearInterval(tInt); tInt = setInterval(tick, 250); tick(); },
  tfin: () => { tCb = null; clearInterval(tInt); $('#timer').classList.remove('on'); },
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
  const c = ev.target.dataset.perfil;
  if (c) { db.perfil[c] = ev.target.tagName === 'SELECT' ? ev.target.value : +String(ev.target.value).replace(',', '.') || null; guardar(); return; }
  if (ev.target.dataset.oi) { otra.items[ev.target.dataset.oi][ev.target.dataset.of] = ev.target.value; return; }
  if (ev.target.id === 'calUrl') { db.calUrl = ev.target.value.trim() || null; guardar(); return; }
  const { k, f } = ev.target.dataset;
  if (!k || !db.actual) return;
  if (k === 'abskg') db.actual.absKg = ev.target.value;
  else db.actual.inp[k] = { ...db.actual.inp[k], [f]: ev.target.value };
  guardar();
});

document.addEventListener('change', async ev => {
  const act = ev.target.dataset.act;
  if (ev.target.dataset.perfil) render();
  if (ev.target.dataset.edit) { const f = ev.target.dataset.f; edit[f] = { ...edit[f], [ev.target.dataset.edit]: ev.target.value }; render(); }
  if (act === 'exsel') { exSel = ev.target.value; render(); }
  if (act === 'fotoComida' && ev.target.files[0]) { try { otra.foto = await achicar(ev.target.files[0]); } catch {} render(); }
  if (act === 'importar' && ev.target.files[0]) {
    try {
      const d = JSON.parse(await ev.target.files[0].text());
      if (!Array.isArray(d.sesiones) || !d.sesiones.every(s => s.fecha && Array.isArray(s.series))) throw new Error();
      if (confirm(`¿Reemplazar ${db.sesiones.length} sesiones por las ${d.sesiones.length} del respaldo?`)) { db = { ...defaults(), ...d, sesiones: d.sesiones, actual: null }; guardar(); render(); }
    } catch { alert('El archivo no es un respaldo válido de BaM.'); }
  }
});

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { pantallaEncendida(); if ($('#timer.on')) tick(); } });
setInterval(() => { const r = $('#reloj'); if (r) r.textContent = transcurrido(); }, 15000);

render();
pantallaEncendida();
obtenerClima().then(c => { clima = c; }).catch(() => { clima = { error: true }; }).finally(() => tab !== 'avance' && !db.actual && render());
if (db.calUrl && !db.actual && Date.now() - new Date(db.cal.leido || 0) > 6 * 36e5) leerCalendario(true);
navigator.serviceWorker?.register('sw.js');
