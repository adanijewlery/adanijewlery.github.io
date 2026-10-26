/* A fixed-view photographic customizer: one design, three metal finishes. */
(() => {
  const section=document.querySelector('#design'),layout=section?.querySelector('.studio-layout');
  if(!layout)return;
  const references=[
    {piece:'ring',shape:'eternity',name:'Eternity ring',image:'ai-eternity-ring',metal:'yellow',stone:'clear'},
    {piece:'ring',shape:'eternity-half',name:'Half eternity ring',image:'ai-half-eternity-ring',metal:'yellow',stone:'clear'},
    {piece:'ring',shape:'eternity-third',name:'One-third eternity ring',image:'ai-third-eternity-ring',metal:'yellow',stone:'clear'},
    {piece:'ring',shape:'round',name:'Round ring',image:'ai-round-ring-velvet',metal:'yellow',stone:'clear'},
    {piece:'ring',shape:'oval',name:'Oval ring',image:'ai-oval-ring-velvet',metal:'white',stone:'clear'},
    {piece:'ring',shape:'emerald',name:'Emerald-cut ring',image:'ai-emerald-ring-velvet',metal:'white',stone:'clear'},
    {piece:'ring',shape:'pear',name:'Pear ring',image:'ai-pear-ring-velvet',metal:'rose',stone:'clear'},
    {piece:'ring',shape:'marquise',name:'Marquise ring',image:'ai-marquise-ring-velvet',metal:'yellow',stone:'clear'},
    {piece:'pendant',shape:'round',name:'Round pendant',image:'ai-round-pendant-velvet',metal:'white',stone:'clear'},
    {piece:'pendant',shape:'oval',name:'Oval pendant',image:'ai-oval-pendant-velvet',metal:'yellow',stone:'clear'},
    {piece:'pendant',shape:'emerald',name:'Emerald-cut pendant',image:'ai-emerald-pendant-velvet',metal:'rose',stone:'clear'},
    {piece:'pendant',shape:'pear',name:'Pear pendant',image:'ai-pear-pendant-velvet',metal:'white',stone:'clear'},
    {piece:'pendant',shape:'marquise',name:'Marquise pendant',image:'ai-marquise-pendant-velvet',metal:'yellow',stone:'clear'}
  ];
  const metals=[{key:'yellow',label:'Yellow gold'},{key:'rose',label:'Rose gold'},{key:'white',label:'White gold'}];
  const styleNames={round:'Round',oval:'Oval',emerald:'Emerald cut',pear:'Pear',marquise:'Marquise',eternity:'Full eternity','eternity-half':'Half eternity','eternity-third':'One-third eternity'};
  const stones=[['clear','White diamond','#e6eef8']];
  let piece='ring',shape='round',metal='yellow',stone='clear',carat='2',connection='bail',chain='anchor',version=0;
  const styleMemory={ring:'round',pendant:'round'};
  let thumbnailQueue=Promise.resolve();
  layout.className='studio-layout photo-studio-layout';
  layout.innerHTML=`<div class="photo-choice-panel"><fieldset><legend>01 / Choose your piece</legend><div class="photo-piece-options" role="group" aria-label="Jewellery type"><button type="button" class="photo-option" data-piece="ring" aria-pressed="true"><img src="assets/images/ring-category-editorial-v2-480.webp" srcset="assets/images/ring-category-editorial-v2-480.webp 480w, assets/images/ring-category-editorial-v2-960.webp 960w" sizes="(max-width:700px) 44vw, 25vw" width="480" height="320" alt="" loading="lazy"><span>Ring</span></button><button type="button" class="photo-option" data-piece="pendant" aria-pressed="false"><img src="assets/images/ai-round-pendant-velvet-480.webp" width="480" height="480" alt="" loading="lazy"><span>Pendant</span></button></div></fieldset><fieldset><legend>02 / Choose your style</legend><div id="photo-style-options" class="photo-style-options" role="group" aria-label="Jewellery style"></div></fieldset><p class="photo-choice-hint">Choose a style, then change the gold on your photo.</p></div>
  <div class="photo-viewer"><div class="photo-studio-frame"><img id="photo-studio-image" class="photo-studio-image" src="assets/images/ai-round-ring-velvet-960.webp" alt="Round ring · Yellow gold" width="960" height="960" decoding="async"><div class="photo-viewer-top"><span>YOUR DESIGN</span><button type="button" id="photo-studio-zoom">View larger</button></div><div class="photo-gold-overlay"><span class="photo-gold-heading">Choose your gold</span><div class="photo-gold-options" role="group" aria-label="Gold colour">${metals.map(item=>`<button type="button" class="photo-option photo-gold-option" data-metal="${item.key}" aria-pressed="${item.key===metal}"><img alt="" width="160" height="160"><span>${item.label}</span></button>`).join('')}</div></div><span class="photo-updating" hidden>Updating your photo</span></div><p id="photo-studio-caption" class="photo-studio-caption">Round ring · Yellow gold</p><p id="photo-studio-status" class="photo-studio-status" role="status" aria-live="polite"></p><p class="photo-studio-note">AI-generated design inspiration. Final details are confirmed personally.</p></div>
  <div class="photo-enquiry"><p class="house-step-label">04 / Send your brief</p><span class="photo-enquiry-label">YOUR SELECTION</span><h3 id="photo-selection-title">Round ring</h3><p id="photo-selection-metal">Yellow gold</p><a id="photo-design-enquire" class="studio-enquire" href="https://wa.me/972545545132">Discuss my design</a><button id="photo-start-again" class="studio-reset" type="button">Start a new design</button></div>`;
  const gemControls=document.createElement('div');
  gemControls.className='photo-gem-controls';
  gemControls.innerHTML=`<fieldset><legend>03 / Diamond size</legend><div class="photo-size-options" role="group" aria-label="Centre stone size">${['1','2','3'].map(size=>`<button type="button" data-carat="${size}" aria-pressed="${size===carat}">${size} ct</button>`).join('')}</div><p class="photo-choice-hint">Stone sizes are illustrative. Final proportions are confirmed personally.</p></fieldset>`;
  layout.querySelector('.photo-choice-panel').append(gemControls);
  const pendantControls=document.createElement('div');pendantControls.className='photo-pendant-controls';pendantControls.hidden=true;
  pendantControls.innerHTML=`<fieldset><legend>03 / Pendant connection</legend><div class="photo-piece-options photo-connection-options" role="group" aria-label="Pendant connection">${[['bail','Classic bail'],['direct','Direct to chain']].map(([key,label])=>`<button type="button" class="photo-option" data-connection="${key}" aria-pressed="${key===connection}"><img alt="" width="160" height="160"><span>${label}</span></button>`).join('')}</div></fieldset><fieldset><legend>04 / Chain style</legend><div class="photo-piece-options photo-chain-options" role="group" aria-label="Chain style">${[['anchor','Polished anchor'],['rolo','Rolo']].map(([key,label])=>`<button type="button" class="photo-option" data-chain="${key}" aria-pressed="${key===chain}"><img alt="" width="160" height="160"><span>${label}</span></button>`).join('')}</div></fieldset>`;
  gemControls.before(pendantControls);
  const enquiryFields=document.createElement('div');enquiryFields.className='photo-enquiry-fields';
  enquiryFields.innerHTML=`<label class="photo-ring-size">Ring size<select id="photo-ring-size"><option value="">I need help choosing my size</option>${window.JewelleryGuide.hkSizes.map(row=>`<option value="${row.hk}">HK ${row.hk}</option>`).join('')}</select><small>Hong Kong (HK) ring size</small></label><label>Special requests<textarea id="photo-special-requests" rows="3" maxlength="500" placeholder="Tell us what you have in mind"></textarea></label>`;
  layout.querySelector('#photo-design-enquire').before(enquiryFields);
  section.hidden=false;
  const image=layout.querySelector('#photo-studio-image'),caption=layout.querySelector('#photo-studio-caption'),status=layout.querySelector('#photo-studio-status'),updating=layout.querySelector('.photo-updating'),zoom=layout.querySelector('#photo-studio-zoom'),styleOptions=layout.querySelector('#photo-style-options');
  const baseRef=()=>references.find(item=>item.piece===piece&&item.shape===shape);
  const pendantImage=(base,setting,chainType)=>base+(setting==='bail'&&chainType==='anchor'?'':`-${setting}-${chainType}`);
  const ref=()=>{const base=baseRef();return piece==='pendant'?{...base,image:pendantImage(base.image,connection,chain)}:base;};
  const metalLabel=()=>metals.find(item=>item.key===metal).label;
  const pendantDescription=()=>`${connection==='direct'?'Direct to chain':'Classic bail'} · ${chain==='rolo'?'Rolo':'Polished anchor'}`;
  function setOptionPhoto(button,url){const img=button.querySelector('img');if(img.getAttribute('src')!==url)img.src=url;}
  function renderStyleOptions(){
    styleOptions.replaceChildren(...references.filter(item=>item.piece===piece).sort((a,b)=>Number(a.shape.startsWith('eternity'))-Number(b.shape.startsWith('eternity'))).map(item=>{
      const button=document.createElement('button');button.type='button';button.className='photo-option';button.dataset.shape=item.shape;button.setAttribute('aria-pressed',String(item.shape===shape));
      const thumb=document.createElement('img');thumb.src=`assets/images/${item.image}-160.webp`;thumb.alt='';thumb.width=160;thumb.height=160;thumb.loading='lazy';
      const label=document.createElement('span');label.textContent=styleNames[item.shape];button.append(thumb,label);
      if(item.stone!=='clear')thumb.style.filter='grayscale(1)';
      thumbnailQueue=thumbnailQueue.then(async()=>{if(!thumb.isConnected)return;try{const url=await renderStudioConcept(item,{piece:item.piece,shape:item.shape,metal:item.metal,stone:'clear',carat:'2',chain:'anchor',fixedPhoto:true});thumb.src=url;thumb.style.filter='';}catch{}});
      button.addEventListener('click',()=>{shape=item.shape;styleMemory[piece]=shape;updateSelection();});return button;
    }));
  }
  function updateLabels(){
    gemControls.hidden=shape.startsWith('eternity');
    pendantControls.hidden=piece!=='pendant';
    gemControls.querySelector('legend').textContent=piece==='pendant'?'05 / Diamond size':'03 / Diamond size';
    layout.querySelector('.house-step-label').textContent=piece==='pendant'?'06 / Send your brief':'04 / Send your brief';
    for(const button of pendantControls.querySelectorAll('button[data-connection]')){button.setAttribute('aria-pressed',String(button.dataset.connection===connection));if(piece==='pendant')setOptionPhoto(button,`assets/images/${pendantImage(baseRef().image,button.dataset.connection,chain)}-160.webp`);}
    for(const button of pendantControls.querySelectorAll('button[data-chain]')){button.setAttribute('aria-pressed',String(button.dataset.chain===chain));if(piece==='pendant')setOptionPhoto(button,`assets/images/${pendantImage(baseRef().image,connection,button.dataset.chain)}-160.webp`);}
    layout.querySelector('.photo-ring-size').hidden=piece!=='ring';
    for(const button of layout.querySelectorAll('[data-piece]'))button.setAttribute('aria-pressed',String(button.dataset.piece===piece));
    for(const button of layout.querySelectorAll('[data-shape]'))button.setAttribute('aria-pressed',String(button.dataset.shape===shape));
    for(const button of layout.querySelectorAll('button[data-metal]'))button.setAttribute('aria-pressed',String(button.dataset.metal===metal));
    
    for(const button of layout.querySelectorAll('button[data-carat]'))button.setAttribute('aria-pressed',String(button.dataset.carat===carat));
    layout.querySelector('#photo-selection-title').textContent=ref().name;
    layout.querySelector('#photo-selection-metal').textContent=shape.startsWith('eternity')?`${metalLabel()} · Clear`:`${metalLabel()} · Clear · ${carat} ct`;
    if(piece==='pendant')layout.querySelector('#photo-selection-metal').textContent+=` · ${pendantDescription()}`;
    const message=`Hello ADANI, I'd like to discuss a custom jewellery idea:\nPiece: ${piece==='ring'?'Ring':'Pendant'}\nStyle: ${styleNames[shape]}\nMetal colour: ${metalLabel()}\nCould we discuss availability, materials and a quote?`;
    const brief=message.replace('\nCould we',shape.startsWith('eternity')?'\nDiamond: White\nCould we':`\nDiamond: White\nCentre stone size: ${carat} ct (illustrative)\nCould we`);
    const ringSize=layout.querySelector('#photo-ring-size').value,notes=layout.querySelector('#photo-special-requests').value.trim();
    const extras=[piece==='ring'?'Gold purity: 14k':'',piece==='ring'?`Ring size: ${ringSize?'HK '+ringSize:'I need help choosing my size'}`:`Pendant connection: ${connection==='direct'?'Direct to chain':'Classic bail'}\nChain style: ${chain==='rolo'?'Rolo':'Polished anchor'}`,notes?`Special requests: ${notes}`:''].filter(Boolean).join('\n');
    layout.querySelector('#photo-design-enquire').href=`https://wa.me/972545545132?text=${encodeURIComponent(brief+'\n'+extras)}`;
  }
  const render=(reference,finish,gem,size)=>renderStudioConcept(reference,{piece:reference.piece,shape:reference.shape,metal:finish,stone:gem,carat:reference.shape.startsWith('eternity')?'2':size,chain:'anchor',fixedPhoto:true,polishedAnchor:reference.piece==='pendant'&&!reference.image.includes('-rolo')});
  async function setMainPhoto(url,reference,finish,currentVersion){
    const ready=new Image();ready.src=url;
    if(ready.decode)await ready.decode();else await new Promise((resolve,reject)=>{ready.onload=resolve;ready.onerror=reject;});
    if(currentVersion!==version)return;
    image.src=url;image.alt=`${reference.name} · ${metals.find(item=>item.key===finish).label}`;
    image.dataset.design=reference.image;image.dataset.metal=finish;
    caption.textContent=`${reference.name} · ${metals.find(item=>item.key===finish).label}`;
  }
  async function updateSelection(refreshFinishes=false){
    const currentVersion=++version,reference={...ref()},finish=metal,gem=stone,size=carat;
    const finishKey=[reference.image,gem,size].join('|');
    updateLabels();status.textContent='';updating.hidden=false;zoom.disabled=true;image.setAttribute('aria-busy','true');
    try{
      const url=await render(reference,finish,gem,size);await setMainPhoto(url,reference,finish,currentVersion);
      if(currentVersion!==version)return;
      image.dataset.stone=gem;image.dataset.carat=size;
      if(reference.piece==='pendant'){image.dataset.connection=connection;image.dataset.chain=chain;}else{delete image.dataset.connection;delete image.dataset.chain;}
      caption.textContent=reference.shape.startsWith('eternity')?`${reference.name} · ${metalLabel()} · Clear`:`${reference.name} · ${metalLabel()} · Clear · ${size} ct`;
      if(reference.piece==='pendant')caption.textContent+=` · ${pendantDescription()}`;
      image.alt=caption.textContent;
      status.textContent='Your photo is ready';
    }catch(error){if(currentVersion===version)status.textContent='The finish could not update. Please choose it again.';}
    finally{if(currentVersion===version){updating.hidden=true;zoom.disabled=false;image.removeAttribute('aria-busy');}}
    if(reference.piece==='pendant'&&currentVersion===version){
      for(const button of pendantControls.querySelectorAll('button')){
        if(currentVersion!==version)return;
        const setting=button.dataset.connection||connection,chainType=button.dataset.chain||chain;
        const thumbRef={...baseRef(),image:pendantImage(baseRef().image,setting,chainType)};
        try{const url=await render(thumbRef,finish,'clear','2');if(currentVersion===version)setOptionPhoto(button,url);}catch{/* Keep the local fallback thumbnail. */}
      }
    }
    if(refreshFinishes||layout.dataset.finishDesign!==finishKey){
      for(const item of metals){
        // Yield between finishes so phone input stays responsive.
        if(currentVersion!==version)return;
        try{
          const url=await render(reference,item.key,gem,size);
          if(currentVersion!==version)return;
          layout.querySelector(`[data-metal="${item.key}"] img`).src=url;
        }catch{if(currentVersion===version)layout.querySelector(`[data-metal="${item.key}"] img`).src=`assets/images/${reference.image}-160.webp`;}
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      if(currentVersion===version)layout.dataset.finishDesign=finishKey;
    }
  }
  for(const button of layout.querySelectorAll('[data-piece]'))button.addEventListener('click',()=>{piece=button.dataset.piece;shape=styleMemory[piece];renderStyleOptions();updateSelection(true);});
  for(const button of layout.querySelectorAll('button[data-metal]'))button.addEventListener('click',()=>{metal=button.dataset.metal;updateSelection();});

  for(const button of layout.querySelectorAll('button[data-carat]'))button.addEventListener('click',()=>{carat=button.dataset.carat;updateSelection();});
  for(const button of pendantControls.querySelectorAll('button[data-connection]'))button.addEventListener('click',()=>{connection=button.dataset.connection;updateSelection(true);});
  for(const button of pendantControls.querySelectorAll('button[data-chain]'))button.addEventListener('click',()=>{chain=button.dataset.chain;updateSelection(true);});
  layout.querySelector('#photo-ring-size').addEventListener('change',updateLabels);
  layout.querySelector('#photo-special-requests').addEventListener('input',updateLabels);
  layout.querySelector('#photo-start-again').addEventListener('click',()=>{piece='ring';shape='round';metal='yellow';stone='clear';carat='2';connection='bail';chain='anchor';layout.querySelector('#photo-ring-size').value='';layout.querySelector('#photo-special-requests').value='';styleMemory.ring=styleMemory.pendant='round';renderStyleOptions();updateSelection(true);});
  const dialog=document.querySelector('#design-photo-dialog');
  zoom.addEventListener('click',()=>{
    if(!dialog)return;const large=dialog.querySelector('img');large.src=image.src;large.alt=image.alt;dialog.querySelector('h2').textContent=caption.textContent;dialog.showModal();
  });
  if(dialog){
    dialog.querySelector('button').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();});
    dialog.addEventListener('close',()=>zoom.focus({preventScroll:true}));
  }
  // Keep material and style-thumbnail rendering off the initial homepage load.
  if('IntersectionObserver' in window){
    const start=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){start.disconnect();renderStyleOptions();updateSelection(true);}
    },{rootMargin:'250px'});
    start.observe(section);
  }else {renderStyleOptions();updateSelection(true);}
})();
