(function(){
  const r=JSON.parse(localStorage.getItem('chitranshLastResult')||'null');
  if(!r){document.querySelector('main').innerHTML='<section class="panel"><h2>No result found.</h2><a class="btn primary" href="index.html">Back Home</a></section>';return;}
  document.getElementById('resultTitle').textContent=r.testName;
  document.getElementById('score').textContent=Number(r.score).toFixed(2).replace(/\.00$/,'');
  document.getElementById('correct').textContent=r.correct;
  document.getElementById('wrong').textContent=r.wrong;
  document.getElementById('skipped').textContent=r.skipped;
  document.getElementById('accuracy').textContent=`${Number(r.accuracy).toFixed(1)}%`;
  document.getElementById('summary').textContent=`${r.correct} correct • ${r.wrong} wrong • ${r.skipped} skipped • −${Number(r.negative).toFixed(3)} per wrong`;
  document.getElementById('details').innerHTML=`<div class="detail-line"><span>Total Questions</span><strong>${r.total}</strong></div><div class="detail-line"><span>Correct Marks</span><strong>+${r.correct}</strong></div><div class="detail-line"><span>Negative Marks</span><strong>−${(r.wrong*Number(r.negative)).toFixed(2)}</strong></div><div class="detail-line"><span>Attempted</span><strong>${r.correct+r.wrong}</strong></div>`;
  document.getElementById('retry').href=`test.html?id=${encodeURIComponent(r.testId)}`;
  const qs=Array.isArray(r.questions)?r.questions:[];
  const answers=Array.isArray(r.answers)?r.answers:[];
  const review=document.getElementById('reviewList');
  if(!qs.length){review.innerHTML='<p>Question review available nahi hai. Is result se pehle old version mein test submit hua tha.</p>';return;}
  review.innerHTML=qs.map((q,i)=>{
    const user=answers[i]; const status=user===null?'skipped':(user===q.correct_option?'correct':'wrong');
    const cls=status==='correct'?'review-correct':status==='wrong'?'review-wrong':'review-skipped';
    const statusText=status==='correct'?'✅ Correct':status==='wrong'?'❌ Wrong':'⏭ Skipped';
    const opts=(q.options||[]).map((o,j)=>{
      const isCorrect=j===q.correct_option, isUser=j===user;
      const oc=isCorrect?'answer-correct':(isUser?'answer-user':'');
      return `<div class="review-option ${oc}"><b>${String.fromCharCode(65+j)}.</b> <span>${esc(o)}</span>${isCorrect?' <strong>✓ Correct</strong>':''}${isUser&&!isCorrect?' <strong>← Your answer</strong>':''}</div>`;
    }).join('');
    return `<article class="question-review ${cls}"><div class="review-q-head"><strong>Q${i+1}</strong><span>${statusText}</span></div><h4>${esc(q.question_text||'')}</h4>${opts}${q.explanation?`<div class="explanation"><b>💡 Explanation:</b> ${esc(q.explanation)}</div>`:''}</article>`;
  }).join('');
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
})();