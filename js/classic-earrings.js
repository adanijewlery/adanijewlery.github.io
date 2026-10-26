/* Options belong only to the six classic earring concepts. Both galleries share one selection. */
(() => {
  const definitions = {
    'classic-round-diamond-studs': ['Classic round diamond studs','white'],
    'classic-bezel-diamond-studs': ['Bezel diamond studs','yellow'],
    'classic-petite-diamond-huggies': ['Petite diamond huggies','yellow'],
    'classic-diamond-hoops': ['Classic diamond hoops','white'],
    'classic-round-halo-studs': ['Round halo diamond studs','white'],
    'classic-solitaire-diamond-drops': ['Solitaire diamond drops','yellow']
  };
  const gold = {yellow:'Yellow gold',white:'White gold',rose:'Rose gold'};
  const sizes = {small:['Small',.78],medium:['Medium',1],large:['Large',1.17]};
  const states = new Map(), sources = new Map(), renders = new Map();
  const viewers = [
    {dialog:document.querySelector('#piece-dialog'),image:document.querySelector('#dialog-image'),link:document.querySelector('#dialog-contact')},
    {dialog:document.querySelector('#inspiration-dialog'),image:document.querySelector('#inspiration-dialog > img'),link:document.querySelector('.inspiration-dialog-enquire')}
  ];
  const note = 'Illustrative sizes and gold colours. Exact dimensions and diamond weights are confirmed personally.';
  function load(url) {
    return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Preview unavailable'));img.src=url;});
  }
  let background;
  function backdrop(){
    if(!background)background=load('assets/classic-earrings-options/velvet.png').catch(error=>{background=null;throw error;});
    return background;
  }
  async function source(key){
    if(!sources.has(key))sources.set(key,load(`assets/classic-earrings-options/three-quarter/${key}.png`).then(img=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=960;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,960,960);
      const pixels=ctx.getImageData(0,0,960,960);
      // Detect each earring independently. A single pair bounding box retained
      // the source's staggered positions; separate boxes share one baseline.
      const parts=[0,480].map(offset=>{
        let left=960,top=960,right=0,bottom=0;
        for(let y=0;y<960;y++)for(let x=offset;x<offset+480;x++)if(pixels.data[(y*960+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
        if(right<=left||bottom<=top)throw new Error('Incomplete earring pair');
        left=Math.max(offset,left-5);top=Math.max(0,top-5);right=Math.min(offset+479,right+5);bottom=Math.min(959,bottom+5);
        return {left,top,width:right-left+1,height:bottom-top+1};
      });
      return {pixels,parts};
    }).catch(error=>{sources.delete(key);throw error;}));
    return sources.get(key);
  }
  async function render(key,metal,size){
    const id=`${key}/${metal}/${size}`;
    if(renders.has(id))return renders.get(id);
    const [original,bg]=await Promise.all([source(key),backdrop()]);
    const layer=document.createElement('canvas');layer.width=layer.height=960;
    const pixels=window.TennisMaterials.recolourGold(original.pixels.data,metal);
    layer.getContext('2d').putImageData(new ImageData(pixels,960,960),0,0);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=960;
    const ctx=canvas.getContext('2d');ctx.drawImage(bg,0,0,960,960);
    // Upright earrings, level centres, and uniform scaling at every size.
    // The source photography supplies the actual three-dimensional viewing angle.
    const aspects=original.parts.map(part=>part.width/part.height);
    const height=Math.min(650,620/(aspects[0]+aspects[1]))*sizes[size][1];
    const widths=aspects.map(aspect=>aspect*height),gap=110*sizes[size][1];
    let x=(960-widths[0]-widths[1]-gap)/2;
    ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=15;ctx.shadowOffsetY=8;
    original.parts.forEach((part,index)=>{
      ctx.drawImage(layer,part.left,part.top,part.width,part.height,x,490-height/2,widths[index],height);
      x+=widths[index]+gap;
    });
    const url=canvas.toDataURL('image/webp',.96);
    renders.set(id,url);
    if(renders.size>18)renders.delete(renders.keys().next().value);
    return url;
  }
  function enquiry(state){
    return 'https://wa.me/972545545132?text='+encodeURIComponent(
      "Hello ADANI, I'd like to discuss a custom jewellery idea:\nAI concept reference: "+state.name+
      '\nGold colour: '+gold[state.metal]+'\nEarring size: '+sizes[state.size][0]+
      '\nDiamonds: Clear white diamonds\nPlease confirm exact dimensions, diamond weights, origin, availability and a quote.');
  }
  function sync(state){
    state.boxes.forEach(box=>{
      box.querySelectorAll('[data-earring-metal]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.earringMetal===state.metal)));
      box.querySelector('select').value=state.size;
    });
    state.buttons.forEach(button=>{button.dataset.variant=`${gold[state.metal]} · ${sizes[state.size][0]} · Clear white diamonds`;});
    state.links.forEach(link=>{link.href=enquiry(state);});
    viewers.forEach(viewer=>{if(viewer.key===state.key)viewer.link.href=enquiry(state);});
    if(typeof refreshSelection==='function')refreshSelection();
  }
  function setImage(img,state){
    if(state.url){img.removeAttribute('srcset');img.src=state.url;}
    img.alt=`${state.name} · ${gold[state.metal]} · ${sizes[state.size][0]} · Clear white diamonds · Three-quarter view`;
    img.dataset.earringView='three-quarter';
    img.dataset.earringMetal=state.metal;img.dataset.earringSize=state.size;
  }
  function paint(state){
    state.buttons.forEach(button=>setImage(button.querySelector('img'),state));
    state.featureImages.forEach(img=>setImage(img,state));
    viewers.forEach(viewer=>{if(viewer.key===state.key)setImage(viewer.image,state);});
  }
  async function choose(state,metal,size){
    if(!gold[metal]||!sizes[size])return;
    state.pending={metal,size};
    const revision=++state.revision;
    state.boxes.forEach(box=>{box.setAttribute('aria-busy','true');box.querySelector('[role=status]').textContent='Updating your preview';});
    try{
      const url=await render(state.key,metal,size);
      if(revision!==state.revision)return;
      Object.assign(state,{metal,size,url});sync(state);paint(state);
      state.boxes.forEach(box=>{box.querySelector('[role=status]').textContent='Your preview is ready';});
    }catch{
      if(revision!==state.revision)return;
      sync(state);
      state.boxes.forEach(box=>{box.querySelector('[role=status]').textContent='Preview could not update. Please try again.';});
    }finally{
      if(revision===state.revision){state.pending=null;state.boxes.forEach(box=>box.removeAttribute('aria-busy'));}
    }
  }
  function controls(state){
    const box=document.createElement('div');box.className='classic-earring-options';
    box.innerHTML='<fieldset><legend>Gold colour</legend><div class="earring-metals">'+Object.entries(gold).map(([value,label])=>`<button type="button" data-earring-metal="${value}" aria-pressed="${value===state.metal}"><i class="earring-swatch ${value}" aria-hidden="true"></i><span>${label}</span></button>`).join('')+'</div></fieldset><label class="earring-size"><span>Earring size</span><select>'+Object.entries(sizes).map(([value,[label]])=>`<option value="${value}"${value===state.size?' selected':''}>${label}</option>`).join('')+'</select></label><p class="earring-size-note">'+note+'</p><p class="earring-status" role="status" aria-live="polite"></p>';
    box.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>choose(state,button.dataset.earringMetal,state.pending?.size||state.size)));
    box.querySelector('select').addEventListener('change',event=>choose(state,state.pending?.metal||state.metal,event.target.value));
    state.boxes.push(box);return box;
  }
  Object.entries(definitions).forEach(([key,[name,metal]])=>{
    const buttons=[...document.querySelectorAll(`.inspiration-photo[data-image="${key}"], .piece .image-button[data-image="${key}"]`)];
    if(!buttons.length)return;
    const featureImages=[...document.querySelectorAll(`[data-feature="${key}"] img`)];
    const state={key,name,metal,size:'medium',buttons,featureImages,links:[],boxes:[],revision:0,url:null,pending:null};states.set(key,state);
    buttons.forEach(button=>{
      const card=button.closest('.inspiration-card,.piece');card.dataset.classicEarring=key;
      card.querySelector('h3').after(controls(state));
      const link=card.querySelector('.inspiration-enquire');if(link)state.links.push(link);
    });sync(state);
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();if(!state.url&&!state.pending)choose(state,state.metal,state.size);}
    },{rootMargin:'160px'});
    buttons.forEach(button=>observer.observe(button));
    featureImages.forEach(img=>observer.observe(img));
  });
  window.ClassicEarrings={
    open(button,dialog){
      const viewer=viewers.find(view=>view.dialog===dialog);if(!viewer)return;
      if(viewer.box){const previous=states.get(viewer.key);if(previous)previous.boxes=previous.boxes.filter(box=>box!==viewer.box);viewer.box.remove();viewer.box=null;}
      viewer.key=null;
      const state=states.get(button.dataset.image);if(!state)return;
      viewer.key=state.key;viewer.box=controls(state);
      dialog.querySelector('h2').after(viewer.box);
      sync(state);setImage(viewer.image,state);
      if(!state.url&&!state.pending)choose(state,state.metal,state.size);
    }
  };
})();
