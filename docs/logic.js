// Lógica pura (sin DOM) para poder probarla en Node: node tests/logic.test.mjs

// Ejercicios de la rutina de Notion (🥋 Deporte). s=series, r=reps, d=descanso (s),
// w=trabajo estimado por serie (s), kg=carga inicial (null = peso corporal).
export const GRUPOS = {
  piernas: { nombre: 'Piernas y cadera', icono: '🦵', ej: [
    { id: 'pm_hex', n: 'Peso muerto barra hexagonal', s: 4, r: '5', d: 150, kg: 60 },
    { id: 'bulgara', n: 'Sentadilla búlgara', s: 3, r: '8', x: 'por lado', d: 90, kg: 12, w: 60 },
    { id: 'hip_thrust', n: 'Hip thrust', s: 3, r: '10', d: 90, kg: 60 },
    { id: 'nordico', n: 'Curl nórdico (o femoral)', s: 3, r: '6', d: 90, kg: null },
    { id: 'copenhague', n: 'Plancha Copenhague', s: 3, r: '20 s', x: 'por lado', d: 60, kg: null, w: 50 },
  ]},
  espalda: { nombre: 'Espalda y tracción', icono: '🪢', ej: [
    { id: 'dom_toalla', n: 'Dominadas con toalla o gi', s: 4, r: '5-8', d: 120, kg: 0 },
    { id: 'remo_barra', n: 'Remo con barra', s: 4, r: '8', d: 90, kg: 40 },
    { id: 'remo_uni', n: 'Remo unilateral mancuerna', s: 3, r: '10', x: 'por lado', d: 60, kg: 18, w: 60 },
    { id: 'face_pull', n: 'Face pull', s: 3, r: '15', d: 60, kg: 15 },
  ]},
  empuje: { nombre: 'Pecho y hombros', icono: '🛡️', ej: [
    { id: 'banca_cerr', n: 'Press banca agarre cerrado', s: 4, r: '6', d: 120, kg: 50 },
    { id: 'militar', n: 'Press militar de pie', s: 3, r: '8', d: 90, kg: 30 },
    { id: 'fondos', n: 'Fondos', s: 3, r: '8-12', d: 90, kg: 0 },
    { id: 'landmine', n: 'Landmine press con rotación', s: 4, r: '5', x: 'por lado', d: 90, kg: 20, w: 50 },
  ]},
  brazos: { nombre: 'Brazos y agarre', icono: '✊', ej: [
    { id: 'colgarse', n: 'Colgarse del gi o toalla', s: 3, r: 'máx', d: 60, kg: null, w: 45 },
    { id: 'farmer', n: 'Farmer carry 30 m', s: 4, r: '1', d: 60, kg: 24 },
    { id: 'curl_mart', n: 'Curl martillo', s: 3, r: '12', d: 60, kg: 10 },
    { id: 'pinch', n: 'Pinch grip con discos', s: 3, r: '30 s', d: 45, kg: 10 },
  ]},
  core: { nombre: 'Core y cuello', icono: '🎯', ej: [
    { id: 'tgu', n: 'Turkish get-up', s: 3, r: '2', x: 'por lado', d: 60, kg: 12, w: 75 },
    { id: 'pallof', n: 'Pallof press', s: 3, r: '12', x: 'por lado', d: 45, kg: 10, w: 50 },
    { id: 'rueda', n: 'Rueda abdominal', s: 3, r: '10', d: 60, kg: null },
    { id: 'cuello', n: 'Isométricos de cuello (4 direcciones)', s: 2, r: '20 s', d: 30, kg: null, w: 90 },
  ]},
  potencia: { nombre: 'Potencia y gas', icono: '⚡', ej: [
    { id: 'swing', n: 'Swing con kettlebell', s: 5, r: '10', d: 60, kg: 16 },
    { id: 'cajon', n: 'Salto al cajón', s: 4, r: '4', d: 90, kg: null, w: 20 },
    { id: 'balon_rot', n: 'Lanzamiento rotacional balón medicinal', s: 3, r: '6', x: 'por lado', d: 60, kg: 4 },
    { id: 'sprints', n: 'Empuje de trineo o sprints 20 m', s: 6, r: '1', d: 60, kg: null, w: 15 },
    { id: 'ronda_bjj', n: 'Ronda BJJ: sprawls · bear crawl · burpees (30 s c/u)', s: 4, r: '1', d: 30, kg: null, w: 90 },
  ]},
};

