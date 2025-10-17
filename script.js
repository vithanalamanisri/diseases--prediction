/* ===================== NAVIGATION (SPA behavior) ===================== */
const navLinks = document.querySelectorAll('.navlink');
const pages = {
  home: document.getElementById('page-home'),
  about: document.getElementById('page-about'),
  how: document.getElementById('page-how'),
  contact: document.getElementById('page-contact')
};

function showPage(pageKey){
  // update nav active
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.page === pageKey));
  // show page
  Object.keys(pages).forEach(k => {
    pages[k].classList.toggle('active', k === pageKey);
  });
  // update subtitle text for home vs others
  const subtitleEl = document.getElementById('subtitle');
  if(pageKey === 'home'){
    subtitleEl.innerText = 'Enter symptoms and details, select language';
  } else if(pageKey === 'about'){
    subtitleEl.innerText = 'About the Disease Predictor project';
  } else if(pageKey === 'how'){
    subtitleEl.innerText = 'How the Disease Predictor works';
  } else if(pageKey === 'contact'){
    subtitleEl.innerText = 'Contact details';
  }
  // adjust window hash without scrolling
  if(location.hash !== `#${pageKey}`) history.replaceState(null, '', `#${pageKey}`);
}

// initialize from hash (or default to home)
function initRouting(){
  const hash = (location.hash || '#home').replace('#','');
  if(pages[hash]) showPage(hash);
  else showPage('home');
}
navLinks.forEach(a => a.addEventListener('click', (e)=>{
  e.preventDefault();
  const page = a.dataset.page;
  showPage(page);
}));
window.addEventListener('hashchange', initRouting);
initRouting();

/* ===================== ORIGINAL APP LOGIC (fixed) ===================== */

/* ------------------ ELEMENTS ------------------ */
const languageSelect = document.getElementById('language');
const titleEl = document.querySelector('.brand h1');
const formTitleEl = document.getElementById('formTitle');
const symptomLabelEl = document.getElementById('symptomLabel');
const ageLabelEl = document.getElementById('ageLabel');
const genderLabelEl = document.getElementById('genderLabel');
const weightLabelEl = document.getElementById('weightLabel');
const predictionTitleEl = document.getElementById('predictionTitle');

const symptomInput = document.getElementById('symptoms');
const suggestionsBox = document.getElementById('suggestions');
const form = document.getElementById('symptomForm');
const ageInput = document.getElementById('age');
const genderInput = document.getElementById('gender');
const weightInput = document.getElementById('weight');
const resultDiv = document.getElementById('result');
const voiceBtn = document.getElementById('voiceBtn');
const predictBtn = document.getElementById('predictBtn');

