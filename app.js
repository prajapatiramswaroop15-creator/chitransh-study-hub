(function(){
  const { createClient } = window.supabase;
  const url = window.SUPABASE_URL, key = window.SUPABASE_PUBLISHABLE_KEY;
  const grid=document.getElementById('testGrid');
  document.getElementById('year').textContent=new Date().getFullYear();
  if(!url || url.includes('PASTE_') || !key || key.includes('PASTE_')) { grid.innerHTML='<article class="card"><h4>Supabase setup pending</h4><p>config.js mein API URL aur Publishable key paste karo.</p></article>'; return; }
  const client=createClient(url,key);
  async function load(){
    const {data,error}=await client.from('tests').select('id,name,exam,duration_minutes,negative_marking').order('created_at',{ascending:false});
    if(error){grid.innerHTML=`<article class="card"><h4>Tests load nahi hue</h4><p>${error.message}</p></article>`;return;}
    document.getElementById('testCount').textContent=`${data.length} Tests`;
    grid.innerHTML=data.length?data.map(t=>`<article class="card"><span class="tag">${escapeHtml(t.exam)}</span><h4>${escapeHtml(t.name)}</h4><p>Online test with timer aur automatic result.</p><div class="meta"><span>⏱ ${t.duration_minutes} min</span><span>−${Number(t.negative_marking).toFixed(3)} wrong</span></div><a class="btn primary" href="test.html?id=${encodeURIComponent(t.id)}">Start Test</a></article>`).join(''):'<article class="card"><h4>No tests yet</h4><p>Admin Panel se pehla test add karo.</p><a class="btn primary" href="admin.html">Open Admin</a></article>';
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  load();
})();
