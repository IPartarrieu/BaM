import assert from 'node:assert/strict';
import * as L from '../docs/logic.js';

// La rutina respeta el tiempo y crece con él
const corta = L.armarRutina(30, ['piernas']), larga = L.armarRutina(90, ['piernas', 'core']);
const seg = r => r.ej.reduce((a, e) => a + e.s * ((e.w ?? 40) + e.d) + L.CAMBIO_SEG, 0) + L.FIJO_SEG + (r.conAbs ? L.ABS_SEG : 0);
assert.ok(seg(corta) <= 30 * 60 && corta.ej.length >= 1);
assert.ok(seg(larga) <= 90 * 60 && larga.ej.length === L.GRUPOS.piernas.ej.filter(e => !e.alt).length);
assert.equal(L.armarRutina(20, ['piernas', 'core']).ej.length, 0);
// Dos grupos de la misma prioridad se alternan
assert.deepEqual(L.armarRutina(90, ['espalda', 'empuje']).ej.slice(0, 2).map(e => e.g), ['espalda', 'empuje']);

// Doble progresión: tope del rango en todas las series y esfuerzo dentro del objetivo → sube ≈ 5 % (1-2,5 kg); si no, misma carga
const pm = L.GRUPOS.piernas.ej[0]; // 4 × 4-6
const ses = (reps, rpe, id = 'pm_hex', kg = 70) => [{ fecha: '2026-10-19T20:00:00Z', grupos: ['piernas'], rpe, series: reps.map(r => ({ ex: id, g: 'piernas', kg, reps: r })) }];
assert.equal(L.sugerirKg(ses([6, 6, 6, 6]), pm), 72.5);
assert.equal(L.sugerirKg(ses([6, 6, 6, 6], 7), pm, 7), 72.5);   // dentro del objetivo
assert.equal(L.sugerirKg(ses([6, 6, 6, 6], 9), pm, 7), 70);      // llegó, pero muy duro: no sube
assert.equal(L.sugerirKg(ses([5, 5, 6, 6]), pm), 70);            // no llegó al tope en todas
assert.equal(L.sugerirKg(ses([6, 6, 6]), pm), 70);               // faltó una serie
assert.equal(L.sugerirKg([], pm), 60);
const curl = L.GRUPOS.brazos.ej[0]; // curl martillo 10 kg, 3 × 10-12
assert.equal(L.sugerirKg(ses([12, 12, 12], 7, 'curl_mart', 10), curl, 8), 11); // +1 kg (10 %), no +2,5 (25 %)
const swing = L.GRUPOS.potencia.ej[0];
assert.equal(L.sugerirKg(ses([10, 10, 10, 10, 10], 6, 'swing', 16), swing, 8), 16); // explosivos: mismo peso
assert.deepEqual([L.paso(10), L.paso(24), L.paso(60), L.paso(0)], [1, 1, 2.5, 1]);
assert.deepEqual(L.aproximacion(60), [{ kg: 30, reps: 5 }, { kg: 42.5, reps: 3 }, { kg: 50, reps: 1 }]);
assert.equal(L.aproximacion(60, 2).length, 2); assert.equal(L.aproximacion(10).length, 0);
assert.deepEqual([L.piso('4-6'), L.tope('4-6'), L.piso('5')], [4, 6, 5]);

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
// 1 h con abdominales = 3 ejercicios, por prioridad; la prevención (nórdico, Copenhague) no se pierde por falta de tiempo
assert.deepEqual(L.armarRutina(60, ['piernas', 'core']).ej.map(e => e.id), ['pm_hex', 'nordico', 'copenhague']);
assert.deepEqual(L.armarRutina(60, ['espalda', 'core']).ej.map(e => e.id), ['jalon', 'remo_barra', 'remo_uni']);
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
// Metas de la semana: fijas y variables; con fútbol la intensa fija pasa a Z2 variable
assert.deepEqual(L.metasSemana('construccion').map(x => [x.id, x.fija]), [['fuerzaA', true], ['fuerzaB', true], ['intervalos', true], ['z2', false], ['movilidad', false]]);
assert.deepEqual(L.metasSemana('especifica', true).map(x => x.id), ['fuerzaA', 'fuerzaB', 'z2', 'z2b'.replace('b', '2'), 'rounds']);
const items = L.metasSemana('base');
assert.deepEqual(L.pendientes(items, [{ item: 'fuerzaB', tipo: 'fuerza' }, { tipo: 'z2' }, { series: [] }]).map(x => x.id), ['z2b'.replace('b', '2'), 'movilidad']);

