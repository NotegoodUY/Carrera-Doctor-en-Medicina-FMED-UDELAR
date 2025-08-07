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

        if (estadoMaterias[materia.id]) {
          divMat.classList.add("tachada");
        }

        const tienePrevias = materia.previas && materia.previas.length > 0;
        const previasNoCumplidas = tienePrevias && materia.previas.some(p => !estadoMaterias[p]);

        if (previasNoCumplidas) {
          divMat.classList.add("bloqueada");
        }

        divMat.addEventListener("click", () => {
          if (divMat.classList.contains("bloqueada")) return;

          const estaAprobada = divMat.classList.toggle("tachada");
          estadoMaterias[materia.id] = estaAprobada;
          guardarEstado();
          mostrarFraseRandom(materia.nombre);
          crearMalla();
        });

        divSem.appendChild(divMat);
      });

      divAnio.appendChild(divSem);
    });

    contenedor.appendChild(divAnio);
  });
}

// Botón borrar avance
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("borrarBtn").addEventListener("click", () => {
    if (confirm("¿Estás segura de que querés borrar todo tu avance? 🧹")) {
      localStorage.removeItem("estadoMaterias");
      Object.keys(estadoMaterias).forEach(k => delete estadoMaterias[k]);
      crearMalla();
    }
  });

  crearMalla();
});

const estadoMaterias = JSON.parse(localStorage.getItem("estadoMaterias") || "{}");
