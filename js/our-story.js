/* Story-specific metadata and restrained reveals; translations use the shared site switcher. */
(() => {
 const descriptions={en:"Five generations of the Adani family's jewelry craftsmanship. Discover our heritage, the fifth generation's vision, original collections and bespoke creations.",he:'חמישה דורות של אומנות צורפות במשפחת עדני. גלו את המורשת שלנו, חזון הדור החמישי, קולקציות מקוריות ויצירות בעיצוב אישי.'};
 function metadata(){const lang=document.documentElement.lang==='he'?'he':'en';document.title='ADANI®';document.querySelector('meta[name="description"]').content=descriptions[lang];}
 metadata();new MutationObserver(metadata).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 document.querySelector('#story-year').textContent=new Date().getFullYear();
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 if(!motion.matches&&'IntersectionObserver' in window){
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.06});
   document.querySelectorAll('.story-reveal').forEach(element=>{if(element.getBoundingClientRect().top>innerHeight){element.classList.add('is-ready');observer.observe(element);}});
   motion.addEventListener('change',()=>{if(motion.matches){observer.disconnect();document.querySelectorAll('.story-reveal').forEach(element=>element.classList.add('is-visible'));}});
 }
})();
