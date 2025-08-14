/* Notegood Malla – v41 */
console.log('Notegood Malla v41');

(function(){ try{ boot(); }catch(e){ console.error(e); const m=document.getElementById('malla'); if(m){ m.innerHTML='<div style="padding:1rem;background:#fee2e2;border:1px solid #fecaca;border-radius:12px;max-width:960px;margin:1rem auto;font-weight:600;color:#7f1d1d">Error: '+e.message+'</div>'; } }})();

function boot(){
  if (!firebase.apps?.length) firebase.initializeApp(window.FB_CONFIG || {});
  const auth=firebase.auth(), db=firebase.firestore();

  /* ======= PLAN ======= */
  const PLAN=[ /* usa el mismo plan que ya tenías (idéntico al último que te pasé) */ 
    { semestres:[{ numero:"1º semestre", materias:[
      {id:"MIBCM",nombre:"Introducción a la Biología Celular y Molecular"},
      {id:"MIBES",nombre:"Introducción a la Bioestadística"},
      {id:"MSPHB",nombre:"Salud y Humanidades y Bioética"},
      {id:"MAT1", nombre:"Aprendizaje en Territorio 1"}]},
    { numero:"2º semestre", materias:[
      {id:"MBCM",nombre:"Biología Celular y Molecular",previas:["MIBCM"]},
      {id:"MAT2",nombre:"Aprendizaje en Territorio 2",previas:["MAT1"]}]}]},
    { semestres:[{ numero:"3º semestre", materias:[
      {id:"MANAT",nombre:"Anatomía (CBCC2)",previas:["MSPHB"]},
      {id:"MHBIO",nombre:"Histología y Biofísica (CBCC2)",previas:["MBCM"]}]},
    { numero:"4º semestre", materias:[
      {id:"HIST", nombre:"Histología (Neuro y Cardio)",previas:["MBCM"]},
      {id:"BCC3N",nombre:"Neurociencias",previas:["MBCM"]},
      {id:"BCC4C",nombre:"Cardiovascular y Respiratorio",previas:["MBCM"]}]}]},
    { semestres:[{ numero:"5º semestre", materias:[
      {id:"BCC5",nombre:"Digestivo Renal Endocrino Metab y Repr (CBCC5)",previas:["MBCM","MANAT"]}]},
    { numero:"6º semestre", materias:[
      {id:"BCC6",nombre:"Hematología e Inmunobiología (CBCC6)",previas:["MBCM"]},
      {id:"MC1", nombre:"Metodología Científica 1",req:{allOf:["MIBES"],oneOf:[["HIST","BCC3N","BCC4C"]]}}]}]},
    { semestres:[{ numero:"7º semestre", materias:[
      {id:"M4PNA",nombre:"Medicina en el Primer Nivel de Atención",req:{allOf:["__TRIENIO1__"]}},
      {id:"M4BCP",nombre:"Bases Científicas de la Patología",req:{allOf:["__TRIENIO1__"]}}]},
    { numero:"8º semestre", materias:[
      {id:"M4PED",nombre:"Pediatría (4º – anual)",req:{allOf:["__TRIENIO1__"]}},
      {id:"M4GYN",nombre:"Ginecología y Neonatología",req:{allOf:["__TRIENIO1__"]}}]}]},
    { semestres:[{ numero:"9º y 10º semestre", materias:[
      {id:"MCM", nombre:"Clínica Médica (5º – anual)",req:{allOf:["__TRIENIO1__","M4BCP","M4PNA"]}},
      {id:"MPMT",nombre:"Patología Médica y Terapéutica",req:{allOf:["__TRIENIO1__","M4BCP"]}}]}]},
    { semestres:[{ numero:"11º y 12º semestre", materias:[
      {id:"M6CQ", nombre:"Clínica Quirúrgica (6º – anual)",req:{allOf:["__TRIENIO1__","M4BCP","M4PNA"]}},
      {id:"M6PQ", nombre:"Patología Quirúrgica (6º – anual)",req:{allOf:["__TRIENIO1__","M4BCP"]}},
      {id:"M6MFC",nombre:"MFC – Salud Mental en Comunidad – Psicología Médica",req:{allOf:["__TRIENIO1__","M4PNA"]}},
      {id:"MC2",  nombre:"Metodología Científica 2 (6º – anual)",req:{allOf:["__TRIENIO1__","M4BCP","M4PNA"],oneOf:[["M4PED","M4GYN","MCM","M6CQ","M6MFC"]]}}]}]},
    { semestres:[{ numero:"13º y 14º semestre", materias:[
      {id:"INTO",nombre:"Internado Obligatorio",req:{allOf:["__TODO_ANTES__"]}}]}]}
  ];

  /* ======= Estado local + nube ======= */
  const KEY='malla-medicina-notegood', NOTES_KEY='malla-medicina-notes', GRADES_KEY='malla-medicina-grades';
  const estado=load(KEY,{}), notas=load(NOTES_KEY,{}), grades=load(GRADES_KEY,{});
  function load(k,f){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f));}catch{return f;} }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }

  const progressRef=()=> auth.currentUser ? db.collection('progress').doc(auth.currentUser.uid) : null;
  async function cloudLoad(){ const r=progressRef(); if(!r) return null; const s=await r.get(); return s.exists? s.data():null; }
  let saveTimer=null;
  function cloudSaveDebounced(payload,ms=600){
    const r=progressRef(); if(!r) return; clearTimeout(saveTimer);
    saveTimer=setTimeout(async()=>{ try{
      await r.set({...payload,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    }catch(e){ console.error(e); toast('Problema al guardar en la nube ❌',2500);} },ms);
  }

  /* ======= Requisitos ======= */
  const idsTrienio1=()=>{const o=[]; PLAN.slice(0,3).forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>o.push(m.id)))); return o;};
  const idsTodoAntes=()=>{const o=[]; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>o.push(m.id)))); return o.filter(id=>id!=='INTO');};
  const TRIENIO1=idsTrienio1(), TODO_ANTES=idsTodoAntes();
  const NAME=(()=>{const map={}; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>map[m.id]=m.nombre))); return map;})();
  const isOk=id=>!!estado[id];
  function normReq(m){ const req={allOf:[],oneOf:[]}; if(Array.isArray(m.previas)) req.allOf.push(...m.previas);
    if(m.req?.allOf) req.allOf.push(...m.req.allOf); if(m.req?.oneOf) req.oneOf.push(...m.req.oneOf);
    req.allOf=req.allOf.flatMap(id=> id==='__TRIENIO1__'?TRIENIO1 : id==='__TODO_ANTES__'?TODO_ANTES : [id]); return req;
  }
  const cumple=req=>(req.allOf||[]).every(id=>isOk(id)) && (!(req.oneOf||[]).length || (req.oneOf||[]).some(g=>g.some(id=>isOk(id))));
  function faltantes(req){ const falt=(req.allOf||[]).filter(id=>!isOk(id)), grupos=(req.oneOf||[]).map(g=>g.some(id=>isOk(id))?null:g).filter(Boolean);
    const n=id=>NAME[id]||id; const out=[]; if(falt.length) out.push("Te falta aprobar:\n• "+falt.map(n).join("\n• "));
    if(grupos.length) out.push("Y al menos 1 de:\n• "+grupos[0].map(n).join("\n• ")); return out.join("\n\n");
  }

  /* ======= Copys ======= */
  const FRASES=["¡Bien ahí! {m} aprobada. Tu yo del futuro te aplaude 👏","{m} ✅ — organización + constancia = resultados.","¡Seguimos! {m} fuera de la lista 💪","Check en {m}. Paso a paso se llega lejos 🚶‍♀️🚶","Tu curva de aprendizaje sube con {m} 📈","¡Qué nivel! {m} completada con estilo ✨","Respirá hondo: {m} ya es historia 🧘","Lo lograste: {m} ✔️ — ¡a hidratarse y seguir! 💧","{m} done. Tu mapa se ve cada vez más claro 🗺️","Un paso más cerca del título gracias a {m} 💼"];
  let pool=[...FRASES];
  const frasePara=(materia)=>{ if(!pool.length) pool=[...FRASES]; return pool.splice(Math.floor(Math.random()*pool.length),1)[0].replace("{m}",materia); };
  const progressCopy=p=>p===100?"¡Plan completo! Orgullo total ✨":p>=90?"Últimos detalles y a festejar 🎉":p>=75?"Último sprint, ya casi 💨":p>=50?"Mitad de camino, paso firme 💪":p>=25?"Buen envión, seguí así 🚀":p>0?"Primeros checks, ¡bien ahí! ✅":"Arranquemos tranqui, paso a paso 👟";

  /* ======= Toasts (arriba, con botón OK) ======= */
  function ensureToasts(){ if(!document.querySelector('.toast-container')){ const tc=document.createElement('div'); tc.className='toast-container'; document.body.appendChild(tc);} }
  function toast(txt,ms=5000){
    ensureToasts();
    const tc=document.querySelector('.toast-container');
    while(tc.children.length>=3) tc.firstElementChild.remove();
    const t=document.createElement('div'); t.className='toast';
    t.innerHTML=`<span class="tag">OK</span> <span class="t-msg">${txt}</span> <button class="ok" aria-label="Cerrar">OK</button>`;
    t.addEventListener('click',(e)=>{ if(e.target.classList.contains('ok')||e.currentTarget===t) t.remove(); });
    tc.appendChild(t); setTimeout(()=>t.remove(), ms);
  }

  /* ======= Confetti ======= */
  const EMOJIS=["🎉","✨","🎈","🎊","💫","⭐","💜"];
  function confettiBurst(n=120){
    const root=document.getElementById('confetti'); if(!root) return;
    const W=innerWidth,H=innerHeight;
    for(let i=0;i<n;i++){
      const el=document.createElement('span'); el.className='confetti-piece';
      el.textContent=EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
      const x=Math.random()*W, y=H*0.22+Math.random()*H*0.25, dx=(Math.random()*2-1)*(W*0.45), dy=H*0.6+Math.random()*H*0.4;
      el.style.setProperty('--x',x+'px'); el.style.setProperty('--y',y+'px'); el.style.setProperty('--dx',dx+'px'); el.style.setProperty('--dy',dy+'px');
      root.appendChild(el); setTimeout(()=>el.remove(),1600);
    }
  }

  /* ======= Render ======= */
  function render(){
    const cont=document.getElementById('malla'); if(!cont) return; cont.innerHTML='';
    let total=0, aprob=0;

    PLAN.forEach((anio,idx)=>{
      const col=document.createElement('div'); col.className='year y'+(idx+1);
      col.appendChild(Object.assign(document.createElement('h2'),{textContent:["1er año","2do año","3er año","4to año","5to año","6to año","7mo año"][idx]||`Año ${idx+1}`}));
      anio.semestres.forEach(sem=>{
        const box=document.createElement('div'); box.className='semestre';
        box.appendChild(Object.assign(document.createElement('h3'),{textContent:sem.numero}));

        sem.materias.forEach(m=>{
          total++;
          const div=document.createElement('div'); div.className='materia'; div.dataset.id=m.id;

          const title=document.createElement('span'); title.className='title'; title.textContent=m.nombre; div.appendChild(title);

          const actions=document.createElement('div'); actions.className='actions';

          const gv=grades[m.id];
          if(typeof gv==='number' && !Number.isNaN(gv)){
            const chip=document.createElement('span'); chip.className='grade-chip '+(gv>=11?'grade-high':(gv>=7?'grade-mid':'grade-low')); chip.textContent=`Nota: ${gv}`; actions.appendChild(chip);
          }

          const nb=document.createElement('button'); nb.className='note-btn'; nb.type='button'; nb.innerHTML='<span class="nb-label">Notas</span>';
          nb.addEventListener('click',(ev)=>{ ev.stopPropagation(); openNote(m.id,m.nombre); });
          actions.appendChild(nb);

          div.appendChild(actions);

          const req=normReq(m);
          const done=!!estado[m.id]; if(done){ div.classList.add('tachada'); aprob++; }
          const bloqueada=!cumple(req);
          if(bloqueada){ div.classList.add('bloqueada'); const tip=faltantes(req); if(tip) div.setAttribute('data-tip',tip); }
          if((notas[m.id] && notas[m.id].trim()) || (typeof gv==='number')) div.classList.add('has-note');

          div.addEventListener('click', ()=>{
            if(div.classList.contains('bloqueada')) return;
            const was=!!estado[m.id]; estado[m.id]=!was; save(KEY,estado);
            if(auth.currentUser) cloudSaveDebounced({estado,notas,grades});
            if(!was && estado[m.id]){ toast(frasePara(m.nombre)); confettiBurst(80); }
            render();
          });

          box.appendChild(div);
        });

        col.appendChild(box);
      });

      cont.appendChild(col);
    });

    const pct = total? Math.round((aprob/total)*100) : 0;
    document.getElementById('progressText').textContent = `${aprob} / ${total} materias aprobadas · ${pct}% — ${progressCopy(pct)}`;
    document.getElementById('progressBar').style.width = pct+'%';
    document.getElementById('progressPct').textContent = pct+'%';
    document.getElementById('progressMsg').textContent = progressCopy(pct);
    if (pct===100) confettiBurst(140);
  }

  /* ======= Modal Notas ======= */
  let current=null;
  const modal=document.getElementById('noteModal');
  const noteTitle=document.getElementById('noteTitle');
  const noteText=document.getElementById('noteText');
  const gradeInput=document.getElementById('gradeInput');
  const saveNoteBtn=document.getElementById('saveNoteBtn');

  function openNote(id,nombre){
    current=id;
    if (noteTitle) noteTitle.textContent=`Notas — ${nombre}`;
    if (noteText) noteText.value = notas[id] || '';
    if (gradeInput) gradeInput.value = (typeof grades[id]==='number' && !Number.isNaN(grades[id])) ? String(grades[id]) : '';
    if (modal?.showModal) modal.showModal(); else modal?.setAttribute('open','');
  }

  saveNoteBtn?.addEventListener('click',(e)=>{
    e.preventDefault(); if(!current) return;
    const id=current;
    notas[id]=(noteText?.value||''); save(NOTES_KEY,notas);
    if (gradeInput){
      const raw=(gradeInput.value||'').trim();
      if(raw===''){ delete grades[id]; }
      else { let n=Number(raw); if(Number.isFinite(n)){ if(n<0)n=0; if(n>12)n=12; grades[id]=Math.round(n); } }
      save(GRADES_KEY,grades);
    }
    if(auth.currentUser) cloudSaveDebounced({estado,notas,grades});
    try{ modal?.close(); }catch{ modal?.removeAttribute('open'); }
    current=null; toast('Notas guardadas ✅',2000); render();
  });

  modal?.addEventListener('close', ()=>{ current=null; });

  /* ======= Tema (no persistente) ======= */
  document.getElementById('themeToggle')?.addEventListener('click', ()=> document.body.classList.toggle('dark'));

  /* ======= Reset ======= */
  document.getElementById('resetBtn')?.addEventListener('click', async ()=>{
    if(!confirm('¿Seguro que querés borrar TODO tu avance, notas y calificaciones?')) return;
    localStorage.removeItem(KEY); localStorage.removeItem(NOTES_KEY); localStorage.removeItem(GRADES_KEY);
    for(const k of Object.keys(estado)) delete estado[k];
    for(const k of Object.keys(notas)) delete notas[k];
    for(const k of Object.keys(grades)) delete grades[k];
    if(auth.currentUser){ try{ await progressRef()?.set({estado:{},notas:{},grades:{},updatedAt:firebase.firestore.FieldValue.serverTimestamp()}); }catch{} }
    toast('Se reinició tu avance 💫',2500); render();
  });

  /* ======= Auth ======= */
  const loginBtn=document.getElementById('loginGoogle');
  const logoutBtn=document.getElementById('logoutBtn');
  const badge=document.getElementById('userBadge');

  loginBtn?.addEventListener('click', async ()=>{ try{ await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }catch(e){ console.error(e); toast('No se pudo iniciar sesión ❌',2500);} });
  logoutBtn?.addEventListener('click', async ()=>{ await auth.signOut(); location.href='index.html'; });

  auth.onAuthStateChanged(async (u)=>{
    if(!u){ location.href='index.html?redirect=malla.html'; return; }
    const first=(u.displayName||u.email||'Usuario').split(' ')[0];
    badge.style.display=''; badge.textContent=`Hola, ${first}`;
    logoutBtn && (logoutBtn.style.display=''); loginBtn && (loginBtn.style.display='none');

    await db.collection('users').doc(u.uid).set({uid:u.uid,email:u.email||null,displayName:u.displayName||null,lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    const cloud=await cloudLoad();
    if (cloud){ Object.assign(estado,cloud.estado||{}); Object.assign(notas,cloud.notas||{}); Object.assign(grades,cloud.grades||{}); save(KEY,estado); save(NOTES_KEY,notas); save(GRADES_KEY,grades); }
    render();
  });
}
