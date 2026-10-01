import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const loginBox=document.querySelector('#loginBox'), adminBox=document.querySelector('#adminBox'), msg=document.querySelector('#msg');
async function state(){const {data:{session}}=await db.auth.getSession();if(session){loginBox.classList.add('hidden');adminBox.classList.remove('hidden');loadItems()}}
document.querySelector('#login').onclick=async()=>{const email=document.querySelector('#email').value,password=document.querySelector('#password').value;const {error}=await db.auth.signInWithPassword({email,password});document.querySelector('#loginMsg').textContent=error?error.message:'Entrando...';if(!error)state()};
document.querySelector('#logout').onclick=async()=>{await db.auth.signOut();location.reload()};
document.querySelector('#upload').onclick=async()=>{msg.textContent='Subiendo...';const {data:{user}}=await db.auth.getUser();if(!user){msg.textContent='Debes iniciar sesión.';return}
const id=document.querySelector('#itemId').value.trim(),name=document.querySelector('#name').value.trim(),file=document.querySelector('#image').files[0];
if(!id||!file){msg.textContent='Falta el ID o la imagen.';return}
const ext=file.name.split('.').pop().toLowerCase(),path=`${crypto.randomUUID()}.${ext}`;
const up=await db.storage.from('images').upload(path,file,{upsert:false});if(up.error){msg.textContent=up.error.message;return}
const {data:urlData}=db.storage.from('images').getPublicUrl(path);
const ins=await db.from('items').insert({item_id:id,name,image_url:urlData.publicUrl,storage_path:path});if(ins.error){await db.storage.from('images').remove([path]);msg.textContent=ins.error.message;return}
msg.textContent='Publicado correctamente.';document.querySelector('#itemId').value='';document.querySelector('#name').value='';document.querySelector('#image').value='';loadItems()};
async function loadItems(){const box=document.querySelector('#items');const {data,error}=await db.from('items').select('*').order('created_at',{ascending:false});if(error){box.textContent=error.message;return}box.innerHTML=(data||[]).map(x=>`<div class="admin-item"><img src="${x.image_url}"><div style="flex:1"><b>ID: ${escapeHtml(x.item_id)}</b><br><span>${escapeHtml(x.name||'')}</span></div><button class="danger" data-id="${x.id}" data-path="${x.storage_path}">Eliminar</button></div>`).join('')||'<p>No hay contenido.</p>';box.querySelectorAll('.danger').forEach(b=>b.onclick=()=>removeItem(b.dataset.id,b.dataset.path))}
async function removeItem(id,path){if(!confirm('¿Eliminar este elemento?'))return;await db.from('items').delete().eq('id',id);if(path)await db.storage.from('images').remove([path]);loadItems()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
state();