// Día con el bloque libre: se queda en el bloque. Martes 27: Paseadora y Bruno lo tapan → hueco más cercano a 19:30
const lun = L.dispDia(ev, '2026-10-26');
assert.deepEqual(L.ubicar(lun, 60, L.aMs('2026-10-26', '19:30')), { ini: L.aMs('2026-10-26', '19:30'), min: 75, mover: false });
const mar = L.dispDia(ev, '2026-10-27');
assert.equal(mar.choque, 'Paseadora');
assert.deepEqual(L.ubicar(mar, 60, L.aMs('2026-10-27', '19:30')), { ini: L.aMs('2026-10-27', '18:15'), min: 60, mover: true });
// Hoy a las 18:40 ya no sirve el hueco de las 18:00: parte desde ahora (redondeado) y el viaje de 19 a 20 es fijo
const jue = L.dispDia(ev, '2026-10-29', { ahora: new Date('2026-10-29T18:40') });
assert.equal(L.hhmm(jue.huecos[0][0]), '20:00'); // viaje 19–20, fútbol 21:00
assert.equal(jue.deporte, 'Fútbol');
assert.equal(L.horaHabitual(ev), '19:30');

// Reparto desde el jueves 29 (fase base): jueves con fútbol no recibe fuerza; fijas antes que variables
const dias = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'].map(f => ({ fecha: f, d: L.dispDia(ev, f, { ahora: new Date('2026-10-29T10:00') }) }));
const rep = L.distribuir('base', L.metasSemana('base', true), dias);
assert.deepEqual(rep.dias.map(d => [d.item?.id, d.hora, d.min]), [['movilidad', '20:00', 25], ['fuerzaA', '19:30', 75], ['z2', '19:30', 35], ['fuerzaB', '19:30', 75]]);
assert.deepEqual(rep.sinLugar.map(x => x.id), ['z22']); // la variable que no cupo queda a la vista
// El usuario fija el sábado a las 10:00 con fuerza B (el día anterior): se respeta y hay que mover/crear el bloque
const rep2 = L.distribuir('base', L.metasSemana('base'), dias.map(x => x.fecha === '2026-10-31' ? { ...x, elegido: { item: 'fuerzaB', hora: '10:00', min: 75 } } : x));
assert.deepEqual([rep2.dias[2].item.id, rep2.dias[2].hora, rep2.dias[2].min, rep2.dias[2].mover, rep2.dias[2].elegido], ['fuerzaB', '10:00', 75, true, true]);
assert.ok(!rep2.dias.some((d, i) => i !== 2 && d.item?.id === 'fuerzaB'));
// Nutrición y racha
assert.deepEqual(L.nutricion(80, 'fuerza', 60), { prot: 145, cho: 400, agua: 3.5, tip: L.TIP.fuerza });
assert.equal(L.nutricion(null), null);
const b = { mov: true, agua: true, prot: true, sueno: true };
const bas = { '2026-10-25': b, '2026-10-26': b, '2026-10-27': { ...b, mov: false }, '2026-10-28': b, '2026-10-29': { mov: true } };
assert.deepEqual(L.racha(bas, '2026-10-29'), { actual: 1, mejor: 2 }); // hoy aún no cumple: no corta
assert.equal(L.racha({ ...bas, '2026-10-29': b }, '2026-10-29').actual, 2);

