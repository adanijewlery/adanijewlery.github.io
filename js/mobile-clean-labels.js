// Presentation-only: keep product images, controls and desktop disclosures intact.
(() => {
  const pattern = /\bAI(?:\b|[-‑])|בינה מלאכותית|(?:^|\s)ИИ(?:\s|[-.,]|$)/i;
  function markLabels(root) {
    if (!root) return;
    const nodes = root.matches?.('p,span,small') ? [root, ...root.querySelectorAll('p,span,small')] : [...root.querySelectorAll('p,span,small')];
    for (const node of nodes) {
      const ownText = [...node.childNodes].filter(child => child.nodeType === 3).map(child => child.textContent).join(' ');
      if (pattern.test(ownText)) node.classList.add('mobile-ai-label');
    }
  }
  markLabels(document);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') markLabels(record.target.parentElement);
      else for (const node of record.addedNodes) {
        if (node.nodeType === 1) markLabels(node);
        else if (node.nodeType === 3 && node.parentElement) markLabels(node.parentElement);
      }
    }
  }).observe(document.body, {childList:true, subtree:true, characterData:true});
})();
