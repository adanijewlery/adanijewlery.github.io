/* HK sizes and centimetre measurements; no precious-metal weight is displayed. */
(() => {
  const hkSizes=[{"hk":5,"circumferenceCm":4.33,"diameterCm":1.38},{"hk":6,"circumferenceCm":4.43,"diameterCm":1.41},{"hk":7,"circumferenceCm":4.55,"diameterCm":1.45},{"hk":8,"circumferenceCm":4.65,"diameterCm":1.48},{"hk":9,"circumferenceCm":4.77,"diameterCm":1.52},{"hk":10,"circumferenceCm":4.87,"diameterCm":1.55},{"hk":11,"circumferenceCm":4.99,"diameterCm":1.59},{"hk":12,"circumferenceCm":5.09,"diameterCm":1.62},{"hk":13,"circumferenceCm":5.21,"diameterCm":1.66},{"hk":14,"circumferenceCm":5.31,"diameterCm":1.69},{"hk":15,"circumferenceCm":5.43,"diameterCm":1.73},{"hk":16,"circumferenceCm":5.56,"diameterCm":1.77},{"hk":17,"circumferenceCm":5.65,"diameterCm":1.8},{"hk":18,"circumferenceCm":5.75,"diameterCm":1.83},{"hk":19,"circumferenceCm":5.87,"diameterCm":1.87},{"hk":20,"circumferenceCm":5.97,"diameterCm":1.9},{"hk":21,"circumferenceCm":6.09,"diameterCm":1.94},{"hk":22,"circumferenceCm":6.19,"diameterCm":1.97},{"hk":23,"circumferenceCm":6.31,"diameterCm":2.01},{"hk":24,"circumferenceCm":6.41,"diameterCm":2.04},{"hk":25,"circumferenceCm":6.53,"diameterCm":2.08},{"hk":26,"circumferenceCm":6.63,"diameterCm":2.11},{"hk":27,"circumferenceCm":6.75,"diameterCm":2.15},{"hk":28,"circumferenceCm":6.85,"diameterCm":2.18},{"hk":29,"circumferenceCm":6.97,"diameterCm":2.22},{"hk":30,"circumferenceCm":7.07,"diameterCm":2.25}];
  function nearestHK(value,method='diameterCm'){
    if(!['diameterCm','circumferenceCm'].includes(method)||String(value).trim()==='')return null;
    const number=Number(value);
    if(!Number.isFinite(number)||number<hkSizes[0][method]||number>hkSizes.at(-1)[method])return null;
    return hkSizes.reduce((best,row)=>Math.abs(row[method]-number)<=Math.abs(best[method]-number)?row:best);
  }
  window.JewelleryGuide={hkSizes,nearestHK};
  document.addEventListener('DOMContentLoaded',()=>{
    const design=document.querySelector('#design');if(!design)return;
    const guide=document.createElement('section');guide.id='sizing';guide.className='jewellery-sizing';guide.setAttribute('aria-labelledby','sizing-title');
    guide.innerHTML=`<span class="eyebrow">FIND YOUR FIT</span><h2 id="sizing-title">A comfortable fit.<br>A personal measure.</h2><p>Rings use Hong Kong (HK) sizes. Bracelet, necklace and Jadi measurements use centimetres.</p>
    <div class="sizing-grid"><article><h3>Rings · HK sizes</h3><ol><li>Use a ring that fits the intended finger comfortably.</li><li>Measure straight across the inside of the ring, excluding the metal edges.</li><li>Enter the inside diameter in centimetres below to estimate your HK size.</li></ol><div class="hk-checker"><label>Measurement type<select id="hk-method"><option value="diameterCm">Inside diameter (cm)</option><option value="circumferenceCm">Inside circumference (cm)</option></select></label><label>Measurement (cm)<input id="hk-measurement" type="number" min="0" max="10" step="0.01" inputmode="decimal" placeholder="1.73"></label><p id="hk-result" role="status" aria-live="polite">Enter a measurement to find your HK size.</p><button type="button" id="hk-use-size" disabled>Use this HK size</button></div><p class="sizing-note">This is an approximate conversion. Repeat your measurement and confirm the final fit with ADANI, especially for wide or eternity bands.</p><details><summary>View the HK size chart</summary><div class="size-table-wrap" tabindex="0" role="region" aria-label="HK size conversion chart"><table><caption>Approximate inside measurements</caption><thead><tr><th>HK size</th><th>Diameter (cm)</th><th>Circumference (cm)</th></tr></thead><tbody>${hkSizes.map(row=>`<tr><th scope="row">HK ${row.hk}</th><td>${row.diameterCm.toFixed(2)}</td><td>${row.circumferenceCm.toFixed(2)}</td></tr>`).join('')}</tbody></table></div><p class="sizing-note"><a href="https://www.chowsangsang.com/eshop-hk/en/product-size-guide" target="_blank" rel="noopener">HK conversion reference</a></p></details></article>
    <article><h3>Bracelets, necklaces & Jadi · cm</h3><h4>Bracelets</h4><p>Wrap a soft measuring tape around your wrist without tightening it. Record the wrist measurement in cm; we will confirm the finished bracelet length and comfortable fit with you.</p><h4>Necklaces</h4><p>Use a soft tape or non-stretch string to find your preferred necklace length. Measure the full length from clasp to clasp in cm, including any extender you want to use.</p><h4>Jadi hand chains</h4><p>Send your wrist measurement, your HK ring size, and the distance from the bracelet position to the ring along the back of your hand in cm.</p><a class="sizing-contact" href="https://wa.me/972545545132?text=Hello%20ADANI%2C%20please%20help%20me%20choose%20my%20jewellery%20size.">Help me find my size ↗</a></article></div>`;
    design.insertAdjacentElement('afterend',guide);
    const ringSize=design.querySelector('#photo-ring-size');
    const help=document.createElement('a');help.href='#sizing';help.className='size-guide-link';help.textContent='View sizing guide ↗';
    ringSize.closest('label').append(help);
    const enquiry=design.querySelector('.photo-enquiry'),panel=document.createElement('div');panel.className='product-facts';panel.id='design-product-facts';
    panel.innerHTML='<h4>Product details</h4><dl><div><dt>Gold purity</dt><dd>14k gold</dd></div><div><dt>Diamonds</dt><dd id="design-diamond-fact"></dd></div></dl><p class="sizing-note">Diamond sizes in the preview are illustrative. Final details are confirmed personally.</p>';
    enquiry.querySelector('#photo-selection-metal').insertAdjacentElement('afterend',panel);
    function updateFacts(){
      const isRing=design.querySelector('[data-piece="ring"]').getAttribute('aria-pressed')==='true';panel.hidden=!isRing;
      const shape=design.querySelector('[data-shape][aria-pressed="true"]')?.dataset.shape||'round';
      const ct=design.querySelector('[data-carat][aria-pressed="true"]')?.dataset.carat||'2';
      const fact=panel.querySelector('#design-diamond-fact');fact.replaceChildren();
      if(shape.startsWith('eternity'))fact.textContent='Carat weight confirmed with your design';
      else {const number=document.createElement('span');number.textContent=ct+' ct';const label=document.createElement('span');label.textContent='Centre diamond';fact.append(number,document.createTextNode(' · '),label);}
    }
    design.addEventListener('click',event=>{if(event.target.closest('[data-piece],[data-shape],[data-carat]'))updateFacts();});updateFacts();
    const input=guide.querySelector('#hk-measurement'),method=guide.querySelector('#hk-method'),result=guide.querySelector('#hk-result'),use=guide.querySelector('#hk-use-size');let selected=null;
    function calculate(){selected=input.value.trim()?nearestHK(input.value,method.value):null;use.disabled=!selected;
      if(!input.value.trim())result.textContent='Enter a measurement to find your HK size.';
      else if(!selected)result.textContent='This measurement is outside the guide range. Contact ADANI for sizing help.';
      else {result.replaceChildren();const label=document.createElement('span');label.textContent='Estimated size';const value=document.createElement('strong');value.textContent='HK '+selected.hk;result.append(label,document.createTextNode(' · '),value);}
    }
    input.addEventListener('input',calculate);method.addEventListener('change',()=>{input.value='';input.placeholder=method.value==='diameterCm'?'1.73':'5.43';calculate();});
    use.addEventListener('click',()=>{if(!selected)return;design.querySelector('[data-piece="ring"]').click();ringSize.value=String(selected.hk);ringSize.dispatchEvent(new Event('change',{bubbles:true}));ringSize.focus();ringSize.scrollIntoView({block:'center',behavior:'smooth'});});

  });
})();
