import assert from 'node:assert/strict';
import * as L from '../docs/logic.js';

// La rutina respeta el tiempo y crece con él
const corta = L.armarRutina(30, ['piernas']), larga = L.armarRutina(90, ['piernas', 'core']);
const seg = r => r.ej.reduce((a, e) => a + e.s * ((e.w ?? 40) + e.d) + L.CAMBIO_SEG, 0) + L.FIJO_SEG + (r.conAbs ? L.ABS_SEG : 0);
assert.ok(seg(corta) <= 30 * 60 && corta.ej.length >= 1);
assert.ok(seg(larga) <= 90 * 60 && larga.ej.length === L.GRUPOS.piernas.ej.length);
assert.equal(L.armarRutina(20, ['piernas', 'core']).ej.length, 0);
// Dos grupos se alternan
assert.deepEqual(L.armarRutina(90, ['espalda', 'brazos']).ej.slice(0, 2).map(e => e.g), ['espalda', 'brazos']);

// Doble progresión: tope en todas las series → +2,5 kg; si no, misma carga
const pm = L.GRUPOS.piernas.ej[0];
const ses = reps => [{ fecha: '2026-10-19T20:00:00Z', grupos: ['piernas'], series: reps.map(r => ({ ex: 'pm_hex', g: 'piernas', kg: 70, reps: r })) }];
assert.equal(L.sugerirKg(ses([5, 5, 5, 5]), pm), 72.5);
assert.equal(L.sugerirKg(ses([5, 5, 4, 4]), pm), 70);
assert.equal(L.sugerirKg([], pm), 60);

// Semana lunes-domingo, resumen y logros
assert.equal(L.lunes('2026-10-25T12:00:00'), '2026-10-19'); // domingo
assert.equal(L.lunes('2026-10-26T12:00:00'), '2026-10-26'); // lunes
const semana = ['2026-10-26T20:00:00', '2026-10-28T20:00:00', '2026-10-30T20:00:00'].map((f, i) =>
  ({ fecha: f, grupos: [['piernas', 'espalda', 'empuje'][i]], abs: i < 2, clima: { lluvia: i === 1 }, series: [{ ex: 'pm_hex', g: 'piernas', kg: 75, reps: 5 }] }));
const hist = [...ses([5, 5, 5, 5]), ...semana];
const r = L.resumenSemana(hist, new Date('2026-10-31T10:00:00'));
assert.equal(r.sesiones, 3);
assert.deepEqual(r.pendientes, ['brazos', 'core', 'potencia']);
const lg = Object.fromEntries(L.logros(hist, new Date('2026-10-31T10:00:00')).map(l => [l.i, l.ok]));
assert.ok(lg['🎯'] && lg['🏆'] && lg['🔥'] && lg['🌧️'] && !lg['🔷']);

// Niveles y clima
const nv = L.niveles(hist, new Date('2026-10-31'));
assert.ok(nv.piernas.vol > 0 && nv.espalda.vol === 0);
assert.ok(Math.abs(nv.piernas.subida - (75 / 70 - 1)) < 1e-9); // 70 kg → 75 kg
assert.ok(Math.abs(nv.piernas.carga - (75 / 70 - 1) / L.SUBIDA_TOPE) < 1e-9 && nv.espalda.carga === 0);
assert.equal(L.interpretarClima(0).min, 75);
assert.equal(L.interpretarClima(61).lluvia, true);
assert.equal(L.interpretarClima(3, 80).txt, 'Lluvia');
// 1 h con abdominales = 3 ejercicios, en el orden priorizado
assert.deepEqual(L.armarRutina(60, ['piernas', 'core']).ej.map(e => e.id), ['pm_hex', 'hack', 'hip_thrust']);
assert.deepEqual(L.armarRutina(60, ['espalda', 'core']).ej.map(e => e.id), ['jalon', 'remo_barra', 'face_pull']);
assert.deepEqual(L.armarRutina(60, ['empuje', 'core']).ej.map(e => e.id), ['press_incl', 'militar', 'fondos']);
// Silueta: todo músculo tiene ejercicios y todo músculo citado existe
for (const m in L.MUSCULOS) assert.ok(L.ejerciciosDe(m).length > 0, m);
for (const e of Object.values(L.GRUPOS).flatMap(G => G.ej).concat(L.ABS)) for (const m of e.m) assert.ok(m in L.MUSCULOS, m);
// Core: solo abdominales fijos, sin ejercicios variables
const soloCore = L.armarRutina(30, ['core']);
assert.ok(soloCore.conAbs && soloCore.ej.length === 0);
// Resumen del lunes: mira la semana anterior
const ra = L.resumenAnterior(hist, new Date('2026-11-02T09:00:00'));
assert.equal(ra.sesiones, 3); assert.equal(ra.antes, 1); assert.match(ra.msg, /Meta cumplida/);
assert.match(L.resumenAnterior([], new Date('2026-11-02')).msg, /sin entrenar/);

