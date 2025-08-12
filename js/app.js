// Carga de materias (estructura: años → semestres → materias)
fetch('data/curriculum.json')
  .then(res => res.json())
  .then(data => initMalla(data))
  .catch(err => {
    console.error('Error cargando curriculum.json', err);
    alert('No se pudo cargar la malla. Revisá data/curriculum.json');
  });

const estadoMaterias = JSON.parse(localStorage.getItem("estadoMaterias") || "{}");

// Frases NoteGood — tono cercano, motivador, inclusivo
const FRASES = [
  "¡Bien ahí! {m} aprobada. Tu yo del futuro te aplaude 👏",
  "{m} ✅ — organización + constancia = resultados.",
  "¡Seguimos! {m} fuera de la lista 💪",
  "Check en {m}. Paso a paso se llega lejos 🚶‍♀️🚶",
  "Tu curva de aprendizaje sube con {m} 📈",
  "Leyenda: {m} era difícil. Realidad: la superaste 😎",
  "¡Qué nivel! {m} completada con estilo ✨",
  "Respirá hondo: {m} ya es historia 🧘",
  "Lo lograste: {m} ✔️ — ¡a hidratarse y seguir! 💧",
  "{m} done. Tu mapa se ve cada vez más claro 🗺️"
];

// Copys dinámicos para el progreso (tono NoteGood)
function progressCopy(pct) {
  if (pct === 100) return "¡Plan completo! Orgullo total ✨";
  if (pct >= 90)  return "Últimos detalles y a festejar 🎉";
  if (pct >= 75)  return "Último sprint, ya casi 💨";
  if (pct >= 50)  return "Mitad de camino, paso firme 💪";
  if (pct >= 25)  return "Buen envión, seguí así 🚀";
  if (pct > 0)    return "Primeros checks, ¡bien ahí! ✅";
  return "Arranquemos tranqui, paso a paso 👟";
}

function initMalla(materias) {
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";
  ensureToastContainer();

  let total = 0;
  let aprobadas = 0;

  materias.forEach((anio, idx) => {
    const divAnio = document.createElement("div");
    divAnio.className = "year";
    divAnio.classList.add(`y${Math.min(idx + 1, 7)}`);

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
        total += 1;

        const divMat = document.createElement("div");
        divMat.textContent = materia.nombre;
        divMat.className = "materia";
        divMat.dataset.id = materia.id;
        divMat.setAttribute('role', 'button');
        divMat.setAttribute('aria-pressed', !!estadoMaterias[materia.id]);

        // Aprobada
        if (estadoMaterias[materia.id]) {
          divMat.classList.add("tachada");
          aprobadas += 1;
        }

        // Bloqueada si falta alguna previa aprobada
        const previas = Array.isArray(materia.previas) ? materia.previas : [];
        if (previas.some(p => !estadoMaterias[p])) {
          divMat.classList.add("bloqueada");
          divMat.setAttribute('aria-disabled', 'true');
        }

        // Toggle aprobar/desaprobar
        divMat.addEventListener("click", () => {
          if (divMat.classList.contains("bloqueada")) return;

          const wasDone = divMat.classList.contains("tachada");
          divMat.classList.toggle("tachada");
          const nowDone = divMat.classList.contains("tachada");

          estadoMaterias[materia.id] = nowDone;
          localStorage.setItem("estadoMaterias", JSON.stringify(estadoMaterias));

          // Mensaje NoteGood solo cuando se aprueba
          if (!wasDone && nowDone) {
            const frase = FRASES[Math.floor(Math.random() * FRASES.length)].replace("{m}", materia.nombre);
            showToast(frase); // dura 6.5s, se pausa con hover, click para cerrar
          }

          // Re-render para actualizar bloqueos y progreso
          initMalla(materias);
        });

        divSem.appendChild(divMat);
      });

      divAnio.appendChild(divSem);
    });

    contenedor.appendChild(divAnio);
  });

  // Progreso amigable en el footer (dinámico según %)
  const progressText = document.getElementById('progressText');
  if (progressText) {
    const pct = total ? Math.round((aprobadas / total) * 100) : 0;
    const copy = progressCopy(pct);
    progressText.textContent = `${aprobadas} / ${total} materias aprobadas · ${pct}% — ${copy}`;
  }
}

/* ======= TOASTS ======= */
function ensureToastContainer() {
  if (!document.querySelector('.toast-container')) {
    const tc = document.createElement('div');
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }
}

/**
 * Muestra un toast legible:
 * - Dura 6.5s por defecto
 * - Pausa al hover
 * - Click para cerrar
 * - Máx. 3 simultáneos (borra el más viejo)
 */
function showToast(texto, ms = 6500) {
  const tc = document.querySelector('.toast-container');

  // Limita a 3 toasts visibles
  while (tc.children.length >= 3) {
    tc.firstElementChild.remove();
  }

  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.setAttribute('aria-live', 'polite');
  t.innerHTML = `<span class="tag">OK</span> ${texto}`;
  tc.appendChild(t);

  // micro delay para animación "show"
  requestAnimationFrame(() => t.classList.add('show'));

  let timer = startTimer(ms, () => closeToast(t));

  // Pausar al hover (y reanudar al salir)
  t.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    timer = null;
  });
  t.addEventListener('mouseleave', () => {
    if (!timer) timer = startTimer(1800, () => closeToast(t));
  });

  // Click para cerrar al instante
  t.addEventListener('click', () => closeToast(t));
}

function startTimer(ms, cb) {
  return setTimeout(cb, ms);
}

function closeToast(t) {
  if (!t || t.classList.contains('hide')) return;
  t.classList.remove('show');
  t.classList.add('hide');
  setTimeout(() => t.remove(), 220);
}
