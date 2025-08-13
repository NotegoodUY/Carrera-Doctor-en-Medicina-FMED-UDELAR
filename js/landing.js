/* Landing Notegood v23 */
(function(){
  const KEY = 'ng-skip-intro';
  const goApp = () => { window.location.href = 'index.html'; };

  // Si está marcada la preferencia, saltar intro
  try {
    if (localStorage.getItem(KEY) === '1') goApp();
  } catch(e){}

  document.getElementById('enterBtn')?.addEventListener('click', ()=>{
    try {
      if (document.getElementById('skipIntroChk')?.checked) localStorage.setItem(KEY, '1');
    } catch(e){}
    goApp();
  });
})();
