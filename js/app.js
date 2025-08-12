console.log('Notegood Malla v9 cargado');

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

/* ===== Etiquetas de año (evita “1ª”) ===== */
function yearLabel(idx){
  const map = ["1er año","2do año","3er año","4to año","5to año","6to año","7mo año"];
  return map[idx] || `Año ${idx+1}`;
}

/* ===== Plan oficial (PDF) ===== */
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
      { id:"MANAT", nombre:"Anatomía (CBCC2)" }, /* sin previa explícita en PDF */
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

/* ===== Estado local ===== */
const KEY='malla-medicina-notegood';
const estado = loadEstado();
function loadEstado(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}} }
function saveEstado(){ localStorage.setItem(KEY, JSON.stringify(estado)); }

/* ===== Helpers requisitos ===== */
function idsTrienio1(){ const out=[]; PLAN.slice(0,3).forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out; }
function idsTodoAntes(){ const out=[]; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out.filter(id=>id!=='INTO'); }
const TRIENIO1=idsTrienio1(), TODO_ANTES=idsTodoAntes();

const NOMBRE_MATERIA = (()=>{ const map={}; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>map[m.id]=m.nombre))); return map; })();

function isAprobada(id){ return !!estado[id]; }

function normalizarReq(m){
  const req={ allOf:[], oneOf:[] };
  if (Array.isArray(m.previas)) req.allOf.push(...m.previas);
  if (m.req && Array.isArray(m.req.allOf)) req.allOf.push(...m.req.allOf);
  if (m.req && Array.isArray(m.req.oneOf)) req.oneOf.push(...m.req.oneOf);
  req.allOf=req.allOf.flatMap(id=> id==='__TRIENIO1__'?TRIENIO1 : id==='__TODO_ANTES__'?TODO_ANTES : [id]);
  return req;
}
function requisitosCumplidos(req){
  const allOk=(req.allOf||[]).every(id=>isAprobada(id));
  const groups=req.oneOf||[];
  const oneOk=groups.length===0 || groups.some(g=>g.some(id=>isAprobada(id)));
  return allOk && oneOk;
}
function faltantesTexto(req){
  const faltAll=(req.allOf||[]).filter(id=>!isAprobada(id));
  const grupos=(req.oneOf||[]).map(g=>g.some(id=>isAprobada(id))?null:g).filter(Boolean);
  const name=id=>NOMBRE_MATERIA[id]||id;
  const parts=[];
  if (faltAll.length) parts.push("Te falta aprobar:\n• "+faltAll.map(name).join("\n• "));
  if (grupos.length)  parts.push("Y al menos 1 de:\n• "+grupos[0].map(name).join("\n• "));
  return parts.join("\n\n");
}

/* ===== Toasts ===== */
function ensureToastContainer(){
  if(!document.querySelector('.toast-container')){
    const tc=document.createElement('div'); tc.className='toast-container'; document.body.appendChild(tc);
  }
}
function showToast(texto, ms=6500){
  const tc=document.querySelector('.toast-container');
  while (tc.children.length>=3) tc.firstElementChild.remove();
  const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
  t.innerHTML=`<span class="tag">OK</span> ${texto}`; tc.appendChild(t); requestAnimationFrame(()=>t.classList.add('show'));
  let timer=setTimeout(()=>closeToast(t), ms);
  t.addEventListener('mouseenter', ()=>{ clearTimeout(timer); timer=null; });
  t.addEventListener('mouseleave', ()=>{ if(!timer) timer=setTimeout(()=>closeToast(t), 1800); });
  t.addEventListener('click', ()=>closeToast(t));
}
function closeToast(t){ if(!t||t.classList.contains('hide')) return; t.classList.remove('show'); t.classList.add('hide'); setTimeout(()=>t.remove(),220); }

/* ===== Render ===== */
function initMalla(plan){
  const cont=document.getElementById('malla');
  cont.innerHTML='';
  ensureToastContainer();

  let total=0, aprobadas=0;

  plan.forEach((anio, idx)=>{
    const col=document.createElement('div'); col.className='year y'+Math.min(idx+1,7);
    const h2=document.createElement('h2'); h2.textContent=yearLabel(idx); col.appendChild(h2);

    anio.semestres.forEach(sem=>{
      const box=document.createElement('div'); box.className='semestre';
      const h3=document.createElement('h3'); h3.textContent=sem.numero; box.appendChild(h3);

      sem.materias.forEach(m=>{
        total++;
        const div=document.createElement('div'); div.className='materia'; div.dataset.id=m.id;
        div.textContent=`${m.nombre} (${m.id})`;

        const req=normalizarReq(m);
        const done=isAprobada(m.id);
        if(done){ div.classList.add('tachada'); aprobadas++; }

        const bloqueada=!requisitosCumplidos(req);
        if(bloqueada){
          div.classList.add('bloqueada');
          const tip=faltantesTexto(req);
          if(tip) div.setAttribute('data-tip', tip);
        }

        div.addEventListener('click', ()=>{
          if(div.classList.contains('bloqueada')) return;
          const was=isAprobada(m.id);
          estado[m.id]=!was; saveEstado();
          if(!was && estado[m.id]){
            const frase=FRASES[Math.floor(Math.random()*FRASES.length)].replace('{m}', m.nombre);
            showToast(frase);
          }
          initMalla(plan); // re-render
        });

        box.appendChild(div);
      });

      col.appendChild(box);
    });

    cont.appendChild(col);
  });

  const pct= total? Math.round((aprobadas/total)*100) : 0;
  const copy=progressCopy(pct);
  const p=document.getElementById('progressText');
  if(p){ p.textContent = `${aprobadas} / ${total} materias aprobadas · ${pct}% — ${copy}`; }
  console.log('Progreso', {aprobadas,total,pct,copy});
}

/* ===== Start ===== */
document.addEventListener('DOMContentLoaded', ()=> initMalla(PLAN));