/* ------------------ DISEASE DATABASE (English base) ------------------ */
const diseaseDB = [
  {key:"common_cold", name:"Common Cold", name_hi:"सर्दी (कॉमन कोल्ड)", name_te:"కామన్ కోల్డ్",
   symptoms:["cough","runny nose","sore throat","sneezing","congestion","mild fever","fatigue","headache"],
   tablets:"Paracetamol, Cetirizine", tablets_hi:"पैरासिटामॉल, सेट्रीज़ीन", tablets_te:"ప్యారాసిటమాల్, సెటీరిజిన్",
   ayurveda:"Tulsi tea, Ginger", ayurveda_hi:"तुलसी चाय, अदरक", ayurveda_te:"తులసి టీ, అల్లం",
   remedy:"Rest, fluids, vitamin C", remedy_hi:"आराम, तरल पदार्थ, विटामिन C", remedy_te:"విశ్రాంతి, ద్రవాలు, విటమిన్ C",
   advice:"Avoid cold drinks, rest well", advice_hi:"ठंडे पेय से बचें, अच्छा आराम लें", advice_te:"చల్లటి పానీయాలు వద్దు, బాగా విశ్రాంతి తీసుకోండి"
  },
  {key:"flu", name:"Flu", name_hi:"फ्लू (इन्फ्लुएंजा)", name_te:"ఫ్లూ",
   symptoms:["fever","cough","muscle pain","fatigue","chills","headache","sore throat","runny nose"],
   tablets:"Oseltamivir", tablets_hi:"ओसेल्टामिविर", tablets_te:"ఒసెల్టామివిర్",
   ayurveda:"Ginger tea, Turmeric milk", ayurveda_hi:"अदरक की चाय, हल्दी वाला दूध", ayurveda_te:"అల్లం టీ, పసుపు పాలు",
   remedy:"Rest, fluids, paracetamol", remedy_hi:"आराम, तरल पदार्थ, पैरासिटामॉल", remedy_te:"విశ్రాంతి, ద్రవాలు, ప్యారాసిటమాల్",
   advice:"Stay hydrated, avoid crowds", advice_hi:"हाइड्रेटेड रहें, भीड़ से बचें", advice_te:"తేకుడు తీసుకోండి, గుంపులకు వెళ్లవద్దు"
  },
  {key:"migraine", name:"Migraine", name_hi:"माइग्रेन", name_te:"మైగ్రేన్",
   symptoms:["headache","nausea","sensitivity to light","sensitivity to sound","blurred vision","vomiting","dizziness"],
   tablets:"Ibuprofen, Sumatriptan", tablets_hi:"इबूप्रोफेन, सुमात्रिप्टैन", tablets_te:"ఇబుప్రోఫెన్, సుమాట్రిప్టన్",
   ayurveda:"Brahmi, Ashwagandha", ayurveda_hi:"ब्राह्मी, अश्वगंधा", ayurveda_te:"బ్రాహ్మి, అశ్వగంధ",
   remedy:"Rest in dark room, hydration", remedy_hi:"अंधेरे कमरे में आराम, हाइड्रेशन", remedy_te:"ఇడిద్దరిన ప్రశాంతంగా విశ్రాంతి, హైడ్రేషన్",
   advice:"Avoid bright light, relax", advice_hi:"तेज़ रोशनी से बचें, आराम करें", advice_te:"పొదలు వెలుగు తప్పించుకోండి, రిలాక్స్ అవ్వండి"
  },
  {key:"food_poisoning", name:"Food Poisoning", name_hi:"खाद्य विषाक्तता", name_te:"ఆహార విషబాధ",
   symptoms:["nausea","vomiting","diarrhea","abdominal pain","cramps","stomach ache","fever"],
   tablets:"ORS, Paracetamol", tablets_hi:"ओआरएस, पैरासिटामॉल", tablets_te:"ORS, ప్యారాసిటమాల్",
   ayurveda:"Jeera water, Coriander decoction", ayurveda_hi:"जीरा पानी, धनिया का काढ़ा", ayurveda_te:"జీలకర్ర నీరు, కొత్తిమీర కాఢా",
   remedy:"Hydration, light diet", remedy_hi:"हाइड्रेशन, हल्का आहार", remedy_te:"హైడ్రేషన్, తేలికపాటి ఆహారం",
   advice:"Avoid street food, drink clean water", advice_hi:"सड़क के भोजन से बचें, साफ पानी पिएं", advice_te:"గాలిలో అమ్మే ఆహారాన్ని తినొద్దు, శుద్ధ జలమే తాగండి"
  },
  {key:"covid", name:"COVID-19", name_hi:"COVID-19", name_te:"COVID-19",
   symptoms:["fever","cough","loss of smell","loss of taste","fatigue","shortness of breath","sore throat"],
   tablets:"Paracetamol", tablets_hi:"पैरासिटामॉल", tablets_te:"ప్యారాసిటమాల్",
   ayurveda:"Giloy juice, Steam inhalation", ayurveda_hi:"गिलोय का रस, स्टीम इनहेलेशन", ayurveda_te:"గిలోయ్ రసం, ఉష్ణ వాయువు శ్వాస",
   remedy:"Isolation, monitor oxygen", remedy_hi:"आइसोलेशन, ऑक्सीजन मॉनिटर करें", remedy_te:"ఐసొలేషన్, ఆక్సిజన్ పరిశీలించండి",
   advice:"Wear mask, isolate", advice_hi:"मास्क पहनें, अलग रहें", advice_te:"మాస్క్ వేసుకోండి, వేరే ఉండండి"
  },
  {key:"dengue", name:"Dengue", name_hi:"डेंगू", name_te:"డెంగ్యూ",
   symptoms:["high fever","joint pain","rash","bleeding","headache","nausea","vomiting","fatigue"],
   tablets:"Paracetamol only", tablets_hi:"केवल पैरासिटामॉल", tablets_te:"ప్యారాసిటమాల్ మాత్రమే",
   ayurveda:"Papaya leaf extract", ayurveda_hi:"पपीता पत्ता रस", ayurveda_te:"పపాయకా ఆకుల సారం",
   remedy:"Fluids, hospital if severe", remedy_hi:"तरल पदार्थ, गम्भीर होने पर अस्पताल जाएँ", remedy_te:"ద్రవాలు, తీవ్రమైతే-hopitalకు వెళ్లండి",
   advice:"Avoid mosquito bites", advice_hi:"मच्छर के काटने से बचें", advice_te:"దోమల ద్వారా సురక్షితంగా ఉండండి"
  },
  {key:"malaria", name:"Malaria", name_hi:"मलेरिया", name_te:"మలేరియా",
   symptoms:["high fever","chills","sweating","headache","nausea","vomiting","muscle pain"],
   tablets:"Artemisinin therapy", tablets_hi:"आर्टेमिसिनिन उपचार", tablets_te:"ఆర్టెమిసినిన్ చికిత్స",
   ayurveda:"Neem decoction", ayurveda_hi:"नीम का काढ़ा", ayurveda_te:"వేప ఆకుల కాఢా",
   remedy:"Immediate medical care", remedy_hi:"तत्काल चिकित्सा देखभाल", remedy_te:"క్షణిక వైద్య సేవలు",
   advice:"Avoid mosquito bites", advice_hi:"मच्छर से बचें", advice_te:"దోమల నుంచి తప్పించుకోండి"
  },
  {key:"typhoid", name:"Typhoid", name_hi:"टाइफाइड", name_te:"టైఫాయిడ్",
   symptoms:["prolonged fever","headache","weakness","abdominal pain","loss of appetite","diarrhea","rash"],
   tablets:"Cefixime, Azithromycin", tablets_hi:"सेफिक्सिम, अजिथ्रोमाइसिन", tablets_te:"సెఫిక్సిమ్, అజిథ్రోమైసిన్",
   ayurveda:"Giloy decoction supervised", ayurveda_hi:"नियंत्रित गिलोय का काढ़ा", ayurveda_te:"పరిశీలనలో గిలోయ్ కాఢా",
   remedy:"Doctor for antibiotics", remedy_hi:"एंटीबायोटिक्स के लिए डॉक्टर से मिलें", remedy_te:"యాంటిబయోటిక్ కోసం డాక్టర్ ను సంప్రదించండి",
   advice:"Drink boiled water", advice_hi:"उबला हुआ पानी पिएँ", advice_te:"వేపించిన నీరు తాగండి"
  },
  {key:"pneumonia", name:"Pneumonia", name_hi:"न्यूमोनिया", name_te:"నేమోనియా",
   symptoms:["cough","fever","chills","shortness of breath","chest pain","fatigue"],
   tablets:"Amoxicillin, Azithromycin", tablets_hi:"एमॉक्सिसिलिन, अजिथ्रोमाइसिन", tablets_te:"అమాక్సిసిలిన్, అజిథ్రోమైసిన్",
   ayurveda:"Tulsi decoction", ayurveda_hi:"तुलसी का काढ़ा", ayurveda_te:"తులసి కాఢా",
   remedy:"Medical eval for antibiotics", remedy_hi:"एंटीबायोटिक्स के लिए चिकित्सकीय मूल्यांकन", remedy_te:"వైద్య పరిశీలన అం"
  }
];

