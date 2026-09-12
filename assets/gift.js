/*
 * CATÁLOGO DE MÚSICA
 * 1. Crea la carpeta assets/music/
 * 2. Sube allí tus archivos .mp3
 * 3. Añade una línea por canción. "src" es la ruta del archivo.
 */
const musicCatalog = [
  // { title: 'Nombre de la canción', artist: 'Artista o una dedicatoria', src: 'assets/music/mi-cancion.mp3', color: '#d9a441', icon: '☀' },
];

let activeTrack = 0;
const player = new Audio();
player.preload = 'metadata';
const music = id => document.getElementById(id);
const time = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';

function renderMusic() {
  const list = music('music-list'), empty = music('music-empty');
  if (!list) return;
  list.replaceChildren(); empty.hidden = musicCatalog.length > 0;
  ['music-play', 'music-prev', 'music-next'].forEach(id => music(id).disabled = !musicCatalog.length);
  if (!musicCatalog.length) return;
  musicCatalog.forEach((track, index) => {
    const row = document.createElement('button'); row.className = `track-row${index === activeTrack ? ' is-active' : ''}`; row.type = 'button';
    row.innerHTML = `<span class="track-number">${String(index + 1).padStart(2, '0')}</span><span class="track-icon" style="--track-color:${track.color || '#d9a441'}">${track.icon || '♪'}</span><span class="track-meta"><strong>${track.title}</strong><small>${track.artist || 'Para Eve'}</small></span><span class="track-play">${index === activeTrack && !player.paused ? '❚❚' : '▶'}</span>`;
    row.addEventListener('click', () => selectTrack(index, true)); list.append(row);
  });
}
function updatePlayer() {
  const track = musicCatalog[activeTrack]; if (!track) return;
  music('current-track-title').textContent = track.title; music('current-track-artist').textContent = track.artist || 'Para Eve';
  music('music-art').style.setProperty('--art-color', track.color || '#d9a441'); music('music-art').querySelector('span').textContent = track.icon || '♪';
  music('music-status').textContent = `${musicCatalog.length} ${musicCatalog.length === 1 ? 'canción' : 'canciones'} en tu colección`;
  music('music-play').innerHTML = player.paused ? '▶' : '❚❚'; music('music-play').setAttribute('aria-label', player.paused ? 'Reproducir' : 'Pausar'); renderMusic();
}
function selectTrack(index, autoplay = false) {
  if (!musicCatalog.length) return; activeTrack = (index + musicCatalog.length) % musicCatalog.length;
  player.src = musicCatalog[activeTrack].src; player.load(); updatePlayer();
  if (autoplay) player.play().catch(() => { music('music-status').textContent = 'Toca reproducir para escuchar esta canción.'; });
}
function toggleMusic() {
  if (!musicCatalog.length) return; if (!player.src) selectTrack(activeTrack);
  if (player.paused) player.play().catch(() => { music('music-status').textContent = 'No pudimos iniciar la canción. Revisa que el archivo esté en assets/music.'; }); else player.pause();
}
player.addEventListener('loadedmetadata', () => { music('music-duration').textContent = time(player.duration); });
player.addEventListener('timeupdate', () => { music('music-current-time').textContent = time(player.currentTime); music('music-progress').value = player.duration ? player.currentTime / player.duration * 100 : 0; });
player.addEventListener('play', updatePlayer); player.addEventListener('pause', updatePlayer); player.addEventListener('ended', () => selectTrack(activeTrack + 1, true));
player.addEventListener('error', () => { music('music-status').textContent = 'No se encontró el archivo. Verifica la ruta de esta canción.'; });
document.addEventListener('DOMContentLoaded', () => {
  music('music-play')?.addEventListener('click', toggleMusic); music('music-prev')?.addEventListener('click', () => selectTrack(activeTrack - 1, true)); music('music-next')?.addEventListener('click', () => selectTrack(activeTrack + 1, true));
  music('music-volume')?.addEventListener('input', event => { player.volume = Number(event.target.value); }); music('music-progress')?.addEventListener('input', event => { if (player.duration) player.currentTime = player.duration * Number(event.target.value) / 100; }); renderMusic();
  document.querySelectorAll('.validation-pill').forEach(pill => pill.addEventListener('click', () => { music('pill-message').textContent = pill.dataset.message; music('pill-modal').hidden = false; music('pill-close').focus(); }));
  const closePill = () => { music('pill-modal').hidden = true; }; music('pill-close')?.addEventListener('click', closePill); music('pill-modal')?.addEventListener('click', event => { if (event.target === event.currentTarget) closePill(); });
});
function closeLetter() { const modal = document.getElementById('envelope-modal'); modal.classList.add('is-leaving'); setTimeout(() => { modal.hidden = true; }, 500); }
function openGiftEnvelope() { document.querySelector('.letter-scene').classList.add('is-open'); setTimeout(() => { document.getElementById('letter-message').hidden = false; }, 450); }
function toggleAudio() { toggleMusic(); }
