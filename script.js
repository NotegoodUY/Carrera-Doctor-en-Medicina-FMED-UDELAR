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
        divMat.className = "materia";
        divMat.textContent = materia.nombre;

        divMat.addEventListener("click", () => {
          divMat.classList.toggle("tachada");
        });

        divSem.appendChild(divMat);
      });

      divAnio.appendChild(divSem);
    });

    contenedor.appendChild(divAnio);
  });
}

document.getElementById("borrar").addEventListener("click", () => {
  document.querySelectorAll(".materia").forEach(m => {
    m.classList.remove("tachada");
  });
});

crearMalla();
