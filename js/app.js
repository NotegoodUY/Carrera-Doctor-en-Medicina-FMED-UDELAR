// Carga de materias desde curriculum.json (estructura por años/semestres/materias)
fetch('data/curriculum.json')
  .then(res => res.json())
  .then(data => initMalla(data));

const estadoMaterias = JSON.parse(localStorage.getItem("estadoMaterias") || "{}");

// Frases motivacionales / chistes estilo NoteGood
const FRASES = [
  "¡{m} aprobada! Tu sinapsis está on fire 🔥",
  "Nice! {m} ✅ — tu yo del futuro te agradece.",
  "Otra menos: {m}. Café + constancia = magia ☕✨",
  "Check en {m}. ¡Seguimos, crack!",
  "¿Quién dijo miedo? {m} superada 💪",
  "Tu curva de aprendizaje acaba de subir con {m} 📈",
  "Leyenda urbana: {m} era difícil. Leyenda confirmada: la aprobaste 😎",
  "{m} done. Próxima parada: descanso merecido 🧘‍♀️",
  "¡Boom! {m} fuera de la lista 💥",
  "{m} ✔️ — tus neuronas te mandan un saludo 🧠"
];

// Render inicial
function initMalla(materias) {
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";

  // Contenedor de toasts (dinámico, sin tocar HTML)
  ensureToastContainer();

  materias.forEach((anio, idx) => {
    const divAnio = document.createElement("div");
    divAnio.className = "year";
    // Clase de color por año (y1..y7)
    divAnio.classList.add(`y${Math.min(idx+1, 7)}`);

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

        // Bloquear si no cumple previas
        if (materia.previas && materia.previas.some(p => !estadoMaterias[p])) {
          divMat.classList.add("bloqueada");
        }

        divMat.addEventListener("click", () => {
          if (divMat.classList.contains("bloqueada")) return;

          const wasDone = divMat.classList.contains("tachada");
          divMat.classList.toggle("tachada");
          estadoMaterias[materia.id] = divMat.classList.contains("tachada");
          localStorage.setItem("estadoMaterias", JSON.stringify(estadoMaterias));

          // Si se marcó como aprobada recién ahora, mostramos toast
          if (!wasDone && estadoMaterias[materia.id]) {
            const frase = FRASES[Math.floor(Math.random() * FRASES.length)].replace("{m}", materia.nombre);
            showToast(frase);
          }

          // Re-render para actualizar bloqueos por dependencias
          initMalla(materias);
        });

        divSem.appendChild(divMat);
      });

      divAnio.appendChild(divSem);
    });

    contenedor.appendChild(divAnio);
  });
}

/* ============ TOASTS ============ */
function ensureToastContainer() {
  if (!document.querySelector('.toast-container')) {
    const tc = document.createElement('div');
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }
}

function showToast(texto, ms = 2600) {
  const tc = document.querySelector('.toast-container');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="tag">OK</span> ${texto}`;
  tc.appendChild(t);

  // Autocierre
  setTimeout(() => {
    t.style.transition = 'opacity .2s ease';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 220);
  }, ms);
}
