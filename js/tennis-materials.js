/* Recolour chromatic gold only. Neutral diamond facets and navy velvet stay untouched. */
(() => {
  function recolourGold(data,finish) {
    const output=new Uint8ClampedArray(data);
    if(finish==='yellow')return output;
    if(!['rose','white'].includes(finish))throw new Error('Unknown gold finish');
    const [h,s]=finish==='rose'?[.045,.43]:[.60,.035];
    for(let p=0;p<data.length;p+=4){
      const r=data[p]/255,g=data[p+1]/255,b=data[p+2]/255;
      const hi=Math.max(r,g,b),lo=Math.min(r,g,b),sat=hi?(hi-lo)/hi:0;
      if(r<=g*1.045 || g<=b*1.11 || sat<.17 || hi<.13)continue;
      const alpha=Math.min(1,(sat-.17)/.12)*Math.min(1,(g/b-1.11)/.14);
      const l=(hi+lo)/2,a=s*Math.max(.12,1-l**5)*Math.min(l,1-l);
      const channel=n=>{const k=(n+h*12)%12;return (l-a*Math.max(-1,Math.min(k-3,9-k,1)))*255;};
      const rgb=[channel(0),channel(8),channel(4)];
      for(let c=0;c<3;c++)output[p+c]=data[p+c]*(1-alpha)+rgb[c]*alpha;
    }
    return output;
  }
  window.TennisMaterials={recolourGold};
})();
