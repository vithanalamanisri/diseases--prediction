/* ===================== NAVIGATION (SPA behavior) ===================== */
const navLinks = document.querySelectorAll('.navlink');
const pages = {
  home: document.getElementById('page-home'),
  about: document.getElementById('page-about'),
  how: document.getElementById('page-how'),
  contact: document.getElementById('page-contact')
};

function showPage(pageKey){
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.page === pageKey));
  Object.keys(pages).forEach(k => {
    pages[k].style.display = (k === pageKey) ? 'grid' : 'none';
  });
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
  if(location.hash !== `#${pageKey}`) history.replaceState(null, '', `#${pageKey}`);
}

function initRouting(){
  const hash = (location.hash || '#home').replace('#','');
  showPage(pages[hash] ? hash : 'home');
}
navLinks.forEach(a => a.addEventListener('click', (e)=>{
  e.preventDefault();
  showPage(a.dataset.page);
}));
window.addEventListener('hashchange', initRouting);
document.addEventListener('DOMContentLoaded', initRouting);


/* ===================== APP LOGIC ===================== */

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
  {key:"common_cold", name:"Common Cold", name_hi:"सर्दी", name_te:"సాధారణ జలుబు",
   symptoms:["cough","runny nose","sore throat","sneezing","congestion","mild fever","fatigue","headache"],
   tablets:"Paracetamol, Cetirizine", tablets_hi:"पैरासिटामॉल, सेट्रीज़ीन", tablets_te:"ప్యారాసిటమాల్, సెటిరిజైన్",
   ayurveda:"Tulsi tea, Ginger", ayurveda_hi:"तुलसी चाय, अदरक", ayurveda_te:"తులసి టీ, అల్లం",
   remedy:"Rest, fluids, vitamin C", remedy_hi:"आराम, तरल पदार्थ, विटामिन C", remedy_te:"విశ్రాంతి, ద్రవాలు, విటమిన్ సి"
  },
  {key:"flu", name:"Flu", name_hi:"फ्लू", name_te:"ఫ్లూ",
   symptoms:["fever","cough","muscle pain","fatigue","chills","headache","sore throat"],
   tablets:"Oseltamivir", tablets_hi:"ओसेल्टामिविर", tablets_te:"ఓసెల్టామివిర్",
   ayurveda:"Ginger tea, Turmeric milk", ayurveda_hi:"अदरक की चाय, हल्दी वाला दूध", ayurveda_te:"అల్లం టీ, పసుపు పాలు",
   remedy:"Rest, fluids, paracetamol", remedy_hi:"आराम, तरल पदार्थ, पैरासिटामॉल", remedy_te:"విశ్రాంతి, ద్రవాలు, ప్యారాసిటమాల్"
  },
  {key:"migraine", name:"Migraine", name_hi:"माइग्रेन", name_te:"మైగ్రేన్",
   symptoms:["headache","nausea","sensitivity to light","sensitivity to sound","vomiting"],
   tablets:"Ibuprofen, Sumatriptan", tablets_hi:"इबूप्रोफेन, सुमाट्रिप्टान", tablets_te:"ఇబుప్రోఫెన్, సుమాట్రిప్టాన్",
   ayurveda:"Brahmi, Ashwagandha", ayurveda_hi:"ब्राह्मी, अश्वगंधा", ayurveda_te:"బ్రాహ్మి, అశ్వగంధ",
   remedy:"Rest in dark room, hydration", remedy_hi:"अंधेरे कमरे में आराम, हाइड्रेशन", remedy_te:"చీకటి గదిలో విశ్రాంతి, హైడ్రేషన్"
  }
  // Add other diseases here...
];

const symptomTranslations = {
  "fever": {hi:"बुखार", te:"జ్వరం"}, "cough": {hi:"खांसी", te:"దగ్గు"}, "runny nose": {hi:"नाक बहना", te:"ముక్కు కారటం"},
  "sore throat": {hi:"गले में खराश", te:"గొంతు మంట"}, "sneezing": {hi:"छींक", te:"తుమ్ములు"}, "congestion": {hi:"संकुलन", te:"రద్దీ"},
  "mild fever": {hi:"हल्का बुखार", te:"తేలికపాటి జ్వరం"}, "fatigue": {hi:"थकान", te:"అలసట"}, "headache": {hi:"सिरदर्द", te:"తలనొప్పి"},
  "muscle pain": {hi:"मांसपेशियों में दर्द", te:"కండరాల నొప్పి"}, "chills": {hi:"ठंड लगना", te:"చలి"}, "nausea": {hi:"जी मिचलाना", te:"వికారం"},
  "sensitivity to light": {hi:"प्रकाश के प्रति संवेदनशीलता", te:"కాంతికి సున్నితత్వం"}, "sensitivity to sound": {hi:"ध्वनि के प्रति संवेदनशीलता", te:"శబ్దానికి సున్నితత్వం"},
  "vomiting": {hi:"उल्टी", te:"వాంతులు"}
  // Add other symptom translations here...
};

