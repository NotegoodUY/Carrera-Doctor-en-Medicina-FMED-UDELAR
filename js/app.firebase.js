/* Notegood Malla – v43
   - Confeti más lento + emojis de medicina (full-screen)
   - Toast con un solo OK
   - Modal Notas con Cancelar
   - Progreso, correlativas y estados como te gustan
   - Onboarding (una vez)
*/
console.log('Notegood Malla v43');

(function(){ try{ boot(); } catch(e){ console.error(e);
  const m=document.getElementById('malla'); if(m){ m.innerHTML='<div style="padding:1rem;background:#fee2e2;border:1px solid #fecaca;border-radius:12px;max-width:960px;margin:1rem auto;font-weight:600;color:#7f1d1d">Error: '+e.message+'</div>'; }
}})();

function boot(){
  if (!firebase.apps?.length) firebase.initializeApp(window.FB_CONFIG || {});
  const auth=firebase.auth(), db=firebase.firestore();

  async function upsertUserProfile(user){
    try{
      await db.collection('users').doc(user.uid).set({
        uid:user.uid, email:user.email||null, displayName:user.displayName||null,
        provider:(user.providerData[0]?.providerId)||null,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    }catch(e){ console.error(e); }
  }

  /* Copys */
  const FRASES=[
    "¡Bien ahí! {m} aprobada. Tu yo del futuro te aplaude 👏",
    "{m} ✅ — organización + constancia = resultados.",
    "¡Seguimos! {m} fuera de la lista 💪",
    "Check en {m}. Paso a paso se llega lejos 🚶‍♀️🚶",
    "Tu curva de aprendizaje sube con {m} 📈",
    "¡Qué nivel! {m} completada con estilo ✨",
    "Respira hondo: {m} ya es historia 🧘",
    "Lo lograste: {m} ✔️ — ¡a hidratarse y seguir! 💧",
    "{m} done. Tu mapa se ve cada vez más claro 🗺️",
    "Un paso más cerca del título gracias a {m} 💼"
  ];
  let frasesPool=[...FRASES];
  const frasePara=m=>{ if(!frasesPool.length) frasesPool=[...FRASES]; return frasesPool.splice(Math.floor(Math.random()*frasesPool.length),1)[0].replace("{m}",m); };

  const progressCopy=p=> p===100?"¡Plan completo! Orgullo total ✨": p>=90?"Últimos detalles y a festejar 🎉": p>=75?"Último sprint, ya casi 💨": p>=50?"Mitad de camino, paso firme 💪": p>=25?"Buen envión, sigue así 🚀": p>0?"Primeros checks, ¡bien ahí! ✅":"Arranquemos tranqui, paso a paso 👟";
  const yearLabel=i=>["1er año","2do año","3er año","4to año","5to año","6to año","7mo año"][i]||`Año ${i+1}`;

  /* PLAN */
  const PLAN=[ /* (igual al tuyo, abreviado por espacio) */ ];
  PLAN.push(); PLAN.pop(); // <- evita warnings del abreviado (no tocar nada de tu JSON real)
  // **Reemplaza este bloque por tu PLAN completo si lo prefieres**.
  // Si quieres exactamente el que ya venías usando, déjalo tal cual en tu repo.

  /* Estado */
  const KEY='malla-medicina-notegood', NOTES_KEY='malla-medicina-notes', GRADES_KEY='malla-medicina-grades';
  const estado=load(KEY,{}), notas=load(NOTES_KEY,{}), grades=load(GRADES_KEY,{});
  function load(k,f){ try{ return JSON.parse(localStorage.getItem(k)||JSON.stringify(f)); }catch{ return f; } }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }

  /* Cloud */
  const progressRef=()=> auth.currentUser? db.collection('progress').doc(auth.currentUser.uid): null;
  async function cloudLoad(){ const r=progressRef(); if(!r) return null; const s=await r.get(); return s.exists? s.data(): null; }
  let saveTimer=null;
  function cloudSaveDebounced(payload,ms=600){
    const ref=progressRef(); if(!ref) return;
    clearTimeout(saveTimer);
    saveTimer=setTimeout(async()=>{ try{
      await ref.set({...payload, updatedAt: firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    }catch(e){ console.error(e); toast('Problema al guardar en la nube ❌', 2500); }}, ms);
  }

  /* Requisitos */
  const idsTrienio1=()=>{ const out=[]; PLAN.slice(0,3).forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out; };
  const idsTodoAntes=()=>{ const out=[]; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>out.push(m.id)))); return out.filter(id=>id!=='INTO'); };
  const TRIENIO1=idsTrienio1(), TODO_ANTES=idsTodoAntes();
  const NAME=(()=>{ const map={}; PLAN.forEach(a=>a.semestres.forEach(s=>s.materias.forEach(m=>map[m.id]=m.nombre))); return map; })();
  const isOk=id=>!!estado[id];
  function normReq(m){ const req={allOf:[],oneOf:[]}; if(Array.isArray(m.previas)) req.allOf.push(...m.previas); if(m.req?.allOf) req.allOf.push(...m.req.allOf); if(m.req?.oneOf) req.oneOf.push(...m.req.oneOf); req.allOf=req.allOf.flatMap(id=> id==='__TRIENIO1__'?TRIENIO1: id==='__TODO_ANTES__'?TODO_ANTES: [id]); return req; }
  const cumple=req=> (req.allOf||[]).every(id=>isOk(id)) && (!(req.oneOf||[]).length || (req.oneOf||[]).some(g=>g.some(id=>isOk(id))));
  function faltantes(req){ const faltAll=(req.allOf||[]).filter(id=>!isOk(id)); const grupos=(req.oneOf||[]).map(g=>g.some(id=>isOk(id))?null:g).filter(Boolean); const n=id=>NAME[id]||id; const parts=[]; if(faltAll.length) parts.push("Te falta aprobar:\n• "+faltAll.map(n).join("\n• ")); if(grupos.length) parts.push("Y al menos 1 de:\n• "+grupos[0].map(n).join("\n• ")); return parts.join("\n\n"); }

  /* Toasts (1 OK) */
  function ensureToasts(){ if(!document.querySelector('.toast-container')){ const tc=document.createElement('div'); tc.className='toast-container'; document.body.appendChild(tc);} }
  function toast(txt,ms=5000){ ensureToasts(); const tc=document.querySelector('.toast-container'); while(tc.children.length>=3) tc.firstElementChild.remove(); const t=document.createElement('div'); t.className='toast'; t.innerHTML=`<span class="t-msg">${txt}</span> <button class="ok" aria-label="Cerrar">OK</button>`; t.addEventListener('click',e=>{ if(e.target.classList.contains('ok')||e.currentTarget===t) t.remove(); }); tc.appendChild(t); setTimeout(()=>t.remove(),ms); }

  /* Confetti full-screen y lento */
  const EMOJIS=["🎉","✨","🎈","🎊","💫","⭐","💜","🩺","💉","🧪","🧬","🩸","🏥","🧠","🫀","🫁","💊"];
  function confettiBurst(n=120, spread=0.42){
    const root=document.getElementById('confetti'); if(!root) return;
    const W=innerWidth, H=innerHeight, CX=W*0.5, CY=H*0.22;
    for(let i=0;i<n;i++){
      const el=document.createElement('span'); el.className='confetti-piece';
      el.textContent=EMOJIS[(Math.random()*EMOJIS.length)|0];
      const a=(Math.random()*Math.PI*2), r=(Math.random()*60-30);
      const x=CX+Math.cos(a)*r, y=CY+Math.sin(a)*r;
      const dx=(Math.random()*W*spread - W*spread/2);
      const dy=(H*0.6 + Math.random()*H*0.4);
      el.style.setProperty('--x',x+'px'); el.style.setProperty('--y',y+'px');
      el.style.setProperty('--dx',dx+'px'); el.style.setProperty('--dy',dy+'px');
      root.appendChild(el);
      setTimeout(()=>el.remove(),2200);
    }
  }

  /* Render */
  function render(){
    const cont=document.getElementById('malla'); if(!cont) return;
    cont.innerHTML=''; let total=0, aprob=0;

    PLAN.forEach((anio,idx)=>{
      const col=document.createElement('div'); col.className='year y'+Math.min(idx+1,7);
      const h2=document.createElement('h2'); h2.textContent=yearLabel(idx); col.appendChild(h2);

      anio.semestres.forEach(sem=>{
        const box=document.createElement('div'); box.className='semestre';
        const h3=document.createElement('h3'); h3.textContent=sem.numero; box.appendChild(h3);

        sem.materias.forEach(m=>{
          total++;
          const div=document.createElement('div'); div.className='materia'; div.dataset.id=m.id;

          const title=document.createElement('span'); title.className='title'; title.textContent=m.nombre; div.appendChild(title);

          const actions=document.createElement('div'); actions.className='actions';

          const gradeVal=grades[m.id];
          if(typeof gradeVal==='number' && !Number.isNaN(gradeVal)){
            const chip=document.createElement('span'); chip.className='grade-chip '+(gradeVal>=11?'grade-high':(gradeVal>=7?'grade-mid':'grade-low')); chip.textContent=`Nota: ${gradeVal}`; actions.appendChild(chip);
          }

          const nb=document.createElement('button'); nb.className='note-btn'; nb.type='button'; nb.innerHTML=`<span class="nb-label">Notas</span>`;
          nb.addEventListener('click',ev=>{ ev.stopPropagation(); openNote(m.id,m.nombre); });
          actions.appendChild(nb);

          div.appendChild(actions);

          const req=normReq(m);
          const done=!!estado[m.id]; if(done){ div.classList.add('tachada'); aprob++; }
          const bloqueada=!cumple(req);
          if(bloqueada){ div.classList.add('bloqueada'); const tip=faltantes(req); if(tip) div.setAttribute('data-tip',tip); }
          if ((notas[m.id] && notas[m.id].trim()) || (typeof gradeVal==='number')) div.classList.add('has-note');

          div.addEventListener('click', ()=>{
            if(div.classList.contains('bloqueada')) return;
            const was=!!estado[m.id]; estado[m.id]=!was; save(KEY,estado);
            if(auth.currentUser) cloudSaveDebounced({estado,notas,grades});
            if(!was && estado[m.id]){ toast(frasePara(m.nombre)); confettiBurst(120); }
            render();
          });

          box.appendChild(div);
        });
        col.appendChild(box);
      });

      cont.appendChild(col);
    });

    const pct= total? Math.round(aprob/total*100): 0;
    const copy=progressCopy(pct);

    const p=document.getElementById('progressText'); if(p) p.textContent=`${aprob} / ${total} materias aprobadas · ${pct}% — Tu avance: ${pct}% 💪 ¡Bien hecho!`;
    const bar=document.getElementById('progressBar'); if(bar){ const col=pct<=25?'#ff6b6b':(pct<=75?'#ff9f68':'#4ade80'); bar.style.width=pct+'%'; bar.style.background=`linear-gradient(90deg, ${col}, ${col})`; }
    const pctEl=document.getElementById('progressPct'); if(pctEl) pctEl.textContent=pct+'%';
    const msg=document.getElementById('progressMsg'); if(msg) msg.textContent=copy;

    if(pct===100) confettiBurst(160);
  }

  /* Modal Notas */
  let currentNoteId=null;
  const modal=document.getElementById('noteModal'), noteTitle=document.getElementById('noteTitle'), noteText=document.getElementById('noteText'), gradeInput=document.getElementById('gradeInput'), saveNoteBtn=document.getElementById('saveNoteBtn');

  function openNote(id,nombre){
    currentNoteId=id;
    if(noteTitle) noteTitle.textContent=`Notas — ${nombre}`;
    if(noteText) noteText.value=notas[id]||'';
    if(gradeInput) gradeInput.value=(typeof grades[id]==='number'&&!Number.isNaN(grades[id]))? String(grades[id]): '';
    if(modal?.showModal) modal.showModal(); else modal?.setAttribute('open','');
  }

  saveNoteBtn?.addEventListener('click',e=>{
    e.preventDefault(); if(!currentNoteId) return;
    if(noteText){ notas[currentNoteId]=noteText.value||''; save(NOTES_KEY,notas); }
    if(gradeInput){ const raw=gradeInput.value.trim(); if(raw===''){ delete grades[currentNoteId]; } else { let n=Number(raw); if(Number.isFinite(n)){ if(n<0)n=0; if(n>12)n=12; grades[currentNoteId]=Math.round(n); } } save(GRADES_KEY,grades); }
    if(auth.currentUser) cloudSaveDebounced({estado,notas,grades});
    try{ modal?.close(); }catch{ modal?.removeAttribute('open'); }
    currentNoteId=null; toast('Notas guardadas ✅',2000); render();
  });
  modal?.addEventListener('close',()=>{ currentNoteId=null; });

  /* Tema + Reset */
  const toggleTheme=()=>{ document.body.classList.toggle('dark'); };
  document.getElementById('themeToggle')?.addEventListener('click',toggleTheme);
  document.getElementById('resetBtn')?.addEventListener('click',async()=>{
    if(!confirm('¿Seguro que quieres borrar TODO tu avance, notas y calificaciones?')) return;
    localStorage.removeItem(KEY); localStorage.removeItem(NOTES_KEY); localStorage.removeItem(GRADES_KEY);
    for(const k of Object.keys(estado)) delete estado[k]; for(const k of Object.keys(notas)) delete notas[k]; for(const k of Object.keys(grades)) delete grades[k];
    if(auth.currentUser){ try{ await progressRef().set({estado:{},notas:{},grades:{},updatedAt: firebase.firestore.FieldValue.serverTimestamp()}); }catch{} }
    toast('Se reinició tu avance 💫',2500); render();
  });

  /* Onboarding una vez */
  const welcome=document.getElementById('welcomeModal'), gotIt=document.getElementById('gotItBtn');
  if(localStorage.getItem('ng-onboarded')!=='1'){ if(welcome?.showModal) welcome.showModal(); else welcome?.setAttribute('open',''); }
  gotIt?.addEventListener('click',()=>{ localStorage.setItem('ng-onboarded','1'); try{ welcome?.close(); }catch{ welcome?.removeAttribute('open'); } });

  /* Auth */
  const loginBtn=document.getElementById('loginGoogle'), logoutBtn=document.getElementById('logoutBtn'), badge=document.getElementById('userBadge');
  loginBtn?.addEventListener('click', async()=>{ try{ await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }catch(e){ console.error(e); toast('No se pudo iniciar sesión ❌',2500); }});
  logoutBtn?.addEventListener('click', async()=>{ await auth.signOut(); location.href='index.html'; });

  auth.onAuthStateChanged(async user=>{
    if(!user){ location.href='index.html?redirect=malla.html'; return; }
    const first=(user.displayName||user.email||'Usuario').split(' ')[0];
    if(badge){ badge.style.display=''; badge.textContent=`Hola, ${first}`; }
    if(logoutBtn) logoutBtn.style.display='';
    if(loginBtn)  loginBtn.style.display='none';

    await upsertUserProfile(user);

    const cloud=await cloudLoad();
    if(cloud && (cloud.estado||cloud.notas||cloud.grades)){
      Object.assign(estado,cloud.estado||{}); Object.assign(notas,cloud.notas||{}); Object.assign(grades,cloud.grades||{});
      save(KEY,estado); save(NOTES_KEY,notas); save(GRADES_KEY,grades);
    }
    render();
    toast('Sesión iniciada ☁️',1600);
  });

  document.addEventListener('DOMContentLoaded', render);
}
