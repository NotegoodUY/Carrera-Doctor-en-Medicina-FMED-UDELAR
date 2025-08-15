/* Notegood Malla – v43 (completo)
   - Confeti más lento + emojis de medicina
   - Toast con un solo OK
   - Auth + Firestore sync
   - Notas, calificaciones, correlativas, progreso
   - Tema claro/oscuro (no persistente)
*/
console.log('Notegood Malla v43');

(function () {
  try { boot(); }
  catch (e) {
    console.error(e);
    const m = document.getElementById('malla');
    if (m) {
      m.innerHTML = '<div style="padding:1rem;background:#fee2e2;border:1px solid #fecaca;border-radius:12px;max-width:960px;margin:1rem auto;font-weight:600;color:#7f1d1d">Error: ' + e.message + '</div>';
    }
  }
})();

function boot(){
  // ===== Firebase =====
  if (!firebase.apps?.length) firebase.initializeApp(window.FB_CONFIG || {});
  const auth = firebase.auth();
  const db   = firebase.firestore();

  async function upsertUserProfile(user) {
    try{
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        provider: (user.providerData[0]?.providerId) || null,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }catch(e){ console.error('upsertUserProfile', e); }
  }

  // ===== Copys =====
  const FRASES = [
    "¡Bien ahí! {m} aprobada. Tu yo del futuro te aplaude 👏",
    "{m} ✅ — organización + constancia = resultados.",
    "¡Seguimos! {m} fuera de la lista 💪",
    "Check en {m}. Paso a paso se llega lejos 🚶‍♀️🚶",
    "Tu curva de aprendizaje sube con {m} 📈",
    "¡Qué nivel! {m} completada con estilo ✨",
    "Respirá hondo: {m} ya es historia 🧘",
    "Lo lograste: {m} ✔️ — ¡a hidratarse y seguir! 💧",
    "{m} done. Tu mapa se ve cada vez más claro 🗺️",
    "Un paso más cerca del título gracias a {m} 💼"
  ];
  let frasesPool=[...FRASES];
  const frasePara=(materia)=>{ if(!frasesPool.length) frasesPool=[...FRASES]; return frasesPool.splice(Math.floor(Math.random()*frasesPool.length),1)[0].replace("{m}",materia); };

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

  // ===== PLAN (idéntico al acordado) =====
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
        { id:"MANAT", nombre:"Anatomía (CBCC2)", previas:["MSPHB"] },
        { id:"MHBIO", nombre:"Histología y Biofísica (CBCC2)", previas:["MBCM"] }
      ]},
      { numero: "4º semestre", materias: [
        { id:"HIST",  nombre:"Histología (Neuro y Cardio)",  previas:["MBCM"] },
        { id:"BCC3N", nombre:"Neurociencias",                 previas:["MBCM"] },
        { id:"BCC4C", nombre:"Cardiovascular y Respiratorio", previas:["MBCM"] }
      ]}
    ]},
    { semestres: [
      { numero: "5º semestre", materias: [
        { id:"BCC5", nombre:"Digestivo Renal Endocrino Metab y Repr (CBCC5)", previas:["MBCM","MANAT"] }
      ]},
      { numero: "6º semestre", materias: [
        { id:"BCC6", nombre:"Hematología e Inmunobiología (CBCC6)", previas:["MBCM"] },
        { id:"MC1",  nombre:"Metodología Científica 1", req:{ allOf:["MIBES"], oneOf:[["HIST","BCC3N","BCC4C"]] } }
      ]}
    ]},
    { semestres: [
      { numero: "7º semestre", materias: [
        { id:"M4PNA", nombre:"Medicina en el Primer Nivel de Atención", req:{ allOf:["__TRIENIO1__"] } },
        { id:"M4BCP", nombre:"Bases Científicas de la Patología",       req:{ allOf:["__TRIENIO1__"] } }
      ]},
      { numero: "8º semestre", materias: [
        { id:"M4PED", nombre:"Pediatría (4º – anual)",     req:{ allOf:["__TRIENIO1__"] } },
        { id:"M4GYN", nombre:"Ginecología y Neonatología", req:{ allOf:["__TRIENIO1__"] } }
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

  // ===== Estado + storage =====
  const KEY='malla-medicina-notegood';
  const NOTES_KEY='malla-medicina-notes';
  const GRADES_KEY='malla-medicina-grades';

  const estado = load(KEY, {});
  const notas  = load(NOTES_KEY, {});
  const grades = load(GRADES_KEY, {});

  function load(k, fallback){ try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback)); } catch { return fallback; } }
  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

  // ===== Cloud persistence (Firestore) =====
  const progressRef = () => auth.currentUser ? db.collection('progress').doc(auth.currentUser.uid) : null;

  async function cloudLoad() {
    const ref = progressRef(); if (!ref) return null;
    const snap = await ref.get();
    return snap.exists ? snap.data() : null;
  }

  let saveTimer = null;
  function cloudSaveDebounced(payload, ms=600) {
    const ref = progressRef(); if (!ref) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await ref.set({ ...payload, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      } catch(e) {
        console.error('Cloud save error', e);
        toast('Problema al guardar en la nube ❌', 2500);
      }
    }, ms);
  }

  // ===== Requisitos =====
  const idsTrienio1 = () => { const out=[]; PLAN.slice(0,3).forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out; };
  const idsTodoAntes = () => { const out=[]; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out.filter(id=>id!=='INTO'); };
  const TRIENIO1=idsTrienio1(), TODO_ANTES=idsTodoAntes();

  const NAME = (()=>{ const map={}; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>map[m.id]=m.nombre))); return map; })();
  const isOk = id => !!estado[id];

  function normReq(m){
    const req={ allOf:[], oneOf:[] };
    if (Array.isArray(m.previas)) req.allOf.push(...m.previas);
    if (m.req?.allOf) req.allOf.push(...m.req.allOf);
    if (m.req?.oneOf) req.oneOf.push(...m.req.oneOf);
    req.allOf=req.allOf.flatMap(id=> id==='__TRIENIO1__'?TRIENIO1 : id==='__TODO_ANTES__'?TODO_ANTES : [id]);
    return req;
  }
  const cumple = req => (req.allOf||[]).every(id=>isOk(id)) && ((req.oneOf||[]).length===0 || (req.oneOf||[]).some(g=>g.some(id=>isOk(id))));
  function faltantes(req){
    const faltAll=(req.allOf||[]).filter(id=>!isOk(id));
    const grupos=(req.oneOf||[]).map(g=>g.some(id=>isOk(id))?null:g).filter(Boolean);
    const n=id=>NAME[id]||id;
    const parts=[];
    if (faltAll.length) parts.push("Te falta aprobar:\n• "+faltAll.map(n).join("\n• "));
    if (grupos.length)  parts.push("Y al menos 1 de:\n• "+grupos[0].map(n).join("\n• "));
    return parts.join("\n\n");
  }

  // ===== Toasts (1 solo OK) =====
  function ensureToasts(){
    if(!document.querySelector('.toast-container')){
      const tc=document.createElement('div');
      tc.className='toast-container';
      document.body.appendChild(tc);
    }
  }
  function toast(txt, ms=5000){
    ensureToasts();
    const tc=document.querySelector('.toast-container');
    while (tc.children.length>=3) tc.firstElementChild.remove();
    const t=document.createElement('div');
    t.className='toast';
    t.innerHTML = `<span class="t-msg">${txt}</span> <button class="ok" aria-label="Cerrar">OK</button>`;
    t.addEventListener('click', (e)=>{ if(e.target.classList.contains('ok') || e.currentTarget===t) t.remove(); });
    tc.appendChild(t);
    setTimeout(()=>t.remove(), ms);
  }

  // ===== Confetti (más lento + emojis de medicina) =====
  // Emojis médicos sumados: 🩺, 💉, 🧪, 🧬, 🩸, 🏥, 🧠, 🫀, 🫁, 💊
  const EMOJIS = ["🎉","✨","🎈","🎊","💫","⭐","💜","🩺","💉","🧪","🧬","🩸","🏥","🧠","🫀","🫁","💊"];

  function confettiBurst(n=90, spread=0.38){
    const root=document.getElementById('confetti'); if(!root) return;
    const W=innerWidth, H=innerHeight, CX=W*0.5, CY=H*0.25;

    for(let i=0;i<n;i++){
      const el=document.createElement('span'); el.className='confetti-piece';
      el.textContent = EMOJIS[(Math.random()*EMOJIS.length)|0];

      const angle = (Math.random()*Math.PI*2);
      const radius = (Math.random()*60 - 30);
      const x = CX + Math.cos(angle)*radius;
      const y = CY + Math.sin(angle)*radius;

      // Velocidades suaves (coinciden con CSS ~1.8s)
      const dx = (Math.random()*W*spread - W*spread/2);
      const dy = (H*0.55 + Math.random()*H*0.35);

      el.style.setProperty('--x', x+'px');
      el.style.setProperty('--y', y+'px');
      el.style.setProperty('--dx', dx+'px');
      el.style.setProperty('--dy', dy+'px');

      root.appendChild(el);
      setTimeout(()=>el.remove(), 2200);
    }
  }

  // ===== Render =====
  function render(){
    const cont=document.getElementById('malla'); if(!cont) return;
    cont.innerHTML='';
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

          // Lado izquierdo: nombre
          const left = document.createElement('span');
          left.className='title';
          left.textContent = m.nombre;
          div.appendChild(left);

          // Lado derecho: nota (chip) + botón notas
          const actions = document.createElement('div');
          actions.className = 'actions';

          // Chip de nota si existe
          const gradeVal = grades[m.id];
          if (typeof gradeVal === 'number' && !Number.isNaN(gradeVal)) {
            const chip = document.createElement('span');
            chip.className = 'grade-chip ' + (gradeVal>=11?'grade-high':(gradeVal>=7?'grade-mid':'grade-low'));
            chip.textContent = `Nota: ${gradeVal}`;
            actions.appendChild(chip);
          }

          // Botón Notas
          const nb = document.createElement('button');
          nb.className = 'note-btn';
          nb.type = 'button';
          nb.innerHTML = `<span class="nb-label">Notas</span>`;
          nb.addEventListener('click', (ev)=>{ ev.stopPropagation(); openNote(m.id, m.nombre); });
          actions.appendChild(nb);

          div.appendChild(actions);

          // Estado/candado
          const req=normReq(m);
          const done=!!estado[m.id];
          if(done){ div.classList.add('tachada'); aprob++; }
          const bloqueada=!cumple(req);
          if(bloqueada){
            div.classList.add('bloqueada');
            const tip=faltantes(req);
            if(tip) div.setAttribute('data-tip', tip);
          }

          // Indicador si tiene nota
          if ((notas[m.id] && notas[m.id].trim().length>0) || (typeof gradeVal==='number')) {
            div.classList.add('has-note');
          }

          // Toggle aprobación
          div.addEventListener('click', ()=>{
            if(div.classList.contains('bloqueada')) return;
            const was=!!estado[m.id];
            estado[m.id]=!was; save(KEY, estado);
            if (auth.currentUser) cloudSaveDebounced({ estado, notas, grades });
            if(!was && estado[m.id]){
              toast(frasePara(m.nombre));
              confettiBurst(90); // más lento + médico
            }
            render();
          });

          box.appendChild(div);
        });

        col.appendChild(box);
      });

      cont.appendChild(col);
    });

    const pct = total? Math.round((aprob/total)*100) : 0;
    const copy = progressCopy(pct);

    const p = document.getElementById('progressText');
    if(p){ p.textContent=`${aprob} / ${total} materias aprobadas · ${pct}% — ${copy}`; }

    const bar=document.getElementById('progressBar');
    if(bar){
      let col = pct<=25 ? '#ff6b6b' : (pct<=75 ? '#ff9f68' : '#4ade80');
      bar.style.width = pct + '%';
      bar.style.background = `linear-gradient(90deg, ${col}, ${col})`;
    }
    const pctEl=document.getElementById('progressPct'); if(pctEl) pctEl.textContent = pct + '%';
    const msgEl=document.getElementById('progressMsg'); if(msgEl) msgEl.textContent = copy;

    if (pct === 100) confettiBurst(140);
  }

  // ===== Modal Notas + Nota =====
  let currentNoteId = null;
  const modal = document.getElementById('noteModal');
  const noteTitle = document.getElementById('noteTitle');
  const noteText  = document.getElementById('noteText');
  const gradeInput= document.getElementById('gradeInput');
  const saveNoteBtn = document.getElementById('saveNoteBtn');

  function openNote(id, nombre){
    currentNoteId = id;
    if (noteTitle) noteTitle.textContent = `Notas — ${nombre}`;
    if (noteText)  noteText.value = notas[id] || '';
    if (gradeInput) gradeInput.value = (typeof grades[id]==='number' && !Number.isNaN(grades[id])) ? String(grades[id]) : '';
    if (modal) {
      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.setAttribute('open','');
    }
  }

  saveNoteBtn?.addEventListener('click', (e)=>{
    e.preventDefault();
    if (!currentNoteId) return;

    // Guardar texto
    if (noteText) {
      notas[currentNoteId] = noteText.value || '';
      save(NOTES_KEY, notas);
    }

    // Guardar nota (0–12 o vacía)
    if (gradeInput){
      const raw = gradeInput.value.trim();
      if (raw === '') {
        delete grades[currentNoteId];
      } else {
        let n = Number(raw);
        if (Number.isFinite(n)) {
          if (n < 0) n = 0;
          if (n > 12) n = 12;
          grades[currentNoteId] = Math.round(n);
        }
      }
      save(GRADES_KEY, grades);
    }

    if (auth.currentUser) cloudSaveDebounced({ estado, notas, grades });
    try { modal?.close(); } catch { modal?.removeAttribute('open'); }
    currentNoteId = null;
    toast('Notas guardadas ✅', 2000);
    render();
  });

  modal?.addEventListener('close', ()=>{ currentNoteId=null; });

  // ===== Tema y reset =====
  function applyTheme(theme){
    document.body.classList.toggle('dark', theme === 'dark');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
  const toggleTheme = () => { const next = (document.body.classList.contains('dark') ? 'light' : 'dark'); applyTheme(next); };

  async function onReset(){
    const ok = confirm("¿Seguro que querés borrar TODO tu avance, notas y calificaciones? No se puede deshacer.");
    if(!ok) return;
    localStorage.removeItem(KEY);
    localStorage.removeItem(NOTES_KEY);
    localStorage.removeItem(GRADES_KEY);
    for (const k of Object.keys(estado)) delete estado[k];
    for (const k of Object.keys(notas)) delete notas[k];
    for (const k of Object.keys(grades)) delete grades[k];
    if (auth.currentUser) {
      try { await progressRef().set({ estado:{}, notas:{}, grades:{}, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }); }
      catch(e){ console.error(e); }
    }
    toast("Se reinició tu avance 💫", 2500);
    render();
  }

  // ===== Auth UI bindings =====
  function bindUI(){
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('resetBtn')?.addEventListener('click', onReset);
  }
  bindUI();

  // ===== Auth =====
  const loginBtn  = document.getElementById('loginGoogle');
  const logoutBtn = document.getElementById('logoutBtn');
  const badge     = document.getElementById('userBadge');

  loginBtn?.addEventListener('click', async ()=>{ try{ await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }catch(e){ console.error(e); toast('No se pudo iniciar sesión ❌', 2500);} });
  logoutBtn?.addEventListener('click', async ()=>{ await auth.signOut(); location.href='index.html'; });

  auth.onAuthStateChanged(async (user)=>{
    if (!user) { location.href='index.html?redirect=malla.html'; return; }

    // Saludo con primer nombre
    const first=(user.displayName||user.email||'Usuario').split(' ')[0];
    if (badge){ badge.style.display=''; badge.textContent=`Hola, ${first}`; }
    if (logoutBtn) logoutBtn.style.display='';
    if (loginBtn)  loginBtn.style.display='none';

    await upsertUserProfile(user);

    const cloud = await cloudLoad();
    if (cloud && (cloud.estado || cloud.notas || cloud.grades)){
      Object.assign(estado, cloud.estado||{});
      Object.assign(notas,  cloud.notas ||{});
      Object.assign(grades, cloud.grades||{});
      save(KEY, estado); save(NOTES_KEY, notas); save(GRADES_KEY, grades);
    } else {
      const hasLocal = Object.keys(estado).length || Object.keys(notas).length || Object.keys(grades).length;
      if (hasLocal){
        await progressRef().set({ estado, notas, grades, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge:true });
      } else {
        await progressRef().set({ estado:{}, notas:{}, grades:{}, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge:true });
      }
    }

    render();
    toast('Sesión iniciada ☁️', 1600);
  });

  // Start
  document.addEventListener('DOMContentLoaded', ()=>{
    applyTheme(document.body.classList.contains('dark') ? 'dark' : 'light'); // no persistente
    render();
  });
}
