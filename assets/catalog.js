// Reviewed poetry-only collection. Links open the complete HTML book, not its listing.
const poetryCatalog = [
 {id:'70984',title:'En las orillas del Sar',author:'Rosalía de Castro',tag:'Naturaleza',color:'#344e47',mark:'botanical',note:'Paisajes que se convierten en sentimientos.'},
 {id:'50341',title:'Cantos de vida y esperanza',author:'Rubén Darío',tag:'Modernismo',color:'#945c43',mark:'sun',note:'La vida, el tiempo y la belleza de estar aquí.'},
 {id:'68525',title:'Poesías completas',author:'Antonio Machado',tag:'Introspección',color:'#465668',mark:'moon',note:'Caminos, recuerdos y un mundo interior.'},
 {id:'47650',title:'Prosas profanas y otros poemas',author:'Rubén Darío',tag:'Modernismo',color:'#745469',mark:'flower',note:'Música y mundos imaginados en cada verso.'},
 {id:'65880',title:'Las cien mejores poesías líricas',author:'Varios autores',tag:'Antología',color:'#8d7542',mark:'sun',note:'Una selección de la lírica en castellano.'},
 {id:'51569',title:'Poema del otoño y otros poemas',author:'Rubén Darío',tag:'Naturaleza',color:'#845144',mark:'botanical',note:'Estaciones, nostalgia y momentos fugaces.'},
 {id:'25807',title:'Poemas',author:'Edgar Allan Poe',tag:'Introspección',color:'#45445e',mark:'moon',note:'Una edición en español de su universo poético.'},
 {id:'51711',title:'El canto errante',author:'Rubén Darío',tag:'Modernismo',color:'#3c6669',mark:'flower',note:'Un viaje por la belleza y el oficio de escribir.'}
].map(b=>({...b,url:`https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}-images.html`,cover:`assets/covers/${b.id}.svg`}));
const $ = id => document.getElementById(id);
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let favoriteIds = [], activeShelf = 'biblioteca', activeTag = 'Todo', page = 1, lastBook = null;
try {const old=JSON.parse(localStorage.getItem('eve-books')||'[]'); if(Array.isArray(old)) favoriteIds=old.map(b=>typeof b==='string'?b:b?.id).filter(id=>poetryCatalog.some(b=>b.id===id)); lastBook=localStorage.getItem('eve-last-book');} catch {}
function toast(message){$('catalog-toast').textContent=message;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('catalog-toast').textContent='',5000);}
function rememberBook(book){lastBook=book.id;try{localStorage.setItem('eve-last-book',book.id);}catch{}renderContinue();}
function readingLink(book, label, cls=''){const a=document.createElement('a');a.href=book.url;a.target='_blank';a.rel='noopener noreferrer';a.className=cls;a.textContent=label;a.setAttribute('aria-label',`Leer ${book.title}, texto completo en otra pestaña`);a.addEventListener('click',()=>rememberBook(book));return a;}
function filteredBooks(){
 const query=normalize($('book-search').value.trim()),author=$('author-filter').value;
 const list=poetryCatalog.filter(b=>(activeShelf!=='favoritos'||favoriteIds.includes(b.id))&&(activeTag==='Todo'||b.tag===activeTag)&&(!author||b.author===author)&&normalize(b.title+' '+b.author).includes(query));
 if($('book-sort').value==='title')list.sort((a,b)=>a.title.localeCompare(b.title,'es'));
 if($('book-sort').value==='author')list.sort((a,b)=>a.author.localeCompare(b.author,'es'));
 return list;
}
function renderCatalog(){
 const list=filteredBooks(), grid=$('catalog-grid');grid.replaceChildren();
 $('catalog-count').textContent=`${list.length} ${list.length===1?'poemario':'poemarios'} ${activeShelf==='favoritos'?(list.length===1?'guardado':'guardados'):'para descubrir'}`;
 $('shelf-heading').textContent=activeShelf==='favoritos'?'Tus versos favoritos':'Explora la colección';
 $('favorite-count').textContent=String(favoriteIds.length);
 for(const book of list.slice(0,page*8)){
  const card=document.createElement('article');card.className='catalog-card';
  const cover=readingLink(book,'','cover-link');const img=document.createElement('img');img.src=book.cover;img.alt=`Cubierta ilustrada de ${book.title}`;img.width=400;img.height=560;img.loading='lazy';cover.append(img);
  const favorite=document.createElement('button');favorite.className='save-book';const selected=favoriteIds.includes(book.id);favorite.textContent=selected?'♥':'♡';favorite.setAttribute('aria-label',`${selected?'Quitar de':'Guardar en'} favoritos: ${book.title}`);favorite.setAttribute('aria-pressed',String(selected));favorite.onclick=()=>{favoriteIds=selected?favoriteIds.filter(id=>id!==book.id):[...favoriteIds,book.id];try{localStorage.setItem('eve-books',JSON.stringify(favoriteIds));}catch{toast('Favoritos guardados para esta visita.');}renderCatalog();};
  const tag=document.createElement('span');tag.className='book-tag';tag.textContent=book.tag;
  const title=document.createElement('h3');title.append(readingLink(book,book.title));
  const author=document.createElement('p');author.className='catalog-author';author.textContent=book.author;
  const action=readingLink(book,'Leer ahora ↗','read-book');
  card.append(cover,favorite,tag,title,author,action);grid.append(card);
 }
 $('catalog-empty').hidden=Boolean(list.length);
 $('catalog-empty-message').textContent=activeShelf==='favoritos'&&!favoriteIds.length?'Aún no has guardado ningún libro. Toca el corazón de una portada y lo encontrarás aquí.':'No hay libros con estos filtros. Prueba otro título, autor o colección.';
 $('surprise-book').disabled=!list.length;
}
function renderContinue(){const book=poetryCatalog.find(b=>b.id===lastBook);const el=$('continue-reading');el.replaceChildren();el.hidden=!book||activeShelf==='favoritos';if(book){const text=document.createElement('span');text.textContent='Tu última lectura';el.append(text,readingLink(book,`${book.title} →`));}}
function route(){
 const name=location.hash.slice(1)||'inicio';const catalog=['biblioteca','favoritos'].includes(name);activeShelf=name==='favoritos'?'favoritos':'biblioteca';
 $('gift-home').hidden=catalog||name==='musica';$('biblioteca').hidden=!catalog;$('musica').hidden=name!=='musica';
 document.body.classList.toggle('catalog-mode',catalog);document.body.classList.toggle('music-mode',name==='musica');
 document.querySelectorAll('[data-route]').forEach(a=>{const selected=a.dataset.route===(catalog?activeShelf:name==='musica'?'musica':'inicio');if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('catalog-feature').hidden=activeShelf==='favoritos';$('continue-reading').hidden=activeShelf==='favoritos'||!lastBook;
 renderCatalog();document.title=catalog?`${activeShelf==='favoritos'?'Mis favoritos':'Biblioteca de poesía'} · Para Eve`:'Para Eve · Un jardín de versos';
 document.body.classList.toggle('home-mode',!catalog&&name!=='musica');
 if(['inicio','biblioteca','favoritos','musica'].includes(name))window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange',route);
for(const author of [...new Set(poetryCatalog.map(b=>b.author))].sort()){const option=document.createElement('option');option.value=author;option.textContent=author;$('author-filter').append(option);}
for(const id of ['book-search','author-filter','book-sort'])$(id).addEventListener(id==='book-search'?'input':'change',()=>{page=1;renderCatalog();});
$('book-form').onsubmit=e=>{e.preventDefault();renderCatalog();};
document.querySelectorAll('[data-collection]').forEach(button=>button.onclick=()=>{activeTag=button.dataset.collection;document.querySelectorAll('[data-collection]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderCatalog();});
$('reset-filters').onclick=()=>{$('book-search').value='';$('author-filter').value='';activeTag='Todo';document.querySelectorAll('[data-collection]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.collection==='Todo')));renderCatalog();};
$('surprise-book').onclick=()=>{const list=filteredBooks();if(!list.length)return;const book=list[Math.floor(Math.random()*list.length)];rememberBook(book);window.open(book.url,'_blank','noopener,noreferrer');};
const featured=poetryCatalog[0];$('featured-read').href=featured.url;$('featured-read').onclick=()=>rememberBook(featured);
async function shareGift(){
 const url=new URL(location.href);url.hash='inicio';
 const local=['localhost','127.0.0.1',''].includes(url.hostname)||url.hostname.endsWith('.test');
 if(local){toast('Esta es una vista local. Para compartirla con Eve, primero hay que publicar la página en internet.');return;}
 try{if(navigator.share){await navigator.share({title:'Para Eve · Un jardín de versos',text:'Un rincón de flores y poesía para ti 🌻',url:url.href});}else if(navigator.clipboard){await navigator.clipboard.writeText(url.href);toast('Enlace copiado. Ya puedes compartir este jardín.');}else{$('share-url').hidden=false;$('share-url').value=url.href;$('share-url').select();toast('Copia este enlace para compartirlo.');}}catch(e){if(e.name!=='AbortError')toast('No se pudo compartir. Copia la dirección desde tu navegador.');}
}
$('share-gift').onclick=shareGift;
renderContinue();route();
