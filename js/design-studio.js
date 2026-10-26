const studio = document.querySelector('#design');
const designForm = document.querySelector('#design-form');
const designPreview = document.querySelector('#design-preview');
const designMetals = {
  yellow: {label:'Yellow gold', dark:'#5e421e', mid:'#c8aa69', light:'#fff1cc'},
  white: {label:'White gold', dark:'#4c535e', mid:'#c0c6ce', light:'#ffffff'},
  rose: {label:'Rose gold', dark:'#774c40', mid:'#c99783', light:'#ffe6d6'}
};
const designStones = {
  clear: {label:'Clear', light:'#ffffff', mid:'#c9e0ef', dark:'#637c9a'},
  blue: {label:'Blue', light:'#8ccfff', mid:'#2264b9', dark:'#081f59'},
  pink: {label:'Pink', light:'#ffe2eb', mid:'#e99fbb', dark:'#a45276'},
  purple: {label:'Purple', light:'#e6caff', mid:'#9164bc', dark:'#422b63'},
  yellow: {label:'Yellow', light:'#fff7cf', mid:'#dabb59', dark:'#886726'},
  green: {label:'Green', light:'#a2f1d1', mid:'#168b66', dark:'#064333'}
};
const designShapes = {
  marquise: {label:'Marquise', path:'M0,-76 C26,-48 48,-24 48,0 C48,24 26,48 0,76 C-26,48 -48,24 -48,0 C-48,-24 -26,-48 0,-76Z'},
  oval: {label:'Oval', path:'M0,-66 C36,-66 52,-36 52,0 C52,36 36,66 0,66 C-36,66 -52,36 -52,0 C-52,-36 -36,-66 0,-66Z'},
  round: {label:'Round', path:'M0,-56 C31,-56 56,-31 56,0 C56,31 31,56 0,56 C-31,56 -56,31 -56,0 C-56,-31 -31,-56 0,-56Z'},
  emerald: {label:'Emerald cut', path:'M-30,-62 H30 L47,-45 V45 L30,62 H-30 L-47,45 V-45Z'},
  pear: {label:'Pear', path:'M0,-72 C11,-46 54,-9 54,22 C54,56 31,72 0,72 C-31,72 -54,56 -54,22 C-54,-9 -11,-46 0,-72Z'}
};

