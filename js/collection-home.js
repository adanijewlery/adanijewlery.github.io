/* Open the chosen collection directly, including the dedicated Tennis gallery. */
(() => {
 const section=document.querySelector('#pieces');if(!section)return;
 const tennisPanel=document.querySelector('#tennis-collection-panel');
 const tennisButton=document.querySelector('[data-open-collection="tennis"]');
 function selectCategory(category){document.querySelectorAll('[data-open-collection]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.openCollection===category)));}
 selectCategory(null);
 function selectCategory(category){document.querySelectorAll('[data-open-collection]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.openCollection===category)));}
 selectCategory(null);
 section.classList.add('collection-awaiting');
 function scrollCabinet(behavior='smooth'){
  const target=section.querySelector('.cabinet-tools');if(!target)return;
  const headerHeight=document.querySelector('header')?.getBoundingClientRect().height||0;
  window.scrollTo({top:Math.max(0,scrollY+target.getBoundingClientRect().top-headerHeight-16),behavior});
 }
 function closeTennis(){
  if(tennisPanel)tennisPanel.open=false;
  tennisButton?.setAttribute('aria-expanded','false');
 }
 function openTennis(scroll=true){
  if(!tennisPanel)return;
  section.classList.add('collection-awaiting');
  tennisPanel.open=true;
  selectCategory('tennis');
  selectCategory('tennis');
  tennisButton?.setAttribute('aria-expanded','true');
  if(scroll)requestAnimationFrame(()=>{
   // Land on the bracelet controls and images, below the fixed header.
   const target=tennisPanel.querySelector('.tennis-purity')||tennisPanel;
   target.scrollIntoView({block:'start',behavior:'instant'});
  });
 }
 section.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  section.classList.remove('collection-awaiting');closeTennis();
  selectCategory(button.dataset.filter);
  selectCategory(button.dataset.filter);
 }));
 document.querySelectorAll('[data-open-collection]').forEach(button=>button.addEventListener('click',()=>{
  if(button.dataset.openCollection==='tennis'){openTennis();return;}
  section.querySelector(`[data-filter="${button.dataset.openCollection}"]`)?.click();
  scrollCabinet();
 }));
 tennisPanel?.addEventListener('toggle',()=>tennisButton?.setAttribute('aria-expanded',String(tennisPanel.open)));
 function revealLinkedCollection(){
  if(location.hash==='#tennis')openTennis();
  if(location.hash==='#wedding'){section.classList.remove('collection-awaiting');closeTennis();section.querySelector('[data-filter="wedding"]')?.click();requestAnimationFrame(()=>scrollCabinet('instant'));}
  if(location.hash==='#sets'){section.classList.remove('collection-awaiting');closeTennis();}
 }
 window.addEventListener('hashchange',revealLinkedCollection);revealLinkedCollection();
})();
