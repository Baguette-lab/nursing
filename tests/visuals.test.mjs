import assert from 'node:assert/strict';
import fs from 'node:fs';
import {COURSE} from '../data.mjs';
import {LESSON_NOTES} from '../visual-notes.mjs';
import {initialVisualState,updateVisualState,cardiacOutput,estimatedMAP,oxygenCapacityRatio,thyroidPattern,SEIZURE_PATTERNS} from '../visual-models.mjs';
import {visualLabHTML} from '../visuals.mjs';
assert.equal(cardiacOutput(80,70),5.6);
assert.equal(cardiacOutput(100,50),5);
assert.equal(estimatedMAP(120,60),80);
assert.equal(estimatedMAP(90,60),70);
assert.equal(oxygenCapacityRatio(7.5),.5);
assert.equal(thyroidPattern(0).tsh,'High');
assert.equal(thyroidPattern(2).tsh,'Low');
assert(thyroidPattern(0,true).tsh.includes('inappropriately normal'));
const l=COURSE[0].lessons[0];
let state=initialVisualState('shock','s1');
state=updateVisualState(state,'dbp',120,l);assert(state.sbp>state.dbp);
state=updateVisualState(state,'hr',999,l);assert.equal(state.hr,160);
state=updateVisualState(state,'central',true,l);assert.equal(state.thyroidOutput,0);
state=updateVisualState(state,'thyroidOutput',2,l);assert(!state.central);
state=updateVisualState(state,'seizureType','tonicClonic',l);
state=updateVisualState(state,'phase',99,l);assert.equal(state.phase,3);
state=updateVisualState(state,'seizureType','absence',l);assert.equal(state.phase,0);
assert.equal(SEIZURE_PATTERNS.tonicClonic.phases[1][0],'Tonic');
assert.equal(SEIZURE_PATTERNS.tonicClonic.phases[2][0],'Clonic');
const output='./test-output/visual-markup';fs.mkdirSync(output,{recursive:true});
for(const t of COURSE){
 for(const lesson of t.lessons){
  assert.equal(LESSON_NOTES[lesson.id].length,lesson.flow.length,lesson.id);
  assert(LESSON_NOTES[lesson.id].every(x=>x.length>35));
  const s=initialVisualState(t.id,lesson.id),html=visualLabHTML(t,lesson,s);
  assert(!html.includes('undefined')&&!html.includes('NaN'),lesson.id);
  assert(html.includes('role="img"')&&html.includes('type="range"')||['seizures','hiv'].includes(t.id));
  fs.writeFileSync(`${output}/${lesson.id}.html`,html);
 }
}
console.log('PASS: flow and MAP arithmetic, relative Hb capacity, primary/central thyroid patterns, selector boundaries, phase reset, and all 32 lesson diagrams.');
