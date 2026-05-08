import { setHablando } from './scene.js';

let _audio    = null;
let _sesionId = 0;

const badge    = document.getElementById('badge');
const badgeTxt = document.getElementById('badge-txt');
const atag     = document.getElementById('atag');
const viz      = document.getElementById('viz');
const btnGo    = document.getElementById('btn-go');

function setOn(v) {
  setHablando(v);
  badge.classList.toggle('on', v);
  atag.classList.toggle('on',  v);
  viz.classList.toggle('on',   v);
  badgeTxt.textContent = v ? 'hablando...' : 'en espera';
  atag.textContent     = v ? 'activo'      : 'inactivo';
  btnGo.disabled       = v;
  btnGo.textContent    = v ? '⏳ generando...' : '▶ Hablar';
}

function addMsg(txt, cls = 'msg-av') {
  const el = document.createElement('div');
  el.className = 'msg ' + cls;
  el.textContent = txt;
  const log = document.getElementById('log');
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

// ─── Chunking ─────────────────────────────────────────────────────────
// Divide en ~500 ± 80 chars, cortando en límite limpio de frase.
// Prioridad: [.!?…;] > [,] > espacio > fuerza en límite
function dividirEnChunks(texto, targetLen = 500, tolerancia = 80) {
  const chunks = [];
  let resto = texto.trim();

  while (resto.length > targetLen + tolerancia) {
    const limite = targetLen + tolerancia;
    let corte = hallarCorte(resto, targetLen, limite, /[.!?…;]\s+/g);
    if (corte === -1) corte = hallarCorte(resto, targetLen, limite, /,\s+/g);
    if (corte === -1) corte = hallarCorte(resto, targetLen, limite, /\s+/g);
    if (corte === -1) corte = limite;
    chunks.push(resto.slice(0, corte).trim());
    resto = resto.slice(corte).trim();
  }
  if (resto.length) chunks.push(resto);
  return chunks;
}

function hallarCorte(texto, desde, hasta, regex) {
  regex.lastIndex = 0;
  let ultimo = -1, m;
  while ((m = regex.exec(texto)) !== null) {
    const pos = m.index + m[0].length;
    if (pos >= desde && pos <= hasta) ultimo = pos;
    if (pos > hasta) break;
  }
  return ultimo;
}

// ─── Fetch de un chunk ────────────────────────────────────────────────
async function fetchChunk(texto, apiURL) {
  const res = await fetch(apiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texto }),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j?.detail?.message || j?.detail || msg; } catch {}
    throw new Error(msg);
  }
  return URL.createObjectURL(await res.blob());
}

// ─── Reproducción en cadena con prefetch ──────────────────────────────
export async function hablar() {
  const texto  = document.getElementById('txt').value.trim();
  const apiURL = document.getElementById('apiurl').value.trim();
  if (!texto)  { addMsg('⚠ Escribe algo primero.', 'msg-sys'); return; }
  if (!apiURL) { addMsg('⚠ Configura la URL de la API.', 'msg-sys'); return; }

  parar();
  const sesion = ++_sesionId;
  setOn(true);
  addMsg(texto, 'msg-user');

  const chunks = dividirEnChunks(texto);
  const total  = chunks.length;
  if (total > 1) addMsg(`📦 ${total} fragmentos`, 'msg-sys');

  const urls  = new Array(total).fill(null);
  const errs  = new Array(total).fill(null);
  const fired = new Set();

  function prefetch(i) {
    if (i >= total || fired.has(i)) return;
    fired.add(i);
    fetchChunk(chunks[i], apiURL)
      .then(u => { urls[i] = u; })
      .catch(e => { errs[i] = e.message; });
  }

  prefetch(0); prefetch(1);

  try {
    for (let i = 0; i < total; i++) {
      if (_sesionId !== sesion) return;
      prefetch(i + 2);

      if (total > 1) badgeTxt.textContent = `hablando ${i + 1}/${total}…`;

      while (!urls[i] && !errs[i]) {
        if (_sesionId !== sesion) return;
        await new Promise(r => setTimeout(r, 80));
      }
      if (errs[i]) throw new Error(`Fragmento ${i + 1}: ${errs[i]}`);

      await new Promise((res, rej) => {
        if (_sesionId !== sesion) { URL.revokeObjectURL(urls[i]); res(); return; }
        const a = new Audio(urls[i]);
        _audio = a;
        a.onended = () => { URL.revokeObjectURL(urls[i]); res(); };
        a.onerror = () => { URL.revokeObjectURL(urls[i]); rej(new Error('Error de audio')); };
        a.play().catch(rej);
      });
    }
    if (_sesionId === sesion) {
      setOn(false);
      document.getElementById('txt').value = '';
    }
  } catch (e) {
    if (_sesionId === sesion) {
      setOn(false);
      addMsg(`⚠ ${e.message}`, 'msg-sys');
      console.error('TTS Error:', e);
    }
  }
}

export async function hablarTexto(texto) {
  const apiURL = document.getElementById('apiurl').value.trim();
  if (!texto || !apiURL) return;

  parar();
  const sesion = ++_sesionId;
  setOn(true);

  const chunks = dividirEnChunks(texto);
  const total  = chunks.length;

  const urls  = new Array(total).fill(null);
  const errs  = new Array(total).fill(null);
  const fired = new Set();

  function prefetch(i) {
    if (i >= total || fired.has(i)) return;
    fired.add(i);
    fetchChunk(chunks[i], apiURL)
      .then(u => { urls[i] = u; })
      .catch(e => { errs[i] = e.message; });
  }

  prefetch(0); prefetch(1);

  try {
    for (let i = 0; i < total; i++) {
      if (_sesionId !== sesion) return;
      prefetch(i + 2);

      while (!urls[i] && !errs[i]) {
        if (_sesionId !== sesion) return;
        await new Promise(r => setTimeout(r, 80));
      }
      if (errs[i]) throw new Error(`Fragmento ${i + 1}: ${errs[i]}`);

      await new Promise((res, rej) => {
        if (_sesionId !== sesion) { URL.revokeObjectURL(urls[i]); res(); return; }
        const a = new Audio(urls[i]);
        _audio = a;
        a.onended = () => { URL.revokeObjectURL(urls[i]); res(); };
        a.onerror = () => { URL.revokeObjectURL(urls[i]); rej(new Error('Error de audio')); };
        a.play().catch(rej);
      });
    }
    if (_sesionId === sesion) setOn(false);
  } catch (e) {
    if (_sesionId === sesion) {
      setOn(false);
      console.error('TTS Error:', e);
    }
  }
}

export function parar() {
  _sesionId++;
  if (_audio) { _audio.pause(); _audio = null; }
  setOn(false);
}
