/* A locally combined, silent workshop film used as the section background. */
(() => {
 const section=document.querySelector('#craft'),video=section?.querySelector('.craft-background-video');
 if(!video)return;
 const phone=matchMedia('(max-width:700px)'),motion=matchMedia('(prefers-reduced-motion:reduce)');
 let visible=false,automaticAllowed=!motion.matches&&!navigator.connection?.saveData;
 video.muted=true;
 function source(){
   const path=phone.matches?video.dataset.phone:video.dataset.desktop;
   video.poster=`assets/craft/atelier-loop-${phone.matches?'phone':'desktop'}.jpg`;
   if(video.getAttribute('src')!==path){video.src=path;video.load();}
 }
 async function play(){source();try{await video.play();}catch{/* Keep the poster visible when autoplay is blocked. */}}
 function update(){if(visible&&!document.hidden&&automaticAllowed)play();else video.pause();}
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.08}).observe(section);
 document.addEventListener('visibilitychange',update);
 motion.addEventListener('change',()=>{automaticAllowed=!motion.matches&&!navigator.connection?.saveData;update();});
 phone.addEventListener('change',()=>{if(video.getAttribute('src'))source();else video.poster=`assets/craft/atelier-loop-${phone.matches?'phone':'desktop'}.jpg`;update();});
 video.poster=`assets/craft/atelier-loop-${phone.matches?'phone':'desktop'}.jpg`;
})();
