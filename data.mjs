import {COURSE} from './course.mjs';
import './anemia.mjs';
import './thyroid.mjs';
import './seizures.mjs';
import './hiv.mjs';
import {MEMORY_DECKS} from './flashcards.mjs';
for (const topic of COURSE) {
 topic.lessons.forEach((lesson,li)=>{
  lesson.topicId=topic.id;
  lesson.questions.forEach((question,qi)=>{
   question.id=lesson.id+'-q'+(qi+1);
   question.lessonId=lesson.id;
   question.topicId=topic.id;
   question.kind=qi<3?'mastery':'quiz';
  });
  const deck=MEMORY_DECKS[lesson.id];
  const cards=lesson.terms.map(([term,answer,why],ci)=>({front:deck.terms[ci],answer:term+' — '+answer,why}));
  cards.push(...deck.facts.map(([front,answer,section])=>({front,answer,why:lesson.sections[section].text})));
  lesson.cards=cards.map((card,ci)=>({...card,id:lesson.id+'-f'+ci,lessonId:lesson.id,topicId:topic.id}));
 });
}
export {COURSE};
