// Carga de materias desde curriculum.json
fetch('data/curriculum.json')
  .then(res => res.json())
  .then(data => renderMalla(data));

const estadoMaterias = JSON.parse(localStorage.getItem("estadoMaterias") || "{}");

function renderMalla(materias) {
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

        if (materia.previas && materia.previas.some(p => !estadoMaterias[p])) {
          divMat.classList.add("bloqueada");
        }

        divMat.addEventListener("click", () => {
          if (divMat.classList.contains("bloqueada")) return;
          divMat.classList.toggle("tachada");
          estadoMaterias[materia.id] = divMat.classList.contains("tachada");
          localStorage.setItem("estadoMaterias", JSON.stringify(estadoMaterias));
          renderMalla(materias);
        });

        divSem.appendChild(divMat);
      });

      divAnio.appendChild(divSem);
    });

    contenedor.appendChild(divAnio);
  });
}
