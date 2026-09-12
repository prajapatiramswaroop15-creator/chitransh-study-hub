(function(){
  const {createClient}=window.supabase;const url=window.SUPABASE_URL,key=window.SUPABASE_PUBLISHABLE_KEY;
  const authPanel=document.getElementById('authPanel'), adminPanel=document.getElementById('adminPanel'), msg=document.getElementById('msg'), authMessage=document.getElementById('authMessage');
  if(!url||url.includes('PASTE_')||!key||key.includes('PASTE_')){authMessage.textContent='Pehle config.js mein Supabase URL aur Publishable key paste karo.';return;}
  const sb=createClient(url,key);
  async function isAdmin(){const {data:{user}}=await sb.auth.getUser();if(!user)return false;const {data,error}=await sb.from('profiles').select('role').eq('id',user.id).maybeSingle();return !error&&data?.role==='admin';}
  async function refresh(){const admin=await isAdmin();authPanel.classList.toggle('hidden',admin);adminPanel.classList.toggle('hidden',!admin);if(admin)loadContent();}
  document.getElementById('authForm').addEventListener('submit',async e=>{e.preventDefault();authMessage.textContent='Login ho raha hai…';const {error}=await sb.auth.signInWithPassword({email:email.value.trim(),password:password.value});authMessage.textContent=error?error.message:'Login successful.';if(!error)refresh();});
  document.getElementById('signupBtn').addEventListener('click',async()=>{authMessage.textContent='Account create ho raha hai…';const {data,error}=await sb.auth.signUp({email:email.value.trim(),password:password.value});authMessage.textContent=error?error.message:(data.session?'Account created.':'Account created. Email confirmation setting ke hisaab se inbox check karo.');});
  document.getElementById('logoutBtn').addEventListener('click',async()=>{await sb.auth.signOut();location.reload();});
  async function loadContent(){const {data:tests,error}=await sb.from('tests').select('id,name,exam,duration_minutes,negative_marking').order('created_at',{ascending:false});if(error){msg.textContent=error.message;return;}document.getElementById('statTests').textContent=tests.length;document.getElementById('questionTest').innerHTML=tests.length?tests.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join(''):'<option value="">Pehle test banao</option>'; document.getElementById('bulkTest').innerHTML=tests.length?tests.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join(''):'<option value="">Pehle test banao</option>';let total=0;let html='';for(const t of tests){const {data:qs}=await sb.from('questions').select('id,question_text,correct_option,question_order').eq('test_id',t.id).order('question_order');total+=(qs||[]).length;html+=`<div class="admin-item"><div class="item-row"><div><div class="item-title">TEST: ${esc(t.name)}</div><div class="item-meta">${esc(t.exam)} • ${t.duration_minutes} min • −${Number(t.negative_marking).toFixed(3)} • ${(qs||[]).length} Q</div></div><button class="danger" data-del-test="${t.id}">Delete Test</button></div></div>`;(qs||[]).forEach(q=>html+=`<div class="admin-item"><div class="item-row"><div><div class="item-title">Q${q.question_order}: ${esc(q.question_text)}</div><div class="item-meta">Correct: ${String.fromCharCode(65+q.correct_option)}</div></div><button class="danger" data-del-q="${q.id}">Delete Q</button></div></div>`)}document.getElementById('statQuestions').textContent=total;document.getElementById('manageList').innerHTML=html||'<p>No content yet.</p>';document.querySelectorAll('[data-del-test]').forEach(b=>b.onclick=()=>deleteTest(b.dataset.delTest));document.querySelectorAll('[data-del-q]').forEach(b=>b.onclick=()=>deleteQ(b.dataset.delQ));}
  document.getElementById('testForm').addEventListener('submit',async e=>{e.preventDefault();msg.textContent='Saving test…';const {error}=await sb.from('tests').insert({name:testName.value.trim(),exam:testExam.value,duration_minutes:Number(testTime.value),negative_marking:Number(negative.value)});msg.textContent=error?error.message:'Test added online ✅';if(!error){e.target.reset();testTime.value=30;negative.value='0.333';loadContent();}});
  document.getElementById('questionForm').addEventListener('submit',async e=>{e.preventDefault();const testId=questionTest.value;if(!testId){msg.textContent='Pehle test create karo.';return;}msg.textContent='Saving question…';const {error}=await sb.from('questions').insert({test_id:testId,question_text:questionText.value.trim(),option_a:optA.value.trim(),option_b:optB.value.trim(),option_c:optC.value.trim(),option_d:optD.value.trim(),correct_option:Number(correct.value),explanation:explanation.value.trim(),question_order:Number(questionOrder.value)});msg.textContent=error?error.message:'Question added online ✅';if(!error){e.target.reset();questionOrder.value=1;loadContent();}});
  async function deleteTest(id){if(!confirm('Test aur uske questions delete karne hain?'))return;const {error}=await sb.from('tests').delete().eq('id',id);msg.textContent=error?error.message:'Test deleted';if(!error)loadContent();}
  async function deleteQ(id){if(!confirm('Question delete karna hai?'))return;const {error}=await sb.from('questions').delete().eq('id',id);msg.textContent=error?error.message:'Question deleted';if(!error)loadContent();}

  function parseCSV(text){
    const rows=[]; let row=[], cell='', quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i], n=text[i+1];
      if(c==='"'){
        if(quoted && n==='"'){cell+='"';i++;} else quoted=!quoted;
      }else if(c===','&&!quoted){row.push(cell);cell='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);cell='';if(row.some(v=>v.trim()!==''))rows.push(row);row=[];}
      else cell+=c;
    }
    if(cell!==''||row.length){row.push(cell);if(row.some(v=>v.trim()!==''))rows.push(row);}
    return rows;
  }
  function correctValue(v){const x=String(v).trim().toUpperCase();return x==='A'||x==='0'?0:x==='B'||x==='1'?1:x==='C'||x==='2'?2:x==='D'||x==='3'?3:-1;}
  document.getElementById('downloadTemplate').addEventListener('click',()=>{
    const csv='question,option_a,option_b,option_c,option_d,correct,explanation,question_order\n"576 ko 4 se bhag dene par kya milega?","124","144","154","164","B","576 ÷ 4 = 144.",1\n"25 ka 4 guna kitna hoga?","50","75","100","125","C","25 × 4 = 100.",2\n';
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='chitransh_questions_template.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  });
  document.getElementById('bulkForm').addEventListener('submit',async e=>{
    e.preventDefault(); const status=document.getElementById('bulkStatus'); const testId=document.getElementById('bulkTest').value; const file=document.getElementById('csvFile').files[0];
    if(!testId||!file){status.textContent='Test aur CSV file select karo.';return;}
    status.textContent='CSV read ho rahi hai…';
    try{
      const rows=parseCSV(await file.text()); if(rows.length<2){status.textContent='CSV mein data rows nahi hain.';return;}
      const headers=rows[0].map(x=>x.trim().toLowerCase()); const required=['question','option_a','option_b','option_c','option_d','correct']; const missing=required.filter(k=>!headers.includes(k));
      if(missing.length){status.textContent='Missing columns: '+missing.join(', ');return;}
      const ix=Object.fromEntries(headers.map((h,i)=>[h,i])); const payload=[]; const errors=[];
      rows.slice(1).forEach((r,ri)=>{const q=(r[ix.question]||'').trim(),a=(r[ix.option_a]||'').trim(),b=(r[ix.option_b]||'').trim(),c=(r[ix.option_c]||'').trim(),d=(r[ix.option_d]||'').trim(),co=correctValue(r[ix.correct]||''),order=ix.question_order!==undefined&&String(r[ix.question_order]||'').trim()?Number(r[ix.question_order]):ri+1;if(!q||!a||!b||!c||!d)errors.push(`Row ${ri+2}: question/options missing`);else if(co<0)errors.push(`Row ${ri+2}: correct invalid`);else if(!Number.isInteger(order)||order<1)errors.push(`Row ${ri+2}: question_order invalid`);else payload.push({test_id:testId,question_text:q,option_a:a,option_b:b,option_c:c,option_d:d,correct_option:co,explanation:(r[ix.explanation]||'').trim(),question_order:order});});
      if(errors.length){status.textContent='Upload stopped: '+errors.slice(0,5).join(' | ')+(errors.length>5?' …':'');return;}
      status.textContent=`${payload.length} questions upload ho rahe hain…`;
      const {error}=await sb.from('questions').insert(payload); if(error){status.textContent=error.message;return;}
      status.textContent=`✅ ${payload.length} questions successfully added online.`; document.getElementById('csvFile').value=''; loadContent();
    }catch(err){status.textContent='CSV upload error: '+err.message;}
  });
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  refresh();
})();
