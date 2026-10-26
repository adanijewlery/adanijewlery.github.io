// Add only verified business details here. Leave unused channels blank.
const business = { phone: '+972545545132', email: '', instagram: 'https://www.instagram.com/adanijewelry/' };
const contactLinks = document.querySelector('#contact-links');
const channels = [
  business.phone && { icon: 'whatsapp', label: 'WhatsApp ↗', href: `https://wa.me/${business.phone.replace(/\D/g, '')}` },
  business.phone && { icon: 'phone', label: 'Call us ↗', href: `tel:${business.phone.replace(/[^\d+]/g, '')}` },
  business.email && { label: 'Email us ↗', href: `mailto:${business.email}` },
  business.instagram && { icon: 'instagram', label: 'Instagram ↗', href: business.instagram }
].filter(Boolean);
if (channels.length) {
  contactLinks.replaceChildren(...channels.map(({label, href, icon}) => {
    const link = document.createElement('a');
    link.href = href;
    if (icon) {
      const image = document.createElement('img');
      image.src = `assets/icons/${icon}.svg`; image.alt = '';
      image.width = 24; image.height = 24;
      link.append(image);
    }
    const text = document.createElement('span'); text.textContent = label;
    link.append(text); return link;
  }));
}
document.querySelector('#year').textContent = new Date().getFullYear();
const dialog = document.querySelector('#piece-dialog');
const image = document.querySelector('#dialog-image');
const pieces = [...document.querySelectorAll('.piece')];
const filters = [...document.querySelectorAll('[data-filter]')];
const selectionFilter = document.querySelector('[data-filter="saved"]');
const selectionKey = 'adani-selection-v1';
const validPieceKeys = new Set(pieces.map(piece => piece.querySelector('.image-button').dataset.image));
let savedPieces = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(selectionKey) || '[]');
  if (Array.isArray(stored)) savedPieces = new Set(stored.filter(key => validPieceKeys.has(key)));
} catch { /* Selection still works for this visit when storage is unavailable. */ }
const whatsappBase = `https://wa.me/${business.phone.replace(/\D/g, '')}`;
function whatsappEnquiry(names) {
  const selected=names.map(name=>pieces.find(piece=>piece.querySelector('.image-button').dataset.name===name));
  if(selected.some(piece=>piece?.dataset.concept==='true')){
    const references=names.map((name,index)=>{const button=selected[index]?.querySelector('.image-button');return `${selected[index]?.dataset.concept==='true'?'AI concept reference':'Piece'}: ${name}${button?.dataset.variant?' · '+button.dataset.variant:''}`;}).join('\n');
    return `${whatsappBase}?text=${encodeURIComponent("Hello ADANI, I'd like to discuss a custom jewellery idea:\n"+references+"\nCould we discuss availability, materials and a quote?")}`;
  }
  const described = names.map((name,index)=>{const button=selected[index]?.querySelector('.image-button');return name+(button?.dataset.variant?' · '+button.dataset.variant:'');});
  return `${whatsappBase}?text=${encodeURIComponent(`Hello ADANI, I'd like to know more about ${described.join(', ')}.`)}`;
}
function refreshSelection() {
  selectionFilter.textContent = `Your selection (${savedPieces.size})`;
  pieces.forEach(piece => {
    const preview = piece.querySelector('.image-button');
    const save = piece.querySelector('.save-piece');
    const selected = savedPieces.has(preview.dataset.image);
    save.setAttribute('aria-pressed', String(selected));
    save.setAttribute('aria-label', selected ? `Remove ${preview.dataset.name} from your selection` : `Save ${preview.dataset.name}`);
  });
  const names = pieces.filter(piece => savedPieces.has(piece.querySelector('.image-button').dataset.image)).map(piece => piece.querySelector('.image-button').dataset.name);
  document.querySelector('#selection-enquire').href = whatsappEnquiry(names);
}
pieces.forEach(piece => {
  const preview = piece.querySelector('.image-button');
  const save = document.createElement('button');
  save.type = 'button'; save.className = 'save-piece';
  save.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 4.7a5.5 5.5 0 0 0-7.8 0L12 5.3l-.6-.6a5.5 5.5 0 0 0-7.8 7.8L12 21l8.4-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  save.addEventListener('click', () => {
    const key = preview.dataset.image;
    const removing = savedPieces.has(key);
    if (removing) savedPieces.delete(key); else savedPieces.add(key);
    try { localStorage.setItem(selectionKey, JSON.stringify([...savedPieces])); } catch { /* Keep the in-memory selection. */ }
    refreshSelection();
    document.querySelector('#selection-status').textContent = `${preview.dataset.name} ${removing ? 'removed from' : 'added to'} your selection.`;
    if (activeCategory === 'saved') {
      updateCabinet(true);
      if (removing) selectionFilter.focus({preventScroll:true});
    }
  });
  piece.append(save);
});
refreshSelection();

