
// Simple collapsible tree renderer (vertical)
// Expects data.json in same folder.
async function loadData(){ 
  const res = await fetch('data.json');
  const data = await res.json();
  return data;
}

function createNodeEl(node, level=0){
  const el = document.createElement('div');
  el.className = 'node lvl-' + Math.min(level,2);
  el.textContent = node.name;
  el.dataset.name = node.name;
  el.dataset.level = level;
  el.tabIndex = 0;

  el.addEventListener('click', (e)=>{
    e.stopPropagation();
    showInfo(node);
    // toggle children
    const branch = el.nextElementSibling;
    if(branch && branch.classList.contains('tree-branch')){
      branch.style.display = branch.style.display === 'none' ? '' : 'none';
    }
  });
  el.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') el.click();
  });
  return el;
}

function renderBranch(node, container, level=0){
  const nodeEl = createNodeEl(node, level);
  container.appendChild(nodeEl);
  if(node.children && node.children.length){
    const branch = document.createElement('div');
    branch.className = 'tree-branch';
    // initially collapsed except top level
    branch.style.display = level === 0 ? '' : 'none';
    node.children.forEach(child => renderBranch(child, branch, level+1));
    container.appendChild(branch);
  }
}

function showInfo(node){
  const title = document.getElementById('nodeTitle');
  const desc = document.getElementById('nodeDesc');
  title.textContent = node.name || '—';
  // Description: try to show level/type if available
  let d = '';
  if(node.title) d += '<p>' + node.title + '</p>';
  if(node.children && node.children.length) d += '<p><strong>Contiene ' + node.children.length + ' subunidades</strong></p>';
  d += '<p class="footer-small">Fuente: Ministerio del Interior — Marzo 2024.</p>';
  desc.innerHTML = d;
}

// Search
function searchNodes(term){
  term = term.trim().toLowerCase();
  const nodes = document.querySelectorAll('.node');
  nodes.forEach(n=>{
    const name = n.dataset.name.toLowerCase();
    if(!term) {
      n.style.display = '';
    } else {
      n.style.display = name.includes(term) ? '' : 'none';
    }
  });
}

// Expand / Collapse all
function setAllBranches(expand=true){
  const branches = document.querySelectorAll('.tree-branch');
  branches.forEach(b=> b.style.display = expand ? '' : 'none');
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const data = await loadData();
  const tree = document.getElementById('tree');
  renderBranch(data, tree, 0);
  // wire controls
  document.getElementById('search').addEventListener('input', (e)=>{
    const val = e.target.value;
    if(!val) {
      // show all nodes and preserve branches collapsed state
      document.querySelectorAll('.node').forEach(n=>n.style.display='');
    } else {
      searchNodes(val);
      // expand all to help find matches
      setAllBranches(true);
    }
  });
  document.getElementById('expandAll').addEventListener('click', ()=> setAllBranches(true));
  document.getElementById('collapseAll').addEventListener('click', ()=> setAllBranches(false));

  // Accessibility: focus first node
  const first = document.querySelector('.node');
  if(first) first.focus();
});
