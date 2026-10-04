import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {COURSE} from '../data.mjs';
import {ALL_LESSONS,ALL_QUESTIONS,blankState,normalizeState,topicUnlocked,topicPassed,topicReady,examUnlocked,makeSession,submitAnswer,finishSession,buildTopicQuiz,buildExam,QUESTION_MAP,pendingRemediation,courseProgress} from '../engine.mjs';
const seed=()=>{let n=126789;return ()=>{n=(n*16807)%2147483647;return (n-1)/2147483646;};};
assert.equal(COURSE.length,5);assert.equal(ALL_LESSONS.length,32);assert.equal(ALL_QUESTIONS.length,192);
assert.equal(new Set(ALL_QUESTIONS.map(q=>q.id)).size,192);
assert.equal(ALL_LESSONS.reduce((n,l)=>n+l.cards.length,0),192);
for(const t of COURSE){
 assert(fs.existsSync(path.join('.',t.source)),t.source);
 for(const l of t.lessons){
  assert.equal(l.questions.filter(q=>q.kind==='mastery').length,3);
  assert.equal(l.questions.filter(q=>q.kind==='quiz').length,3);
  assert.equal(l.cards.length,6);
  assert.equal(new Set(l.cards.map(c=>c.front)).size,6);
  assert(l.cards.every(c=>c.front&&c.answer&&c.why&&!/own words|explain/i.test(c.front)));
  assert(l.sections.length>=3&&l.sections.every(s=>s.text.length>120));
  for(const q of l.questions){
   const opts=[q.answer,...q.wrong.map(w=>w[0])];
   assert.equal(opts.length,4);assert.equal(new Set(opts).size,4,q.id);
   assert(q.explanation.length>60,q.id);
   assert(q.wrong.every(w=>w.length===2&&w[1].length>15),q.id);
   assert.equal(q.topicId,t.id);assert.equal(q.lessonId,l.id);
  }
 }
}
const state=blankState();
assert(topicUnlocked(state,'shock'));assert(!topicUnlocked(state,'anemia'));assert(!examUnlocked(state));
assert.throws(()=>buildTopicQuiz(state,'shock'),/Complete/);
assert.throws(()=>buildExam(state,30),/Pass all five/);
const first=COURSE[0].lessons[0];
state.reviewed[first.id]=true;
let session=makeSession('mastery',first.questions.slice(0,3),{lessonId:first.id,topicId:'shock'},seed());
submitAnswer(session,QUESTION_MAP[session.ids[0]].wrong[0][0]);
assert.throws(()=>submitAnswer(session,QUESTION_MAP[session.ids[0]].answer),/already/);
session.index++;
submitAnswer(session,QUESTION_MAP[session.ids[1]].answer);session.index++;
submitAnswer(session,QUESTION_MAP[session.ids[2]].answer);
let a=finishSession(state,session);
assert(!a.passed);assert(!state.mastered[first.id]);assert(!state.reviewed[first.id]);
function passMastery(l){
 state.reviewed[l.id]=true;
 const s=makeSession('mastery',l.questions.slice(0,3),{lessonId:l.id,topicId:l.topicId},seed());
 for(let i=0;i<s.ids.length;i++){s.index=i;submitAnswer(s,QUESTION_MAP[s.ids[i]].answer);}
 const a=finishSession(state,s);assert(a.passed);assert(state.mastered[l.id]);
}
for(const l of COURSE[0].lessons)passMastery(l);
assert(topicReady(state,'shock'));assert(!topicUnlocked(state,'anemia'));
let questions=buildTopicQuiz(state,'shock',15,seed());
assert.equal(questions.length,15);assert.equal(new Set(questions.map(q=>q.id)).size,15);
assert.equal(new Set(questions.map(q=>q.lessonId)).size,7);
assert(questions.every(q=>q.topicId==='shock'&&q.kind==='quiz'));
session=makeSession('quiz',questions,{topicId:'shock'},seed());
for(let i=0;i<15;i++){session.index=i;const q=QUESTION_MAP[session.ids[i]];submitAnswer(session,i<11?q.answer:q.wrong[0][0]);}
a=finishSession(state,session);
assert.equal(a.score,73);assert(!a.passed);assert(!topicUnlocked(state,'anemia'));
assert(pendingRemediation(state,'shock').length>0);assert(!topicReady(state,'shock'));
assert.throws(()=>buildTopicQuiz(state,'shock'),/Complete/);
for(const id of [...pendingRemediation(state,'shock')])passMastery(ALL_LESSONS.find(l=>l.id===id));
assert(topicReady(state,'shock'));
function passQuiz(t,correctCount=15){
 const qs=buildTopicQuiz(state,t.id,15,seed());
 const s=makeSession('quiz',qs,{topicId:t.id},seed());
 for(let i=0;i<qs.length;i++){s.index=i;const q=qs[i];submitAnswer(s,i<correctCount?q.answer:q.wrong[0][0]);}
 const a=finishSession(state,s);assert(a.passed);return a;
}
a=passQuiz(COURSE[0],12);assert.equal(a.score,80);assert(topicUnlocked(state,'anemia'));
for(const t of COURSE.slice(1)){
 assert(topicUnlocked(state,t.id));
 for(const l of t.lessons)passMastery(l);
 passQuiz(t);
}
assert(examUnlocked(state));
for(const n of [10,20,30,50]){
 const qs=buildExam(state,n,seed());assert.equal(qs.length,n);assert.equal(new Set(qs.map(q=>q.id)).size,n);
 for(const t of COURSE)assert.equal(qs.filter(q=>q.topicId===t.id).length,n/5);
 const s=makeSession('exam',qs,{},seed());
 for(let i=0;i<n;i++){s.index=i;submitAnswer(s,QUESTION_MAP[s.ids[i]].answer);}
 assert(finishSession(state,s).passed);
}
assert.equal(state.examBest,100);
assert.throws(()=>buildExam(state,13),/Choose/);
const restored=normalizeState(JSON.parse(JSON.stringify(state)));
assert(examUnlocked(restored));assert.equal(courseProgress(restored).lessons,32);
assert.deepEqual(normalizeState({version:5}),blankState());
const broken=blankState();broken.session={mode:'exam',ids:['s1-q1'],answers:[],index:0};
assert.equal(normalizeState(broken).session,null);
// Completion stays durable even after attempt history rolls over.
for(let i=0;i<60;i++){const s=makeSession('practice',[first.questions[0]],{},seed());submitAnswer(s,first.questions[0].answer);finishSession(state,s);}
assert(state.attempts.length<=40);assert(examUnlocked(state));assert(topicPassed(state,'shock'));
assert.equal(courseProgress(state).topics,5);
// Check every static import and entry-point asset.
for(const file of fs.readdirSync('.').filter(x=>x.endsWith('.mjs'))){
 const code=fs.readFileSync('./'+file,'utf8');
 for(const match of code.matchAll(/from\s+['"](\.\/[^'"]+)['"]|import\s+['"](\.\/[^'"]+)['"]/g))assert(fs.existsSync(path.join('.',match[1]||match[2])));
}
for(const name of ['index.html','style.css','app.mjs'])assert(fs.existsSync('./'+name));
console.log('PASS: content coverage, question consistency, review/mastery gates, 80% quiz boundary, remediation, balanced exams, storage recovery, and durable completions.');
