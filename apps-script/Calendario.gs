// Apps Script personal de BaM: lee tus calendarios y mueve (o crea) el bloque "Ejercicio" de un día.
// 1. script.google.com → Nuevo proyecto → pegar esto con tu TOKEN.
// 2. Servicios (+) → Google Calendar API → Agregar (mueve una sola ocurrencia de la serie sin tocar las demás).
// 3. Implementar → Nueva implementación → Aplicación web, "Ejecutar como: yo", acceso "Cualquier usuario".
//    Sin el token no responde nada. Si cambias el código: Implementar → Gestionar implementaciones → editar → Nueva versión.
const TOKEN = 'CAMBIAR_POR_UN_TEXTO_LARGO_AL_AZAR';
const BLOQUE = t => /ejercicio|entren|gym|gimnasio/i.test(t) && !/suave|elong/i.test(t);

function doGet(e) {
  const p = e.parameter;
  if (p.token !== TOKEN) return json({ error: 'token' });
  const desde = new Date(p.desde), hasta = new Date(p.hasta);
  if (isNaN(desde) || isNaN(hasta) || hasta <= desde || hasta - desde > 31 * 864e5) return json({ error: 'rango de fechas inválido' });
  if (p.accion === 'mover') return json(mover(desde, hasta, new Date(p.ini), new Date(p.fin)));
  const ev = CalendarApp.getAllOwnedCalendars()
    .flatMap(c => c.getEvents(desde, hasta))
    .filter(x => !x.isAllDayEvent())
    .map(x => ({ t: x.getTitle(), ini: x.getStartTime().toISOString(), fin: x.getEndTime().toISOString() }));
  return json({ ev });
}

// Mueve el bloque de entreno del día [desde, hasta) a [ini, fin]; si no hay, lo crea. Solo esa ocurrencia.
function mover(desde, hasta, ini, fin) {
  if (isNaN(ini) || isNaN(fin) || fin <= ini || ini < desde || fin > hasta) return { error: 'horario inválido' };
  const items = Calendar.Events.list('primary', { timeMin: desde.toISOString(), timeMax: hasta.toISOString(), singleEvents: true }).items || [];
  const b = items.find(x => x.start && x.start.dateTime && BLOQUE(x.summary || ''));
  const cuerpo = { start: { dateTime: ini.toISOString() }, end: { dateTime: fin.toISOString() } };
  if (b) { Calendar.Events.patch(cuerpo, 'primary', b.id); return { ok: 'movido' }; }
  Calendar.Events.insert({ summary: 'Ejercicio', ...cuerpo }, 'primary');
  return { ok: 'creado' };
}

const json = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
