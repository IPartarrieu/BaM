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
console.log('ok');
