/* Fixed-photo metal choices for the Jadi. Diamond and velvet pixels are immutable. */
(() => {
  const piece = document.querySelector('#jadi-hand-chain');
  if (!piece) return;
  const preview = piece.querySelector('.image-button');
  const cardImage = preview.querySelector('img');
  const dialog = document.querySelector('#piece-dialog');
  const dialogImage = document.querySelector('#dialog-image');
  const finishes = { white: 'White gold', yellow: 'Yellow gold', rose: 'Rose gold' };
  const cache = new Map();
  let selected = 'white', revision = 0, sourcePromise;
  const controls = [];
  // Coordinates refer to the original 1254px square photograph. The masks cover
  // all five individual stations / clusters, including their neutral edge pixels.
  const diamonds = [[307,260,17,16],[660,174,17,17],[532,300,48,53],
    [633,540,17,18],[737,777,53,53],[838,995,18,19]];
  function protectedDiamond(x,y,width,height) {
    const px=x*1254/width, py=y*1254/height;
    return diamonds.some(([cx,cy,rx,ry])=>((px-cx)/rx)**2+((py-cy)/ry)**2<=1);
  }
  function recolour(data,width,height,finish) {
    const output = new Uint8ClampedArray(data);
    if (finish === 'white') return output;
    const tone = finish === 'yellow' ? [.12,.58] : [.055,.43];
    for (let i=0;i<width*height;i++) {
      if(protectedDiamond(i%width,Math.floor(i/width),width,height))continue;
      const p=i*4,r=data[p]/255,g=data[p+1]/255,b=data[p+2]/255;
      const hi=Math.max(r,g,b),lo=Math.min(r,g,b),s=hi?(hi-lo)/hi:0;
      // The velvet is blue; only warm-neutral metal reflections qualify.
      if(lo<.055 || hi<.13 || r<b*.84 || g<b*.85 || s>.48)continue;
      const l=(hi+lo)/2;
      const alpha=Math.min(1,(r/b-.84)/.12)*Math.min(1,(hi-.13)/.10);
      const saturation=tone[1]*Math.max(.12,1-l**5),a=saturation*Math.min(l,1-l);
      const channel=n=>{const k=(n+tone[0]*12)%12;return (l-a*Math.max(-1,Math.min(k-3,9-k,1)))*255;};
      const rgb=[channel(0),channel(8),channel(4)];
      for(let c=0;c<3;c++)output[p+c]=data[p+c]*(1-alpha)+rgb[c]*alpha;
    }
    return output;
  }
  function source() {
    if(!sourcePromise)sourcePromise=new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>{
        try{
          const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
          const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
          resolve({pixels:ctx.getImageData(0,0,canvas.width,canvas.height),width:canvas.width,height:canvas.height});
        }catch(error){sourcePromise=null;reject(error);}
      };
      image.onerror=()=>{sourcePromise=null;reject(new Error('Jadi photograph could not load'));};
      image.src='assets/images/jadi-hand-chain-velvet-960.webp';
    });
    return sourcePromise;
  }
  async function photo(finish) {
    if(cache.has(finish))return cache.get(finish);
    const original=await source();
    const canvas=document.createElement('canvas');canvas.width=original.width;canvas.height=original.height;
    canvas.getContext('2d').putImageData(new ImageData(recolour(original.pixels.data,original.width,original.height,finish),original.width,original.height),0,0);
    // Lossless output keeps protected diamond pixels identical in every finish.
    const url=canvas.toDataURL('image/png');cache.set(finish,url);return url;
  }
  function makeControls() {
    const box=document.createElement('div');box.className='jadi-finishes';box.hidden=true;
    box.innerHTML='<span>Choose your gold</span><div role="group" aria-label="Gold colour">'+Object.entries(finishes).map(([key,label])=>`<button type="button" data-jadi-metal="${key}" aria-pressed="${key==='white'}"><i aria-hidden="true" class="jadi-swatch ${key}"></i><span>${label}</span></button>`).join('')+'</div>';
    box.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>select(button.dataset.jadiMetal)));
    controls.push(box);return box;
  }
  const dialogControls=makeControls();document.querySelector('#dialog-title').after(dialogControls);
  const status=document.createElement('p');status.className='jadi-finish-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');dialogControls.append(status);
  function isOpen(){return dialog.open&&dialog.dataset.jadi==='true';}
  function updateLinks(){
    preview.dataset.variant=finishes[selected];
    const message=`Hello ADANI, I'd like to know more about Jadi hand chain · ${finishes[selected]}. Diamonds: clear white.`;
    piece.querySelector('.house-piece-enquire').href='https://wa.me/972545545132?text='+encodeURIComponent(message);
    if(isOpen())document.querySelector('#dialog-contact').href=whatsappEnquiry(['Jadi hand chain']);
    refreshSelection();
  }
  async function select(finish){
    const token=++revision;
    cardImage.setAttribute('aria-busy','true');status.textContent='Updating your photo';
    try{
      const url=await photo(finish);if(token!==revision)return;
      selected=finish;cardImage.removeAttribute('srcset');cardImage.src=url;
      cardImage.alt=`Jadi hand chain · ${finishes[finish]} · Clear white diamonds`;
      cardImage.dataset.metal=finish;
      controls.forEach(box=>box.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.jadiMetal===finish))));
      if(isOpen()){dialogImage.src=url;dialogImage.alt=cardImage.alt;}
      updateLinks();status.textContent='Your photo is ready';
    }catch{status.textContent='The finish could not update. Please choose it again.';}
    finally{if(token===revision)cardImage.removeAttribute('aria-busy');}
  }
  window.JadiCustomizer={
    onOpen(button){
      const isJadi=button===preview;dialog.dataset.jadi=String(isJadi);dialogControls.hidden=!isJadi;
      if(isJadi){
        preview.dataset.variant=finishes[selected];
        document.querySelector('#dialog-contact').href=whatsappEnquiry(['Jadi hand chain']);
        refreshSelection();
        if(cache.has(selected))dialogImage.src=cache.get(selected);
        dialogImage.alt=`Jadi hand chain · ${finishes[selected]} · Clear white diamonds`;
      }
    }
  };
  preview.dataset.variant=finishes[selected];cardImage.dataset.metal=selected;
  updateLinks();
})();

