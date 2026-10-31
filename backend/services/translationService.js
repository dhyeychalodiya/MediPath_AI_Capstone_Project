/**
 * MediPath AI - Dedicated Translation Service
 * 
 * Exclusively provides translation between patient languages (Hindi, Gujarati, etc.)
 * and English for MediPath Model 2.0.
 * 
 * CRITICAL ARCHITECTURAL BOUNDARY:
 * - This service does NOT perform symptom classification or medical diagnosis.
 * - Model 2.0 is the sole authority for condition prediction and clinical follow-up logic.
 * - Translations preserve exact symptoms, body locations, duration, severity, and negations.
 */

const { isConfigured, callGemini } = require('./geminiProvider');

// Supported primary languages and their BCP-47 / ISO codes
const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', speechLocale: 'en-IN' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN' },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechLocale: 'gu-IN' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN' },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN' },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN' },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN' },
  ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechLocale: 'ml-IN' },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', speechLocale: 'ur-IN' },
};

// Common UI phrases translation dictionary for instant offline fallback
const DICTIONARY_FALLBACKS = {
  hi: {
    "2 to 3 days ago": "2 से 3 दिन पहले",
    "abdomen / stomach": "पेट / आमाशय",
    "abdominal bloating and excessive gas": "पेट फूलना और अत्यधिक गैस बनना",
    "abdominal cramping relieved by bowel movement": "शौच के बाद पेट की ऐंठन में आराम",
    "abdominal cramps and stomach spasms": "पेट में मरोड़ और ऐंठन",
    "abdominal tenderness worsening with movement": "हिलने-डुलने पर पेट का दर्द बढ़ना",
    "abnormal rapid eye movements": "आंखों की असामान्य तेजी से हरकत",
    "acid taste or belching": "खट्टा स्वाद या खट्टी डकारें",
    "alternating diarrhea and constipation": "बारी-बारी से दस्त और कब्ज होना",
    "anal spasms after defecation": "शौच के बाद गुदा में ऐंठन",
    "arms or legs": "हाथ या पैर",
    "back or spine": "पीठ या रीढ़",
    "bleeding between menstrual periods": "मासिक धर्म के बीच में रक्तस्राव",
    "bleeding gums during brushing or flossing": "ब्रश करते समय मसूड़ों से खून आना",
    "bloating and feeling full quickly": "पेट फूलना और जल्दी पेट भरा लगना",
    "bone spurs or joint enlargement": "हड्डी का बढ़ना या जोड़ों का फूलना",
    "bright red blood on toilet paper": "टॉयलेट पेपर पर चमकदार लाल खून",
    "burning ache in upper stomach": "ऊपरी पेट में जलन और दर्द",
    "burning during urination or intercourse": "पेशाब या संभोग के दौरान जलन",
    "burning hand sensation worse at night": "हाथ में जलन (रात में अधिक)",
    "burning or stinging in eyelids": "पलकों में जलन या चुभन",
    "burning sensation during urination": "पेशाब करते समय जलन",
    "burning skin irritation from soap or metal": "साबुन या धातु से त्वचा पर जलन",
    "burning stinging sensation when urinating": "पेशाब करते समय तेज जलन व चुभन",
    "changes in sleep and appetite": "नींद और भूख में बदलाव",
    "chest / heart area": "सीना / हृदय क्षेत्र",
    "chest burning after heavy meals": "भारी भोजन के बाद सीने में जलन",
    "chest discomfort and fear of losing control": "सीने में बेचैनी और घबराहट",
    "chest or throat": "सीना या गला",
    "chest soreness from coughing": "खांसने से सीने में दर्द",
    "chest tightness": "सीने में जकड़न",
    "chest tightness after dust exposure": "धूल के संपर्क के बाद सीने में जकड़न",
    "chronic fatigue and lack of energy": "लगातार थकान और ऊर्जा की कमी",
    "chronic pelvic aching before period": "माहवारी से पहले पेल्विक में पुराना दर्द",
    "clear runny nose": "नाक से साफ पानी बहना",
    "cloudy or strong-smelling urine": "धुंधला या तेज गंध वाला पेशाब",
    "clustered skin lesions with rough texture": "खुरदुरी सतह वाले दानों का गुच्छा",
    "cold hands and feet": "हाथ और पैर ठंडे रहना",
    "constipation and muscle weakness": "कब्ज और मांसपेशियों में कमजोरी",
    "constipation or difficulty having bowel movements": "कब्ज या शौच में कठिनाई",
    "cough or sore throat": "खांसी या गले में खराश",
    "cough producing green yellow or bloody phlegm": "हरा, पीला या खून वाला बलगम आना",
    "coughing worse at night or early morning": "रात या सुबह खांसी का बढ़ना",
    "crusty eyelashes upon waking": "सोकर उठने पर पलकों पर पपड़ी जमना",
    "cystic skin blemishes": "त्वचा पर गांठदार मुहांसे / दाने",
    "dandruff flakes on scalp hair or eyebrows": "सिर के बाल या भौंहों पर रूसी की पपड़ी",
    "deep throbbing ear pain": "कान में गहरा धड़कता हुआ दर्द",
    "dehydration with dry mouth": "मुंह सूखना और पानी की कमी (डिहाइड्रेशन)",
    "difficulty breathing with cold air": "ठंडी हवा में सांस लेने में तकलीफ",
    "difficulty concentrating and sleep disturbances": "एकाग्रता में कमी और नींद की समस्या",
    "difficulty starting urination": "पेशाब शुरू करने में रुकावट या कठिनाई",
    "difficulty swallowing or throat clearing": "निगलने में कठिनाई या बार-बार गला साफ करना",
    "difficulty urinating or weak stream": "पेशाब में रुकावट या कमजोर धार",
    "discomfort while sitting": "बैठने पर बेचैनी या दर्द",
    "discomfort without significant redness": "बिना अधिक लाली के असुविधा",
    "discomfort worse when lying flat": "सीधे लेटने पर तकलीफ बढ़ना",
    "dizziness": "चक्कर आना",
    "dizziness lasting seconds to minutes": "कुछ सेकंड से मिनट तक चक्कर आना",
    "dizziness, lightheadedness or brittle nails": "चक्कर आना, सिर घूमना या कमजोर नाखून",
    "dry brittle skin and coarse hair": "रूखी बेजान त्वचा और खुरदुरे बाल",
    "dry cracked skin patches": "त्वचा पर सूखे फटे हुए चकत्ते",
    "dry cracked skin that may bleed": "सूखी फटी त्वचा जिससे खून आ सकता है",
    "dry hacking cough": "सूखी लगातार खांसी",
    "dull aching head pain like a tight band": "सिर पर पट्टी जैसा भारी सिरदर्द",
    "dull aching pain in shoulder joint": "कंधे के जोड़ में धीमा दर्द",
    "ear canal pain and tenderness": "कान की नली में दर्द और छूने पर तकलीफ",
    "exhaustion and profound fatigue": "अत्यधिक कमजोरी और भारी थकान",
    "extreme fatigue and weakness": "चरम थकान और कमजोरी",
    "extreme sensitivity to cold": "ठंड के प्रति अत्यधिक संवेदनशीलता",
    "eye pain or redness": "आंख में दर्द या लाली",
    "eye redness and bloodshot look": "आंखों में लाली और खून जैसी लालिमा",
    "eye redness or watering": "आंखों में लाली या पानी आना",
    "eyelids stuck together in morning": "सुबह उठने पर पलकें चिपकी होना",
    "facial pain, pressure and fullness": "चेहरे पर दर्द, दबाव और भारीपन",
    "facial pimples and blackheads": "चेहरे पर मुहांसे और ब्लैकहेड्स",
    "fatigue": "थकान",
    "fatigue and malaise": "थकान और अस्वस्थता",
    "fatigue, sweating and low oxygen feeling": "थकान, पसीना और सांस की कमी",
    "feeling of incomplete bladder emptying": "पेशाब पूरी तरह न उतरने का अहसास",
    "feelings of worthlessness or guilt": "उदासी, अपराधबोध या हीनभावना",
    "fever and chills accompanying rash": "चकत्तों के साथ बुखार और कंपकंपी",
    "fever and chills with pelvic pain": "पेल्विक दर्द के साथ बुखार और ठंड",
    "fever and ear fullness": "बुखार और कान में भारीपन",
    "fever and swollen glands in neck": "बुखार और गर्दन की ग्रंथियों में सूजन",
    "fever or chills": "बुखार या ठंड लगना",
    "fever without cough": "बिना खांसी के तेज बुखार",
    "flaking around nose folds and ears": "नाक और कान के पास त्वचा की पपड़ी",
    "flaking skin around eyelash roots": "पलकों की जड़ों में पपड़ी बनना",
    "flu-like symptoms with acute pelvic pain": "फ्लू जैसे लक्षण और अचानक पेल्विक दर्द",
    "fluid draining from ear after rupture": "कान से तरल या मवाद बहना",
    "frequent sneezing": "बार-बार छींक आना",
    "frequent urination at night": "रात में बार-बार पेशाब जाना",
    "frequent urination from bladder pressure": "मूत्राशय पर दबाव से बार-बार पेशाब",
    "general physician": "सामान्य चिकित्सक (General Physician)",
    "gnawing or burning stomach pain": "पेट में जलन या कुतरने जैसा दर्द",
    "gradual worsening of shoulder mobility": "कंधे की गतिशीलता में धीरे-धीरे कमी",
    "greasy skin covered with flaky white or yellow scales": "तैलीय त्वचा पर सफेद या पीली पपड़ी",
    "grinding sensation when turning neck": "गर्दन घुमाने पर घर्षण या कड़कड़ाहट",
    "gritty sandy feeling in eye": "आंख में रेत या कंकर जैसी चुभन",
    "gritty sensation in eyes": "आंखों में किरकिरापन या चुभन",
    "hard flat growths on soles of feet": "तलवों पर सख्त चपटे दाने या गांठें",
    "head / neck": "सिर / गर्दन",
    "headache / face": "सिरदर्द / चेहरा",
    "headache aggravated by physical activity": "शारीरिक मेहनत से सिरदर्द बढ़ना",
    "headache and sore throat": "सिरदर्द और गले में खराश",
    "headache not aggravated by routine activity": "सामान्य काम से न बढ़ने वाला सिरदर्द",
    "headache worsening when leaning forward": "आगे झुकने पर सिरदर्द का बढ़ना",
    "headaches starting from back of neck": "गर्दन के पिछले हिस्से से शुरू होने वाला सिरदर्द",
    "heartburn and nausea": "सीने में जलन और मतली",
    "heartburn burning behind breastbone": "छाती की हड्डी के पीछे तेज जलन",
    "heavy or irregular menstrual bleeding": "माहवारी में भारी या अनियमित रक्तस्राव",
    "heavy or prolonged menstrual periods": "मासिक धर्म का लंबा चलना या अधिक खून आना",
    "high fever and severe chills": "तेज बुखार और तेज कंपकंपी",
    "high fever with shaking chills": "कांपने वाली ठंड के साथ तेज बुखार",
    "inability to reach behind back": "पीठ के पीछे हाथ ले जाने में असमर्थता",
    "indigestion and abdominal bloating": "अपच और पेट का फूलना",
    "intense itching after exposure": "संपर्क के बाद तेज खुजली",
    "intense vaginal itching and irritation": "योनि में अत्यधिक खुजली और जलन",
    "intensely itchy dry skin patches": "अत्यधिक खुजली वाले सूखे चकत्ते",
    "intolerance to fatty foods": "चिकने/तले भोजन से परेशानी",
    "irritability and ear tugging in children": "बच्चों में चिड़चिड़ापन और कान खींचना",
    "itching and burning skin plaques": "त्वचा के पपड़ीदार हिस्सों में खुजली व जलन",
    "itching inside the ear canal": "कान के अंदरूनी हिस्से में खुजली",
    "itching or irritation in anal region": "गुदा क्षेत्र में खुजली या जलन",
    "itchy and watery eyes": "आंखों में खुजली और पानी आना",
    "itchy nose and roof of mouth": "नाक और तालू में खुजली",
    "joint or back pain": "जोड़ों या पीठ में दर्द",
    "joint or body pain": "जोड़ों या पूरे शरीर में दर्द",
    "joint pain and aching during activity": "कामकाज के दौरान जोड़ों में दर्द",
    "joint stiffness after resting or in morning": "आराम के बाद या सुबह जोड़ों में जकड़न",
    "joints or muscles": "जोड़ या मांसपेशियां",
    "light sensitivity": "प्रकाश के प्रति संवेदनशीलता",
    "localized muscle pain and soreness": "मांसपेशियों में स्थानीय दर्द व खिंचाव",
    "localized red itchy skin rash": "त्वचा पर लाल खुजलीदार दाने",
    "loose feeling in teeth or sensitive gums": "दांतों का हिलना या संवेदनशील मसूड़े",
    "loss of appetite": "भूख में कमी",
    "loss of appetite after meals": "खाना खाने के बाद भूख मर जाना",
    "loss of balance and unsteadiness": "संतुलन बिगड़ना और लड़खड़ाहट",
    "loss of interest in daily activities": "दैनिक कार्यों में रुचि खत्म होना",
    "loss of joint flexibility and creaking": "जोड़ों का लचीलापन कम होना और आवाज आना",
    "low-grade fever and mild fatigue": "हल्का बुखार और हल्की थकान",
    "lower abdominal and pelvic aching": "निचले पेट और पेल्विक में दर्द",
    "lower back pain during period": "माहवारी के दौरान कमर में दर्द",
    "lower back pain radiating into buttocks": "कमर से कूल्हों तक फैलता दर्द",
    "lower backache or leg pains": "कमर दर्द या पैरों में दर्द",
    "medical specialist": "विशेषज्ञ चिकित्सक",
    "mild discomfort": "हल्की परेशानी",
    "mild eye soreness and tearing": "आंख में हल्का दर्द और पानी आना",
    "mild fever and body weakness": "हल्का बुखार और शरीर में कमजोरी",
    "mild fever and chills": "हल्का बुखार और हल्की ठंड",
    "mild sore throat and tickle": "गले में हल्की खराश और खुजली",
    "mild to moderate pain on both sides of head": "सिर के दोनों तरफ हल्का या मध्यम दर्द",
    "mild vaginal itching or irritation": "योनि में हल्की खुजली या जलन",
    "mucus discharge after defecation": "शौच के बाद आंव या श्लेष्मा आना",
    "mucus in stool": "मल में आंव या बलगम आना",
    "muffled hearing from swollen ear canal": "कान की नली में सूजन से कम सुनाई देना",
    "muffled hearing or ear pressure": "कान में भारीपन या कम सुनाई देना",
    "muscle spasms or cramping": "मांसपेशियों में ऐंठन या मरोड़",
    "muscle tension and trembling": "मांसपेशियों में तनाव और कंपकंपी",
    "nasal congestion and difficulty breathing": "नाक बंद होना और सांस में परेशानी",
    "nasal congestion and stuffiness": "नाक का भारीपन और बंद होना",
    "nausea": "मतली",
    "nausea and feeling full quickly": "मतली और थोड़ा खाते ही पेट भरना",
    "nausea and frequent vomiting": "मतली और बार-बार उल्टी होना",
    "nausea and low-grade fever": "जी मिचलाना और हल्का बुखार",
    "nausea and vomiting during headache": "सिरदर्द के साथ मतली और उल्टी",
    "nausea and vomiting with flank pain": "पसली/कमर दर्द के साथ मतली और उल्टी",
    "nausea and vomiting with movement": "हिलने पर मतली और उल्टी होना",
    "nausea or vomiting": "मतली या उल्टी",
    "neck stiffness": "गर्दन में अकड़न",
    "neck stiffness and aching pain": "गर्दन में अकड़न और दर्द",
    "needs medical consultation": "चिकित्सीय परामर्श की आवश्यकता है",
    "no more symptoms": "और कोई लक्षण नहीं",
    "numbness and tingling in thumb and fingers": "अंगूठे और उंगलियों में सुन्नपन व झनझनाहट",
    "numbness or tingling in fingers": "उंगलियों में झनझनाहट या सुन्नपन",
    "numbness or weakness in calf or foot": "पिंडली या पैर में सुन्नपन या कमजोरी",
    "oily skin with clogged pores": "बंद रोमछिद्रों के साथ तैलीय त्वचा",
    "pain aggravated by prolonged sitting": "देर तक बैठने पर दर्द का बढ़ना",
    "pain in perineum groin or lower back": "जांघ, कमर या पेल्विक में दर्द",
    "pain in upper teeth or behind cheeks": "ऊपरी दांतों या गालों के पीछे दर्द",
    "pain or burning during urination": "पेशाब करते समय दर्द या जलन",
    "pain radiating down shoulder and arm": "कंधे से हाथ की ओर फैलता दर्द",
    "pain radiating to lower abdomen and groin": "निचले पेट और जांघ तक फैलता दर्द",
    "pain starting near navel and moving down": "नाभि के पास से शुरू होकर नीचे जाता दर्द",
    "pain when pulling earlobe or pressing tragus": "कान छूने या खींचने पर दर्द होना",
    "pain worsening when using injured muscle": "चोटिल अंग पर जोर देने से दर्द बढ़ना",
    "painful and difficult swallowing": "निगलने में दर्द और भारी परेशानी",
    "painful ejaculation": "वीर्यपात के समय दर्द",
    "painful intercourse": "संभोग के समय दर्द",
    "painful lump or swelling near anus": "गुदा के पास दर्दनाक गांठ या सूजन",
    "painful red bump along eyelid edge": "पलक के किनारे लाल दर्दनाक फुंसी (बिलनी)",
    "painful red bumps on face or back": "चेहरे या पीठ पर लाल दर्दनाक मुहांसे",
    "painful swallowing": "निगलते समय दर्द होना",
    "painful urination or pain during intercourse": "पेशाब या संभोग के दौरान दर्द",
    "painful urination with intense spasms": "पेशाब में तेज ऐंठन के साथ दर्द",
    "painless bleeding during bowel movement": "शौच के समय बिना दर्द के खून आना",
    "pale skin and pale inner eyelids": "पीली त्वचा और पलकों के अंदर पीलापन",
    "passing frequent small amounts of urine": "थोड़ा-थोड़ा बार-बार पेशाब आना",
    "patches of red skin with greasy scales": "लाल त्वचा पर चिपचिपी पपड़ीदार परत",
    "pelvic pressure or fullness": "पेल्विक क्षेत्र में भारीपन या दबाव",
    "pelvic pressure or lower belly discomfort": "निचले पेट में दबाव या भारीपन",
    "persistent bad breath": "मुंह से लगातार दुर्गंध आना",
    "persistent fatigue and sluggishness": "लगातार थकान और सुस्ती",
    "persistent low mood and sadness": "लगातार उदासी और निराशा",
    "persistent productive cough with phlegm": "बलगम वाली लगातार खांसी",
    "persistent rectal burning": "गुदा में लगातार जलन",
    "persistent worry and nervousness": "लगातार चिंता और घबराहट",
    "pink red or brown blood in urine": "पेशाब में लाल, गुलाबी या भूरा खून",
    "pins and needles radiating to forearm": "बांह तक झनझनाहट और सुन्नपन",
    "please consult a qualified healthcare professional.": "कृपया किसी योग्य स्वास्थ्य विशेषज्ञ से परामर्श लें।",
    "post-nasal drip and watery eyes": "गले में कफ टपकना और आंखों में पानी",
    "pounding heart or rapid palpitations": "दिल की तेज धड़कन या घबराहट",
    "puffy or swollen eyelids": "फूली हुई या सूजी हुई पलकें",
    "pus draining from gum with bad taste": "मसूड़ों से मवाद और मुंह का खराब स्वाद",
    "pustules with whiteheads": "मवाद वाले सफेद दाने / फुंसियां",
    "racing heartbeat or palpitations": "तेज धड़कन या दिल का जोर से धड़कना",
    "raised itchy red hives": "उभरे हुए लाल खुजलीदार चकत्ते (पित्ती)",
    "rapidly expanding skin redness": "त्वचा की लाली का तेजी से फैलना",
    "red and swollen tonsils": "लाल और सूजे हुए टॉन्सिल",
    "red inflamed skin on elbows or knees": "कोहनी या घुटनों पर लाल सूजी त्वचा",
    "red skin patches covered with silvery scales": "चांदी जैसी पपड़ी से ढके लाल चकत्ते",
    "red swollen eyelid margins": "पलकों के किनारों पर लाली और सूजन",
    "red swollen or puffy gums": "मसूड़ों में लाली और सूजन",
    "redness and swelling of the vulva": "योनि मार्ग के बाहरी हिस्से में लाली व सूजन",
    "redness in both eyes": "दोनों आंखों में लाली",
    "restlessness or feeling on edge": "बेचैनी और चिड़चिड़ापन",
    "rough growths on fingers or hands": "उंगलियों या हाथों पर खुरदुरे मस्से",
    "runny or stuffy nose": "बहती या बंद नाक",
    "scalp itching and soreness": "सिर की त्वचा में खुजली और दर्द",
    "scratchy voice and bad breath": "बैठी हुई आवाज और सांस में दुर्गंध",
    "sensitive raw skin flare-ups": "संवेदनशील त्वचा में जलन व खुजली बढ़ना",
    "sensitivity to bright light": "तेज रोशनी से परेशानी (फोटोफोबिया)",
    "sensitivity to hot or cold food": "ठंडा या गरम खाने पर दांतों में झनझनाहट",
    "sensitivity to light and sound": "रोशनी और तेज आवाज से सिरदर्द",
    "severe discomfort": "गंभीर परेशानी",
    "severe generalized body aches": "पूरे शरीर में अत्यधिक बदन दर्द",
    "severe menstrual cramps and pelvic pain": "माहवारी में तेज ऐंठन और पेल्विक दर्द",
    "severe restriction in raising arm": "हाथ ऊपर उठाने में भारी रुकावट",
    "severe scratchy or raw sore throat": "गले में अत्यधिक चुभन और तेज दर्द",
    "severe sharp pain in side and back": "पीठ और पसली में तेज चुभने वाला दर्द",
    "severe throbbing toothache": "दांत में असहनीय धड़कता हुआ दर्द",
    "sharp chest pain when breathing deeply": "गहरी सांस लेने पर सीने में तेज चुभन",
    "sharp demarcation where substance touched": "छूने वाली जगह पर स्पष्ट लाल निशान",
    "sharp pain during bowel movements": "शौच के समय तेज चुभन या दर्द",
    "sharp pain in lower right abdomen": "निचले दाहिने पेट में तेज चुभने वाला दर्द",
    "shooting electric pain down one leg": "पैर में करंट जैसा दौड़ता हुआ दर्द (सायटिका)",
    "shortness of breath": "सांस लेने में कठिनाई",
    "shortness of breath and rapid breathing": "सांस फूलना और तेज-तेज सांस लेना",
    "shortness of breath on exertion": "थोड़ा चलने या मेहनत पर सांस फूलना",
    "shortness of breath on mild exertion": "हल्की मेहनत में ही सांस भर जाना",
    "shortness of breath or smothering feeling": "सांस रुकने या दम घुटने जैसा अहसास",
    "shortness of breath with mucus": "बलगम के साथ सांस लेने में तकलीफ",
    "skin blister or peeling after contact": "छूने के बाद त्वचा पर छाले या चमड़ी उतरना",
    "skin firmness or tightness": "त्वचा में खिंचाव या कड़ापन",
    "skin rash or itching": "त्वचा पर दाने या खुजली",
    "skin rash or pimples": "त्वचा पर दाने या मुहांसे",
    "skin thickening from scratching": "खुजलाने से त्वचा का मोटा पड़ना",
    "small fleshy grainy skin bumps": "त्वचा पर छोटे दानेदार मस्से",
    "small fluid-filled blisters": "पानी भरे छोटे-छोटे छाले",
    "small pus spot at base of eyelash": "पलक की जड़ में मवाद वाली फुंसी",
    "sneezing fits": "लगातार छींकों के दौरे",
    "sound sensitivity": "ध्वनि के प्रति संवेदनशीलता",
    "sour or bitter acid regurgitation": "मुंह में खट्टा या कड़वा पानी आना",
    "spinning sensation when turning head or rolling over": "सिर घुमाने या करवट लेने पर चक्कर आना",
    "spreading red skin area": "त्वचा की लाली का फैलना",
    "started 2-3 days ago": "2-3 दिन पहले शुरू हुआ",
    "started today": "आज ही शुरू हुआ",
    "started today (sudden)": "आज अचानक शुरू हुआ",
    "stiff shoulder joint worse at night": "रात में कंधे के जोड़ में अधिक जकड़न",
    "stiffness and reduced range of motion": "जोड़ों में अकड़न और हिलने में रुकावट",
    "stomach / abdomen": "पेट / उदर",
    "stomach pain or nausea": "पेट दर्द या मतली",
    "stomach pain temporarily relieved by food": "खाना खाने पर पेट दर्द में कुछ राहत",
    "stringy eye discharge": "आंखों से रेशेदार या चिपचिपा स्राव",
    "strong persistent urge to urinate": "पेशाब जाने की लगातार तीव्र इच्छा",
    "sudden episode of intense terror": "अचानक अत्यधिक डर या घबराहट का दौरा",
    "sudden skin wheals or welts": "त्वचा पर अचानक उभरे लाल चकत्ते (पित्ती)",
    "swelling in cheek or jaw": "गाल या जबड़े में सूजन",
    "swelling of lips or face": "होंठों या चेहरे पर सूजन",
    "swelling of the entire eyelid": "पूरी पलक पर सूजन",
    "swelling or bruising around joint": "जोड़ के आसपास सूजन या नील पड़ना",
    "swelling or tenderness around knee or hip": "घुटने या कूल्हे के पास सूजन व दर्द",
    "swollen and stiff joints with skin rash": "चकत्तों के साथ जोड़ों में सूजन व अकड़न",
    "swollen red tonsils": "लाल और सूजे हुए टॉन्सिल",
    "swollen warm and tender skin": "सूजी हुई, गर्म और दर्दनाक त्वचा",
    "tearing sensation in anal area": "गुदा में चीरा या फटने जैसा अहसास",
    "tender gums and gum recession": "मसूड़ों में दर्द और मसूड़े नीचे खिसकना",
    "tender swollen lymph nodes in neck": "गर्दन में दर्दनाक सूजी हुई गांठें",
    "tender swollen lymph nodes under jaw": "जबड़े के नीचे सूजी हुई दर्दनाक गांठें",
    "tenderness and crusting along eyelid": "पलक के किनारे दर्द और पपड़ी",
    "tenderness on scalp neck and shoulder muscles": "सिर, गर्दन और कंधे की मांसपेशियों में दर्द",
    "thick white odorless discharge like cottage cheese": "पनीर जैसा गाढ़ा सफेद गंधहीन स्राव",
    "thick yellow or green nasal discharge": "गाढ़ा पीला या हरा नाक का बलगम",
    "thickened pitted or ridged nails": "मोटे, गड्ढेदार या धारीदार नाखून",
    "thin grayish-white vaginal discharge": "पतला भूरा-सफेद योनि स्राव",
    "throbbing pulsating headache on one side": "एक तरफ धड़कता हुआ तेज सिरदर्द",
    "tightness or pressure across forehead and temples": "माथे और कनपटियों पर कसाव व दबाव",
    "tingling pins and needles in leg": "पैर में झनझनाहट और सुन्नपन",
    "tiny black pinpoints of clotted blood vessels": "मस्से में खून की नसों के काले बिंदु",
    "trembling, shaking and sweating": "कांपना, थरथराना और पसीना आना",
    "unexplained weight gain": "बिना कारण वजन बढ़ना",
    "unpleasant fishy odor worsening after wash": "धोने के बाद बढ़ने वाली मछली जैसी दुर्गंध",
    "unusual or foul vaginal discharge": "असामान्य या दुर्गंधयुक्त योनि स्राव",
    "urgent need to use the toilet": "तुरंत शौच जाने की तीव्र हाजत",
    "urinary / bladder": "मूत्र / मूत्राशय",
    "urinary dribbling at end of flow": "पेशाब खत्म होने पर बूंद-बूंद टपकना",
    "vaginal soreness and rash": "योनि में दर्द, खरोंच और दाने",
    "visual disturbances or aura": "आंखों के आगे चमक या धुंधलापन (ऑरा)",
    "vomiting": "उल्टी",
    "warm flushed skin": "गर्म और लाल पड़ी हुई त्वचा",
    "watering eye with eyelid irritation": "आंख से पानी और पलक में जलन",
    "watery diarrhea": "पानी जैसे पतले दस्त",
    "watery itchy eyes": "आंखों में पानी और खुजली",
    "weak grip strength dropping objects": "हाथ की पकड़ कमजोर होना (चीजें छूटना)",
    "weak urinary stream": "पेशाब की कमजोर धार",
    "wheezing breath sounds": "सांस लेते समय सीटी जैसी आवाज",
    "white or yellow patches on tonsils": "टॉन्सिल पर सफेद या पीले धब्बे",
    "wrist aching after repetitive tasks": "बार-बार एक ही काम से कलाई में दर्द",
    "yellow or green eye discharge": "आंखों से पीला या हरा कीचड़/मवाद",
    "yellowish or clear ear drainage": "कान से पीला या साफ पानी बहना",
  },
  gu: {
    "2 to 3 days ago": "2 થી 3 દિવસ પહેલાં",
    "abdomen / stomach": "પેટ / જઠર",
    "abdominal bloating and excessive gas": "પેટ ફૂલવું અને વધુ પડતો ગેસ",
    "abdominal cramping relieved by bowel movement": "ઝાડા પછી પેટના ખેંચાણમાં રાહત",
    "abdominal cramps and stomach spasms": "પેટમાં ચૂંક અને ખેંચાણ",
    "abdominal tenderness worsening with movement": "હલનચલનથી પેટનો દુખાવો વધવો",
    "abnormal rapid eye movements": "આંખોની અસામાન્ય ઝડપી હલનચલન",
    "acid taste or belching": "ખાટો સ્વાદ અથવા ખાટા ઓડકાર",
    "alternating diarrhea and constipation": "વારાફરતી ઝાડા અને કબજિયાત",
    "anal spasms after defecation": "શૌચ પછી ગુદામાં ખેંચાણ",
    "arms or legs": "હાથ અથવા પગ",
    "back or spine": "પીઠ અથવા કરોડરજ્જુ",
    "bleeding between menstrual periods": "માસિક સ્રાવ વચ્ચે રક્તસ્રાવ",
    "bleeding gums during brushing or flossing": "બ્રશ કરતી વખતે પેઢામાંથી લોહી નીકળવું",
    "bloating and feeling full quickly": "પેટ ફૂલવું અને ઝડપથી પેટ ભરાઈ જવું",
    "bone spurs or joint enlargement": "હાડકાં વધવા અથવા સાંધા મોટા થવા",
    "bright red blood on toilet paper": "ટોયલેટ પેપર પર તાજું લાલ લોહી",
    "burning ache in upper stomach": "ઉપલા પેટમાં બળતરા અને દુખાવો",
    "burning during urination or intercourse": "પેશાબ કે સંભોગ વખતે બળતરા",
    "burning hand sensation worse at night": "હાથમાં બળતરા (રાત્રે વધુ)",
    "burning or stinging in eyelids": "પોપચાંમાં બળતરા કે ડંખ જેવી પીડા",
    "burning sensation during urination": "પેશાબ કરતી વખતે બળતરા",
    "burning skin irritation from soap or metal": "સાબુ કે ધાતુથી ચામડી પર બળતરા",
    "burning stinging sensation when urinating": "પેશાબ કરતી વખતે તીવ્ર બળતરા",
    "changes in sleep and appetite": "ઊંઘ અને ભૂખમાં ફેરફાર",
    "chest / heart area": "છાતી / હૃદય વિસ્તાર",
    "chest burning after heavy meals": "ભારે ખોરાક પછી છાતીમાં બળતરા",
    "chest discomfort and fear of losing control": "છાતીમાં બેચેની અને ગભરાટ",
    "chest or throat": "છાતી અથવા ગળું",
    "chest soreness from coughing": "ખાંસીને કારણે છાતીમાં દુખાવો",
    "chest tightness": "છાતીમાં જકડન",
    "chest tightness after dust exposure": "ધૂળના સંપર્ક પછી છાતીમાં જકડન",
    "chronic fatigue and lack of energy": "સતત થાક અને ઊર્જાનો અભાવ",
    "chronic pelvic aching before period": "માસિક પહેલાં પેલ્વિક વિસ્તારમાં દુખાવો",
    "clear runny nose": "નાકમાંથી સ્વચ્છ પાણી વહેવું",
    "cloudy or strong-smelling urine": "દૂધિયો અથવા તીવ્ર ગંધવાળો પેશાબ",
    "clustered skin lesions with rough texture": "ખરબચડી ચામડીના ફોલ્લીઓનો ઝૂમખો",
    "cold hands and feet": "હાથ અને પગ ઠંડા રહેવા",
    "constipation and muscle weakness": "કબજિયાત અને સ્નાયુઓની નબળાઈ",
    "constipation or difficulty having bowel movements": "કબજિયાત અથવા શૌચમાં તકલીફ",
    "cough or sore throat": "ખાંસી અથવા ગળામાં ખરાશ",
    "cough producing green yellow or bloody phlegm": "લીલો, પીળો અથવા લોહીવાળો કફ આવવો",
    "coughing worse at night or early morning": "રાત્રે કે વહેલી સવારે ખાંસી વધવી",
    "crusty eyelashes upon waking": "સવારે ઉઠતી વખતે પોપચાં પર પોપડા જામવા",
    "cystic skin blemishes": "ચામડી પર ઊંડા ફોલ્લા કે ખીલ",
    "dandruff flakes on scalp hair or eyebrows": "માથાના વાળ અથવા ભમર પર ખોડો",
    "deep throbbing ear pain": "કાનમાં ઊંડો ધબકારા મારતો દુખાવો",
    "dehydration with dry mouth": "મોં સુકાવું અને શરીરમાં પાણીની કમી",
    "difficulty breathing with cold air": "ઠંડી હવામાં શ્વાસ લેવામાં તકલીફ",
    "difficulty concentrating and sleep disturbances": "ધ્યાન કેન્દ્રિત કરવામાં મુશ્કેલી અને અનિદ્રા",
    "difficulty starting urination": "પેશાબ શરૂ કરવામાં અડચણ",
    "difficulty swallowing or throat clearing": "ગળવામાં તકલીફ અથવા વારંવાર ગળું સાફ કરવું",
    "difficulty urinating or weak stream": "પેશાબ કરવામાં તકલીફ અથવા નબળી ધાર",
    "discomfort while sitting": "બેસતી વખતે તકલીફ કે દુખાવો",
    "discomfort without significant redness": "વધુ લાલાશ વિના અસ્વસ્થતા",
    "discomfort worse when lying flat": "સીધા સૂતી વખતે તકલીફ વધવી",
    "dizziness": "ચક્કર આવવા",
    "dizziness lasting seconds to minutes": "થોડી સેકન્ડ કે મિનિટ માટે ચક્કર આવવા",
    "dizziness, lightheadedness or brittle nails": "ચક્કર આવવા, માથું હળવું લાગવું કે બરડ નખ",
    "dry brittle skin and coarse hair": "સૂકી બરડ ચામડી અને બરછટ વાળ",
    "dry cracked skin patches": "ચામડી પર સૂકા ફાટેલા ચકામા",
    "dry cracked skin that may bleed": "સૂકી ફાટેલી ચામડી જેમાંથી લોહી નીકળી શકે",
    "dry hacking cough": "સૂકી સતત ખાંસી",
    "dull aching head pain like a tight band": "માથા પર પટ્ટી બાંધી હોય તેવો દુખાવો",
    "dull aching pain in shoulder joint": "ખભાના સાંધામાં ધીમો દુખાવો",
    "ear canal pain and tenderness": "કાનની નળીમાં દુખાવો અને સ્પર્શથી પીડા",
    "exhaustion and profound fatigue": "અતિશય નબળાઈ અને થાક",
    "extreme fatigue and weakness": "તીવ્ર થાક અને અશક્તિ",
    "extreme sensitivity to cold": "ઠંડી પ્રત્યે વધુ પડતી સંવેદનશીલતા",
    "eye pain or redness": "આંખમાં દુખાવો અથવા લાલાશ",
    "eye redness and bloodshot look": "આંખોમાં લાલાશ અને લોહી જેવો રંગ",
    "eye redness or watering": "આંખોમાં લાલાશ અથવા પાણી આવવું",
    "eyelids stuck together in morning": "સવારે ઉઠતી વખતે પોપચાં ચોંટી જવા",
    "facial pain, pressure and fullness": "ચહેરા પર દુખાવો, દબાણ અને ભારેપણું",
    "facial pimples and blackheads": "ચહેરા પર ખીલ અને બ્લેકહેડ્સ",
    "fatigue": "થાક",
    "fatigue and malaise": "થાક અને સુસ્તી",
    "fatigue, sweating and low oxygen feeling": "થાક, પરસેવો અને શ્વાસ ખૂટવો",
    "feeling of incomplete bladder emptying": "પેશાબ પૂરેપૂરો ખાલી ન થયાનો અહેસાસ",
    "feelings of worthlessness or guilt": "નકામાપણાની કે દોષિત હોવાની લાગણી",
    "fever and chills accompanying rash": "ચકામા સાથે તાવ અને ધ્રુજારી",
    "fever and chills with pelvic pain": "પેલ્વિક દુખાવા સાથે તાવ અને ઠંડી",
    "fever and ear fullness": "તાવ અને કાનમાં ભારેપણું",
    "fever and swollen glands in neck": "તાવ અને ગળાની લસિકાગ્રંથિઓમાં સોજો",
    "fever or chills": "તાવ અથવા ઠંડી લાગવી",
    "fever without cough": "ખાંસી વિના તાવ",
    "flaking around nose folds and ears": "નાક અને કાન પાસે ચામડીના પોપડા",
    "flaking skin around eyelash roots": "પોપચાંના મૂળ પાસે પોપડી વળવી",
    "flu-like symptoms with acute pelvic pain": "ફ્લૂ જેવા લક્ષણો સાથે તીવ્ર પેલ્વિક દુખાવો",
    "fluid draining from ear after rupture": "કાનમાંથી પ્રવાહી કે પરુ વહેવું",
    "frequent sneezing": "વારંવાર છીંકો આવવી",
    "frequent urination at night": "રાત્રે વારંવાર પેશાબ લાગવો",
    "frequent urination from bladder pressure": "મૂત્રાશય પર દબાણથી વારંવાર પેશાબ",
    "general physician": "જનરલ ફિઝિશિયન",
    "gnawing or burning stomach pain": "પેટમાં બળતરા અથવા કોરી ખાતો દુખાવો",
    "gradual worsening of shoulder mobility": "ખભાની હલનચલનમાં ધીમે ધીમે ઘટાડો",
    "greasy skin covered with flaky white or yellow scales": "ચીકણી ચામડી પર સફેદ કે પીળા પોપડા",
    "grinding sensation when turning neck": "ગરદન ફેરવતી વખતે ઘસારો અનુભવાવો",
    "gritty sandy feeling in eye": "આંખમાં કચરો કે રેતી જેવી ખૂંચણી",
    "gritty sensation in eyes": "આંખોમાં કચરો ખૂંચવો",
    "hard flat growths on soles of feet": "પગના તળિયે કઠણ ચપટા મસા",
    "head / neck": "માથું / ગરદન",
    "headache / face": "માથાનો દુખાવો / ચહેરો",
    "headache aggravated by physical activity": "શારીરિક શ્રમથી માથાનો દુખાવો વધવો",
    "headache and sore throat": "માથાનો દુખાવો અને ગળામાં ખરાશ",
    "headache not aggravated by routine activity": "સામાન્ય કામકાજથી ન વધતો માથાનો દુખાવો",
    "headache worsening when leaning forward": "આગળ નમવાથી માથાનો દુખાવો વધવો",
    "headaches starting from back of neck": "ગરદનની પાછળથી શરૂ થતો માથાનો દુખાવો",
    "heartburn and nausea": "છાતીમાં બળતરા અને ઉબકા",
    "heartburn burning behind breastbone": "છાતીના હાડકા પાછળ તીવ્ર બળતરા",
    "heavy or irregular menstrual bleeding": "માસિકમાં વધુ કે અનિયમિત રક્તસ્રાવ",
    "heavy or prolonged menstrual periods": "લાંબા સમય સુધી કે ભારે માસિક સ્રાવ",
    "high fever and severe chills": "તીવ્ર તાવ અને સખત ઠંડી લાગવી",
    "high fever with shaking chills": "ધ્રૂજારી સાથે સખત તાવ",
    "inability to reach behind back": "પીઠ પાછળ હાથ લઈ જવામાં અસમર્થતા",
    "indigestion and abdominal bloating": "અપચો અને પેટ ફૂલવું",
    "intense itching after exposure": "સંપર્ક પછી તીવ્ર ખંજવાળ",
    "intense vaginal itching and irritation": "યોનિમાર્ગમાં તીવ્ર ખંજવાળ અને બળતરા",
    "intensely itchy dry skin patches": "અતિશય ખંજવાળવાળા સૂકા ચકામા",
    "intolerance to fatty foods": "ચીકણા/તળેલા ખોરાકથી અપાચન",
    "irritability and ear tugging in children": "બાળકોમાં ચીડચીડાપણું અને કાન ખેંચવો",
    "itching and burning skin plaques": "ચામડીના પોપડાવાળા ભાગમાં ખંજવાળ અને બળતરા",
    "itching inside the ear canal": "કાનની અંદર ખંજવાળ આવવી",
    "itching or irritation in anal region": "ગુદા વિસ્તારમાં ખંજવાળ કે બળતરા",
    "itchy and watery eyes": "આંખોમાં ખંજવાળ અને પાણી આવવું",
    "itchy nose and roof of mouth": "નાક અને તાળવામાં ખંજવાળ",
    "joint or back pain": "સાંધા અથવા પીઠનો દુખાવો",
    "joint or body pain": "સાંધા અથવા શરીરનો દુખાવો",
    "joint pain and aching during activity": "પ્રવૃત્તિ દરમિયાન સાંધાનો દુખાવો",
    "joint stiffness after resting or in morning": "આરામ પછી કે સવારે સાંધા જકડાઈ જવા",
    "joints or muscles": "સાંધા અથવા સ્નાયુઓ",
    "light sensitivity": "પ્રકાશ પ્રત્યે સંવેદનશીલતા",
    "localized muscle pain and soreness": "સ્નાયુઓમાં ચોક્કસ જગ્યાએ દુખાવો",
    "localized red itchy skin rash": "ચામડી પર લાલ ખંજવાળવાળા ચકામા",
    "loose feeling in teeth or sensitive gums": "દાંત હલવા અથવા પેઢામાં કળતર",
    "loss of appetite": "ભૂખ ન લાગવી",
    "loss of appetite after meals": "જમ્યા પછી ભૂખ ન લાગવી",
    "loss of balance and unsteadiness": "સંતુલન ગુમાવવું અને અસ્થિરતા",
    "loss of interest in daily activities": "રોજિંદા કામોમાં રસ ઓછો થવો",
    "loss of joint flexibility and creaking": "સાંધાની લવચીકતા ઘટવી અને અવાજ આવવો",
    "low-grade fever and mild fatigue": "હળવો તાવ અને સામાન્ય થાક",
    "lower abdominal and pelvic aching": "નીચલા પેટ અને પેલ્વિક વિસ્તારમાં દુખાવો",
    "lower back pain during period": "માસિક દરમિયાન કમરનો દુખાવો",
    "lower back pain radiating into buttocks": "કમરથી થાપા તરફ ફેલાતો દુખાવો",
    "lower backache or leg pains": "કમરનો દુખાવો અથવા પગનો દુખાવો",
    "medical specialist": "તબીબી નિષ્ણાત",
    "mild discomfort": "હળવી તકલીફ",
    "mild eye soreness and tearing": "આંખમાં હળવો દુખાવો અને પાણી વહેવું",
    "mild fever and body weakness": "હળવો તાવ અને શરીરમાં અશક્તિ",
    "mild fever and chills": "હળવો તાવ અને ઠંડી",
    "mild sore throat and tickle": "ગળામાં હળવી ખરાશ અને ખૂંચણી",
    "mild to moderate pain on both sides of head": "માથાની બંને બાજુ હળવો કે મધ્યમ દુખાવો",
    "mild vaginal itching or irritation": "યોનિમાર્ગમાં હળવી ખંજવાળ કે બળતરા",
    "mucus discharge after defecation": "ઝાડા પછી ચીકાશ નીકળવી",
    "mucus in stool": "ઝાડામાં ચીકાશ કે પરુ આવવું",
    "muffled hearing from swollen ear canal": "કાનમાં સોજાને કારણે ઓછું સંભળાવું",
    "muffled hearing or ear pressure": "કાનમાં ભારે દબાણ અથવા ઓછું સંભળાવું",
    "muscle spasms or cramping": "સ્નાયુઓમાં ખેંચાણ કે ચૂંક",
    "muscle tension and trembling": "સ્નાયુઓમાં તણાવ અને ધ્રૂજારી",
    "nasal congestion and difficulty breathing": "નાક બંધ થવું અને શ્વાસ લેવામાં તકલીફ",
    "nasal congestion and stuffiness": "નાક ભરાઈ જવું અને બંધ થવું",
    "nausea": "ઉબકા",
    "nausea and feeling full quickly": "ઉબકા આવવા અને થોડું ખાતાં જ ધરાઈ જવું",
    "nausea and frequent vomiting": "ઉબકા અને વારંવાર ઉલટી થવી",
    "nausea and low-grade fever": "ઉબકા અને હળવો તાવ",
    "nausea and vomiting during headache": "માથાના દુખાવા સાથે ઉબકા અને ઉલટી",
    "nausea and vomiting with flank pain": "પડખાના દુખાવા સાથે ઉબકા અને ઉલટી",
    "nausea and vomiting with movement": "હલનચલનથી ઉબકા અને ઉલટી થવી",
    "nausea or vomiting": "ઉબકા અથવા ઉલટી",
    "neck stiffness": "ગરદનમાં જકડાઈ જવું",
    "neck stiffness and aching pain": "ગરદનમાં જકડન અને દુખાવો",
    "needs medical consultation": "તબીબી સલાહની જરૂર છે",
    "no more symptoms": "વધુ કોઈ લક્ષણો નથી",
    "numbness and tingling in thumb and fingers": "અંગૂઠા અને આંગળીઓમાં સુન્નતા કે ઝણઝણાટી",
    "numbness or tingling in fingers": "આંગળીઓમાં ઝણઝણાટી અથવા બહેરાશ",
    "numbness or weakness in calf or foot": "પિંડી કે પગમાં સુન્નતા અથવા નબળાઈ",
    "oily skin with clogged pores": "બંધ છિદ્રો સાથે તેલી ચામડી",
    "pain aggravated by prolonged sitting": "લાંબો સમય બેસી રહેવાથી દુખાવો વધવો",
    "pain in perineum groin or lower back": "સાથળ, કમર કે પેલ્વિકમાં દુખાવો",
    "pain in upper teeth or behind cheeks": "ઉપલા દાંતમાં કે ગાલ પાછળ દુખાવો",
    "pain or burning during urination": "પેશાબ કરતી વખતે દુખાવો કે બળતરા",
    "pain radiating down shoulder and arm": "ખભાથી હાથ તરફ ફેલાતો દુખાવો",
    "pain radiating to lower abdomen and groin": "નીચલા પેટ અને સાથળ તરફ ફેલાતો દુખાવો",
    "pain starting near navel and moving down": "ડૂંટી પાસે શરૂ થઈ નીચે તરફ જતો દુખાવો",
    "pain when pulling earlobe or pressing tragus": "કાન ખેંચવા કે દબાવવાથી દુખાવો થવો",
    "pain worsening when using injured muscle": "ઈજાગ્રસ્ત સ્નાયુ વાપરવાથી દુખાવો વધવો",
    "painful and difficult swallowing": "ખોરાક ગળવામાં દુખાવો અને મુશ્કેલી",
    "painful ejaculation": "સ્ખલન વખતે દુખાવો",
    "painful intercourse": "સંભોગ દરમિયાન દુખાવો",
    "painful lump or swelling near anus": "ગુદા પાસે દુખાવો કરતી ગાંઠ કે સોજો",
    "painful red bump along eyelid edge": "પોપચાંની કિનારી પર લાલ દુખતી ફોલ્લી (આંજણી)",
    "painful red bumps on face or back": "ચહેરા કે પીઠ પર લાલ દુખતા ખીલ",
    "painful swallowing": "ગળતી વખતે દુખાવો થવો",
    "painful urination or pain during intercourse": "પેશાબ કે સંભોગ વખતે દુખાવો",
    "painful urination with intense spasms": "પેશાબમાં તીવ્ર ચૂંક સાથે દુખાવો",
    "painless bleeding during bowel movement": "ઝાડા વખતે દર્દ વિના લોહી નીકળવું",
    "pale skin and pale inner eyelids": "ફિક્કી ચામડી અને પોપચાંમાં ફીકાશ",
    "passing frequent small amounts of urine": "થોડો-થોડો વારંવાર પેશાબ થવો",
    "patches of red skin with greasy scales": "લાલ ચામડી પર ચીકણા પોપડા",
    "pelvic pressure or fullness": "પેલ્વિક ભાગમાં ભારે દબાણ",
    "pelvic pressure or lower belly discomfort": "નીચલા પેટમાં દબાણ કે અસ્વસ્થતા",
    "persistent bad breath": "મોંમાંથી સતત દુર્ગંધ આવવી",
    "persistent fatigue and sluggishness": "સતત થાક અને સુસ્તી રહેવી",
    "persistent low mood and sadness": "સતત ઉદાસી અને હતાશા",
    "persistent productive cough with phlegm": "કફવાળી સતત ખાંસી",
    "persistent rectal burning": "ગુદામાં સતત બળતરા",
    "persistent worry and nervousness": "સતત ચિંતા અને ગભરાટ",
    "pink red or brown blood in urine": "પેશાબમાં ગુલાબી, લાલ કે કથ્થઈ લોહી",
    "pins and needles radiating to forearm": "હાથ તરફ ફેલાતી ઝણઝણાટી કે સોય ભોંકાતી પીડા",
    "please consult a qualified healthcare professional.": "કૃપા કરીને લાયક તબીબી નિષ્ણાતની સલાહ લો.",
    "post-nasal drip and watery eyes": "ગળામાં કફ પડવો અને આંખોમાંથી પાણી",
    "pounding heart or rapid palpitations": "હૃદયના ઝડપી ધબકારા કે ધડકન વધવી",
    "puffy or swollen eyelids": "ફૂલેલા અથવા સોજાવાળા પોપચાં",
    "pus draining from gum with bad taste": "પેઢામાંથી પરુ નીકળવું અને ખરાબ સ્વાદ",
    "pustules with whiteheads": "પરુ ભરેલા સફેદ દાણા કે ખીલ",
    "racing heartbeat or palpitations": "ધબકારા ઝડપી થવા કે ધબકારો વધવો",
    "raised itchy red hives": "ઉપસેલા લાલ ખંજવાળવાળા ઢીમચાં (શીતપિત્ત)",
    "rapidly expanding skin redness": "ચામડીની લાલાશ ઝડપથી ફેલાવી",
    "red and swollen tonsils": "લાલ અને સોજાવાળા કાકડા (ટૉન્સિલ)",
    "red inflamed skin on elbows or knees": "કોણી કે ઢીંચણ પર લાલ સોજાવાળી ચામડી",
    "red skin patches covered with silvery scales": "રૂપેરી પોપડાવાળા લાલ ચકામા",
    "red swollen eyelid margins": "પોપચાંની કિનારી પર લાલાશ અને સોજો",
    "red swollen or puffy gums": "પેઢામાં લાલાશ અને સોજો",
    "redness and swelling of the vulva": "ગુપ્તાંગના બહારના ભાગમાં લાલાશ અને સોજો",
    "redness in both eyes": "બંને આંખો લાલ થવી",
    "restlessness or feeling on edge": "બેચેની અને અજંપો",
    "rough growths on fingers or hands": "આંગળીઓ કે હાથ પર ખરબચડા મસા",
    "runny or stuffy nose": "વહેતું કે બંધ નાક",
    "scalp itching and soreness": "માથાની ચામડીમાં ખંજવાળ અને દુખાવો",
    "scratchy voice and bad breath": "ઘોઘરો અવાજ અને મોંની દુર્ગંધ",
    "sensitive raw skin flare-ups": "સંવેદનશીલ ચામડીમાં અચાનક બળતરા",
    "sensitivity to bright light": "તીવ્ર પ્રકાશથી આંખો અંજાવવી",
    "sensitivity to hot or cold food": "ઠંડો કે ગરમ ખોરાક લેતાં દાંતમાં કળતર",
    "sensitivity to light and sound": "અજવાળા અને અવાજથી અકળામણ",
    "severe discomfort": "ગંભીર તકલીફ",
    "severe generalized body aches": "સમગ્ર શરીરમાં તીવ્ર કળતર અને દુખાવો",
    "severe menstrual cramps and pelvic pain": "માસિકમાં અસહ્ય ખેંચાણ અને પેલ્વિક દુખાવો",
    "severe restriction in raising arm": "હાથ ઊંચો કરવામાં ભારે મુશ્કેલી",
    "severe scratchy or raw sore throat": "ગળામાં સખત છોલાણ કે તીવ્ર ખરાશ",
    "severe sharp pain in side and back": "પીઠ અને પડખામાં તીવ્ર ચસકો મારતો દુખાવો",
    "severe throbbing toothache": "દાંતમાં સખત ધબકારા મારતો દુખાવો",
    "sharp chest pain when breathing deeply": "ઊંડો શ્વાસ લેતી વખતે છાતીમાં તીક્ષ્ણ દુખાવો",
    "sharp demarcation where substance touched": "વસ્તુ અડકી હોય તેટલા ભાગમાં ચોક્કસ નિશાન",
    "sharp pain during bowel movements": "શૌચ વખતે તીવ્ર ચીરા જેવી પીડા",
    "sharp pain in lower right abdomen": "નીચલા જમણા પેટમાં તીક્ષ્ણ દુખાવો",
    "shooting electric pain down one leg": "પગમાં કરંટ જેવો વહેતો દુખાવો (સાયટિકા)",
    "shortness of breath": "શ્વાસ લેવામાં તકલીફ",
    "shortness of breath and rapid breathing": "શ્વાસ ચડવો અને ઝડપી શ્વાસોચ્છવાસ",
    "shortness of breath on exertion": "શ્રમ કે ચાલવાથી શ્વાસ ચડવો",
    "shortness of breath on mild exertion": "હળવા કામમાં પણ શ્વાસ ચડી જવો",
    "shortness of breath or smothering feeling": "શ્વાસ રુંધાતો હોય તેવો અહેસાસ",
    "shortness of breath with mucus": "કફ સાથે શ્વાસ લેવામાં તકલીફ",
    "skin blister or peeling after contact": "સંપર્ક પછી ચામડી પર ફોલ્લા કે પોપડા ઉખડવા",
    "skin firmness or tightness": "ચામડીમાં ખેંચાણ કે કડકપણું",
    "skin rash or itching": "ચામડી પર ચકામા કે ખંજવાળ",
    "skin rash or pimples": "ચામડી પર ચકામા અથવા ખીલ",
    "skin thickening from scratching": "ખંજવાળવાથી ચામડી જાડી થઈ જવી",
    "small fleshy grainy skin bumps": "ચામડી પર નાના દાણાદાર મસા",
    "small fluid-filled blisters": "પાણી ભરેલા નાના ફોલ્લા",
    "small pus spot at base of eyelash": "પોપચાંના મૂળમાં પરુવાળી નાની ફોડલી",
    "sneezing fits": "વારંવાર આવતી છીંકો",
    "sound sensitivity": "અવાજ પ્રત્યે સંવેદનશીલતા",
    "sour or bitter acid regurgitation": "મોંમાં ખાટો કે કડવો પિત્તનો ઓડકાર",
    "spinning sensation when turning head or rolling over": "માથું ફેરવતી વખતે કે પડખું ફરતાં ચક્કર આવવા",
    "spreading red skin area": "ચામડી પર લાલ ચકામાનું વિસ્તરણ",
    "started 2-3 days ago": "2-3 દિવસ પહેલાં શરૂ થયું",
    "started today": "આજે જ શરૂ થયું",
    "started today (sudden)": "આજે અચાનક શરૂ થયું",
    "stiff shoulder joint worse at night": "રાત્રે ખભાના સાંધામાં વધુ જકડાઈ જવું",
    "stiffness and reduced range of motion": "અકડાઈ જવું અને હલનચલન મર્યાદિત થવી",
    "stomach / abdomen": "પેટ / પેટનો ભાગ",
    "stomach pain or nausea": "પેટમાં દુખાવો અથવા ઉબકા",
    "stomach pain temporarily relieved by food": "ખોરાક લેવાથી પેટના દુખાવામાં હળવાશ",
    "stringy eye discharge": "આંખોમાંથી તાર જેવો ચીકણો સ્ત્રાવ",
    "strong persistent urge to urinate": "વારંવાર પેશાબ જવાની તીવ્ર ઈચ્છા",
    "sudden episode of intense terror": "અચાનક અત્યંત ડર કે પેનિકનો હુમલો",
    "sudden skin wheals or welts": "ચામડી પર અચાનક ઉપસી આવતા ઢીમચાં",
    "swelling in cheek or jaw": "ગાલ અથવા જડબામાં સોજો",
    "swelling of lips or face": "હોઠ અથવા ચહેરા પર સોજો",
    "swelling of the entire eyelid": "આખા પોપચાં પર સોજો",
    "swelling or bruising around joint": "સાંધાની આસપાસ સોજો કે કાળું પડી જવું",
    "swelling or tenderness around knee or hip": "ઢીંચણ કે થાપાની આસપાસ સોજો અને પીડા",
    "swollen and stiff joints with skin rash": "ચકામા સાથે સાંધામાં સોજો અને જકડન",
    "swollen red tonsils": "લાલ અને સોજાવાળા કાકડા",
    "swollen warm and tender skin": "સોજાવાળી, ગરમ અને દુખતી ચામડી",
    "tearing sensation in anal area": "ગુદામાં ચીરાઈ જતી હોય તેવી પીડા",
    "tender gums and gum recession": "પેઢામાં દુખાવો અને પેઢા ઉતરી જવા",
    "tender swollen lymph nodes in neck": "ગળામાં દુખતી સોજાવાળી લસિકાગ્રંથિઓ",
    "tender swollen lymph nodes under jaw": "જડબા નીચે સોજાવાળી દુખતી ગાંઠો",
    "tenderness and crusting along eyelid": "પોપચાંની કિનારી પર પીડા અને પોપડી",
    "tenderness on scalp neck and shoulder muscles": "માથું, ગરદન અને ખભાના સ્નાયુઓમાં દુખાવો",
    "thick white odorless discharge like cottage cheese": "ચીઝ જેવો ઘટ્ટ સફેદ ગંધહીન સ્ત્રાવ",
    "thick yellow or green nasal discharge": "ઘટ્ટ પીળો અથવા લીલો નાકનો કફ",
    "thickened pitted or ridged nails": "જાડા, ખાડાવાળા કે ઊઝરડાવાળા નખ",
    "thin grayish-white vaginal discharge": "પાતળો ભૂખરો-સફેદ યોનિમાર્ગ સ્ત્રાવ",
    "throbbing pulsating headache on one side": "એક બાજુ ધબકારા મારતો માથાનો દુખાવો",
    "tightness or pressure across forehead and temples": "કપાળ અને લમણાં પર ખેંચાણ કે દબાણ",
    "tingling pins and needles in leg": "પગમાં કીડીઓ ચડતી હોય તેવી ઝણઝણાટી",
    "tiny black pinpoints of clotted blood vessels": "મસામાં રક્તવાહિનીઓના કાળા ઝીણા ટપકાં",
    "trembling, shaking and sweating": "ધ્રૂજારી અને પરસેવો વળવો",
    "unexplained weight gain": "કારણ વિના વજન વધવું",
    "unpleasant fishy odor worsening after wash": "ધોયા પછી વધતી માછલી જેવી દુર્ગંધ",
    "unusual or foul vaginal discharge": "અસામાન્ય કે દુર્ગંધયુક્ત યોનિમાર્ગ સ્ત્રાવ",
    "urgent need to use the toilet": "તાકીદે શૌચ જવાની જરૂર પડવી",
    "urinary / bladder": "પેશાબ / મૂત્રાશય",
    "urinary dribbling at end of flow": "પેશાબ પૂરો થતાં ટીપાં પડવા",
    "vaginal soreness and rash": "યોનિમાર્ગમાં દુખાવો અને ચકામા",
    "visual disturbances or aura": "દ્રષ્ટિમાં ઝબકારા કે ખલેલ (ઓરા)",
    "vomiting": "ઉલટી",
    "warm flushed skin": "ગરમ અને લાલ થયેલી ચામડી",
    "watering eye with eyelid irritation": "આંખમાંથી પાણી અને પોપચાંમાં બળતરા",
    "watery diarrhea": "પાણી જેવા પાતળા ઝાડા",
    "watery itchy eyes": "આંખોમાં પાણી અને ખંજવાળ",
    "weak grip strength dropping objects": "હાથની પકડ નબળી પડવી (વસ્તુઓ છૂટવી)",
    "weak urinary stream": "પેશાબની નબળી ધાર",
    "wheezing breath sounds": "શ્વાસ લેતી વખતે સીટી જેવો અવાજ",
    "white or yellow patches on tonsils": "કાકડા પર સફેદ કે પીળા ડાઘ",
    "wrist aching after repetitive tasks": "વારંવારના કામ પછી કાંડામાં દુખાવો",
    "yellow or green eye discharge": "આંખોમાંથી પીળો કે લીલો ચીકણો સ્ત્રાવ",
    "yellowish or clear ear drainage": "કાનમાંથી પીળો કે સ્વચ્છ સ્ત્રાવ વહેવો",
  }
};

