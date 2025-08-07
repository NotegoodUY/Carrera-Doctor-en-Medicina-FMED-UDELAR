document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const savedData = JSON.parse(localStorage.getItem('materiasAprobadas')) || [];

  // Crear la grilla
  materias.forEach(materia => {
    const div = document.createElement('div');
    div.classList.add('materia');
    div.textContent = materia;

    if (savedData.includes(materia)) {
      div.classList.add('aprobada');
    }

    div.addEventListener('click', () => {
      div.classList.toggle('aprobada');

      let nuevasAprobadas = document.querySelectorAll('.materia.aprobada');
      let nombres = Array.from(nuevasAprobadas).map(m => m.textContent);
      localStorage.setItem('materiasAprobadas', JSON.stringify(nombres));
    });

    grid.appendChild(div);
  });

  // Botón de borrar
  const resetBtn = document.getElementById('reset');
  resetBtn.addEventListener('click', () => {
    localStorage.removeItem('materiasAprobadas');
    document.querySelectorAll('.materia').forEach(m => m.classList.remove('aprobada'));
  });
});
