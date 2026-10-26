import assert from 'node:assert/strict';
import * as L from '../docs/logic.js';

// La rutina respeta el tiempo y crece con él
const corta = L.armarRutina(30, ['piernas'], false), larga = L.armarRutina(90, ['piernas'], true);
const seg = r => r.ej.reduce((a, e) => a + e.s * ((e.w ?? 40) + e.d), 0) + L.FIJO_SEG + (r.conAbs ? L.ABS_SEG : 0);
assert.ok(seg(corta) <= 30 * 60 && corta.ej.length >= 2);
assert.ok(seg(larga) <= 90 * 60 && larga.ej.length === L.GRUPOS.piernas.ej.length);
assert.equal(L.armarRutina(20, ['piernas'], true).ej.length, 0);
// Dos grupos se alternan
assert.deepEqual(L.armarRutina(90, ['espalda', 'brazos'], false).ej.slice(0, 2).map(e => e.g), ['espalda', 'brazos']);

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
assert.ok(L.niveles(hist, new Date('2026-10-31'))['piernas'] > 0);
assert.equal(L.interpretarClima(0).min, 75);
assert.equal(L.interpretarClima(61).lluvia, true);
assert.equal(L.interpretarClima(3, 80).txt, 'Lluvia');
console.log('ok');