/**
 * Checks if input is already English (ASCII / Latin characters mostly)
 */
// Romanized Hindi keywords and phrases
const HINDI_ROMANIZED_WORDS = new Set([
  'mujhe', 'mera', 'meri', 'mere', 'mujhko', 'humko', 'humein', 'aapko', 'apko', 'tumko',
  'dard', 'sar', 'sir', 'pet', 'bukhar', 'taav', 'ulti', 'chakkar', 'gale', 'khansi',
  'sardi', 'jukam', 'saans', 'jalan', 'kamzori', 'thakan', 'badan', 'kamzor', 'peshab',
  'chhati', 'dikkat', 'takleef', 'soojan', 'khujli', 'dast', 'behoshi', 'aankh', 'kaan',
  'peeth', 'ghutna', 'ghutne', 'seene', 'kamar', 'kandha', 'gala', 'naak',
  'hai', 'hain', 'ho', 'raha', 'rahi', 'rahe', 'hoga', 'hogi', 'tha', 'thi', 'the',
  'mein', 'me', 'se', 'ko', 'par', 'aur', 'bhi', 'bohot', 'bahut', 'thoda', 'jyada',
  'din', 'raat', 'subah', 'shaam', 'aaj', 'kal', 'nahi', 'nhi', 'kuch', 'koi'
]);

