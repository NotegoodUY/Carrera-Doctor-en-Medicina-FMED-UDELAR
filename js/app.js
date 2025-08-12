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
    ]}
  ]},
  { anio: "2º", semestres: [
    { numero: "3º semestre", materias: [
      { id:"MANAT", nombre:"Anatomía (CBCC2)" }, /* sin previa explícita en PDF */
      { id:"MHBIO", nombre:"Histología y Biofísica (CBCC2)", previas:["MBCM"] }
    ]},
    { numero: "4º semestre", materias: [
      { id:"HIST",  nombre:"Histología (Neuro y Cardio)", previas:["MBCM"] },
      { id:"BCC3N", nombre:"Neurociencias",                previas:["MBCM"] },
      { id:"BCC4C", nombre:"Cardiovascular y Respiratorio", previas:["MBCM"] }
    ]}
  ]},
  { anio: "3º", semestres: [
    { numero: "5º semestre", materias: [
      { id:"BCC5",  nombre:"Digestivo Renal Endocrino Metab y Repr (CBCC5)", previas:["MBCM","MANAT"] }
    ]},
    { numero: "6º semestre", materias: [
      { id:"BCC6",  nombre:"Hematología e Inmunobiología (CBCC6)", previas:["MBCM"] },
      /* MC1: Bioestadística + al menos 1 UC del BCC (tomamos HIST/BCC3N/BCC4C) */
      { id:"MC1",   nombre:"Metodología Científica 1", req:{ allOf:["MIBES"], oneOf:[["HIST","BCC3N","BCC4C"]] } }
    ]}
  ]},
  { anio: "4º", semestres: [
    { numero: "7º semestre", materias: [
      /* Todo el primer trienio (1º–3º) aprobado */
      { id:"M4PNA", nombre:"Medicina en el Primer Nivel de Atención", req:{ allOf:["__TRIENIO1__"] } },
      { id:"M4BCP", nombre:"Bases Científicas de la Patología",       req:{ allOf:["__TRIENIO1__"] } }
    ]},
    { numero: "8º semestre", materias: [
      { id:"M4PED", nombre:"Pediatría (4º – anual)",        req:{ allOf:["__TRIENIO1__"] } },
      { id:"M4GYN", nombre:"Ginecología y Neonatología",    req:{ allOf:["__TRIENIO1__"] } }
    ]}
  ]},
  { anio: "5º", semestres: [
    { numero: "9º y 10º semestre", materias: [
      { id:"MCM",  nombre:"Clínica Médica (5º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"] } },
      { id:"MPMT", nombre:"Patología Médica y Terapéutica", req:{ allOf:["__TRIENIO1__","M4BCP"] } }
    ]}
  ]},
  { anio: "6º", semestres: [
    { numero: "11º y 12º semestre", materias: [
      { id:"M6CQ",  nombre:"Clínica Quirúrgica (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"] } },
      { id:"M6PQ",  nombre:"Patología Quirúrgica (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP"] } },
      { id:"M6MFC", nombre:"MFC – Salud Mental en Comunidad – Psicología Médica", req:{ allOf:["__TRIENIO1__","M4PNA"] } },
      /* MC2: Trienio1 + M4BCP + M4PNA + al menos 1 UC de [M4PED, M4GYN, MCM, M6CQ, M6MFC] */
      { id:"MC2",   nombre:"Metodología Científica 2 (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"], oneOf:[["M4PED","M4GYN","MCM","M6CQ","M6MFC"]] } }
    ]}
  ]},
  { anio: "7º", semestres: [
    { numero: "13º y 14º semestre", materias: [
      { id:"INTO", nombre:"Internado Obligatorio", req:{ allOf:["__TODO_ANTES__"] } }
    ]}
  ]}
];

/* ============================
   Estado (localStorage)
============================ */
const KEY = 'malla-medicina-notegood';
const estado = loadEstado();

