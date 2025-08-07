function guardarEstado() {
  localStorage.setItem("estadoMaterias", JSON.stringify(estadoMaterias));
}

function mostrarFraseRandom(nombreMateria) {
  const frases = [
    `💥 ¡Una menos! Tachaste ${nombreMateria}.`,
    `📚 ${nombreMateria} ya no te alcanza. Estás a otro nivel.`,
    `🎯 ${nombreMateria} fue y vino. Next 👉`,
    `💪 Con ${nombreMateria} ya podés ponerlo en el CV.`,
    `🚀 ¡Estás on fire! Chau ${nombreMateria}.`
  ];
  const elegida = frases[Math.floor(Math.random() * frases.length)];
  alert(elegida);
}

function crearMalla() {
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";

  materias.forEach(anio => {
    const divAnio = document.createElement("div");
    divAnio.className = "year";

    const h2 = document.createElement("h2");
    h2.textContent = anio.anio;
    divAnio.appendChild(h2);

    anio.semestres.forEach(sem => {
      const divSem = document.createElement("div");
      divSem.className = "semestre";

      const h3 = document.createElement("h3");
      h3.textContent = sem.numero;
      divSem.appendChild(h3);

      sem.materias.forEach(materia => {
        const divMat = document.createElement("div");
        divMat.textContent = materia.nombre;
        divMat.className = "materia";
        divMat.dataset.id = materia.id;

        // Verificar si tiene previas y si todas están cumplidas
        const tienePrevias = materia.previas && materia.previas.length > 0;
        const previasNoCumplidas = tienePrevias && materia.previas.some(p => !estadoMaterias[p]);

        if (previasNoCumplidas) {
          divMat.classList.add("bloqueada");
        }

        if (estadoMaterias[materia.id]) {
          divMat.classList.add("tachada");
        }

        divMat.addEventListener("click", () => {
          if (divMat.classList.contains("bloqueada")) return;

          const estaAprobada = divMat.classList.toggle("tachada");
          estadoMaterias[materia.id] = estaAprobada;
          guardarEstado();
          mostrarFraseRandom(materia.nombre);
          crearMalla(); // Volver a renderizar con estados actualizados
        });

        divSem.appendChild(divMat);
      });

      divAnio.appendChild(divSem);
    });

    contenedor.appendChild(divAnio);
  });
}

// Cargar estado guardado en el navegador
const estadoMaterias = JSON.parse(localStorage.getItem("estadoMaterias") || "{}");

// Inicializar la grilla
crearMalla();
