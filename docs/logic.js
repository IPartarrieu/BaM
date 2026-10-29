// Lógica pura (sin DOM) para poder probarla en Node: node tests/logic.test.mjs

// Ejercicios de la rutina de Notion (🥋 Deporte). s=series, r=reps, d=descanso (s),
// w=trabajo estimado por serie (s), kg=carga inicial (null = peso corporal).
// Core: rutina fija de abdominales del usuario, 3 rondas con el mismo disco (solo cambia el peso).
export const ABS = [
  { id: 'abs_disco', n: 'Abdominal alzando el disco sobre la cabeza', r: '20', m: ['abdominales', 'deltoides'] },
  { id: 'abs_45', n: 'Piernas 45° y torso 45°: disco de lado a lado', r: '20 por lado', m: ['oblicuos', 'abdominales'] },
  { id: 'abs_plancha', n: 'Plancha: brazos extendidos ↔ codos', r: '20', m: ['abdominales', 'triceps', 'deltoides'] },
  { id: 'abs_halo', n: 'Disco alrededor de la cabeza', r: '20 por lado', m: ['deltoides', 'oblicuos', 'abdominales'] },
];
export const GRUPOS = {
  piernas: { nombre: 'Piernas y cadera', icono: '🦵', ej: [
    { id: 'pm_hex', n: 'Peso muerto barra hexagonal', s: 4, r: '5', d: 150, kg: 60, m: ['gluteos', 'isquios', 'cuadriceps', 'lumbares', 'trapecio', 'antebrazos'] },
    { id: 'hack', n: 'Sentadilla en máquina Hack', s: 3, r: '8', d: 90, kg: 60, m: ['cuadriceps', 'gluteos', 'aductores'] },
    { id: 'hip_thrust', n: 'Hip thrust', s: 3, r: '10', d: 90, kg: 60, m: ['gluteos', 'isquios'] },
    { id: 'nordico', n: 'Curl nórdico (o femoral)', s: 3, r: '6', d: 90, kg: null, m: ['isquios', 'gemelos'] },
    { id: 'copenhague', n: 'Plancha Copenhague', s: 3, r: '20 s', x: 'por lado', d: 60, kg: null, w: 50, m: ['aductores', 'oblicuos'] },
  ]},
  espalda: { nombre: 'Espalda y tracción', icono: '🪢', ej: [
    { id: 'jalon', n: 'Jalón al pecho', s: 4, r: '8', d: 90, kg: 45, m: ['dorsales', 'biceps', 'deltoides_post'] },
    { id: 'remo_barra', n: 'Remo con barra', s: 4, r: '8', d: 90, kg: 40, m: ['dorsales', 'trapecio', 'deltoides_post', 'biceps', 'lumbares'] },
    { id: 'face_pull', n: 'Face pull', s: 3, r: '15', d: 60, kg: 15, m: ['deltoides_post', 'trapecio'] },
    { id: 'remo_uni', n: 'Remo unilateral mancuerna', s: 3, r: '10', x: 'por lado', d: 60, kg: 18, w: 60, m: ['dorsales', 'biceps', 'antebrazos'] },
  ]},
  empuje: { nombre: 'Pecho y hombros', icono: '🛡️', ej: [
    { id: 'press_incl', n: 'Press banca inclinado', s: 4, r: '8', d: 120, kg: 40, m: ['pectorales', 'deltoides', 'triceps'] },
    { id: 'militar', n: 'Press militar de pie', s: 3, r: '8', d: 90, kg: 30, m: ['deltoides', 'triceps', 'trapecio'] },
    { id: 'fondos', n: 'Fondos', s: 3, r: '8-12', d: 90, kg: 0, m: ['pectorales', 'triceps', 'deltoides'] },
    { id: 'landmine', n: 'Landmine press con rotación', s: 4, r: '5', x: 'por lado', d: 90, kg: 20, w: 50, m: ['deltoides', 'pectorales', 'oblicuos', 'triceps'] },
  ]},
  brazos: { nombre: 'Brazos y agarre', icono: '✊', ej: [
    { id: 'curl_mart', n: 'Curl martillo', s: 3, r: '12', d: 60, kg: 10, m: ['biceps', 'antebrazos'] },
    { id: 'curl_rev', n: 'Curl reverso', s: 3, r: '12', d: 60, kg: 15, m: ['antebrazos', 'biceps'] },
    { id: 'pinch', n: 'Pinch grip con discos', s: 3, r: '30 s', d: 45, kg: 10, m: ['antebrazos'] },
    { id: 'colgarse', n: 'Colgarse del gi o toalla', s: 3, r: 'máx', d: 60, kg: null, w: 45, m: ['antebrazos', 'dorsales'] },
    { id: 'farmer', n: 'Farmer carry 30 m', s: 4, r: '1', d: 60, kg: 24, m: ['antebrazos', 'trapecio', 'abdominales'] },
  ]},
  core: { nombre: 'Core', icono: '🔥', fija: true, ej: ABS },
  potencia: { nombre: 'Potencia y gas', icono: '⚡', ej: [
    { id: 'swing', n: 'Swing con kettlebell', s: 5, r: '10', d: 60, kg: 16, m: ['gluteos', 'isquios', 'lumbares', 'abdominales'] },
    { id: 'cajon', n: 'Salto al cajón', s: 4, r: '4', d: 90, kg: null, w: 20, m: ['cuadriceps', 'gluteos', 'gemelos'] },
    { id: 'balon_rot', n: 'Lanzamiento rotacional balón medicinal', s: 3, r: '6', x: 'por lado', d: 60, kg: 4, m: ['oblicuos', 'abdominales', 'deltoides'] },
    { id: 'remo_maq', n: 'Remo en máquina 250 m', s: 4, r: '1', d: 90, kg: null, w: 60, m: ['dorsales', 'cuadriceps', 'gluteos', 'biceps'] },
  ]},
};

