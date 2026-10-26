/* UI loads immediately; the larger renderer is imported only near the studio. */
(() => {
  const section=document.querySelector('#design'),form=document.querySelector('#design-form'),display=section?.querySelector('.studio-display');
  if(!section||!form||!display)return;
  const defaults={category:'ring',metal:'yellow',gem:'diamond',shape:'round',carat:'2',bandWidth:'2.2',roughness:'.08',chain:'anchor',gemColour:'#eff8ff',artScale:'1',artOffset:'0',artRotation:'0'};
  const metals={yellow:['18k yellow gold','#e7bc72'],white:['18k white gold','#d6d8dc'],rose:['18k rose gold','#d7a18d'],platinum:['Platinum','#cbd1d8'],silver:['Silver','#edf0f2']};
  const gems={diamond:['Diamond','#eff8ff'],sapphire:['Sapphire','#376ac0'],ruby:['Ruby','#cb4266'],emerald:['Emerald','#40a980']};
  const radio=(name,value,label,checked=false,swatch='')=>`<label><input type="radio" name="${name}" value="${value}"${checked?' checked':''}><span>${swatch?`<i class="studio-swatch" style="background:${swatch}" aria-hidden="true"></i>`:''}${label}</span></label>`;
  display.innerHTML=`<div class="atelier-stage"><canvas id="atelier-canvas" tabindex="0" role="img" aria-label="Interactive jewellery design. Drag to rotate and pinch to zoom."></canvas><img class="atelier-loading-photo" src="assets/images/ai-round-ring-960.webp" width="960" height="960" alt="Jewellery design preview"><div class="atelier-topline"><span>YOUR PERSONAL ATELIER</span><button id="atelier-reset-view" type="button">Reset view</button></div><div class="atelier-render-state" role="status" aria-live="polite">Loading your studio</div><button id="atelier-retry" type="button" hidden>Try 3D again</button></div><p class="atelier-gesture">Drag to explore · Pinch to zoom</p><div class="atelier-material-summary"><span id="atelier-material-name">18k yellow gold</span><span id="atelier-gem-name">Diamond</span></div><p class="atelier-precision">Design visualization. Final dimensions, materials and stone appearance are confirmed personally.</p>`;
  form.innerHTML=`<fieldset><legend>01 / Choose your piece</legend><div class="studio-options atelier-categories">${radio('category','ring','Ring',true)}${radio('category','pendant','Pendant')}${radio('category','earrings','Earrings')}${radio('category','bracelet','Bracelet')}</div></fieldset>
  <fieldset><legend>02 / Precious metal</legend><div class="studio-options">${Object.entries(metals).map(([key,[label,hex]])=>radio('metal',key,label,key==='yellow',hex)).join('')}</div><div class="atelier-range"><label for="atelier-finish">Surface finish</label><select id="atelier-finish"><option value=".08">Mirror polished</option><option value=".25">Satin</option><option value=".40">Brushed appearance</option></select></div><div class="atelier-range"><label for="atelier-roughness">Surface softness</label><input type="range" id="atelier-roughness" name="roughness" min="0.04" max="0.45" step="0.01" value=".08"></div><div class="atelier-range" id="atelier-band-range"><label for="atelier-band">Band width</label><input id="atelier-band" name="bandWidth" type="range" min="1.5" max="4" step="0.1" value="2.2"><output for="atelier-band">2.2 mm</output></div></fieldset>
  <fieldset><legend>03 / Gemstone</legend><div class="studio-options">${Object.entries(gems).map(([key,[label,hex]])=>radio('gem',key,label,key==='diamond',hex)).join('')}</div><div class="atelier-tint"><label for="atelier-tint">Stone colour</label><input type="color" id="atelier-tint" name="gemColour" value="#eff8ff"><output id="atelier-colour-value" for="atelier-tint" dir="ltr">#EFF8FF</output><button type="button" id="atelier-natural-colour">Reset stone colour</button></div><p class="atelier-field-note">Colour samples and the model use the same base tone. Reflections and lighting change the final appearance.</p></fieldset>
  <fieldset><legend>04 / Cut & proportions</legend><div class="studio-options">${[['round','Round'],['oval','Oval'],['emerald','Emerald cut'],['pear','Pear'],['marquise','Marquise']].map(([key,label])=>radio('shape',key,label,key==='round')).join('')}</div><div class="atelier-range"><label for="atelier-carat">Centre stone size</label><input type="range" name="carat" id="atelier-carat" min="0.5" max="4" step="0.25" value="2"><output for="atelier-carat">2 ct</output></div><div id="atelier-chain" class="studio-options" hidden>${radio('chain','anchor','Anchor',true)}${radio('chain','rolo','Rolo · round links')}</div></fieldset>
  <fieldset><legend>05 / Your artwork</legend><label class="atelier-upload" for="atelier-image"><span>Map an image to the metal</span><span class="atelier-upload-types">PNG, JPEG or WebP · up to 10 MB</span></label><input type="file" id="atelier-image" accept="image/png,image/jpeg,image/webp" class="visually-hidden"><p class="atelier-field-note">Add a pattern or artwork to the 3D surface. Your image stays on this device; it does not generate a new 3D shape.</p><p id="atelier-upload-status" role="status" aria-live="polite"></p><div id="atelier-art-controls" hidden><div class="atelier-upload-preview"><img id="atelier-upload-thumb" width="64" height="64" alt="Your uploaded artwork"><button type="button" id="atelier-remove-image">Remove image</button></div><div class="atelier-range"><label for="atelier-art-scale">Pattern repeat</label><input type="range" id="atelier-art-scale" name="artScale" value="1" min=".5" max="5" step=".1"></div><div class="atelier-range"><label for="atelier-art-offset">Pattern position</label><input type="range" id="atelier-art-offset" name="artOffset" value="0" min="0" max="1" step=".01"></div><div class="atelier-range"><label for="atelier-art-rotation">Pattern rotation</label><input type="range" id="atelier-art-rotation" name="artRotation" value="0" min="0" max="360" step="5"></div></div></fieldset>
  <div class="design-brief"><span>YOUR CUSTOM DESIGN BRIEF</span><p id="design-summary" role="status"></p></div><a id="design-enquire" class="studio-enquire" href="https://wa.me/972545545132">Discuss my design</a><button type="reset" class="studio-reset">Start a new design</button>`;
  section.hidden=false;
  const quality=document.createElement('div');quality.className='atelier-quality';
  quality.innerHTML='<button type="button" id="atelier-refine">Refine lighting</button><button type="button" id="atelier-live">Live preview</button><span>Refinement adds full-scene reflections and shadows. Move the model to return to the live view.</span>';
  display.querySelector('.atelier-stage').after(quality);
  const canvas=display.querySelector('canvas'),status=display.querySelector('.atelier-render-state'),loading=display.querySelector('.atelier-loading-photo'),retry=display.querySelector('#atelier-retry');
  let engine,loadingEngine,updateTimer,imageUrl,imageBitmap,imageVersion=0,lastStatus;
  function choices(){return {...defaults,...Object.fromEntries(new FormData(form))};}
  function labels(state){
    form.querySelector('output[for="atelier-band"]').textContent=`${Number(state.bandWidth).toFixed(1)} mm`;
    form.querySelector('output[for="atelier-carat"]').textContent=`${Number(state.carat)} ct`;
    form.querySelector('#atelier-colour-value').textContent=state.gemColour.toUpperCase();
    display.querySelector('#atelier-material-name').textContent=metals[state.metal][0];
    display.querySelector('#atelier-gem-name').textContent=gems[state.gem][0];
    form.querySelector('#atelier-chain').hidden=state.category!=='pendant';
    form.querySelector('#atelier-band-range').hidden=!['ring','bracelet'].includes(state.category);
    const category={ring:'Ring',pendant:'Pendant',earrings:'Earrings',bracelet:'Bracelet'}[state.category];
    const cut={round:'Round',oval:'Oval',emerald:'Emerald cut',pear:'Pear',marquise:'Marquise'}[state.shape];
    form.querySelector('#design-summary').textContent=[category,metals[state.metal][0],gems[state.gem][0],cut,`${Number(state.carat)} ct`].join(' · ');
    const message=`Hello ADANI, I'd like to discuss a custom jewellery idea:\nPiece: ${category}\nMetal colour: ${metals[state.metal][0]}\nStone: ${gems[state.gem][0]}\nStone shape: ${cut}\nCentre stone size: ${state.carat} ct\nBand width: ${state.bandWidth} mm\nStone colour: ${state.gemColour}\nSurface finish: ${Number(state.roughness)<.16?'Mirror polished':Number(state.roughness)<.34?'Satin':'Brushed appearance'}${state.category==='pendant'?'\nChain style: '+(state.chain==='rolo'?'Rolo (round links)':'Anchor'):''}${imageBitmap?'\nI have artwork to share separately.':''}\nCould we discuss availability, materials and a quote?`;
    form.querySelector('#design-enquire').href=`https://wa.me/972545545132?text=${encodeURIComponent(message)}`;
  }
  function onStatus(text){if(text!==lastStatus){lastStatus=text;status.textContent=text;}}
  async function load(){
    if(engine||loadingEngine)return;
    loadingEngine=true;retry.hidden=true;onStatus('Loading your studio');
    try{
      const module=await import('./studio-3d.bundle.js');
      engine=module.createJewelleryStudio(canvas,choices(),onStatus);
      if(imageBitmap)engine.setImage(imageBitmap);
      loading.hidden=true;
    }catch(error){console.error('Unable to load the 3D studio',error);onStatus('3D is unavailable on this device. You can still customise and enquire.');retry.hidden=false;}
    finally{loadingEngine=false;}
  }
  const near=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){load();near.disconnect();}},{rootMargin:'250px'});near.observe(display);
  retry.addEventListener('click',load);
  display.querySelector('#atelier-reset-view').addEventListener('click',()=>engine?.resetView());
  display.querySelector('#atelier-refine').addEventListener('click',()=>engine?.refine());
  display.querySelector('#atelier-live').addEventListener('click',()=>engine?.stopRefinement());
  function update(){const state=choices();labels(state);clearTimeout(updateTimer);updateTimer=setTimeout(()=>engine?.update(state),120);}
  form.addEventListener('input',event=>{if(event.target.name==='roughness')form.querySelector('#atelier-finish').value=Number(event.target.value)<.16?'.08':Number(event.target.value)<.34?'.25':'.40';if(event.target.id!=='atelier-image')update();});
  form.addEventListener('change',event=>{
    if(event.target.name==='gem'){form.querySelector('#atelier-tint').value=gems[event.target.value][1];update();}
    if(event.target.id==='atelier-finish'){form.querySelector('#atelier-roughness').value=event.target.value;update();}
  });
  form.querySelector('#atelier-natural-colour').addEventListener('click',()=>{form.querySelector('#atelier-tint').value=gems[choices().gem][1];update();});
  function removeImage(){
    imageVersion++;imageBitmap?.close();imageBitmap=null;
    if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=null;
    form.querySelector('#atelier-image').value='';form.querySelector('#atelier-art-controls').hidden=true;
    form.querySelector('#atelier-upload-thumb').removeAttribute('src');form.querySelector('#atelier-upload-status').textContent='';engine?.setImage(null);labels(choices());
  }
  form.querySelector('#atelier-remove-image').addEventListener('click',removeImage);
  form.querySelector('#atelier-image').addEventListener('change',async event=>{
    const file=event.target.files[0],output=form.querySelector('#atelier-upload-status');if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024){output.textContent='Choose a PNG, JPEG or WebP image smaller than 10 MB.';return;}
    const version=++imageVersion;output.textContent='Preparing your image';
    try{
      const bitmap=await createImageBitmap(file,{resizeWidth:1024,resizeQuality:'high',imageOrientation:'from-image'});
      if(version!==imageVersion){bitmap.close();return;}
      imageBitmap?.close();imageBitmap=bitmap;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(file);
      form.querySelector('#atelier-upload-thumb').src=imageUrl;form.querySelector('#atelier-art-controls').hidden=false;
      engine?.setImage(bitmap);output.textContent='Image mapped to the metal';labels(choices());
    }catch(error){if(version===imageVersion)output.textContent='This image could not be read. Try a PNG or JPEG.';}
  });
  form.addEventListener('reset',()=>{removeImage();requestAnimationFrame(()=>{labels(choices());engine?.update(choices());});});
  form.addEventListener('submit',event=>event.preventDefault());
  labels(choices());
})();
