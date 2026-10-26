/* Give phone collection rows visible swipe and keyboard-friendly browse controls. */
(() => {
  const nav = document.createElement('nav');
  nav.className = 'mobile-shop-nav';
  nav.setAttribute('aria-label', 'Shop by category');
  const title = document.createElement('p');
  title.textContent = 'Shop by category';
  const links = document.createElement('div');
  [['rings','Rings'],['necklaces','Necklaces'],['bracelets','Bracelets'],['earrings','Earrings'],['sets','Sets'],['wedding','Wedding bands'],['design','Design your own']].forEach(([category,label]) => {
    const link = document.createElement('a');
    link.href = category === 'design' ? '#design' : '#pieces';
    const source = category === 'design' ? document.querySelector('#photo-studio-image') : document.querySelector(`#pieces [data-category="${category}"] img`);
    if (source) {
      const image = document.createElement('img');
      image.src = source.getAttribute('src'); image.alt = ''; image.loading = 'lazy';
      image.width = 56; image.height = 56; link.append(image);
    }
    const text = document.createElement('span'); text.textContent = label; link.append(text);
    if (category !== 'design') link.addEventListener('click', () => {
      document.querySelector(`[data-filter="${category}"]`)?.click();
      document.querySelector('#pieces .piece-grid')?.scrollTo({left:0,behavior:'instant'});
    });
    links.append(link);
  });
  nav.append(title, links); document.querySelector('.hero')?.after(nav);
  const selectors = '.inspiration-grid, #pieces .piece-grid, .tennis-grid, .house-feature-grid, .craft-films, .customer-review-grid, .detail-grid';
  document.querySelectorAll(selectors).forEach(rail => {
    if (rail.children.length < 2) return;
    const controls = document.createElement('div');
    controls.className = 'mobile-browse-controls';
    const hint = document.createElement('span');
    hint.textContent = 'Swipe to explore';
    const arrows = document.createElement('span');
    [-1, 1].forEach(direction => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = direction < 0 ? '←' : '→';
      button.setAttribute('aria-label', direction < 0 ? 'Previous items' : 'Next items');
      button.addEventListener('click', () => {
        const rtl = getComputedStyle(rail).direction === 'rtl' ? -1 : 1;
        const card = [...rail.children].find(child => !child.hidden);
        const distance = card ? card.getBoundingClientRect().width + 16 : rail.clientWidth;
        rail.scrollBy({left: direction * rtl * distance, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      });
      arrows.append(button);
    });
    controls.append(hint, arrows);
    rail.before(controls);
  });
})();