export const CALENTAMIENTO = ['Círculos de cuello, brazos, cintura y piernas', '90/90 de cadera × 8', 'Estiramiento de espalda', 'Calentamiento de piernas con banda elástica'];
export const ELONGACION = ['Rana (aductores)', '90/90 sostenido por lado', 'Puente de lucha suave', 'Apertura torácica en el suelo', 'Isquios y psoas por lado'];

export const ABS_RONDAS = 3, ABS_DESC_EJ = 5, ABS_DESC_RONDA = 90;
export const ABS_SEG = ABS_RONDAS * (ABS.length * 55 + (ABS.length - 1) * ABS_DESC_EJ) + (ABS_RONDAS - 1) * ABS_DESC_RONDA;
export const FIJO_SEG = 600; // calentamiento 5 min + elongar 5 min
export const CAMBIO_SEG = 150; // montar máquina / cambiar discos; calibrado para que 1 h con abdominales dé 3 ejercicios

// Silueta: músculo → nombre y grupo al que pertenece.
export const MUSCULOS = {
  pectorales: ['Pectorales', 'empuje'], deltoides: ['Deltoides (hombros)', 'empuje'], triceps: ['Tríceps', 'empuje'],
  biceps: ['Bíceps', 'brazos'], antebrazos: ['Antebrazos y agarre', 'brazos'],
  trapecio: ['Trapecio', 'espalda'], dorsales: ['Dorsales', 'espalda'], deltoides_post: ['Deltoide posterior', 'espalda'], lumbares: ['Lumbares', 'espalda'],
  gluteos: ['Glúteos', 'piernas'], cuadriceps: ['Cuádriceps', 'piernas'], isquios: ['Isquiotibiales', 'piernas'], aductores: ['Aductores', 'piernas'], gemelos: ['Gemelos', 'piernas'],
  abdominales: ['Abdominales', 'core'], oblicuos: ['Oblicuos', 'core'],
};

// Ejercicios que trabajan un músculo, con su grupo.
export const ejerciciosDe = musculo => Object.entries(GRUPOS)
  .flatMap(([g, G]) => G.ej.map(e => ({ ...e, g })))
  .filter(e => e.m.includes(musculo));

