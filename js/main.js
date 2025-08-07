
const mensajes = [
  "¡Primer paso dado! Vas por buen camino ✨",
  "¡Seguís avanzando, crack! 💪",
  "Ya casi completás un año 🎯",
  "¡Felicitaciones! Vas dominando esta malla 😍",
  "¡Sos una bestia! Quinto año no es nada para vos 🎓"
];

function marcar(checkbox) {
  const div = checkbox.closest('.materia');
  div.classList.toggle('completed', checkbox.checked);

  const checks = document.querySelectorAll('.materia input');
  const completadas = Array.from(checks).filter(cb => cb.checked).length;

  const mensajeBox = document.getElementById('mensaje-motivacional');
  if (completadas > 0) {
    mensajeBox.innerText = mensajes[Math.min(completadas - 1, mensajes.length - 1)];
    mensajeBox.style.display = 'block';
  } else {
    mensajeBox.style.display = 'none';
  }
}