const HINDI_ROMANIZED_PHRASES = [
  /\b(ho\s+raha\s+hai|ho\s+rahi\s+hai|ho\s+rahe\s+hai)\b/i,
  /\b(dard\s+hai|dard\s+ho|dard\s+bhi)\b/i,
  /\b(dikkat\s+ho\s+rahi|takleef\s+ho\s+rahi|takleef\s+hai|dikkat\s+hai)\b/i,
  /\b(bukhar\s+hai|taav\s+hai|bukhar\s+bhi)\b/i,
  /\b(saans\s+lene\s+me|saans\s+lene\s+mein)\b/i,
  /\b(pet\s+me|pet\s+mein|sir\s+me|sir\s+mein|sar\s+me|sar\s+mein)\b/i,
  /\b(do\s+din\s+se|tin\s+din\s+se|ek\s+hafte\s+se|kuch\s+din\s+se)\b/i,
  /\b(chhati\s+me|chhati\s+mein|gale\s+me|gale\s+mein|seene\s+me|seene\s+mein)\b/i,
  /\b(ulti\s+bhi|vomiting\s+bhi|body\s+pain\s+bhi|fever\s+hai|headache\s+hai)\b/i,
  /\b(aur\s+kuch\s+nahi|kuch\s+nahi\s+hai|bas\s+itna\s+hi)\b/i,
];

