"""
Generates 120 diverse test queries across all 56 canonical classes and evaluates
exact Python scikit-learn sigmoid probabilities to benchmark against Node.js.
"""
import os
import sys
import json
import joblib
import numpy as np

sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'notebooks')))
from train_v2_multilabel import normalize_text, CANONICAL_CLASSES

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models', 'MedP_AI_V2.0')
JOBLIB_PATH = os.path.join(MODEL_DIR, 'symptom-model_MedP_AI_V2.0.joblib')

bundle = joblib.load(JOBLIB_PATH)
model = bundle['model']
vectorizer = bundle['vectorizer']
classes = bundle['classes']

test_queries = [
    # Eye & Ophthalmic
    "watery eyes redness and itchy eyes",
    "pink eye after touching infected hands",
    "painful eyelid lump with swelling and tenderness",
    "eyelid crusting redness and burning eyelid margins",
    "cloudy hazy eyes with burning and excessive tearing",
    
    # Respiratory & ENT
    "runny nose sneezing and mild sore throat",
    "high fever body aches chills and dry cough",
    "cough fever breathlessness and sharp chest pain",
    "wheezing shortness of breath after dust exposure",
    "sinus headache facial pressure and thick nasal discharge",
    "severe sore throat difficulty swallowing and swollen tonsils with white spots",
    "ear pain after swimming with tenderness on pulling earlobe",
    "child with high fever ear pulling and crying at night",
    "persistent productive cough with phlegm for three weeks",
    "blocked nose sneezing and watery itchy nasal discharge",
    
    # Skin & Cutaneous
    "facial pimples blackheads and pustules",
    "itchy red scaly patches on elbows and knees",
    "intensely itchy red weeping rash in skin folds",
    "red itchy rash after using new laundry detergent soap",
    "flaky scalp with greasy yellowish scales and itching",
    "spreading redness warmth swelling and pain in lower leg",
    "raised itchy wheals and hives after eating seafood",
    "rough skin-colored bumps and warts on fingers",
    
    # Digestive & GI
    "watery diarrhea vomiting and severe abdominal cramps",
    "burning epigastric stomach pain nausea and feeling full quickly",
    "heartburn after meals with sour acid regurgitation into mouth",
    "alternating constipation and diarrhea with abdominal bloating and cramps",
    "gnawing stomach pain relieved temporarily by food or antacids",
    "bright red blood when wiping painful bowel movement and anal swelling",
    "sharp tear-like pain during hard bowel movement with bright red bleeding",
    "severe right lower quadrant abdominal pain nausea vomiting and low grade fever",
    
    # Urinary & Reproductive
    "burning urination frequent urge to pee and cloudy urine",
    "sudden severe flank pain radiating to groin with blood in urine",
    "pelvic discomfort painful urination and pain during ejaculation",
    "weak urine stream hesitation frequent nighttime urination in older male",
    "thick white cottage cheese-like vaginal discharge with intense itching",
    "thin grayish vaginal discharge with fishy odor worse after intercourse",
    "lower abdominal pain abnormal vaginal discharge and pain during intercourse",
    "severe menstrual cramps chronic pelvic pain and painful periods",
    "heavy prolonged menstrual bleeding and pelvic pressure",
    
    # Musculoskeletal & Joint
    "knee pain stiffness worse after resting and creaking joint sounds",
    "neck pain stiffness radiating down shoulder and arm",
    "sharp shooting pain from lower back down back of leg to foot",
    "severe shoulder pain and gradual loss of range of motion",
    "pins and needles tingling and numbness in thumb index and middle fingers worse at night",
    "sudden back pain and muscle spasm after heavy lifting",
    
    # Neurological & Balance
    "throbbing one-sided headache with nausea light sensitivity and aura",
    "dull band-like ache around forehead and back of head with neck tightness",
    "room spinning sensation when turning head in bed with nausea",
    
    # Mental Health
    "persistent excessive worry restlessness muscle tension and insomnia",
    "sudden panic attack with racing heart sweating and feeling of impending doom",
    "persistent low mood loss of interest in all activities and fatigue",
    
    # Endocrine & Blood
    "unexplained weight gain extreme fatigue cold intolerance and dry skin",
    "pale skin extreme tiredness shortness of breath and heavy menstrual periods",
    
    # Dental & Oral
    "swollen red gums that bleed easily while brushing and bad breath",
    "severe throbbing tooth pain swelling in gum with pus discharge",
    
    # Indian-English & Multi-lingual Phrases
    "bukhar and sukhi khansi with body ache",
    "pet mein tez dard and loose motion",
    "sir dard with ulti and nausea",
    "seene mein jalan after heavy oily food",
    "peshab mein jalan with frequent urination",
    "aankh mein dard and redness with watering",
    "ghutne mein dard while walking stairs",
    "kaan mein dard after taking bath",
    "gale mein dard and difficulty swallowing",
    "man udas rehta hai and no energy to do anything",
    
    # Colloquial & Informal Real-world queries
    "my head is spinning like crazy every time I lie down",
    "burning pee every ten minutes feels like razor blades",
    "food comes right back up with sour acid taste in my throat",
    "wake up at 3am with hand completely numb and tingling fingers",
    "itchy red bumps popped up everywhere after eating peanuts",
    "stuffy nose can barely breathe through my nose and yellow mucus",
    "bad chest cold with coughing fits that hurt my ribs",
    "horrible sharp belly pain on the lower right side feel like throwing up",
    "yellow pus pocket near my back tooth and throbbing jaw",
    "feeling completely empty inside and cannot find joy in anything",
    
    # Multi-symptom combinations
    "fever cough runny nose sore throat and fatigue",
    "nausea vomiting diarrhea stomach cramps and slight fever",
    "joint pain knee swelling morning stiffness and difficulty walking",
    "itching skin rash red patches and dry flakes",
    "pelvic pain painful urination and lower back discomfort",
    "headache dizziness lightheadedness and nausea",
    "chest tightness shortness of breath wheezing and dry cough",
    "neck stiffness shoulder ache and tingling in hand",
    "fatigue pale skin brittle nails and dizziness",
    "toothache gum swelling bleeding gums and facial ache",
    
    # Specific edge and variation queries
    "sudden high fever and severe shivering chills",
    "chronic dry cough worse at night",
    "redness in both eyes with sticky yellow crusts in the morning",
    "deep throbbing pain inside left ear",
    "itching and red circular patches on body",
    "painful burning sensation behind breastbone",
    "crampy abdominal pain before loose stools",
    "blood spots in urine and burning feeling",
    "numbness in palm and electric shock feeling in fingers",
    "stiff knee joint after sitting in car",
    "one-sided head pain pounding behind eye",
    "spinning dizziness when looking up at ceiling",
    "constant tension in neck and shoulders with headache",
    "nervousness heart palpitation and trembling hands",
    "overwhelming sadness crying spells and sleep disturbance",
    "sluggishness weight increase and hair thinning",
    "weakness fatigue and shortness of breath climbing stairs",
    "tender bleeding gums when flossing",
    "pulsating tooth pain and swollen cheek",
    "sore throat hoarseness and painful swallowing",
    "nasal congestion facial fullness and loss of smell",
    "burning eye sensation with stringy mucus discharge",
    "painful bump on upper eyelid margin",
    "scaly red plaques with silvery dandruff-like scales",
    "rough cauliflower-like warts on hands",
    "hot tender red skin on shin",
    "itching hives that move around the body",
    "itchy scaly patches behind ears and along hairline",
    "itching between toes and cracked peeling skin",
    "red blisters on hands that itch intensely",
    "facial flushing and pimples on nose and cheeks",
]

print(f'Total parity test queries: {len(test_queries)}')

records = []
for q in test_queries:
    norm = normalize_text(q)
    v = vectorizer.transform([norm])
    # Compute Python probabilities for all 56 classes
    py_probs = model.predict_proba(v)[0]
    records.append({
        'query': q,
        'normalized': norm,
        'python_probabilities': py_probs.tolist(),
        'top_class': classes[int(np.argmax(py_probs))],
        'top_prob': round(float(np.max(py_probs)), 4),
    })

out_json = os.path.join(BASE_DIR, 'parity_inputs.json')
with open(out_json, 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2)

print(f'Saved {len(records)} test cases with exact Python probabilities to {out_json}')