const reverseSymptomMap = { hi: {}, te: {} };
Object.keys(symptomTranslations).forEach(en=>{
  const t = symptomTranslations[en];
  if(t.hi) reverseSymptomMap.hi[t.hi.toLowerCase()] = en;
  if(t.te) reverseSymptomMap.te[t.te.toLowerCase()] = en;
});
const allSymptomsEnglish = [...new Set(diseaseDB.flatMap(d => d.symptoms))].sort();

/* ------------------ UI TRANSLATIONS ------------------ */
const translations = {
  en:{ title:"Disease Predictor", formTitle:"Enter Details",
       symptomLabel:"Symptoms (comma separated)", ageLabel:"Age", genderLabel:"Gender", weightLabel:"Weight (kg)",
       predictionTitle:"Prediction", predictBtn:"Predict Disease", voiceBtn:"🎤 Voice Input",
       resultLoading:"Analyzing symptoms...", noSymptoms:"Please enter at least one symptom.", noMatch:"No matching diseases found."
     },
  hi:{ title:"रोग पूर्वानुमान", formTitle:"विवरण दर्ज करें",
       symptomLabel:"लक्षण (कॉमा से अलग करें)", ageLabel:"आयु", genderLabel:"लिंग", weightLabel:"वजन (किग्रा)",
       predictionTitle:"पूर्वानुमान", predictBtn:"रोग का अनुमान लगाएं", voiceBtn:"🎤 वॉइस इनपुट",
       resultLoading:"लक्षणों का विश्लेषण...", noSymptoms:"कृपया कम से कम एक लक्षण दर्ज करें।", noMatch:"कोई मेल खाने वाला रोग नहीं मिला।"
     },
  te:{ title:"వ్యాధి అంచనా", formTitle:"వివరాలు నమోదు చేయండి",
       symptomLabel:"లక్షణాలు (కామాతో వేరు చేయండి)", ageLabel:"వయస్సు", genderLabel:"లింగం", weightLabel:"బరువు (కిలోలు)",
       predictionTitle:"అంచనా", predictBtn:"వ్యాధిని అంచనా వేయండి", voiceBtn:"🎤 వాయిస్ ఇన్‌పుట్",
       resultLoading:"లక్షణాలను విశ్లేషిస్తోంది...", noSymptoms:"దయచేసి కనీసం ఒక లక్షణాన్ని నమోదు చేయండి.", noMatch:" సరిపోయే వ్యాధులు కనుగొనబడలేదు."
     }
};

/* ------------------ LANGUAGE SETUP ------------------ */
function setLanguage(lang){
  const t = translations[lang];
  Object.keys(t).forEach(key => {
      const el = document.getElementById(key) || (key === 'title' && document.querySelector('.brand h1'));
      if (el) el.innerText = t[key];
  });
  document.title = t.title;
  predictBtn.innerText = t.predictBtn;
  voiceBtn.innerText = t.voiceBtn;

  Array.from(genderInput.options).forEach(opt=>{
    if(opt.value) opt.textContent = opt.getAttribute(`data-${lang}`) || opt.getAttribute('data-en');
  });

  symptomInput.placeholder = lang==='hi' ? 'उदा. बुखार, खांसी' : lang==='te' ? 'ఉదా. జ్వరం, దగ్గు' : 'e.g. fever, cough';
  updateSuggestions();
}
languageSelect.addEventListener('change', ()=> setLanguage(languageSelect.value));
setLanguage('en');

