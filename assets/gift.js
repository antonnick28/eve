// Original generative instrumentals: no remote audio files or autoplay dependency.
let musicBusy = false;
let musicTimer = null, musicStep = 0, musicPlaying = false, musicGain = null;
const melodies = [[0,2,4,7,4,2,1,4,6,4,2,0,2,4,1,0],[4,6,7,4,2,1,0,2,4,2,0,1,2,4,2,0],[0,4,2,6,4,7,6,4,2,1,4,2,0,2,1,0]];
function musicNote(freq, duration, level) {
 const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), now = audioCtx.currentTime;
 osc.type = 'sine'; osc.frequency.value = freq; gain.gain.setValueAtTime(0,now); gain.gain.linearRampToValueAtTime(level,now+.04); gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
 osc.connect(gain); gain.connect(musicGain); osc.start(now); osc.stop(now+duration); osc.onended = () => {osc.disconnect();gain.disconnect();};
}
function musicBeat() {
 const melody = melodies[Number(document.getElementById('music-track').value)];
 musicNote(pentatonicScale[melody[musicStep % melody.length]],2.2,.18);
 if (musicStep % 4 === 0) musicNote(pentatonicScale[[0,2,4,1][Math.floor(musicStep/4)%4]]/2,3.5,.12);
 musicStep++;
}
function updateMusicUI() {
 document.getElementById('music-play').textContent = musicPlaying ? '❚❚ Pausar' : '▶ Escuchar';
 document.getElementById('music-play').setAttribute('aria-pressed',String(musicPlaying));
 document.getElementById('sound-toggle').setAttribute('aria-label',musicPlaying ? 'Pausar música' : 'Escuchar música');
 document.getElementById('sound-tooltip').textContent = musicPlaying ? 'Música: sonando' : 'Música: pausada';
 document.getElementById('music-status').textContent = musicPlaying ? 'Sonando para ti · melodía instrumental original' : 'Tres melodías originales para leer sin prisa';
}
async function toggleMusic() {
 if (musicBusy) return;
 musicBusy = true;
 try { await changeMusicState(); } finally { musicBusy = false; }
}
async function changeMusicState() {
 if (musicPlaying) { clearInterval(musicTimer); musicTimer = null; musicPlaying = false; audioEnabled = false; if (musicGain) musicGain.gain.setTargetAtTime(0,audioCtx.currentTime,.04); if (audioCtx) await audioCtx.suspend(); updateMusicUI(); return; }
 try {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.resume(); if (audioCtx.state !== 'running') throw new Error('Audio unavailable');
  if (!musicGain) { musicGain = audioCtx.createGain(); musicGain.connect(audioCtx.destination); }
  musicGain.gain.setValueAtTime(Number(document.getElementById('music-volume').value),audioCtx.currentTime);
  audioEnabled = true; musicPlaying = true; musicBeat(); musicTimer = setInterval(musicBeat,650); updateMusicUI();
 } catch { document.getElementById('music-status').textContent = 'No se pudo activar el sonido. Toca Escuchar para reintentar.'; }
}
document.getElementById('music-play').onclick = toggleMusic;
document.getElementById('music-track').onchange = () => {musicStep = 0;};
document.getElementById('music-volume').oninput = e => {if (musicGain) musicGain.gain.setTargetAtTime(Number(e.target.value),audioCtx.currentTime,.05);};
updateMusicUI();