const studioReferences = [
  {
    "image": "ai-marquise-ring",
    "name": "Marquise ring",
    "piece": "ring",
    "metal": "yellow",
    "shape": "marquise",
    "stone": "blue",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-oval-ring",
    "name": "Oval ring",
    "piece": "ring",
    "metal": "white",
    "shape": "oval",
    "stone": "pink",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-round-ring",
    "name": "Round ring",
    "piece": "ring",
    "metal": "yellow",
    "shape": "round",
    "stone": "clear",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-emerald-ring",
    "name": "Emerald-cut ring",
    "piece": "ring",
    "metal": "white",
    "shape": "emerald",
    "stone": "green",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-pear-ring",
    "name": "Pear ring",
    "piece": "ring",
    "metal": "rose",
    "shape": "pear",
    "stone": "purple",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-oval-pendant",
    "name": "Oval pendant",
    "piece": "pendant",
    "metal": "yellow",
    "shape": "oval",
    "stone": "blue",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-round-pendant",
    "name": "Round pendant",
    "piece": "pendant",
    "metal": "white",
    "shape": "round",
    "stone": "clear",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-emerald-pendant",
    "name": "Emerald-cut pendant",
    "piece": "pendant",
    "metal": "rose",
    "shape": "emerald",
    "stone": "purple",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-pear-pendant",
    "name": "Pear pendant",
    "piece": "pendant",
    "metal": "white",
    "shape": "pear",
    "stone": "pink",
    "width": 960,
    "height": 960
  },
  {
    "image": "ai-marquise-pendant",
    "name": "Marquise pendant",
    "piece": "pendant",
    "metal": "yellow",
    "shape": "marquise",
    "stone": "green",
    "width": 960,
    "height": 960
  }
];
const referenceButtons = document.querySelector('#studio-references');
const photoOpen = document.querySelector('#design-photo-open');
const photoDialog = document.querySelector('#design-photo-dialog');
let currentReference;
let referenceType;
let preferredReference;
let designRenderVersion=0;
let currentDesignChoices;
const svgNamespace = 'http://www.w3.org/2000/svg';
for (const input of designForm.querySelectorAll('input')) {
  const label = input.nextElementSibling;
  if (input.name === 'shape') {
    const icon = document.createElementNS(svgNamespace,'svg');
    icon.setAttribute('viewBox','-80 -80 160 160'); icon.setAttribute('aria-hidden','true');
    icon.classList.add('studio-shape-icon');
    const path = document.createElementNS(svgNamespace,'path'); path.setAttribute('d',designShapes[input.value].path);
    icon.append(path); label.prepend(icon);
  } else if (input.name === 'metal' || input.name === 'stone') {
    const palette = input.name === 'metal' ? designMetals[input.value] : designStones[input.value];
    const swatch = document.createElement('i'); swatch.className = 'studio-swatch'; swatch.setAttribute('aria-hidden','true');
    swatch.style.background = input.name === 'metal' ? `linear-gradient(120deg,${palette.dark},${palette.light} 38%,${palette.mid} 56%,${palette.dark})` : `radial-gradient(circle at 30% 25%,${palette.light},${palette.mid} 48%,${palette.dark})`;
    label.prepend(swatch);
  }
}
function updatePhotoReferences(piece) {
  if (referenceType !== piece) {
    referenceType = piece;
    referenceButtons.replaceChildren(...studioReferences.filter(reference=>reference.piece === piece).map(reference=>{
      const button = document.createElement('button'); button.type='button'; button.dataset.reference=reference.image;
      button.setAttribute('aria-label',`Use ${reference.name} as my starting point`);
      button.title=reference.name;
      const thumbnail = document.createElement('img'); thumbnail.src=`assets/images/${reference.image}-160.webp`;
      thumbnail.alt=''; thumbnail.width=64; thumbnail.height=64; thumbnail.loading='lazy';
      button.append(thumbnail);
      button.addEventListener('click',()=>{
        preferredReference=reference.image;
        for (const key of ['piece','metal','shape','stone']) designForm.querySelector(`input[name="${key}"][value="${reference[key]}"]`).checked=true;
        updateDesign();
      });
      return button;
    }));
  }
  for (const button of referenceButtons.children) button.setAttribute('aria-pressed',String(button.dataset.reference === currentReference.image));
}
function updateDesign() {
  const choices = Object.fromEntries(new FormData(designForm));
  const options = studioReferences.filter(reference=>reference.piece === choices.piece);
  const score = reference => (reference.stone === choices.stone ? 6 : 0) + (reference.shape === choices.shape ? 100 : 0) + (reference.metal === choices.metal ? 3 : 0);
  currentReference = options.find(reference=>reference.image === preferredReference) || options.reduce((best,reference)=>score(reference)>score(best)?reference:best,options[0]);
  const reference=currentReference;
  currentDesignChoices=choices;
  document.querySelector('#studio-chain-field').hidden=choices.piece!=='pendant';
  const description=`${designShapes[choices.shape].label} ${choices.piece}, ${designMetals[choices.metal].label.toLowerCase()} colour, ${designStones[choices.stone].label.toLowerCase()} stone, approximately ${choices.carat} carats`;
  const renderVersion=++designRenderVersion;
  photoOpen.classList.add('is-loading');photoOpen.disabled=true;photoOpen.setAttribute('aria-busy','true');
  designPreview.removeAttribute('srcset');
  renderStudioConcept(reference,choices).then(url=>{
    if(renderVersion!==designRenderVersion)return;
    designPreview.src=url;
    designPreview.dataset.metal=choices.metal;designPreview.dataset.stone=choices.stone;designPreview.dataset.carat=choices.carat;designPreview.dataset.chain=choices.piece==='pendant'?choices.chain:'none';designPreview.dataset.baseImage=reference.image;
    photoOpen.classList.remove('is-loading');photoOpen.disabled=false;photoOpen.removeAttribute('aria-busy');
  }).catch(()=>{
    if(renderVersion!==designRenderVersion)return;
    photoOpen.classList.remove('is-loading');photoOpen.disabled=false;photoOpen.removeAttribute('aria-busy');
    document.querySelector('#design-match').textContent='The preview could not update. Please try another option or refresh the page.';
  });
  designPreview.alt=`AI-generated design concept: ${description}.`;
  designPreview.width=960;designPreview.height=960;
  photoOpen.setAttribute('aria-label',`Enlarge ${reference.name} AI concept`);
  document.querySelector('#design-photo-name').textContent=`${reference.name} · ${choices.carat} ct`;
  updatePhotoReferences(choices.piece);
  const summary=`${designShapes[choices.shape].label} ${choices.piece} / ${designMetals[choices.metal].label} colour / ${designStones[choices.stone].label.toLowerCase()} stone / ${choices.carat} ct${choices.piece==='pendant'?' / '+(choices.chain==='rolo'?'Rolo':'Anchor')+' chain':''}`;
  document.querySelector('#design-summary').textContent=summary;
  document.querySelector('#design-match').textContent='Colours and centre-stone size update in the preview. Proportions are approximate; final materials and dimensions are confirmed personally.';
  const message=`Hello ADANI, I'd like to discuss a custom jewellery idea:\nAI concept reference: ${reference.name}\nPiece: ${choices.piece === 'ring' ? 'Ring' : 'Pendant'}\nMetal colour: ${designMetals[choices.metal].label}\nStone shape: ${designShapes[choices.shape].label}\nStone colour: ${designStones[choices.stone].label}\nCentre stone size: ${choices.carat} ct${choices.piece==='pendant'?'\nChain style: '+(choices.chain==='rolo'?'Rolo (round links)':'Anchor'):''}\nCould we discuss availability, materials and a quote?`;
  document.querySelector('#design-enquire').href=`${whatsappBase}?text=${encodeURIComponent(message)}`;
}
designPreview.addEventListener('load',()=>photoOpen.classList.remove('is-loading'));
designPreview.addEventListener('error',()=>photoOpen.classList.remove('is-loading'));
designForm.addEventListener('change',()=>{preferredReference=undefined; updateDesign();});
designForm.addEventListener('reset',()=>requestAnimationFrame(()=>{preferredReference=undefined;updateDesign();}));
designForm.addEventListener('submit',event=>event.preventDefault());
photoOpen.addEventListener('click',()=>{
  const large=document.querySelector('#design-photo-large');
  large.src=designPreview.src;
  large.alt=designPreview.alt;
  document.querySelector('#design-photo-title').textContent=`${currentReference.name} · ${currentDesignChoices.carat} ct`;
  photoDialog.showModal();
});
photoDialog.querySelector('button').addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('click',event=>{
  if(event.target!==photoDialog)return;
  const rect=photoDialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)photoDialog.close();
});
photoDialog.addEventListener('close',()=>photoOpen.focus({preventScroll:true}));
updateDesign();
studio.hidden=false;
