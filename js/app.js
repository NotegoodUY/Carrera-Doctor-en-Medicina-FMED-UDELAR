console.log('Notegood Malla v15 cargado');

// Arranque seguro: si algo falla lo mostramos en pantalla
(function safeStart(){
  try { boot(); }
  catch(e){
    console.error('Fallo al iniciar:', e);
    const cont = document.getElementById('malla');
    if (cont) {
      cont.innerHTML = `<div style="padding:1rem;background:#fee2e2;border:1px solid #fecaca;border-radius:12px;max-width:960px;margin:1rem auto;font-weight:600;color:#7f1d1d">
        Ups, algo frenó la malla. Revisá la consola (F12) — <code>${e.message}</code>
      </div>`;
    }
  }
})();

function boot(){
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
  const yearLabel = i => (["1er año","2do año","3er año","4to año","5to año","6to año","7mo año"][i] || `Año ${i+1}`);

  /* ===== Plan (MANAT requiere MSPHB) ===== */
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
        { id:"MANAT", nombre:"Anatomía (CBCC2)", previas:["MSPHB"] }, // ✅ corrección
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
  const estado = load();

  function load(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}} }
  function save(){ localStorage.setItem(KEY, JSON.stringify(estado)); }
  const idsTrienio1 = () => { const out=[]; PLAN.slice(0,3).forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out; };
  const idsTodoAntes = () => { const out=[]; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out.filter(id=>id!=='INTO'); };
  const TRIENIO1=idsTrienio1(), TODO_ANTES=idsTodoAntes();

  const NOMBRE_M = (()=>{ const map={}; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>map[m.id]=m.nombre))); return map; })();
  const isOk = id => !!estado[id];

  function normReq(m){
    const req={ allOf:[], oneOf:[] };
    if (Array.isArray(m.previas)) req.allOf.push(...m.previas);
    if (m.req && Array.isArray(m.req.allOf)) req.allOf.push(...m.req.allOf);
    if (m.req && Array.isArray(m.req.oneOf)) req.oneOf.push(...m.req.oneOf);
    req.allOf=req.allOf.flatMap(id=> id==='__TRIENIO1__'?TRIENIO1 : id==='__TODO_ANTES__'?TODO_ANTES : [id]);
    return req;
  }
  function cumple(req){
    const allOk=(req.allOf||[]).every(id=>isOk(id));
    const groups=req.oneOf||[];
    const oneOk=groups.length===0 || groups.some(g=>g.some(id=>isOk(id)));
    return allOk && oneOk;
  }
  function faltantes(req){
    const faltAll=(req.allOf||[]).filter(id=>!isOk(id));
    const grupos=(req.oneOf||[]).map(g=>g.some(id=>isOk(id))?null:g).filter(Boolean);
    const name=id=>NOMBRE_M[id]||id;
    const parts=[];
    if (faltAll.length) parts.push("Te falta aprobar:\n• "+faltAll.map(name).join("\n• "));
    if (grupos.length)  parts.push("Y al menos 1 de:\n• "+grupos[0].map(name).join("\n• "));
    return parts.join("\n\n");
  }

  /* ===== Toasts ===== */
  function ensureToasts(){
    if(!document.querySelector('.toast-container')){
      const tc=document.createElement('div'); tc.className='toast-container'; document.body.appendChild(tc);
    }
  }
  function toast(txt, ms=6500){
    const tc=document.querySelector('.toast-container');
    while (tc.children.length>=3) tc.firstElementChild.remove();
    const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
    t.innerHTML=`<span class="tag">OK</span> ${txt}`; tc.appendChild(t); requestAnimationFrame(()=>t.classList.add('show'));
    let timer=setTimeout(()=>close(t), ms);
    t.addEventListener('mouseenter', ()=>{ clearTimeout(timer); timer=null; });
    t.addEventListener('mouseleave', ()=>{ if(!timer) timer=setTimeout(()=>close(t), 1800); });
    t.addEventListener('click', ()=>close(t));
  }
  function close(t){ if(!t||t.classList.contains('hide')) return; t.classList.remove('show'); t.classList.add('hide'); setTimeout(()=>t.remove(),220); }

  /* ===== Render ===== */
  function render(){
    const cont=document.getElementById('malla');
    if(!cont){ console.warn('#malla no encontrado'); return; }
    cont.innerHTML='';
    ensureToasts();

    let total=0, aprob=0;

    PLAN.forEach((anio, idx)=>{
      const col=document.createElement('div'); col.className='year y'+Math.min(idx+1,7);
      const h2=document.createElement('h2'); h2.textContent=yearLabel(idx); col.appendChild(h2);

      anio.semestres.forEach(sem=>{
        const box=document.createElement('div'); box.className='semestre';
        const h3=document.createElement('h3'); h3.textContent=sem.numero; box.appendChild(h3);

        sem.materias.forEach(m=>{
          total++;
          const div=document.createElement('div'); div.className='materia'; div.dataset.id=m.id;
          div.textContent=`${m.nombre} (${m.id})`;

          const req=normReq(m);
          const done=isOk(m.id);
          if(done){ div.classList.add('tachada'); aprob++; }

          const bloqueada=!cumple(req);
          if(bloqueada){
            div.classList.add('bloqueada');
            const tip=faltantes(req);
            if(tip) div.setAttribute('data-tip', tip);
          }

          div.addEventListener('click', ()=>{
            if(div.classList.contains('bloqueada')) return;
            const was=isOk(m.id);
            estado[m.id]=!was; save();
            if(!was && estado[m.id]){
              const frase=FRASES[Math.floor(Math.random()*FRASES.length)].replace('{m}', m.nombre);
              toast(frase);
            }
            render();
          });

          box.appendChild(div);
        });

        col.appendChild(box);
      });

      cont.appendChild(col);
    });

    const pct= total? Math.round((aprob/total)*100) : 0;
    const copy=progressCopy(pct);
    const p=document.getElementById('progressText'); if(p){ p.textContent=`${aprob} / ${total} materias aprobadas · ${pct}% — ${copy}`; }
    const bar=document.getElementById('progressBar'); if(bar){ bar.style.width = pct + '%'; }
    const kpi=document.getElementById('progressKpi'); if(kpi){ kpi.textContent = pct + '%'; }

    console.log('Progreso', {aprobadas:aprob,total,pct});
  }

  /* ===== Tema y reset ===== */
  function applyTheme(theme){
    document.body.classList.toggle('dark', theme === 'dark');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
  function currentTheme(){
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  function toggleTheme(){
    const next = (document.body.classList.contains('dark') ? 'light' : 'dark');
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }
  function onReset(){
    const ok = confirm("¿Seguro que querés borrar TODO tu avance? No se puede deshacer.");
    if(!ok) return;
    localStorage.removeItem(KEY);
    for (const k of Object.keys(estado)) delete estado[k];
    toast("Se reinició tu avance. Empezamos de cero 💫", 4000);
    render();
  }

  /* ===== Start ===== */
  document.addEventListener('DOMContentLoaded', ()=>{
    applyTheme(currentTheme());
    const themeBtn = document.getElementById('themeToggle'); if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    const resetBtn = document.getElementById('resetBtn'); if (resetBtn) resetBtn.addEventListener('click', onReset);
    render();
  });
}
