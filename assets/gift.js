// The curated shelf remains available if the public catalog is temporarily down.
const curatedBooks = [
 {id:'rimas',title:'Rimas',author:'Gustavo Adolfo Bécquer',url:'https://es.wikisource.org/wiki/Rimas_(B%C3%A9cquer)'},
 {id:'versos',title:'Versos sencillos',author:'José Martí',url:'https://es.wikisource.org/wiki/Versos_sencillos'},
 {id:'52894',title:'Azul…',author:'Rubén Darío',url:'https://www.gutenberg.org/ebooks/52894'}
];
let books = [...curatedBooks], saved = [], favoritesOnly = false, requestNumber = 0;
try { const value = JSON.parse(localStorage.getItem('eve-books') || '[]'); if (Array.isArray(value)) saved = value.filter(b => b && typeof b.id === 'string' && typeof b.title === 'string' && typeof b.author === 'string' && safeBookUrl(b.url)); } catch {}
function safeBookUrl(value) { try { const u = new URL(value); return u.protocol === 'https:' && ['www.gutenberg.org','gutenberg.org','es.wikisource.org'].includes(u.hostname); } catch { return false; } }
function visibleBooks() {
 const query = document.getElementById('book-search').value.trim().toLocaleLowerCase('es');
 return (favoritesOnly ? saved : books).filter(b => (b.title + ' ' + b.author).toLocaleLowerCase('es').includes(query));
}
function renderBooks() {
 const grid = document.getElementById('book-grid'); grid.replaceChildren();
 const list = visibleBooks();
 for (const book of list) {
  const card = document.createElement('article'); card.className = 'book-card';
  const cover = document.createElement('div'); cover.className = 'book-cover';
  const title = document.createElement('h3'); title.textContent = book.title;
  const author = document.createElement('p'); author.textContent = book.author;
  cover.append(title, author);
  const info = document.createElement('div'); info.className = 'book-info';
  const link = document.createElement('a'); link.textContent = 'Abrir libro ↗'; link.href = safeBookUrl(book.url) ? book.url : 'https://www.gutenberg.org/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', 'Abrir ' + book.title + ' en otra pestaña');
  const favorite = document.createElement('button'); favorite.className = 'favorite'; const selected = saved.some(b => b.id === book.id); favorite.textContent = selected ? '♥' : '♡'; favorite.setAttribute('aria-pressed', String(selected)); favorite.setAttribute('aria-label', (selected ? 'Quitar de' : 'Guardar en') + ' favoritos: ' + book.title);
  favorite.onclick = () => { saved = selected ? saved.filter(b => b.id !== book.id) : [...saved,book]; try { localStorage.setItem('eve-books',JSON.stringify(saved)); } catch { document.getElementById('library-status').textContent = 'Tus favoritos se conservarán durante esta visita.'; } renderBooks(); };
  info.append(link,favorite); card.append(cover,info); grid.append(card);
 }
 if (!list.length) { const empty = document.createElement('p'); empty.textContent = favoritesOnly ? 'Todavía no hay favoritos que coincidan. Guarda un libro con el corazón ♡.' : 'No hay coincidencias. Prueba otro autor o título.'; grid.append(empty); }
}
async function loadBooks() {
 const current = ++requestNumber; const status = document.getElementById('library-status');
 status.textContent = 'Buscando más versos para ti…';
 const controller = new AbortController(); const timer = setTimeout(() => controller.abort(),10000);
 try {
  const query = document.getElementById('book-search').value.trim();
  const url = new URL('https://gutendex.com/books/'); url.search = new URLSearchParams({languages:'es',topic:'poetry',search:query});
  const response = await fetch(url,{signal:controller.signal}); if (!response.ok) throw new Error('Catalog unavailable');
  const data = await response.json(); if (!Array.isArray(data.results)) throw new Error('Invalid catalog');
  if (current !== requestNumber) return;
  const incoming = data.results.filter(b => Number.isInteger(b.id) && typeof b.title === 'string').map(b => ({id:String(b.id),title:b.title,author:(b.authors || []).map(a=>a.name).join(' · ') || 'Autor anónimo',url:'https://www.gutenberg.org/ebooks/' + b.id}));
  books = [...new Map([...curatedBooks,...incoming].map(b=>[b.id,b])).values()];
  status.textContent = incoming.length ? 'Poesía en español, lista para acompañarte. Abre un libro y quédate un ratito.' : 'No encontramos más títulos. Puedes explorar nuestra selección.';
  renderBooks();
 } catch { if (current === requestNumber) { status.textContent = 'El catálogo está descansando. Nuestra selección sigue aquí para ti; puedes reintentar con «Buscar más».'; renderBooks(); } }
 finally { clearTimeout(timer); }
}
document.getElementById('book-search').addEventListener('input',renderBooks);
document.getElementById('book-form').addEventListener('submit',e=>{e.preventDefault();loadBooks();});
document.getElementById('favorites-toggle').onclick = e => { favoritesOnly = !favoritesOnly; e.currentTarget.setAttribute('aria-pressed',String(favoritesOnly)); e.currentTarget.textContent = favoritesOnly ? 'Ver todos los libros' : 'Mis favoritos ♡'; renderBooks(); };
document.getElementById('surprise-book').onclick = () => { const cards = [...document.querySelectorAll('.book-card')]; if (!cards.length) return; const card = cards[Math.floor(Math.random()*cards.length)]; card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'center'}); card.querySelector('a').focus({preventScroll:true}); };
renderBooks(); loadBooks();

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
