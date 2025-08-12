/* Notegood Malla – script principal (v20) */

/* ====== Helpers de storage ====== */
const LS_KEYS = {
  estado: 'malla-medicina-notegood',     // { [id]: true }
  notas:  'malla-medicina-notes',        // { [id]: "texto" }
  grades: 'malla-medicina-grades',       // { [id]: number }
  theme:  'ng-theme'                     // 'light' | 'dark'
};
const load = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k) ?? JSON.stringify(fallback)); }
  catch { return fallback; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ====== Estado ====== */
const ESTADO = load(LS_KEYS.estado, {});
const NOTAS  = load(LS_KEYS.notas, {});
const GRADES = load(LS_KEYS.grades, {});

/* ====== Copy progreso ====== */
function progressCopy(pct){
  if (pct === 100) return "¡Plan completo! Orgullo total ✨";
  if (pct >= 90)  return "Últimos detalles y a festejar 🎉";
  if (pct >= 75)  return "Último sprint, ya casi 💨";
  if (pct >= 50)  return "Mitad de camino, paso firme 💪";
  if (pct >= 25)  return "Buen envión, seguí así 🚀";
  if (pct > 0)    return "Primeros checks, ¡bien ahí! ✅";
  return "Arranquemos tranqui, paso a paso 👟";
}

/* ====== Plan (según PDF, con ajustes) ====== */
const PLAN = [
  { semestres:[
    { numero:"1º semestre", materias:[
      { id:"MIBCM", nombre:"Introducción a la Biología Celular y Molecular" },
      { id:"MIBES", nombre:"Introducción a la Bioestadística" },
      { id:"MSPHB", nombre:"Salud y Humanidades y Bioética" },
      { id:"MAT1",  nombre:"Aprendizaje en Territorio 1" }
    ]},
    { numero:"2º semestre", materias:[
      { id:"MBCM", nombre:"Biología Celular y Molecular", previas:["MIBCM"] },
      { id:"MAT2", nombre:"Aprendizaje en Territorio 2", previas:["MAT1"] }
    ]}
  ]},
  { semestres:[
    { numero:"3º semestre", materias:[
      { id:"MANAT", nombre:"Anatomía (CBCC2)", previas:["MSPHB"] },          // corrección: depende de MSPHB
      { id:"MHBIO", nombre:"Histología y Biofísica (CBCC2)", previas:["MBCM"] }
    ]},
    { numero:"4º semestre", materias:[
      { id:"HIST",  nombre:"Histología (Neuro y Cardio)", previas:["MBCM"] },
      { id:"BCC3N", nombre:"Neurociencias",               previas:["MBCM"] },
      { id:"BCC4C", nombre:"Cardiovascular y Respiratorio", previas:["MBCM"] }
    ]}
  ]},
  { semestres:[
    { numero:"5º semestre", materias:[
      { id:"BCC5",  nombre:"Digestivo Renal Endocrino Metab y Repr (CBCC5)", previas:["MBCM","MANAT"] }
    ]},
    { numero:"6º semestre", materias:[
      { id:"BCC6",  nombre:"Hematología e Inmunobiología (CBCC6)", previas:["MBCM"] },
      // MC1: Bioestadística + al menos 1 de [HIST, BCC3N, BCC4C]
      { id:"MC1",   nombre:"Metodología Científica 1", req:{ allOf:["MIBES"], oneOf:[["HIST","BCC3N","BCC4C"]] } }
    ]}
  ]},
  { semestres:[
    { numero:"7º semestre", materias:[
      { id:"M4PNA", nombre:"Medicina en el Primer Nivel de Atención", req:{ allOf:["__TRIENIO1__"] } },
      { id:"M4BCP", nombre:"Bases Científicas de la Patología",       req:{ allOf:["__TRIENIO1__"] } }
    ]},
    { numero:"8º semestre", materias:[
      { id:"M4PED", nombre:"Pediatría (4º – anual)",     req:{ allOf:["__TRIENIO1__"] } },
      { id:"M4GYN", nombre:"Ginecología y Neonatología", req:{ allOf:["__TRIENIO1__"] } }
    ]}
  ]},
  { semestres:[
    { numero:"9º y 10º semestre", materias:[
      { id:"MCM",  nombre:"Clínica Médica (5º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"] } },
      { id:"MPMT", nombre:"Patología Médica y Terapéutica", req:{ allOf:["__TRIENIO1__","M4BCP"] } }
    ]}
  ]},
  { semestres:[
    { numero:"11º y 12º semestre", materias:[
      { id:"M6CQ",  nombre:"Clínica Quirúrgica (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"] } },
      { id:"M6PQ",  nombre:"Patología Quirúrgica (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP"] } },
      { id:"M6MFC", nombre:"MFC – Salud Mental en Comunidad – Psicología Médica", req:{ allOf:["__TRIENIO1__","M4PNA"] } },
      // MC2: Trienio1 + M4BCP + M4PNA + al menos 1 de [M4PED, M4GYN, MCM, M6CQ, M6MFC]
      { id:"MC2",   nombre:"Metodología Científica 2 (6º – anual)", req:{ allOf:["__TRIENIO1__","M4BCP","M4PNA"], oneOf:[["M4PED","M4GYN","MCM","M6CQ","M6MFC"]] } }
    ]}
  ]},
  { semestres:[
    { numero:"13º y 14º semestre", materias:[
      { id:"INTO", nombre:"Internado Obligatorio", req:{ allOf:["__TODO_ANTES__"] } }
    ]}
  ]}
];