/* ------------------ SYMPTOM TRANSLATIONS ------------------ */
const symptomTranslations = {
  "fever": {hi:"बुखार", te:"జ్వరం"},
  "cough": {hi:"खांसी", te:"దమ్ము"},
  "runny nose": {hi:"नाक बहना", te:"ముక్కుపోటు"},
  "sore throat": {hi:"गले में खराश", te:"గళం నొప్పి"},
  "sneezing": {hi:"छींक", te:"छींకు"},
  "congestion": {hi:"नाक बंद होना", te:"నాకులో గడ్డకట్టడం"},
  "mild fever": {hi:"हल्का बुखार", te:"తేలికపాటి జ్వరం"},
  "fatigue": {hi:"थकान", te:"దహనం"},
  "headache": {hi:"सिरदर्द", te:"తలనొప్పి"},
  "muscle pain": {hi:"मांसपेशियों में दर्द", te:"పేశీల నొప్పి"},
  "chills": {hi:"कंपकंपी", te:"చలికాలం"},
  "nausea": {hi:"मितली", te:"వాంతి భావం"},
  "sensitivity to light": {hi:"रोशनी के प्रति संवेदनशीलता", te:"వెలుగుకు సంసైసిటివిటీ"},
  "sensitivity to sound": {hi:"ध्वनि के प्रति संवेदनशीलता", te:"శబ్దానికి సంసైసిటివిటీ"},
  "blurred vision": {hi:"दृष्टि धुंदलापन", te:"మురિકివచ్చిన దృష్టి"},
  "vomiting": {hi:"उल्टी", te:"వాంతి"},
  "dizziness": {hi:"चक्कर आना", te:"తిరుగుతున్న భావం"},
  "diarrhea": {hi:"दस्त", te:"డైరియా"},
  "abdominal pain": {hi:"पेट में दर्द", te:"అబ్డొమినల్ నొప్పి"},
  "cramps": {hi:"पेट में ऐंठन", te:"క్ర్యాంప్స్"},
  "stomach ache": {hi:"पेट दर्द", te:"అల్సర్ సంభవించే నొప్పి"},
  "loss of smell": {hi:"गंध का खोना", te:"సువాసన కోల్పోవడం"},
  "loss of taste": {hi:"स्वाद का खोना", te:"రుచి కోల్పోవడం"},
  "shortness of breath": {hi:"सांस लेने में कठिनाई", te:"శ్వాసలో ఇబ్బంది"},
  "high fever": {hi:"उच्च बुखार", te:"అత్యంత జ్వరం"},
  "joint pain": {hi:"जोड़ों में दर्द", te:"సంధి నొప్పి"},
  "rash": {hi:"रैश/खुजली", te:"ర‌ష్"},
  "bleeding": {hi:"खून बहना", te:"రక్తస్రావం"},
  "prolonged fever": {hi:"लंबा बुखार", te:"నిరంతర జ్వరం"},
  "weakness": {hi:"कमज़ोरी", te:"బలహీనత"},
  "loss of appetite": {hi:"भूख न लगना", te:"ఆహార ఆకలి తగ్గడం"},
  "chest pain": {hi:"सीने में दर्द", te:"చాతిలో నొప్పి"},
  "sweating": {hi:"पसीना आना", te:"వియోగం"}
};

