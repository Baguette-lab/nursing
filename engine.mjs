import {COURSE} from './data.mjs';
export const STORAGE_KEY='pathwise-course-v1';
export const PASS=80;
export const ALL_LESSONS=COURSE.flatMap(t=>t.lessons);
export const ALL_QUESTIONS=ALL_LESSONS.flatMap(l=>l.questions);
export const QUESTION_MAP=Object.fromEntries(ALL_QUESTIONS.map(q=>[q.id,q]));
export const LESSON_MAP=Object.fromEntries(ALL_LESSONS.map(l=>[l.id,l]));
export function blankState(){return {version:1,reviewed:{},mastered:{},knownCards:{},attempts:[],remediation:{},examBest:0,location:{topic:'shock',tab:'review',lesson:'s1'},session:null};}
export function normalizeState(value){
 const base=blankState();
 if(!value||value.version!==1)return base;
 for(const key of ['reviewed','mastered','knownCards'])if(value[key]&&typeof value[key]==='object'&&!Array.isArray(value[key]))base[key]={...value[key]};
 base.attempts=Array.isArray(value.attempts)?value.attempts.filter(a=>a&&typeof a.score==='number'&&Array.isArray(a.answers)).slice(-40):[];
 base.remediation=value.remediation&&typeof value.remediation==='object'&&!Array.isArray(value.remediation)?value.remediation:{};
 base.examBest=Number.isFinite(value.examBest)?Math.max(0,Math.min(100,value.examBest)):0;
 if(value.location&&typeof value.location==='object')base.location={...base.location,...value.location};
 if(value.session&&Array.isArray(value.session.ids)&&value.session.ids.length>0&&value.session.ids.every(id=>QUESTION_MAP[id])&&Array.isArray(value.session.answers)&&value.session.answers.every(a=>a&&QUESTION_MAP[a.id]&&typeof a.selected==='string'&&typeof a.correct==='boolean')&&Number.isInteger(value.session.index)&&value.session.index>=0&&value.session.index<value.session.ids.length&&value.session.choices&&value.session.ids.every(id=>Array.isArray(value.session.choices[id])&&value.session.choices[id].length===4)&&['mastery','quiz','exam','practice'].includes(value.session.mode))base.session=value.session;
 return base;
}
export const shuffle=(items,rng=Math.random)=>{
 const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
};
export const getTopic=id=>COURSE.find(t=>t.id===id);
export const latestAttempt=(state,type,topicId)=>[...state.attempts].reverse().find(a=>a.type===type&&(!topicId||a.topicId===topicId));
export const topicPassed=(state,id)=>!!state.mastered['quiz:'+id]||state.attempts.some(a=>a.type==='quiz'&&a.topicId===id&&a.passed);
export const topicUnlocked=(state,id)=>{
 const i=COURSE.findIndex(t=>t.id===id);return i>=0&&COURSE.slice(0,i).every(t=>topicPassed(state,t.id));
};
export const pendingRemediation=(state,id)=>(state.remediation[id]||[]).filter(x=>LESSON_MAP[x]);
export const topicReady=(state,id)=>{
 const topic=getTopic(id);return !!topic&&topicUnlocked(state,id)&&topic.lessons.every(l=>state.mastered[l.id])&&pendingRemediation(state,id).length===0;
};
export const examUnlocked=state=>COURSE.every(t=>topicPassed(state,t.id));
export const lessonAvailable=(state,id)=>{
 const lesson=LESSON_MAP[id];if(!lesson||!topicUnlocked(state,lesson.topicId))return false;
 // Reviews and flashcards within the unlocked topic can be revisited freely.
 return true;
};
export function gradeAnswers(answers,total){
 const correct=answers.filter(a=>a.correct===true).length;
 const score=total?Math.round(100*correct/total):0;
 return {correct,total,score,passed:total>0&&correct/total>=PASS/100};
}
export function makeSession(mode,questions,context={},rng=Math.random){
 if(!questions.length)throw new Error('No questions are available for this activity.');
 return {mode,ids:questions.map(q=>q.id),index:0,answers:[],choices:Object.fromEntries(questions.map(q=>[q.id,shuffle([q.answer,...q.wrong.map(w=>w[0])],rng)])),...context};
}
export function submitAnswer(session,text){
 const question=QUESTION_MAP[session.ids[session.index]];
 if(!question||session.answers.some(a=>a.id===question.id))throw new Error('This question has already been answered.');
 if(![question.answer,...question.wrong.map(w=>w[0])].includes(text))throw new Error('Choose one of the available answers.');
 const answer={id:question.id,selected:text,correct:text===question.answer};
 session.answers.push(answer);return answer;
}
export function buildTopicQuiz(state,topicId,count=15,rng=Math.random){
 if(!topicReady(state,topicId))throw new Error('Complete each lesson’s review and mastery checks before taking this topic quiz.');
 const topic=getTopic(topicId);
 const groups=topic.lessons.map(l=>shuffle(l.questions.filter(q=>q.kind==='quiz'),rng));
 const ordered=[];
 for(let i=0;i<3;i++)for(const g of shuffle(groups,rng))if(g[i])ordered.push(g[i]);
 return shuffle(ordered.slice(0,Math.min(count,ordered.length)),rng);
}
export function buildExam(state,count=30,rng=Math.random){
 if(!examUnlocked(state))throw new Error('Pass all five topic quizzes to unlock the mixed exam.');
 if(![10,20,30,50].includes(count))throw new Error('Choose 10, 20, 30, or 50 questions.');
 const groups=COURSE.map(t=>shuffle(t.lessons.flatMap(l=>l.questions.filter(q=>q.kind==='quiz')),rng));
 const picked=[];
 for(let i=0;picked.length<count;i++)for(const group of shuffle(groups,rng)){if(group[i]&&picked.length<count)picked.push(group[i]);}
 return shuffle(picked,rng);
}
export function finishSession(state,session,now=Date.now()){
 if(session.answers.length!==session.ids.length)throw new Error('Answer every question before completing this activity.');
 const result=gradeAnswers(session.answers,session.ids.length);
 if(session.mode==='mastery'){
  result.passed=result.correct===result.total;
  if(result.passed){
   state.mastered[session.lessonId]=true;
   state.remediation[session.topicId]=pendingRemediation(state,session.topicId).filter(id=>id!==session.lessonId);
  }else state.reviewed[session.lessonId]=false;
 }
 if(session.mode==='quiz'&&!result.passed){
  const ids=session.answers.filter(a=>!a.correct).map(a=>QUESTION_MAP[a.id].lessonId);
  state.remediation[session.topicId]=[...new Set([...pendingRemediation(state,session.topicId),...ids])];
  for(const id of ids)state.reviewed[id]=false;
 }
 if(session.mode==='exam')state.examBest=Math.max(state.examBest,result.score);
 const attempt={id:String(now)+'-'+Math.random().toString(36).slice(2,8),date:now,type:session.mode,topicId:session.topicId??null,lessonId:session.lessonId??null,answers:[...session.answers],...result};
 state.attempts=[...state.attempts,attempt].slice(-40);
 // Retain quiz completions separately so a long history cannot relock a passed course.
 if(session.mode==='quiz'&&result.passed)state.mastered['quiz:'+session.topicId]=true;
 state.session=null;
 return attempt;
}
export function courseProgress(state){
 return {lessons:ALL_LESSONS.filter(l=>state.mastered[l.id]).length,totalLessons:ALL_LESSONS.length,topics:COURSE.filter(t=>topicPassed(state,t.id)).length,totalTopics:COURSE.length,cards:ALL_LESSONS.flatMap(l=>l.cards).filter(c=>state.knownCards[c.id]).length,totalCards:ALL_LESSONS.reduce((n,l)=>n+l.cards.length,0)};
}
export function answerReason(question,selected){return selected===question.answer?question.explanation:question.wrong.find(w=>w[0]===selected)?.[1]||'Review the mechanism in the linked lesson.';}
