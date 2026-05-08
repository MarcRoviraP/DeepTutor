import './scene.js';
import { hablar, parar } from './tts.js';
import { setAvatarScale, setAvatarY, setAvatarX, setAvatarZ } from './scene.js';

// ─── Eventos UI ───────────────────────────────────────────────────────
document.getElementById('btn-go').addEventListener('click', hablar);
document.getElementById('btn-stop').addEventListener('click', parar);
document.getElementById('txt').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); hablar(); }
});

document.getElementById('sl-scale').addEventListener('input', function () {
  const mult = parseFloat(this.value);
  document.getElementById('lbl-scale').textContent = mult.toFixed(2) + 'x';
  setAvatarScale(mult);
});
document.getElementById('sl-y').addEventListener('input', function () {
  const y = parseFloat(this.value);
  document.getElementById('lbl-y').textContent = y.toFixed(2);
  setAvatarY(y);
});
document.getElementById('sl-x').addEventListener('input', function () {
  const x = parseFloat(this.value);
  document.getElementById('lbl-x').textContent = x.toFixed(2);
  setAvatarX(x);
});
document.getElementById('sl-z').addEventListener('input', function () {
  const z = parseFloat(this.value);
  document.getElementById('lbl-z').textContent = z.toFixed(2);
  setAvatarZ(z);
});

// Communication with parent (DeepTutor Chat)
window.addEventListener('message', async (event) => {
  if (event.data.type === 'speak') {
    const { hablarTexto } = await import('./tts.js');
    hablarTexto(event.data.text);
  }
  if (event.data.type === 'stop') {
    const { parar } = await import('./tts.js');
    parar();
  }
});