/* Build reverse maps for hi and te */
const reverseSymptomMap = { hi: {}, te: {} };
Object.keys(symptomTranslations).forEach(en=>{
  const t = symptomTranslations[en];
  if(t.hi) reverseSymptomMap.hi[t.hi.toLowerCase()] = en;
  if(t.te) reverseSymptomMap.te[t.te.toLowerCase()] = en;
});
const allSymptomsEnglish = [...new Set(Object.keys(symptomTranslations))].sort();

/* ------------------ UI TRANSLATIONS ------------------ */
const translations = {
  en:{ title:"Disease Predictor", subtitle:"Enter symptoms and details, select language", formTitle:"Enter Details",
       symptomLabel:"Symptoms (comma separated)", ageLabel:"Age", genderLabel:"Gender", weightLabel:"Weight (kg)",
       predictionTitle:"Prediction", predictBtn:"Predict Disease", voiceBtn:"🎤 Voice Input",
       resultLoading:"Analyzing symptoms...", noSymptoms:"Please enter at least one symptom.", noMatch:"No matching diseases found. Please consult a doctor."
     },
  hi:{ title:"रोग पूर्वानुमान", subtitle:"लक्षण और विवरण दर्ज करें, भाषा चुनें", formTitle:"विवरण दर्ज करें",
       symptomLabel:"लक्षण (कॉमा से अलग करें)", ageLabel:"आयु", genderLabel:"लिंग", weightLabel:"वजन (किग्रा)",
       predictionTitle:"पूर्वानुमान", predictBtn:"रोग अनुमानित करें", voiceBtn:"🎤 वॉइस इनपुट",
       resultLoading:"लक्षण विश्लेषित हो रहे हैं...", noSymptoms:"कृपया कम से कम एक लक्षण दर्ज करें।", noMatch:"कोई मेल खाती बीमारी नहीं मिली। कृपया डॉक्टर से परामर्श करें।"
     },
  te:{ title:"రోగ నిర్ధారణ", subtitle:"లక్షణాలు మరియు వివరాలను నమోదు చేయండి, భాషను ఎంచుకోండి", formTitle:"వివరాలు నమోదు చేయండి",
       symptomLabel:"లక్షణాలు (కామాతో విభజించండి)", ageLabel:"వయసు", genderLabel:"లింగం", weightLabel:"బరువు (కేజీ)",
       predictionTitle:"నిర్ధారణ", predictBtn:"రోగాన్ని అంచనా వేయండి", voiceBtn:"🎤 వాయిస్ ఇన్‌పుట్",
       resultLoading:"లక్షణాలను విశ్లేషిస్తున్నారు...", noSymptoms:"దయచేసి కనీసం ఒక లక్షణాన్ని నమోదు చేయండి.", noMatch:"పరుస్తున్న రోగాలు గుర్తింపు కాలేదు. దయచేసి డాక్టర్‌ను సంప్రదించండి."
     }
};

