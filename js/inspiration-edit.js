/* Original AI design ideas, kept separate from photographed ADANI stock. */
(() => {
  const section=document.querySelector('#inspiration');
  if(!section)return;
  const cards=[...section.querySelectorAll('[data-inspiration-category]')];
  const filters=[...section.querySelectorAll('[data-inspiration-filter]')];
  const more=section.querySelector('#inspiration-more');
  const dialog=document.querySelector('#inspiration-dialog');
  const image=dialog.querySelector('img');
  let category='all',expanded=false,opener;
  function update(){
    section.dataset.activeCategory=category;
    const sizes=category==="all"?"(max-width:700px) 44vw, (max-width:1000px) 44vw, (max-width:1199px) 28vw, 21vw":"(max-width:1000px) 44vw, 28vw";
    cards.forEach(card=>{card.querySelector("img").sizes=sizes;});
    const matches=cards.filter(card=>category==='all'||card.dataset.inspirationCategory===category);
    const limit=category==='all'&&!expanded?12:matches.length;
    cards.forEach(card=>{card.hidden=true;});
    matches.slice(0,limit).forEach(card=>{card.hidden=false;});
    more.hidden=category!=='all'||expanded;
    section.querySelector('#inspiration-count').textContent=`${Math.min(limit,matches.length)} / ${matches.length}`;
  }
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.inspirationFilter;
    filters.forEach(filter=>filter.setAttribute('aria-pressed',String(filter===button)));
    update();
  }));
  more.addEventListener('click',()=>{
    expanded=true;update();
    cards[12]?.querySelector('button')?.focus({preventScroll:true});
  });
  cards.forEach(card=>{
    const button=card.querySelector('.inspiration-photo');
    button.addEventListener('click',()=>{
      opener=button;
      image.src=`assets/images/${button.dataset.image}-1600.webp`;
      image.alt=card.dataset.designName;
      dialog.querySelector('h2').textContent=card.dataset.designName;
      dialog.querySelector('.inspiration-dialog-enquire').href=card.querySelector('.inspiration-enquire').href;
      window.ClassicEarrings?.open(button,dialog);
      dialog.showModal();
    });
  });
  dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  });
  update();
})();
