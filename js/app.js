/* ==========================================================
   APP.JS — Malla interactiva Notegood Medicina
   Incluye: bienvenida, frases aleatorias, progreso, confeti,
   notas por materia, importar/exportar, modo oscuro y más.
   ========================================================== */

/* ===== Frases motivacionales Notegood ===== */
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
  "{m} done. Tu mapa se ve cada vez más claro 🗺️",
  "El esfuerzo de hoy en {m} es el orgullo de mañana 🌟",
  "{m} superada, ahora nada te detiene 🚀",
  "La medicina te sonríe: {m} aprobada 🩺",
  "Cada ✔️ en {m} es un paso hacia el título 🎓",
  "¡Victoria académica! {m} ya está ✅"
];

/* ===== Datos ===== */
let materias = [];
let avance = {};
let notas = {}; // para calificaciones/apuntes

/* ===== Pantalla de bienvenida ===== */
function mostrarBienvenida() {
  const main = document.getElementById("main");
  main.innerHTML = `
    <div class="bienvenida">
      <h1>📚 Bienvenido a tu Malla Interactiva</h1>
      <p>Con esta herramienta podés:</p>
      <ul>
        <li>✅ Marcar materias aprobadas y seguir tu progreso.</li>
        <li>📝 Agregar notas o calificaciones por materia.</li>
        <li>💾 Guardar tu avance y retomarlo cuando quieras.</li>
        <li>📤 Exportar tu progreso y 📥 importarlo si cambiás de dispositivo.</li>
        <li>🌙 Activar modo oscuro para estudiar cómodo.</li>
      </ul>
      <button class="btn-inicio" onclick="iniciarMalla()">Entrar a la malla</button>
    </div>
  `;
}

/* ===== Inicialización malla ===== */
function iniciarMalla() {
  document.getElementById("main").innerHTML = generarHTMLMalla();
  cargarDatos();
  renderizarMaterias();
  actualizarProgreso();
}

/* ===== HTML malla principal ===== */
function generarHTMLMalla() {
  return `
    <header>
      <h1 id="logo" onclick="mostrarBienvenida()" style="cursor:pointer">notegood.uy</h1>
      <div class="acciones">
        <button onclick="toggleModo()">🌙</button>
        <button onclick="borrarAvance()">🗑️</button>
        <button onclick="exportarDatos()">📤</button>
        <input type="file" id="importar" style="display:none" onchange="importarDatos(event)">
        <button onclick="document.getElementById('importar').click()">📥</button>
      </div>
    </header>
    <div id="barra-progreso">
      <div id="progreso"></div>
    </div>
    <div id="malla"></div>
    <footer>
      <p>Hecho con 💙 por <a href="https://www.instagram.com/notegood.uy/" target="_blank">@notegood.uy</a></p>
    </footer>
  `;
}

/* ===== Renderizar materias ===== */
function renderizarMaterias() {
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";
  materias.forEach(m => {
    const bloque = document.createElement("div");
    bloque.className = "materia " + (avance[m.id] ? "aprobada" : "");
    bloque.innerHTML = `
      <h3>${m.nombre}</h3>
      <button onclick="toggleMateria('${m.id}')">✔️</button>
      <button onclick="editarNota('${m.id}')">📝</button>
    `;
    contenedor.appendChild(bloque);
  });
}

/* ===== Aprobar/desaprobar materia ===== */
function toggleMateria(id) {
  avance[id] = !avance[id];
  guardarDatos();
  renderizarMaterias();
  actualizarProgreso();
  if (avance[id]) lanzarConfeti(id);
}

/* ===== Editar nota/calificación ===== */
function editarNota(id) {
  const texto = prompt("Escribí tus apuntes o calificación para esta materia:", notas[id] || "");
  if (texto !== null) {
    notas[id] = texto;
    guardarDatos();
  }
}

/* ===== Progreso ===== */
function actualizarProgreso() {
  const total = materias.length;
  const completadas = Object.values(avance).filter(v => v).length;
  const porcentaje = Math.round((completadas / total) * 100);
  document.getElementById("progreso").style.width = porcentaje + "%";
  document.getElementById("progreso").innerText = `${completadas}/${total} (${porcentaje}%)`;
}

/* ===== Confeti ===== */
function lanzarConfeti(idMateria) {
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)].replace("{m}", materias.find(m => m.id === idMateria).nombre);
  alert(frase);
  // Aquí podés agregar una librería de confeti si la tenías antes
}

/* ===== Guardar y cargar ===== */
function guardarDatos() {
  localStorage.setItem("avance", JSON.stringify(avance));
  localStorage.setItem("notas", JSON.stringify(notas));
}

function cargarDatos() {
  avance = JSON.parse(localStorage.getItem("avance")) || {};
  notas = JSON.parse(localStorage.getItem("notas")) || {};
}

/* ===== Borrar avance ===== */
function borrarAvance() {
  if (confirm("¿Seguro que querés borrar todo tu progreso y notas?")) {
    avance = {};
    notas = {};
    guardarDatos();
    renderizarMaterias();
    actualizarProgreso();
  }
}

/* ===== Exportar / Importar ===== */
function exportarDatos() {
  const datos = { avance, notas };
  const blob = new Blob([JSON.stringify(datos)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mi_progreso.json";
  a.click();
}

function importarDatos(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const datos = JSON.parse(e.target.result);
      avance = datos.avance || {};
      notas = datos.notas || {};
      guardarDatos();
      renderizarMaterias();
      actualizarProgreso();
    } catch {
      alert("Archivo inválido");
    }
  };
  reader.readAsText(file);
}

/* ===== Modo oscuro ===== */
function toggleModo() {
  document.body.classList.toggle("oscuro");
  localStorage.setItem("modoOscuro", document.body.classList.contains("oscuro"));
}

function cargarModo() {
  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("oscuro");
  }
}

/* ===== Inicio ===== */
document.addEventListener("DOMContentLoaded", () => {
  cargarModo();
  mostrarBienvenida();
  // Aquí deberías cargar tu lista de materias desde JSON o array fijo
  materias = [
    { id: "mat1", nombre: "Salud Pública" },
    { id: "mat2", nombre: "Anatomía" },
    { id: "mat3", nombre: "Histología" }
    // ...
  ];
});
