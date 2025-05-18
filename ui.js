// ui.js

const bx1 = {
  by1: {
    bz1: 'rgba(30, 30, 30, 0.85)',
    ca1: '#fff',
    cb1: '#3a8ee6'
  }
};

let cc1 = [];

window.cd1 = function(ce1) {
  try {
    const cf1 = 'by1';
    cg1(ce1, cf1);
  } catch (ch1) {
    // Fallback to minimal display if canvas fails
    const ci1 = document.createElement('div');
    ci1.style.position = 'fixed';
    ci1.style.bottom = '10px';
    ci1.style.right = '10px';
    ci1.style.padding = '5px';
    ci1.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    ci1.style.color = '#fff';
    ci1.style.fontFamily = 'Arial, sans-serif';
    ci1.style.fontSize = '16px';
    ci1.style.zIndex = '2147483647';
    ci1.style.opacity = '0';
    ci1.style.transition = 'opacity 0.2s';
    ci1.textContent = ce1;
    document.body.appendChild(ci1);
    setTimeout(() => {
      ci1.style.opacity = '1';
    }, 10);
    setTimeout(() => {
      ci1.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(ci1)) {
          document.body.removeChild(ci1);
        }
      }, 200);
    }, 2000);
  }
};

function cg1(ce1, cf1 = 'by1') {
  const cj1 = bx1[cf1];
  
  const ck1 = document.createElement('canvas');
  
  const cl1 = 'cm1_' + Math.random().toString(36).substring(2, 10);
  ck1.id = cl1;
  
  ck1.width = 400;
  ck1.height = 300;
  
  ck1.style.position = 'fixed';
  ck1.style.bottom = '20px';
  ck1.style.right = '20px';
  ck1.style.zIndex = '2147483646';
  ck1.style.border = '1px solid ' + cj1.cb1;
  ck1.style.borderRadius = '4px';
  ck1.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  ck1.style.opacity = '0';
  ck1.style.transition = 'opacity 0.2s';
  
  document.body.appendChild(ck1);
  cc1.push(ck1);
  
  const cn1 = ck1.getContext('2d');
  cn1.fillStyle = cj1.bz1;
  cn1.fillRect(0, 0, ck1.width, ck1.height);
  
  cn1.fillStyle = cj1.ca1;
  cn1.font = '16px Arial, sans-serif';
  
  const co1 = (cp1, cq1, cr1, cs1, ct1, cu1) => {
    const cv1 = cq1.split(' ');
    let cw1 = '';
    
    for (let cx1 = 0; cx1 < cv1.length; cx1++) {
      const cy1 = cw1 + cv1[cx1] + ' ';
      const cz1 = cp1.measureText(cy1);
      const da1 = cz1.width;
      
      if (da1 > ct1 && cx1 > 0) {
        cp1.fillText(cw1, cr1, cs1);
        cw1 = cv1[cx1] + ' ';
        cs1 += cu1;
      } else {
        cw1 = cy1;
      }
    }
    
    cp1.fillText(cw1, cr1, cs1);
    return cs1;
  };
  
  cn1.fillStyle = cj1.cb1;
  cn1.font = 'bold 18px Arial, sans-serif';
  cn1.fillText('Answer:', 20, 30);
  
  cn1.fillStyle = cj1.ca1;
  cn1.font = '16px Arial, sans-serif';
  co1(cn1, ce1, 20, 60, ck1.width - 40, 20);
  
  setTimeout(() => {
    ck1.style.opacity = '1';
  }, 10);
  
  setTimeout(() => {
    ck1.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(ck1)) {
        document.body.removeChild(ck1);
      }
      cc1 = cc1.filter(db1 => db1 !== ck1);
    }, 200);
  }, 2000);
}