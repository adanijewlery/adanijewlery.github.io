/* New design previews use fixed photographs for every finish and an explicit estimate basis. */
(() => {
 const cards=[...document.querySelectorAll('.world-edit-piece')];
 const dialog=document.querySelector('#piece-dialog');if(!cards.length||!dialog)return;
 const image=dialog.querySelector('#dialog-image'),link=dialog.querySelector('#dialog-contact');
 const metals={yellow:'Yellow gold',white:'White gold',rose:'Rose gold'};
 const states=new Map(cards.map(card=>[card.dataset.worldKey,{metal:'yellow',purity:'14'}]));
 const panel=document.createElement('div');panel.className='world-dialog-options';panel.hidden=true;
 panel.innerHTML='<p class="world-dialog-carat"></p><p class="world-estimate-note">Design estimate only. Final diamond weight is confirmed with your design.</p><div class="world-gold-options" role="group" aria-label="Gold colour">'+Object.entries(metals).map(([key,label])=>'<button type="button" data-world-metal="'+key+'" aria-pressed="false"><i class="world-swatch '+key+'" aria-hidden="true"></i><span>'+label+'</span></button>').join('')+'</div><label class="world-purity"><span>Gold purity</span><select><option value="14">14k gold · Standard</option><option value="18">18k gold · Made to order</option></select></label>';
 link.before(panel);let current=null;
 function path(key,metal,size){return 'assets/images/'+key+'-'+metal+'-'+size+'.webp';}
 function update(card,viewer=false){
  const key=card.dataset.worldKey,state=states.get(key),button=card.querySelector('.image-button'),photo=button.querySelector('img');
  photo.src=path(key,state.metal,480);photo.srcset=path(key,state.metal,480)+' 480w, '+path(key,state.metal,960)+' 960w';
  card.querySelectorAll('[data-world-metal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.worldMetal===state.metal)));
  card.querySelector('[data-world-purity]').value=state.purity;
  button.dataset.variant=metals[state.metal]+' · '+state.purity+'k';
  if(viewer){
   image.src=path(key,state.metal,1600);image.alt=button.dataset.name+' · '+metals[state.metal];
   panel.querySelector('.world-dialog-carat').textContent=card.dataset.caratLabel;
   panel.querySelectorAll('[data-world-metal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.worldMetal===state.metal)));
   panel.querySelector('select').value=state.purity;
   link.href='https://wa.me/972545545132?text='+encodeURIComponent("Hello ADANI, I'd like to discuss this design: "+button.dataset.name+'\nGold colour: '+metals[state.metal]+'\nGold purity: '+state.purity+'k'+(state.purity==='18'?' (made to order)':'')+'\nDiamond design estimate: '+card.dataset.caratLabel+'\nPlease confirm the final diamond weight, size, availability and quote.');
  }
 }
 cards.forEach(card=>{
  card.querySelectorAll('[data-world-metal]').forEach(button=>button.addEventListener('click',()=>{states.get(card.dataset.worldKey).metal=button.dataset.worldMetal;update(card,current===card&&dialog.open);}));
  card.querySelector('[data-world-purity]').addEventListener('change',event=>{states.get(card.dataset.worldKey).purity=event.target.value;update(card,current===card&&dialog.open);});
 });
 panel.querySelectorAll('[data-world-metal]').forEach(button=>button.addEventListener('click',()=>{if(!current)return;states.get(current.dataset.worldKey).metal=button.dataset.worldMetal;update(current,true);}));
 panel.querySelector('select').addEventListener('change',event=>{if(!current)return;states.get(current.dataset.worldKey).purity=event.target.value;update(current,true);});
 const previous=window.DiamondGallery?.open;
 window.DiamondGallery={open(button){
  previous?.(button);current=button.closest('.world-edit-piece');panel.hidden=!current;
  if(current){
   update(current,true);
   const note=dialog.querySelector('#dialog-concept-note');note.textContent='Design preview. Final materials, dimensions, availability and price are confirmed personally.';note.hidden=false;
  }
 }};
})();