const costo = (e, s) => s * ((e.w ?? 40) + e.d) + CAMBIO_SEG;

// Core es fijo (rondas de ABS); el resto alterna sus ejercicios y llena el tiempo disponible.
// Si un ejercicio no cabe completo, prueba con menos series (mínimo 2).
// factor: fracción de las series según la fase del plan (base 0,75, descarga 0,6).
export function armarRutina(minutos, grupos, factor = 1) {
  const conAbs = grupos.includes('core');
  let libre = minutos * 60 - FIJO_SEG - (conAbs ? ABS_SEG : 0);
  const listas = grupos.filter(g => !GRUPOS[g].fija).map(g => GRUPOS[g].ej.map(e => ({ ...e, g, s: Math.max(2, Math.round(e.s * factor)) })));
  const orden = [];
  for (let i = 0; listas.some(l => i < l.length); i++) listas.forEach(l => l[i] && orden.push(l[i]));
  const ej = [];
  for (const e of orden) {
    for (let s = e.s; s >= 2; s--) {
      if (costo(e, s) <= libre) { ej.push({ ...e, s }); libre -= costo(e, s); break; }
    }
  }
  return { ej, conAbs, sobraMin: Math.max(0, Math.floor(libre / 60)) };
}

export const tope = r => Math.max(...(String(r).match(/\d+/g) || [0]).map(Number));

// Doble progresión (Notion): si en la última sesión se llegó al tope de reps en todas las series, +2,5 kg.
export function sugerirKg(sesiones, e) {
  for (let i = sesiones.length - 1; i >= 0; i--) {
    const series = sesiones[i].series.filter(x => x.ex === e.id);
    if (!series.length) continue;
    const kg = Math.max(...series.map(x => +x.kg || 0));
    const t = tope(e.r);
    const completo = t > 1 && !/s$/.test(e.r) && series.length >= e.s && series.every(x => +x.reps >= t);
    return completo && e.kg !== null ? kg + 2.5 : kg;
  }
  return e.kg;
}

