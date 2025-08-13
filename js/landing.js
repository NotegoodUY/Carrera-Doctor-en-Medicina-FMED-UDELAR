/* Landing Notegood v24 – robusto para esquema index (landing) → malla.html (app) */
document.addEventListener('DOMContentLoaded', () => {
  const KEY = 'ng-skip-intro';
  const enterLink = document.getElementById('enterLink');
  const skip = document.getElementById('skipIntroChk');

  // Si ya eligió "no volver a mostrar", saltamos directo a la malla
  try {
    if (localStorage.getItem(KEY) === '1') {
      window.location.href = 'malla.html';
      return;
    }
  } catch(e){ /* ignore */ }

  // Al hacer clic en "Entrar a mi malla", guardamos la preferencia si corresponde.
  if (enterLink) {
    enterLink.addEventListener('click', () => {
      try {
        if (skip && skip.checked) localStorage.setItem(KEY, '1');
      } catch(e){ /* ignore */ }
      // Dejamos que el <a href="malla.html"> navegue sin impedirlo
    });
  }
});