image.addEventListener('load', () => image.classList.remove('is-loading'));
image.addEventListener('error', () => image.classList.remove('is-loading'));
let opener;
let current;
function visibleButtons() { return pieces.filter(piece => !piece.hidden && !piece.dataset.customViewer).map(piece => piece.querySelector('.image-button')); }
function showPiece(button) {
  current = button;
  document.querySelector("#dialog-concept-note").hidden=button.dataset.concept!=="true";
  document.querySelector('#dialog-contact').href=whatsappEnquiry([button.dataset.name]);
  image.classList.add('is-loading');
  image.src = `assets/images/${button.dataset.image}-1600.webp`;
  image.alt = button.querySelector('img').alt;
  const views = document.querySelector('#photo-views');
  const photos = button.dataset.photos ? JSON.parse(button.dataset.photos) : [];
  const isVariantPicker=photos.some(photo=>photo.metal);
  views.classList.toggle('is-variant-picker',isVariantPicker);
  if(isVariantPicker)button.dataset.variant=photos[0].label;else delete button.dataset.variant;
  document.querySelector('#dialog-contact').href=whatsappEnquiry([button.dataset.name]);
  views.hidden = photos.length < 2;
  views.replaceChildren(...photos.map((photo, index) => {
    const view = document.createElement('button');
    view.type = 'button';
    if(isVariantPicker){
      const thumbnail=document.createElement('img');thumbnail.src=`assets/images/${photo.image}-160.webp`;thumbnail.alt='';thumbnail.width=160;thumbnail.height=160;thumbnail.loading='lazy';
      const label=document.createElement('span');label.textContent=photo.label;view.append(thumbnail,label);
    }else view.textContent = photo.label;
    view.setAttribute('aria-label', `${photo.label} of ${button.dataset.name}`);
    view.setAttribute('aria-pressed', String(index === 0));
    view.addEventListener('click', () => {
      image.classList.add('is-loading');
      image.src = `assets/images/${photo.image}-1600.webp`;
      image.alt = `${button.querySelector('img').alt} — ${photo.label}`;
      if(isVariantPicker){
        button.dataset.variant=photo.label;
        document.querySelector('#dialog-contact').href=whatsappEnquiry([button.dataset.name]);
        refreshSelection();
      }
      [...views.children].forEach(child => child.setAttribute('aria-pressed', String(child === view)));
    });
    return view;
  }));
  window.JadiCustomizer?.onOpen(button);
  window.DiamondGallery?.open(button);
  document.querySelector('#dialog-title').textContent = button.dataset.name;
  window.ClassicEarrings?.open(button,dialog);
  const visible = visibleButtons();
  document.querySelector('#gallery-position').textContent = `${visible.indexOf(button) + 1} / ${visible.length}`;
  document.querySelectorAll('.gallery-arrow').forEach(arrow => { arrow.hidden = visible.length < 2; });
}
function step(direction) {
  const visible = visibleButtons();
  showPiece(visible[(visible.indexOf(current) + direction + visible.length) % visible.length]);
}
pieces.filter(piece => !piece.dataset.customViewer).forEach(piece => piece.querySelector('.image-button').addEventListener('click', event => {
  opener = event.currentTarget;
  showPiece(opener);
  dialog.showModal();
}));
document.querySelector('.gallery-prev').addEventListener('click', () => step(-1));
document.querySelector('.gallery-next').addEventListener('click', () => step(1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
});
let touchStart;
image.addEventListener('touchstart', event => { const touch = event.changedTouches[0]; touchStart = {x:touch.clientX,y:touch.clientY}; }, {passive:true});
image.addEventListener('touchend', event => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(touch.clientY - touchStart.y) * 1.5) step(dx < 0 ? 1 : -1);
  touchStart = undefined;
}, {passive:true});
image.addEventListener('touchcancel', () => { touchStart = undefined; }, {passive:true});
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#dialog-contact').addEventListener('click', () => {
  const enquiry = document.querySelector('#enquiry-piece');
  enquiry.textContent = `Your selected piece: ${current.dataset.name}`;
  enquiry.hidden = false;
  contactLinks.querySelector('a[href^="https://wa.me/"]').href = whatsappEnquiry([current.dataset.name]);
  dialog.close();
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => { if (opener) opener.focus({preventScroll:true}); });
let activeCategory = 'all';
let jewelleryQuery = '';
let cabinetLimit = 6;
const moreButton = document.querySelector('#cabinet-more');
function updateCabinet(reveal = false) {
  document.querySelector('#pieces').dataset.activeCategory=activeCategory;
  const matches = pieces.filter(piece => {
    if(jewelleryQuery){
      const heading=piece.querySelector('h3')?.textContent||'';
      const name=piece.querySelector('.image-button').dataset.name;
      const category=filters.find(filter=>filter.dataset.filter===piece.dataset.category)?.textContent||piece.dataset.category;
      const searchable=(name+' '+heading+' '+category).normalize('NFKC').toLocaleLowerCase();
      if(!jewelleryQuery.split(/\s+/).every(word=>searchable.includes(word)))return false;
    }
    if (activeCategory === 'all') return piece.dataset.category !== 'wedding' || Boolean(jewelleryQuery);
    if (activeCategory === 'saved') return savedPieces.has(piece.querySelector('.image-button').dataset.image);
    if (activeCategory === 'instagram') return piece.dataset.concept !== 'true' && Boolean(piece.querySelector('a.instagram-source'));
    return piece.dataset.category === activeCategory;
  });
  pieces.forEach(piece => { piece.hidden = true; });
  matches.slice(0, cabinetLimit).forEach(piece => {
    piece.hidden = false;
    if (reveal) piece.classList.add('is-revealed');
  });
  const shown = Math.min(cabinetLimit, matches.length);
  document.querySelector('#search-empty').hidden = !jewelleryQuery || matches.length > 0;
  document.querySelector('#cabinet-count').textContent = `${shown < matches.length ? `${shown} of ` : ''}${matches.length} ${matches.length === 1 ? 'piece' : 'pieces'}`;
  document.querySelector('#selection-empty').hidden = activeCategory !== 'saved' || matches.length > 0;
  document.querySelector('.selection-enquiry').hidden = activeCategory !== 'saved' || matches.length === 0;
  moreButton.hidden = shown >= matches.length;
  moreButton.textContent = `View ${matches.length - shown} more ${matches.length - shown === 1 ? 'piece' : 'pieces'} ↓`;
}
filters.forEach(button => button.addEventListener('click', () => {
  const intro = document.querySelector('#pieces .section-heading > p');
  if (intro) { intro.replaceChildren(document.createTextNode(button.dataset.filter === 'wedding' ? 'Wedding bands without diamonds.' : button.dataset.filter === 'saved' ? 'Your selected jewellery.' : 'Jewellery with diamonds.'), document.createElement('br'), document.createTextNode('Select a piece to discover its details.')); }
  jewelleryQuery = '';
  document.querySelector('#site-search').value = '';
  activeCategory = button.dataset.filter;
  cabinetLimit = 6;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  updateCabinet(true);
}));
moreButton.addEventListener('click', () => {
  const previousLimit = cabinetLimit;
  cabinetLimit = pieces.length;
  updateCabinet(true);
  const firstNew = pieces.filter(piece => !piece.hidden)[previousLimit];
  if (firstNew) firstNew.querySelector('.image-button').focus({preventScroll:true});
});
updateCabinet();
document.querySelector('.cabinet-tools').hidden = false;
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
  }), {threshold:0.08});
  document.querySelectorAll('.piece, .house-note, .perspective-copy, .detail-grid figure').forEach(element => {
    if (element.getBoundingClientRect().top > innerHeight) { element.classList.add('reveal-ready'); observer.observe(element); }
  });
}