// 'YYYY-MM-DD' a mediodía local (new Date('YYYY-MM-DD') es UTC y en Chile cae el día anterior).
export const dia = f => typeof f === 'string' && f.length === 10 ? new Date(f + 'T12:00') : new Date(f);
export const iso = d => { d = dia(d); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const sumarDias = (f, n) => { const d = dia(f); d.setDate(d.getDate() + n); return iso(d); };

// Semana de lunes a domingo, identificada por el lunes 'YYYY-MM-DD' (hora local).
export function lunes(fecha) {
  const d = dia(fecha); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return iso(d);
}

export const META = 3;

export function resumenSemana(sesiones, fecha = new Date()) {
  const l = lunes(fecha);
  const ss = sesiones.filter(s => lunes(s.fecha) === l);
  const grupos = new Set(ss.flatMap(s => s.grupos));
  return {
    sesiones: ss.length,
    minutos: ss.reduce((a, s) => a + (s.duracionMin || 0), 0),
    series: ss.reduce((a, s) => a + s.series.length, 0),
    grupos,
    pendientes: Object.keys(GRUPOS).filter(g => !grupos.has(g)),
    lista: ss,
  };
}

// Nivel por grupo, dos ejes 0–1:
//  vol   = series hechas en los últimos 28 días contra 24 (≈ 1 sesión completa del grupo por semana)
//  carga = subida promedio del kg máximo de cada ejercicio respecto a su primer registro; +25 % llena el eje
export const SUBIDA_TOPE = 0.25;
export function niveles(sesiones, fecha = new Date()) {
  const desde = new Date(fecha) - 28 * 864e5;
  const todas = sesiones.flatMap(s => s.series.map(x => ({ ...x, f: new Date(s.fecha) }))).sort((a, b) => a.f - b.f);
  return Object.fromEntries(Object.keys(GRUPOS).map(g => {
    const series = todas.filter(x => x.g === g);
    const vol = Math.min(1, series.filter(x => x.f >= desde).length / 24);
    const subidas = [...new Set(series.map(x => x.ex))].map(ex => {
      const kgs = series.filter(x => x.ex === ex && +x.kg > 0).map(x => +x.kg);
      return kgs.length > 1 ? Math.max(...kgs) / kgs[0] - 1 : null;
    }).filter(v => v !== null);
    const subida = subidas.length ? subidas.reduce((a, b) => a + b, 0) / subidas.length : 0;
    return [g, { vol, subida, carga: Math.min(1, Math.max(0, subida / SUBIDA_TOPE)) }];
  }));
}

// Máximo kg por sesión para un ejercicio: [{fecha, kg}]
export function serieKg(sesiones, exId) {
  return sesiones
    .map(s => ({ fecha: s.fecha, kg: Math.max(-1, ...s.series.filter(x => x.ex === exId).map(x => +x.kg || 0)) }))
    .filter(p => p.kg >= 0);
}

export function logros(sesiones, fecha = new Date()) {
  const r = resumenSemana(sesiones, fecha);
  const previas = sesiones.filter(s => lunes(s.fecha) < lunes(fecha)).flatMap(s => s.series);
  const record = r.lista.some(s => s.series.some(x => {
    const antes = previas.filter(y => y.ex === x.ex).map(y => +y.kg || 0);
    return antes.length > 0 && +x.kg > Math.max(...antes);
  }));
  let racha = 0;
  for (let d = new Date(fecha); resumenSemana(sesiones, d).sesiones >= META; d.setDate(d.getDate() - 7)) racha++;
  return [
    { t: `Meta semanal: ${META} sesiones`, ok: r.sesiones >= META, i: '🎯' },
    { t: `Los ${Object.keys(GRUPOS).length} grupos en la semana`, ok: r.pendientes.length === 0, i: '🔷' },
    { t: 'Récord personal de carga', ok: record, i: '🏆' },
    { t: 'Abdominales 2 veces', ok: r.lista.filter(s => s.abs).length >= 2, i: '🔥' },
    { t: 'Entrenaste un día de lluvia', ok: r.lista.some(s => s.clima?.lluvia), i: '🌧️' },
    { t: '60 series en la semana', ok: r.series >= 60, i: '💪' },
    { t: racha > 1 ? `Racha de ${racha} semanas cumpliendo` : 'Racha: 2 semanas seguidas cumpliendo', ok: racha >= 2, i: '📈' },
  ];
}

// Resumen de la semana anterior (se muestra los lunes) con un mensaje para seguir.
export function resumenAnterior(sesiones, fecha = new Date()) {
  const d = new Date(fecha); d.setDate(d.getDate() - 7);
  const r = resumenSemana(sesiones, d), p = new Date(d); p.setDate(p.getDate() - 7);
  const msg = r.sesiones >= META ? `¡Meta cumplida con ${r.sesiones} sesiones! Mantén el ritmo esta semana.`
    : r.sesiones === 0 ? `Semana sin entrenar. Hoy es buen día para volver: ${META} sesiones y retomas la racha.`
    : `${r.sesiones} de ${META} sesiones: te faltó ${META - r.sesiones}. Esta semana vas por la meta.`;
  return { ...r, antes: resumenSemana(sesiones, p).sesiones, ganados: logros(sesiones, d).filter(l => l.ok), msg };
}

// Códigos WMO de Open-Meteo → etiqueta y minutos sugeridos.
export function interpretarClima(codigo, probLluvia = 0) {
  if (codigo >= 95) return { txt: 'Tormenta', i: '⛈️', lluvia: true, min: 30 };
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) return { txt: 'Nieve', i: '❄️', lluvia: true, min: 45 };
  if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82) || probLluvia >= 60) return { txt: 'Lluvia', i: '🌧️', lluvia: true, min: 45 };
  if (codigo <= 1) return { txt: 'Despejado', i: '☀️', lluvia: false, min: 75 };
  return { txt: codigo >= 45 ? 'Niebla' : 'Nublado', i: '⛅', lluvia: false, min: 60 };
}

// ================= Plan hacia una meta (ver METODOLOGIA.md) =================

