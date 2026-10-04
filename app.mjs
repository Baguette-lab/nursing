import {COURSE} from './data.mjs';
import {STORAGE_KEY,PASS,ALL_LESSONS,QUESTION_MAP,LESSON_MAP,blankState,normalizeState,shuffle,getTopic,latestAttempt,topicPassed,topicUnlocked,topicReady,examUnlocked,pendingRemediation,makeSession,submitAnswer,buildTopicQuiz,buildExam,finishSession,courseProgress,answerReason} from './engine.mjs';
import {initialVisualState,updateVisualState} from './visual-models.mjs';
import {visualLabHTML,visualOutputHTML,visualValueLabel} from './visuals.mjs';

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let storageError=false;
let state;
try{state=normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'));}catch{state=blankState();storageError=true;}
let showingSession=!!state.session;
let selected=null;
let result=null;
let deck=null;
let pendingAction=null;
let examSize=30;
let visualState=null;
const app=$('app');
const icons={
 book:'<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z"/><path d="M20 4h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h3z"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
 save:'<path d="M5 4h13l3 3v14H3V4z"/><path d="M7 4v6h10V4M7 21v-7h10v7"/>',
 exam:'<path d="M7 3h10v4H7zM7 5H4v16h16V5h-3M8 12h8M8 16h5"/>',
 refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 8a7 7 0 0 1 12-3L20 8M4 16l2.5 3a7 7 0 0 0 12-3"/>'
};
function icon(name,size=18){return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name]||icons.book)+'</svg>';}
function ring(percent){const c=157;return '<svg class="ring" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="25" fill="none" stroke="#e4edf1" stroke-width="5"/><circle cx="30" cy="30" r="25" fill="none" stroke="#008176" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+(c-c*percent/100)+'" transform="rotate(-90 30 30)"/><text x="30" y="34" text-anchor="middle" font-size="12" font-weight="600" fill="#173649">'+Math.round(percent)+'%</text></svg>';}
function btn(label,action,attrs='',kind=''){return '<button type="button" class="btn '+kind+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{storageError=true;}}
function toast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),4200);}
function topic(){return getTopic(state.location.topic)||COURSE[0];}
function currentLesson(){return topic().lessons.find(l=>l.id===state.location.lesson)||topic().lessons[0];}
function mastered(l){return !!state.mastered[l.id]&&!pendingRemediation(state,l.topicId).includes(l.id);}
function visualsHTML(){
 const t=topic(),l=currentLesson();
 if(!visualState||visualState.scope!==t.id+':'+l.id)visualState=initialVisualState(t.id,l.id);
 return '<div class="study-grid visual-study-grid">'+lessonRows()+'<section class="panel visual-panel">'+visualLabHTML(t,l,visualState)+'<div class="actions">'+btn('Return to lesson review','tab','data-tab="review"','secondary')+btn('Practice memorization','tab','data-tab="flashcards"')+'</div></section></div>';
}
function changeVisual(key,value,partial=false,focusId){
 if(state.location.tab!=='visuals')return;
 const t=topic(),l=currentLesson();
 if(!visualState||visualState.scope!==t.id+':'+l.id)visualState=initialVisualState(t.id,l.id);
 visualState=key==='reset'?initialVisualState(t.id,l.id):updateVisualState(visualState,key,value,l);
 const output=$('viz-output');
 if(partial&&output){
  output.innerHTML=visualOutputHTML(t,l,visualState);
  for(const control of app.querySelectorAll?.('[data-viz-key]')||[]){
   const k=control.dataset.vizKey,v=visualState[k];
   if(control.type==='checkbox')control.checked=!!v;else control.value=v;
   const valueNode=$('viz-value-'+k);if(valueNode)valueNode.textContent=visualValueLabel(k,v)+(control.dataset.unit?' '+control.dataset.unit:'');
  }
  for(const b of app.querySelectorAll?.('[data-key="thyroidPreset"]')||[]){
   const v=b.dataset.value,active=v==='central'?visualState.central&&visualState.thyroidOutput===0:!visualState.central&&visualState.thyroidOutput===({balanced:1,low:0,high:2})[v];
   b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));
  }
 }else{render();if(focusId)$(focusId)?.focus({preventScroll:true});}
}
function navigation(id,tab='review',lessonId){
 if(id==='exam'){
  state.location={topic:topic().id,tab:'exam',lesson:currentLesson().id};
 }else{
  if(!topicUnlocked(state,id))throw new Error('Pass the previous topic quiz first.');
  const t=getTopic(id);if(!t)throw new Error('Choose an available topic.');
  const l=t.lessons.find(x=>x.id===lessonId)||t.lessons.find(x=>!mastered(x))||t.lessons[0];
  state.location={topic:id,tab,lesson:l.id};
 }
 selected=null;result=null;showingSession=false;save();render();window.scrollTo({top:0,behavior:'instant'});
}
function lessonRows(){
 const t=topic();
 return '<aside class="lesson-list" aria-label="Lessons in '+esc(t.title)+'"><div class="lesson-list-heading"><span>Lesson notebook</span><span>'+t.lessons.filter(mastered).length+'/'+t.lessons.length+'</span></div><div class="lesson-rows">'+t.lessons.map((l,i)=>{
  const done=mastered(l),needs=pendingRemediation(state,t.id).includes(l.id);
  return '<button type="button" class="lesson-row '+(l.id===currentLesson().id?'current':'')+'" data-action="lesson" data-lesson="'+l.id+'" '+(l.id===currentLesson().id?'aria-current="step"':'')+'><span class="lesson-index '+(needs?'needs':done?'done':'')+'">'+(done?icon('check',13):String(i+1).padStart(2,'0'))+'</span><span>'+esc(l.title)+'<small>'+(needs?'Review needed':done?'Mastered':state.reviewed[l.id]?'Ready for checks':'Review first')+'</small></span></button>';
 }).join('')+'</div></aside>';
}
const comparisons={
 shock:{heads:['Type','What fails','Useful clue'],rows:[['Hypovolemic','Circulating volume','Blood/fluid loss; less preload'],['Cardiogenic','Heart pump','Cardiac cause; possible pulmonary congestion'],['Obstructive','Central blood flow','PE, tamponade, tension pneumothorax'],['Distributive','Vascular tone / distribution','Septic, anaphylactic, or neurogenic cause']],caption:'Skin, pulse, and pressure patterns vary. Use the whole clinical context.'},
 anemia:{heads:['Type','Core mechanism','Common clue'],rows:[['Iron deficiency','Not enough iron for Hb','Low ferritin; often low MCV'],['B12 deficiency','Impaired DNA synthesis','Often high MCV; possible nerve symptoms'],['Aplastic','Marrow production failure','Multiple low cell lines'],['Hemolytic','Early RBC destruction','Bilirubin/LDH may rise; reticulocyte response'],['Sickle cell','HbS polymerization','Hemolysis plus vaso-occlusion'],['Thalassemia','Reduced globin-chain synthesis','Microcytosis; possible transfusion/iron overload']],caption:'These are typical clues, not stand-alone diagnoses. Mixed disorders can change patterns.'},
 thyroid:{heads:['Feature','Primary hypothyroidism','Primary hyperthyroidism'],rows:[['Metabolism','Slower','Faster'],['Temperature tolerance','Often feels cold','Often feels hot'],['Bowel pattern','Often constipation','Often frequent stools'],['Pulse','Often slower','Often faster'],['Overt lab pattern','High TSH; low free T4','Low TSH; high free T4 and/or T3'],['Treatment idea','Replace missing hormone','Address excess synthesis/active tissue and symptoms']],caption:'Central disease and atypical presentations require context. A goiter can occur in several hormone states.'},
 seizures:{heads:['Pattern','Key appearance','Study distinction'],rows:[['Focal','Starts in one hemisphere’s networks','Awareness may be preserved or impaired'],['Absence','Brief interruption / stare','Usually rapid recovery'],['Atonic','Sudden tone loss','Fall and injury risk'],['Myoclonic','Brief shock-like jerk','Different from prolonged rhythmic clonic activity'],['Tonic-clonic','Stiffening then rhythmic jerking','Often followed by a postictal period']],caption:'Actual events need clinical assessment; several non-seizure conditions can mimic these signs.'},
 hiv:{heads:['Term / test','What it concerns','Remember'],rows:[['HIV','The virus','Not automatically AIDS'],['AIDS','Advanced immune impairment / defining illness','Adult CD4 threshold: <200 cells/µL'],['Viral load','Amount of virus','Suppression makes it fall'],['CD4 count','Helper immune cells','Immune recovery may make it rise'],['ART','Established HIV treatment','Ongoing viral suppression'],['PrEP / PEP','Prevention before / after exposure','PEP assessment is urgent']],caption:'U=U concerns sexual transmission while an undetectable viral load is achieved and maintained.'}
};
function compareHTML(){const c=comparisons[topic().id];return '<details class="compare"><summary>Quick comparison for recall</summary><div class="table-wrap"><table><thead><tr>'+c.heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+c.rows.map(r=>'<tr>'+r.map((x,i)=>(i?'<td>':'<th scope="row">')+esc(x)+(i?'</td>':'</th>')).join('')+'</tr>').join('')+'</tbody><caption>'+esc(c.caption)+'</caption></table></div></details>';}
function reviewHTML(){
 const l=currentLesson(),t=topic(),li=t.lessons.indexOf(l);
 const refs=[l.ref,...(l.refs||[])].filter(Boolean);
 return '<div class="study-grid">'+lessonRows()+'<article class="panel"><div class="lesson-meta"><span>LESSON '+String(li+1).padStart(2,'0')+' / '+String(t.lessons.length).padStart(2,'0')+'</span><span class="pill '+(mastered(l)?'complete':'')+'">'+(mastered(l)?'Mastered':pendingRemediation(state,t.id).includes(l.id)?'Revisit this concept':'Read & understand')+'</span></div><h2>'+esc(l.title)+'</h2><div class="key-concept"><small>The core idea</small>'+esc(l.key)+'</div><div class="review-visual-link">'+btn('Explore this lesson in Visual Lab','tab','data-tab="visuals"','secondary')+'</div>'+
 l.sections.map(s=>'<section class="article-section"><h3>'+esc(s.title)+'</h3><p>'+esc(s.text)+'</p></section>').join('')+
 '<div class="flow-label">Connect the cause and effect</div><ol class="flow">'+l.flow.map(f=>'<li>'+esc(f)+'</li>').join('')+'</ol><div class="memory">'+icon('spark',20)+'<div><strong>Remember it this way</strong><p>'+esc(l.memory)+'</p></div></div>'+
 '<details class="terms"><summary>Key terms & acronyms ('+l.terms.length+')</summary>'+l.terms.map(([term,def,why])=>'<div class="term-row"><strong>'+esc(term)+'</strong><span>'+esc(def)+' '+esc(why)+'</span></div>').join('')+'</details>'+
 (l.update?'<div class="update">'+esc(l.update)+'</div>':'')+
 '<div class="source-note">Course reference: <a href="'+t.source+'#page='+parseInt(l.pages,10)+'" target="_blank" rel="noopener">Uploaded '+esc(t.title)+' slides · '+esc(l.pages)+'</a>'+
 (refs.length?'<br>Further reference: '+refs.map(r=>'<a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+esc(r.label)+'</a>').join(' · '):'')+'</div>'+
 '<div class="actions">'+(!state.reviewed[l.id]?btn('I’ve reviewed this lesson','reviewed','data-lesson="'+l.id+'"'):btn(mastered(l)?'Practice the checks again':'Check my understanding','start-mastery','data-lesson="'+l.id+'"'))+
 btn('Study flashcards','tab','data-tab="flashcards"','secondary')+
 (mastered(l)?btn(li<t.lessons.length-1?'Next lesson':'View topic quiz',li<t.lessons.length-1?'lesson':'tab',li<t.lessons.length-1?'data-lesson="'+t.lessons[li+1].id+'"':'data-tab="quiz"','secondary'):'')+'</div>'+
 '<p class="footnote">Review muna. Then answer all 3 concept checks correctly to mark this lesson mastered. The topic quiz unlocks when every lesson is mastered.</p>'+compareHTML()+'</article></div>';
}
function startMastery(id){
 const l=LESSON_MAP[id];if(!l||!topicUnlocked(state,l.topicId))throw new Error('This lesson is not available yet.');
 if(!state.reviewed[id]){navigation(l.topicId,'review',id);toast('Review the lesson first, then mark it reviewed at the end.');return;}
 launch(makeSession('mastery',shuffle(l.questions.filter(q=>q.kind==='mastery')),{topicId:l.topicId,lessonId:id}));
}
function launch(session){
 const begin=()=>{state.session=session;showingSession=true;result=null;selected=null;save();render();window.scrollTo({top:0,behavior:'instant'});};
 if(state.session&&state.session.answers.length<state.session.ids.length){
  if(state.session.mode===session.mode&&state.session.lessonId===session.lessonId&&state.session.topicId===session.topicId){showingSession=true;result=null;selected=null;render();return;}
  confirmAction('Start a new activity?','Your current unfinished activity will be replaced. Completed lessons and quiz scores stay saved.',begin,'Start new activity');
 }else begin();
}
function masteryHTML(){
 const t=topic(),l=currentLesson(),n=t.lessons.filter(mastered).length;
 const ready=topicReady(state,t.id);
 return '<div class="study-grid">'+lessonRows()+'<section class="panel"><div class="eyebrow">Step 04 · Active recall</div><h2>'+esc(l.title)+'</h2><p class="muted">Explain the mechanism first, then test whether it stays clear when the choices change.</p><div class="quiz-spec"><div><strong>3</strong><span>concept checks</span></div><div><strong>3 / 3</strong><span>to master this lesson</span></div><div><strong>'+n+' / '+t.lessons.length+'</strong><span>lessons mastered</span></div></div>'+
 (mastered(l)?'<div class="notice">'+icon('check',16)+' This lesson is mastered. You can still practice it again.</div>':'<div class="notice">If an answer is wrong, you’ll see why, revisit the explanation, and retry the full set. A corrected guess does not count as a perfect round.</div>')+
 '<div class="actions">'+(state.reviewed[l.id]?btn(mastered(l)?'Practice again':'Begin concept checks','start-mastery','data-lesson="'+l.id+'"'):btn('Review this lesson first','review-lesson','data-lesson="'+l.id+'"'))+
 (ready?btn('Take the topic quiz','tab','data-tab="quiz"','secondary'):btn('Study flashcards','tab','data-tab="flashcards"','secondary'))+'</div>'+
 '<p class="footnote">Topic quizzes require every lesson’s mastery checks. Passing a topic quiz requires at least '+PASS+'%.</p></section></div>';
}
function initializeDeck(filter='all'){
 const cards=topic().lessons.flatMap(l=>l.cards);
 let choices=cards;
 if(filter==='unknown')choices=cards.filter(c=>!state.knownCards[c.id]);
 if(filter==='lesson')choices=currentLesson().cards;
 deck={topicId:topic().id,lessonId:currentLesson().id,filter,queue:shuffle(choices),total:choices.length,studied:0,revealed:false};
}
function flashHTML(){
 if(!deck||deck.topicId!==topic().id||(deck.filter==='lesson'&&deck.lessonId!==currentLesson().id))initializeDeck(deck?.filter||'all');
 const t=topic(),known=t.lessons.flatMap(l=>l.cards).filter(c=>state.knownCards[c.id]).length,total=t.lessons.reduce((n,l)=>n+l.cards.length,0);
 const c=deck.queue[0];
 return '<div class="mode-header"><div><div class="eyebrow">Step 03 · Memorize the essentials</div><h2>Flashcards</h2><p>Recall the term, formula, or fact before showing the answer. Choose “Forgot it” to repeat the card until you remember it.</p></div><span class="pill">'+known+' / '+total+' memorized</span></div><section class="card-stage"><div class="card-toolbar"><label class="select-label" for="card-filter">Study deck <select id="card-filter"><option value="all" '+(deck.filter==='all'?'selected':'')+'>All topic cards</option><option value="unknown" '+(deck.filter==='unknown'?'selected':'')+'>Needs memorization</option><option value="lesson" '+(deck.filter==='lesson'?'selected':'')+'>Current lesson</option></select></label><span class="small muted">'+deck.queue.length+' remaining</span></div>'+
 (c?'<div class="flashcard '+(deck.revealed?'answer':'')+'"><span class="front-tag">'+esc(LESSON_MAP[c.lessonId].title)+'</span><h3>'+esc(c.front)+'</h3>'+
 (deck.revealed?'<div class="flash-answer-block" role="status"><span class="answer-label">Answer to memorize</span><div class="flash-answer">'+esc(c.answer)+'</div></div><details class="flash-detail"><summary>Supporting detail</summary><p>'+esc(c.why)+'</p></details>':btn('Show answer','reveal'))+'</div>'+
 (deck.revealed?'<div class="card-rating">'+btn('Forgot it','card-again','','secondary again')+btn('Remembered','card-known')+'</div>':'')+
 '<p class="recall-tip">Mark “Remembered” only if you recalled the answer before revealing it.</p>'
 :'<div class="panel empty-state"><h3>Deck memorized</h3><p>You recalled every card in this round. Repeat the deck later to check what stays in memory, or continue to mastery.</p><div class="actions">'+btn('Repeat this deck','restart-cards')+btn('Go to mastery','tab','data-tab="mastery"','secondary')+'</div></div>')+'</section>';
}
function rateCard(known){
 if(!deck?.revealed)return;
 const card=deck?.queue.shift();if(!card)return;
 state.knownCards[card.id]=known;
 if(!known)deck.queue.push(card);else deck.studied++;
 deck.revealed=false;save();render();
}
function quizHTML(){
 const t=topic();
 if(!topicReady(state,t.id)){
  const need=pendingRemediation(state,t.id);
  const outstanding=t.lessons.filter(l=>!mastered(l));
  return '<section class="panel lock-panel"><div class="lock-icon">'+icon('lock',24)+'</div><div class="eyebrow">Step 05 · Topic quiz</div><h2>'+(need.length?'A few concepts need another look':'Build mastery before the quiz')+'</h2><p>'+(need.length?'Your last quiz showed which concepts need practice. Review those lessons and complete their 3 concept checks again, then retry.':'Finish the review and all 3 concept checks for every lesson in this topic. This prepares you for questions that apply the concepts.')+'</p><ul class="requirements">'+outstanding.map(l=>'<li><span>'+esc(l.title)+'</span><button type="button" data-action="review-lesson" data-lesson="'+l.id+'">'+(need.includes(l.id)?'Revisit':'Review')+'</button></li>').join('')+'</ul>'+btn('Continue learning','review-lesson','data-lesson="'+(outstanding[0]?.id||currentLesson().id)+'"')+'</section>';
 }
 const previous=latestAttempt(state,'quiz',t.id),passed=topicPassed(state,t.id),index=COURSE.indexOf(t);
 return '<section class="panel quiz-start"><div class="eyebrow">Step 05 · Put it together</div><h2>'+esc(t.title)+' topic quiz</h2><p class="muted">You’ve completed the lesson checks. Now answer a balanced set of questions from this topic, including cause-and-effect, recognition, and patient cases.</p><div class="quiz-spec"><div><strong>15</strong><span>randomized questions</span></div><div><strong>'+PASS+'%</strong><span>12 correct to pass</span></div><div><strong>Untimed</strong><span>explanation after each answer</span></div></div>'+
 (previous?'<div class="notice">Last attempt: <strong>'+previous.score+'%</strong> · '+previous.correct+'/'+previous.total+' correct. '+(passed?'This topic has been passed. You can practice it again.':'Review and try again.')+'</div>':'')+
 '<div class="actions">'+btn(passed?'Generate another quiz':'Begin topic quiz','start-quiz')+
 (passed?btn(index<COURSE.length-1?'Next topic':'Open mixed exam','next-topic','','secondary'):'')+
 (previous?.answers.some(a=>!a.correct)?btn('Practice missed questions','missed','data-attempt="'+esc(previous.id)+'"','secondary'):'')+'</div><p class="footnote">Wrong answers include the reason your choice does not fit, the correct explanation, and a link back to the lesson. A failed quiz sends you back to the missed concepts.</p></section>';
}
function examHTML(){
 const p=courseProgress(state);
 if(!examUnlocked(state))return '<section class="panel lock-panel"><div class="lock-icon">'+icon('exam',26)+'</div><div class="eyebrow">Final checkpoint</div><h2>The mixed exam unlocks after all five topics</h2><p>Complete each topic’s lesson mastery and pass its quiz. Then choose an exam length and practice questions drawn across the full course.</p><ul class="requirements">'+COURSE.map(t=>'<li><span>'+icon(topicPassed(state,t.id)?'check':'lock',16)+esc(t.title)+'</span><span>'+ (topicPassed(state,t.id)?'Passed':topicUnlocked(state,t.id)?'In progress':'Locked')+'</span></li>').join('')+'</ul>'+btn('Continue the course','continue-course')+'<p class="footnote">'+p.topics+' of '+p.totalTopics+' topic quizzes passed.</p></section>';
 const last=latestAttempt(state,'exam');
 return '<section class="panel quiz-start"><div class="eyebrow">Final checkpoint · All five topics</div><h2>Generate a mixed exam</h2><p class="muted">Choose the length. Every exam includes a balanced selection from shock, anemia, thyroid disorders, seizures, and HIV. Answer feedback is held until the complete exam is submitted.</p><div class="quiz-spec"><div><strong>5</strong><span>topics included</span></div><div><strong>Untimed</strong><span>work at your pace</span></div><div><strong>'+state.examBest+'%</strong><span>best exam score</span></div></div><div class="exam-form"><label for="exam-size">Number of questions<select id="exam-size">'+[10,20,30,50].map(n=>'<option value="'+n+'" '+(n===examSize?'selected':'')+'>'+n+' questions</option>').join('')+'</select></label>'+btn('Generate exam','start-exam')+'</div>'+
 (last?'<div class="notice">Last exam: <strong>'+last.score+'%</strong> · '+last.correct+'/'+last.total+' correct.</div><div class="actions">'+btn('Review last exam','last-exam','','secondary')+(last.answers.some(a=>!a.correct)?btn('Practice missed questions','missed','data-attempt="'+esc(last.id)+'"','secondary'):'')+'</div>':'')+
 '<p class="footnote">The exam uses the curated lesson question bank. Question selection and answer order change each round. Your progress and unfinished attempt save in this browser.</p></section>';
}
function feedbackHTML(q,a){
 const isCorrect=a.correct;
 return '<div class="feedback '+(isCorrect?'':'bad')+'" role="status"><h3>'+(isCorrect?'Correct — connect the reason':'Let’s clear up the concept')+'</h3>'+
 (!isCorrect?'<div class="explain-label">Why your choice does not fit</div><p>'+esc(answerReason(q,a.selected))+'</p>':'')+
 '<div class="explain-label">Correct answer</div><p><strong>'+esc(q.answer)+'</strong></p><p>'+esc(q.explanation)+'</p>'+
 '<details class="compare"><summary>Why the other choices differ</summary>'+q.wrong.map(([text,why])=>'<p><strong>'+esc(text)+':</strong> '+esc(why)+'</p>').join('')+'</details>'+
 '<button type="button" class="feedback-link" data-action="review-lesson" data-lesson="'+q.lessonId+'">Revisit '+esc(LESSON_MAP[q.lessonId].title)+'</button></div>';
}
function sessionHTML(){
 const s=state.session,q=QUESTION_MAP[s.ids[s.index]];
 if(!q)throw new Error('This saved activity could not be continued.');
 const a=s.answers.find(x=>x.id===q.id),isExam=s.mode==='exam';
 const context=s.mode==='mastery'?'Lesson concept checks':s.mode==='quiz'?'Topic quiz':isExam?'Mixed exam':'Missed-question practice';
 return '<section class="panel question-panel"><div class="question-top"><span>'+esc(context)+'</span><span>Question '+(s.index+1)+' of '+s.ids.length+'</span></div><div class="bar" role="progressbar" aria-label="Questions completed" aria-valuemin="0" aria-valuemax="'+s.ids.length+'" aria-valuenow="'+s.answers.length+'"><span style="width:'+100*s.answers.length/s.ids.length+'%"></span></div><div class="eyebrow">'+esc(getTopic(q.topicId).title)+' · '+esc(q.level)+'</div><h2 id="question-title" class="question-title">'+esc(q.prompt)+'</h2><fieldset class="options" aria-labelledby="question-title"><legend class="sr-only">Select one answer</legend>'+
 s.choices[q.id].map((text,i)=>'<label class="option '+(a?'locked ':'')+(a&&!isExam&&text===q.answer?'correct ':'')+(a&&!isExam&&text===a.selected&&!a.correct?'incorrect':'')+'"><input type="radio" name="answer" value="'+esc(text)+'" '+((a?.selected??selected)===text?'checked':'')+' '+(a?'disabled':'')+'><span class="option-letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(text)+'</span></label>').join('')+'</fieldset>'+
 (a&&!isExam?feedbackHTML(q,a):'')+
 '<div class="actions">'+(!a?btn(isExam?(s.index===s.ids.length-1?'Submit exam':'Save answer & continue'):'Check answer','answer',selected?'':'disabled'):btn(s.index===s.ids.length-1?'See results':'Next question','next-question'))+
 btn('Return to study','pause-session','','tertiary')+'</div><p class="footnote">'+(isExam?'No hints or explanations during the exam. You can review every answer once you finish.':s.mode==='mastery'?'Mastery requires 3 correct answers in one complete round. Read the feedback before continuing.':'Your first submitted answer is scored. Read the explanation to learn from each choice.')+'</p></section>';
}
function resultHTML(a){
 const isMastery=a.type==='mastery',isQuiz=a.type==='quiz',isExam=a.type==='exam';
 const t=a.topicId?getTopic(a.topicId):null;
 const qi=t?COURSE.indexOf(t):-1;
 const title=isMastery?(a.passed?'Concept mastered':'Review, then try the checks again'):isQuiz?(a.passed?'Topic passed':'A few concepts need more practice'):isExam?(a.passed?'A strong finish':'Use the missed questions to guide revision'):'Practice round complete';
 const missed=a.answers.filter(x=>!x.correct);
 const desc=isMastery?(a.passed?'All three checks were correct in one round. This lesson is marked mastered.':'A perfect round is needed for lesson mastery. Read the explanation again, then try a fresh answer order.'):isQuiz?(a.passed?(qi<4?'The next topic is now unlocked. You can also revisit the explanations below.':'All five topics are passed. The mixed exam is now unlocked.'):'Revisit the missed lessons and complete their concept checks again before retrying this quiz.'):'Review your choices below. Use the explanation and lesson link whenever a concept still feels unclear.';
 const byTopic=COURSE.map(t=>({title:t.title,items:a.answers.filter(x=>QUESTION_MAP[x.id].topicId===t.id)})).filter(x=>x.items.length);
 return '<section class="panel result-panel"><div class="eyebrow">'+(isMastery?'Lesson mastery':isQuiz?'Topic quiz':isExam?'Mixed exam':'Practice')+' · Results</div><div class="result-hero"><div class="score '+(a.passed?'':'failed')+'"><strong>'+a.score+'%</strong><small>'+a.correct+'/'+a.total+' correct</small></div><div><h2>'+title+'</h2><p>'+desc+'</p></div></div>'+
 (isExam?'<div class="breakdown">'+byTopic.map(b=>'<span>'+esc(b.title)+' <strong>'+b.items.filter(x=>x.correct).length+'/'+b.items.length+'</strong></span>').join('')+'</div>':'')+
 '<div class="actions">'+
 (isMastery?(a.passed?btn('Continue learning','continue-after-mastery','data-lesson="'+a.lessonId+'"'):btn('Review this concept','review-lesson','data-lesson="'+a.lessonId+'"')):isQuiz?(a.passed?btn(qi<4?'Continue to next topic':'Open mixed exam','next-topic'):btn('Review missed lessons','review-lesson','data-lesson="'+pendingRemediation(state,t.id)[0]+'"')):btn('Return to '+(isExam?'exam builder':'study'),'leave-result'))+
 (missed.length?btn('Practice '+missed.length+' missed question'+(missed.length===1?'':'s'),'missed','data-attempt="'+esc(a.id)+'"','secondary'):'')+'</div>'+
 '<hr><h3>Answer review</h3><p class="small muted">Open a question to see the correct explanation and why your selected answer fits or does not fit.</p>'+
 a.answers.map((ans,i)=>{const q=QUESTION_MAP[ans.id];return '<details class="review-answer" '+(!ans.correct?'open':'')+'><summary><span class="answer-indicator '+(ans.correct?'':'bad')+'">'+(ans.correct?'✓':'×')+'</span>'+String(i+1).padStart(2,'0')+'. '+esc(q.prompt)+'</summary><p><strong>Your answer:</strong> '+esc(ans.selected)+'</p>'+(!ans.correct?'<p><strong>Why it does not fit:</strong> '+esc(answerReason(q,ans.selected))+'</p>':'')+'<p><strong>Correct answer:</strong> '+esc(q.answer)+'</p><p>'+esc(q.explanation)+'</p>'+btn('Review the lesson','review-lesson','data-lesson="'+q.lessonId+'"','secondary')+'</details>';}).join('')+'</section>';
}
function finishActivity(){
 const s=state.session;const attempt=finishSession(state,s);result=attempt;showingSession=false;selected=null;
 if(s.mode==='mastery')state.location={topic:s.topicId,tab:'mastery',lesson:s.lessonId};
 if(s.mode==='quiz')state.location={topic:s.topicId,tab:'quiz',lesson:state.location.lesson};
 if(s.mode==='exam')state.location.tab='exam';
 save();render();window.scrollTo({top:0,behavior:'instant'});
}
function answer(){
 const s=state.session;if(!s||!selected)return;
 submitAnswer(s,selected);selected=null;save();
 if(s.mode==='exam'){if(s.index===s.ids.length-1)finishActivity();else{s.index++;save();render();}}else render();
 $('main')?.focus({preventScroll:true});
}
function nextQuestion(){const s=state.session;if(!s)return;if(!s.answers.some(a=>a.id===s.ids[s.index]))throw new Error('Answer this question first.');if(s.index===s.ids.length-1)finishActivity();else{s.index++;selected=null;save();render();$('main')?.focus({preventScroll:true});}}
function practiceMissed(id){
 const attempt=state.attempts.find(a=>a.id===id);if(!attempt)throw new Error('That attempt is no longer in the saved history.');
 const questions=[...new Set(attempt.answers.filter(a=>!a.correct).map(a=>a.id))].map(id=>QUESTION_MAP[id]).filter(q=>q&&topicUnlocked(state,q.topicId));
 if(!questions.length){toast('There are no missed questions in this attempt.');return;}
 launch(makeSession('practice',shuffle(questions),{topicId:attempt.topicId,fromAttempt:id}));
}
function confirmAction(title,message,cb,label='Confirm'){
 pendingAction=cb;const d=$('confirm-dialog');
 d.innerHTML='<h2>'+esc(title)+'</h2><p>'+esc(message)+'</p><div class="actions">'+btn(esc(label),'confirm')+btn('Cancel','cancel-confirm','','secondary')+'</div>';
 d.showModal();
}
function continueAfterMastery(id){
 const l=LESSON_MAP[id],t=getTopic(l.topicId),i=t.lessons.indexOf(l);
 const needs=pendingRemediation(state,t.id);
 const next=needs.length?t.lessons.find(x=>needs.includes(x.id)):t.lessons.slice(i+1).find(x=>!mastered(x))||t.lessons.find(x=>!mastered(x));
 if(next)navigation(t.id,'review',next.id);else navigation(t.id,'quiz',l.id);
}
function repairLocation(){
 if(!topicUnlocked(state,state.location.topic))state.location={topic:COURSE.find(t=>topicUnlocked(state,t.id)&&!topicPassed(state,t.id))?.id||'shock',tab:'review',lesson:null};
 if(!['review','visuals','flashcards','mastery','quiz','exam'].includes(state.location.tab))state.location.tab='review';
 if(!topic().lessons.some(l=>l.id===state.location.lesson))state.location.lesson=topic().lessons[0].id;
}
function render(){
 repairLocation();const t=topic(),p=courseProgress(state),isExam=state.location.tab==='exam'&&!showingSession;
 const done=t.lessons.filter(mastered).length;
 let content='';
 if(showingSession&&state.session)content=sessionHTML();else if(result)content=resultHTML(result);else if(isExam)content=examHTML();else content={review:reviewHTML,visuals:visualsHTML,flashcards:flashHTML,mastery:masteryHTML,quiz:quizHTML}[state.location.tab]?.()||reviewHTML();
 app.innerHTML=(storageError?'<div class="error-banner" role="status">Progress cannot be saved in this browser right now. Keep this tab open to keep studying.</div>':'')+
 '<div class="layout"><aside class="sidebar"><div class="brand"><span class="brand-symbol">'+icon('book',22)+'</span>pathwise<span style="color:#48dbc4">.</span></div><div class="side-caption">Your learning path</div><nav class="topic-nav" aria-label="Course topics">'+COURSE.map((x,i)=>{
 const unlocked=topicUnlocked(state,x.id),passed=topicPassed(state,x.id);
 return '<button type="button" class="topic-button '+(t.id===x.id&&!isExam?'active':'')+'" data-action="topic" data-topic="'+x.id+'" '+(!unlocked?'disabled aria-label="'+esc(x.title)+' locked; pass the previous topic quiz"':'')+' '+(t.id===x.id&&!isExam?'aria-current="page"':'')+'><span class="topic-number">'+(passed?icon('check',13):String(i+1).padStart(2,'0'))+'</span><span class="topic-title">'+esc(x.title)+'<small>'+x.week+' · '+(passed?'Passed':unlocked?'Available':'Locked')+'</small></span><span class="topic-status">'+(!unlocked?icon('lock',13):'')+'</span></button>';
 }).join('')+'</nav><div class="side-bottom"><button type="button" class="topic-button '+(isExam?'active':'')+'" data-action="exam"><span class="topic-number">'+icon('exam',15)+'</span><span class="topic-title">Mixed exam<small>'+ (examUnlocked(state)?'Ready when you are':'Pass all 5 topics to unlock')+'</small></span></button><div class="side-progress"><p><span>Course mastery</span><strong>'+p.lessons+'/'+p.totalLessons+'</strong></p><div class="bar" aria-label="'+p.lessons+' of '+p.totalLessons+' lessons mastered"><span style="width:'+(100*p.lessons/p.totalLessons)+'%"></span></div></div><p class="saved">'+icon('save',14)+'Saved on this browser</p></div></aside>'+
 '<div class="main-wrap"><header class="topbar"><div class="breadcrumb">Pathology & therapeutics<span>/</span>'+esc(isExam?'Mixed exam':t.title)+'</div><div class="course-chip">'+icon('book',15)+'5 topics · '+ALL_LESSONS.length+' lessons</div></header><main id="main" class="workspace" tabindex="-1"><div class="intro"><div><div class="eyebrow">'+(isExam?'Final review':t.week+' · Topic '+String(COURSE.indexOf(t)+1).padStart(2,'0'))+'</div><h1>'+esc(isExam?'The mixed exam':t.title)+'</h1><p>'+esc(isExam?'Bring the concepts together, one balanced exam at a time.':t.description)+'</p></div><div class="intro-stats">'+ring(isExam?100:100*done/t.lessons.length)+'<div><strong>'+ (isExam?p.topics+'/'+p.totalTopics:done+'/'+t.lessons.length)+'</strong><small>'+(isExam?'topics passed':'lessons mastered')+'</small></div></div></div>'+
 (!isExam?'<nav class="tabs" aria-label="Learning activities">'+[['review','Review'],['visuals','Visual Lab'],['flashcards','Flashcards'],['mastery','Mastery'],['quiz','Topic quiz']].map(([id,label],i)=>'<button type="button" class="tab '+(state.location.tab===id&&!showingSession&&!result?'active':'')+'" data-action="tab" data-tab="'+id+'" '+(state.location.tab===id&&!showingSession&&!result?'aria-current="page"':'')+'><span class="step">'+(i+1)+'</span>'+label+(id==='quiz'&&!topicReady(state,t.id)?icon('lock',13):'')+'</button>').join('')+'<button type="button" class="tab mobile-brand" data-action="exam">Mixed exam</button></nav>':'')+
 (state.session&&!showingSession?'<div class="session-notice"><span>You have a saved '+esc(state.session.mode==='mastery'?'concept-check round':state.session.mode==='exam'?'exam':'quiz/practice round')+' in progress.</span>'+btn('Resume activity','resume','','secondary')+'</div>':'')+
 content+'<footer class="course-footer"><span>Based on the 5 uploaded PATH 1017 lessons · Clinical updates are labeled.</span><span>Progress stays in this browser · <button type="button" data-action="reset" style="padding:0;background:transparent;color:inherit;font-size:inherit;text-decoration:underline">Reset progress</button></span></footer></main></div></div><dialog id="confirm-dialog" class="dialog" aria-label="Confirm action"></dialog>';
}
app.addEventListener('change',event=>{
 if(event.target.dataset?.vizKey)changeVisual(event.target.dataset.vizKey,event.target.type==='checkbox'?event.target.checked:event.target.value,false,event.target.id);
 if(event.target.matches('input[name="answer"]')){selected=event.target.value;const b=app.querySelector('[data-action="answer"]');if(b)b.disabled=false;}
 if(event.target.id==='card-filter'){initializeDeck(event.target.value);render();}
 if(event.target.id==='exam-size'){examSize=Number(event.target.value);}
});
app.addEventListener('input',event=>{
 if(event.target.dataset?.vizKey)changeVisual(event.target.dataset.vizKey,event.target.value,true,event.target.id);
});
app.addEventListener('click',event=>{
 const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
 const action=el.dataset.action;
 try{
 switch(action){
 case 'topic':navigation(el.dataset.topic);break;
 case 'lesson':navigation(topic().id,state.location.tab==='visuals'?'visuals':'review',el.dataset.lesson);break;
 case 'viz':changeVisual(el.dataset.key,el.dataset.value,false,el.id);break;
 case 'tab':navigation(topic().id,el.dataset.tab,currentLesson().id);break;
 case 'review-lesson':{const l=LESSON_MAP[el.dataset.lesson];if(l)navigation(l.topicId,'review',l.id);break;}
 case 'reviewed':state.reviewed[el.dataset.lesson]=true;save();navigation(topic().id,'mastery',el.dataset.lesson);break;
 case 'start-mastery':startMastery(el.dataset.lesson);break;
 case 'start-quiz':launch(makeSession('quiz',buildTopicQuiz(state,topic().id),{topicId:topic().id}));break;
 case 'start-exam':launch(makeSession('exam',buildExam(state,examSize)));break;
 case 'answer':answer();break;
 case 'next-question':nextQuestion();break;
 case 'pause-session':showingSession=false;selected=null;render();break;
 case 'resume':showingSession=true;result=null;selected=null;render();break;
 case 'reveal':deck.revealed=true;render();break;
 case 'card-known':rateCard(true);break;
 case 'card-again':rateCard(false);break;
 case 'restart-cards':initializeDeck(deck?.filter||'all');render();break;
 case 'exam':navigation('exam');break;
 case 'next-topic':{const i=COURSE.indexOf(topic());if(!topicPassed(state,topic().id))throw new Error('Pass this topic quiz first.');navigation(i<4?COURSE[i+1].id:'exam');break;}
 case 'continue-course':{const t=COURSE.find(t=>!topicPassed(state,t.id))||COURSE[4];navigation(t.id,topicReady(state,t.id)?'quiz':'review');break;}
 case 'continue-after-mastery':continueAfterMastery(el.dataset.lesson);break;
 case 'missed':practiceMissed(el.dataset.attempt);break;
 case 'leave-result':result=null;render();break;
 case 'last-exam':result=latestAttempt(state,'exam');showingSession=false;render();break;
 case 'reset':confirmAction('Reset all study progress?','This clears completed lessons, flashcard ratings, saved attempts, and the current activity in this browser.',()=>{state=blankState();deck=null;result=null;showingSession=false;selected=null;save();render();toast('Progress reset. Begin with the first review.');},'Reset progress');break;
 case 'confirm':{const cb=pendingAction;pendingAction=null;$('confirm-dialog').close();cb?.();break;}
 case 'cancel-confirm':pendingAction=null;$('confirm-dialog').close();break;
 }
 }catch(err){toast(err.message||'That activity could not be started.');}
});
repairLocation();
if(state.session&&state.session.mode!=='exam'&&state.session.topicId&&!topicUnlocked(state,state.session.topicId)){state.session=null;showingSession=false;}
render();

// The structured tools use exactly the same gates and visible navigation as the interface.
if(document.modelContext?.registerTool){
 const lifetime=new AbortController();
 const definitions=[
 {name:'read_study_progress',title:'Read study progress',description:'Read completed lessons and topic unlock status without changing progress.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('No input properties are accepted.');return {...courseProgress(state),topics:COURSE.map(t=>({id:t.id,unlocked:topicUnlocked(state,t.id),passed:topicPassed(state,t.id),quizReady:topicReady(state,t.id)})),examUnlocked:examUnlocked(state)};}},
 {name:'open_study_lesson',title:'Open a study lesson',description:'Navigate to an unlocked lesson review. Does not mark it read or mastered.',inputSchema:{type:'object',properties:{lessonId:{type:'string'}},required:['lessonId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).some(k=>k!=='lessonId')||typeof input.lessonId!=='string'||!LESSON_MAP[input.lessonId])throw new Error('Provide a valid lessonId.');const l=LESSON_MAP[input.lessonId];navigation(l.topicId,'review',l.id);return {lessonId:l.id,title:l.title};}},
 {name:'start_topic_quiz',title:'Start a topic quiz',description:'Start an available topic quiz only after all of its lesson mastery checks are completed. Answers remain visible only through the ordinary quiz flow.',inputSchema:{type:'object',properties:{topicId:{type:'string'}},required:['topicId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).some(k=>k!=='topicId')||typeof input.topicId!=='string')throw new Error('Provide a valid topicId.');if(state.session)throw new Error('Finish or leave the current saved activity before starting a different quiz.');const qs=buildTopicQuiz(state,input.topicId);navigation(input.topicId,'quiz');launch(makeSession('quiz',qs,{topicId:input.topicId}));return {topicId:input.topicId,questions:qs.length,started:true};}}
 ];
 for(const tool of definitions){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifetime.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});
}
