// extractor.js

window.k1 = function() {
  let l1 = '';
  const l2 = [];
  const l3 = new Set();
  
  try {
    const m1 = Math.floor(Math.random() * 3);
    
    switch(m1) {
      case 0:
        return n1();
      case 1:
        return o1();
      case 2:
        return p1();
      default:
        return o1();
    }
  } catch (q1) {
    return { q2: '', q3: [] };
  }
  
  function n1() {
    let r1 = '';
    const r2 = [];
    
    function s1(t1, t2 = 0) {
      if (!t1 || t2 > 15) return;
      
      if (t1.nodeType === Node.TEXT_NODE) {
        const u1 = t1.textContent.trim();
        if (u1.length > 5) {
          r1 += u1 + ' ';
        }
        return;
      }
      
      if (t1.nodeType === Node.ELEMENT_NODE) {
        const v1 = window.getComputedStyle(t1);
        if (v1.display === 'none' || v1.visibility === 'hidden' || v1.opacity === '0') {
          return;
        }
        
        if (t1.tagName === 'INPUT') {
          if ((t1.type === 'radio' || t1.type === 'checkbox') && w1(t1)) {
            const w2 = x1(t1);
            if (w2) r2.push(w2);
          }
        }
      }
      
      const y1 = t1.childNodes;
      for (let z1 = 0; z1 < y1.length; z1++) {
        s1(y1[z1], t2 + 1);
      }
    }
    
    s1(document.body);
    
    r1 = r1.replace(/\s+/g, ' ').trim();
    
    return {
      q2: r1,
      q3: r2
    };
  }
  
  function o1() {
    let aa1 = '';
    const aa2 = [];
    
    const ab1 = [
      'main', 'article', '.question', '.problem', '.quiz-item',
      '[role="main"]', '.content', '.question-text', '.stem'
    ];
    
    for (const ac1 of ab1) {
      const ad1 = document.querySelectorAll(ac1);
      if (ad1.length > 0) {
        for (const ae1 of ad1) {
          if (w1(ae1) && !l3.has(ae1)) {
            l3.add(ae1);
            const af1 = ae1.innerText || ae1.textContent;
            if (af1 && af1.trim().length > 15) {
              aa1 += af1.trim() + '\n';
            }
          }
        }
        if (aa1.length > 30) break;
      }
    }
    
    if (aa1.length < 30) {
      const ag1 = document.querySelectorAll('h1, h2, h3, h4, h5, p');
      for (const ah1 of ag1) {
        if (w1(ah1) && !l3.has(ah1)) {
          l3.add(ah1);
          const ai1 = ah1.innerText || ah1.textContent;
          if (ai1 && ai1.trim().length > 15) {
            aa1 += ai1.trim() + '\n';
          }
        }
      }
    }
    
    const aj1 = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    for (const ak1 of aj1) {
      if (w1(ak1)) {
        const al1 = x1(ak1);
        if (al1) aa2.push(al1);
      }
    }
    
    const am1 = document.querySelectorAll('li.option, li.answer, .option, .answer-choice');
    for (const an1 of am1) {
      if (w1(an1) && !l3.has(an1)) {
        l3.add(an1);
        const ao1 = an1.innerText || an1.textContent;
        if (ao1 && ao1.trim().length > 0) {
          aa2.push(ao1.trim());
        }
      }
    }
    
    return {
      q2: aa1.trim(),
      q3: aa2
    };
  }
  
  function p1() {
    let ap1 = '';
    const aq1 = [];
    const ar1 = [];
    
    document.querySelectorAll('div, p, h1, h2, h3, span').forEach(as1 => {
      if (w1(as1) && !l3.has(as1)) {
        const at1 = as1.innerText || as1.textContent || '';
        if (at1.trim().length > 20 && 
            !as1.querySelector('input') && 
            !as1.closest('footer') && 
            !as1.closest('header') && 
            !as1.closest('nav')) {
          
          const au1 = as1.getBoundingClientRect();
          const av1 = au1.top >= 0 && 
                       au1.left >= 0 && 
                       au1.bottom <= window.innerHeight && 
                       au1.right <= window.innerWidth;
          
          const aw1 = (at1.match(/\?/g) || []).length;
          const ax1 = /what|how|why|when|where|which|who|describe|explain/i.test(at1);
          
          let ay1 = 0;
          if (av1) ay1 += 5;
          ay1 += aw1 * 3;
          if (ax1) ay1 += 4;
          if (as1.tagName === 'H1' || as1.tagName === 'H2') ay1 += 3;
          
          ar1.push({az1: as1, ba1: ay1, bb1: at1.trim()});
          l3.add(as1);
        }
      }
    });
    
    ar1.sort((bc1, bd1) => bd1.ba1 - bc1.ba1);
    const be1 = ar1.slice(0, 3);
    
    ap1 = be1.map(bf1 => bf1.bb1).join('\n');
    
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(bg1 => {
      if (w1(bg1)) {
        const bh1 = x1(bg1);
        if (bh1) aq1.push(bh1);
      }
    });
    
    document.querySelectorAll('li, .option').forEach(bi1 => {
      if (w1(bi1) && !l3.has(bi1)) {
        const bj1 = bi1.innerText || bi1.textContent || '';
        if (bj1.trim().length > 0 && bj1.trim().length < 200) {
          const bk1 = bi1.parentElement;
          if (bk1 && bk1.children.length >= 2) {
            aq1.push(bj1.trim());
            l3.add(bi1);
          }
        }
      }
    });
    
    return {
      q2: ap1,
      q3: aq1
    };
  }
  
  function w1(bl1) {
    if (!bl1) return false;
    
    const bm1 = window.getComputedStyle(bl1);
    if (bm1.display === 'none' || 
        bm1.visibility === 'hidden' || 
        bm1.opacity === '0' || 
        parseInt(bm1.width) === 0 || 
        parseInt(bm1.height) === 0) {
      return false;
    }
    
    const bn1 = bl1.getBoundingClientRect();
    if (bn1.width === 0 || bn1.height === 0) {
      return false;
    }
    
    return true;
  }
  
  function x1(bo1) {
    let bp1 = '';
    
    if (bo1.labels && bo1.labels.length) {
      bp1 = bo1.labels[0].innerText || bo1.labels[0].textContent;
    } 
    else if (bo1.id && document.querySelector(`label[for="${bo1.id}"]`)) {
      bp1 = document.querySelector(`label[for="${bo1.id}"]`).innerText || 
            document.querySelector(`label[for="${bo1.id}"]`).textContent;
    } 
    else if (bo1.parentElement) {
      const bq1 = bo1.parentElement.cloneNode(true);
      const br1 = bq1.querySelectorAll('input');
      br1.forEach(bs1 => bs1.remove());
      
      bp1 = bq1.innerText || bq1.textContent;
    }
    
    return bp1 ? bp1.trim() : '';
  }
};

window.bt1 = function() {
  try {
    const bu1 = window.getSelection();
    if (bu1.rangeCount > 0) {
      const bv1 = bu1.toString().trim();
      if (bv1.length > 0) {
        return bv1;
      }
    }
    return '';
  } catch (bw1) {
    return '';
  }
};