export const CALENTAMIENTO = ['Círculos de cuello, hombros, muñecas y tobillos', '90/90 de cadera × 8', 'Shrimp (escape de cadera) × 10 m', 'Puente sobre hombros × 8', 'Rotaciones torácicas × 8 por lado'];
export const ELONGACION = ['Rana (aductores)', '90/90 sostenido por lado', 'Puente de lucha suave', 'Apertura torácica en el suelo', 'Isquios y psoas por lado'];

// OPCIÓN: rutina de abdominales del usuario, 3 rondas intensas con el mismo disco.
export const ABS = [
  { id: 'abs_disco', n: 'Abdominal alzando el disco sobre la cabeza', r: '20' },
  { id: 'abs_45', n: 'Piernas 45° y torso 45°: disco de lado a lado', r: '20 por lado' },
  { id: 'abs_plancha', n: 'Plancha: brazos extendidos ↔ codos', r: '20' },
  { id: 'abs_halo', n: 'Disco alrededor de la cabeza', r: '20 por lado' },
];
export const ABS_RONDAS = 3, ABS_DESC_EJ = 15, ABS_DESC_RONDA = 90;
export const ABS_SEG = ABS_RONDAS * (ABS.length * 55 + (ABS.length - 1) * ABS_DESC_EJ) + (ABS_RONDAS - 1) * ABS_DESC_RONDA;
export const FIJO_SEG = 600; // calentamiento 5 min + elongar 5 min

const costo = (e, s) => s * ((e.w ?? 40) + e.d);

// Alterna los ejercicios de los grupos elegidos y llena el tiempo disponible.
// Si un ejercicio no cabe completo, prueba con menos series (mínimo 2).
export function armarRutina(minutos, grupos, conAbs) {
  let libre = minutos * 60 - FIJO_SEG - (conAbs ? ABS_SEG : 0);
  const listas = grupos.map(g => GRUPOS[g].ej.map(e => ({ ...e, g })));
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

// Semana de lunes a domingo, identificada por el lunes 'YYYY-MM-DD' (hora local).
export function lunes(fecha) {
  const d = new Date(fecha); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

// Nivel 0–1 por grupo: series hechas en los últimos 28 días contra 24 (≈ 1 sesión completa del grupo por semana).
// ponytail: volumen simple; si se quiere fuerza real, mezclar con la mejora de kg respecto al inicio.
export function niveles(sesiones, fecha = new Date()) {
  const desde = new Date(fecha) - 28 * 864e5;
  const cuenta = Object.fromEntries(Object.keys(GRUPOS).map(g => [g, 0]));
  for (const s of sesiones) if (new Date(s.fecha) >= desde) for (const x of s.series) if (x.g in cuenta) cuenta[x.g]++;
  return Object.fromEntries(Object.entries(cuenta).map(([g, n]) => [g, Math.min(1, n / 24)]));
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
    { t: 'Los 6 grupos en la semana', ok: r.pendientes.length === 0, i: '🔷' },
    { t: 'Récord personal de carga', ok: record, i: '🏆' },
    { t: 'Abdominales 2 veces', ok: r.lista.filter(s => s.abs).length >= 2, i: '🔥' },
    { t: 'Entrenaste un día de lluvia', ok: r.lista.some(s => s.clima?.lluvia), i: '🌧️' },
    { t: '60 series en la semana', ok: r.series >= 60, i: '💪' },
    { t: racha > 1 ? `Racha de ${racha} semanas cumpliendo` : 'Racha: 2 semanas seguidas cumpliendo', ok: racha >= 2, i: '📈' },
  ];
}

// Códigos WMO de Open-Meteo → etiqueta y minutos sugeridos.
export function interpretarClima(codigo, probLluvia = 0) {
  if (codigo >= 95) return { txt: 'Tormenta', i: '⛈️', lluvia: true, min: 30 };
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) return { txt: 'Nieve', i: '❄️', lluvia: true, min: 45 };
  if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82) || probLluvia >= 60) return { txt: 'Lluvia', i: '🌧️', lluvia: true, min: 45 };
  if (codigo <= 1) return { txt: 'Despejado', i: '☀️', lluvia: false, min: 75 };
  return { txt: codigo >= 45 ? 'Niebla' : 'Nublado', i: '⛅', lluvia: false, min: 60 };
}
