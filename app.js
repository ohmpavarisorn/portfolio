(() => {
  'use strict';
  const {translations,projects}=window.PORTFOLIO;
  const $=s=>document.querySelector(s);
  let lang='th',filter='all',credit=null,forecast=null,activeProject=null,lastFocused=null;
  try{lang=localStorage.getItem('ohm-portfolio-language')==='en'?'en':'th';}catch{}
  if (new URLSearchParams(location.search).get('contact') === 'sent') {
    $('#contact-form-success').hidden = false;
  }
  const tr=k=>translations[lang][k];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=(n,d=0)=>new Intl.NumberFormat(lang==='th'?'th-TH':'en-US',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n);

  function liveLink(p,style='project-live'){
    if(!p.liveUrl)return '';
    const samePage=p.liveUrl.startsWith('#');
    const label={explorer:'exploreData',store:'storePreview',classifier:'exploreData'}[p.liveKind]||'visitWebsite';
    return `<a class="${style}" href="${escape(p.liveUrl)}" ${samePage?'':'target="_blank" rel="noopener noreferrer"'}>${escape(tr(label))} <span aria-hidden="true">↗</span></a>`;
  }
  function setLanguage(value){
    lang=value;document.documentElement.lang=lang;
    try{localStorage.setItem('ohm-portfolio-language',lang);}catch{}
    document.querySelectorAll('[data-i18n]').forEach(el=>{const v=tr(el.dataset.i18n);if(typeof v==='string')el.textContent=v;});
    document.querySelectorAll('[data-aria-i18n]').forEach(el=>el.setAttribute('aria-label',tr(el.dataset.ariaI18n)));
    document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=tr(el.dataset.i18nHtml));
    document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));
    $('#age-filter option[value="all"]').textContent=tr('allAges');
    $('#gender-filter option[value="all"]').textContent=tr('allGenders');
    $('#age-filter').setAttribute('aria-label',tr('ageLabel'));
    $('#gender-filter').setAttribute('aria-label',tr('genderLabel'));
    $('#dialog-close').setAttribute('aria-label',tr('close'));
    $('#project-dialog').setAttribute('aria-label',lang==='th'?'รายละเอียดโปรเจกต์':'Project details');
    $('#image-dialog').setAttribute('aria-label',lang==='th'?'ภาพโปรเจกต์':'Project image');
    $('#image-dialog .image-close').setAttribute('aria-label',lang==='th'?'ปิดภาพ':'Close image');
    renderProjects();renderData();if(activeProject)renderProject(activeProject);
  }
  function renderProjects(){
    const visible=projects.filter(p=>filter==='all'||p.categories.includes(filter));
    $('#project-count').textContent=tr('projectCount')(visible.length);
    $('#project-grid').innerHTML=visible.map(p=>{
      const c=p[lang];
      return `<article class="project-card ${p.color}">
        <a class="project-visual" href="#project/${p.id}" aria-label="${escape(tr('viewProject')+' '+p.title)}">
          <span class="project-no">${String(projects.indexOf(p)+1).padStart(2,'0')} / EXPLORATION</span>
          <div class="project-image-wrap"><img src="${p.image}" alt="${escape(p.title+' — '+c.caption)}" loading="lazy" width="1280" height="720"></div>
          <span class="project-arrow" aria-hidden="true">↗</span><span class="project-type">${escape(tr(p.type))}</span>
        </a>
        <div class="project-meta"><p class="project-label">${escape(c.label)}</p>
          <h3><a href="#project/${p.id}">${escape(p.title)}</a></h3><p class="project-summary">${escape(c.summary)}</p>
          <div class="card-bottom"><div class="tech-tags">${p.tech.slice(0,3).map(t=>`<span>${escape(t)}</span>`).join('')}</div></div>
          <div class="card-actions">${liveLink(p)}<a class="project-read" href="#project/${p.id}" aria-label="${escape(tr('viewProject')+' '+p.title)}">${escape(tr('viewProject'))} <span>↗</span></a></div>
        </div>
      </article>`;
    }).join('');
    document.dispatchEvent(new Event('portfolio:rendered'));
  }
  const dialog=$('#project-dialog');
  function renderProject(p){
    const c=p[lang];const next=projects[(projects.indexOf(p)+1)%projects.length];
    const note={saved:'savedDemoNote',testnet:'testnetNote',explorer:'explorerNote',store:'storeDemoNote',classifier:'classifierNote',eventpack:'eventpackLiveNote'}[p.liveKind];
    $('#dialog-content').innerHTML=`<div class="detail-hero ${p.color}">
      <p class="eyebrow">${escape(c.label)}</p><h2 id="dialog-title">${escape(p.title)}</h2><p>${escape(c.summary)}</p>
      <div class="tech-tags">${p.tech.map(t=>`<span>${escape(t)}</span>`).join('')}<span class="type-tag">${escape(tr(p.type))}</span></div>
      <div class="project-role"><strong>${tr('role')}</strong><p>${escape(c.role)}</p></div>
      ${p.liveUrl?`<div class="detail-live">${liveLink(p,'button live-button')}<p>${escape(tr(note))}</p></div>`:''}
    </div><div class="detail-body">
      <div class="detail-overview role-moved"><div><h3>${tr('overview')}</h3><p>${escape(c.overview)}</p></div></div>
      <section class="system-features" aria-labelledby="system-features-title">
        <h3 id="system-features-title">${tr('systemFeatures')}</h3>
        <ul>${p.features[lang].map(([title,description])=>`<li><h4>${escape(title)}</h4><p>${escape(description)}</p></li>`).join('')}</ul>
      </section>
      <h3>${tr('approach')}</h3><ol class="approach-list">${c.approach.map((a,i)=>`<li><span>0${i+1}</span><p>${escape(a)}</p></li>`).join('')}</ol>
      ${p.forecast?'<div id="forecast-detail" class="forecast-detail"></div>':''}
      <div class="learning-note"><span>✳</span><div><h3>${tr('learning')}</h3><p>${escape(c.learning)}</p></div></div>
      <div class="gallery-heading"><h3>${tr('gallery')}</h3><span>${tr('imageZoom')} ↗</span></div>
      <div class="project-gallery">${p.gallery.map((src,index)=>{
        const caption=p.galleryDetails?.[lang][index]??c.caption;
        const button=`<button class="gallery-image" data-image="${src}" data-caption="${escape(caption)}" aria-label="${escape(tr('imageZoom')+' · '+caption)}"><img src="${src}" alt="${escape(caption)}" loading="lazy"></button>`;
        return p.galleryDetails?`<figure class="gallery-figure">${button}<figcaption class="gallery-caption">${escape(caption)}</figcaption></figure>`:button;
      }).join('')}</div>
      ${p.galleryDetails?'':`<p class="gallery-caption">${escape(c.caption)}</p>`}
      <div class="detail-footer">${p.repo&&!p.private?`<a class="button secondary" href="${p.repo}" target="_blank" rel="noopener noreferrer">${tr('source')}</a>`:'<span></span>'}<a class="text-link" href="#project/${next.id}">${tr('nextProject')}</a></div>
    </div>`;
    if(p.forecast)renderForecast();
  }
  function openProject(id){
    const p=projects.find(p=>p.id===id);if(!p)return;
    const wasOpen=dialog.open;if(!wasOpen)lastFocused=document.activeElement;
    activeProject=p;renderProject(p);
    if(!wasOpen){dialog.showModal();document.body.classList.add('modal-open');}
    dialog.scrollTop=0;
  }
  function closeProject(){
    if($('#image-dialog').open)$('#image-dialog').close();
    dialog.close();activeProject=null;document.body.classList.remove('modal-open');
    if(location.hash.startsWith('#project/'))history.replaceState(null,'',location.pathname+location.search+'#work');
    lastFocused?.focus({preventScroll:true});
  }
  function readHash(){const match=location.hash.match(/^#project\/([a-z-]+)$/);if(match)openProject(match[1]);else if(dialog.open)closeProject();}
  document.addEventListener('click',e=>{
    const image=e.target.closest('[data-image]');
    if(image){
      const caption=image.dataset.captionI18n ? tr(image.dataset.captionI18n) : image.dataset.caption;
      $('#lightbox-image').src=image.dataset.image;
      $('#lightbox-image').alt=caption;
      $('#image-dialog').setAttribute('aria-label',caption);
      $('#image-dialog').showModal();
      return;
    }
    const language=e.target.closest('[data-lang]');if(language){setLanguage(language.dataset.lang);return;}
    const button=e.target.closest('[data-filter]');if(button){filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));renderProjects();}
  });
  window.addEventListener('hashchange',readHash);
  $('#dialog-close').addEventListener('click',closeProject);
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeProject();});
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeProject();});
  $('#image-dialog .image-close').addEventListener('click',()=>$('#image-dialog').close());
  $('#image-dialog').addEventListener('click',e=>{if(e.target===$('#image-dialog'))$('#image-dialog').close();});

  function renderData(){
    if(!credit)return;
    const age=$('#age-filter').value,gender=$('#gender-filter').value;
    const ages=['18-24','25-29','30-34','35-39','40-44','45-49','50-59','60-69'];
    const groups=credit.groups.filter(g=>gender==='all'||g.gender===gender);
    const selected=groups.filter(g=>age==='all'||g.age===age);
    const isUnfiltered=age==='all'&&gender==='all';
    const count=isUnfiltered?credit.rows:selected.reduce((sum,g)=>sum+g.count,0);
    const targets=isUnfiltered?credit.target_count:selected.reduce((sum,g)=>sum+g.target_count,0);
    $('#metric-count').textContent=number(count);
    $('#metric-share').textContent=tr('dataShare')(number(count/credit.rows*100,1));
    $('#metric-rate').textContent=number(count?targets/count*100:0,2)+'%';
    const overall = 100 * credit.target_count / credit.rows;
    const rate = count ? 100 * targets / count : 0;
    const scale = Math.max(10, Math.ceil(Math.max(overall, rate) / 5) * 5);
    $('#rate-panel').hidden = false;
    $('#overall-rate').textContent = number(overall, 2) + '%';
    $('#group-rate').textContent = count ? number(rate, 2) + '%' : '—';
    $('#overall-bar').style.width = (overall / scale * 100) + '%';
    $('#group-bar').style.width = (rate / scale * 100) + '%';
    const difference = rate - overall;
    const points = number(Math.abs(difference), 2);
    const scope = [age === 'all' ? tr('allAges') : age, gender === 'all' ? '' : gender].filter(Boolean).join(' · ');
    let insight = lang === 'th' ? 'เลือกช่วงอายุเพื่อดูความต่างจากภาพรวม' : 'Choose an age range to compare with the overall rate.';
    if (!isUnfiltered && count) {
      insight = lang === 'th'
        ? scope + ' · ' + (difference >= 0 ? 'สูงกว่า' : 'ต่ำกว่า') + 'ภาพรวม ' + points + ' จุดเปอร์เซ็นต์'
        : scope + ' · ' + points + ' percentage points ' + (difference >= 0 ? 'above' : 'below') + ' the overall rate.';
    } else if (!count) {
      insight = lang === 'th' ? 'ไม่มีรายการในกลุ่มที่เลือก' : 'No records in the selected group.';
    }
    $('#rate-insight').textContent = insight;
    const values=ages.map(a=>groups.filter(g=>g.age===a).reduce((sum,g)=>sum+g.count,0));
    const max=Math.max(...values,1);
    $('#age-chart').innerHTML=ages.map((a,i)=>`<button class="chart-bar ${age===a?'selected':''} ${age!=='all'&&age!==a?'muted':''}" data-age="${a}" aria-label="${escape(tr('chartSelect')(a))}: ${number(values[i])}" aria-pressed="${age===a}"><span class="bar-count">${number(values[i])}</span><span class="bar-track"><span style="height:${Math.max(2,values[i]/max*100)}%"></span></span><span class="bar-label">${a}</span></button>`).join('');
    $('#age-chart').setAttribute('aria-label',tr('chartTitle'));
  }
  $('#age-filter').addEventListener('change',renderData);$('#gender-filter').addEventListener('change',renderData);
  $('#reset-data').addEventListener('click',()=>{$('#age-filter').value='all';$('#gender-filter').value='all';renderData();});
  $('#age-chart').addEventListener('click',e=>{const b=e.target.closest('[data-age]');if(b){$('#age-filter').value=$('#age-filter').value===b.dataset.age?'all':b.dataset.age;renderData();}});
  function renderForecast(){
    const el=$('#forecast-detail');if(!el||!forecast)return;
    const max=Math.max(...forecast.results.flatMap(r=>[r.rmse,r.baseline_rmse]));
    el.innerHTML=`<h3>${tr('forecastTitle')}</h3><div class="forecast-legend"><span><i></i>${tr('model')}</span><span><i></i>${tr('baseline')}</span></div>${forecast.results.map(r=>`<div class="forecast-row"><strong>${r.horizon.replace('m','')} ${tr('months')}</strong><div><div class="forecast-bar" style="width:${r.rmse/max*100}%"><span>${r.model}: ${number(r.rmse,3)}</span></div><div class="forecast-bar baseline" style="width:${r.baseline_rmse/max*100}%"><span>${r.baseline}: ${number(r.baseline_rmse,3)}</span></div></div></div>`).join('')}<p>${tr('forecastNote')}</p>`;
  }
  fetch('assets/credit-summary.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{credit=data;renderData();}).catch(()=>{$('#metric-count').textContent='—';$('#metric-share').textContent=tr('unavailable');});
  fetch('assets/forecast-results.json').then(r=>r.json()).then(data=>{forecast=data;renderForecast();}).catch(()=>{});
  setLanguage(lang);readHash();
})();
