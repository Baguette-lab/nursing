// Teaching models: real arithmetic where formulas are specified; qualitative
// comparisons elsewhere. These models do not estimate a patient's response.
export const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||min));
export const cardiacOutput=(hr,sv)=>Number(hr)*Number(sv)/1000;
export const estimatedMAP=(systolic,diastolic)=>(Number(systolic)+2*Number(diastolic))/3;
export const oxygenCapacityRatio=hb=>Number(hb)/15;

export const SHOCK_CASES={
 baseline:{label:'Reference circulation',volume:'Available',pump:'Working',route:'Open',tone:'Maintained',focus:-1,explanation:'Circulating volume, an effective pump, an open route, and appropriate vessel tone work together to deliver blood.',clue:'Adequate pressure alone does not prove adequate tissue perfusion.'},
 hypovolemic:{label:'Hypovolemic',volume:'Reduced',pump:'May compensate',route:'Open',tone:'Often constricted',focus:0,explanation:'Blood or fluid loss reduces venous return and preload. Less filling can reduce stroke volume and cardiac output.',clue:'Remember: a volume problem. Compensation can preserve blood pressure early.'},
 cardiogenic:{label:'Cardiogenic',volume:'May be present',pump:'Failing',route:'Open',tone:'Often constricted',focus:1,explanation:'A failing heart cannot eject blood effectively. Fluid may back up into the lungs even while forward flow is inadequate.',clue:'Remember: a pump problem. Extra fluid does not automatically fix it.'},
 obstructive:{label:'Obstructive',volume:'May be present',pump:'Flow restricted',route:'Obstructed',tone:'Variable',focus:2,explanation:'A mechanical obstacle blocks filling or forward circulation. Severe pulmonary embolism, tamponade, and tension pneumothorax are examples.',clue:'Remember: a route problem. Treatment must address the obstruction.'},
 neurogenic:{label:'Neurogenic',volume:'May be present',pump:'Slow pulse possible',route:'Open',tone:'Lost sympathetic tone',focus:3,explanation:'Loss of sympathetic control allows vessels to dilate. Bradycardia can accompany hypotension because the usual rapid-pulse response may be absent.',clue:'Remember: loss of sympathetic tone; warm skin and bradycardia can be clues.'},
 anaphylactic:{label:'Anaphylactic',volume:'Leaks from vessels',pump:'May compensate',route:'Open',tone:'Dilated',focus:3,explanation:'Allergic mediators cause vasodilation and capillary leakage. Airway swelling and bronchospasm can also reduce oxygen delivery.',clue:'Remember: circulation and airway can both be threatened.'},
 septic:{label:'Septic',volume:'Effective volume reduced',pump:'Variable',route:'Microcirculation impaired',tone:'Often dilated',focus:3,explanation:'A dysregulated response to infection can disrupt vessel tone, capillary barriers, and microcirculation, leading to organ dysfunction.',clue:'Remember: infection with organ dysfunction; a warm appearance does not rule out shock.'}
};

export const ANEMIA_CASES={
 reference:{label:'Reference RBCs',size:'Usual size',count:20,radius:13,pale:false,production:'Available',survival:'Usual',focus:2,explanation:'Red blood cells carry hemoglobin. Their number, hemoglobin content, production, and survival each matter for oxygen transport.',clues:['MCV = average cell size','Hemoglobin carries oxygen']},
 iron:{label:'Iron deficiency',size:'Often small',count:15,radius:9,pale:true,production:'Hemoglobin building limited',survival:'Not the main problem',focus:2,explanation:'Iron stores are depleted, so developing cells cannot build enough hemoglobin. The typical pattern is small, pale cells.',clues:['Often low MCV','Low ferritin supports depleted stores','TIBC often rises']},
 b12:{label:'B12 deficiency',size:'Often large',count:13,radius:18,pale:false,production:'DNA synthesis impaired',survival:'Ineffective maturation',focus:0,explanation:'Impaired DNA synthesis disrupts cell division and maturation. Cells are often large; nervous-system effects can occur too.',clues:['Often high MCV','Possible tingling or imbalance','Pernicious anemia: intrinsic-factor problem']},
 aplastic:{label:'Aplastic anemia',size:'May be usual size',count:7,radius:13,pale:false,production:'Marrow fails',survival:'Not the main problem',focus:0,explanation:'The marrow cannot supply enough blood cells. Red cells, white cells, and platelets may all fall: pancytopenia.',clues:['RBCs low: anemia','WBCs low: infection risk','Platelets low: bleeding risk']},
 hemolytic:{label:'Hemolytic anemia',size:'Variable',count:11,radius:13,pale:false,production:'May increase to compensate',survival:'Shortened',focus:1,explanation:'Cells are destroyed prematurely. Marrow may raise the reticulocyte count; breakdown can increase bilirubin and produce jaundice.',clues:['Early RBC destruction','Reticulocytes often rise','LDH may rise; haptoglobin may fall']},
 sickle:{label:'Sickle cell disease',size:'Rigid cells; size varies',count:12,radius:13,pale:false,production:'May compensate',survival:'Shortened',focus:1,explanation:'Deoxygenated HbS can polymerize and make cells rigid. Both destruction and interrupted small-vessel flow can occur.',clues:['Hemolysis + vaso-occlusion','Ischemic pain and organ injury','Hydroxyurea can increase HbF']},
 thalassemia:{label:'Thalassemia',size:'Often small',count:13,radius:9,pale:true,production:'Globin-chain synthesis reduced',survival:'Often shortened',focus:0,explanation:'Reduced alpha- or beta-globin production produces unbalanced chains, ineffective cell production, and increased destruction.',clues:['Often low MCV','Small cells do not prove iron deficiency','Repeated transfusions can add excess iron']}
};