// Zonas por reserva de FC (Karvonen); FCmáx de Tanaka si no se conoce la real.
export const ZONAS = [
  [1, .5, .6, 'Recuperación', 'conversación fácil'], [2, .6, .7, 'Base aeróbica', 'frases completas'],
  [3, .7, .8, 'Tempo', 'frases cortas'], [4, .8, .9, 'Umbral · round de lucha', 'pocas palabras'], [5, .9, 1, 'Máximo', 'no puedes hablar'],
];
export const fcMax = p => +p.fcMax || Math.round(208 - 0.7 * p.edad);
export function zonas(p) {
  if (!p?.edad || !p?.fcRep) return null;
  const rep = +p.fcRep, res = fcMax(p) - rep;
  return ZONAS.map(([z, a, b, n, t]) => ({ z, n, t, de: Math.round(rep + a * res), a: Math.round(rep + b * res) }));
}

export const MOVILIDAD = ['Cuello: isometría 4 direcciones · 3 × 10 s', 'Puente de lucha suave adelante y atrás · 2 × 8', 'Escape de cadera (camarón) · 2 largos', 'Levantada técnica · 2 × 5 por lado', 'Rotaciones de cadera (CARs) · 5 por lado', '90/90 con cambio · 2 × 8', 'Apertura torácica · 8 por lado', 'Dislocaciones de hombro con banda · 2 × 10'];
export const ROUND = ['Sprawl × 5', 'Escape de cadera ida y vuelta', 'Swing kettlebell × 10', 'Oso (bear crawl) 10 m', 'Levantada técnica × 4', 'Burpee × 5'];

export const FASES = {
  base: { n: 'Base', factor: .75, B: ['empuje', 'brazos', 'core'], z2: 35,
    obj: 'Adaptar tendones y articulaciones y construir la base aeróbica. Fuerza con 2–3 repeticiones en reserva (RPE 6–7); cardio en Z2.',
    fijas: ['fuerzaA', 'fuerzaB', 'z2'], variables: ['z2', 'movilidad'] },
  construccion: { n: 'Construcción', factor: 1, B: ['empuje', 'brazos', 'potencia'], z2: 40,
    obj: 'Subir la carga (RPE 7–8) y sumar intervalos en Z4 para la potencia aeróbica.',
    fijas: ['fuerzaA', 'fuerzaB', 'intervalos'], variables: ['z2', 'movilidad'] },
  especifica: { n: 'Específica BJJ', factor: .85, B: ['empuje', 'brazos', 'potencia'], z2: 40, rounds: 6,
    obj: 'Simular la lucha: rounds de 5 min de trabajo continuo en Z4–Z5 con 1 min de pausa. La fuerza se mantiene.',
    fijas: ['fuerzaA', 'fuerzaB', 'rounds'], variables: ['z2', 'rounds'] },
  descarga: { n: 'Descarga', factor: .6, B: ['empuje', 'brazos', 'potencia'], z2: 30, rounds: 3,
    obj: 'Bajar el volumen ~40 % y mantener la intensidad para llegar descansado a la meta.',
    fijas: ['fuerzaA', 'rounds'], variables: ['z2', 'movilidad'] },
};

// Fase de la semana s (0 = la del inicio) en un plan de `total` semanas; la última es descarga si hay ≥ 3.
export function faseDe(s, total) {
  if (total >= 3 && s === total - 1) return 'descarga';
  const f = s / Math.max(1, total - (total >= 3 ? 1 : 0));
  return f < 1 / 3 ? 'base' : f < 2 / 3 ? 'construccion' : 'especifica';
}

const semanasEntre = (a, b) => Math.round((dia(lunes(b)) - dia(lunes(a))) / 6048e5);
// meta = { nombre, inicio: 'YYYY-MM-DD', fecha: 'YYYY-MM-DD' }
export function estadoMeta(meta, hoy = new Date()) {
  const total = semanasEntre(meta.inicio, meta.fecha) + 1, s = semanasEntre(meta.inicio, hoy);
  const dias = Math.round((dia(meta.fecha) - dia(iso(hoy))) / 864e5);
  if (dias < 0) return { fin: true, total, dias };
  return { semana: s, total, dias, fase: faseDe(Math.min(s, total - 1), total) };
}

