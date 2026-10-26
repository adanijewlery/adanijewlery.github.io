/* Transparent opening navigation; solid header and search after scrolling. */
(() => {
 const header=document.querySelector('.header'),form=header?.querySelector('.header-search'),input=form?.querySelector('input');if(!form)return;
 const openingPicture=document.querySelector('.hero');
 function update(){const atTop=openingPicture?openingPicture.getBoundingClientRect().bottom>0:scrollY<100;header.classList.toggle("is-at-page-top",atTop);header.inert=false;form.hidden=atTop;}
 let pending=false;
 addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{update();pending=false;});},{passive:true});
 addEventListener('resize',update,{passive:true});
 input.addEventListener('blur',update);input.addEventListener('focus',update);
 if('ResizeObserver' in window)new ResizeObserver(()=>document.documentElement.style.setProperty('--site-header-height',`${header.getBoundingClientRect().height}px`)).observe(header);
 update();
})();