/* ------------------ SUGGESTIONS ------------------ */
function getDisplaySymptom(enSym, lang){
  return symptomTranslations[enSym]?.[lang] || enSym;
}
function updateSuggestions(){
  const raw = symptomInput.value || '';
  const query = raw.substring(raw.lastIndexOf(',') + 1).trim().toLowerCase();
  suggestionsBox.innerHTML = '';
  if (!query && document.activeElement !== symptomInput) {
      suggestionsBox.style.display = 'none';
      return;
  }
  const lang = languageSelect.value;
  const filtered = allSymptomsEnglish.filter(en =>
      getDisplaySymptom(en, lang).toLowerCase().includes(query) || en.toLowerCase().includes(query)
  ).slice(0, 50);

  filtered.forEach(en => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.textContent = getDisplaySymptom(en, lang);
      item.onclick = () => {
          const parts = symptomInput.value.split(',');
          parts.pop();
          parts.push(getDisplaySymptom(en, lang));
          symptomInput.value = parts.join(', ') + ', ';
          symptomInput.focus();
          updateSuggestions();
      };
      suggestionsBox.appendChild(item);
  });
  suggestionsBox.style.display = filtered.length ? 'block' : 'none';
}

symptomInput.addEventListener('focus', updateSuggestions);
symptomInput.addEventListener('input', updateSuggestions);
document.addEventListener('click', (e) => {
  if (!e.target.closest('.suggestions-container')) suggestionsBox.style.display = 'none';
});

/* ================================================= */
/* VOICE INPUT FIX: Checks for browser support      */
/* ================================================= */
let recognition;
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.addEventListener('click', ()=>{
      recognition.lang = languageSelect.value === 'hi' ? 'hi-IN' : languageSelect.value === 'te' ? 'te-IN' : 'en-US';
      try { recognition.start(); } catch(err) { alert("Error starting voice recognition."); }
  });

  recognition.onstart = () => voiceBtn.textContent = "🔊 Listening...";
  recognition.onend = () => voiceBtn.textContent = translations[languageSelect.value].voiceBtn;
  recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      symptomInput.value += spoken + ', ';
      updateSuggestions();
  };
} else {
  // Disable button if API is not supported
  voiceBtn.disabled = true;
  voiceBtn.textContent = "Voice Not Supported";
}

/* ------------------ PREDICTION LOGIC ------------------ */
function findTopDiseases(userSymptoms){
    return diseaseDB.map(disease => {
        const matchedSymptoms = disease.symptoms.filter(s => userSymptoms.includes(s));
        const score = matchedSymptoms.length;
        const confidence = Math.min(Math.round((score / disease.symptoms.length) * 100), 100);
        return {...disease, score, confidence};
    }).filter(d => d.score > 0).sort((a,b) => b.score - a.score).slice(0, 3);
}

/* ------------------ FORM SUBMIT ------------------ */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const lang = languageSelect.value;
  const t = translations[lang];
  const userRaw = symptomInput.value.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const userSymptomsEnglish = userRaw.map(s => reverseSymptomMap[lang]?.[s] || s);

  if(!userSymptomsEnglish.length){
    resultDiv.innerHTML = `<p class="error">${t.noSymptoms}</p>`;
    return;
  }
  resultDiv.innerHTML = `<p class="loading">${t.resultLoading}</p>`;

  setTimeout(() => { // Simulate network delay
      const top = findTopDiseases(userSymptomsEnglish);
      if(!top.length){
        resultDiv.innerHTML = `<p class="error">${t.noMatch}</p>`;
        return;
      }

      let html = '';
      top.forEach(d => {
        html += `<div class="result-card">
          <strong>${d[`name_${lang}`] || d.name}</strong><br>
          <small>${lang === 'hi' ? 'दवा' : lang === 'te' ? 'మందు' : 'Medicine'}: ${d[`tablets_${lang}`] || d.tablets}</small><br>
          <small>${lang === 'hi' ? 'आयुर्वेद' : lang === 'te' ? 'ఆయుర్వేదం' : 'Ayurveda'}: ${d[`ayurveda_${lang}`] || d.ayurveda}</small><br>
          <small>${lang === 'hi' ? 'उपचार' : lang === 'te' ? 'నివారణ' : 'Remedy'}: ${d[`remedy_${lang}`] || d.remedy}</small>
          <div class="confidence-bar"><div class="confidence-fill" style="width:${d.confidence}%"></div></div>
          <small>Confidence: ${d.confidence}%</small>
        </div>`;
      });
      resultDiv.innerHTML = html;
  }, 500);
});