/* ------------------ LANGUAGE SETUP ------------------ */
function setLanguage(lang){
  const t = translations[lang];
  document.title = t.title;
  titleEl.innerText = t.title;
  formTitleEl.innerText = t.formTitle;
  symptomLabelEl.innerText = t.symptomLabel;
  ageLabelEl.innerText = t.ageLabel;
  genderLabelEl.innerText = t.genderLabel;
  weightLabelEl.innerText = t.weightLabel;
  predictionTitleEl.innerText = t.predictionTitle;
  predictBtn.innerText = t.predictBtn;
  voiceBtn.innerText = t.voiceBtn;

  Array.from(genderInput.options).forEach(opt=>{
    const en = opt.getAttribute('data-en');
    const hi = opt.getAttribute('data-hi');
    const te = opt.getAttribute('data-te');
    if(opt.value === "") {
      opt.textContent = (lang==='hi'?'चुनें': lang==='te'?'ఎంచుకోండి':'Select');
    } else {
      opt.textContent = lang==='hi' ? (hi || en) : (lang==='te' ? (te || en) : (en || opt.textContent));
    }
  });

  symptomInput.placeholder = lang==='hi' ? 'उदा. बुखार, खांसी' : lang==='te' ? 'ఉదా. జ్వరం, దమ్ము' : 'e.g. fever, cough';
  updateSuggestions();
}
languageSelect.addEventListener('change', ()=> {
  setLanguage(languageSelect.value);
  if (recognition) {
    recognition.lang = languageSelect.value==='hi' ? 'hi-IN' : languageSelect.value==='te' ? 'te-IN' : 'en-US';
  }
});
setLanguage('en');

