(async function(){
 const {createClient}=window.supabase; const url=window.SUPABASE_URL,key=window.SUPABASE_PUBLISHABLE_KEY;
 const main=document.querySelector('main'); document.getElementById('year').textContent=new Date().getFullYear();
 if(!url||!key){main.innerHTML='<section class="panel"><h2>Supabase setup pending</h2><p>config.js check karo.</p></section>';return;}
 const sb=createClient(url,key); const {data:{user}}=await sb.auth.getUser();
 if(!user){location.href='admin.html';return;}
 document.getElementById('logoutBtn').classList.remove('hidden');
 document.getElementById('logoutBtn').onclick=async()=>{await sb.auth.signOut();location.href='index.html'};
 const [{data:profile},{data:results,error}]=await Promise.all([
   sb.from('profiles').select('full_name,role').eq('id',user.id).maybeSingle(),
   sb.from('test_results').select('id,test_id,total_questions,correct_answers,wrong_answers,skipped_answers,score,accuracy,submitted_at').eq('user_id',user.id).order('submitted_at',{ascending:false}).limit(30)
 ]);
 if(error){document.getElementById('historyList').innerHTML=`<div class="empty-state">Results load nahi hue: ${esc(error.message)}</div>`;return;}
 const tests=await Promise.all((results||[]).map(async r=>{const {data:t}=await sb.from('tests').select('name,exam').eq('id',r.test_id).maybeSingle();return {...r,test:t||{name:'Unknown Test',exam:'Exam'}};}));
 const rows=tests||[]; const attempts=rows.length;
 const avg=attempts?rows.reduce((s,r)=>s+Number(r.accuracy||0),0)/attempts:0;
 const best=attempts?Math.max(...rows.map(r=>Number(r.score||0))):0; const correct=rows.reduce((s,r)=>s+Number(r.correct_answers||0),0);
 const name=profile?.full_name || user.email?.split('@')[0] || 'Student';
 document.getElementById('welcomeTitle').textContent=`Welcome back, ${name}! 👋`;
 document.getElementById('welcomeText').textContent=attempts?`Tumne ab tak ${attempts} test attempt kiye hain. Ab next level ke liye ek aur smart attempt karo. 🚀`:`Aaj pehla test do—ek strong start hi momentum bana deta hai. 💪`;
 document.getElementById('testsGiven').textContent=attempts; document.getElementById('avgAccuracy').textContent=avg.toFixed(1)+'%'; document.getElementById('bestScore').textContent=best.toFixed(2).replace(/\.00$/,''); document.getElementById('totalCorrect').textContent=correct;
 const progress=Math.min(100,Math.max(0,avg)); document.getElementById('progressFill').style.width=progress+'%'; document.getElementById('goalValue').textContent=avg.toFixed(1)+'%';
 document.getElementById('progressLabel').textContent=avg>=80?'🔥 80%+ Goal Achieved!':'🎯 Target: 80% Accuracy';
 document.getElementById('motivationChip').textContent=avg>=90?'🏆 Outstanding! Keep the streak alive':'🔥 Aaj ka target: 1 test';
 document.getElementById('streakText').textContent=attempts>=3?'🔥 Great consistency! Ab accuracy ko next level par le jao.':'🔥 Consistency build karo—har test se improvement nikalo.';
 document.getElementById('historyCount').textContent=`${attempts} result${attempts===1?'':'s'}`;
 document.getElementById('historyList').innerHTML=attempts?rows.map(r=>{
   const d=new Date(r.submitted_at); const date=d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
   return `<article class="history-item"><div class="history-main"><span class="tag">${esc(r.test.exam||'Exam')}</span><h4>${esc(r.test.name)}</h4><small>${date} • ${r.correct_answers} correct • ${r.wrong_answers} wrong • ${r.skipped_answers} skipped</small></div><div class="history-score"><strong>${Number(r.score).toFixed(2).replace(/\.00$/,'')}</strong><span>${Number(r.accuracy).toFixed(1)}% accuracy</span><a href="result.html?history=${encodeURIComponent(r.id)}" class="small-link">View details →</a></div></article>`;
 }).join(''):'<div class="empty-state"><div class="empty-icon">📊</div><h4>No saved results yet</h4><p>Apna pehla mock test do aur yahan progress dikhegi.</p><a class="btn primary" href="index.html#tests">Start First Test</a></div>';
 function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
})();
