async function loadCurriculum(){
  const res = await fetch('data/curriculum.json');
  if(!res.ok) throw new Error('No se pudo cargar data/curriculum.json');
  return res.json();
}

const els = {
  grid: null,
  modal: null,
  m: { title:null, code:null, year:null, sem:null, type:null, credits:null, area:null, hours:null, desc:null, pr:null, co:null, notes:null },
  totalSubjects: null, planName: null, downloadJSON: null
};

const state = { data:null };

function $(sel, root=document){ return root.querySelector(sel); }

function bind(){
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

function render(){
  const grid = els.grid; grid.innerHTML='';
  const tpl = $('#card-tpl');

  state.data.subjects.forEach(s=>{
    const node = tpl.content.cloneNode(true);
    node.querySelector('.card').dataset.id = s.id;
    node.querySelector('.code').textContent = s.code || s.id;
    node.querySelector('.name').textContent = s.name;
    node.querySelector('.year').textContent = `Año ${s.year}`;
    node.querySelector('.sem').textContent = (s.semester==='A'?'Anual':`Sem ${s.semester}`);
    node.querySelector('.type').textContent = s.type.charAt(0).toUpperCase()+s.type.slice(1);
    node.querySelector('.credits').textContent = `${s.credits} cr`;
    node.querySelector('.area').textContent = s.area || '';

    const pr = node.querySelector('.prereq');
    (s.prereq||[]).forEach(pid=>{
      const tag = document.createElement('span');
      tag.className='tag';
      const pSub = state.data.subjects.find(x=>x.id===pid);
      tag.textContent = pSub ? pSub.name : pid;
      tag.title = 'Prerequisito';
      pr.appendChild(tag);
    });

    node.querySelector('.more').addEventListener('click', ()=>openModal(s));
    grid.appendChild(node);
  });

  els.totalSubjects.textContent = state.data.subjects.length;
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
  els.grid = $('#grid'); els.modal = $('#modal');
  els.m.title=$('#m-title'); els.m.code=$('#m-code'); els.m.year=$('#m-year'); els.m.sem=$('#m-sem');
  els.m.type=$('#m-type'); els.m.credits=$('#m-credits'); els.m.area=$('#m-area'); els.m.hours=$('#m-hours');
  els.m.desc=$('#m-desc'); els.m.pr=$('#m-pr'); els.m.co=$('#m-co'); els.m.notes=$('#m-notes');
  els.totalSubjects = $('#totalSubjects'); els.planName = $('#planName');
  els.downloadJSON = $('#downloadJSON');

  bind();

  state.data = await loadCurriculum();
  els.planName.textContent = state.data.plan || '—';
  render();
}

main().catch(err=>{
  console.error(err);
  alert('Error inicializando la malla. Revisá la consola.');
});