/* ------------------ SUGGESTIONS ------------------ */
function getDisplaySymptom(enSym, lang){
  if(!enSym) return '';
  const t = symptomTranslations[enSym];
  if(!t) return enSym;
  if(lang==='hi' && t.hi) return t.hi;
  if(lang==='te' && t.te) return t.te;
  return enSym;
}
function createSuggestionItem(displayText, engSym){
  const div = document.createElement('div');
  div.className = 'suggestion-item';
  div.textContent = displayText;
  div.dataset.eng = engSym;
  div.addEventListener('click', ()=> insertSuggestion(displayText));
  return div;
}
function insertSuggestion(symDisplay){
  let value = symptomInput.value;
  let lastComma = value.lastIndexOf(',');
  let prefix = '';
  if(lastComma >= 0) {
    prefix = value.substring(0, lastComma + 1);
    if(prefix && !prefix.endsWith(' ')) prefix += ' ';
  }
  symptomInput.value = prefix + symDisplay + ', ';
  symptomInput.focus();
  hideSuggestions();
}
function updateSuggestions(){
  let raw = symptomInput.value || '';
  let lastComma = raw.lastIndexOf(',');
  let query = (lastComma >= 0 ? raw.substring(lastComma + 1) : raw).trim().toLowerCase();
  suggestionsBox.innerHTML = '';
  const lang = languageSelect.value;
  const list = allSymptomsEnglish.map(en => ({en, display:getDisplaySymptom(en, lang)}));
  let filtered;
  if(!query) {
    filtered = list.slice(0, 50);
  } else {
    filtered = list.filter(item => {
      return item.display.toLowerCase().includes(query) || item.en.toLowerCase().includes(query);
    }).slice(0,50);
  }
  filtered.forEach(item => suggestionsBox.appendChild(createSuggestionItem(item.display, item.en)));
  suggestionsBox.style.display = filtered.length ? 'block' : 'none';
}
function hideSuggestions(){ suggestionsBox.style.display = 'none'; }

symptomInput.addEventListener('focus', updateSuggestions);
symptomInput.addEventListener('input', updateSuggestions);
document.addEventListener('click', (e)=>{ if(e.target !== symptomInput && !e.target.closest('.suggestions-box')) hideSuggestions(); });

/* ------------------ VOICE INPUT ------------------ */
let recognition;
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  voiceBtn.addEventListener('click', ()=>{
    try { recognition.start(); } catch(err) {}
  });
  recognition.onresult = (e)=>{
    const spoken = e.results[0][0].transcript;
    symptomInput.value += spoken + ', ';
    updateSuggestions();
  };
  recognition.onerror = ()=>{ /* ignore */ };
}