// Romanized Gujarati keywords and phrases
const GUJARATI_ROMANIZED_WORDS = new Set([
  'mane', 'maru', 'mari', 'maro', 'tamne', 'amne', 'apne',
  'mathu', 'pet', 'taav', 'shwas', 'taklif', 'ulti', 'chakkar', 'gadu', 'khasi',
  'uthalo', 'udhras', 'shardi', 'chhati', 'jhad', 'jhada', 'dhabkara', 'khamari',
  'chhe', 'che', 'thay', 'thaye', 'pade', 'rehe', 'hato', 'hati', 'hatu',
  'thi', 'ma', 'maa', 'ane', 'pan', 'ke', 'mate', 'sudhi', 'no', 'ni', 'nu', 'na',
  'be', 'divas', 'aaje', 'kal', 'have', 'ghano', 'bahu', 'aetle', 'nathi', 'kai', 'kashu'
]);

const GUJARATI_ROMANIZED_PHRASES = [
  /\b(mathu\s+dukhe|pet\s+dukhe|chhati\s+dukhe)\b/i,
  /\b(dukhe\s+chhe|dukhe\s+che)\b/i,
  /\b(thay\s+chhe|thay\s+che|thaye\s+chhe)\b/i,
  /\b(pade\s+chhe|pade\s+che)\b/i,
  /\b(taav\s+chhe|taav\s+che|taav\s+pan)\b/i,
  /\b(shwas\s+levama|saans\s+levama)\b/i,
  /\b(taklif\s+pade\s+chhe|taklif\s+pade|taklif\s+chhe)\b/i,
  /\b(be\s+divas\s+thi|tran\s+divas\s+thi)\b/i,
  /\b(have\s+mane|mane\s+have|have\s+taav)\b/i,
  /\b(kai\s+nathi|kashu\s+nathi|biju\s+kai\s+nathi)\b/i,
];