/* ====== Utilidades de requisitos ====== */
const NAME = (()=>{ const m={}; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(x=>m[x.id]=x.nombre))); return m; })();
const isOk = id => !!ESTADO[id];

const idsTrienio1 = () => {
  const out = [];
  PLAN.slice(0,3).forEach(a => a.semestres.forEach(s => s.materias.forEach(m => out.push(m.id))));
  return out;
};
const idsTodoAntes = () => {
  const out = [];
  PLAN.forEach(a => a.semestres.forEach(s => s.materias.forEach(m => out.push(m.id))));
  return out.filter(id => id !== 'INTO');
};
const TRIENIO1 = idsTrienio1();
const TODO_ANTES = idsTodoAntes();

function normReq(m){
  const req = { allOf:[], oneOf:[] };
  if (Array.isArray(m.previas)) req.allOf.push(...m.previas);
  if (m.req?.allOf) req.allOf.push(...m.req.allOf);
  if (m.req?.oneOf) req.oneOf.push(...m.req.oneOf);
  req.allOf = req.allOf.flatMap(id => id==='__TRIENIO1__' ? TRIENIO1 : id==='__TODO_ANTES__' ? TODO_ANTES : [id]);
  return req;
}
const cumple = (req) =>
  (req.allOf||[]).every(id => isOk(id)) &&
  ((req.oneOf||[]).length===0 || (req.oneOf||[]).some(group => group.some(id => isOk(id))));

function faltantes(req){
  const faltAll=(req.allOf||[]).filter(id=>!isOk(id));
  const grupos=(req.oneOf||[]).map(g=>g.some(id=>isOk(id))?null:g).filter(Boolean);
  const n = id => NAME[id] || id;
  const parts=[];
  if (faltAll.length) parts.push("Te falta aprobar:\n• "+faltAll.map(n).join("\n• "));
  if (grupos.length)  parts.push("Y al menos 1 de:\n• "+grupos[0].map(n).join("\n• "));
  return parts.join("\n\n");
}

/* ====== Tema ====== */
function applyTheme(theme){
  document.body.classList.toggle('dark', theme==='dark');
  const cb = document.getElementById('themeSwitch');
  if (cb) cb.checked = (theme==='dark');
}
function currentTheme(){
  const saved = localStorage.getItem(LS_KEYS.theme);
  if (saved) return saved;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}
