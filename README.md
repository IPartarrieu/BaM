# BaM · Becoming a Machine

App personal (PWA) que arma el entrenamiento hacia una meta (por ejemplo, volver a BJJ en 4 semanas) según el tiempo disponible y el Google Calendar. https://ipartarrieu.github.io/BaM/
La base técnica (fases, zonas de FC, nutrición, rachas) está en [METODOLOGIA.md](METODOLOGIA.md).

- **Plan:** meta con fecha → fases Base / Construcción / Específica / Descarga; perfil (edad, peso, FC reposo) → zonas Karvonen; metas de la semana (sesiones fijas ⭐ y variables) repartidas en los huecos libres del Google Calendar; el día anterior eliges sesión, hora y minutos, y la app mueve el bloque "Ejercicio" en el calendario. Sin horario fijo.
- **Inicio:** meta y fase, sesión de hoy, metas del día con racha (moverse + 4 de 6), registro de actividad, nutrición del día, silueta muscular y, los lunes, resumen de la semana anterior.
- **Entrenar:** clima del día (Open-Meteo) → tiempo sugerido → grupos → rutina: calentamiento 5 min → ejercicios (series × reps × kg) → Core (rutina fija de abdominales con disco) → elongar 5 min. Timer de descanso al marcar cada serie.
- **Nutrición:** objetivo (perder grasa, mantener o ganar músculo) → calorías y macros del día según la sesión del plan → menú de 4 comidas con gramos. Registras lo que comiste ("comí esto" u "otra cosa" con kcal y proteína) y la silueta, tu Pal, reacciona: se ilumina con la proteína y cambia la cara según las calorías. Registro de peso y ritmo esperado hacia el peso meta.
- **Avance:** meta de 3 sesiones/semana, hexágono por grupo (volumen y subida de carga), evolución de kg por ejercicio, logros, historial y respaldo JSON.
- Datos solo en el teléfono (localStorage `bam-v1`).

## Dónde cambiar qué

| Cambio | Archivo |
|---|---|
| Fases, metas fijas/variables, series por fase | `docs/logic.js` → `FASES`, `sesion`, `metasSemana` |
| Zonas de FC, nutrición, regla de la racha | `docs/logic.js` → `ZONAS`, `CHO`/`TIP`/`nutricion`, `diaCumplido` |
| Cómo se lee el calendario (palabras clave, ventana de horas) | `docs/logic.js` → `RE_ENTRENO`, `RE_DEPORTE`, `dispDia`, `ubicar`, `distribuir`; acceso con el Apps Script `apps-script/Calendario.gs` |
| Ejercicios, orden, series, descansos, músculos que trabajan | `docs/logic.js` → `GRUPOS` (el orden de la lista es la prioridad) |
| Abdominales de Core, rondas y descansos | `docs/logic.js` → `ABS`, `ABS_RONDAS`, `ABS_DESC_EJ`, `ABS_DESC_RONDA` |
| Calentamiento / elongación | `docs/logic.js` → `CALENTAMIENTO`, `ELONGACION` |
| Cuántos ejercicios caben por hora | `docs/logic.js` → `CAMBIO_SEG` (hoy 1 h + Core = 3 ejercicios) |
| Minutos sugeridos según clima | `docs/logic.js` → `interpretarClima` |
| Meta semanal, logros, nivel del hexágono | `docs/logic.js` → `META`, `logros`, `niveles` |
| Silueta (formas de músculos) | `docs/app.js` → `CONTORNO_DER`, `FRENTE`, `ESPALDA` (puntos del lado derecho, se espejan) |
| Objetivos, calorías por tipo de día, reparto de macros | `docs/logic.js` → `OBJETIVOS`, `ACTIVIDAD`, `dieta` |
| Alimentos, comidas y combinaciones del menú | `docs/logic.js` → `ALIMENTOS`, `COMIDAS` |
| Mensajes y caras del Pal | `docs/logic.js` → `animoPal`; dibujo en `docs/app.js` → `silueta(pal)` |
| Básicos de hoy | `docs/app.js` → `BASICOS` |
| Pantallas | `docs/app.js` → `vistaInicio`, `vistaHoy`, `vistaEntreno`, `vistaNutricion`, `vistaAvance` |

Al agregar o quitar archivos precargados, subir la versión `CACHE` en `docs/sw.js`.

Pruebas: `node tests/logic.test.mjs` · Publicar: commit + `git push` (GitHub Pages se actualiza en 1–2 min).

## Google Calendar

La app lee el calendario y mueve el bloque "Ejercicio" con un Apps Script personal (`apps-script/Calendario.gs`), sin Google Cloud. Pega el script en script.google.com con un `TOKEN` propio, agrega el servicio avanzado Google Calendar API y publícalo como aplicación web ("Ejecutar como: yo"; acceso: cualquier usuario, pero sin el token no entrega nada). Luego pega en 🎯 Plan el enlace `…/exec?token=TU_TOKEN`. El enlace queda solo en el teléfono, y la app vuelve a leer el calendario al abrirse si pasaron más de 6 h. La copia con el token real va en `apps-script/*.local.gs`, que git ignora.
