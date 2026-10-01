import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const grid=document.querySelector('#grid'), empty=document.querySelector('#empty'), search=document.querySelector('#search');
let all=[];
async function load(){const {data,error}=await db.from('items').select('*').order('created_at',{ascending:false}); if(error){grid.innerHTML='<p>Error al cargar contenido. Revisa la configuración.</p>';return} all=data||[]; render();}
function render(){const q=(search.value||'').toLowerCase();const list=all.filter(x=>String(x.item_id).toLowerCase().includes(q)||(x.name||'').toLowerCase().includes(q));grid.innerHTML=list.map(x=>`<article class="card"><img src="${x.image_url}" alt=""><div class="info"><div class="id">ID: ${escapeHtml(x.item_id)}</div><strong>${escapeHtml(x.name||'Sin nombre')}</strong></div></article>`).join('');empty.style.display=list.length?'none':'block'}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
search.addEventListener('input',render);document.querySelector('#refresh').onclick=load;load();