function toggleTheme(){
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem(LS_KEYS.theme, next);
  applyTheme(next);
}

/* ====== Render ====== */
function yearLabel(i){ return ["1er año","2do año","3er año","4to año","5to año","6to año","7mo año"][i] || `Año ${i+1}`; }

function render(){
  const cont = document.getElementById('mallaContainer');
  cont.innerHTML = '';

  let total=0, aprob=0;

  PLAN.forEach((anio, idx)=>{
    const col = document.createElement('div');
    col.className = 'year';
    const h2 = document.createElement('h2');
    h2.textContent = yearLabel(idx);
    col.appendChild(h2);

    anio.semestres.forEach(sem=>{
      const semBox = document.createElement('div');
      semBox.className = 'sem';
      const h3 = document.createElement('h3');
      h3.textContent = sem.numero;
      semBox.appendChild(h3);

      sem.materias.forEach(m=>{
        total++;
        const div = document.createElement('div');
        div.className = 'materia';
        div.dataset.id = m.id;

        // Nombre a la izquierda
        const left = document.createElement('span');
        left.textContent = `${m.nombre} (${m.id})`;
        left.style.flex = '1';
        div.appendChild(left);

        // Acciones a la derecha
        const actions = document.createElement('div');
        actions.className = 'actions';

        // Chip de nota si existe
        const gradeVal = GRADES[m.id];
        if (typeof gradeVal === 'number' && !Number.isNaN(gradeVal)) {
          const chip = document.createElement('span');
          chip.className = 'grade-chip ' + (gradeVal>=11?'grade-high':(gradeVal>=7?'grade-mid':'grade-low'));
          chip.textContent = `Nota: ${gradeVal}`;
          actions.appendChild(chip);
        }

        // Botón de Notas
        const nb = document.createElement('button');
        nb.type = 'button';
        nb.className = 'note-btn';
        nb.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> <span class="nb-label">Notas</span>`;
        nb.addEventListener('click', (ev)=>{ ev.stopPropagation(); openNotes(m.id, m.nombre); });
        actions.appendChild(nb);

        div.appendChild(actions);

        // Estados/candados
        const req = normReq(m);
        const done = !!ESTADO[m.id];
        if (done) { div.classList.add('tachada'); aprob++; }
        const bloqueada = !cumple(req);
        if (bloqueada) {
          div.classList.add('bloqueada');
          const tip = faltantes(req);
          if (tip) div.setAttribute('data-tip', tip);
        }
        if ((NOTAS[m.id]?.trim()?.length>0) || (typeof gradeVal==='number')) {
          div.classList.add('has-note');
        }

        // Toggle aprobar
        div.addEventListener('click', ()=>{
          if (div.classList.contains('bloqueada')) return;
          ESTADO[m.id] = !ESTADO[m.id];
          save(LS_KEYS.estado, ESTADO);
          render();
        });

        semBox.appendChild(div);
      });

      col.appendChild(semBox);
    });

    cont.appendChild(col);
  });

  // Progreso
  const pct = total ? Math.round((aprob/total)*100) : 0;
  const stat = document.getElementById('statsFooter');
  if (stat) stat.textContent = `${aprob} / ${total} materias aprobadas · ${pct}% — ${progressCopy(pct)}`;

  const bar = document.getElementById('progressBar');
  const perc = document.getElementById('progressPercent');
  if (bar) {
    bar.style.width = pct + '%';
    let col = pct<=25 ? '#ff6b6b' : (pct<=75 ? '#ff9f68' : '#10b981');
    bar.style.background = `linear-gradient(90deg, ${col}, ${col})`;
  }
  if (perc) perc.textContent = pct + '%';
}

/* ====== Modal Notas/Calificación ====== */
let currentId = null;
const modal         = document.getElementById('notesModal');
const closeModal    = document.getElementById('closeModal');
const subjectSpan   = document.getElementById('modalSubjectName');
const textareaNotes = document.getElementById('notesTextarea');
const inputGrade    = document.getElementById('gradeInput');
const saveNoteBtn   = document.getElementById('saveNoteBtn');

function openNotes(id, nombre){
  currentId = id;
  subjectSpan.textContent = nombre;
  textareaNotes.value = NOTAS[id] || '';
  inputGrade.value = (typeof GRADES[id]==='number' && !Number.isNaN(GRADES[id])) ? String(GRADES[id]) : '';
  modal.style.display = 'block';
}
function closeNotes(){
  modal.style.display = 'none';
  currentId = null;
}
closeModal?.addEventListener('click', closeNotes);
window.addEventListener('click', (e)=>{ if (e.target===modal) closeNotes(); });

saveNoteBtn?.addEventListener('click', ()=>{
  if (!currentId) return;

  // Guardar notas
  NOTAS[currentId] = textareaNotes.value || '';
  save(LS_KEYS.notas, NOTAS);

  // Guardar calificación 0–12 (o eliminar si vacío)
  const raw = String(inputGrade.value ?? '').trim();
  if (raw === '') {
    delete GRADES[currentId];
  } else {
    let n = Number(raw);
    if (Number.isFinite(n)) {
      if (n < 0) n = 0;
      if (n > 12) n = 12;
      GRADES[currentId] = Math.round(n);
    }
  }
  save(LS_KEYS.grades, GRADES);

  closeNotes();
  render();
});

/* ====== Import / Export / Reset ====== */
document.getElementById('exportBtn')?.addEventListener('click', ()=>{
  const payload = {
    version: 2,
    fecha: new Date().toISOString(),
    estado: ESTADO,
    notas:  NOTAS,
    grades: GRADES
  };
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `notegood-malla-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
});

document.getElementById('importBtn')?.addEventListener('click', ()=> {
  document.getElementById('importFile')?.click();
});
document.getElementById('importFile')?.addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      if (!data || typeof data!=='object') throw new Error('JSON inválido');
      if (!data.estado || typeof data.estado!=='object') throw new Error('Falta "estado"');
      if (!data.notas  || typeof data.notas!=='object') throw new Error('Falta "notas"');
      const importedGrades = (data.grades && typeof data.grades==='object') ? data.grades : {};

      // Merge (no borramos lo que no venga)
      Object.keys(ESTADO).forEach(k=>delete ESTADO[k]);
      Object.assign(ESTADO, data.estado);
      Object.keys(NOTAS).forEach(k=>delete NOTAS[k]);
      Object.assign(NOTAS, data.notas);
      Object.keys(GRADES).forEach(k=>delete GRADES[k]);
      Object.assign(GRADES, importedGrades);

      save(LS_KEYS.estado, ESTADO);
      save(LS_KEYS.notas,  NOTAS);
      save(LS_KEYS.grades, GRADES);
      render();
      alert('Backup importado correctamente 📥');
    }catch(err){
      console.error(err);
      alert('Archivo inválido ❌');
    }
  };
  reader.readAsText(file);
});

document.getElementById('clearProgressBtn')?.addEventListener('click', ()=>{
  const ok = confirm("¿Seguro que querés borrar TODO tu avance, notas y calificaciones?");
  if (!ok) return;
  localStorage.removeItem(LS_KEYS.estado);
  localStorage.removeItem(LS_KEYS.notas);
  localStorage.removeItem(LS_KEYS.grades);
  Object.keys(ESTADO).forEach(k=>delete ESTADO[k]);
  Object.keys(NOTAS).forEach(k=>delete NOTAS[k]);
  Object.keys(GRADES).forEach(k=>delete GRADES[k]);
  render();
});

/* ====== Inicio ====== */
document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme(currentTheme());
  document.getElementById('themeSwitch')?.addEventListener('change', toggleTheme);
  render();
});