export function thyroidPattern(output,central=false){
 const level=clamp(output,0,2);
 if(central&&level===0)return {tsh:'Low / inappropriately normal',hormone:'Low',feedback:'The expected TSH rise is missing.',symptoms:['Cold intolerance','Constipation','Fatigue / slower functions']};
 if(level===0)return {tsh:'High',hormone:'Low',feedback:'The pituitary asks the underactive gland for more hormone.',symptoms:['Cold intolerance','Constipation','Often slower pulse']};
 if(level===2)return {tsh:'Low',hormone:'High',feedback:'Excess thyroid hormone suppresses the upstream signal.',symptoms:['Heat intolerance','Frequent stools','Often rapid pulse / tremor']};
 return {tsh:'Within the expected pattern',hormone:'Balanced',feedback:'Negative feedback keeps output and upstream signals in balance.',symptoms:['No specific excess/deficiency pattern shown']};
}
export const THYROID_TARGETS={
 none:{label:'Choose a target',node:-1,text:'Compare where replacement, synthesis control, and symptom relief act.'},
 replacement:{label:'Levothyroxine',node:2,text:'Synthetic T4 replaces missing thyroid hormone. This is a replacement role; absorption and follow-up matter.'},
 synthesis:{label:'Antithyroid medicine',node:2,text:'Methimazole and PTU reduce new hormone synthesis in the thyroid. They address production rather than merely slowing the pulse.'},
 symptoms:{label:'Beta-blocker',node:3,text:'Beta-blockers reduce selected adrenergic effects, such as tachycardia and tremor. Symptom control differs from stopping thyroid hormone synthesis.'}
};

export const SEIZURE_PATTERNS={
 focalAware:{label:'Focal · awareness preserved',onset:'One hemisphere',awareness:'Preserved during the event',motor:'Depends on the network',phases:[['Before','Usual function before the event.'],['During','An affected network may produce a localized movement, unusual sensation, smell, or rising abdominal feeling. Awareness remains preserved.'],['After','Recovery varies. A focal seizure may remain focal or spread.']]},
 focalImpaired:{label:'Focal · awareness impaired',onset:'One hemisphere',awareness:'Impaired during the event',motor:'Automatisms may occur',phases:[['Before','Usual function; an aura may occur.'],['During','Awareness is impaired. Repetitive movements such as lip-smacking or picking at clothes may appear.'],['After','Postictal confusion can occur. Impaired awareness does not by itself establish bilateral spread.']]},
 absence:{label:'Absence',onset:'Bilateral networks',awareness:'Briefly interrupted',motor:'Brief pause / stare',phases:[['Before','The person is engaged in an activity.'],['During','A brief interruption of awareness may look like staring, sometimes with subtle eyelid movements.'],['After','Typical absence has a rapid return to activity with little or no postictal confusion.']]},
 atonic:{label:'Atonic',onset:'Pattern-dependent networks',awareness:'Can vary',motor:'Sudden loss of tone',phases:[['Before','Muscle tone supports posture.'],['During','Tone abruptly drops. The head may fall or the knees may buckle; injury risk matters.'],['After','Protect from injury and assess recovery. Tone loss is different from stiffening or rhythmic jerking.']]},
 myoclonic:{label:'Myoclonic',onset:'Pattern-dependent networks',awareness:'Often preserved',motor:'Brief shock-like jerks',phases:[['Before','Usual motor activity.'],['During','Very brief jerks affect a body region or both sides. A brief jerk differs from sustained rhythmic clonic activity.'],['After','The brief movement ends; awareness may have remained intact.']]},
 tonicClonic:{label:'Tonic-clonic',onset:'Bilateral; may evolve from focal',awareness:'Lost during the event',motor:'Stiffening, then rhythmic jerking',phases:[['Before','A tonic-clonic event can begin bilaterally or evolve from a focal seizure.'],['Tonic','Sustained muscle contraction produces stiffening.'],['Clonic','Repeated contraction and relaxation produces rhythmic jerking.'],['Postictal','Confusion, sleepiness, headache, or soreness may follow. Assess breathing and recovery.']]}
};