/* ------------------ PREDICTION LOGIC ------------------ */
function symptomWeight(symptom){
  const high = ["fever","cough","chest pain","shortness of breath","rash","vomiting","diarrhea","joint pain","headache","loss of smell","loss of taste","bleeding","high fever"];
  return high.includes(symptom) ? 2 : 1;
}
function similarityScore(user, diseaseSymptoms){
  let score = 0;
  user.forEach(u=>{
    if(diseaseSymptoms.includes(u)) score += symptomWeight(u);
    else {
      diseaseSymptoms.forEach(d=>{
        if(d.includes(u) || u.includes(d)) score += symptomWeight(d) * 0.5;
      });
    }
  });
  return score;
}
function calculateConfidence(score, disease){
  const max = disease.symptoms.reduce((sum,s)=>sum+symptomWeight(s),0);
  return Math.min(Math.round((score/max)*100),100);
}
function findTopDiseases(userEnglishSymptoms){
  return diseaseDB.map(d => ({...d, score: similarityScore(userEnglishSymptoms, d.symptoms)})).filter(d=>d.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
}

/* Map input back to English symptom keys */
function normalizeInputToEnglish(input){
  const lang = languageSelect.value;
  const parts = input.split(',').map(s => s.trim()).filter(Boolean);
  const mapped = [];
  parts.forEach(part=>{
    const pLower = part.toLowerCase();
    if(allSymptomsEnglish.includes(pLower)) { mapped.push(pLower); return; }
    const foundEnglish = allSymptomsEnglish.find(e => e.toLowerCase() === pLower);
    if(foundEnglish){ mapped.push(foundEnglish); return; }
    if(lang==='hi'){
      if(reverseSymptomMap.hi[pLower]) mapped.push(reverseSymptomMap.hi[pLower]);
      else {
        const fallback = allSymptomsEnglish.find(e => getDisplaySymptom(e,'hi').toLowerCase().includes(pLower) || e.toLowerCase().includes(pLower));
        if(fallback) mapped.push(fallback);
      }
    } else if(lang==='te'){
      if(reverseSymptomMap.te[pLower]) mapped.push(reverseSymptomMap.te[pLower]);
      else {
        const fallback = allSymptomsEnglish.find(e => getDisplaySymptom(e,'te').toLowerCase().includes(pLower) || e.toLowerCase().includes(pLower));
        if(fallback) mapped.push(fallback);
      }
    } else {
      const fallback = allSymptomsEnglish.find(e => e.toLowerCase().includes(pLower) || pLower.includes(e.toLowerCase()));
      if(fallback) mapped.push(fallback);
    }
  });
  return [...new Set(mapped)];
}

/* ------------------ FORM SUBMIT ------------------ */
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const lang = languageSelect.value;
  const t = translations[lang];
  const userRaw = symptomInput.value || '';
  const userSymptomsEnglish = normalizeInputToEnglish(userRaw);

  if(!userSymptomsEnglish.length){
    resultDiv.innerHTML = `<p class="error">${t.noSymptoms}</p>`;
    return;
  }

  resultDiv.innerHTML = `<p class="loading">${t.resultLoading}</p>`;

  const top = findTopDiseases(userSymptomsEnglish);
  if(!top.length){
    resultDiv.innerHTML = `<p class="error">${t.noMatch}</p>`;
    return;
  }

  let userInfoLine = `<p style="margin-bottom:10px;"><strong>${t.ageLabel}:</strong> ${ageInput.value || 'N/A'} | <strong>${t.genderLabel}:</strong> ${ (genderInput.options[genderInput.selectedIndex] ? genderInput.options[genderInput.selectedIndex].text : 'N/A') || 'N/A'} | <strong>${t.weightLabel}:</strong> ${weightInput.value || 'N/A'} ${lang==='hi'?'किग्रा': lang==='te'?'కేజీ':'kg'}</p>`;
  let html = userInfoLine;
  top.forEach(d=>{
    const confidence = calculateConfidence(d.score, d);
    const name = lang==='hi' ? (d.name_hi || d.name) : lang==='te' ? (d.name_te || d.name) : d.name;
    const tablets = lang==='hi' ? (d.tablets_hi || d.tablets) : lang==='te' ? (d.tablets_te || d.tablets) : d.tablets;
    const ayur = lang==='hi' ? (d.ayurveda_hi || d.ayurveda) : lang==='te' ? (d.ayurveda_te || d.ayurveda) : d.ayurveda;
    const remedy = lang==='hi' ? (d.remedy_hi || d.remedy) : lang==='te' ? (d.remedy_te || d.remedy) : d.remedy;
    const advice = lang==='hi' ? (d.advice_hi || d.advice) : lang==='te' ? (d.advice_te || d.advice) : d.advice;

    html += `<div class="result-card" role="article" aria-label="disease result">
      <strong>${ lang==='hi' ? 'रोग' : lang==='te' ? 'రోగం' : 'Disease' }:</strong> ${name}<br>
      <strong>${ lang==='hi' ? 'एलोपैथिक' : lang==='te' ? 'ఆలపాథిక్' : 'Allopathic' }:</strong> ${tablets}<br>
      <strong>${ lang==='hi' ? 'आयुर्वेद' : lang==='te' ? 'ఆయుర్వేదం' : 'Ayurveda' }:</strong> ${ayur}<br>
      <strong>${ lang==='hi' ? 'उपचार' : lang==='te' ? 'చికిత్స' : 'Remedy' }:</strong> ${remedy}<br>
      <strong>${ lang==='hi' ? 'सलाह' : lang==='te' ? 'సలహా' : 'Advice' }:</strong> ${advice}<br>
      <strong>${ lang==='hi' ? 'विश्वास' : lang==='te' ? 'విశ్వాసం' : 'Confidence' }:</strong> ${confidence}%
      <div class="confidence-bar" aria-hidden="true"><div class="confidence-fill" style="width:${confidence}%"></div></div>
    </div>`;
  });

  resultDiv.innerHTML = html;

  if('speechSynthesis' in window){
    const utterTexts = top.map(d=>{
      const name = languageSelect.value==='hi' ? (d.name_hi || d.name) : languageSelect.value==='te' ? (d.name_te || d.name) : d.name;
      const conf = calculateConfidence(d.score, d);
      return `${name} ${conf} percent`;
    });
    const msg = new SpeechSynthesisUtterance(utterTexts.join('. '));
    msg.lang = languageSelect.value==='hi' ? 'hi-IN' : languageSelect.value==='te' ? 'te-IN' : 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }
});

/* ------------------ INITIAL SUGGESTIONS ------------------ */
updateSuggestions();