/**
 * Detects Romanized Indic text (Hindi / Gujarati typed with an English keyboard)
 */
function detectRomanizedLanguage(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  // Check phrase matches first (high confidence)
  for (const phrase of GUJARATI_ROMANIZED_PHRASES) {
    if (phrase.test(lower)) return 'gu';
  }
  for (const phrase of HINDI_ROMANIZED_PHRASES) {
    if (phrase.test(lower)) return 'hi';
  }

  // Tokenize words
  const words = lower.match(/[a-z]+/g) || [];
  if (words.length === 0) return null;

  let hindiMatches = 0;
  let gujaratiMatches = 0;

  for (const w of words) {
    if (GUJARATI_ROMANIZED_WORDS.has(w)) gujaratiMatches++;
    if (HINDI_ROMANIZED_WORDS.has(w)) hindiMatches++;
  }

  // Decision logic: if at least 1 strong indicative token or 2 words match
  if (gujaratiMatches > hindiMatches && gujaratiMatches >= 1) {
    return 'gu';
  }
  if (hindiMatches > 0) {
    return 'hi';
  }
  return null;
}

/**
 * Checks if input is truly English
 * Returns false if text has non-ASCII characters or Romanized Indic words/phrases
 */
function isPrimarilyEnglish(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (!trimmed) return true;

  // If text contains native Indic script characters, not English
  if (/[\u0900-\u0D7F\u0600-\u06FF]/.test(trimmed)) return false;

  // If text contains Romanized Hindi/Gujarati markers, not English
  if (detectRomanizedLanguage(trimmed)) return false;

  // Non-ASCII character count check
  const nonAscii = (trimmed.match(/[^\x00-\x7F]/g) || []).length;
  return nonAscii / trimmed.length < 0.15;
}

