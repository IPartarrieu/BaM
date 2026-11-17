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
// Nivel por grupo: 1RM estimado / peso corporal contra umbrales de intermedio y avanzado
assert.equal(Math.round(L.e1rm(100, 5) * 10) / 10, 116.7); assert.equal(L.e1rm(100, 15), 0); assert.equal(L.e1rm(null, 5), 0);
{
  const s = (fecha, ex, kg, reps) => ({ fecha, series: [{ ex, g: 'x', kg, reps }] });
  const H = [s('2026-09-01', 'pm_hex', 80, 5), s('2026-10-01', 'pm_hex', 100, 5), s('2026-10-01', 'press_incl', 60, 3), s('2026-10-02', 'remo_barra', 70, 8)];
  const yo = { peso: 80, sexo: 'h' }, n = L.niveles(H, yo, [], '2026-10-05');
  // pm_hex: 100 × (1 + 5/30) = 116,7 → 1,46 × peso: intermedio (entre 1,25 y 1,75)
  assert.equal(n.piernas.nivel, 'Intermedio'); assert.equal(n.piernas.ex, 'pm_hex');
  assert.ok(Math.abs(n.piernas.puntaje - (1 + (116.666 / 80 - 1.25) / 0.5)) < 1e-3);
  assert.equal(n.piernas.falta, Math.ceil((1.75 - 116.6667 / 80) * 80)); // kg de 1RM que faltan para avanzado
  assert.equal(n.empuje.nivel, 'Intermedio');               // 66 kg / 80 = 0,83
  assert.equal(n.espalda.nivel, 'Avanzado');                // 88,7 / 80 = 1,11 ≥ 1,0
  assert.equal(n.brazos, null); assert.equal(n.core, null);  // sin registros
  // Core: cuenta el peso del disco aunque sea a 20 repeticiones (8 kg / 80 = 0,1 → justo intermedio)
  assert.equal(L.niveles([...H, s('2026-10-03', 'abs_disco', 8, 20)], yo, [], '2026-10-05').core.nivel, 'Intermedio');
  // Mujer: umbrales × 0,65 → el mismo registro da más nivel
  assert.equal(L.niveles(H, { peso: 80, sexo: 'm' }, [], '2026-10-05').piernas.nivel, 'Avanzado');
  // Sin peso no hay nivel; el último peso registrado manda sobre el del perfil
  assert.equal(L.niveles(H, {}, [], '2026-10-05').piernas, null);
  assert.equal(L.pesoEn({ peso: 80 }, [{ fecha: '2026-09-15', kg: 90 }, { fecha: '2026-11-01', kg: 70 }], '2026-10-05'), 90);
  // Ventana de 8 semanas: en diciembre ya no cuenta lo de septiembre/octubre
  assert.equal(L.niveles(H, yo, [], '2026-12-20').piernas, null);
  // Progresión: un punto por fecha con kg; en septiembre básico, en octubre intermedio
  const pr = L.progresionNiveles(H, yo);
  assert.deepEqual(pr.map(x => x.fecha), ['2026-09-01', '2026-10-01', '2026-10-02']);
  assert.ok(pr[0].piernas < 1 && pr[1].piernas >= 1 && pr[0].empuje === null);
}
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
assert.deepEqual(L.metasSemana('construccion').map(x => [x.id, x.fija]), [['fuerzaA', true], ['fuerzaB', true], ['intervalos', true], ['fuerzaA2', false], ['z2', false], ['movilidad', false]]);
assert.deepEqual(L.metasSemana('construccion', false, 1).filter(x => !x.fija)[0].id, 'fuerzaB2'); // la 3.ª de fuerza alterna Pierna/Torso
assert.deepEqual(L.metasSemana('especifica', true).map(x => x.id), ['fuerzaA', 'fuerzaB', 'z2', 'fuerzaA2', 'z2b'.replace('b', '2'), 'rounds']);
const items = L.metasSemana('base');
assert.deepEqual(L.pendientes(items, [{ item: 'fuerzaB', tipo: 'fuerza' }, { tipo: 'z2' }, { series: [] }]).map(x => x.id), ['fuerzaA2', 'z2b'.replace('b', '2'), 'movilidad']);

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
assert.deepEqual(rep.sinLugar.map(x => x.id), ['fuerzaA2', 'z22']); // las variables que no cupieron queda a la vista
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
// Desde que se sumó la creatina (7 metas) hacen falta 5; los días anteriores siguen con 4 y la racha no cambia
assert.ok(L.diaCumplido(b, '2026-11-16') && !L.diaCumplido(b, '2026-11-17') && L.diaCumplido({ ...b, creatina: true }, '2026-11-17'));
assert.equal(L.racha({ '2026-11-16': b, '2026-11-17': { ...b, creatina: true } }, '2026-11-17').actual, 2);

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
  const ac = L.alternativas(caj, pot.ej); assert.equal(ac[0].id, 'salto_vert'); assert.ok(ac.length >= 3 && ac.every(x => x.p === 1));
  // los sustitutos no entran solos en las rutinas ni en el mapa muscular
  assert.ok(!L.armarRutina(120, ['piernas', 'espalda', 'empuje', 'potencia']).ej.some(e => e.alt));
  assert.ok(!L.ejerciciosDe('aductores').some(e => e.alt));
}

