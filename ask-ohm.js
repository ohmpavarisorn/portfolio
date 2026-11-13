(() => {
  'use strict';

  const panel = document.querySelector('#ask-ohm');
  const launcher = document.querySelector('.ask-launcher');
  const close = panel.querySelector('.ask-close');
  const title = panel.querySelector('#ask-title');
  const { projects, translations } = window.PORTFOLIO;
  const form = panel.querySelector('form');
  const input = form.elements.question;
  const reply = panel.querySelector('.ask-reply');
  const question = panel.querySelector('.ask-question');
  const result = panel.querySelector('.ask-result');
  const suggestions = panel.querySelector('.ask-suggestions');
  const ui = {
    th: {
      intro: 'สวัสดีครับ! ถามผมได้เลยเรื่องผลงานที่ลงมือทำ การศึกษา หรือช่วงที่ผมพร้อมเริ่มสหกิจ',
      prompt: 'เช่น มีโปรเจกต์เกี่ยวกับหุ้นไหม?',
      send: 'ส่ง', close: 'ปิด Ask About Me', details: 'ดูรายละเอียด', eventpack: 'เปิดเว็บจริง',
      featured: 'ผลงานแนะนำ', found: 'ผลงานที่เกี่ยวข้อง',
      all: 'ดูผลงานทั้งหมด', about: 'อ่านโปรไฟล์', contact: 'ดูช่องทางติดต่อ', next: 'ดูโปรเจกต์ที่กำลังวางแผน',
      fallback: 'ยังไม่เจอข้อมูลตรงกับคำถามนี้ ลองพิมพ์ชื่อโปรเจกต์ หรือเลือกคำถามแนะนำด้านล่างครับ',
      data: 'ลองดู Credit Risk Analytics สำหรับการสำรวจข้อมูลสินเชื่อ, Prediction_Stock_Price สำหรับการพยากรณ์หุ้น และ Text Classification สำหรับการจัดหมวดหมู่ข้อความครับ',
      solo: 'ผมทำ EventPack คนเดียวครับ เป็นระบบจองแพ็กเกจจัดเลี้ยงที่มีทั้งหน้าลูกค้าและหน้าจัดการสำหรับผู้ดูแล',
      coop: 'ผมสนใจสหกิจช่วงมกราคม–เมษายน โดยเน้นสาย Data และเปิดรับงานด้านเทคโนโลยีที่เกี่ยวข้องครับ',
      skills: 'ผมทำงานได้ทั้ง Data, Full Stack และ AI Integration ครับ ด้าน Data ผมใช้ Python, pandas และ Streamlit วิเคราะห์ข้อมูลและทำแดชบอร์ด รวมถึงใช้ scikit-learn ประเมินโมเดลเทียบกับ baseline ด้าน Full Stack ผมทำ EventPack ด้วย C#, ASP.NET Core MVC, EF Core และ PostgreSQL ตั้งแต่ระบบจองของลูกค้าถึงหน้าจัดการ ส่วน MoneyFit AI ผมรับผิดชอบหน้าสนทนา React และช่วยเชื่อมกับ FastAPI และระบบค้นข้อมูลของทีมครับ',
      future: 'ผมกำลังวางแผนโปรเจกต์ตรวจสอบความถูกต้องของสำเนาเอกสารที่ดินด้วย Blockchain ครับ',
      team: 'ผมทำ Credit Risk Analytics, Prediction_Stock_Price และ Text Classification ร่วมกับทีมครับ เราทำงานกันตั้งแต่ข้อมูลถึงแอป และผมทำความเข้าใจภาพรวมเพื่ออธิบายระบบให้อาจารย์ฟัง',
      contactReply: 'ติดต่อผมได้ทางอีเมล เบอร์โทร หรือ GitHub ครับ',
      age: 'ผมอายุ 22 ปีครับ',
      military: 'ผมยังไม่ได้เข้ารับการเกณฑ์ทหารครับ',
      resume: 'เรซูเม่ภาษาอังกฤษของผมมีประวัติการศึกษา ทักษะ และผลงานเด่นครับ',
      resumeLink: 'เปิดเรซูเม่ PDF',
      questions: ['มีผลงานสาย Data อะไรบ้าง?', 'โปรเจกต์ไหนทำคนเดียว?', 'สหกิจช่วงไหน?', 'มีทักษะอะไรบ้าง?', 'เรียนที่ไหน?', 'อายุเท่าไหร่?', 'สถานะเกณฑ์ทหาร?', 'ขอดูเรซูเม่ได้ไหม?'],
    },
    en: {
      intro: 'Hi! Ask me about what I’ve built, what I study, or when I’m available for a co-op.',
      prompt: 'e.g. Did you work on stock forecasting?',
      send: 'Send', close: 'Close Ask About Me', details: 'View details', eventpack: 'Open live website',
      featured: 'Featured project', found: 'Related projects',
      all: 'Browse all projects', about: 'Read profile', contact: 'View contact details', next: 'See the planned project',
      fallback: 'I couldn’t find a match in the portfolio. Try a project name or pick a suggested question below.',
      data: 'Explore Credit Risk Analytics for credit data, Prediction_Stock_Price for stock forecasting, and Text Classification for categorizing text.',
      solo: 'I built EventPack independently. It is a catering booking system with customer pages and an admin interface.',
      coop: 'I’m looking for a January–April co-op focused on data and am open to related technology roles.',
      skills: 'I work across data, full-stack development, and AI integration. I use Python, pandas, and Streamlit for analysis and dashboards, and scikit-learn to evaluate models against baselines. I built EventPack with C#, ASP.NET Core MVC, EF Core, and PostgreSQL, from customer bookings to admin tools. For MoneyFit AI, I built the React chat interface and helped connect it to FastAPI and the team’s retrieval workflow.',
      future: 'I’m planning a blockchain project for verifying copies of land documents.',
      team: 'I worked with my team on Credit Risk Analytics, Prediction_Stock_Price, and Text Classification. We worked from data to app, and I learned the full workflow so I could explain it to our instructor.',
      contactReply: 'You can reach me by email, by phone, or on GitHub.',
      age: 'I’m 22 years old.',
      military: 'I have yet to go through Thailand’s military conscription process.',
      resume: 'My English résumé covers my education, skills, and selected projects.',
      resumeLink: 'Open résumé PDF',
      questions: ['What data projects have you done?', 'Which project did you build solo?', 'When are you available for co-op?', 'What are your skills?', 'Where do you study?', 'How old are you?', 'What is your military conscription status?', 'Can I see your résumé?'],
    },
  };

  const aliases = {
    'credit-risk': /credit risk|เครดิตริสก์|สินเชื่อ|ความเสี่ยงเครดิต|streamlit|dashboard|แดชบอร์ด/,
    'mu-forecast': /prediction stock price|mu forecast|หุ้น|\bstock\b|\bforecast\w*\b|walk forward/,
    nlp: /text classification|\bnlp\b|tf idf|จัดหมวดหมู่ข้อความ|จำแนกข้อความ|แยกประเภทข้อความ|วิเคราะห์ข้อความ/,
    moneyfit: /money\s?fit|มันนี่ฟิต|ผู้ช่วยการเงิน|แชตบอตการเงิน|financial assistant|finance chatbot/,
    eventpack: /event\s?pack|อีเวน[ตท]์?แพ[็ก็คค]+|จัดเลี้ยง|จองเมนู|จองอาหาร|catering|restaurant booking/,
    vyne: /\bvyne\b|ร้านเสื้อ|เสื้อผ้า|ช้อปปิ้ง|e commerce|ecommerce|fashion store|online store/,
    doclibrary: /doc\s?library|จัดการเอกสาร|คลังเอกสาร|document management/,
    'bank-dapp': /bank dapp|dapp bank|\bsepolia\b|\bmetamask\b|ฝากถอน|wallet/,
  };
  const dataProjects = projects.filter(project => project.categories.includes('data'));
  const topics = [
    [/เกณฑ์ทหาร|รับราชการทหาร|สถานะทหาร|\bmilitary\b|\bconscription\b/, 'military'],
    [/อายุ|กี่ขวบ|how old|\bage\b/, 'age'],
    [/เรซูเม่|เรซูเม|ประวัติย่อ|(?:^| )r[eé]sum[eé](?= |$)|\bcv\b/, 'resume', [], 'assets/pavarisorn-chuamor-resume.pdf', 'resumeLink'],
    [/เรียนที่ไหน|where (do you|does (ohm|he)) study|\beducation\b/, 'profile', [], '#about', 'about'],
    [/สหกิจ|ฝึกงาน|มกราคม|เมษายน|\bco op\b|internship|availability|available|january|april/, 'coop', [], '#contact', 'contact'],
    [/ช่องทางติดต่อ|ติดต่อ|อีเมล|เบอร์โทร|\bcontact\b|\bemail\b|\bphone\b|\bgithub\b/, 'contactReply', [], '#contact', 'contact'],
    [/ทำคนเดียว|งานเดี่ยว|ทำเอง|โปรเจกต์เดี่ยว|\bsolo\b|\bindividual\b|\bindependently\b|on (his|your) own|by (himself|yourself)/, 'solo', projects.filter(project => project.type === 'solo')],
    [/งานกลุ่ม|ทำงานเป็นทีม|บทบาทในทีม|ทีมทำงาน|group project|team project|teamwork|team role|worked with/, 'team', dataProjects],
    [/เกี่ยวกับโอม|แนะนำตัว|เรียนที่ไหน|เรียนสาขา|มหาวิทยาลัย|โอมคือใคร|ประวัติ|ข้อมูลส่วนตัว|\buniversity\b|\bprofile\b|about (ohm|pavrisorn)|who is (ohm|pavrisorn)|what (does|did) (ohm|he) study/, 'profile', [], '#about', 'about'],
    [/ทักษะ|ถนัด|ใช้ภาษาอะไร|\bskills?\b|programming languages|full stack developer/, 'skills', [], '#about', 'about'],
    [/data|ข้อมูล|machine learning|\bml\b|\bpython\b/, 'data', dataProjects],
  ];
  const roleQuestion = /บทบาท|รับผิดชอบ|มีส่วนร่วม|ทำส่วนไหน|ทำอะไรบ้างใน|ส่วนไหน|ทำคนเดียว|ทำเอง|งานเดี่ยว|\brole\b|\bcontribut\w*\b|responsib|what did (you|ohm|he) do|\bsolo\b|\bindividually\b/;
  const featureQuestion = /ฟีเจอร์|ฟังก์ชัน|ทำงานยังไง|\bfeatures?\b|how does|what can/;
  const featured = ['credit-risk', 'eventpack'].map(id => projects.find(project => project.id === id));
  let language = document.documentElement.lang;
  let lastQuery = '';

  function search(value) {
    const query = value.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ').trim();
    if (/เอกสารที่ดิน|สำเนาที่ดิน|\bland (document|title|deed)/.test(query)) return { key: 'future', href: '#next-project', link: 'next' };

    const matches = projects.filter(project => aliases[project.id].test(query));
    if (matches.length) {
      const project = matches[0];
      const content = project[language];
      if (matches.length > 1) return { text: matches.map(item => item[language].summary).join(' '), matches };
      if (roleQuestion.test(query)) return { text: content.role, matches };
      if (featureQuestion.test(query)) {
        return { text: project.features[language].slice(0, 3).map(([title]) => title).join(' · '), matches };
      }
      return { text: content.summary, matches };
    }

    if (/บล็อกเชน|\bblockchain\b|\bweb3\b|\bdapp\b/.test(query)) {
      const matches = projects.filter(project => project.categories.includes('blockchain'));
      return { text: matches[0][language].summary, matches };
    }
    const topic = topics.find(([pattern]) => pattern.test(query));
    if (topic) {
      const [, key, matches, href, link] = topic;
      return { key, matches, href, link };
    }
    return { key: 'fallback', href: '#work', link: 'all' };
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function link(href, label, className) {
    const node = element('a', className, label);
    node.href = href;
    return node;
  }

  function projectCard(project, labels) {
    const card = element('article', 'ask-project');
    const imageLink = link('#project/' + project.id, '', 'ask-image');
    imageLink.setAttribute('aria-label', labels.details + ' · ' + project.title);
    const image = element('img');
    image.src = project.image;
    image.alt = '';
    image.width = 1280;
    image.height = 720;
    imageLink.append(image);
    const body = element('div', 'ask-project-body');
    body.append(element('h3', '', project.title));
    const actions = element('div', 'ask-project-actions');
    actions.append(link('#project/' + project.id, labels.details, 'ask-link'));
    if (project.liveUrl) {
      const liveLabel = {
        eventpack: labels.eventpack,
        explorer: translations[language].exploreData,
        store: translations[language].storePreview,
        classifier: translations[language].exploreData,
      }[project.liveKind] || translations[language].visitWebsite;
      const live = link(project.liveUrl, liveLabel + ' ↗', 'ask-link ask-live');
      if (!project.liveUrl.startsWith('#')) {
        live.target = '_blank';
        live.rel = 'noopener noreferrer';
      }
      actions.append(live);
    }
    body.append(actions);
    card.append(imageLink, body);
    return card;
  }

  function renderAnswer(animate = false) {
    const labels = ui[language];
    question.hidden = !lastQuery;
    question.textContent = lastQuery;
    const answer = lastQuery ? search(lastQuery) : { key: 'intro', matches: featured };
    reply.textContent = answer.text || (answer.key === 'profile' ? translations[language].aboutBody : labels[answer.key]);
    if (answer.href) reply.append(' ', link(answer.href, labels[answer.link] + ' ↗', 'ask-link'));
    const matches = answer.matches || [];
    const cards = matches.map(project => projectCard(project, labels));
    result.hidden = !cards.length;
    result.replaceChildren();
    if (cards.length) {
      const heading = element('p', 'ask-result-heading', lastQuery ? labels.found : labels.featured);
      const rail = element('div', 'ask-rail');
      rail.append(...cards);
      result.append(heading, rail);
      if (animate) for (const [index, card] of cards.entries()) card.style.setProperty('--arrival', index * 70 + 'ms');
    }
    result.classList.toggle('ask-arrival', animate);
  }

  function renderLanguage() {
    language = document.documentElement.lang;
    const labels = ui[language];
    input.placeholder = labels.prompt;
    input.setAttribute('aria-label', labels.prompt);
    form.querySelector('button').setAttribute('aria-label', labels.send);
    close.setAttribute('aria-label', labels.close);
    suggestions.replaceChildren(...labels.questions.map(text => {
      const button = element('button', 'ask-chip', text);
      button.type = 'button';
      button.addEventListener('click', () => submit(text));
      return button;
    }));
    renderAnswer();
  }

  function submit(value) {
    const next = value.trim();
    if (!next) return;
    lastQuery = next;
    input.value = '';
    renderAnswer(true);
  }

  function setPanelOpen(open, moveFocus = true) {
    if (open === !panel.hidden) return;
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (moveFocus) (open ? title : launcher).focus({ preventScroll: true });
    if (!open && location.hash === '#ask-ohm') {
      history.replaceState(history.state, '', location.pathname + location.search);
    }
  }

  launcher.hidden = false;
  launcher.addEventListener('click', () => setPanelOpen(panel.hidden));
  close.addEventListener('click', () => setPanelOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || panel.hidden || document.querySelector('dialog[open]')) return;
    event.preventDefault();
    setPanelOpen(false, panel.contains(document.activeElement));
  });
  panel.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    setPanelOpen(false);
  });
  function readAskHash() {
    if (location.hash === '#ask-ohm') setPanelOpen(true, false);
  }
  window.addEventListener('hashchange', readAskHash);

  form.addEventListener('submit', event => {
    event.preventDefault();
    submit(input.value);
  });
  document.addEventListener('portfolio:rendered', () => {
    if (language !== document.documentElement.lang) renderLanguage();
  });
  renderLanguage();
  readAskHash();
})();