// Bloques de cardio: [{seg, z, txt}] con entrada en calor y vuelta a la calma de 5 min.
const conCalor = b => [{ seg: 300, z: 1, txt: 'Entrada en calor' }, ...b, { seg: 300, z: 1, txt: 'Vuelta a la calma' }];
const series = (n, trab, desc, z, txt) => Array.from({ length: n }, (_, i) => [{ seg: trab, z, txt: `${txt} ${i + 1}/${n}` }, i < n - 1 && { seg: desc, z: 1, txt: 'Pausa' }]).flat().filter(Boolean);
const caben = (min, trab, desc) => Math.floor((min * 60 - 600 + desc) / (trab + desc));
export const segBloques = b => b.reduce((a, x) => a + x.seg, 0);

// Una sesión del plan ajustada a los minutos disponibles.
export function sesion(tipo, fase, min = 60) {
  const F = FASES[fase];
  if (tipo === 'fuerzaA') return { tipo: 'fuerza', i: '🏋️', n: 'Fuerza A · piernas y espalda', min, grupos: ['piernas', 'espalda', 'core'], factor: F.factor, dura: true };
  if (tipo === 'fuerzaB') return { tipo: 'fuerza', i: '🏋️', n: `Fuerza B · empuje, agarre y ${F.B[2] === 'core' ? 'core' : 'potencia'}`, min, grupos: F.B, factor: F.factor, dura: true };
  if (tipo === 'z2') {
    const m = Math.min(F.z2, min);
    return { tipo, i: '🫁', n: 'Cardio base Z2', modo: 'Trote, bici, remo o elíptica', min: m, bloques: [{ seg: m * 60, z: 2, txt: 'Z2 continuo' }] };
  }
  if (tipo === 'intervalos') {
    const n = Math.min(6, caben(min, 180, 120));
    return { tipo, i: '⏱️', n: `Intervalos ${n} × 3 min Z4`, modo: 'Bici, remo o assault bike', dura: true, bloques: conCalor(series(n, 180, 120, 4, 'Intervalo')) };
  }
  if (tipo === 'rounds') {
    const n = Math.min(F.rounds ?? 6, caben(min, 300, 60));
    return { tipo, i: '🥋', n: `Rounds de lucha ${n} × 5 min`, modo: 'Circuito continuo, sin parar dentro del round', items: ROUND, dura: true, bloques: conCalor(series(n, 300, 60, 4, 'Round')) };
  }
  return { tipo: 'movilidad', i: '🧘', n: 'Movilidad + cuello', min: 25, items: MOVILIDAD };
}
// Duración real de cualquier sesión del plan.
export const minSesion = x => x.bloques ? Math.round(segBloques(x.bloques) / 60) : x.min;

// ---------- Metas de la semana: fijas (no se negocian) y variables (si el día da) ----------
// Con deporte en la semana (fútbol, partido…), la sesión intensa fija pasa a Z2 variable: el partido ya es trabajo intermitente.
export function metasSemana(fase, hayDeporte = false) {
  const F = FASES[fase], lista = [...F.fijas.map(t => [t, true]), ...F.variables.map(t => [t, false])], n = {};
  const k = lista.findIndex(([t, f]) => f && (t === 'intervalos' || t === 'rounds'));
  if (hayDeporte && k >= 0) lista[k] = ['z2', false];
  return lista.map(([tipo, fija]) => { n[tipo] = (n[tipo] || 0) + 1; return { id: n[tipo] > 1 ? tipo + n[tipo] : tipo, tipo, fija }; });
}
const cat = t => t.startsWith('fuerza') ? 'fuerza' : t;
// Lo que falta: cada sesión hecha descuenta su meta (por id si salió del plan; si no, por tipo).
export function pendientes(items, hechas) {
  const quedan = [...items];
  for (const s of hechas) {
    let i = quedan.findIndex(x => x.id === s.item);
    if (i < 0) i = quedan.findIndex(x => cat(x.tipo) === (s.tipo || 'fuerza'));
    if (i >= 0) quedan.splice(i, 1);
  }
  return quedan;
}

