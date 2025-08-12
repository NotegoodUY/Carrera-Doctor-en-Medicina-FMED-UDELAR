console.log('Notegood Malla v14 cargado');

/* ===== Frases Notegood ===== */
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

/* ===== Copy del progreso ===== */
function progressCopy(pct){
  if (pct === 100) return "¡Plan completo! Orgullo total ✨";
  if (pct >= 90)  return "Últimos detalles y a festejar 🎉";
  if (pct >= 75)  return "Último sprint, ya casi 💨";
  if (pct >= 50)  return "Mitad de camino, paso firme 💪";
  if (pct >= 25)  return "Buen envión, seguí así 🚀";
  if (pct > 0)    return "Primeros checks, ¡bien ahí! ✅";
  return "Arranquemos tranqui, paso a paso 👟";
}
function yearLabel(i){ return ["1er año","2do año","3er año","4to año","5to año","6to año","7mo año"][i] || `Año ${i+1}`; }

/* ===== Plan oficial (con corrección MANAT → requiere MSPHB) ===== */
const PLAN = [
  { semestres: [
    { numero: "1º semestre", materias: [
      { id:"MIBCM", nombre:"Introducción a la Biología Celular y Molecular" },
      { id:"MIBES", nombre:"Introducción a la Bioestadística" },
      { id:"MSPHB", nombre:"Salud y Humanidades y Bioética" },
      { id:"MAT1",  nombre:"Aprendizaje en Territorio 1" }
    ]},
    { numero: "2º semestre", materias: [
      { id:"MBCM", nombre:"Biología Celular y Molecular", previas:["MIBCM"] },
      { id:"MAT2", nombre:"Aprendizaje en Territorio 2", previas:["MAT1"] }
    ]}
  ]},
  { semestres: [
    { numero: "3º semestre", materias: [
      /* 🔒 Corrección: Anatomía requiere MSPHB */
      { id:"MANAT", nombre:"Anatomía (CBCC2)", previas:["MSPHB"] },
      { id:"MHBIO", nombre:"Histología y Biofísica (CBCC2)", previas:["MBCM"] }
    ]},
    { numero: "4º semestre", materias: [
      { id:"HIST",  nombre:"Histología (Neuro y Cardio)", previas:["MBCM"] },
      { id:"BCC3N", nombre:"Neurociencias",                previas:["MBCM"] },
      { id:"BCC4C", nombre:"Cardiovascular y Respiratorio", previas:["MBCM"] }
    ]}
  ]},
  { semestres: [
    { numero: "5º semestre", materias: [
      { id:"BCC5",  nombre:"Digestivo Renal Endocrino Metab y Repr (CBCC5)", previas:["MBCM","MANAT"] }
    ]},
    { numero: "6º semestre", materias: [
      { id:"BCC6",  nombre:"Hematología e Inmunobiología (CBCC6)", previas:["MBCM"] },
      { id:"MC1",   nombre:"Metodología Científica 1", req:{ allOf:["MIBES"], oneOf:[["HIST","BCC3N","BCC4C"]] } }
    ]}
  ]},
  { semestres: [
    { numero: "7º semestre", materias: [
      { id:"M4PNA", nombre:"Medicina en el Primer Nivel de Atención", req:{ allOf:["__TRIENIO1__"] } },
      { id:"M4BCP", nombre:"Bases Científicas de la Patología",       req:{ allOf:["__TRIENIO1__"] } }
    ]},
    { numero: "8º semestre", materias: [
      { id:"M4PED", nombre:"Pediatría (4º – anual)",        req:{ allOf:["__TRIENIO1__"] } },
      { id:"M4GYN", nombre:"Ginecología y Neonatología",    req:{ allOf:["__TRIENIO1__"] } }
    ]}
  ]},
  { semestres: [
    { numero: "9º y 10º semestre", materias: [
      { id:"MCM",  nombre:"Clínica Médica (5º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"] } },
      { id:"MPMT", nombre:"Patología Médica y Terapéutica", req:{ allOf:["__TRIENIO1__","M4BCP"] } }
    ]}
  ]},
  { semestres: [
    { numero: "11º y 12º semestre", materias: [
      { id:"M6CQ",  nombre:"Clínica Quirúrgica (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"] } },
      { id:"M6PQ",  nombre:"Patología Quirúrgica (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP"] } },
      { id:"M6MFC", nombre:"MFC – Salud Mental en Comunidad – Psicología Médica", req:{ allOf:["__TRIENIO1__","M4PNA"] } },
      { id:"MC2",   nombre:"Metodología Científica 2 (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"], oneOf:[["M4PED","M4GYN","MCM","M6CQ","M6MFC"]] } }
    ]}
  ]},
  { semestres: [
    { numero: "13º y 14º semestre", materias: [
      { id:"INTO", nombre:"Internado Obligatorio", req:{ allOf:["__TODO_ANTES__"] } }
    ]}
  ]}
];

/* ===== Estado y helpers ===== */
const KEY='malla-medicina-notegood';
const THEME_KEY='ng-theme';
const estado = loadEstado();

function loadEstado(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}} }
function saveEstado(){ localStorage.setItem(KEY, JSON.stringify(estado)); }
function idsTrienio1(){ const out=[]; PLAN.slice(0,3).forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out; }
function idsTodoAntes(){ const out=[]; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out.filter(id=>id!=='INTO'); }
const TRIENIO1=idsTrienio1(), TODO_ANTES=idsTodoAntes();

const NOMBRE_MATERIA = (()=>{ const map={}; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>map[m.id]=m.nombre))); return map; })();
const isAprobada = id => !!estado[id];

function normalizarReq(m){
  const req={ allOf:[], oneOf:[] };
  if (Array.isArray(m.previas)) req.allOf.push(...m.previas);
  if (m.req && Array.isArray(m.req.allOf)) req.allOf.push(...m.req.allOf);
  if (m.req && Array.isArray(m.req.oneOf)) req.oneOf.push(.