// Dieta: déficit/superávit según objetivo, más carbohidrato el día de fuerza, menú que suma la meta (±5 %)
const yo = { peso: 80, altura: 178, edad: 32, sexo: 'h' };
assert.equal(L.dieta(yo, 'fuerza').kcal, undefined); // sin objetivo: solo lo básico por kg
const dp = L.dieta({ ...yo, objetivo: 'perder' }, 'fuerza'), dm = L.dieta({ ...yo, objetivo: 'mantener' }, 'fuerza');
assert.ok(dp.kcal < dm.kcal && dp.prot > dm.prot && L.dieta({ ...yo, objetivo: 'ganar' }, 'fuerza').kcal > dm.kcal);
assert.ok(L.dieta({ ...yo, objetivo: 'perder' }, 'descanso').cho < dp.cho);
assert.ok(L.kgSemana({ ...yo, objetivo: 'perder' }) < 0 && L.kgSemana({ ...yo, objetivo: 'ganar' }) > 0);
// Cada combinación (también la de platos alternativos) cuadra con la meta del día
for (const i of [0, 1, 2]) {
  const m = L.menu(dp, '2026-10-30', Object.fromEntries(L.COMIDAS.map(([k, , , ops]) => [k, ops[i]]))), f = `combinación ${i}`, kcal = m.reduce((a, x) => a + x.kcal, 0), prot = m.reduce((a, x) => a + x.prot, 0);
  assert.ok(Math.abs(kcal / dp.kcal - 1) < .05 && Math.abs(prot / dp.prot - 1) < .05, f);
}
// El Pal: hambre sin registros, feliz al cumplir, triste al pasarse
assert.equal(L.animoPal(dp, { n: 0, kcal: 0, prot: 0 }, 15).cara, -1);
assert.equal(L.animoPal(dp, { n: 4, kcal: dp.kcal, prot: dp.prot }).cara, 2);
assert.equal(L.animoPal(dp, { n: 4, kcal: dp.kcal * 1.3, prot: dp.prot }).cara, -1);
console.log('ok');

// Orden por prioridad: explosivos primero, agarre antes que core pero después de los básicos
{
  const o = L.armarRutina(120, ['piernas', 'potencia', 'brazos']).ej;
  assert.deepEqual(o.slice(0, 3).map(e => e.p), [1, 1, 1]);
  const p = o.map(e => e.p); assert.deepEqual(p, [...p].sort((a, b) => a - b));
  assert.ok(L.armarRutina(60, ['piernas']).ej.some(e => e.id === 'nordico') && L.armarRutina(60, ['piernas']).ej.some(e => e.id === 'copenhague'));
  // descansos: básicos pesados ≥ 2 min, explosivos ≥ 90 s
  for (const e of Object.values(L.GRUPOS).flatMap(G => G.ej)) if (e.p === 2 || e.p === 3 && !['remo_uni', 'landmine'].includes(e.id)) assert.ok(e.d >= 120, e.id);
}

// Cambiar un ejercicio: el sustituto ocupa el lugar con las mismas series, del mismo patrón, y se puede volver al original
{
  const base = L.armarRutina(60, ['piernas']), c = L.armarRutina(60, ['piernas'], 1, { hack: 'sent_copa' });
  assert.deepEqual(c.ej.map(e => e.id), ['pm_hex', 'sent_copa', 'hip_thrust', 'nordico', 'copenhague']);
  assert.equal(c.ej[1].s, base.ej[1].s); assert.equal(c.ej[1].orig, 'hack'); assert.equal(c.ej[1].d, 120);
  const alt = L.alternativas(base.ej[1], base.ej); // hack
  assert.equal(alt[0].id, 'sent_copa'); assert.ok(alt.every(x => x.p !== 1 && !base.ej.some(b => b.id === x.id)));
  assert.equal(L.alternativas(base.ej[3], base.ej)[0].id, 'curl_fem');     // nórdico → curl femoral, no peso muerto
  assert.equal(L.alternativas(base.ej[4], base.ej)[0].id, 'aduccion');     // Copenhague → aducción
  const vuelta = L.sustituir(c.ej[1], 'hack'); assert.equal(vuelta.id, 'hack'); assert.equal(vuelta.orig, undefined);
  assert.equal(L.alternativas(c.ej[1], c.ej)[0].id, 'hack');
  // un explosivo solo se cambia por otro explosivo
  const pot = L.armarRutina(90, ['potencia']); const caj = pot.ej.find(e => e.id === 'cajon');
  assert.deepEqual(L.alternativas(caj, pot.ej).map(x => x.id), ['salto_vert']);
  // los sustitutos no entran solos en las rutinas ni en el mapa muscular
  assert.ok(!L.armarRutina(120, ['piernas', 'espalda', 'empuje', 'potencia']).ej.some(e => e.alt));
  assert.ok(!L.ejerciciosDe('aductores').some(e => e.alt));
}

