// Direct recall prompts. Each fact card covers a specific item to memorize.
// The first three cards keep their existing IDs and term definitions.
// Fact rows contain [prompt, answer, supporting lesson section index].
export const MEMORY_DECKS = {
 s1: {
  terms: ['What does CO stand for, and what does it measure?', 'What does MAP stand for, and what does it describe?', 'What does SVR stand for, and what does it describe?'],
  facts: [
   ['CO = ___ × ___.', 'Heart rate (HR) × stroke volume (SV).', 1],
   ['What is the usual resting formula for estimated MAP?', '(Systolic BP + 2 × diastolic BP) ÷ 3.', 2],
   ['What is the defining circulation problem in shock?', 'Inadequate tissue perfusion.', 0]
  ]
 },
 s2: {
  terms: ['What does ATP stand for, and what is its cellular role?', 'What is hypoperfusion?', 'What does LOC stand for, and what does it assess?'],
  facts: [
   ['Name the three teaching stages of shock in order.', 'Compensated → progressive → irreversible.', 2],
   ['When ATP-dependent ion pumps fail, what happens to cells?', 'Sodium accumulates inside; water follows; cells swell.', 1],
   ['Can blood pressure remain normal during compensated shock?', 'Yes. Compensatory responses can temporarily maintain BP.', 2]
  ]
 },
 s3: {
  terms: ['What does SNS stand for, and what is its circulation role?', 'What does RAAS stand for, and what does it support?', 'What is afterload?'],
  facts: [
   ['What effect does angiotensin II have on blood vessels?', 'Vasoconstriction.', 1],
   ['What does aldosterone promote retaining?', 'Sodium, with water retention supporting circulating volume.', 1],
   ['What does ADH promote retaining?', 'Water, by increasing renal water reabsorption.', 1]
  ]
 },
 s4: {
  terms: ['What is preload?', 'What is third spacing?', 'What is hemorrhage?'],
  facts: [
   ['Which shock type results from too little circulating volume?', 'Hypovolemic shock.', 0],
   ['In hypovolemic shock, does preload rise or fall?', 'It falls as venous return decreases.', 0],
   ['Name two ways circulating volume can be lost.', 'Blood loss and non-blood fluid loss.', 1]
  ]
 },
 s5: {
  terms: ['What does MI stand for, and what tissue is injured?', 'What does PE stand for, and what circulation is obstructed?', 'What is pulmonary edema?'],
  facts: [
   ['Which shock type is caused by failure of the heart pump?', 'Cardiogenic shock.', 0],
   ['Which shock type is caused by a mechanical block to circulation?', 'Obstructive shock.', 1],
   ['Name three major causes of obstructive shock.', 'Severe pulmonary embolism, cardiac tamponade, and tension pneumothorax.', 1]
  ]
 },
 s6: {
  terms: ['What does bradycardia mean?', 'What is angioedema?', 'What is bronchospasm?'],
  facts: [
   ['What is the core mechanism of neurogenic shock?', 'Loss of sympathetic vascular tone.', 1],
   ['What pulse pattern can help distinguish neurogenic shock?', 'Bradycardia rather than the usual compensatory tachycardia.', 1],
   ['What is the first-line medicine for anaphylaxis?', 'Intramuscular epinephrine (adrenaline).', 2]
  ]
 },
 s7: {
  terms: ['What is the definition of sepsis?', 'What does source control mean in infection care?', 'What is a vasopressor?'],
  facts: [
   ['What is the usual first-line vasopressor in adult septic shock?', 'Norepinephrine.', 2],
   ['In the adult septic-shock definition, what MAP must vasopressors maintain?', 'At least 65 mmHg after adequate volume resuscitation.', 0],
   ['In that definition, lactate remains above what value?', '2 mmol/L despite adequate volume resuscitation.', 0]
  ]
 },
 a1: {
  terms: ['What does MCV stand for, and what does it measure?', 'What does MCHC stand for, and what does it measure?', 'What does EPO stand for, and what does it stimulate?'],
  facts: [
   ['Microcytic, normocytic, macrocytic: what cell sizes do they mean?', 'Small, usual size, and large red blood cells, respectively.', 2],
   ['What does hematocrit measure?', 'The fraction of blood volume occupied by red blood cells.', 2],
   ['Which organ produces most erythropoietin?', 'The kidneys.', 1]
  ]
 },
 a2: {
  terms: ['What does blood ferritin help estimate?', 'What does TIBC stand for, and what does it measure?', 'What is pica?'],
  facts: [
   ['What is the typical RBC size and color in iron-deficiency anemia?', 'Microcytic and hypochromic: small and pale.', 0],
   ['In uncomplicated iron deficiency, ferritin is usually ___ and TIBC is usually ___.', 'Ferritin is low; TIBC is high.', 2],
   ['Anisocytosis and poikilocytosis refer to variation in what?', 'Anisocytosis: cell size. Poikilocytosis: cell shape.', 0]
  ]
 },
 a3: {
  terms: ['What protein is needed for normal dietary vitamin B12 absorption?', 'What does megaloblastic describe?', 'What is pernicious anemia?'],
  facts: [
   ['Is the typical MCV low or high in vitamin B12 deficiency?', 'High: a macrocytic, often megaloblastic pattern.', 0],
   ['Name three possible neurologic symptoms of B12 deficiency.', 'Numbness, tingling, and balance problems.', 1],
   ['Where is dietary vitamin B12 normally absorbed with intrinsic factor?', 'The terminal ileum.', 2]
  ]
 },
 a4: {
  terms: ['What is pancytopenia?', 'What are petechiae?', 'What does hypocellular marrow mean?'],
  facts: [
   ['What is the core mechanism of aplastic anemia?', 'Bone-marrow production failure.', 0],
   ['Low RBCs, low white cells, low platelets: match each to a main risk.', 'RBCs: anemia/fatigue. White cells: infection. Platelets: bleeding.', 1],
   ['What is the term for low RBCs, white cells, and platelets together?', 'Pancytopenia.', 0]
  ]
 },
 a5: {
  terms: ['What is hemolysis?', 'What is a reticulocyte?', 'What does the direct antiglobulin test (DAT / Coombs) detect?'],
  facts: [
   ['Which heme-breakdown product can cause jaundice in hemolysis?', 'Bilirubin, often with increased unconjugated bilirubin.', 1],
   ['With a functioning marrow, do reticulocytes usually rise or fall in hemolysis?', 'They usually rise to replace destroyed RBCs.', 2],
   ['What are the typical LDH and haptoglobin trends in hemolysis?', 'LDH may rise; haptoglobin may fall.', 2]
  ]
 },
 a6: {
  terms: ['What does HbS stand for?', 'What is vaso-occlusion?', 'What does HbF stand for, and what is its effect on sickling?'],
  facts: [
   ['What happens to deoxygenated HbS?', 'It can polymerize, making red cells rigid and prone to sickling.', 0],
   ['Name the two main consequences of sickling.', 'Hemolysis and vaso-occlusion.', 0],
   ['Which hemoglobin does hydroxyurea increase?', 'Fetal hemoglobin (HbF).', 2]
  ]
 },
 a7: {
  terms: ['What is a globin chain?', 'What is iron chelation?', 'What does splenomegaly mean?'],
  facts: [
   ['What is reduced in thalassemia?', 'Alpha- or beta-globin chain production.', 0],
   ['What is the usual RBC pattern in thalassemia?', 'Microcytic and hypochromic.', 0],
   ['What excess metal can accumulate after repeated transfusions?', 'Iron.', 1]
  ]
 },
 t1: {
  terms: ['What does TSH stand for, and which gland releases it?', 'What are the full names of T3 and T4?', 'What is negative feedback?'],
  facts: [
   ['Complete the hormone pathway: hypothalamus ___ → pituitary ___ → thyroid ___.', 'TRH → TSH → T3 and T4.', 0],
   ['What is the usual lab pattern in overt primary hypothyroidism?', 'High TSH and low free T4.', 1],
   ['What is the usual lab pattern in overt primary hyperthyroidism?', 'Low TSH and high free T4 and/or T3.', 1]
  ]
 },
 t2: {
  terms: ['Which autoimmune thyroid disorder commonly causes hypothyroidism?', 'What tissue change does myxedema describe?', 'What hormone does levothyroxine replace?'],
  facts: [
   ['Does hypothyroidism typically cause cold intolerance or heat intolerance?', 'Cold intolerance.', 0],
   ['Does hypothyroidism typically cause constipation or frequent stools?', 'Constipation.', 0],
   ['Which two supplements can reduce levothyroxine absorption when taken together?', 'Iron and calcium.', 2]
  ]
 },
 t3: {
  terms: ['What is a goiter?', 'What does congenital mean?', 'What is the purpose of newborn screening?'],
  facts: [
   ['Can a goiter occur with high, low, or normal thyroid function?', 'All three: high, low, or normal thyroid function.', 0],
   ['Which missing building material can cause goiter with low thyroid hormone?', 'Iodine.', 0],
   ['Which two developmental functions make early thyroid hormone essential?', 'Brain development and growth.', 1]
  ]
 },
 t4: {
  terms: ['What antibody action causes Graves disease?', 'What does thyrotoxicosis mean?', 'What does exophthalmos mean?'],
  facts: [
   ['Does hyperthyroidism typically cause cold intolerance or heat intolerance?', 'Heat intolerance.', 0],
   ['Does hyperthyroidism typically cause a slow pulse or a rapid pulse?', 'A rapid pulse (tachycardia).', 0],
   ['Which term specifically means excess synthesis and secretion by the thyroid gland?', 'Hyperthyroidism.', 2]
  ]
 },
 t5: {
  terms: ['What does PTU stand for, and what does it reduce?', 'What is the symptom-control role of a beta-blocker?', 'What does a thyroid fine-needle biopsy sample?'],
  facts: [
   ['Name two medicines that reduce new thyroid hormone synthesis.', 'Methimazole and propylthiouracil (PTU).', 1],
   ['Which thyroid treatment reduces active tissue using a radioactive substance?', 'Radioactive iodine therapy.', 2],
   ['In which two conditions is radioactive iodine treatment avoided?', 'Pregnancy and breastfeeding.', 2]
  ]
 },
 t6: {
  terms: ['What is thyroid storm?', 'What does CNS stand for, and what structures does it include?', 'What is a myxedema emergency also commonly called?'],
  facts: [
   ['Thyroid storm: hot or cold, fast or slow?', 'Hot and fast: fever and marked tachycardia are typical clues.', 0],
   ['Myxedema emergency: hot or cold, fast or slow?', 'Cold and slow: hypothermia and slowed body functions are typical clues.', 2],
   ['Can an isolated high T4 result establish thyroid storm?', 'No. Thyroid storm is a clinical diagnosis involving severe deterioration.', 0]
  ]
 },
 e1: {
  terms: ['What is a neuron?', 'What makes a seizure provoked?', 'What persistent predisposition defines epilepsy?'],
  facts: [
   ['What type of brain activity produces a seizure?', 'Abnormal, excessive or synchronized neuronal activity.', 0],
   ['Does one seizure automatically establish epilepsy?', 'No.', 0],
   ['Name two acute metabolic disturbances that can provoke a seizure.', 'Hypoglycemia and electrolyte disturbances.', 1]
  ]
 },
 e2: {
  terms: ['What is an aura in a seizure?', 'What is an automatism?', 'What does postictal mean?'],
  facts: [
   ['Where do focal seizures begin?', 'In networks within one cerebral hemisphere.', 0],
   ['Can awareness be preserved during a focal seizure?', 'Yes. Focal seizures can preserve or impair awareness.', 0],
   ['Name two examples of seizure automatisms.', 'Lip-smacking and repetitive hand movements such as picking at clothing.', 1]
  ]
 },
 e3: {
  terms: ['What is the typical awareness pattern of an absence seizure?', 'What happens to muscle tone in an atonic seizure?', 'What movement characterizes a myoclonic seizure?'],
  facts: [
   ['Brief staring with rapid return to activity suggests which seizure pattern?', 'Absence seizure.', 0],
   ['Sudden loss of muscle tone with an abrupt fall suggests which pattern?', 'Atonic seizure.', 1],
   ['Brief shock-like jerks suggest which seizure pattern?', 'Myoclonic seizure.', 2]
  ]
 },
 e4: {
  terms: ['What does tonic mean?', 'What does clonic mean?', 'What is cyanosis?'],
  facts: [
   ['Name the motor phases of a tonic-clonic seizure in order.', 'Tonic stiffening → clonic rhythmic jerking.', 0],
   ['What is the recovery period after a seizure called?', 'The postictal period.', 1],
   ['Name three possible postictal symptoms.', 'Confusion, sleepiness, and headache.', 1]
  ]
 },
 e5: {
  terms: ['What does EEG stand for, and what does it record?', 'What do MRI and CT stand for, and what do they assess?', 'What is the purpose of an antiseizure medicine?'],
  facts: [
   ['EEG, MRI/CT, blood tests: match each to its main target.', 'EEG: electrical activity. MRI/CT: structure. Blood tests: metabolic disturbances.', 0],
   ['Does a normal routine EEG exclude epilepsy?', 'No. A short recording may miss abnormal activity.', 0],
   ['Should antiseizure medicine be stopped abruptly without clinician guidance?', 'No. Withdrawal requires clinician assessment and supervision.', 2]
  ]
 },
 e6: {
  terms: ['What is status epilepticus?', 'Which medicine class is used for acute seizure rescue under a protocol?', 'What does SUDEP stand for?'],
  facts: [
   ['What convulsive seizure duration is an important emergency-action threshold?', 'About 5 minutes, or repeated seizures without recovery.', 1],
   ['Should you restrain a person or put an object in their mouth during a seizure?', 'No to both.', 0],
   ['When safe, what body position supports seizure recovery?', 'On the side, while assessing breathing and protecting from injury.', 0]
  ]
 },
 h1: {
  terms: ['What does HIV stand for?', 'What is a CD4 helper cell?', 'What does U=U mean, and which transmission route does it concern?'],
  facts: [
   ['What does AIDS stand for?', 'Acquired immunodeficiency syndrome.', 0],
   ['Is HIV an RNA retrovirus or a DNA virus?', 'An RNA retrovirus.', 0],
   ['Does ordinary casual contact, such as hugging, transmit HIV?', 'No.', 1]
  ]
 },
 h2: {
  terms: ['What does HIV reverse transcriptase copy into what?', 'What does HIV integrase insert, and where?', 'What does HIV protease cleave?'],
  facts: [
   ['Which HIV enzyme copies viral RNA into DNA?', 'Reverse transcriptase.', 0],
   ['Which HIV enzyme inserts viral DNA into host DNA?', 'Integrase.', 0],
   ['Which HIV enzyme cuts polyproteins into functional components?', 'Protease.', 1]
  ]
 },
 h3: {
  terms: ['What does HIV viral load measure?', 'What is clinical latency in HIV?', 'What is an opportunistic infection?'],
  facts: [
   ['What adult CD4 count is an AIDS-defining threshold in a person with HIV?', 'Below 200 cells/µL; an AIDS-defining illness can also establish AIDS.', 2],
   ['What does a CD4 count measure?', 'The number of CD4 helper immune cells.', 1],
   ['What are the full names of PJP/PCP and one AIDS-associated malignancy?', 'Pneumocystis jirovecii pneumonia; Kaposi sarcoma.', 2]
  ]
 },
 h4: {
  terms: ['What is a test window period?', 'What do NAT and PCR stand for, and what do they target?', 'What are maternal antibodies?'],
  facts: [
   ['Antibody test, antigen test, NAT: match each to what it detects.', 'Antibody: immune response. Antigen: viral protein. NAT: viral genetic material.', 0],
   ['Can a negative HIV test very soon after exposure exclude infection?', 'No. Infection may be within the test-specific window period.', 1],
   ['Why is virologic testing important in young HIV-exposed infants?', 'Maternal antibodies can make antibody-only diagnosis unreliable.', 2]
  ]
 },
 h5: {
  terms: ['What does ART stand for, and what does it suppress?', 'What is HIV drug resistance?', 'What is viral suppression?'],
  facts: [
   ['What does the historical abbreviation HAART stand for?', 'Highly active antiretroviral therapy.', 0],
   ['With effective ART, what are the usual viral-load and CD4 trends?', 'Viral load falls; CD4 count can rise.', 1],
   ['Does an undetectable viral load mean all persistent HIV reservoirs are gone?', 'No. Ongoing treatment and monitoring remain necessary.', 2]
  ]
 },
 h6: {
  terms: ['What does PrEP stand for, and when is it used?', 'What does PEP stand for, and when is it used?', 'What is perinatal transmission?'],
  facts: [
   ['PEP should start as soon as possible and within how many hours when indicated?', '72 hours after possible exposure; assessment is urgent.', 0],
   ['How long is the usual PEP course?', '28 days.', 0],
   ['Before exposure, after exposure, established HIV: match each to PrEP, PEP, or ART.', 'Before: PrEP. After: PEP. Established HIV: ART.', 0]
  ]
 }
};
