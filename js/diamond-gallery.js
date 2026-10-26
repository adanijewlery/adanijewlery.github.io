/* Product gallery details; original-photo comparison controls are omitted. */
(() => {
  const note=document.querySelector('#dialog-concept-note');
  if(!note)return;
  window.DiamondGallery={open(button){
    note.textContent='AI-created design concept. Final materials, dimensions, availability and price are confirmed personally.';
    note.hidden=button.dataset.concept!=='true';
  }};
})();