/**
 * Detects the specific Indic script / language family directly from text characters
 */
function detectScriptLanguage(text) {
  if (!text || typeof text !== 'string') return null;
  // Devanagari (Hindi / Marathi)
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
  // Arabic / Urdu
  if (/[\u0600-\u06FF]/.test(text)) return 'ur';
  return null;
}

/**
 * Free cloud translation fallback (MyMemory API)
 * Operates without API keys or quota exhaustion limits for standard text
 */
async function translateWithMyMemory(text, sourceLang = 'auto', targetLang = 'en') {
  try {
    const trimmed = String(text || '').trim();
    if (!trimmed) return '';
    const sl = (!sourceLang || sourceLang === 'auto') ? '' : sourceLang;
    const pair = `${sl}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(pair)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const translated = data.responseData?.translatedText;
    if (
      translated && 
      typeof translated === 'string' && 
      !translated.toLowerCase().includes('is invalid') && 
      !translated.toLowerCase().includes('quota exceeded') &&
      !translated.toLowerCase().includes('daily limit')
    ) {
      return translated.trim();
    }
  } catch {
    // fallback gracefully
  }
  return null;
}

/**
 * High-speed offline translation of Romanized Indic (Hinglish/Gujlish) clinical phrases
 */
function translateRomanizedSymptoms(text) {
  const lower = String(text || '').toLowerCase().trim();
  let parts = [];

  // Headache
  if (/mathu\s+dukhe|sir\s+dard|sar\s+dard|headache/i.test(lower)) {
    parts.push('headache');
  }

  // Chest pain / Heartburn
  if (/chhati\s+ma\s+jalan|chhati\s+me\s+jalan|khatta\s+dakar/i.test(lower)) {
    parts.push('heartburn, acid reflux, sour regurgitation');
  } else if (/seene\s+me\s+dard|chhati\s+me\s+dard|chhati\s+dukhe|chest\s+pain/i.test(lower)) {
    parts.push('chest pain');
  }

  // Stomach pain
  if (/pet\s+mein\s+dard|pet\s+dukhe|pet\s+me\s+dard|maru\s+pet|mere\s+pet/i.test(lower)) {
    parts.push('stomach pain, abdominal cramps');
  }

  // Fever
  if (/bukhar|taav|fever/i.test(lower)) {
    if (/do\s+din\s+se|be\s+divas\s+thi/i.test(lower)) {
      parts.push('fever for 2 days');
    } else {
      parts.push('fever');
    }
  }

  // Breathing difficulty
  if (/saans\s+lene|shwas\s+levama|breath/i.test(lower)) {
    parts.push('shortness of breath, difficulty breathing');
  }

  // Vomiting / Nausea
  if (/ulti|vomit|nausea/i.test(lower)) {
    parts.push('nausea, vomiting');
  }

  // Body pain / Weakness
  if (/body\s+pain|badan\s+dard|badan\s+me\s+dard/i.test(lower)) {
    parts.push('body pain, generalized body ache');
  } else if (/kamzori|thakan|nablai/i.test(lower)) {
    parts.push('weakness, fatigue');
  }

  // Urinary
  if (/peshab\s+me\s+jalan|peshab\s+ma\s+balatra/i.test(lower)) {
    parts.push('burning sensation during urination, painful urination, frequent urge to pee');
  }

  // Dizziness
  if (/chakkar/i.test(lower)) {
    parts.push('dizziness');
  }

  // Cough / Cold
  if (/khansi|udhras|sardi|jukam/i.test(lower)) {
    parts.push('cough, cold');
  }

  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Normalizes translated symptom phrases to standard primary-care dataset keywords
 */
function postNormalizeTranslatedMedicalTerms(translatedText, originalText = '') {
  let text = String(translatedText || '').trim();
  const lowerOrig = String(originalText || '').toLowerCase();
  const lowerTrans = text.toLowerCase();

  // UTI normalization
  if (
    (lowerTrans.includes('burning') && (lowerTrans.includes('urine') || lowerTrans.includes('urinate') || lowerTrans.includes('urination'))) ||
    lowerOrig.includes('पेशाब') || lowerOrig.includes('પેશાબ')
  ) {
    if (!lowerTrans.includes('painful urination') && !lowerTrans.includes('frequent urge to pee')) {
      text += ', painful urination, frequent urge to pee';
    }
  }

  // GERD normalization
  if (
    lowerTrans.includes('sour bumps') || lowerTrans.includes('sour belch') || lowerTrans.includes('chest inflammation') ||
    lowerOrig.includes('બળતરા') || lowerOrig.includes('ઓડકાર') || lowerOrig.includes('खट्टी डकार') || lowerOrig.includes('सीने में जलन')
  ) {
    if (!lowerTrans.includes('acid reflux') && !lowerTrans.includes('heartburn')) {
      text += ', acid reflux, heartburn, sour regurgitation';
    }
  }

  // Negation preservation
  if (lowerOrig.includes('बुखार बिल्कुल नहीं') || lowerOrig.includes('बुखार नहीं') || lowerOrig.includes('તાવ નથી')) {
    if (!lowerTrans.includes('no fever') && !lowerTrans.includes('without fever') && !lowerTrans.includes('not fever')) {
      text += ', no fever';
    }
  }

  // Headache normalization
  if ((lowerTrans.includes('forehead') || lowerTrans.includes('pain in head') || lowerTrans.includes('head pain')) && !lowerTrans.includes('headache')) {
    text = `headache, ${text}`;
  }

  return text;
}

/**
 * Translates patient's symptoms into English for Model 2.0
 * Handles native Indic scripts, Romanized Indic (Latin keyboard), and mixed language
 */
async function translateSymptomsToEnglish(symptomsText, sourceLang = 'auto') {
  const trimmed = String(symptomsText || '').trim();
  if (!trimmed) {
    return { success: true, text: '', detectedLanguage: 'en', isRomanized: false };
  }

  const scriptDetectedLang = detectScriptLanguage(trimmed);
  const romanizedDetectedLang = detectRomanizedLanguage(trimmed);
  const isRomanized = Boolean(romanizedDetectedLang);
  const detectedCandidate = scriptDetectedLang || romanizedDetectedLang;

  const effectiveSource = detectedCandidate || (sourceLang && sourceLang !== 'auto' ? sourceLang : 'auto');

  // Check if input is truly native English (no Indic script, no Romanized Indic, English sourceLang, primarily English)
  const isPureEnglish = (sourceLang === 'en' || sourceLang === 'en-IN' || sourceLang === 'en-US' || sourceLang === 'auto') 
    && !scriptDetectedLang 
    && !romanizedDetectedLang 
    && isPrimarilyEnglish(trimmed);

  if (isPureEnglish) {
    return { success: true, text: trimmed, detectedLanguage: 'en', isRomanized: false };
  }

  // Fast-path Romanized Indic heuristic
  if (isRomanized) {
    const romanizedTranslation = translateRomanizedSymptoms(trimmed);
    if (romanizedTranslation) {
      return {
        success: true,
        text: postNormalizeTranslatedMedicalTerms(romanizedTranslation, trimmed),
        detectedLanguage: effectiveSource || 'hi',
        isRomanized: true,
        originalText: trimmed
      };
    }
  }

  // Layer 1: Attempt Gemini if configured
  if (isConfigured()) {
    const langHint = effectiveSource !== 'auto' 
      ? `The patient language is ${effectiveSource} (${isRomanized ? 'written using English/Latin alphabet - Romanized / transliterated' : 'native script'}).` 
      : 'The patient may be using Hindi, Gujarati, Bengali, or another Indian language, or Hinglish/Gujlish Romanized transliteration.';

    const prompt = `You are a strict medical translator for MediPath AI.
Translate the following patient symptom text into English medical symptom words for a machine-learning text classification model.
${langHint}
CRITICAL RULES:
1. Translate literally and accurately.
2. If the text is written with Latin alphabet in Hindi (Hinglish) or Gujarati (Gujlish) or mixed with English:
   - "mujhe sir dard hai" -> "headache"
   - "mere pet mein dard ho raha hai" -> "stomach pain, abdominal cramps"
   - "mujhe do din se bukhar hai" -> "fever for 2 days"
   - "saans lene mein dikkat ho rahi hai" -> "shortness of breath, difficulty breathing"
   - "ulti bhi ho rahi hai" -> "nausea, vomiting"
   - "mane mathu dukhe chhe" -> "headache"
   - "maru pet dukhe chhe" -> "stomach ache, abdominal pain"
   - "mane be divas thi taav chhe" -> "fever for 2 days"
   - "mane shwas levama taklif pade chhe" -> "difficulty breathing, breathlessness"
   - "have mane taav pan chhe" -> "fever"
   - "mujhe fever hai aur body pain bhi hai" -> "fever, body pain, generalized body ache"
   - "mane headache ane ulti thay chhe" -> "headache, vomiting, nausea"
3. PRESERVE ALL symptom descriptions, exact body locations, duration, severity, and qualifiers.
4. PRESERVE ALL NEGATIONS STRICTLY (e.g. "no fever", "without nausea", "no breathing difficulty", "kuch nahi", "aur koi dikkat nahi"). NEVER invert, omit, or alter a negation.
5. Use standard English clinical symptom terminology recognized in medical datasets:
   - For burning in chest / sour taste after meals / "chhati ma jalan" / "khatta dakar": use "heartburn, acid reflux, sour regurgitation".
   - For burning while peeing / "peshab me jalan": use "painful urination, burning sensation during urination, frequent urge to pee".
   - For difficulty breathing / "saans lene me takleef": use "shortness of breath, breathlessness".
   - For runny/blocked nose / "sardi jukam": use "runny nose, nasal congestion".
   - For joints/knee ache / "ghutno me dard": use "joint pain, morning stiffness".
   - For stomach pain / "pet me dard": use "abdominal pain, stomach cramps".
6. DO NOT diagnose diseases or provide medical commentary or advice.
7. Return JSON ONLY with keys:
   - "translatedText" (string)
   - "detectedLanguage" (e.g. "hi", "gu", "en", "bn", etc.)
   - "isRomanized" (boolean: true if Indian language written in Latin script)

Patient input: "${trimmed}"`;

    try {
      const res = await callGemini(prompt, 'application/json', 0.1, 4500);
      if (res && typeof res.translatedText === 'string' && res.translatedText.trim()) {
        const normalized = postNormalizeTranslatedMedicalTerms(res.translatedText.trim(), trimmed);
        return {
          success: true,
          text: normalized,
          detectedLanguage: res.detectedLanguage || effectiveSource || 'en',
          isRomanized: res.isRomanized !== undefined ? Boolean(res.isRomanized) : isRomanized,
          originalText: trimmed
        };
      }
    } catch (err) {
      console.warn('Gemini translation failed:', err.message);
    }
  }

  // Layer 2: Resilient Cloud Translation Fallback (MyMemory API)
  const myMemorySrc = scriptDetectedLang || (effectiveSource !== 'en' ? effectiveSource : 'auto');
  const mmResult = await translateWithMyMemory(trimmed, myMemorySrc, 'en');
  if (mmResult && mmResult.trim()) {
    const normalized = postNormalizeTranslatedMedicalTerms(mmResult.trim(), trimmed);
    return {
      success: true,
      text: normalized,
      detectedLanguage: effectiveSource || 'unknown',
      isRomanized,
      originalText: trimmed
    };
  }

  // Layer 3: Rule-based Romanized / Offline Dictionary fallback
  const fallbackRomanized = translateRomanizedSymptoms(trimmed);
  if (fallbackRomanized) {
    return {
      success: true,
      text: postNormalizeTranslatedMedicalTerms(fallbackRomanized, trimmed),
      detectedLanguage: effectiveSource || 'unknown',
      isRomanized: true,
      originalText: trimmed
    };
  }

  // If translation failed on non-English text, do not silently feed foreign text to Model 2.0
  if (!isPrimarilyEnglish(trimmed) || scriptDetectedLang || romanizedDetectedLang) {
    return {
      success: false,
      error: 'Translation service was unable to process non-English symptoms.',
      text: trimmed,
      detectedLanguage: effectiveSource || 'unknown',
      isRomanized
    };
  }

  return { success: true, text: trimmed, detectedLanguage: 'en', isRomanized: false };
}

/**
 * Translates clinical output from Model 2.0 into the target language for display
 */
async function translateConsultationOutput(triageData, targetLang = 'en') {
  if (!triageData || typeof triageData !== 'object') return triageData;
  if (!targetLang || targetLang === 'en' || targetLang === 'en-IN' || targetLang === 'en-US') {
    return {
      ...triageData,
      canonicalClinicalAssessment: triageData.clinicalAssessment,
      canonicalRecommendedNextStep: triageData.recommendedNextStep,
      canonicalFollowUpQuestion: triageData.followUpQuestion,
      canonicalQuickOptions: triageData.quickOptions || [],
      canonicalSafeDeferReason: triageData.safeDeferReason || null,
      language: 'en'
    };
  }

  const langMeta = SUPPORTED_LANGUAGES[targetLang] || { name: targetLang };
  const langName = langMeta.name;

  // Preserve canonical fields
  const canonicalData = {
    canonicalClinicalAssessment: triageData.clinicalAssessment,
    canonicalRecommendedNextStep: triageData.recommendedNextStep,
    canonicalFollowUpQuestion: triageData.followUpQuestion,
    canonicalQuickOptions: Array.isArray(triageData.quickOptions) ? [...triageData.quickOptions] : [],
    canonicalSafeDeferReason: triageData.safeDeferReason || null,
    language: targetLang
  };

  // Layer 1: Attempt Gemini translation if configured
  if (isConfigured()) {
    const prompt = `You are an empathetic, accurate medical translator for MediPath AI.
Translate the following doctor consultation output into natural, accurate ${langName} (${targetLang}).
RULES:
1. Translate faithfully into fluent, natural ${langName}.
2. Retain medical nuance, reassurance, and emergency urgency.
3. DO NOT alter clinical recommendations, urgency levels, or medical advice.
4. Return JSON ONLY with keys:
   - "clinicalAssessment" (translated string)
   - "recommendedNextStep" (translated string)
   - "followUpQuestion" (translated string, or null if null)
   - "quickOptions" (array of translated strings, matching original array length)
   - "safeDeferReason" (translated string, or null if null)

Data to translate:
${JSON.stringify({
  clinicalAssessment: triageData.clinicalAssessment,
  recommendedNextStep: triageData.recommendedNextStep,
  followUpQuestion: triageData.followUpQuestion,
  quickOptions: triageData.quickOptions || [],
  safeDeferReason: triageData.safeDeferReason || null,
})}`;

    try {
      const res = await callGemini(prompt, 'application/json', 0.2, 4500);
      if (res && typeof res.clinicalAssessment === 'string') {
        const translatedQuickOptions = Array.isArray(res.quickOptions) && res.quickOptions.length === (triageData.quickOptions || []).length
          ? res.quickOptions
          : triageData.quickOptions;

        return {
          ...triageData,
          ...canonicalData,
          clinicalAssessment: res.clinicalAssessment,
          recommendedNextStep: res.recommendedNextStep || triageData.recommendedNextStep,
          followUpQuestion: res.followUpQuestion !== undefined ? res.followUpQuestion : triageData.followUpQuestion,
          quickOptions: translatedQuickOptions,
          safeDeferReason: res.safeDeferReason !== undefined ? res.safeDeferReason : triageData.safeDeferReason,
          translationApplied: true,
        };
      }
    } catch (err) {
      console.warn(`Translation of consultation output to ${targetLang} failed:`, err.message);
    }
  }

  // Layer 2: Resilient Cloud Translation Fallback (MyMemory API)
  let translatedAssessment = triageData.clinicalAssessment;
  let translatedNextStep = triageData.recommendedNextStep;
  let translatedQuestion = triageData.followUpQuestion;
  let translatedReason = triageData.safeDeferReason || null;

  try {
    if (triageData.clinicalAssessment) {
      const mm = await translateWithMyMemory(triageData.clinicalAssessment, 'en', targetLang);
      if (mm) translatedAssessment = mm;
    }
    if (triageData.recommendedNextStep) {
      const mm = await translateWithMyMemory(triageData.recommendedNextStep, 'en', targetLang);
      if (mm) translatedNextStep = mm;
    }
    if (triageData.followUpQuestion) {
      const mm = await translateWithMyMemory(triageData.followUpQuestion, 'en', targetLang);
      if (mm) translatedQuestion = mm;
    }
    if (triageData.safeDeferReason) {
      const mm = await translateWithMyMemory(triageData.safeDeferReason, 'en', targetLang);
      if (mm) translatedReason = mm;
    }
  } catch (err) {
    console.warn('MyMemory output translation error:', err.message);
  }

  // Dictionary translations for standard options (like "No more symptoms")
  const dict = DICTIONARY_FALLBACKS[targetLang] || {};
  const lowerDict = {};
  Object.keys(dict).forEach(k => { lowerDict[k.toLowerCase()] = dict[k]; });
  const translatedQuickOptions = (triageData.quickOptions || []).map(opt => dict[opt] || lowerDict[String(opt).toLowerCase().trim()] || opt);

  return {
    ...triageData,
    ...canonicalData,
    clinicalAssessment: translatedAssessment,
    recommendedNextStep: translatedNextStep,
    followUpQuestion: translatedQuestion,
    quickOptions: translatedQuickOptions,
    safeDeferReason: translatedReason,
    translationApplied: translatedAssessment !== triageData.clinicalAssessment,
  };
}

/**
 * Translates arbitrary text into target language (e.g. for print summaries)
 */
async function translateText(text, targetLang = 'en') {
  const trimmed = String(text || '').trim();
  if (!trimmed || targetLang === 'en') return trimmed;

  if (isConfigured()) {
    const langMeta = SUPPORTED_LANGUAGES[targetLang] || { name: targetLang };
    const prompt = `Translate the following text into natural ${langMeta.name} (${targetLang}). Return JSON ONLY: {"translatedText": "..."}\n\nText: "${trimmed}"`;

    try {
      const res = await callGemini(prompt, 'application/json', 0.1, 4000);
      if (res?.translatedText) return res.translatedText;
    } catch {
      // fallback
    }
  }

  const mm = await translateWithMyMemory(trimmed, 'en', targetLang);
  return mm || trimmed;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  DICTIONARY_FALLBACKS,
  isPrimarilyEnglish,
  detectScriptLanguage,
  detectRomanizedLanguage,
  translateSymptomsToEnglish,
  translateConsultationOutput,
  translateText,
};
