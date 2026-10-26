/* Short previews on larger screens; every design remains available. */
(() => {
 const grid=document.querySelector('#tennis .tennis-grid');
 if(!grid)return;
 const cards=[...grid.children], media=matchMedia('(min-width:701px)');
 if(cards.length<=3)return;
 grid.id='tennis-collection-grid';
 const button=document.createElement('button');
 button.type='button';button.className='collection-expand';button.setAttribute('aria-controls',grid.id);
 let expanded=false;
 function update(){
   cards.forEach((card,index)=>{card.hidden=media.matches&&!expanded&&index>=3;});
   button.hidden=!media.matches;
   button.setAttribute('aria-expanded',String(expanded));
   button.textContent=expanded?'Show fewer bracelets':'View all tennis bracelets';
 }
 button.addEventListener('click',()=>{
   expanded=!expanded;update();
   if(!expanded)grid.querySelector('button')?.focus({preventScroll:true});
 });
 grid.after(button);media.addEventListener('change',update);update();
})();