// Cuerpo completo A/B: cada sesión cubre bisagra/sentadilla, empuje y tracción; las dos juntas trabajan cada grupo 2 veces por semana
{
  const arma = (tipo, fase, min) => { const s = L.sesion(tipo, fase, min); return L.armarRutina(min, s.grupos, s.factor, {}, s.plantilla); };
  const pats = r => new Set(r.ej.map(e => e.pat));
  for (const [tipo, min] of [['fuerzaA', 75], ['fuerzaB', 60]]) {
    const r = arma(tipo, 'construccion', min), p = pats(r);
    assert.ok(['empuje_h', 'empuje_v'].some(x => p.has(x)) && ['traccion_h', 'traccion_v'].some(x => p.has(x)) && (p.has('bisagra') || p.has('sentadilla')), tipo);
    assert.ok(r.ej.some(e => e.id === 'nordico' || e.id === 'copenhague'), tipo);   // prevención siempre
    assert.equal(r.ej[0].p, 1);                                                     // explosivo primero
  }
  const gA = new Set(L.sesion('fuerzaA', 'base').grupos), gB = new Set(L.sesion('fuerzaB', 'base').grupos);
  for (const g of ['piernas', 'espalda', 'empuje', 'brazos']) assert.ok(gA.has(g) && gB.has(g), g);
  // Base: sin explosivos; con core en A y B. Construcción: explosivos y core solo en A
  assert.ok(!arma('fuerzaA', 'base', 75).ej.some(e => e.p === 1) && L.sesion('fuerzaB', 'base').grupos.includes('core'));
  assert.ok(arma('fuerzaB', 'construccion', 60).ej.some(e => e.p === 1) && !L.sesion('fuerzaB', 'construccion').grupos.includes('core'));
  // Las sesiones con core piden 75 min para que entren todos los patrones
  const dia = f => ({ fecha: f, d: L.dispDia([], f, { ahora: new Date('2026-10-26T06:00') }) });
  const rd = L.distribuir('construccion', L.metasSemana('construccion'), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'].map(dia));
  assert.deepEqual(rd.dias.filter(d => d.item?.tipo === 'fuerzaA' || d.item?.tipo === 'fuerzaB').map(d => [d.item.id, d.min >= (d.item.id === 'fuerzaA' ? 75 : 60)]).sort().map(x => x[1]), [true, true]);
  // Descarga real: el volumen baja ≥ 40 % respecto de Construcción con las mismas cargas, y se mantienen A y B
  const total = r => r.ej.reduce((n, e) => n + e.s, 0);
  for (const tipo of ['fuerzaA', 'fuerzaB']) {
    const c = total(arma(tipo, 'construccion', 90)), d = total(arma(tipo, 'descarga', 90));
    assert.ok(d <= Math.round(c * .6), `${tipo}: ${d} vs ${c}`);
    assert.ok(arma(tipo, 'descarga', 90).ej.some(e => e.id === 'nordico' || e.id === 'copenhague')); // la prevención no se quita
  }
  assert.deepEqual(L.metasSemana('descarga').filter(x => x.fija).map(x => x.id), ['fuerzaA', 'fuerzaB', 'rounds']);
  assert.deepEqual(['base', 'construccion', 'especifica', 'descarga'].map(f => L.FASES[f].rpe), ['6-7', '7-8', '7-8', '6-7']);
  // Modo libre: sigue intercalando grupos sin plantilla
  assert.ok(L.armarRutina(90, ['espalda', 'empuje']).ej.length > 0);
}

// Kilos levantados: kg × reps; peso corporal no suma; media por sesión y por grupo
assert.equal(L.tonelaje([{ kg: 50, reps: 10 }, { kg: 50, reps: 8 }, { kg: null, reps: 12 }, { kg: 0, reps: 10 }]), 900);
const tm = L.tonelajeMedio([
  { fecha: '2026-11-02T20:00', series: [{ g: 'piernas', kg: 100, reps: 5 }, { g: 'core', kg: 10, reps: 20 }] },
  { fecha: '2026-11-04T20:00', series: [{ g: 'piernas', kg: 100, reps: 10 }] },
  { fecha: '2026-11-05T20:00', series: [] },
]);
assert.equal(tm.sesiones, 2); assert.equal(tm.media, 850);
assert.equal(tm.grupos.piernas.media, 750); assert.equal(tm.grupos.core.sesiones, 1);
console.log('ok tonelaje');