export const HIV_STEPS=[
 {title:'Binding',short:'Find the cell',label:'HIV meets a CD4 cell',text:'The virus attaches to receptors on a susceptible helper immune cell.',input:'Virus outside cell',output:'Attached virus',enzyme:'Receptors / attachment',target:'entry'},
 {title:'Fusion',short:'Enter',label:'Entry into the cell',text:'The viral envelope and cell membrane fuse, allowing viral material to enter.',input:'Attached virus',output:'Viral material inside',enzyme:'Envelope fusion',target:'fusion'},
 {title:'Reverse transcription',short:'RNA to DNA',label:'Change the genetic format',text:'Reverse transcriptase makes a DNA copy from the viral RNA.',input:'HIV RNA',output:'HIV DNA',enzyme:'Reverse transcriptase',target:'reverse'},
 {title:'Integration',short:'Insert DNA',label:'Join the host template',text:'Integrase inserts viral DNA into host DNA. A persistent template can remain in infected cells.',input:'Viral DNA + host DNA',output:'Integrated viral DNA',enzyme:'Integrase',target:'integrase'},
 {title:'Replication',short:'Make components',label:'Use the host machinery',text:'The cell produces viral RNA and proteins from the integrated template.',input:'Integrated template',output:'Viral RNA + proteins',enzyme:'Host-cell machinery',target:'none'},
 {title:'Assembly',short:'Build particles',label:'Bring components together',text:'New RNA and proteins assemble into immature particles at the cell surface.',input:'RNA + proteins',output:'Immature particles',enzyme:'Assembly processes',target:'none'},
 {title:'Budding & maturation',short:'Release and mature',label:'Prepare infectious particles',text:'Particles leave the cell; protease processing helps them mature. These late processes overlap.',input:'Immature particles',output:'Mature infectious particles',enzyme:'Protease',target:'protease'}
];
export const HIV_TARGETS={
 none:{label:'No target selected',text:'Select a drug class to see the step it disrupts.'},
 entry:{label:'Entry inhibitor',text:'Interferes with attachment or entry at the cell surface.'},
 fusion:{label:'Fusion inhibitor',text:'Prevents the membrane-fusion step needed for entry.'},
 reverse:{label:'Reverse transcriptase inhibitor',text:'Disrupts the RNA-to-DNA copying step.'},
 integrase:{label:'Integrase inhibitor',text:'Prevents viral DNA integration into host DNA.'},
 protease:{label:'Protease inhibitor',text:'Disrupts processing required for particle maturation.'}
};

export function initialVisualState(topicId,lessonId){
 return {scope:topicId+':'+lessonId,topicId,lessonId,lessonStep:0,mode:'main',hr:80,sv:70,sbp:120,dbp:60,
  shockCase:({s4:'hypovolemic',s5:'cardiogenic',s6:'neurogenic',s7:'septic'})[lessonId]||'baseline',
  anemiaCase:({a2:'iron',a3:'b12',a4:'aplastic',a5:'hemolytic',a6:'sickle',a7:'thalassemia'})[lessonId]||'reference',hb:15,
  thyroidOutput:lessonId==='t2'?0:lessonId==='t4'||lessonId==='t6'?2:1,central:false,target:'none',
  seizureType:lessonId==='e2'?'focalImpaired':lessonId==='e3'?'absence':lessonId==='e4'?'tonicClonic':'focalAware',phase:0,
  hivStep:lessonId==='h2'?2:0,hivTarget:'none',art:false};
}
export function updateVisualState(state,key,value,lesson){
 const next={...state};
 const numeric={hr:[40,160],sv:[20,120],sbp:[70,200],dbp:[40,120],hb:[3,18],thyroidOutput:[0,2],lessonStep:[0,lesson.flow.length-1],hivStep:[0,6]};
 if(numeric[key])next[key]=clamp(value,...numeric[key]);
 if(['central','art'].includes(key))next[key]=value===true||value==='true';
 if(key==='shockCase'&&SHOCK_CASES[value])next[key]=value;
 if(key==='anemiaCase'&&ANEMIA_CASES[value])next[key]=value;
 if(key==='target'&&THYROID_TARGETS[value])next[key]=value;
 if(key==='hivTarget'&&HIV_TARGETS[value])next[key]=value;
 if(key==='mode'&&['main','compare','pressure'].includes(value))next[key]=value;
 if(key==='seizureType'&&SEIZURE_PATTERNS[value]){next[key]=value;next.phase=0;}
 if(key==='phase')next.phase=clamp(value,0,SEIZURE_PATTERNS[next.seizureType].phases.length-1);
 if(key==='thyroidPreset'){
  if(['balanced','low','high','central'].includes(value)){next.thyroidOutput=value==='balanced'?1:value==='high'?2:0;next.central=value==='central';}
 }
 if(key==='central'&&next.central)next.thyroidOutput=0;
 if(key==='thyroidOutput'&&next.thyroidOutput>0)next.central=false;
 if(next.dbp>=next.sbp){if(key==='dbp')next.sbp=Math.min(200,next.dbp+10);else next.dbp=Math.max(40,next.sbp-10);}
 return next;
}
