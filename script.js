async function cargarMalla() {
  const response = await fetch('materias.json');
  const materias = await response.json();
  const contenedor = document.getElementById('malla-container');

  materias.forEach(materia => {
    const div = document.createElement('div');
    div.classList.add('materia', 'bloqueada');
    div.textContent = materia.nombre;

    div.addEventListener('click', () => {
      if (div.classList.contains('aprobada')) {
        div.classList.remove('aprobada');
        div.classList.add('bloqueada');
        console.log(`🔙 Desmarcaste ${materia.nombre}. ¿Segura, segura?`);
      } else if (div.classList.contains('bloqueada')) {
        div.classList.remove('bloqueada');
        div.classList.add('aprobada');
        mostrarFraseRandom(materia.nombre);
      }
    });

    contenedor.appendChild(div);
  });
}

function mostrarFraseRandom(nombreMateria) {
  const frases = [
    `💪 ¡Tachaste ${nombreMateria}! Una menos, genia.`,
    `✨ ${nombreMateria} DOMINADA con estilo.`,
    `🎯 Check ✅ en ${nombreMateria}. ¡Seguimos fuerte!`,
    `🧠 ${nombreMateria} no pudo contigo. ¡Crack total!`,
    `😎 ¿Quién dijo que esto era difícil? Chau ${nombreMateria}.`
  ];

  const elegida = frases[Math.floor(Math.random() * frases.length)];
  alert(elegida);
}

cargarMalla();
