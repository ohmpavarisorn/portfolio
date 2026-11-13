(() => {
  'use strict';

  const copy = {
    th:{back:'← กลับไปพอร์ต',intro:'ลองจำแนกข้อความสั้นภาษาอังกฤษว่าเป็นสแปมหรือข้อความปกติ แล้วสลับโมเดลเพื่อเปรียบเทียบผล',tryTitle:'ทดลองโมเดล',model:'โมเดล',message:'ข้อความภาษาอังกฤษ',ordinary:'ตัวอย่างข้อความปกติ',spamSample:'ตัวอย่างสแปม',predict:'จำแนกข้อความ',metrics:'ผลบนชุดทดสอบ',accuracy:'ความแม่นยำ',matrix:'ตารางเปรียบเทียบผลจริงกับผลทำนาย',actual:'กลุ่มจริง',predOrdinary:'ทายว่าปกติ',predSpam:'ทายว่าสแปม',ordinaryLabel:'ปกติ',spamLabel:'สแปม',note:'เดโมฝึกโมเดลใหม่ด้วยข้อมูลจากโน้ตบุ๊กต้นฉบับ โดยใช้คำภาษาอังกฤษที่พบอย่างน้อย 5 ข้อความ ผลอาจต่างจากโน้ตบุ๊กและใช้ทดสอบแนวคิดเรื่องสแปมเท่านั้น ข้อความที่พิมพ์ประมวลผลในเบราว์เซอร์',testCount:n=>`ชุดทดสอบ ${n} ข้อความ`,result:(label,score)=>`ผลทำนาย: ${label} · คะแนนสแปม ${score}`,unknown:'โมเดลไม่รู้จักคำในข้อความนี้ ลองใช้ตัวอย่างภาษาอังกฤษ',failure:'โหลดโมเดลไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง'},
    en:{back:'← Back to portfolio',intro:'Classify a short English message as spam or ordinary text, then switch models to compare the results.',tryTitle:'Try a model',model:'Model',message:'English message',ordinary:'Ordinary example',spamSample:'Spam example',predict:'Classify message',metrics:'Held-out results',accuracy:'Accuracy',matrix:'Confusion matrix',actual:'Actual class',predOrdinary:'Predicted ordinary',predSpam:'Predicted spam',ordinaryLabel:'Ordinary',spamLabel:'Spam',note:'The demo retrains the notebook’s classifiers on the original datasets using English tokens that appear in at least five messages. Results can differ from the notebook. The demo is for exploring spam classification, and messages you enter are processed in your browser.',testCount:n=>`${n} held-out messages`,result:(label,score)=>`Prediction: ${label} · Spam score ${score}`,unknown:'The model did not recognize any terms. Try an English example.',failure:'The model failed to load. Try refreshing the page.'}
  };
  const examples = {ordinary:'Can we meet after class to work on our project?',spam:'Congratulations! Claim your free prize today.'};
  const $ = id => document.getElementById(id);
  const languageKey = 'ohm-portfolio-language';
  let lang = 'th';
  let data;
  let index;
  let loadFailed = false;
  let score = null;
  let hasPrediction = false;
  try { if (localStorage.getItem(languageKey) === 'en') lang = 'en'; } catch {}
  const tr = key => copy[lang][key];
  const percent = value => new Intl.NumberFormat(lang,{style:'percent',maximumFractionDigits:1}).format(value);

  function renderMetrics() {
    if (!data) return;
    const model = data.models[$('model').value];
    const counts = model.matrix.flat();
    $('accuracy').textContent = percent(model.accuracy);
    $('test-count').textContent = tr('testCount')(new Intl.NumberFormat(lang).format(data.testSize));
    ['tn','fp','fn','tp'].forEach((id,i) => { $(id).textContent = counts[i]; });
  }

  function renderResult() {
    if (loadFailed) $('result').textContent = tr('failure');
    else if (!hasPrediction) $('result').textContent = '';
    else if (score === null) $('result').textContent = tr('unknown');
    else $('result').textContent = tr('result')(tr(score >= .5 ? 'spamLabel' : 'ordinaryLabel'), percent(score));
  }

  function predict() {
    if (!data) return;
    const counts = new Map();
    const tokens = $('message').value.toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? [];
    for (const token of tokens) {
      const feature = index.get(token);
      if (feature !== undefined) counts.set(feature,(counts.get(feature)??0)+1);
    }
    const model = $('model').value;
    let dot = 0;
    let squares = 0;
    for (const [feature,count] of counts) {
      const tfidf = count * data.idf[feature];
      dot += tfidf * data.weights[model][feature];
      squares += tfidf * tfidf;
    }
    const logOdds = squares ? data.models[model].bias + dot / Math.sqrt(squares) : null;
    score = logOdds === null ? null : 1 / (1 + Math.exp(-logOdds));
    hasPrediction = true;
    renderResult();
  }

  function renderLanguage() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = tr(el.dataset.copy); });
    $('language').lang = lang === 'th' ? 'en' : 'th';
    $('language').textContent = lang === 'th' ? 'EN' : 'TH';
    renderMetrics();
    renderResult();
  }

  $('language').addEventListener('click', () => {
    lang = lang === 'th' ? 'en' : 'th';
    try { localStorage.setItem(languageKey,lang); } catch {}
    renderLanguage();
  });
  $('classify').addEventListener('submit', event => { event.preventDefault(); predict(); });
  $('message').addEventListener('input', () => { hasPrediction = false; renderResult(); });
  $('model').addEventListener('change', () => { renderMetrics(); if (hasPrediction) predict(); });
  document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    $('message').value = examples[button.dataset.example];
    predict();
  }));
  renderLanguage();
  fetch('model.json').then(response => {
    if (!response.ok) throw new Error('Model could not load');
    return response.json();
  }).then(model => {
    data = model;
    index = new Map(data.tokens.map((token,i) => [token,i]));
    $('predict').disabled = false;
    renderMetrics();
  }).catch(() => { loadFailed = true; renderResult(); });
})();
