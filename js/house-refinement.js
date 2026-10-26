/* Small, local enhancements. Native scrolling and keyboard behavior are retained. */
(() => {
  for(const button of document.querySelectorAll('[data-feature]')){
    button.addEventListener('click',()=>{
      const key=button.dataset.feature;
      const target=[...document.querySelectorAll('.piece .image-button')].find(item=>item.dataset.image===key);
      if(!target)return;
      const filter=document.querySelector('[data-filter="all"]');
      filter?.click();
      // Reveal a featured product before opening it so gallery navigation includes it.
      if(target.closest('.piece').hidden)document.querySelector('#cabinet-more')?.click();
      target.click();
      const gallery=document.querySelector('#piece-dialog');
      gallery?.addEventListener('close',()=>button.focus({preventScroll:true}),{once:true});
    });
  }
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.addEventListener('click',event=>{
      const control=event.target.closest('.save-piece,.cabinet-filters button,.inspiration-filters button,.photo-option');
      if(!control||control.disabled)return;
      control.classList.remove('house-pressed');
      requestAnimationFrame(()=>control.classList.add('house-pressed'));
      control.addEventListener('animationend',()=>control.classList.remove('house-pressed'),{once:true});
    });
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}
      }),{threshold:.08});
      for(const element of document.querySelectorAll('.house-feature,.house-conversation>div')){
        if(element.getBoundingClientRect().top>innerHeight){element.classList.add('reveal-ready');observer.observe(element);}
      }
    }
  }
})();
