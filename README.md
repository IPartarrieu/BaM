# BaM · Becoming a Machine

App personal (PWA) para seguir el entrenamiento de gimnasio orientado a BJJ. https://ipartarrieu.github.io/BaM/

- **Inicio:** "Básicos de hoy" (agua, snack, elongar), silueta muscular tocable (músculo → grupo y ejercicios) y, los lunes, resumen de la semana anterior.
- **Entrenar:** clima del día (Open-Meteo) → tiempo sugerido → grupos → rutina: calentamiento 5 min → ejercicios (series × reps × kg) → Core (rutina fija de abdominales con disco) → elongar 5 min. Timer de descanso al marcar cada serie.
- **Avance:** meta de 3 sesiones/semana, hexágono por grupo (volumen y subida de carga), evolución de kg por ejercicio, logros, historial y respaldo JSON.
- Datos solo en el teléfono (localStorage `bam-v1`).

## Dónde cambiar qué

| Cambio | Archivo |
|---|---|
| Ejercicios, orden, series, descansos, músculos que trabajan | `docs/logic.js` → `GRUPOS` (el orden de la lista es la prioridad) |
| Abdominales de Core, rondas y descansos | `docs/logic.js` → `ABS`, `ABS_RONDAS`, `ABS_DESC_EJ`, `ABS_DESC_RONDA` |
| Calentamiento / elongación | `docs/logic.js` → `CALENTAMIENTO`, `ELONGACION` |
| Cuántos ejercicios caben por hora | `docs/logic.js` → `CAMBIO_SEG` (hoy 1 h + Core = 3 ejercicios) |
| Minutos sugeridos según clima | `docs/logic.js` → `interpretarClima` |
| Meta semanal, logros, nivel del hexágono | `docs/logic.js` → `META`, `logros`, `niveles` |
| Silueta (formas de músculos) | `docs/app.js` → `CONTORNO_DER`, `FRENTE`, `ESPALDA` (puntos del lado derecho, se espejan) |
| Básicos de hoy | `docs/app.js` → `BASICOS` |
| Pantallas | `docs/app.js` → `vistaInicio`, `vistaHoy`, `vistaEntreno`, `vistaAvance` |

Al agregar o quitar archivos precargados, subir la versión `CACHE` en `docs/sw.js`.

Pruebas: `node tests/logic.test.mjs` · Publicar: commit + `git push` (GitHub Pages se actualiza en 1–2 min).
