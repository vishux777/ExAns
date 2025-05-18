// proxy.js

window.dc1 = async function(dd1) {
  return new Promise((de1, df1) => {
    chrome.runtime.sendMessage(
      { c1: "e1", e2: dd1 },
      dg1 => {
        if (chrome.runtime.lastError) {
          df1(new Error(chrome.runtime.lastError.message));
        } else if (!dg1 || dg1.f6) {
          df1(new Error(dg1?.f6 || "dh1"));
        } else {
          de1(dg1.f4);
        }
      }
    );
  });
};