// ---------- Calendario: el bloque "Ejercicio" se mueve; todo lo demás es fijo ----------
export const RE_ENTRENO = /ejercicio|entren|gym|gimnasio/i, RE_SUAVE = /suave|elong/i, RE_DEPORTE = /f[uú]tbol|partido|pichanga|bjj|jiu|p[aá]del|tenis/i;
export const esBloque = t => RE_ENTRENO.test(t) && !RE_SUAVE.test(t);
export const hhmm = ms => { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
export const aMs = (f, hora) => +dia(`${f}T${hora}`);
// Disponibilidad de un día: bloque de entreno (si hay), huecos libres ≥ 30 min entre `de` y `a` horas
// sin contar el bloque, deporte del día y el evento fijo que choca con el bloque. Hoy parte desde `ahora`.
export function dispDia(eventos, f, { de = 7, a = 22, ahora = null } = {}) {
  const ev = eventos.map(e => ({ t: e.t || '', ini: +dia(e.ini), fin: +dia(e.fin) })).filter(e => iso(e.ini) === f);
  const bloque = ev.find(e => esBloque(e.t)) || null, fijos = ev.filter(e => !esBloque(e.t));
  let t = aMs(f, '00:00') + de * 36e5;
  const fin = aMs(f, '00:00') + a * 36e5, huecos = [];
  if (ahora && iso(ahora) === f) t = Math.max(t, Math.ceil((+ahora + 15 * 6e4) / 9e5) * 9e5);
  for (const [x, y] of [...fijos.map(e => [e.ini, e.fin]).sort((p, q) => p[0] - q[0]), [fin, fin]]) {
    if (Math.min(x, fin) - t >= 30 * 6e4) huecos.push([t, Math.min(x, fin)]);
    t = Math.max(t, y);
  }
  return { bloque, huecos, deporte: ev.find(e => RE_DEPORTE.test(e.t))?.t,
    choque: bloque ? fijos.find(e => e.ini < bloque.fin && e.fin > bloque.ini)?.t : undefined };
}
// Dónde va una sesión de `need` min: en el bloque si cabe libre; si no, en el hueco más cercano a `pref` (ms).
export function ubicar(d, need, pref) {
  const b = d.bloque;
  if (b && (b.fin - b.ini) / 6e4 >= need && d.huecos.some(([x, y]) => x <= b.ini && b.fin <= y)) return { ini: b.ini, min: Math.round((b.fin - b.ini) / 6e4), mover: false };
  let mejor = null;
  for (const [x, y] of d.huecos) {
    if (y - x < need * 6e4) continue;
    const s = Math.min(Math.max(pref, x), y - need * 6e4);
    if (!mejor || Math.abs(s - pref) < Math.abs(mejor - pref)) mejor = s;
  }
  return mejor === null ? null : { ini: mejor, min: need, mover: true };
}
// Hora habitual: la del bloque de entreno más repetido en el calendario (19:30 si no hay ninguno).
export const horaHabitual = eventos => {
  const c = {}; for (const e of eventos.filter(e => esBloque(e.t || ''))) { const h = hhmm(+dia(e.ini)); c[h] = (c[h] || 0) + 1; }
  return Object.keys(c).sort((a, b) => c[b] - c[a])[0] ?? '19:30';
};
const minimo = (tipo, fase) => tipo.startsWith('fuerza') ? 60 : minSesion(sesion(tipo, fase));

// Reparte lo pendiente en los días que quedan. dias: [{fecha, d: dispDia, elegido?: {item, hora, min}, hecho?}].
// Primero lo que el usuario fijó para el día; luego las fijas y después las variables, en el primer día donde quepan,
// sin dos sesiones duras seguidas si hay alternativa. Los días de deporte solo reciben movilidad.
export function distribuir(fase, pend, dias, pref = '19:30') {
  const quedan = [...pend].sort((a, b) => b.fija - a.fija);
  const out = dias.map(x => ({ fecha: x.fecha, deporte: x.d.deporte, choque: x.d.choque, bloque: !!x.d.bloque, hecho: !!x.hecho }));
  const poner = (i, it, u, elegido = false) => Object.assign(out[i], { item: it, ses: sesion(it.tipo, fase, u.min), hora: hhmm(u.ini), min: u.min,
    mover: elegido ? !(x => x && hhmm(x.ini) === hhmm(u.ini) && Math.round((x.fin - x.ini) / 6e4) === u.min)(dias[i].d.bloque) : u.mover, elegido });
  dias.forEach((x, i) => {
    if (!x.elegido || x.hecho) return;
    const k = quedan.findIndex(p => p.id === x.elegido.item);
    if (k >= 0) poner(i, quedan.splice(k, 1)[0], { ini: aMs(x.fecha, x.elegido.hora), min: +x.elegido.min }, true);
    else out[i].libre = true; // el usuario dejó el día libre
  });
  const dura = i => !!out[i]?.ses?.dura;
  for (const it of [...quedan]) {
    const need = minimo(it.tipo, fase);
    const opciones = out.map((o, i) => i).filter(i => !out[i].item && !out[i].hecho && !out[i].libre && (!out[i].deporte || it.tipo === 'movilidad'));
    const sinSeguidas = opciones.filter(i => !sesion(it.tipo, fase).dura || (!dura(i - 1) && !dura(i + 1)));
    for (const i of [...sinSeguidas, ...opciones]) {
      const u = ubicar(dias[i].d, need, aMs(dias[i].fecha, pref));
      if (u) { poner(i, it, u); quedan.splice(quedan.indexOf(it), 1); break; }
    }
  }
  return { dias: out, sinLugar: quedan };
}

// Nutrición del día por kg de peso (ISSN, ACSM): proteína 1,8 g/kg; carbohidrato según la carga; agua 35 ml/kg + 0,6 L/h.
export const CHO = { descanso: 3, movilidad: 3, z2: 4, fuerza: 5, intervalos: 6, rounds: 6, deporte: 6 };
export const TIP = {
  descanso: 'Día liviano: carbohidrato moderado y proteína repartida en 4 comidas.',
  movilidad: 'Día liviano: carbohidrato moderado y proteína repartida en 4 comidas.',
  z2: 'Sesión aeróbica: no requiere nada especial; agua durante.',
  fuerza: 'Antes (1–3 h): comida con carbohidrato y proteína. Después: 20–40 g de proteína en las 2 h siguientes.',
  intervalos: 'Sesión intensa: carbohidrato 1–3 h antes, 400–800 ml de agua por hora y carbohidrato + proteína después.',
  rounds: 'Sesión intensa: carbohidrato 1–3 h antes, 400–800 ml de agua por hora y carbohidrato + proteína después.',
  deporte: 'Día de partido: carbohidrato 1–3 h antes y repón con carbohidrato + proteína al terminar.',
};
export function nutricion(peso, tipo = 'descanso', minEntreno = 0) {
  if (!+peso) return null;
  return { prot: Math.round(peso * 1.8 / 5) * 5, cho: Math.round(peso * CHO[tipo] / 10) * 10,
    agua: Math.round((peso * .035 + minEntreno / 60 * .6) * 4) / 4, tip: TIP[tipo] };
}

// Metas del día. Cuenta para la racha si te moviste y cumpliste al menos 4 de las 6.
export const diaCumplido = b => !!b?.mov && Object.values(b).filter(v => v === true).length >= 4;
export function racha(basicos, hoy = iso(new Date())) {
  let n = 0, f = diaCumplido(basicos[hoy]) ? hoy : sumarDias(hoy, -1); // hoy no corta la racha hasta que termine
  while (diaCumplido(basicos[f])) { n++; f = sumarDias(f, -1); }
  let mejor = 0, run = 0, prev = null;
  for (const d of Object.keys(basicos).filter(d => diaCumplido(basicos[d])).sort()) {
    run = prev && sumarDias(prev, 1) === d ? run + 1 : 1; mejor = Math.max(mejor, run); prev = d;
  }
  return { actual: n, mejor };
}
