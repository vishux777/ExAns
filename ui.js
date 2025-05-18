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
    ci1.style.fontSize = '13px'; // smaller fallback font
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
    }, 3000);
  }
};

function cg1(ce1, cf1 = 'by1') {
  const cj1 = bx1[cf1];

  const ck1 = document.createElement('canvas');
  const cl1 = 'cm1_' + Math.random().toString(36).substring(2, 10);
  ck1.id = cl1;

  ck1.width = 400;
  ck1.height = 400; // increased height

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

  const co1 = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    return y;
  };

  // Draw heading
  cn1.fillStyle = cj1.cb1;
  cn1.font = 'bold 16px Arial, sans-serif';
  cn1.fillText('Answer:', 20, 30);

  // Split correct line if available
  const lines = ce1.split('\n');
  let correctLine = '';
  let remainingText = ce1;
  for (const line of lines) {
    if (/correct answer|option/i.test(line)) {
      correctLine = line.trim();
      remainingText = lines.filter(l => l !== line).join('\n');
      break;
    }
  }

  let currentY = 55;
  if (correctLine) {
    cn1.fillStyle = '#00ff99';
    cn1.font = 'bold 14px Arial, sans-serif';
    currentY = co1(cn1, correctLine, 20, currentY, ck1.width - 40, 18) + 10;
  }

  cn1.fillStyle = cj1.ca1;
  cn1.font = '13px Arial, sans-serif'; // smaller font
  co1(cn1, remainingText, 20, currentY, ck1.width - 40, 18);

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
  }, 8000); // visible longer for readability
}
