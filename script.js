function generarMalla() {
  const contenedor = document.getElementById("malla");

  materias.forEach((anioObj, i) => {
    const anioDiv = document.createElement("div");
    anioDiv.className = "anio";
    const anioTitulo = document.createElement("h2");
    anioTitulo.textContent = anioObj.anio;
    anioDiv.appendChild(anioTitulo);

    anioObj.semestres.forEach((semestreObj, j) => {
      const semestreDiv = document.createElement("div");
      semestreDiv.className = "semestre";
      const semestreTitulo = document.createElement("h3");
      semestreTitulo.textContent = semestreObj.numero;
      semestreDiv.appendChild(semestreTitulo);

      semestreObj.materias.forEach((materia) => {
        const boton = document.createElement("button");
        boton.textContent = materia.nombre;
        boton.className = "materia";

        if (localStorage.getItem(materia.id) === "aprobada") {
          boton.classList.add("aprobada");
        }

        boton.addEventListener("click", () => {
          boton.classList.toggle("aprobada");
          if (boton.classList.contains("aprobada")) {
            localStorage.setItem(materia.id, "aprobada");
          } else {
            localStorage.removeItem(materia.id);
          }
        });

        semestreDiv.appendChild(boton);
      });

      anioDiv.appendChild(semestreDiv);
    });

    contenedor.appendChild(anioDiv);
  });
}

function borrarTodo() {
  if (confirm("¿Estás seguro de que querés borrar tu avance?")) {
    localStorage.clear();
    location.reload();
  }
}

window.onload = generarMalla;
