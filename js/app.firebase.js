/* Notegood Malla – app.firebase.js (v28, cloud sync + render) */
console.log('Notegood Malla v28 – app.firebase.js');

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
  // ===== Firebase init (evitar doble init) =====
  if (!firebase.apps?.length) {
    firebase.initializeApp(window.FB_CONFIG || {});
  } else {
    firebase.app();
  }
  const auth = firebase.auth();
  const db   = firebase.firestore();

  async function upsertUserProfile(user) {
    const ref = db.collection('users').doc(user.uid);
    await ref.set({
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      provider: (user.providerData[0]?.providerId) || null,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

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
    "{m} done. Tu mapa se ve cada vez más claro 🗺️",
    "¡Boom! {m} aprobada. Y sin despeinarte 💅",
    "Un paso más cerca del título con {m} 💼",
    "{m} ya es pasado. El presente: seguir avanzando 🚀",
    "Notegood vibes: {m} superada con éxito ✨",
    "¡Crack total! {m} ✔️",
    "Checklist update: {m} ✅ — y seguimos 📋",
    "Cada materia cuenta: {m} aprobada suma y suma 📊",
    "Café, esfuerzo y {m}… receta perfecta ☕",
    "La montaña era alta, pero {m} ya quedó atrás 🏔️",
    "{m} ✅ — pequeña victoria, gran avance 🏅",
    "Aprobaste {m} y el mundo sigue girando… pero más a tu favor 🌍",
    "Otro ladrillo en tu muro del conocimiento: {m} 🧱",
    "Notegood tip: celebrar {m} te da +10 de motivación 🎯",
    "La aventura continúa, pero {m} quedó en el capítulo anterior 📖",
    "Si tu vida fuera una serie, {m} sería el plot twist ganador 📺",
    "Más materias así y vas a necesitar un trofeo extra 🏆",
    "{m} aprobada. Tu yo del futuro ya está llorando de orgullo 😭",
    "La ciencia dice que aprobar {m} libera endorfinas 🧠",
    "Próximo nivel desbloqueado gracias a {m} 🎮"
  ];
  let frasesPool = [...FRASES];
  const frasePara = (materia) => {
    if (frasesPool.length === 0) frasesPool = [...FRASES];
    const i = Math.floor(Math.random()*frasesPool.length);
    const f = frasesPool.splice(i,1)[0];
    return f.replace("{m}", materia);
  };

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

  /* ===== PLAN (correlativas) ===== */
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

  /* ===== Estado y storage local ===== */
  const KEY='malla-medicina-notegood';
  const NOTES_KEY='malla-medicina-notes';
  const GRADES_KEY='malla-medicina-grades';
  const THEME_KEY='ng-theme';

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
    if (!progressRef()) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await progressRef().set({ ...payload, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      } catch(e) {
        console.error('Cloud save error', e);
        toast('Problema al guardar en la nube ❌', 2500);
      }
    }, ms);
  }

  /* ===== Utilidades de requisitos ===== */
  const idsTrienio1 = () => { const out=[]; PLAN.slice(0,3).forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out; };
  const idsTodoAntes = () => { const out=[]; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out.filter(id=>id!=='INTO'); };
  const TRIENIO1=idsTrienio1(), TODO_ANTES=idsTodoAntes();

  const NAME = (()=>{ const map={}; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>map[m.id]=m.nombre))); return map; })();
  const isOk = id => !!estado[id];

  function normReq(m){
    const req={ allOf:[], oneOf:[] };
    if (Array.isArray(m.previas)) req.allOf.push(...m.previas);
    if (m.req && Array.isArray(m.req.allOf)) req.allOf.push(...m.req.allOf);
    if (m.req && Array.isArray(m.req.oneOf)) req.oneOf.push(...m.req.oneOf);
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

  /* ===== Toasts ===== */
  function ensureToasts(){
    if(!document.querySelector('.toast-container')){
      const tc=document.createElement('div'); tc.className='toast-container'; document.body.appendChild(tc);
    }
  }
  function toast(txt, ms=6500){
    ensureToasts();
    const tc=document.querySelector('.toast-container');
    while (tc.children.length>=3) tc.firstElementChild.remove();
    const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
    t.innerHTML=`<span class="tag">OK</span> ${txt}`; tc.appendChild(t); requestAnimationFrame(()=>t.classList.add('show'));
    let timer=setTimeout(()=>close(t), ms);
    t.addEventListener('mouseenter', ()=>{ clearTimeout(timer); timer=null; });
    t.addEventListener('mouseleave', ()=>{ if(!timer) timer=setTimeout(()=>close(t), 1800); });
    t.addEventListener('click', ()=>close(t));
  }
  const close = t => { if(!t||t.classList.contains('hide')) return; t.classList.remove('show'); t.classList.add('hide'); setTimeout(()=>t.remove(),220); };

  /* ===== Confetti (FULL pantalla) ===== */
  const EMOJIS = ["🎉","✨","🎈","🎊","💫","⭐","💜"];
  function confettiBurst(count=140){
    const root=document.getElementById('confetti'); if(!root) return;
    const W = window.innerWidth, H = window.innerHeight;
    for (let i=0;i<count;i++){
      const el = document.createElement('span');
      el.className = 'confetti-piece';
      el.textContent = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
      const startX = Math.random()*W;
      const startY = H*0.25 + Math.random()*H*0.2;
      const dx = (Math.random()*2-1) * (W*0.45);
      const dy = H*0.6 + Math.random()*H*0.4;
      el.style.setProperty('--x', startX + 'px');
      el.style.setProperty('--y', startY + 'px');
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
      root.appendChild(el);
      setTimeout(()=>el.remove(), 1800);
    }
  }

  /* ===== Render ===== */
  function render(){
    const cont=document.getElementById('malla');
    if (!cont) return;
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

          // Título
          const title = document.createElement('span');
          title.className = 'title';
          title.textContent = `${m.nombre}`;
          div.appendChild(title);

          // Acciones a la derecha
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
              confettiBurst(48);
            }
            render();
          });

          box.appendChild(div);
        });

        col.appendChild(box);
      });

      cont.appendChild(col);
    });

    // Progreso + KPI + mensaje
    const pct = total? Math.round((aprob/total)*100) : 0;
    const copy = progressCopy(pct);

    const p = document.getElementById('progressText');
    if(p){ p.textContent=`${aprob} / ${total} materias aprobadas · ${pct}% — ${copy}`; }

    const bar=document.getElementById('progressBar');
    if(bar){ bar.style.width = pct + '%'; }

    const pctEl=document.getElementById('progressPct');
    if(pctEl) pctEl.textContent = pct + '%';

    const msgEl=document.getElementById('progressMsg');
    if(msgEl) msgEl.textContent = copy;

    if (pct === 100) confettiBurst(140);
  }

  /* ===== Modal Notas + Nota ===== */
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

  if (saveNoteBtn){
    saveNoteBtn.addEventListener('click', (e)=>{
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
      render();
      toast('Notas guardadas ✅', 2000);
    });
  }
  modal?.addEventListener('close', ()=>{ currentNoteId=null; });

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
  const toggleTheme = () => { const next = (document.body.classList.contains('dark') ? 'light' : 'dark'); localStorage.setItem(THEME_KEY, next); applyTheme(next); };

  async function onReset(){
    const ok = confirm("¿Seguro que querés borrar TODO tu avance, notas y calificaciones? No se puede deshacer.");
    if(!ok) return;
    localStorage.removeItem(KEY);
    localStorage.removeItem(NOTES_KEY);
    localStorage.removeItem(GRADES_KEY);
    for (const k of Object.keys(estado)) delete estado[k];
    for (const k of Object.keys(notas)) delete notas[k];
    for (const k of Object.keys(grades)) delete grades[k];
    if (auth.currentUser) { try { await progressRef().set({ estado:{}, notas:{}, grades:{}, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }); } catch(e){ console.error(e); } }
    toast("Se reinició tu avance, notas y calificaciones 💫", 4000);
    render();
  }

  /* ===== Auth UI bindings ===== */
  function bindAuthUI(){
    const loginBtn = document.getElementById('loginGoogle');
    const logoutBtn = document.getElementById('logoutBtn');
    const badge = document.getElementById('userBadge');

    loginBtn?.addEventListener('click', async ()=>{
      try { await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }
      catch(e){ console.error(e); toast('No se pudo iniciar sesión ❌', 2500); }
    });
    logoutBtn?.addEventListener('click', async ()=>{ await auth.signOut(); });

    auth.onAuthStateChanged(async (user)=>{
      if (user){
        if (loginBtn) loginBtn.style.display='none';
        if (logoutBtn) logoutBtn.style.display='';
        if (badge){ badge.style.display=''; badge.textContent = user.displayName ? `Hola, ${user.displayName}` : (user.email || 'Conectado'); }

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
            await progressRef().set({ estado, notas, grades, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
          } else {
            await progressRef().set({ estado:{}, notas:{}, grades:{}, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge:true });
          }
        }
        render();
        toast('Sesión iniciada ☁️', 1600);
      } else {
        if (logoutBtn) logoutBtn.style.display='none';
        if (badge) badge.style.display='none';
        if (loginBtn) loginBtn.style.display='';
      }
    });
  }

  /* ===== Start ===== */
  document.addEventListener('DOMContentLoaded', ()=>{
    applyTheme(currentTheme());
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('resetBtn')?.addEventListener('click', onReset);

    bindAuthUI();
    render();
  });
}
