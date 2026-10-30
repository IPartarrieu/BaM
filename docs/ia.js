// Claude desde el navegador. La clave vive solo en este teléfono (localStorage 'bam-claude'), fuera de db y del respaldo.
const SDK = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.135.0/+esm';
const LLAVE = 'bam-claude';
export const clave = () => { try { return localStorage.getItem(LLAVE) || ''; } catch { return ''; } };
export const guardarClave = v => v ? localStorage.setItem(LLAVE, v) : localStorage.removeItem(LLAVE);

let A = null, cli = null, cliClave = '';
async function pedir(params) {
  const k = clave();
  if (!k) throw new Error('conecta Claude en ☰ con tu clave de API.');
  if (!A) A = (await import(SDK)).default;
  if (!cli || cliClave !== k) { cli = new A({ apiKey: k, dangerouslyAllowBrowser: true }); cliClave = k; }
  let r;
  try {
    r = await cli.beta.messages.create({ model: 'claude-opus-5-5', max_tokens: 16000, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default', ...params });
  } catch (e) {
    if (e instanceof A.AuthenticationError) throw new Error('la clave de Claude no es válida.');
    if (e instanceof A.RateLimitError) throw new Error('llegaste al límite de uso de Claude; prueba en un rato.');
    if (e instanceof A.APIConnectionError) throw new Error('sin conexión con Claude.');
    if (e instanceof A.APIError) throw new Error(`Claude respondió ${e.status}: ${e.message}`);
    throw e;
  }
  if (r.stop_reason === 'refusal') throw new Error('Claude no pudo responder esta consulta.');
  return r.content.filter(b => b.type === 'text').map(b => b.text).join('');
}

const num = { type: 'number' };
const COMIDA = { type: 'object', additionalProperties: false, required: ['comida', 'kcal', 'prot', 'cho', 'gra', 'nota'],
  properties: { comida: { type: 'string' }, kcal: num, prot: num, cho: num, gra: num, nota: { type: 'string' } } };

// items = [{t: texto, g: gramos}]; foto = dataURL JPEG o null.
export async function estimarComida(items, foto) {
  const lista = items.filter(x => x.t.trim()).map(x => `- ${x.t.trim()}${+x.g ? `: ${+x.g} g` : ''}`).join('\n');
  const content = foto ? [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: foto.split(',')[1] } }] : [];
  content.push({ type: 'text', text: `Estima las calorías y macronutrientes de lo que comí${foto ? ' (la foto es el plato)' : ''}.
${lista ? `Lo que comí, con el peso que medí:\n${lista}\n` : ''}Usa los pesos indicados tal cual; si falta un peso, estímalo por la foto o con una porción típica.
"comida": descripción corta en español con los pesos (ej. "Cerdo cantonés 200 g y arroz 100 g"). "nota": en una frase, qué supusiste.
kcal en kilocalorías; prot, cho y gra en gramos.` });
  return JSON.parse(await pedir({ output_config: { effort: 'low', format: { type: 'json_schema', schema: COMIDA } }, messages: [{ role: 'user', content }] }));
}

// Pregunta libre con los datos de la app como contexto.
export const preguntar = (q, datos) => pedir({
  output_config: { effort: 'medium' },
  system: `Eres el asistente de BaM, la app personal de entrenamiento (BJJ) y nutrición de su único usuario. Responde en español neutro, breve y concreto, sin modismos.
Datos actuales de la app (JSON):\n${JSON.stringify(datos)}`,
  messages: [{ role: 'user', content: q }],
});
