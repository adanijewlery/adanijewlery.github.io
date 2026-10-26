/* Self-contained collection: fixed composition previews and untouched source media. */
(() => {
 function initializeCollection(sectionId,dialogId,assetRoot){
  const section=document.querySelector(sectionId);if(!section)return;
  const cards=[...section.querySelectorAll('[data-tennis]')];
  const dialog=document.querySelector(dialogId),stage=dialog.querySelector('.tennis-stage');
  const large=dialog.querySelector('.tennis-large'),video=dialog.querySelector('video');
  const metalLabels={yellow:'Yellow gold',white:'White gold',rose:'Rose gold'};
  const state=new Map(cards.map(card=>[card.dataset.tennis,{metal:'yellow',revision:0}]));
  const sourceCache=new Map(),renderCache=new Map();let current,opener,dialogRevision=0;
  const purity=section.querySelector('[data-tennis-purity]');
  function setLink(link,key){
    const card=cards.find(c=>c.dataset.tennis===key),selected=state.get(key);
    link.href='https://wa.me/972545545132?text='+encodeURIComponent(`Hello ADANI, I'd like to enquire about ${card.dataset.name}.\nGold colour: ${metalLabels[selected.metal]}\nGold purity: ${purity.value}k${purity.value==='18'?' (made to order)':''}\nDiamonds: clear white\nPlease confirm diamond specifications, dimensions, availability and price.`);
  }
  function sync(){
    for(const card of cards){
      const selected=state.get(card.dataset.tennis);
      card.querySelectorAll('[data-tennis-metal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tennisMetal===selected.metal)));
      setLink(card.querySelector('.tennis-enquire'),card.dataset.tennis);
      const savedPreview=card.querySelector('.image-button');if(savedPreview)savedPreview.dataset.variant=metalLabels[selected.metal]+' · '+purity.value+'k';
    }
    if(sectionId==='#pieces')refreshSelection();
    if(current){
      dialog.querySelectorAll('[data-tennis-metal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tennisMetal===state.get(current).metal)));
      dialog.querySelector('[data-tennis-purity]').value=purity.value;
      setLink(dialog.querySelector('.tennis-enquire'),current);
    }
  }
  async function loadSource(key){
    if(sourceCache.has(key))return sourceCache.get(key);
    const pending=new Promise((resolve,reject)=>{
      const img=new Image();img.onload=()=>{try{
        const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
        resolve({data:ctx.getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width,height:canvas.height});
      }catch(e){reject(e);}};img.onerror=reject;img.src=`${assetRoot}/${key}-960.webp`;
    });
    if(sourceCache.size>=2)sourceCache.delete(sourceCache.keys().next().value);
    sourceCache.set(key,pending);try{return await pending;}catch(e){sourceCache.delete(key);throw e;}
  }
  async function photo(key,metal){
    if(metal==='yellow')return `${assetRoot}/${key}-960.webp`;
    const cacheKey=key+'|'+metal;if(renderCache.has(cacheKey))return renderCache.get(cacheKey);
    const original=await loadSource(key);const canvas=document.createElement('canvas');canvas.width=original.width;canvas.height=original.height;
    // Yield between strips so a phone can continue responding to touch.
    const output=new Uint8ClampedArray(original.data.length),strip=original.width*48*4;
    for(let p=0;p<output.length;p+=strip){output.set(window.TennisMaterials.recolourGold(original.data.subarray(p,p+strip),metal),p);await new Promise(resolve=>setTimeout(resolve,0));}
    canvas.getContext('2d').putImageData(new ImageData(output,original.width,original.height),0,0);
    const url=await new Promise(resolve=>canvas.toBlob(blob=>resolve(URL.createObjectURL(blob)),'image/png'));
    if(renderCache.size>=8){const old=renderCache.keys().next().value;URL.revokeObjectURL(renderCache.get(old));renderCache.delete(old);}
    renderCache.set(cacheKey,url);return url;
  }
  async function choose(key,metal){
    const selected=state.get(key),token=++selected.revision;
    const card=cards.find(c=>c.dataset.tennis===key),img=card.querySelector('img');
    img.setAttribute('aria-busy','true');card.querySelector('[role=status]').textContent='Updating your photo';
    try{
      const url=await photo(key,metal);if(token!==selected.revision)return;
      selected.metal=metal;img.removeAttribute('srcset');img.src=url;img.dataset.metal=metal;img.alt=card.dataset.name+' · '+metalLabels[metal];
      sync();card.querySelector('[role=status]').textContent='Your photo is ready';
      if(dialog.open&&current===key&&dialog.dataset.view==='styled')showStyled();
    }catch{card.querySelector('[role=status]').textContent='The finish could not update. Please choose it again.';}
    finally{if(token===selected.revision)img.removeAttribute('aria-busy');}
  }
  function stopVideo(){video.pause();video.removeAttribute('src');video.load();video.hidden=true;}
  async function showStyled(){
    const version=++dialogRevision;dialog.dataset.view='styled';stopVideo();dialog.scrollTop=0;large.hidden=false;
    dialog.querySelector('.tennis-dialog-options').hidden=false;

    dialog.querySelectorAll('[data-media]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.media==='styled')));
    const key=current,metal=state.get(key).metal;
    const url=await photo(key,metal);if(version!==dialogRevision||current!==key)return;
    large.src=url;large.alt=cards.find(c=>c.dataset.tennis===key).dataset.name+' · '+metalLabels[metal];
  }
  async function open(card,button){
    current=card.dataset.tennis;opener=button;sync();
    dialog.querySelector('h2').textContent=card.dataset.name;
    dialog.querySelector('.tennis-description').textContent=card.dataset.description;
    dialog.querySelector('.tennis-media').replaceChildren();
    if(!dialog.open)dialog.showModal();dialog.scrollTop=0;await showStyled();
    // This viewer presents styled photographs only.
    dialog.querySelector('.tennis-media').hidden=true;
  }
  for(const card of cards){
    card.querySelector('.tennis-photo').addEventListener('click',e=>open(card,e.currentTarget));
    card.querySelectorAll('[data-tennis-metal]').forEach(b=>b.addEventListener('click',()=>choose(card.dataset.tennis,b.dataset.tennisMetal)));
  }
  dialog.querySelectorAll('[data-tennis-metal]').forEach(b=>b.addEventListener('click',()=>choose(current,b.dataset.tennisMetal)));
  purity.addEventListener('change',sync);
  dialog.querySelector('[data-tennis-purity]').addEventListener('change',e=>{purity.value=e.target.value;sync();});
  dialog.querySelector('.tennis-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{++dialogRevision;stopVideo();opener?.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  sync();
 }
 initializeCollection('#tennis','#tennis-dialog','assets/tennis/retouched-v2');
 initializeCollection('#pieces','#sets-dialog','assets/sets/styled');
})();
