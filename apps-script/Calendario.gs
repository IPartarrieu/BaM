// Apps Script personal: entrega a BaM los eventos de tus calendarios (solo lectura).
// Pegar en script.google.com → Implementar → Nueva implementación → Aplicación web,
// "Ejecutar como: yo", "Quién tiene acceso: cualquier usuario". Sin el token no entrega nada.
const TOKEN = 'CAMBIAR_POR_UN_TEXTO_LARGO_AL_AZAR';

function doGet(e) {
  if (e.parameter.token !== TOKEN) return json({ error: 'token' });
  const desde = new Date(e.parameter.desde), hasta = new Date(e.parameter.hasta);
  if (isNaN(desde) || isNaN(hasta) || hasta - desde > 31 * 864e5) return json({ error: 'rango de fechas inválido' });
  const ev = CalendarApp.getAllOwnedCalendars()
    .flatMap(c => c.getEvents(desde, hasta))
    .filter(x => !x.isAllDayEvent())
    .map(x => ({ t: x.getTitle(), ini: x.getStartTime().toISOString(), fin: x.getEndTime().toISOString() }));
  return json({ ev });
}

const json = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