// Pierna (A) / Torso (B) con la estructura de @oriol.jiujitsu: explosividad → fuerza → músculo → core
{
  const arma = (tipo, fase, min) => { const s = L.sesion(tipo, fase, min); return L.armarRutina(min, s.grupos, s.factor, {}, s.plantilla); };
  const pats = r => new Set(r.ej.map(e => e.pat));
  for (const fase of ['base', 'construccion', 'especifica']) {
    const P = arma('fuerzaA', fase, 75), T = arma('fuerzaB', fase, 75);
    // Todas empiezan con explosividad: saltos en pierna, lanzamiento de balón en torso (también en Base)
    assert.equal(P.ej[0].id, 'cajon', fase); assert.equal(T.ej[0].id, 'balon_rot', fase);
    // Fuerza: sentadilla y peso muerto / empujes y tracciones verticales y horizontales
    assert.ok(pats(P).has('sentadilla') && pats(P).has('bisagra'), fase);
    for (const x of ['empuje_h', 'empuje_v', 'traccion_h', 'traccion_v']) assert.ok(pats(T).has(x), fase + x);
    // Ningún básico ni explosivo baja de 3 series (lo de hoy: 2 series por ejercicio)
    for (const e of [...P.ej, ...T.ej].filter(e => e.p <= 3)) assert.ok(e.s >= 3, `${fase} ${e.id} ${e.s}`);
    // Músculo: femoral/aductor en pierna, brazos en torso; core al final de ambas
    assert.ok(P.ej.some(e => e.id === 'nordico') && T.ej.some(e => e.pat === 'flexion_codo' || e.pat === 'extension_codo'), fase);
    assert.ok(P.conAbs && T.conAbs);
    // Orden por bloques: explosividad, fuerza, músculo
    const orden = r => r.ej.map(e => ['Explosividad', 'Fuerza', 'Músculo'].indexOf(L.BLOQUE(e.p)));
    for (const r of [P, T]) assert.deepEqual(orden(r), [...orden(r)].sort((x, y) => x - y));
  }
  assert.equal(L.sesion('fuerzaA', 'base').n, 'Fuerza · Pierna'); assert.equal(L.sesion('fuerzaB', 'base').n, 'Fuerza · Torso');
  // Series alternadas: empuje ↔ tracción con descanso corto; si la pareja no entra, vuelve al descanso normal
  const T = arma('fuerzaB', 'construccion', 75), press = T.ej.find(e => e.id === 'press_incl');
  assert.equal(press.par, 'remo_barra'); assert.equal(press.d, L.PAR_DESC);
  const T60 = arma('fuerzaB', 'construccion', 60);
  assert.ok(T60.ej.every(e => !e.par || T60.ej.some(x => x.id === e.par)));
  const curl = T.ej.find(e => e.id === 'curl_mart');
  if (curl && !T.ej.some(e => e.id === 'tri_polea')) assert.ok(!curl.par && curl.d === 75);
  // Cambiar un ejercicio en pareja conserva la pareja y el descanso corto
  const c = L.armarRutina(75, L.sesion('fuerzaB', 'construccion').grupos, 1, { remo_barra: 'remo_polea' }, L.sesion('fuerzaB', 'construccion').plantilla);
  const rp = c.ej.find(e => e.id === 'remo_polea'); assert.ok(rp && rp.par === 'press_incl' && rp.orig === 'remo_barra' && rp.d === L.PAR_DESC);
  // Las sesiones con core piden 75 min en el calendario
  const dia = f => ({ fecha: f, d: L.dispDia([], f, { ahora: new Date('2026-10-26T06:00') }) });
  const rd = L.distribuir('construccion', L.metasSemana('construccion'), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'].map(dia));
  assert.ok(rd.dias.filter(d => d.item?.tipo.startsWith('fuerza')).every(d => d.min >= 75));
  // Descarga real: el volumen baja ≥ 40 % respecto de Construcción con las mismas cargas, y se mantienen Pierna y Torso
  const total = r => r.ej.reduce((n, e) => n + e.s, 0);
  for (const tipo of ['fuerzaA', 'fuerzaB']) {
    const c = total(arma(tipo, 'construccion', 90)), d = total(arma(tipo, 'descarga', 90));
    assert.ok(d <= Math.round(c * .6), `${tipo}: ${d} vs ${c}`);
  }
  assert.ok(arma('fuerzaA', 'descarga', 90).ej.some(e => e.id === 'nordico')); // la prevención no se quita
  assert.deepEqual(L.metasSemana('descarga').filter(x => x.fija).map(x => x.id), ['fuerzaA', 'fuerzaB', 'rounds']);
  assert.ok(!L.metasSemana('descarga').some(x => x.id === 'fuerzaA2' || x.id === 'fuerzaB2')); // sin 3.ª de fuerza en descarga
  assert.deepEqual(['base', 'construccion', 'especifica', 'descarga'].map(f => L.FASES[f].rpe), ['6-7', '7-8', '7-8', '6-7']);
  assert.equal(L.FASES.base.factor, 1); // Base baja el RPE, no las series
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
// Detalle por ejercicio: agrupa en orden, suma kg × reps y compara con la última vez
const dk = L.detalleKg(
  [{ ex: 'pm_hex', g: 'piernas', kg: 60, reps: 5 }, { ex: 'jalon', g: 'espalda', kg: 45, reps: 8 }, { ex: 'pm_hex', g: 'piernas', kg: 62.5, reps: 4 }, { ex: 'nordico', g: 'piernas', kg: null, reps: 5 }],
  [{ series: [{ ex: 'pm_hex', kg: 60, reps: 4 }] }, { series: [{ ex: 'pm_hex', kg: 60, reps: 5 }] }]);
assert.deepEqual(dk.map(e => e.ex), ['pm_hex', 'jalon', 'nordico']);
assert.deepEqual([dk[0].kg, dk[0].max, dk[0].reps, dk[0].antes], [550, 62.5, 9, 300]);
assert.deepEqual([dk[1].antes, dk[2].kg, dk[2].max], [null, 0, 0]);
console.log('ok tonelaje');

// Más opciones al cambiar un ejercicio: con barra ocupada quedan variantes con mancuernas, peso corporal o banda
{
  const r = L.armarRutina(90, ['espalda', 'empuje', 'piernas']);
  for (const e of r.ej.filter(e => e.p === 2 || e.p === 3)) assert.ok(L.alternativas(e, r.ej).length >= 4, e.id);
  assert.ok(L.alternativas({ id: 'remo_barra' }, r.ej).some(x => x.id === 'remo_inv'));
}

// Pierna + Torso juntos cubren todos los músculos (con 90 min); Torso cubre los 4 patrones aunque haya 60 min
{
  const arma = (k, min, fase = 'construccion') => { const s = L.sesion('fuerza' + k, fase, min); return L.armarRutina(min, s.grupos, s.factor, {}, s.plantilla); };
  const pat = new Set(arma('B', 60).ej.map(e => e.pat));
  for (const x of ['empuje_h', 'empuje_v', 'traccion_h', 'traccion_v']) assert.ok(pat.has(x), x);
  const dos = [...arma('A', 90).ej, ...arma('B', 90).ej, ...L.ABS].flatMap(e => e.m);
  for (const m of ['triceps', 'gemelos', 'biceps', 'pectorales', 'dorsales', 'cuadriceps', 'isquios', 'gluteos', 'aductores', 'deltoides_post', 'antebrazos', 'oblicuos']) assert.ok(dos.includes(m), m);
}
console.log('ok alternativas y cobertura');
