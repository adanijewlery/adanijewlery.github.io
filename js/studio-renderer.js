// Render material colours and approximate carat proportions from local AI concepts.
// The original pixels stay immutable; every change starts from the same source.
const studioRenderCache = new Map();
const studioSourceCache = new Map();
const studioGemOutlines = {
  'ai-eternity-ring':[[0,0],[0,0],[0,0]],
  'ai-half-eternity-ring':[[0,0],[0,0],[0,0]],
  'ai-third-eternity-ring':[[0,0],[0,0],[0,0]],
  'ai-marquise-ring':[[205,66],[229,105],[243,146],[231,199],[176,268],[145,234],[134,192],[143,144]],
  'ai-oval-ring':[[201,61],[246,67],[280,93],[287,137],[274,179],[252,219],[211,235],[174,230],[147,204],[141,170],[153,126],[177,86]],
  'ai-round-ring':[[239,66],[277,81],[295,110],[295,144],[279,174],[248,191],[208,187],[181,166],[168,135],[174,102],[202,75]],
  'ai-emerald-ring':[[203,83],[289,104],[265,229],[176,209]],
  'ai-pear-ring':[[264,71],[284,116],[287,165],[271,207],[234,230],[190,228],[161,205],[150,171],[171,130],[219,91]],
  'ai-marquise-pendant':[[235,181],[264,220],[282,265],[283,306],[264,355],[234,400],[206,364],[185,315],[182,269],[203,220]],
  'ai-oval-pendant':[[239,228],[270,238],[291,267],[301,304],[295,346],[276,374],[240,387],[206,378],[183,351],[174,309],[183,268],[206,239]],
  'ai-round-pendant':[[235,271],[266,279],[286,303],[290,331],[276,360],[249,377],[220,376],[193,360],[180,336],[181,309],[201,282]],
  'ai-emerald-pendant':[[184,212],[296,212],[305,222],[305,377],[295,391],[184,391],[174,379],[174,222]],
  'ai-pear-pendant':[[239,208],[269,242],[294,283],[304,323],[299,356],[279,382],[240,391],[205,381],[181,356],[175,322],[184,281],[210,242]]
};
const studioMarquiseClaws=[[206,64,12],[149,116,8],[248,126,8],[139,214,8],[224,220,8],[177,267,12]];
// Protect the individual diamond faces, leaving the surrounding prongs as metal.
const studioEternityFaces={
  'ai-eternity-ring':[[242,104,17,9],[219,119,16,10],[195,142,14,13],[178,177,12,15],[168,214,12,16],[164,255,12,17],[166,294,12,16],[178,326,12,14],[196,348,12,10],[219,358,10,7],[267,103,12,7],[289,112,9,7],[309,130,7,9],[319,154,6,10],[326,181,5,11],[328,209,5,11],[326,238,5,11],[320,267,5,11],[310,294,5,9]],
  'ai-half-eternity-ring':[[242,104,17,9],[219,119,16,10],[195,142,14,13],[178,177,12,15],[168,214,12,16],[164,255,12,17],[166,294,12,16],[267,103,12,7],[289,112,9,7],[309,130,7,9]],
  'ai-third-eternity-ring':[[242,104,17,9],[219,119,16,10],[195,142,14,13],[178,177,12,15],[168,214,12,16],[267,103,12,7]]
};
// Background edits retain the original composition and its gemstone outline.
for(const name of Object.keys(studioGemOutlines))if(!name.includes('eternity'))studioGemOutlines[name+'-velvet']=studioGemOutlines[name];
for(const name of Object.keys(studioGemOutlines))if(name.endsWith('pendant-velvet'))for(const variant of ['direct-anchor','bail-rolo','direct-rolo'])studioGemOutlines[name+'-'+variant]=studioGemOutlines[name];
// The velvet marquise photographs have a fuller lower contour than the older
// coloured-stone image. Use their actual outline for material and size masks.
for(const name of Object.keys(studioGemOutlines))if(name.startsWith('ai-marquise-pendant-velvet'))studioGemOutlines[name]=[[235,181],[251,198],[269,223],[282,250],[289,277],[289,305],[283,332],[272,359],[254,386],[235,406],[217,388],[201,362],[189,334],[181,306],[179,279],[186,251],[199,227],[216,203]];
// Trace the velvet emerald photograph rather than reusing the older stone bounds.
studioGemOutlines['ai-emerald-ring-velvet']=[[207,83],[301,102],[310,116],[273,240],[260,248],[169,231],[160,219],[195,95]];
studioGemOutlines['ai-emerald-ring-velvet-1ct-v2']=[[222,105],[279,116],[283,128],[259,212],[251,217],[186,203],[187,192],[211,112]];
studioGemOutlines['ai-emerald-ring-velvet-3ct-v2']=[[212,69],[315,92],[325,111],[288,262],[273,273],[152,249],[144,230],[186,83]];
studioGemOutlines["ai-round-ring-velvet-1ct-v2"]=[[229,83],[250,88],[264,103],[268,121],[260,140],[244,152],[222,154],[201,146],[187,133],[183,115],[192,96],[209,86]];
studioGemOutlines["ai-round-ring-velvet-3ct-v2"]=[[228,52],[260,57],[286,77],[300,102],[301,126],[283,152],[260,171],[229,174],[201,165],[180,145],[163,120],[164,98],[180,76],[206,58]];
studioGemOutlines["ai-oval-ring-velvet-1ct-v2"]=[[224,85],[248,94],[264,117],[263,148],[250,181],[232,200],[208,210],[184,204],[169,184],[164,155],[174,124],[191,98]];
studioGemOutlines["ai-oval-ring-velvet-3ct-v2"]=[[230,47],[268,57],[290,86],[299,122],[287,164],[266,205],[238,234],[204,246],[171,237],[145,212],[133,181],[139,143],[158,102],[190,67]];
studioGemOutlines["ai-pear-ring-velvet-1ct-v2"]=[[242,87],[252,119],[260,146],[258,171],[247,191],[226,200],[203,199],[183,187],[172,167],[176,147],[194,125],[218,104]];
studioGemOutlines["ai-pear-ring-velvet-3ct-v2"]=[[250,52],[273,97],[282,143],[278,186],[261,222],[231,242],[198,240],[166,224],[143,201],[135,172],[147,144],[179,109],[215,78]];
studioGemOutlines["ai-marquise-ring-velvet-1ct-v2"]=[[204,96],[222,122],[232,153],[231,178],[218,206],[183,230],[162,209],[156,183],[158,155],[173,124]];
studioGemOutlines["ai-marquise-ring-velvet-3ct-v2"]=[[205,57],[231,92],[249,132],[253,181],[241,226],[212,267],[180,287],[148,250],[124,211],[122,174],[133,127],[166,88]];
const studioMetalTones = {yellow:[.12,.58],white:[.61,.055],rose:[.055,.43]};
const studioStoneTones = {clear:[.61,.045],blue:[.615,.82],pink:[.93,.55],green:[.425,.79],purple:[.765,.65],yellow:[.14,.78]};
function studioHsl(h,s,l) {
  const a=s*Math.min(l,1-l);
  const channel=n=>{const k=(n+h*12)%12; return (l-a*Math.max(-1,Math.min(k-3,9-k,1)))*255;};
  return [channel(0),channel(8),channel(4)];
}
async function studioSource(reference) {
  const sourceKey=reference.image+'|'+(reference.chain||'anchor')+'|'+(reference.clearGem?'clear':'original')+'|'+(reference.variantStone||'base');
  if(studioSourceCache.has(sourceKey))return studioSourceCache.get(sourceKey);
  const pending=new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=async()=>{
      try {
        const canvas=document.createElement('canvas'); canvas.width=960; canvas.height=960;
        const context=canvas.getContext('2d',{willReadFrequently:true}); context.drawImage(img,0,0,960,960);
        // Rolo changes only the chain region; the pendant and stone keep their original pixels.
        if(reference.chain==='rolo'){
          const rolo=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=`assets/images/${reference.image}-rolo-960.webp`;});
          const layer=document.createElement('canvas');layer.width=960;layer.height=960;
          const lc=layer.getContext('2d');lc.drawImage(rolo,0,0,960,960);
          const cutoffs={oval:153,round:194,emerald:132,pear:122,marquise:101};
          const cutoff=cutoffs[reference.shape]*2;
          const fade=lc.createLinearGradient(0,cutoff-6,0,cutoff+6);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#ffffff00');
          lc.globalCompositeOperation='destination-in';lc.fillStyle=fade;lc.fillRect(0,0,960,960);
          context.drawImage(layer,0,0);
        }
        const mask=document.createElement('canvas');mask.width=960;mask.height=960;
        const mc=mask.getContext('2d',{willReadFrequently:true});mc.scale(2,2);mc.beginPath();
        const outline=studioGemOutlines[reference.image];
        outline.forEach(([x,y],index)=>index?mc.lineTo(x,y):mc.moveTo(x,y));mc.closePath();mc.fillStyle='#fff';mc.strokeStyle='#fff';mc.lineWidth=6;mc.lineJoin='round';mc.fill();mc.stroke();
        for(const [x,y,rx,ry] of studioEternityFaces[reference.image]||[]){mc.beginPath();mc.ellipse(x,y,rx,ry,0,0,Math.PI*2);mc.fill();}
        if(reference.clearGem){
          const clear=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=`assets/images/${reference.image}-clear-960.webp`;});
          const layer=document.createElement('canvas');layer.width=960;layer.height=960;
          const lc=layer.getContext('2d');lc.drawImage(clear,0,0,960,960);
          // Include the stone rim so the original coloured edge cannot show through.
          const rim=document.createElement('canvas');rim.width=960;rim.height=960;
          const rc=rim.getContext('2d');rc.drawImage(mask,0,0);rc.scale(2,2);rc.beginPath();
          outline.forEach(([x,y],index)=>index?rc.lineTo(x,y):rc.moveTo(x,y));rc.closePath();rc.strokeStyle='#fff';rc.lineWidth=18;rc.lineJoin='round';rc.stroke();
          lc.globalCompositeOperation='destination-in';lc.drawImage(rim,0,0);
          context.drawImage(layer,0,0);
        }
        const pixels=context.getImageData(0,0,960,960);
        const maskPixels=mc.getImageData(0,0,960,960).data;
        // Catch original gemstone pigment just beyond the hand-traced outline.
        mc.lineWidth=18;mc.stroke();
        const rimPixels=mc.getImageData(0,0,960,960).data;
        const xs=outline.map(p=>p[0]*2),ys=outline.map(p=>p[1]*2);
        const centreX=(Math.min(...xs)+Math.max(...xs))/2,centreY=(Math.min(...ys)+Math.max(...ys))/2;
        const radiusX=(Math.max(...xs)-Math.min(...xs))/2,radiusY=(Math.max(...ys)-Math.min(...ys))/2;
        const count=960*960,metal=new Float32Array(count),gem=new Float32Array(count),lightness=new Float32Array(count);
        for(let i=0;i<count;i++){
          if(i>0&&i%65536===0)await new Promise(resolve=>setTimeout(resolve,0));
          const p=i*4,r=pixels.data[p]/255,g=pixels.data[p+1]/255,b=pixels.data[p+2]/255;
          const max=Math.max(r,g,b),min=Math.min(r,g,b),sat=max?(max-min)/max:0;
          lightness[i]=(max+min)/2;
          const warm=r>g*1.035&&g>b*1.035;
          const originalPigment=reference.stone==='blue'?b>r*1.25&&b>g*1.06:reference.stone==='pink'?r>g*1.08&&b>g*1.04:reference.stone==='purple'?r>g*1.12&&b>g*1.1:reference.stone==='green'?g>r*1.1&&g>b*1.02:false;
          const rimPigment=rimPixels[p+3]&&originalPigment&&sat>.2&&max>.08;
          const inGem=rimPigment?1:maskPixels[p+3]/255;
          // Gold claws are yellow/orange; pink gemstone facets must remain in the stone mask.
          const onMarquiseClaw=reference.variantStone&&inGem&&studioMarquiseClaws.some(([x,y,radius])=>Math.hypot(i%960-x*2,Math.floor(i/960)-y*2)<radius*2);
          const warmClaw=reference.variantStone?inGem&&onMarquiseClaw:inGem&&warm&&(reference.metal!=='white')&&sat>(studioEternityFaces[reference.image]?.25:reference.stone==='clear'?.36:.17)&&g>b*1.25;
          if(inGem&&!warmClaw){gem[i]=inGem;continue;}
          const px=i%960,py=Math.floor(i/960);
          const reflectedColour=reference.stone==='pink'?r>g*1.08&&b>g*1.04:reference.stone==='purple'?r>g*1.12&&b>g*1.1:reference.stone==='green'?g>r*1.1&&g>b*1.02:false;
          if(reflectedColour&&Math.abs(px-centreX)<radiusX*1.5&&py>centreY-radiusY*1.2&&py<centreY+radiusY*1.9){gem[i]=1;continue;}
          if(reference.metal==='white')metal[i]=b<=r*1.12&&sat<.32&&max>.11?Math.min(1,(max-.11)/.12):0;
          else metal[i]=warm&&max>.08&&(!reference.image.includes('eternity')||sat>.32)?Math.min(1,(r-b)/.08):0;
        }
        let pendantMask,pendantEraseMask;
        if(reference.piece==='pendant'){
          pendantMask=new Uint8ClampedArray(count);
          for(let i=0;i<count;i++){
            const x=i%960,y=Math.floor(i/960);
            pendantMask[i]=reference.shape==='emerald'?rimPixels[i*4+3]:maskPixels[i*4+3];
            const nearSetting=rimPixels[i*4+3]||y>centreY||!reference.image.includes('-direct-');
            if(nearSetting&&Math.abs(x-centreX)<radiusX+32&&y>centreY-radiusY+16&&y<centreY+radiusY+32){
              const p=i*4,r=pixels.data[p]/255,g=pixels.data[p+1]/255,b=pixels.data[p+2]/255;
              if(metal[i]||(r>.12&&g>r*.55&&b<r*1.35))pendantMask[i]=255;
            }
          }
          // Include dark facets between the detected light edges, so shrinking
          // cannot leave the original rim behind as a second stone outline.
          for(let y=Math.max(0,Math.floor(centreY-radiusY));y<Math.min(960,centreY+radiusY+36);y++){
            let first=960,last=-1;
            for(let x=Math.max(0,Math.floor(centreX-radiusX-36));x<Math.min(960,centreX+radiusX+36);x++)if(pendantMask[y*960+x]){first=Math.min(first,x);last=Math.max(last,x);}
            for(let x=first+1;x<last;x++)pendantMask[y*960+x]=255;
          }
          pendantEraseMask=new Uint8ClampedArray(pendantMask);
          // Remove the former contact shadow as well as the old setting when
          // shrinking, otherwise a detached dark outline remains below it.
          const bottom=centreY+radiusY;
          for(let y=Math.max(0,Math.floor(bottom-8));y<Math.min(960,bottom+76);y++){
            const fadeY=1-Math.max(0,Math.min(1,(y-bottom-28)/48));
            for(let x=Math.max(0,Math.floor(centreX-radiusX-48));x<Math.min(960,centreX+radiusX+48);x++){
              const fadeX=1-Math.max(0,Math.min(1,(Math.abs(x-centreX)-radiusX-12)/36));
              const i=y*960+x;pendantEraseMask[i]=Math.max(pendantEraseMask[i],Math.round(255*fadeX*fadeY));
            }
          }
        }
        resolve({pixels,metal,gem,lightness,pendantMask,pendantEraseMask,width:960,height:960,cx:centreX,cy:centreY,rx:radiusX,ry:radiusY});
      }catch(error){reject(error);}
    };
    img.onerror=()=>reject(new Error('The design image could not load.'));
    img.src=`assets/images/${reference.image}${reference.variantStone?"-"+reference.variantStone+"-v2":""}-960.webp`;
  });
  if(studioSourceCache.size>=3)studioSourceCache.delete(studioSourceCache.keys().next().value);
  studioSourceCache.set(sourceKey,pending);
  try{return await pending;}catch(error){studioSourceCache.delete(sourceKey);throw error;}
}
async function studioResizePendant(source,coloured,scale){
  const {width,height,cx,cy,rx,ry,pendantMask:mask,pendantEraseMask:eraseMask}=source;
  const result=new Uint8ClampedArray(coloured);
  // Anchor at the complete setting's top, including prongs outside the face.
  // Starting below this edge leaves fragments of the old corners on shrink.
  const first=mask.findIndex(alpha=>alpha>0);
  const anchorY=first<0?cy-ry:Math.floor(first/width);
  const left=new Int32Array(height).fill(width),right=new Int32Array(height).fill(-1);
  for(let y=Math.max(0,Math.floor(anchorY));y<Math.min(height,cy+ry+80);y++){
    for(let x=Math.max(0,Math.floor(cx-rx-52));x<Math.min(width,cx+rx+52);x++)if(eraseMask[y*width+x]){left[y]=Math.min(left[y],x);right[y]=Math.max(right[y],x);}
  }
  const extent=Math.max(1,scale),xMin=Math.max(0,Math.floor(cx-(rx+56)*extent)),xMax=Math.min(width-1,Math.ceil(cx+(rx+56)*extent));
  const yMax=Math.min(height-1,Math.ceil(anchorY+(ry*2+80)*extent));
  for(let y=Math.max(0,Math.floor(anchorY));y<=yMax;y++){
    if(y%32===0)await new Promise(resolve=>setTimeout(resolve,0));
    for(let x=xMin;x<=xMax;x++){
      const i=y*width+x,p=i*4,oldAlpha=eraseMask[i]/255;
      // One affine scale preserves the cut and facets. The chain above the
      // attachment stays in the original image; no chain links are resampled.
      const sx=cx+(x-cx)/scale,sy=anchorY+(y-anchorY)/scale;
      const x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0;
      const valid=x0>=0&&x0<width-1&&y0>=0&&y0<height-1;
      const w00=(1-fx)*(1-fy),w01=fx*(1-fy),w10=(1-fx)*fy,w11=fx*fy;
      const i00=y0*width+x0,i01=i00+1,i10=i00+width,i11=i10+1;
      const newAlpha=valid?(mask[i00]*w00+mask[i01]*w01+mask[i10]*w10+mask[i11]*w11)/255:0;
      if(!oldAlpha&&!newAlpha)continue;
      // Reveal nearby velvet where the old stone no longer covers it. Mirror
      // the adjacent texture rather than stretching the surrounding photo.
      const l=left[y],r=right[y],span=Math.max(1,r-l),t=Math.max(0,Math.min(1,(x-l)/span));
      const lx=Math.max(0,Math.min(width-1,Math.floor(l-2-Math.max(0,x-l))));
      const rxSample=Math.max(0,Math.min(width-1,Math.ceil(r+2+Math.max(0,r-x))));
      for(let c=0;c<3;c++){
        const background=coloured[(y*width+lx)*4+c]*(1-t)+coloured[(y*width+rxSample)*4+c]*t;
        const base=coloured[p+c]*(1-oldAlpha)+background*oldAlpha;
        const foreground=valid?coloured[i00*4+c]*w00+coloured[i01*4+c]*w01+coloured[i10*4+c]*w10+coloured[i11*4+c]*w11:0;
        result[p+c]=base*(1-newAlpha)+foreground*newAlpha;
      }
    }
  }
  return result;
}
async function renderStudioConcept(reference,choices) {
  // Matched complete-ring photographs keep the shank and shoulder connections
  // coherent at each size. Apply only material colour to these size previews.
  if(/^ai-(round|oval|emerald|pear|marquise)-ring-velvet$/.test(reference.image)&&[1,3].includes(Number(choices.carat))){
    return renderStudioConcept({...reference,image:`${reference.image}-${Number(choices.carat)}ct-v2`},{...choices,carat:'2'});
  }
  // Dedicated AI material images supply the marquise colours; no gemstone tint is applied.
  if(reference.image==='ai-marquise-ring'&&!choices.fixedPhoto)reference={...reference,stone:choices.stone,variantStone:choices.stone};
  const assetStem=reference.image+(reference.variantStone?'-'+reference.variantStone+'-v2':'');
  const carat=Number(choices.carat||2);
  const polishedAnchor=reference.piece==='pendant'&&choices.polishedAnchor===true;
  const chain=reference.piece==='pendant'&&choices.chain==='rolo'?'rolo':'anchor';
  if(reference.metal===choices.metal&&reference.stone===choices.stone&&carat===2&&chain==='anchor'&&!polishedAnchor)return `assets/images/${assetStem}-960.webp`;
  const key=[reference.image,choices.metal,choices.stone,carat,chain,!!choices.fixedPhoto,polishedAnchor].join('|');
  if(studioRenderCache.has(key))return studioRenderCache.get(key);
  // Start oval colour variants from neutral facets, preventing the original pink from bleeding through.
  const clearGem=!choices.fixedPhoto&&reference.shape==='oval'&&choices.stone!==reference.stone;
  const source=await studioSource({...reference,chain,clearGem}),original=source.pixels.data;
  const coloured=new Uint8ClampedArray(original);
  const metalTone=studioMetalTones[choices.metal],gemTone=studioStoneTones[choices.stone];
  for(let i=0;i<source.width*source.height;i++){
    if(i>0&&i%65536===0)await new Promise(resolve=>setTimeout(resolve,0));
    let alpha=0,tone,l=source.lightness[i];
    if(reference.stone!==choices.stone&&source.gem[i]&&!(clearGem&&choices.stone==='clear'&&source.gem[i]>.95)){
      alpha=source.gem[i];tone=gemTone;
      if(choices.stone==='clear')l=source.gem[i]>.95?Math.min(.985,.06+.94*Math.pow(l,.42)):Math.min(.98,l*.95+.055);
    }else if(reference.metal!==choices.metal&&source.metal[i]){alpha=source.metal[i];tone=metalTone;}
    if(!alpha)continue;
    const saturation=tone[1]*Math.max(.12,1-Math.pow(l,5));
    const rgb=studioHsl(tone[0],saturation,l),p=i*4;
    for(let c=0;c<3;c++)coloured[p+c]=original[p+c]*(1-alpha)+rgb[c]*alpha;
  }
  if(polishedAnchor){
    // Increase the contrast of existing chain reflections, using the metal mask.
    // The pendant, stone, background and link geometry keep their original pixels.
    const cutoff=({oval:153,round:194,emerald:132,pear:122,marquise:101}[reference.shape]||100)*2;
    for(let y=0;y<Math.min(cutoff,source.height);y++){
      if(y>0&&y%80===0)await new Promise(resolve=>setTimeout(resolve,0));
      const fade=Math.min(1,(cutoff-y)/12);
      for(let x=0;x<source.width;x++){
        const i=y*source.width+x,alpha=source.metal[i]*fade;
        if(alpha<.01)continue;
        const p=i*4,l=(Math.max(coloured[p],coloured[p+1],coloured[p+2])+Math.min(coloured[p],coloured[p+1],coloured[p+2]))/510;
        const highlight=Math.max(0,Math.min(.1,(l-.5)*.22));
        for(let c=0;c<3;c++){
          const value=coloured[p+c]/255;
          const contrast=Math.max(0,Math.min(1,(value-.43)*1.24+.48));
          const polished=(contrast*(1-highlight)+highlight)*255;
          coloured[p+c]=coloured[p+c]*(1-alpha)+polished*alpha;
        }
      }
    }
  }
  const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
  const context=canvas.getContext('2d');
  let result=coloured;
  const scale=Math.cbrt(carat/2);
  if(Math.abs(scale-1)>.001&&reference.piece==='pendant'){
    result=await studioResizePendant(source,coloured,scale);

  }
  context.putImageData(new ImageData(result,source.width,source.height),0,0);
  const url=canvas.toDataURL('image/webp',.94);
  if(studioRenderCache.size>=12)studioRenderCache.delete(studioRenderCache.keys().next().value);
  studioRenderCache.set(key,url);return url;
}


