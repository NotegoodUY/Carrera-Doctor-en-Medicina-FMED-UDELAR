// Utilidad: cargar JSON
async function loadCurriculum(){
  const res = await fetch('data/curriculum.json');
  if(!res.ok) throw new Error('No se pudo cargar data/curriculum.json');
  return res.json();
}

const els = {
  q: null, year: null, sem: null, type: null, grid: null, stats: null,
  clear: null, onlyFavs: null, modal: null,
  m: { title:null, code:null, year:null, sem:null, type:null, credits:null, area:null, hours:null, desc:null, pr:null, co:null, notes:null },
  totalSubjects: null, visibleCredits: null, planName: null, downloadJSON: null
};

const state = { data:null, filtered:[], favs:new Set(JSON.parse(localStorage.getItem('med-favs')||'[]')) };

function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function bind(){
  els.q.addEventListener('input', applyFilters);
  [els.year, els.sem, els.type, els.onlyFavs].forEach(el=>el.addEventListener('change', applyFilters));
  els.clear.addEventListener('click', ()=>{
    els.q.value=''; els.year.value=''; els.sem.value=''; els.type.value=''; els.onlyFavs.checked=false; applyFilters();
  });
  $('#m-close').addEventListener('click', ()=>els.modal.close());
  els.downloadJSON.addEventListener('click', (e)=>{
    e.preventDefault();
    const blob = new Blob([JSON.stringify(state.data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download='curriculum.json'; a.click();
    URL.revokeObjectURL(url);
  });
}

function normalize(s){ return (s||'').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''); }

function applyFilters(){
  const q = normalize(els.q.value);
  const fy = els.year.value; const fs = els.sem.value; const ft = els.type.value; const onlyFavs = els.onlyFavs.checked;

  state.filtered = state.data.subjects.filter(s=>{
    const hayQ = !q || [s.name,s.area,s.code].some(v=>normalize(v).includes(q));
    const hayY = !fy || String(s.year)===fy;
    const hayS = !fs || String(s.semester)===fs;
    const hayT = !ft || s.type===ft;
    const hayF = !onlyFavs || state.favs.has(s.id);
    return hayQ && hayY && hayS && hayT && hayF;
  });

  render();
}

function render(){
  const grid = els.grid; grid.innerHTML='';
  const tpl = $('#card-tpl');

  let visibleCredits = 0;

  state.filtered.forEach(s=>{
    visibleCredits += Number(s.credits||0);
    const node = tpl.content.cloneNode(true);
    const art = node.querySelector('.card'); art.dataset.id = s.id;
    node.querySelector('.code').textContent = s.code || s.id;
    node.querySelector('.name').textContent = s.name;

    node.querySelector('.year').textContent = `Año ${s.year}`;
    node.querySelector('.sem').textContent = (s.semester==='A'?'Anual':`Sem ${s.semester}`);

    const type = node.querySelector('.type');
    type.textContent = s.type.charAt(0).toUpperCase()+s.type.slice(1);

    node.querySelector('.credits').textContent = `${s.credits} cr`;
    node.querySelector('.area').textContent = s.area || '';

    const pr = node.querySelector('.prereq');
    (s.prereq||[]).forEach(pid=>{
      const tag = document.createElement('span');
      tag.className='tag';
      const pSub = state.data.subjects.find(x=>x.id===pid);
      tag.textContent = pSub ? pSub.name : pid;
      tag.title = 'Prerequisito';
      tag.addEventListener('click', ()=>highlightPrereq(pid));
      pr.appendChild(tag);
    });

    // fav
    const favBtn = node.querySelector('.fav');
    if(state.favs.has(s.id)) favBtn.classList.add('active');
    favBtn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      if(state.favs.has(s.id)) state.favs.delete(s.id); else state.favs.add(s.id);
      localStorage.setItem('med-favs', JSON.stringify([...state.favs]));
      applyFilters();
    });

    // modal
    node.querySelector('.more').addEventListener('click', ()=>openModal(s));

    grid.appendChild(node);
  });

  els.totalSubjects.textContent = state.data.subjects.length;
  els.visibleCredits.textContent = visibleCredits;

  // stats
  const n = state.filtered.length;
  const types = countBy(state.filtered, s=>s.type);
  const years = countBy(state.filtered, s=>s.year);
  els.stats.innerHTML = `
    <span>Mostrando <strong>${n}</strong> materias</span>
    <span>·</span>
    <span>Tipos: oblig ${types.obligatoria||0} · opt ${types.optativa||0} · elect ${types.electiva||0}</span>
    <span>·</span>
    <span>Años visibles: ${Object.keys(years).sort().join(', ')||'—'}</span>`;
}

function countBy(arr, fn){
  return arr.reduce((acc,x)=>{ const k=fn(x); acc[k]=(acc[k]||0)+1; return acc; },{});
}

function highlightPrereq(id){
  $all('.card').forEach(c=>{
    c.style.outline = (c.dataset.id===id)? '2px solid #5bbcff' : '';
  });
}

function openModal(s){
  els.m.title.textContent = s.name;
  els.m.code.textContent = s.code || s.id;
  els.m.year.textContent = s.year;
  els.m.sem.textContent = (s.semester==='A'?'Anual':s.semester);
  els.m.type.textContent = s.type;
  els.m.credits.textContent = s.credits;
  els.m.area.textContent = s.area||'—';
  els.m.hours.textContent = s.hours||'—';
  els.m.desc.textContent = s.description||'—';
  els.m.pr.textContent = (s.prereq||[]).map(pid=>{
    const p = state.data.subjects.find(x=>x.id===pid); return p? p.name : pid;
  }).join(', ') || '—';
  els.m.co.textContent = (s.correlatives||[]).map(pid=>{
    const p = state.data.subjects.find(x=>x.id===pid); return p? p.name : pid;
  }).join(', ') || '—';
  els.m.notes.textContent = s.notes||'—';
  els.modal.showModal();
}

async function main(){
  els.q = $('#q'); els.year = $('#f-year'); els.sem = $('#f-sem'); els.type = $('#f-type');
  els.grid = $('#grid'); els.stats = $('#stats'); els.clear = $('#clear'); els.onlyFavs = $('#onlyFavs');
  els.modal = $('#modal');
  els.m.title=$('#m-title'); els.m.code=$('#m-code'); els.m.year=$('#m-year'); els.m.sem=$('#m-sem'); els.m.type=$('#m-type'); els.m.credits=$('#m-credits'); els.m.area=$('#m-area'); els.m.hours=$('#m-hours'); els.m.desc=$('#m-desc'); els.m.pr=$('#m-pr'); els.m.co=$('#m-co'); els.m.notes=$('#m-notes');
  els.totalSubjects = $('#totalSubjects'); els.visibleCredits = $('#visibleCredits'); els.planName = $('#planName');
  els.downloadJSON = $('#downloadJSON');

  bind();

  state.data = await loadCurriculum();
  els.planName.textContent = state.data.plan || '—';
  state.filtered = state.data.subjects;
  render();
}

main().catch(err=>{
  console.error(err);
  alert('Error inicializando la malla. Revisá la consola.');
});