// ---------- Plan hacia una meta ----------
// Volver a BJJ en 4 semanas desde el jueves 29-10: 5 semanas calendario, la última es descarga
const meta = { nombre: 'Volver a BJJ', inicio: '2026-10-29', fecha: '2026-11-26' };
assert.deepEqual([0, 1, 2, 3, 4].map(s => L.faseDe(s, 5)), ['base', 'base', 'construccion', 'especifica', 'descarga']);
assert.deepEqual(L.estadoMeta(meta, new Date('2026-10-29T10:00')), { semana: 0, total: 5, dias: 28, fase: 'base' });
assert.equal(L.estadoMeta(meta, new Date('2026-11-24T10:00')).fase, 'descarga');
assert.ok(L.estadoMeta(meta, new Date('2026-11-27T10:00')).fin);
assert.equal(L.lunes('2026-10-26'), '2026-10-26'); // fecha sin hora: no cae al día anterior por UTC

// Zonas Karvonen: 35 años, reposo 60 → máx 184; Z2 = 60 + 0,6..0,7 × 124
const z = L.zonas({ edad: 35, fcRep: 60 });
assert.deepEqual([z[1].de, z[1].a], [134, 147]);
assert.equal(L.zonas({ edad: 35 }), null);

// Factor de fase reduce series (mínimo 2) y la rutina sigue cabiendo
assert.ok(L.armarRutina(60, ['piernas'], .6).ej.every(e => e.s <= Math.round(L.GRUPOS.piernas.ej.find(x => x.id === e.id).s * .6) && e.s >= 2));

// Sesiones de cardio se ajustan al tiempo libre
assert.equal(L.minSesion(L.sesion('rounds', 'especifica', 75)), 45); // 6 × 5 + 5 pausas + 10
assert.ok(L.minSesion(L.sesion('intervalos', 'construccion', 30)) <= 30);
assert.equal(L.sesion('z2', 'base', 75).min, 35);

// Calendario real (semana del 26-10, leído el jueves 29): bloque Ejercicio 19:30–20:45
const r_ = (f, a, b) => [`${f}T${a}`, `${f}T${b}`];
const ev = [];
for (const f of ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29']) {
  for (const [t, a, b] of [['Elongar/ejercicio suave', '06:50', '07:30'], ['Bloque de trabajo 1', '08:15', '13:00'], ['Bloque de trabajo 2', '14:15', '18:00'], ['Ejercicio', '19:30', '20:45']]) {
    const [ini, fin] = r_(f, a, b); ev.push({ t, ini, fin });
  }
}
ev.push({ t: 'Feña: Viaje a Stgo.', ini: '2026-10-29T19:00', fin: '2026-10-29T20:00' }, { t: 'Fútbol', ini: '2026-10-29T21:00', fin: '2026-10-29T22:15' },
  { t: 'Bloque de trabajo', ini: '2026-10-30T08:15', fin: '2026-10-30T14:00' }, { t: 'Scout', ini: '2026-10-31T15:00', fin: '2026-10-31T18:00' },
  { t: 'Paseadora', ini: '2026-10-27T19:15', fin: '2026-10-27T20:00' }, { t: 'Bruno', ini: '2026-10-27T20:00', fin: '2026-10-27T21:00' });
const sl = L.slotsDeEventos(ev, '2026-10-26', { desde: '2026-10-29' });
assert.deepEqual(sl.map(s => [s.fecha.slice(8), s.hora, s.min, !!s.deporte]),
  [['29', '20:00', 30, true], ['30', '14:00', 75, false], ['31', '09:00', 75, false], ['01', '09:00', 75, false]]);
const semanaCompleta = L.slotsDeEventos(ev, '2026-10-26');
assert.equal(semanaCompleta.find(s => s.fecha === '2026-10-27'), undefined); // martes: el bloque está tomado entero
assert.deepEqual(semanaCompleta.filter(s => s.cal && !s.deporte).map(s => s.fecha.slice(8)), ['26', '28']);
const pl = L.planSemana('construccion', sl);
assert.deepEqual(pl.map(d => d.ses.tipo), ['movilidad', 'fuerza', 'z2', 'fuerza']); // con fútbol, intervalos → Z2
assert.deepEqual(L.planSemana('base', L.slotsManuales('2026-10-26', [1, 3, 5], '19:30', 75)).map(d => d.ses.n.split(' ')[0]), ['Fuerza', 'Cardio', 'Fuerza']);

// Nutrición y racha
assert.deepEqual(L.nutricion(80, 'fuerza', 60), { prot: 145, cho: 400, agua: 3.5, tip: L.TIP.fuerza });
assert.equal(L.nutricion(null), null);
const b = { mov: true, agua: true, prot: true, sueno: true };
const bas = { '2026-10-25': b, '2026-10-26': b, '2026-10-27': { ...b, mov: false }, '2026-10-28': b, '2026-10-29': { mov: true } };
assert.deepEqual(L.racha(bas, '2026-10-29'), { actual: 1, mejor: 2 }); // hoy aún no cumple: no corta
assert.equal(L.racha({ ...bas, '2026-10-29': b }, '2026-10-29').actual, 2);
console.log('ok');
