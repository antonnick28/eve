/* Sube MP3 a assets/music/ y agrega cada canción aquí. GitHub Pages sirve estos archivos sin configuración extra. */
const songs = [
  { title: 'No sé si me recuerdas', artist: 'Una canción para Eve', src: 'assets/music/No se si me recuerdas.mpeg', icon: '✦', tone: '#c99a4e' },
  { title: 'Un poquito más', artist: 'Una canción para Eve', src: 'assets/music/Un poquito más.mp3', icon: '⋆', tone: '#887ba2' },
  { title: 'Sal y respira', artist: 'Una canción para Eve', src: 'assets/music/Sal y Respira.mp3', icon: '☁', tone: '#79a0a4' },
  { title: 'Lo estoy intentando', artist: 'Una canción para Eve', src: 'assets/music/Lo Estoy Intentando.mp3', icon: '✦', tone: '#a18266' },
  { title: 'Cómo te sientes', artist: 'Una canción para Eve', src: 'assets/music/Como te Sientes.mp3', icon: '♡', tone: '#af7d70' },
  { title: 'Mi consejo', artist: 'Una canción para Eve', src: 'assets/music/Mi consejo.mp3', icon: '♡', tone: '#b27878' },
  { title: '1 Minuto', artist: 'Una canción para Eve', src: 'assets/music/1 Minuto.mp3', icon: '☀', tone: '#b88947' },
  { title: 'Si tú la quieres', artist: 'Una canción para Eve', src: 'assets/music/Si tú la quieres.mp3', icon: '♥', tone: '#b36f65' },
  { title: 'Aunque no te pueda ver', artist: 'Una canción para Eve', src: 'assets/music/Aunque no te pueda ver.mp3', icon: '☾', tone: '#768b72' },
  { title: 'Buenas Noches', artist: 'Una canción para Eve', src: 'assets/music/Buenas Noches.mp3', icon: '✦', tone: '#8f7aa6' },
  { title: 'Buenos días', artist: 'Una canción para Eve', src: 'assets/music/Buenos días.mp3', icon: '☀', tone: '#c99a4e' },
  { title: 'Fría como el viento', artist: 'Una canción para Eve', src: 'assets/music/Fria como el viento.mp3', icon: '⌁', tone: '#668a91' },
  { title: 'Gabi Rolón', artist: 'Una canción para Eve', src: 'assets/music/Gabi Rolon.mp3', icon: '✿', tone: '#809d70' },
  { title: 'Te quiero', artist: 'Una canción para Eve', src: 'assets/music/Te Quiero.mp3', icon: '♥', tone: '#bb7b65' },
  { title: 'Te vi pasar', artist: 'Una canción para Eve', src: 'assets/music/Te Vi Pasar.mp3', icon: '✧', tone: '#a58446' },
  // { title: 'Nombre de la canción', artist: 'Artista o dedicatoria', src: 'assets/music/cancion.mp3', icon: '✦', tone: '#c99a4e' },
];
const audio = new Audio(); let selected = 0;
const el = id => document.getElementById(id); const format = value => Number.isFinite(value) ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}` : '0:00';
function paint(){const list=el('tracks'),empty=el('no-tracks');list.replaceChildren();empty.hidden=!!songs.length;['play','previous','next'].forEach(id=>el(id).disabled=!songs.length);el('catalog-count').textContent=songs.length?`${songs.length} ${songs.length===1?'canción':'canciones'} para ella`:'Lista para recibir tus canciones';if(!songs.length)return;songs.forEach((song,index)=>{const row=document.createElement('button');row.className=`track${selected===index?' active':''}`;row.innerHTML=`<span class="track-num">${String(index+1).padStart(2,'0')}</span><span class="track-icon" style="--tone:${song.tone||'#c99a4e'}">${song.icon||'♪'}</span><span><strong>${song.title}</strong><small>${song.artist||'Para Eve'}</small></span><span class="track-end">${selected===index&&!audio.paused?'❚❚':'▶'}</span>`;row.onclick=()=>choose(index,true);list.append(row);});}
function update(){const song=songs[selected];if(!song)return;el('track-title').textContent=song.title;el('track-artist').textContent=song.artist||'Para Eve';el('album-symbol').textContent=song.icon||'♪';el('play').textContent=audio.paused?'▶':'❚❚';el('save-song').textContent=readSongFavorites().some(item=>item.src===song.src)?'♥ Guardada en favoritos':'♡ Guardar en favoritos';paint();}
function choose(index,autoplay=false){if(!songs.length)return;selected=(index+songs.length)%songs.length;audio.src=songs[selected].src;audio.load();update();if(autoplay)audio.play().catch(()=>el('catalog-count').textContent='Toca reproducir para escuchar esta canción.');}
function play(){if(!songs.length)return;if(!audio.src)choose(selected);audio.paused?audio.play():audio.pause();}
const readSongFavorites=()=>{try{return JSON.parse(localStorage.getItem('eve-music-favorites')||'[]')}catch{return[]}};
el('save-song').onclick=()=>{const song=songs[selected];if(!song)return;const saved=readSongFavorites(),exists=saved.some(item=>item.src===song.src),next=exists?saved.filter(item=>item.src!==song.src):[...saved,song];localStorage.setItem('eve-music-favorites',JSON.stringify(next));el('save-song').textContent=exists?'♡ Guardar en favoritos':'♥ Guardada en favoritos';};
el('play').onclick=play;el('previous').onclick=()=>choose(selected-1,true);el('next').onclick=()=>choose(selected+1,true);el('volume').oninput=e=>audio.volume=Number(e.target.value);el('progress').oninput=e=>{if(audio.duration)audio.currentTime=audio.duration*Number(e.target.value)/100};audio.onloadedmetadata=()=>el('duration').textContent=format(audio.duration);audio.ontimeupdate=()=>{el('current-time').textContent=format(audio.currentTime);el('progress').value=audio.duration?audio.currentTime/audio.duration*100:0};audio.onplay=update;audio.onpause=update;audio.onended=()=>choose(selected+1,true);audio.onerror=()=>el('catalog-count').textContent='No se encontró este MP3. Revisa su ruta.';if(songs.length)update();else paint();