function loadEstado(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function saveEstado(){ localStorage.setItem(KEY, JSON.stringify(estado)); }

/* ============================
   Helpers de requisitos
============================ */
function idsTrienio1(){
  const ids = [];
  PLAN.slice(0,3).forEach(a => a.semestres.forEach(s => s.materias.forEach(m => ids.push(m.id))));
  return ids;
}
function idsTodoAntes(){
  const ids = [];
  PLAN.forEach(a => a.semestres.forEach(s => s.materias.forEach(m => ids.push(m.id))));
  return ids.filter(id => id !== 'INTO');
}

const TRIENIO1 = idsTrienio1();
const TODO_ANTES = idsTodoAntes();

function normalizarReq(m){
  // Compat previas simples → allOf
  const req = { allOf:[], oneOf:[] };
  if (Array.isArray(m.previas)) req.allOf.push(...m.previas);
  if (m.req && Array.isArray(m.req.allOf)) req.allOf.push(...m.req.allOf);
  if (m.req && Array.isArray(m.req.oneOf)) req.oneOf.push(...m.req.oneOf);

  // Expansiones especiales
  req.allOf = req.allOf.flatMap(id => {
    if (id === '__TRIENIO1__') return TRIENIO1;
    if (id === '__TODO_ANTES__') return TODO_ANTES;
    return [id];
  });
  return req;
}

function isAprobada(id){ return !!estado[id]; }

function requisitosCumplidos(req){
  // allOf: requiere TODOS aprobados
  const allOk = (req.allOf||[]).every(id => isAprobada(id));
  // oneOf: si hay grupos, al menos UN grupo debe tener ≥1 aprobado
  const groups = req.oneOf || [];
  const oneOk = groups.length === 0 || groups.some(group => group.some(id => isAprobada(id)));
  return allOk && oneOk;
}

function faltantesTexto(req){
  const faltAll = (req.allOf||[]).filter(id => !isAprobada(id));
  const grupos = (req.oneOf||[]).map(grp => grp.filter(id => isAprobada(id)).length>0 ? null : grp).filter(Boolean);
  const toName = id => NOMBRE_MATERIA[id] || id;
  let tip = [];
  if (faltAll.length) tip.push("Te falta aprobar:\n• " + faltAll.map(toName).join("\n• "));
  if (grupos.length)  tip.push("Y al menos 1 de:\n• " + grupos[0].map(toName).join("\n• "));
  return tip.join("\n\n");
}

/* Mapa id→nombre para tooltips */
const NOMBRE_MATERIA = (() => {
  const map = {};
  PLAN.forEach(a => a.semestres.forEach(s => s.materias.forEach(m => map[m.id] = m.nombre)));
  return map;
})();

/* ============================
   Render
============================ */
function initMalla(plan){
  const cont = document.getElementById("malla");
  cont.innerHTML = "";
  ensureToastContainer();

  let total = 0, aprobadas = 0;

  plan.forEach((anio, idx) => {
    const col = document.createElement("div");
    col.className = "year y"+Math.min(idx+1,7);

    const h2 = document.createElement("h2");
    h2.textContent = (anio.anio || ('Año '+(idx+1)));
    col.appendChild(h2);

    anio.semestres.forEach(sem => {
      const box = document.createElement("div");
      box.className = "semestre";

      const h3 = document.createElement("h3");
      h3.textContent = sem.numero;
      box.appendChild(h3);

      sem.materias.forEach(m => {
        total += 1;
        const div = document.createElement("div");
        div.className = "materia";
        div.dataset.id = m.id;
        div.textContent = `${m.nombre} (${m.id})`;

        const req = normalizarReq(m);

        // Estado
        const done = isAprobada(m.id);
        if (done) aprobadas += 1;

        // Bloqueo por previas
        const bloqueada = !requisitosCumplidos(req);
        if (bloqueada) {
          div.classList.add("bloqueada");
          const tip = faltantesTexto(req);
          if (tip) div.setAttribute('data-tip', tip);
        }

        if (done) div.classList.add("tachada");

        // Toggle aprobar
        div.addEventListener("click", () => {
          if (div.classList.contains("bloqueada")) return;
          const was = isAprobada(m.id);
          estado[m.id] = !was;
          saveEstado();

          if (!was && estado[m.id]) {
            const frase = FRASES[Math.floor(Math.random()*FRASES.length)].replace("{m}", m.nombre);
            showToast(frase);
          }
          initMalla(plan); // re-render para actualizar bloqueos y progreso
        });

        box.appendChild(div);
      });

      col.appendChild(box);
    });

    cont.appendChild(col);
  });

  // Progreso
  const pct = total ? Math.round((aprobadas/total)*100) : 0;
  const copy = progressCopy(pct);
  const $p = document.getElementById('progressText');
  if ($p) $p.textContent = `${aprobadas} / ${total} materias aprobadas · ${pct}% — ${copy}`;
}

/* ============================
   Toasts
============================ */
function ensureToastContainer(){
  if (!document.querySelector('.toast-container')){
    const tc = document.createElement('div');
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }
}
function showToast(texto, ms=6500){
  const tc = document.querySelector('.toast-container');
  while (tc.children.length >= 3) tc.firstElementChild.remove();

  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
  t.innerHTML = `<span class="tag">OK</span> ${texto}`;
  tc.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));

  let timer = setTimeout(() => closeToast(t), ms);
  t.addEventListener('mouseenter', ()=>{ clearTimeout(timer); timer=null; });
  t.addEventListener('mouseleave', ()=>{ if(!timer) timer=setTimeout(()=>closeToast(t), 1800); });
  t.addEventListener('click', ()=> closeToast(t));
}
function closeToast(t){
  if (!t || t.classList.contains('hide')) return;
  t.classList.remove('show'); t.classList.add('hide');
  setTimeout(()=> t.remove(), 220);
}

/* ============================
   Start
============================ */
initMalla(PLAN);
