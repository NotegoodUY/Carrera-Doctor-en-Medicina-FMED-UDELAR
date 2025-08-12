console.log('Notegood Malla v7 cargado');

/* ============================
   Frases Notegood (toasts)
============================ */
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

/* ============================
   Copys del progreso
============================ */
function progressCopy(pct) {
  if (pct === 100) return "¡Plan completo! Orgullo total ✨";
  if (pct >= 90)  return "Últimos detalles y a festejar 🎉";
  if (pct >= 75)  return "Último sprint, ya casi 💨";
  if (pct >= 50)  return "Mitad de camino, paso firme 💪";
  if (pct >= 25)  return "Buen envión, seguí así 🚀";
  if (pct > 0)    return "Primeros checks, ¡bien ahí! ✅";
  return "Arranquemos tranqui, paso a paso 👟";
}

/* ============================
   Datos oficiales (PDF)
   Estructura por años → semestres → materias
   Cada materia puede tener:
   - previas: array simple (equivale a req.allOf)
   - req: { allOf: [], oneOf: [['A','B',...]] }
============================ */
const PLAN = [
  { anio: "1º", semestres: [
    { numero: "1º semestre", materias: [
      { id:"MIBCM", nombre:"Introducción a la Biología Celular y Molecular" },
      { id:"MIBES", nombre:"Introducción a la Bioestadística" },
      { id:"MSPHB", nombre:"Salud y Humanidades y Bioética" },
      { id:"MAT1",  nombre:"Aprendizaje en Territorio 1" }
    ]},
    { numero: "2º semestre", materias: [
      { id:"MBCM", nombre:"Biología Celular y Molecular", previas:["MIBCM"] },
      { id:"MAT2", nombre:"Aprendizaje en Territorio 2", previas:["MAT1"] }
