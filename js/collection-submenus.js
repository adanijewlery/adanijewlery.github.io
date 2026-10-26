/* Collection submenus: real inventory only, translated without changing product data. */
(() => {
 const tiles=document.querySelector('.collection-categories');if(!tiles)return;
 const labels={rings:['Rings','טבעות','Кольца'],necklaces:['Necklaces','שרשראות','Колье'],bracelets:['Bracelets','צמידים','Браслеты'],earrings:['Earrings','עגילים','Серьги'],sets:['Sets','סטים','Комплекты'],tennis:['Tennis','טניס','Теннисные браслеты'],wedding:['Wedding bands','טבעות נישואין','Обручальные кольца']};
 const groups={
 rings:[[['Solitaire rings','טבעות סוליטר','Солитеры'],/solitaire|trilogy|five-stone|half-eternity|channel|duet/],[['East–west rings','טבעות בשיבוץ רוחבי','Кольца East–West'],/east-west/],[['Sculptural & duet rings','טבעות פיסוליות ודואט','Скульптурные кольца'],/bypass|duet|bridge|wave|sculptural/],[['Coloured stones','אבנים צבעוניות','Цветные камни'],/pink|yellow pear|emerald tears/]],
 necklaces:[[['Lariats & drop necklaces','שרשראות לאריאט וטיפה','Колье-лариат'],/lariat|drop/],[['Pendants','שרשראות תליון','Подвески'],/pendant|eye necklace/],[['Collars','שרשראות קולר','Колье-воротники'],/collar/],[['Layered & station necklaces','שרשראות שכבות ותחנות','Многослойные колье'],/layered|station/]],
 bracelets:[[['Bangles & cuffs','צמידים קשיחים','Жёсткие браслеты'],/bangle|cuff/],[['Cord bracelets','צמידי חוט','Браслеты на шнурке'],/cord/],[['Diamond tennis bracelets','צמידי טניס יהלומים','Теннисные браслеты'],/tennis/],[['Jadi hand chains','צמידי כף יד ג׳אדי','Браслеты на кисть'],/jadi|hand chain/],[['Station & duet bracelets','צמידי תחנות ודואט','Браслеты с подвесками'],/station|duet/]],
 earrings:[[['Stud earrings','עגילים צמודים','Пусеты'],/stud/],[['Hoops & huggies','עגילי חישוק','Серьги-кольца'],/hoop|hugg/],[['Drop earrings','עגילים תלויים','Серьги-подвески'],/drop/],[['Climbers','עגילים מטפסים','Каффы'],/climber/]],
 sets:[[['Emerald-cut sets','סטים בחיתוך אמרלד','Комплекты с изумрудной огранкой'],/emerald/],[['Pear-cut sets','סטים בחיתוך טיפה','Комплекты с грушевидной огранкой'],/pear/],[['Round & oval sets','סטים עגולים ואובליים','Комплекты с круглой огранкой'],/round|oval/]],
 tennis:[[['Round & classic','עגול וקלאסי','Круглая огранка'],/round|classic/],[['Step-cut tennis','חיתוך מדרגות','Ступенчатая огранка'],/emerald|baguette|rectangular/],[['Mixed & alternating cuts','חיתוכים משולבים','Смешанная огранка'],/mixed|alternating/]],wedding:[[['Smooth bands','טבעות חלקות','Гладкие кольца'],/polished/],[['Textured bands','טבעות עם טקסטורה','Фактурные кольца'],/hammered|brushed|fluted|satin|milgrain|braided|bark|geometric|sandblast/],[['Two-tone bands','שילוב שני גוונים','Двухцветные кольца'],/two-tone/]]};
 const panel=document.createElement('section');panel.id='collection-submenu';panel.className='collection-submenu';panel.hidden=true;panel.setAttribute('aria-labelledby','collection-submenu-title');panel.setAttribute('translate','no');tiles.after(panel);
 let current=null,bypass=false;
 const lang=()=>document.documentElement.lang==='he'?1:document.documentElement.lang==='ru'?2:0;
 const t=values=>values[lang()];
 function cards(category){return [...document.querySelectorAll(category==='tennis'?'#tennis .tennis-card':`#pieces .piece[data-category="${category}"]`)];}
 function name(card){return (card.querySelector('[data-name]')?.dataset.name||card.dataset.name||'')+' '+(card.querySelector('[data-image]')?.dataset.image||'');}
 function close(focus=false){panel.hidden=true;tiles.querySelectorAll('button').forEach(b=>b.setAttribute('aria-expanded','false'));if(focus&&current)tiles.querySelector(`[data-open-collection="${current}"]`)?.focus({preventScroll:true});}
 function show(category,scroll=false,keyboard=false){
  const tile=tiles.querySelector(`[data-open-collection="${category}"]`);if(!tile)return;current=category;panel.replaceChildren();panel.hidden=false;
  tiles.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-controls',panel.id);b.setAttribute('aria-expanded',String(b===tile));});
  const image=tile.querySelector('img')?.cloneNode();if(image){image.alt='';image.className='submenu-image';panel.append(image);}
  const body=document.createElement('div');body.className='submenu-body';const heading=document.createElement('h3');heading.id='collection-submenu-title';heading.textContent=t(labels[category]);body.append(heading);
  const list=document.createElement('div');list.className='submenu-links';const inventory=cards(category);
  const options=[[[t(['View all','לכל הקולקציה','Смотреть все'])],null],...(groups[category]||[]).filter(([,pattern])=>inventory.some(card=>pattern.test(name(card))))];
  for(const [title,pattern] of options){const button=document.createElement('button');button.type='button';button.textContent=title.length===1?title[0]:t(title);const matches=inventory.filter(card=>!pattern||pattern.test(name(card)));const count=document.createElement('span');count.textContent=String(matches.length);count.setAttribute('aria-hidden','true');button.append(count);button.addEventListener('click',()=>{
   bypass=true;tile.click();bypass=false;
   if(category==='tennis'){inventory.forEach(card=>{card.hidden=!matches.includes(card);});}else document.dispatchEvent(new CustomEvent('adani:subcategory',{detail:{images:pattern?matches.map(card=>card.querySelector('.image-button').dataset.image):null}}));
   close();requestAnimationFrame(()=>document.querySelector(category==='tennis'?'#tennis .tennis-card:not([hidden]) button':'#pieces .piece:not([hidden]) .image-button')?.focus({preventScroll:true}));
  });list.append(button);}body.append(list);panel.append(body);
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='submenu-close';dismiss.textContent='×';dismiss.setAttribute('aria-label',t(['Close subcategories','סגירת תתי הקטגוריות','Закрыть подкатегории']));dismiss.addEventListener('click',()=>close(true));panel.append(dismiss);
  if(document.documentElement.dataset.reduceMotion!=='true'&&!matchMedia('(prefers-reduced-motion:reduce)').matches&&panel.animate){panel.getAnimations().forEach(animation=>animation.cancel());panel.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.7,.2,1)'});}
  if(keyboard)panel.querySelector('.submenu-links button')?.focus({preventScroll:true});
  if(scroll){const height=document.querySelector('header')?.getBoundingClientRect().height||0;window.scrollTo({top:scrollY+panel.getBoundingClientRect().top-height-12,behavior:document.documentElement.dataset.reduceMotion==='true'||matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
 }
 document.addEventListener('click',event=>{const tile=event.target.closest('[data-open-collection]');if(tile&&!bypass){event.preventDefault();event.stopImmediatePropagation();show(tile.dataset.openCollection,true,event.detail===0);}},true);
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close(true);}});
 document.addEventListener('click',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!tiles.contains(event.target))close();});
 document.querySelector('#site-language')?.addEventListener('change',()=>{if(!panel.hidden)show(current);});
})();
