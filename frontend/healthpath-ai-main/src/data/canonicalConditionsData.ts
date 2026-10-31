export interface CanonicalCondition {
  id: string;
  name: string;
  specialization: string;
  icd10: string;
  urgency: "routine" | "urgent" | "emergency";
  procedure: string;
  bodySystem: string;
  topSymptoms: string[];
  description: string;
}

export const GENERAL_MEDICINE_OPTION: CanonicalCondition = {
  id: "general_medicine_consultation",
  name: "General Medicine / Physician Consultation",
  specialization: "General Medicine",
  icd10: "Z00.00",
  urgency: "routine",
  procedure: "Comprehensive In-Person Clinical Assessment & Diagnostic Workup",
  bodySystem: "General Medicine",
  topSymptoms: [
    "Unsure about exact condition",
    "Multiple mild or overlapping symptoms",
    "General discomfort or fatigue",
    "Initial clinical assessment required"
  ],
  description: "Recommended starting point when experiencing generalized, uncertain, or multiple symptoms. A General Physician conducts in-person physical examinations and orders lab diagnostics."
};

export const CANONICAL_CONDITIONS: CanonicalCondition[] = [
  {
    id: "acne",
    name: "Acne",
    specialization: "Dermatology",
    icd10: "L70.0",
    urgency: "routine",
    procedure: "Dermatological Skin Evaluation & Acne Care",
    bodySystem: "Dermatology & Skin",
    topSymptoms: [
      "Facial pimples and blackheads",
      "Painful red bumps on face or back",
      "Pustules with whiteheads",
      "Oily skin with clogged pores",
      "Cystic skin blemishes"
    ],
    description: "Common inflammatory skin condition of the sebaceous glands and hair follicles leading to comedones, papules, and pustules."
  },
  {
    id: "allergic_conjunctivitis",
    name: "Allergic Conjunctivitis",
    specialization: "Ophthalmology",
    icd10: "H10.1",
    urgency: "routine",
    procedure: "Allergy Eye Evaluation & Antihistamine Therapy",
    bodySystem: "Ophthalmology & Vision",
    topSymptoms: [
      "Itchy and watery eyes",
      "Redness in both eyes",
      "Puffy or swollen eyelids",
      "Sensitivity to bright light",
      "Stringy eye discharge"
    ],
    description: "Allergic inflammation of the eye conjunctiva caused by airborne allergens, characterized by intense itching and lacrimation."
  },
  {
    id: "allergic_reaction_urticaria",
    name: "Allergic Reaction / Urticaria",
    specialization: "General Medicine",
    icd10: "L50.9",
    urgency: "urgent",
    procedure: "Antihistamine Administration & Hypersensitivity Care",
    bodySystem: "Dermatology & Skin",
    topSymptoms: [
      "Raised itchy red hives",
      "Sudden skin wheals or welts",
      "Swelling of lips or face",
      "Intense itching after exposure",
      "Warm flushed skin"
    ],
    description: "Acute vascular reaction of the skin causing transient, pruritic, erythematous wheals from histamine release."
  },
  {
    id: "allergic_rhinitis",
    name: "Allergic Rhinitis",
    specialization: "ENT",
    icd10: "J30.9",
    urgency: "routine",
    procedure: "Allergen Identification & Nasal Steroid Management",
    bodySystem: "ENT & Throat",
    topSymptoms: [
      "Sneezing fits",
      "Clear runny nose",
      "Nasal congestion and stuffiness",
      "Itchy nose and roof of mouth",
      "Watery itchy eyes"
    ],
    description: "Inflammation of nasal mucous membranes induced by allergen exposure, causing sneezing, rhinorrhea, and nasal obstruction."
  },
  {
    id: "anal_fissure",
    name: "Anal Fissure",
    specialization: "General Surgery",
    icd10: "K60.2",
    urgency: "routine",
    procedure: "Anal Manometry & Sphincter Relaxation Therapy",
    bodySystem: "Gastrointestinal",
    topSymptoms: [
      "Sharp pain during bowel movements",
      "Bright red blood on toilet paper",
      "Tearing sensation in anal area",
      "Anal spasms after defecation",
      "Persistent rectal burning"
    ],
    description: "Small tear in the thin moist tissue lining the anus, frequently resulting from passing hard stools."
  },
  {
    id: "anxiety_disorder",
    name: "Anxiety Disorder",
    specialization: "Psychiatry",
    icd10: "F41.0",
    urgency: "routine",
    procedure: "Psychiatric Evaluation & Cognitive Behavioral Protocol",
    bodySystem: "Mental Health",
    topSymptoms: [
      "Excessive persistent worry or fear",
      "Restlessness or feeling on edge",
      "Rapid heart rate during stress",
      "Muscle tension and difficulty concentrating",
      "Trouble falling or staying asleep"
    ],
    description: "Mental health disorder characterized by significant, disproportionate worry and physiological autonomic arousal."
  },
  {
    id: "appendicitis",
    name: "Appendicitis",
    specialization: "General Surgery",
    icd10: "K35.80",
    urgency: "emergency",
    procedure: "Emergency Abdominal Sonography & Appendectomy",
    bodySystem: "Gastrointestinal",
    topSymptoms: [
      "Dull pain near navel moving to lower right belly",
      "Sharp right lower quadrant abdominal pain",
      "Low grade fever with chills",
      "Nausea and vomiting after pain begins",
      "Abdominal bloating and tenderness"
    ],
    description: "Acute inflammation of the vermiform appendix; a medical emergency that typically requires prompt surgical removal."
  },
  {
    id: "asthma",
    name: "Asthma",
    specialization: "Pulmonology",
    icd10: "J45.909",
    urgency: "urgent",
    procedure: "Spirometry, Bronchodilator Reversibility & Inhaler Regimen",
    bodySystem: "Respiratory",
    topSymptoms: [
      "Shortness of breath on exertion",
      "Wheezing or whistling sound when breathing",
      "Chest tightness or band-like pressure",
      "Dry coughing fits especially at night",
      "Difficulty speaking in full sentences"
    ],
    description: "Chronic inflammatory disorder of the airways characterized by episodic airflow obstruction and airway hyperresponsiveness."
  },
  {
    id: "bacterial_vaginosis",
    name: "Bacterial Vaginosis",
    specialization: "Gynecology",
    icd10: "N76.0",
    urgency: "routine",
    procedure: "Vaginal Wet Mount Microscopy & Targeted Antimicrobial Care",
    bodySystem: "Women's Health",
    topSymptoms: [
      "Thin grayish-white vaginal discharge",
      "Noticeable fishy odor especially after intercourse",
      "Mild vaginal itching or irritation",
      "Burning sensation while urinating",
      "Absence of significant genital redness"
    ],
    description: "Dysbiosis of vaginal flora with reduction of lactobacilli and overgrowth of anaerobic bacteria."
  },
  {
    id: "benign_prostatic_hyperplasia_bph",
    name: "Benign Prostatic Hyperplasia / BPH",
    specialization: "Urology",
    icd10: "N40.0",
    urgency: "routine",
    procedure: "Prostate Ultrasound, Uroflowmetry & Alpha-Blocker Therapy",
    bodySystem: "Urinary & Renal",
    topSymptoms: [
      "Weak or interrupted urine stream",
      "Difficulty starting urination (hesitancy)",
      "Frequent nighttime urination (nocturia)",
      "Feeling of incomplete bladder emptying",
      "Urgent need to urinate"
    ],
    description: "Non-malignant enlargement of the prostate gland leading to lower urinary tract symptoms in men."
  },
  {
    id: "blepharitis",
    name: "Blepharitis",
    specialization: "Ophthalmology",
    icd10: "H01.00",
    urgency: "routine",
    procedure: "Slit-Lamp Meibomian Gland Evaluation & Lid Hygiene Regimen",
    bodySystem: "Ophthalmology & Vision",
    topSymptoms: [
      "Flaking or dandruff-like scales around eyelashes",
      "Red swollen and greasy eyelids",
      "Gritty burning sensation in eyes",
      "Crusted eyelashes upon waking",
      "Photophobia or sensitivity to light"
    ],
    description: "Chronic inflammation of the eyelid margins, often involving the meibomian glands."
  },
  {
    id: "bronchitis",
    name: "Bronchitis",
    specialization: "Pulmonology",
    icd10: "J40",
    urgency: "routine",
    procedure: "Chest Radiography, Peak Flow Assessment & Bronchial Care",
    bodySystem: "Respiratory",
    topSymptoms: [
      "Persistent cough producing clear or colored mucus",
      "Mild shortness of breath with physical activity",
      "Substernal chest discomfort during coughing",
      "Low grade fever and fatigue",
      "Sore scratchy throat with nasal congestion"
    ],
    description: "Inflammation of the mucous membranes of the bronchial tubes, commonly following an upper respiratory viral illness."
  },
  {
    id: "carpal_tunnel_syndrome",
    name: "Carpal Tunnel Syndrome",
    specialization: "Orthopedics",
    icd10: "G56.00",
    urgency: "routine",
    procedure: "Nerve Conduction Study (NCS), Wrist Splinting & Ergonomic Care",
    bodySystem: "Orthopedics & Joints",
    topSymptoms: [
      "Tingling or pins and needles in thumb and fingers",
      "Numbness in hand waking patient from sleep",
      "Weak grip or tendency to drop objects",
      "Dull ache radiating up forearm",
      "Relief of symptoms after shaking or flicking wrist"
    ],
    description: "Entrapment neuropathy of the median nerve at the wrist, causing paresthesias and motor weakness in the hand."
  },
  {
    id: "cellulitis",
    name: "Cellulitis",
    specialization: "General Medicine",
    icd10: "L03.90",
    urgency: "urgent",
    procedure: "Clinical Demarcation, Systemic Antibiotic Protocol & Monitoring",
    bodySystem: "Dermatology & Skin",
    topSymptoms: [
      "Rapidly spreading red warm skin area",
      "Swelling and localized skin tenderness",
      "Skin feels tight glossy or stretched",
      "Fever chills and malaise",
      "Enlarged tender regional lymph nodes"
    ],
    description: "Spreading bacterial infection of the dermis and subcutaneous tissues, typically caused by staphylococci or streptococci."
  },
  {
    id: "cervical_spondylosis",
    name: "Cervical Spondylosis",
    specialization: "Orthopedics",
    icd10: "M47.812",
    urgency: "routine",
    procedure: "Cervical Spine Radiography, Physiotherapy & Postural Protocol",
    bodySystem: "Orthopedics & Joints",
    topSymptoms: [
      "Neck stiffness and dull aching pain",
      "Pain worsening with prolonged neck turning",
      "Tingling or numbness radiating into shoulders or arms",
      "Grinding or popping noise when moving neck",
      "Headache originating at base of skull"
    ],
    description: "Age-related wear-and-tear of the cervical spine discs and facet joints, causing neck pain and possible radiculopathy."
  },
  {
    id: "common_cold_upper_respiratory_infection",
    name: "Common Cold / Upper Respiratory Infection",
    specialization: "General Medicine",
    icd10: "J00",
    urgency: "routine",
    procedure: "Symptomatic Respiratory Care & Supportive Decongestant Protocol",
    bodySystem: "Respiratory",
    topSymptoms: [
      "Runny or congested nose",
      "Scratchy or sore throat",
      "Sneezing and watery eyes",
      "Mild cough and throat clearing",
      "Low grade fever with general fatigue"
    ],
    description: "Self-limiting viral infection of the upper respiratory tract involving rhinovirus, adenovirus, or coronavirus."
  },
  {
    id: "conjunctivitis",
    name: "Conjunctivitis",
    specialization: "Ophthalmology",
    icd10: "H10.9",
    urgency: "routine",
    procedure: "Slit-Lamp Ophthalmic Examination & Targeted Topical Therapy",
    bodySystem: "Ophthalmology & Vision",
    topSymptoms: [
      "Redness in white part of eye (pink eye)",
      "Yellow or green discharge causing crusted eyelids",
      "Gritty sandy feeling in eye",
      "Increased tearing and mild sensitivity to light",
      "Burning sensation without significant pain"
    ],
    description: "Inflammation of the transparent conjunctiva from bacterial, viral, or chemical causes."
  },
  {
    id: "contact_dermatitis",
    name: "Contact Dermatitis",
    specialization: "Dermatology",
    icd10: "L23.9",
    urgency: "routine",
    procedure: "Skin Patch Testing, Allergen Avoidance & Topical Steroid Care",
    bodySystem: "Dermatology & Skin",
    topSymptoms: [
      "Red itchy rash localized to contact area",
      "Dry cracked scaly skin patches",
      "Small blisters that may weep fluid",
      "Burning or stinging sensation on skin",
      "Swelling and tenderness after chemical exposure"
    ],
    description: "Acute or chronic eczematous skin reaction resulting from direct contact with allergens or irritants."
  },
  {
    id: "dental_abscess",
    name: "Dental Abscess",
    specialization: "Dentistry",
    icd10: "K04.7",
    urgency: "urgent",
    procedure: "Periapical Dental Radiography, Incision/Drainage & Endodontic Care",
    bodySystem: "Dental & Oral",
    topSymptoms: [
      "Severe throbbing toothache radiating to jaw or ear",
      "Swelling of gum cheek or face",
      "Sensitivity to hot and cold temperatures",
      "Foul taste in mouth from draining pus",
      "Tender swollen lymph nodes under jaw"
    ],
    description: "Localized collection of pus associated with a tooth, originating from dental caries or periodontal infection."
  },
  {
    id: "depressive_symptoms",
    name: "Depressive Symptoms",
    specialization: "Psychiatry",
    icd10: "F32.9",
    urgency: "routine",
    procedure: "Comprehensive Psychiatric Screening & Clinical Psychotherapy",
    bodySystem: "Mental Health",
    topSymptoms: [
      "Persistent feelings of sadness or emptiness",
      "Loss of interest in hobbies and daily activities",
      "Significant changes in appetite or sleep patterns",
      "Constant fatigue and lack of energy",
      "Difficulty concentrating or making decisions"
    ],
    description: "Mood disturbance characterized by persistent low affect, anhedonia, and vegetative neurovegetative symptoms."
  },
  {
    id: "eczema_atopic_dermatitis",
    name: "Eczema / Atopic Dermatitis",
    specialization: "Dermatology",
    icd10: "L20.9",
    urgency: "routine",
    procedure: "Skin Barrier Evaluation, Emollient Regimen & Topical Therapy",
    bodySystem: "Dermatology & Skin",
    topSymptoms: [
      "Intense itching especially at night",
      "Dry red patches in skin creases (elbows, knees)",
      "Small raised bumps leaking fluid when scratched",
      "Thickened leathery skin (lichenification)",
      "Sensitive inflamed skin flares"
    ],
    description: "Chronic relapsing inflammatory skin disease characterized by pruritus, xerosis, and eczematous lesions."
  },
  {
    id: "endometriosis",
    name: "Endometriosis",
    specialization: "Gynecology",
    icd10: "N80.9",
    urgency: "routine",
    procedure: "Pelvic Ultrasound, Hormonal Suppression & Gynecological Care",
    bodySystem: "Women's Health",
    topSymptoms: [
      "Severe menstrual cramps (dysmenorrhea)",
      "Chronic pelvic pain before and during periods",
      "Pain during or after sexual intercourse",
      "Painful bowel movements during menstruation",
      "Heavy menstrual bleeding or spotting"
    ],
    description: "Presence of functional endometrial-like tissue outside the uterine cavity causing chronic inflammation and pain."
  },
  {
    id: "frozen_shoulder",
    name: "Frozen Shoulder",
    specialization: "Orthopedics",
    icd10: "M75.0",
    urgency: "routine",
    procedure: "Shoulder Range of Motion Analysis & Hydrodilatation / PT",
    bodySystem: "Orthopedics & Joints",
    topSymptoms: [
      "Dull aching pain in shoulder worsening at night",
      "Severe restriction of shoulder movements",
      "Inability to reach behind back or raise arm",
      "Stiffness progressing through freezing stages",
      "Difficulty performing daily overhead activities"
    ],
    description: "Adhesive capsulitis characterized by progressive, painful loss of active and passive glenohumeral motion."
  },
  {
    id: "gastritis",
    name: "Gastritis",
    specialization: "Gastroenterology",
    icd10: "K29.70",
    urgency: "routine",
    procedure: "Upper GI Endoscopy, H. Pylori Testing & Acid Suppression",
    bodySystem: "Gastrointestinal",
    topSymptoms: [
      "Gnawing or burning ache in upper abdomen",
      "Nausea and recurrent belching",
      "Feeling of fullness after eating small meals",
      "Loss of appetite and stomach bloating",
      "Pain temporarily relieved or worsened by food"
    ],
    description: "Inflammation, irritation, or erosion of the gastric mucosa by acid, NSAIDs, or H. pylori."
  },
  {
    id: "gastroenteritis",
    name: "Gastroenteritis",
    specialization: "Gastroenterology",
    icd10: "A09",
    urgency: "urgent",
    procedure: "Stool Analysis, Oral Rehydration Protocol & Enteric Care",
    bodySystem: "Gastrointestinal",
    topSymptoms: [
      "Watery diarrhea and frequent loose stools",
      "Abdominal cramps and stomach pain",
      "Nausea and repeated vomiting",
      "Low grade fever with muscle aches",
      "Dehydration signs like dry mouth and thirst"
    ],
    description: "Acute infectious inflammation of the gastrointestinal tract commonly known as stomach flu or foodborne illness."
  },
  {
    id: "gastroesophageal_reflux_disease_gerd",
    name: "Gastroesophageal Reflux Disease / GERD",
    specialization: "Gastroenterology",
    icd10: "K21.9",
    urgency: "routine",
    procedure: "Esophageal pH Monitoring & Anti-Reflux Protocol",
    bodySystem: "Gastrointestinal",
    topSymptoms: [
      "Heartburn burning sensation behind breastbone",
      "Sour or bitter acid regurgitation in throat",
      "Discomfort worsening when lying flat or bending",
      "Chest burning after heavy or fatty meals",
      "Difficulty or pain while swallowing"
    ],
    description: "Retrograde flow of gastric contents into the esophagus leading to bothersome symptoms or mucosal injury."
  },
  {
    id: "gingivitis_periodontal_disease",
    name: "Gingivitis / Periodontal Disease",
    specialization: "Dentistry",
    icd10: "K05.10",
    urgency: "routine",
    procedure: "Periodontal Probing, Ultrasonic Scaling & Deep Root Planing",
    bodySystem: "Dental & Oral",
    topSymptoms: [
      "Gums bleeding easily during brushing or flossing",
      "Swollen dusky red or tender gums",
      "Persistent bad breath (halitosis)",
      "Receding gum line exposing tooth roots",
      "Pockets forming between teeth and gums"
    ],
    description: "Inflammation of gingival tissues caused by bacterial plaque, potentially progressing to periodontitis and bone loss."
  },
  {
    id: "hemorrhoids",
    name: "Hemorrhoids",
    specialization: "General Surgery",
    icd10: "K64.9",
    urgency: "routine",
    procedure: "Anoscopic Examination, Sclerotherapy / Banding Consultation",
    bodySystem: "Gastrointestinal",
    topSymptoms: [
      "Painless bright red bleeding during bowel movements",
      "Itching or irritation in anal region",
      "Painful swelling or lump near anus",
      "Anal ache or discomfort especially while sitting",
      "Mucus discharge after passing stool"
    ],
    description: "Enlarged vascular cushions in the lower rectum and anus causing bleeding, prolapse, and perianal itching."
  },
  {
    id: "hypothyroidism",
    name: "Hypothyroidism",
    specialization: "Endocrinology",
    icd10: "E03.9",
    urgency: "routine",
    procedure: "Serum TSH / Free T4 Assay & Levothyroxine Titration",
    bodySystem: "Endocrine & Metabolic",
    topSymptoms: [
      "Unexplained fatigue and sluggishness",
      "Increased sensitivity to cold temperatures",
      "Unintentional weight gain despite normal diet",
      "Dry coarse skin and thinning hair",
      "Constipation and muscle weakness"
    ],
    description: "Deficiency of thyroid hormone production by the thyroid gland, leading to reduced metabolic rate."
  },
  {
    id: "influenza",
    name: "Influenza",
    specialization: "General Medicine",
    icd10: "J11.1",
    urgency: "routine",
    procedure: "Rapid Influenza Antigen Test & Antiviral/Supportive Regimen",
    bodySystem: "Respiratory",
    topSymptoms: [
      "Sudden high fever with shaking chills",
      "Severe generalized muscle and body aches",
      "Extreme exhaustion and fatigue",
      "Dry hacking cough and sore throat",
      "Frontal headache and eye burning"
    ],
    description: "Acute viral respiratory illness caused by influenza viruses A or B, featuring abrupt onset of constitutional symptoms."
  },
  {
    id: "iron_deficiency_anaemia",
    name: "Iron-Deficiency Anaemia",
    specialization: "Hematology",
    icd10: "D50.9",
    urgency: "routine",
    procedure: "Complete Blood Count (CBC), Ferritin Assay & Iron Therapy",
    bodySystem: "Hematology & Blood",
    topSymptoms: [
      "Extreme fatigue and weakness",
      "Pale skin and conjunctiva (pallor)",
      "Shortness of breath with minimal exertion",
      "Dizziness or lightheadedness when standing",
      "Cold hands and feet with brittle nails"
    ],
    description: "Microcytic hypochromic anemia resulting from inadequate iron stores for hemoglobin synthesis."
  },
  {
    id: "irritable_bowel_syndrome_ibs",
    name: "Irritable Bowel Syndrome / IBS",
    specialization: "Gastroenterology",
    icd10: "K58.9",
    urgency: "routine",
    procedure: "Rome IV Diagnostic Evaluation & Dietary FODMAP Protocol",
    bodySystem: "Gastrointestinal",
    topSymptoms: [
      "Cramping abdominal pain related to bowel movements",
      "Alternating diarrhea and constipation",
      "Abdominal bloating and excessive gas",
      "Feeling of incomplete bowel evacuation",
      "Mucus present in stool"
    ],
    description: "Functional gastrointestinal disorder characterized by recurrent abdominal pain associated with defecation or change in bowel habits."
  },
  {
    id: "kidney_stones",
    name: "Kidney Stones",
    specialization: "Urology",
    icd10: "N20.0",
    urgency: "urgent",
    procedure: "Non-Contrast Helical CT KUB & Lithotripsy Evaluation",
    bodySystem: "Urinary & Renal",
    topSymptoms: [
      "Severe sharp cramping pain in flank and back",
      "Pain radiating to lower abdomen and groin",
      "Pink red or brown blood in urine (hematuria)",
      "Pain during urination with frequent urges",
      "Nausea and vomiting during pain episodes"
    ],
    description: "Hard mineral and salt deposits that form inside kidneys, causing severe colicky pain when migrating through the ureter."
  },
  {
    id: "migraine",
    name: "Migraine",
    specialization: "Neurology",
    icd10: "G43.909",
    urgency: "routine",
    procedure: "Neurological Clinical Assessment & Triptan/Prophylactic Protocol",
    bodySystem: "Neurology",
    topSymptoms: [
      "Throbbing pulsating pain on one side of head",
      "Nausea and sensitivity to bright lights (photophobia)",
      "Sensitivity to normal sounds (phonophobia)",
      "Visual aura like flickering lights or zigzag lines",
      "Headache worsened by routine physical activity"
    ],
    description: "Primary neurovascular headache disorder characterized by recurrent attacks of moderate to severe throbbing pain."
  },
  {
    id: "muscle_strain_sprain",
    name: "Muscle Strain / Sprain",
    specialization: "Orthopedics",
    icd10: "S39.012A",
    urgency: "routine",
    procedure: "Musculoskeletal Ultrasound, RICE Protocol & Physical Rehabilitation",
    bodySystem: "Orthopedics & Joints",
    topSymptoms: [
      "Sudden sharp pain during physical activity",
      "Localized tenderness and muscle swelling",
      "Stiffness and reduced range of motion",
      "Muscle spasms and weakness in affected area",
      "Bruising appearing hours after injury"
    ],
    description: "Injury to muscle fibers or tendons from overstretching, tear, or sudden mechanical stress."
  },
  {
    id: "osteoarthritis",
    name: "Osteoarthritis",
    specialization: "Orthopedics",
    icd10: "M19.90",
    urgency: "routine",
    procedure: "Joint Radiography, Viscosupplementation & Physical Therapy",
    bodySystem: "Orthopedics & Joints",
    topSymptoms: [
      "Joint pain and aching during activity",
      "Joint stiffness after resting or in morning",
      "Loss of joint flexibility and creaking (crepitus)",
      "Swelling or tenderness around knee or hip",
      "Bone spurs or hard lumps around affected joints"
    ],
    description: "Degenerative joint disease involving progressive breakdown of articular cartilage and underlying bone."
  },
  {
    id: "otitis_externa",
    name: "Otitis Externa",
    specialization: "ENT",
    icd10: "H60.90",
    urgency: "routine",
    procedure: "Otic Debridement, Topical Antibacterial/Steroid Ear Drops",
    bodySystem: "ENT & Throat",
    topSymptoms: [
      "Severe pain when pulling outer ear (pinna) or tragus",
      "Itching inside ear canal",
      "Yellowish-green discharge from ear canal",
      "Swelling and redness of ear opening",
      "Muffled hearing or fullness in ear"
    ],
    description: "Infection and inflammation of the external auditory canal, often known as swimmer's ear."
  },
  {
    id: "otitis_media",
    name: "Otitis Media",
    specialization: "ENT",
    icd10: "H66.90",
    urgency: "urgent",
    procedure: "Pneumatic Otoscopy, Tympanometry & Targeted Antimicrobial Care",
    bodySystem: "ENT & Throat",
    topSymptoms: [
      "Deep throbbing ear pain (otalgia)",
      "Fever and irritability (common in young children)",
      "Tugging or pulling at the affected ear",
      "Diminished hearing or sensation of fluid behind eardrum",
      "Fluid or pus draining from ear if eardrum ruptures"
    ],
    description: "Acute bacterial or viral infection of the middle ear space behind the tympanic membrane."
  },
  {
    id: "panic_attack_panic_disorder",
    name: "Panic Attack / Panic Disorder",
    specialization: "Psychiatry",
    icd10: "F41.0",
    urgency: "urgent",
    procedure: "Psychiatric Crisis Triage & Panic Desensitization Regimen",
    bodySystem: "Mental Health",
    topSymptoms: [
      "Sudden surge of intense overwhelming fear",
      "Heart pounding racing or fluttering",
      "Sweating trembling or shaking sensations",
      "Shortness of breath or feeling of smothering",
      "Fear of losing control or dying"
    ],
    description: "Abrupt surge of intense fear reaching a peak within minutes, accompanied by severe somatic and cognitive symptoms."
  },
  {
    id: "pelvic_inflammatory_disease_pid",
    name: "Pelvic Inflammatory Disease / PID",
    specialization: "Gynecology",
    icd10: "N73.9",
    urgency: "urgent",
    procedure: "Pelvic Ultrasound, Endocervical Swab & Broad-Spectrum Antibiotics",
    bodySystem: "Women's Health",
    topSymptoms: [
      "Dull aching pain in lower abdomen and pelvis",
      "Unusual heavy foul-smelling vaginal discharge",
      "Bleeding between menstrual periods or after intercourse",
      "Pain during sexual intercourse or urination",
      "Fever chills and general malaise"
    ],
    description: "Ascending infection of female upper genital tract involving uterus, fallopian tubes, and ovaries."
  },
  {
    id: "peptic_ulcer_disease",
    name: "Peptic Ulcer Disease",
    specialization: "Gastroenterology",
    icd10: "K27.9",
    urgency: "urgent",
    procedure: "Esophagogastroduodenoscopy (EGD) & Mucosal Healing Protocol",
    bodySystem: "Gastrointestinal",
    topSymptoms: [
      "Burning stomach pain between breastbone and navel",
      "Pain temporarily relieved by food or antacids",
      "Nighttime abdominal pain waking the patient",
      "Bloating belching and feeling full quickly",
      "Dark tarry stools or vomiting blood in severe cases"
    ],
    description: "Focal defect in the gastric or duodenal mucosa extending through the muscularis mucosae, caused by acid and pepsin."
  },
  {
    id: "pharyngitis_strep_throat",
    name: "Pharyngitis / Strep Throat",
    specialization: "ENT",
    icd10: "J02.9",
    urgency: "routine",
    procedure: "Rapid Strep Antigen Test (RADT) & Throat Culture Workup",
    bodySystem: "ENT & Throat",
    topSymptoms: [
      "Sudden severe sore throat and painful swallowing",
      "Red swollen tonsils with white patches or pus",
      "High fever without accompanying cough",
      "Tender swollen lymph nodes in front of neck",
      "Tiny red spots on roof of mouth (petechiae)"
    ],
    description: "Acute inflammation of pharynx caused by viral pathogens or Group A Streptococcus requiring antibiotic therapy."
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    specialization: "Pulmonology",
    icd10: "J18.9",
    urgency: "urgent",
    procedure: "Chest Radiography, Pulse Oximetry & Targeted Antimicrobial Care",
    bodySystem: "Respiratory",
    topSymptoms: [
      "Cough producing green yellow or rust-colored phlegm",
      "High fever sweating and shaking chills",
      "Sharp stabbing chest pain when coughing or breathing in",
      "Shortness of breath during normal daily tasks",
      "Rapid shallow breathing and low blood oxygen"
    ],
    description: "Acute infection of pulmonary parenchymal tissue causing alveolar consolidation and impaired gas exchange."
  },
  {
    id: "prostatitis",
    name: "Prostatitis",
    specialization: "Urology",
    icd10: "N41.9",
    urgency: "routine",
    procedure: "Expressed Prostatic Secretions Assay & Targeted Antimicrobial Protocol",
    bodySystem: "Urinary & Renal",
    topSymptoms: [
      "Pain or burning sensation while urinating",
      "Ache in pelvis genitals or lower back",
      "Pain in area between scrotum and anus (perineum)",
      "Frequent urgent urination especially at night",
      "Flu-like symptoms with fever in acute bacterial cases"
    ],
    description: "Inflammation or infection of the prostate gland presenting with pelvic pain and urinary symptoms."
  },
  {
    id: "psoriasis",
    name: "Psoriasis",
    specialization: "Dermatology",
    icd10: "L40.9",
    urgency: "routine",
    procedure: "Dermoscopy, PASI Score Staging & Topical/Phototherapy Regimen",
    bodySystem: "Dermatology & Skin",
    topSymptoms: [
      "Raised red skin plaques covered with thick silvery scales",
      "Dry cracked skin that may itch or bleed",
      "Plaques commonly on elbows knees and scalp",
      "Pitted ridged or thickened fingernails",
      "Stiff swollen joints (in psoriatic arthritis)"
    ],
    description: "Chronic autoimmune skin disorder characterized by hyperproliferation of keratinocytes and cutaneous inflammation."
  },
  {
    id: "sciatica",
    name: "Sciatica",
    specialization: "Orthopedics",
    icd10: "M54.30",
    urgency: "routine",
    procedure: "Lumbar Spine MRI, Straight Leg Raise Test & Epidural / PT Care",
    bodySystem: "Orthopedics & Joints",
    topSymptoms: [
      "Sharp shooting pain radiating from lower back down one leg",
      "Burning or electric-shock sensation in buttock and calf",
      "Numbness tingling or weakness in affected leg or foot",
      "Pain worsening with sitting coughing or sneezing",
      "Difficulty standing up from sitting posture"
    ],
    description: "Radicular pain originating in the lumbosacral spine and radiating along the distribution of the sciatic nerve."
  },
  {
    id: "seborrheic_dermatitis",
    name: "Seborrheic Dermatitis",
    specialization: "Dermatology",
    icd10: "L21.9",
    urgency: "routine",
    procedure: "Trichoscopy, Antifungal Ketoconazole Regimen & Sebaceous Care",
    bodySystem: "Dermatology & Skin",
    topSymptoms: [
      "Greasy yellowish or white scales on scalp (dandruff)",
      "Red irritated skin patches on face eyebrows and ears",
      "Stubborn itching and flaking around nose creases",
      "Crusted plaques on chest or upper back",
      "Worsening of redness during cold dry weather or stress"
    ],
    description: "Chronic superficial inflammatory dermatosis localized to sebum-rich areas of the head and trunk."
  },
  {
    id: "sinusitis",
    name: "Sinusitis",
    specialization: "ENT",
    icd10: "J01.90",
    urgency: "routine",
    procedure: "Nasal Endoscopy, Sinus CT & Decongestant / Saline Irrigation Protocol",
    bodySystem: "ENT & Throat",
    topSymptoms: [
      "Facial pressure and aching around eyes cheeks or forehead",
      "Thick yellow or green nasal discharge",
      "Nasal congestion causing difficulty breathing through nose",
      "Reduced sense of smell and taste",
      "Headache worsening when bending forward"
    ],
    description: "Inflammation of the paranasal sinuses lasting less than 4 weeks (acute) or beyond 12 weeks (chronic)."
  },
  {
    id: "stye_chalazion",
    name: "Stye / Chalazion",
    specialization: "Ophthalmology",
    icd10: "H00.0",
    urgency: "routine",
    procedure: "Eyelid Slit-Lamp Examination & Warm Compress / Incision Protocol",
    bodySystem: "Ophthalmology & Vision",
    topSymptoms: [
      "Painful red lump on eyelid edge resembling a pimple",
      "Swelling of the eyelid with localized tenderness",
      "Crusting along eyelid margin and watery eye",
      "Feeling of a foreign object in the eye",
      "Gradual formation of painless firm bump in chalazion"
    ],
    description: "Acute focal infection (hordeolum) or chronic non-infectious granulomatous enlargement (chalazion) of an eyelid meibomian gland."
  },
  {
    id: "tension_headache",
    name: "Tension Headache",
    specialization: "Neurology",
    icd10: "G44.209",
    urgency: "routine",
    procedure: "Craniofacial Musculoskeletal Examination & Analgesic / Stress Protocol",
    bodySystem: "Neurology",
    topSymptoms: [
      "Dull aching head pain like a tight band around forehead",
      "Pressure or tightness across forehead and sides of head",
      "Tenderness in scalp neck and shoulder muscles",
      "Mild headache not aggravated by routine physical activity",
      "Absence of nausea or vomiting"
    ],
    description: "Most common primary headache disorder, presenting as bilateral band-like mild to moderate non-pulsatile pain."
  },
  {
    id: "tonsillitis",
    name: "Tonsillitis",
    specialization: "ENT",
    icd10: "J03.90",
    urgency: "routine",
    procedure: "Throat Inspection, Centor Score Assessment & Antimicrobial Care",
    bodySystem: "ENT & Throat",
    topSymptoms: [
      "Red swollen tonsils with white or yellow spots",
      "Painful swallowing and scratchy voice",
      "High fever and chills",
      "Tender enlarged lymph nodes in neck",
      "Bad breath and stiff neck"
    ],
    description: "Inflammation of the palatine tonsils typically caused by viral or bacterial infections."
  },
  {
    id: "urinary_tract_infection_uti",
    name: "Urinary Tract Infection / UTI",
    specialization: "Urology",
    icd10: "N39.0",
    urgency: "routine",
    procedure: "Urinalysis, Urine Culture & Targeted Antibiotic Regimen",
    bodySystem: "Urinary & Renal",
    topSymptoms: [
      "Strong persistent urge to urinate",
      "Burning stinging sensation when urinating",
      "Passing frequent small amounts of urine",
      "Cloudy or strong-smelling urine",
      "Pelvic pressure or lower belly discomfort"
    ],
    description: "Infection of the urinary tract, predominantly affecting the bladder (cystitis) and urethra, most often caused by E. coli."
  },
  {
    id: "uterine_fibroids",
    name: "Uterine Fibroids",
    specialization: "Gynecology",
    icd10: "D25.9",
    urgency: "routine",
    procedure: "Pelvic Ultrasound / Saline Infusion Sonography & Myoma Care",
    bodySystem: "Women's Health",
    topSymptoms: [
      "Heavy prolonged menstrual bleeding",
      "Pelvic pressure and fullness in lower abdomen",
      "Frequent urination due to bladder compression",
      "Constipation and rectal pressure",
      "Backache or leg pains"
    ],
    description: "Benign monoclonal tumors of uterine smooth muscle cells (leiomyomas), the most common pelvic tumors in women."
  },
  {
    id: "vaginal_candidiasis_yeast_infection",
    name: "Vaginal Candidiasis / Yeast Infection",
    specialization: "Gynecology",
    icd10: "B37.3",
    urgency: "routine",
    procedure: "Vaginal pH Testing, KOH Mount & Targeted Antifungal Therapy",
    bodySystem: "Women's Health",
    topSymptoms: [
      "Intense itching and burning of vagina and vulva",
      "Thick white cottage-cheese-like vaginal discharge",
      "Redness and swelling of external genital area",
      "Burning sensation during urination",
      "Discomfort or pain during sexual intercourse"
    ],
    description: "Opportunistic fungal infection of the vaginal mucosa caused primarily by Candida albicans."
  },
  {
    id: "vertigo_bppv",
    name: "Vertigo / BPPV",
    specialization: "Neurology",
    icd10: "H81.10",
    urgency: "routine",
    procedure: "Dix-Hallpike Diagnostic Maneuver & Epley Canalith Repositioning",
    bodySystem: "Neurology",
    topSymptoms: [
      "Intense spinning sensation triggered by head position changes",
      "Loss of balance and unsteadiness while walking",
      "Nausea and vomiting during spinning episodes",
      "Episodes lasting less than one minute",
      "Involuntary rhythmic eye movements (nystagmus)"
    ],
    description: "Benign Paroxysmal Positional Vertigo caused by dislodged otoconia in the semicircular canals of the inner ear."
  },
  {
    id: "viral_warts",
    name: "Viral Warts",
    specialization: "Dermatology",
    icd10: "B07.9",
    urgency: "routine",
    procedure: "Dermoscopy, Cryotherapy with Liquid Nitrogen & Salicylic Care",
    bodySystem: "Dermatology & Skin",
    topSymptoms: [
      "Small grainy rough skin bumps",
      "Flesh-colored white or tan skin growths",
      "Common on fingers hands or soles of feet",
      "Tiny black dots (clotted blood vessels) within bump",
      "Mild tenderness when pressure is applied"
    ],
    description: "Benign epidermal proliferations caused by Human Papillomavirus (HPV) infection of basal keratinocytes."
  }
];