// A direct Sets link also selects its category when another filter was active.
function openSetsFromHash(){if(location.hash!=='#sets')return;document.querySelector('[data-filter="sets"]')?.click();requestAnimationFrame(()=>document.querySelector('#sets')?.scrollIntoView({block:'start',behavior:'instant'}));}
window.addEventListener('hashchange',openSetsFromHash);window.addEventListener('load',()=>requestAnimationFrame(openSetsFromHash),{once:true});openSetsFromHash();

// Search the same collection so all existing previews and enquiry controls stay available.
const jewellerySearch=document.querySelector('#site-search');
function searchJewellery(){
 const intro=document.querySelector('#pieces .section-heading > p');
 if(intro)intro.replaceChildren(document.createTextNode('Explore the collection.'),document.createElement('br'),document.createTextNode('Select a piece to discover its details.'));
 jewelleryQuery=jewellerySearch.value.normalize('NFKC').trim().toLocaleLowerCase();
 activeCategory='all';cabinetLimit=jewelleryQuery?pieces.length:6;
 filters.forEach(filter=>filter.setAttribute('aria-pressed',String(filter.dataset.filter==='all')));
 document.querySelector('#pieces').classList.remove('collection-awaiting');
 updateCabinet(true);
}
jewellerySearch.addEventListener('input',searchJewellery);
document.querySelector('.header-search').addEventListener('submit',event=>{
 event.preventDefault();searchJewellery();document.querySelector('#pieces').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
});
