// Lógica pura (sin DOM) para poder probarla en Node: node tests/logic.test.mjs

// Ejercicios de la rutina de Notion (🥋 Deporte). s=series, r=reps, d=descanso (s),
// w=trabajo estimado por serie (s), kg=carga inicial (null = peso corporal).
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
  potencia: { nombre: 'Potencia y gas', icono: '⚡', ej: [
    { id: 'swing', n: 'Swing con kettlebell', s: 5, r: '10', d: 60, kg: 16, m: ['gluteos', 'isquios', 'lumbares', 'abdominales'] },
    { id: 'cajon', n: 'Salto al cajón', s: 4, r: '4', d: 90, kg: null, w: 20, m: ['cuadriceps', 'gluteos', 'gemelos'] },
    { id: 'balon_rot', n: 'Lanzamiento rotacional balón medicinal', s: 3, r: '6', x: 'por lado', d: 60, kg: 4, m: ['oblicuos', 'abdominales', 'deltoides'] },
    { id: 'remo_maq', n: 'Remo en máquina 250 m', s: 4, r: '1', d: 90, kg: null, w: 60, m: ['dorsales', 'cuadriceps', 'gluteos', 'biceps'] },
  ]},
};

export const CALENTAMIENTO = ['Círculos de cuello, brazos, cintura y piernas', '90/90 de cadera × 8', 'Estiramiento de espalda', 'Calentamiento de piernas con banda elástica'];
export const ELONGACION = ['Rana (aductores)', '90/90 sostenido por lado', 'Puente de lucha suave', 'Apertura torácica en el suelo', 'Isquios y psoas por lado'];

// OPCIÓN: rutina de abdominales del usuario, 3 rondas intensas con el mismo disco.
export const ABS = [
  { id: 'abs_disco', n: 'Abdominal alzando el disco sobre la cabeza', r: '20', m: ['abdominales', 'deltoides'] },
  { id: 'abs_45', n: 'Piernas 45° y torso 45°: disco de lado a lado', r: '20 por lado', m: ['oblicuos', 'abdominales'] },
  { id: 'abs_plancha', n: 'Plancha: brazos extendidos ↔ codos', r: '20', m: ['abdominales', 'triceps', 'deltoides'] },
  { id: 'abs_halo', n: 'Disco alrededor de la cabeza', r: '20 por lado', m: ['deltoides', 'oblicuos', 'abdominales'] },
];
export const ABS_RONDAS = 3, ABS_DESC_EJ = 15, ABS_DESC_RONDA = 90;
export const ABS_SEG = ABS_RONDAS * (ABS.length * 55 + (ABS.length - 1) * ABS_DESC_EJ) + (ABS_RONDAS - 1) * ABS_DESC_RONDA;
export const FIJO_SEG = 600; // calentamiento 5 min + elongar 5 min
export const CAMBIO_SEG = 150; // montar máquina / cambiar discos; calibrado para que 1 h con abdominales dé 3 ejercicios

// Silueta: músculo → nombre y grupo al que pertenece ('abs' = rutina OPCIÓN de abdominales).
export const MUSCULOS = {
  pectorales: ['Pectorales', 'empuje'], deltoides: ['Deltoides (hombros)', 'empuje'], triceps: ['Tríceps', 'empuje'],
  biceps: ['Bíceps', 'brazos'], antebrazos: ['Antebrazos y agarre', 'brazos'],
  trapecio: ['Trapecio', 'espalda'], dorsales: ['Dorsales', 'espalda'], deltoides_post: ['Deltoide posterior', 'espalda'], lumbares: ['Lumbares', 'espalda'],
  gluteos: ['Glúteos', 'piernas'], cuadriceps: ['Cuádriceps', 'piernas'], isquios: ['Isquiotibiales', 'piernas'], aductores: ['Aductores', 'piernas'], gemelos: ['Gemelos', 'piernas'],
  abdominales: ['Abdominales', 'abs'], oblicuos: ['Oblicuos', 'abs'],
};

// Ejercicios que trabajan un músculo, con su grupo.
export const ejerciciosDe = musculo => Object.entries(GRUPOS)
  .flatMap(([g, G]) => G.ej.map(e => ({ ...e, g })))
  .concat(ABS.map(e => ({ ...e, g: 'abs' })))
  .filter(e => e.m.includes(musculo));

const costo = (e, s) => s * ((e.w ?? 40) + e.d) + CAMBIO_SEG;

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

// Códigos WMO de Open-Meteo → etiqueta y minutos sugeridos.
export function interpretarClima(codigo, probLluvia = 0) {
  if (codigo >= 95) return { txt: 'Tormenta', i: '⛈️', lluvia: true, min: 30 };
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) return { txt: 'Nieve', i: '❄️', lluvia: true, min: 45 };
  if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82) || probLluvia >= 60) return { txt: 'Lluvia', i: '🌧️', lluvia: true, min: 45 };
  if (codigo <= 1) return { txt: 'Despejado', i: '☀️', lluvia: false, min: 75 };
  return { txt: codigo >= 45 ? 'Niebla' : 'Nublado', i: '⛅', lluvia: false, min: 60 };
}
