
// Load data and render a vertical collapsible interactive tree with individual study mode
async function loadData(){ const r = await fetch('data.json'); return await r.json(); }

function createNode(node, level=0){
  const el = document.createElement('div');
  el.className = 'node lvl-' + Math.min(level,2);
  const left = document.createElement('div'); left.className='left';
  const name = document.createElement('div'); name.className='name'; name.textContent = node.name;
  left.appendChild(name);
  el.appendChild(left);

  const actions = document.createElement('div'); actions.className='actions';
  // expand icon if children
  if(node.children && node.children.length){
    const btn = document.createElement('button'); btn.className='toggle'; btn.textContent = '▸';
    btn.title = 'Expandir/Contraer';
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const branch = el.nextElementSibling;
      if(branch && branch.classList.contains('tree-branch')){
        if(branch.style.display === 'none'){ branch.style.display = ''; btn.textContent='▾'; }
        else { branch.style.display = 'none'; btn.textContent='▸'; }
      }
    });
    actions.appendChild(btn);
  }
  // study button
  const study = document.createElement('button'); study.className='study'; study.textContent = '🎓';
  study.title = 'Mostrar/Ocultar descripción en la ficha lateral y marcar como estudiada';
  study.addEventListener('click',(e)=>{
    e.stopPropagation();
    showInfo(node, true);
    markStudied(node);
  });
  actions.appendChild(study);

  el.appendChild(actions);
  el.addEventListener('click', ()=> showInfo(node,false));
  return el;
}

function renderBranch(node, container, level=0){
  const n = createNode(node, level);
  container.appendChild(n);
  if(node.children && node.children.length){
    const branch = document.createElement('div'); branch.className='tree-branch'; branch.style.display = level===0 ? '' : 'none';
    node.children.forEach(ch => renderBranch(ch, branch, level+1));
    container.appendChild(branch);
  }
}

function showInfo(node, expandedByStudy=false){
  const title = document.getElementById('nodeTitle'), desc = document.getElementById('nodeDesc');
  title.textContent = node.name || '—';
  if(node.description){
    desc.innerHTML = node.description;
  } else { desc.innerHTML = '<em>Sin descripción disponible</em>'; }
}

let studiedSet = new Set();
function markStudied(node){
  if(!node || !node.name) return;
  studiedSet.add(node.name);
  document.getElementById('studiedCount').textContent = studiedSet.size;
  // visually mark nodes studied
  document.querySelectorAll('.node').forEach(n=>{
    if(n.querySelector('.name').textContent && studiedSet.has(n.querySelector('.name').textContent)){
      n.style.opacity = 0.6;
    }
  });
}

// Search with suggestions
function collectNames(list, arr){
  function w(n){ arr.push(n.name); if(n.children) n.children.forEach(w); }
  w(list);
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const data = await loadData();
  const tree = document.getElementById('tree');
  renderBranch(data, tree, 0);

  // set totals
  const names=[]; collectNames(data, names);
  document.getElementById('totalCount').textContent = names.length;

  // search
  const input = document.getElementById('search'), sugg = document.getElementById('suggestions');
  input.addEventListener('input', ()=>{
    const v = input.value.trim().toLowerCase();
    if(!v){ sugg.style.display='none'; document.querySelectorAll('.node').forEach(n=>n.style.display=''); return; }
    const matches = names.filter(n=> n.toLowerCase().includes(v)).slice(0,8);
    sugg.innerHTML='';
    if(matches.length){
      matches.forEach(m=>{
        const d = document.createElement('div'); d.textContent = m;
        d.addEventListener('click', ()=>{
          input.value = m; sugg.style.display='none'; highlightNode(m);
        });
        sugg.appendChild(d);
      });
      sugg.style.display='block';
    } else { sugg.style.display='none'; }
  });
  document.addEventListener('click', ()=>{ document.getElementById('suggestions').style.display='none'; });

  document.getElementById('expandAll').addEventListener('click', ()=> document.querySelectorAll('.tree-branch').forEach(b=>b.style.display=''));
  document.getElementById('collapseAll').addEventListener('click', ()=> document.querySelectorAll('.tree-branch').forEach(b=>b.style.display='none'));

  // highlight and open node by name
  window.highlightNode = function(name){
    document.querySelectorAll('.node').forEach(n=> n.style.background='');
    const elems = Array.from(document.querySelectorAll('.node')).filter(n=> n.querySelector('.name').textContent === name);
    if(elems.length){
      const el = elems[0];
      el.scrollIntoView({behavior:'smooth', block:'center'});
      el.style.background='linear-gradient(90deg, rgba(11,110,253,0.06), #fff)';
      document.querySelectorAll('.tree-branch').forEach(b=> b.style.display='');
      showInfo({name:name, description: findDescriptionByName(name, data)}, false);
    }
  };

  function findDescriptionByName(name, node){
    if(node.name === name) return node.description || null;
    if(node.children) for(const c of node.children){ const r = findDescriptionByName(name,c); if(r) return r; }
    return null;
  }
});
