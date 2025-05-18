// content_script.js

(function() {
  function di1(dj1) {
    const dk1 = ['k1', 'cd1', 'dc1'];
    let dl1 = 0;
    const dm1 = 50;

    const dn1 = setInterval(() => {
      dl1++;
      const dp1 = dk1.every(dq1 => typeof window[dq1] === 'function');
      if (dp1) {
        clearInterval(dn1);
        dj1();
      } else if (dl1 >= dm1) {
        clearInterval(dn1);
        dr1();
      }
    }, 100);
  }

  setTimeout(() => {
    di1(ds1);
  }, 1000);
  
  function ds1() {
    dr1();
  }
  
  function dr1() {
    document.addEventListener('dblclick', (dt1) => {
      if (dt1.button === 0) {
        du1();
      }
    });
  }
  
  async function du1() {
    try {
      const dv1 = window.k1();
      if (!dv1.q2) {
        return;
      }
      
      const dw1 = dx1(dv1);
      const dy1 = await window.dc1(dw1);
      
      if (dy1 && dy1.choices && dy1.choices[0] && dy1.choices[0].message) {
        window.cd1(dy1.choices[0].message.content);
      }
    } catch (dz1) {
      // Silently fail to avoid detection
    }
  }
  
  function dx1(ea1) {
    return "Question: " + ea1.q2 + "\n" +
      (ea1.q3.length > 0 ? 
       "Options:\n" + ea1.q3.map((eb1, ec1) => (ec1 + 1) + ". " + eb1).join("\n") : "") +
      "\nPlease provide the correct answer with brief explanation.";
  }
})();