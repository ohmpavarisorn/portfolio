(() => {
  'use strict';

  const copy = {
    th: {
      back:'← กลับไปพอร์ต', cart:'ตะกร้า', eyebrow:'VYNE / เดโมหน้าร้าน', title:'เสื้อผ้าสำหรับทุกวัน',
      intro:'ลองค้นหา เก็บรายการโปรด และจัดตะกร้าจากแค็ตตาล็อกตัวอย่างของ VYNE', browse:'ดูสินค้า ↓',
      notice:'เดโมใช้สินค้าและภาพตัวอย่าง กิจกรรมทั้งหมดเกิดขึ้นในเบราว์เซอร์และไม่มีการสั่งซื้อหรือชำระเงินจริง',
      collection:'แค็ตตาล็อก', edit:'ลองเปลี่ยนรูปสินค้า', search:'ค้นหาสินค้า', searchPlaceholder:'ชื่อสินค้า',
      category:'หมวดหมู่', all:'ทั้งหมด', clothing:'เสื้อผ้า', accessories:'อุปกรณ์เสริม', favorites:'เฉพาะรายการโปรด',
      source:'ดูโค้ดโปรเจกต์ ↗', close:'ปิด', total:'ยอดรวม', cartNote:'ตะกร้าตัวอย่างสำหรับทดลองการใช้งาน',
      imageNote:'เลือกรูป JPG หรือ PNG ไม่เกิน 5 MB รูปจะใช้ในเดโมนี้จนกว่าจะโหลดหน้าใหม่',
      product:'สินค้า', chooseImage:'เลือกไฟล์รูป', reset:'คืนรูปเดิม', add:'เพิ่มลงตะกร้า',
      favorite:name=>`รายการโปรด · ${name}`, added:name=>`เพิ่ม ${name} ลงตะกร้าแล้ว`, quantity:n=>`${n} ชิ้น`,
      subtract:name=>`ลดจำนวน ${name}`, emptyCart:'ยังไม่มีสินค้าในตะกร้า', results:n=>n?`${n} สินค้า`:'ไม่พบสินค้าที่ตรงกัน',
      updated:'เปลี่ยนรูปในเดโมแล้ว', restored:'คืนรูปเดิมแล้ว', invalid:'กรุณาเลือกไฟล์ JPG หรือ PNG ที่เปิดได้และมีขนาดไม่เกิน 5 MB'
    },
    en: {
      back:'← Back to portfolio', cart:'Cart', eyebrow:'VYNE / STOREFRONT DEMO', title:'Everyday essentials.',
      intro:'Search, save favorites, and build a cart using the VYNE sample catalog.', browse:'Shop the catalog ↓',
      notice:'Products and imagery are illustrative. This demo runs in your browser and never places orders or charges for anything.',
      collection:'Catalog', edit:'Try replacing a product image', search:'Search products', searchPlaceholder:'Product name',
      category:'Category', all:'All', clothing:'Clothing', accessories:'Accessories', favorites:'Favorites only',
      source:'View project source ↗', close:'Close', total:'Total', cartNote:'This cart is for demonstration.',
      imageNote:'Choose a JPG or PNG up to 5 MB. The image stays in this demo until you reload the page.',
      product:'Product', chooseImage:'Choose an image', reset:'Restore original', add:'Add to cart',
      favorite:name=>`Favorite · ${name}`, added:name=>`${name} added to your cart`, quantity:n=>`Qty ${n}`,
      subtract:name=>`Decrease quantity for ${name}`, emptyCart:'Your cart is empty.', results:n=>n?`${n} ${n===1?'product':'products'}`:'No matching products.',
      updated:'Demo image updated.', restored:'Original image restored.', invalid:'Choose a readable JPG or PNG file up to 5 MB.'
    }
  };
  const products = [
    {id:'oxford', category:'clothing', price:1290, th:'เสื้อเชิ้ตอ็อกซ์ฟอร์ด', en:'Cotton Oxford shirt'},
    {id:'tee', category:'clothing', price:690, th:'เสื้อยืดสีชาร์โคล', en:'Charcoal boxy tee'},
    {id:'tote', category:'accessories', price:590, th:'กระเป๋าผ้าแคนวาส', en:'Canvas carryall'},
    {id:'denim', category:'clothing', price:1490, th:'กางเกงยีนส์ทรงตรง', en:'Straight-leg denim'}
  ];
  const $ = id => document.getElementById(id);
  const favorites = new Set();
  const quantities = new Map();
  const imageOverrides = new Map();
  const languageKey = 'ohm-portfolio-language';
  const imageTypes = new Set(['image/jpeg','image/png']);
  let lang = 'th';
  let imageRequest = 0;
  try { if (localStorage.getItem(languageKey) === 'en') lang = 'en'; } catch {}

  const tr = key => copy[lang][key];
  const imageFor = id => imageOverrides.get(id) ?? `${id}.webp`;
  const money = price => new Intl.NumberFormat(lang==='th'?'th-TH':'en-GB',{style:'currency',currency:'THB',currencyDisplay:'narrowSymbol',maximumFractionDigits:0}).format(price);

  function renderFilters() {
    const query = $('search').value.trim().toLocaleLowerCase();
    const category = $('category').value;
    let count = 0;
    for (const p of products) {
      const matchesSearch = `${p.th} ${p.en}`.toLocaleLowerCase().includes(query);
      const matchesCategory = category === 'all' || category === p.category;
      const matchesFavorite = !$('favorites-only').checked || favorites.has(p.id);
      const shown = matchesSearch && matchesCategory && matchesFavorite;
      $(`item-${p.id}`).hidden = !shown;
      if (shown) count += 1;
    }
    $('results').textContent = tr('results')(count);
  }

  function renderCatalog() {
    $('catalog').innerHTML = products.map(p => `<article class="product-card" id="item-${p.id}">
      <img src="${imageFor(p.id)}" alt="${p[lang]}" width="600" height="600" loading="lazy">
      <button type="button" class="favorite" data-favorite="${p.id}" aria-label="${tr('favorite')(p[lang])}" aria-pressed="${favorites.has(p.id)}">${favorites.has(p.id)?'♥':'♡'}</button>
      <div class="product-meta"><h3>${p[lang]}</h3><p>${money(p.price)}</p><button type="button" class="add" data-add="${p.id}">${tr('add')} +</button></div>
    </article>`).join('');
    renderFilters();
  }

  function renderCart() {
    let count = 0;
    let total = 0;
    const items = products.filter(p => quantities.has(p.id)).map(p => {
      const qty = quantities.get(p.id);
      count += qty;
      total += qty * p.price;
      return `<div class="cart-item"><div><strong>${p[lang]}</strong><p>${tr('quantity')(qty)} · ${money(qty*p.price)}</p></div><button type="button" data-subtract="${p.id}" aria-label="${tr('subtract')(p[lang])}">−</button></div>`;
    });
    $('cart-count').textContent = count;
    $('cart-total').textContent = money(total);
    $('cart-items').innerHTML = items.join('') || `<p class="muted">${tr('emptyCart')}</p>`;
  }

  function refreshEditor() {
    const id = $('editor-product').value;
    $('editor-preview').src = imageFor(id);
    $('editor-preview').alt = products.find(p => p.id === id)[lang];
    $('reset-image').disabled = !imageOverrides.has(id);
  }

  function renderLanguage() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = tr(el.dataset.copy); });
    $('search').placeholder = tr('searchPlaceholder');
    $('language').lang = lang === 'th' ? 'en' : 'th';
    $('language').textContent = lang === 'th' ? 'EN' : 'TH';
    $('editor-product').innerHTML = products.map(p => `<option value="${p.id}">${p[lang]}</option>`).join('');
    renderCatalog();
    renderCart();
    refreshEditor();
  }

  function setImage(id, url) {
    const previous = imageOverrides.get(id);
    if (previous) URL.revokeObjectURL(previous);
    if (url) imageOverrides.set(id,url);
    else imageOverrides.delete(id);
    $(`item-${id}`).querySelector('img').src = imageFor(id);
    refreshEditor();
  }

  $('language').addEventListener('click', () => {
    lang = lang === 'th' ? 'en' : 'th';
    try { localStorage.setItem(languageKey,lang); } catch {}
    renderLanguage();
  });
  $('search').addEventListener('input',renderFilters);
  $('category').addEventListener('change',renderFilters);
  $('favorites-only').addEventListener('change',renderFilters);
  $('catalog').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.favorite) {
      const id = button.dataset.favorite;
      const pressed = !favorites.delete(id);
      if (pressed) favorites.add(id);
      button.textContent = pressed ? '♥' : '♡';
      button.setAttribute('aria-pressed',String(pressed));
      renderFilters();
      if ($(`item-${id}`).hidden) $('favorites-only').focus();
    } else {
      const id = button.dataset.add;
      quantities.set(id,(quantities.get(id)??0)+1);
      renderCart();
      $('status').textContent = tr('added')(products.find(p => p.id === id)[lang]);
    }
  });
  $('open-cart').addEventListener('click', () => $('cart-dialog').showModal());
  $('cart-items').addEventListener('click', event => {
    const id = event.target.closest('[data-subtract]')?.dataset.subtract;
    if (!id) return;
    const remaining = quantities.get(id) - 1;
    if (remaining) quantities.set(id,remaining);
    else quantities.delete(id);
    renderCart();
    ($('cart-items').querySelector(`[data-subtract="${id}"]`) ?? $('cart-dialog').querySelector('button')).focus();
  });
  $('open-editor').addEventListener('click', () => {
    $('editor-status').textContent = '';
    $('editor-dialog').showModal();
  });
  $('editor-dialog').addEventListener('close', () => { imageRequest += 1; });
  $('editor-product').addEventListener('change', () => {
    imageRequest += 1;
    $('editor-status').textContent = '';
    refreshEditor();
  });
  $('reset-image').addEventListener('click', () => {
    imageRequest += 1;
    setImage($('editor-product').value,null);
    $('editor-status').textContent = tr('restored');
    $('image-file').focus();
  });
  $('image-file').addEventListener('change', async event => {
    const request = ++imageRequest;
    const file = event.target.files[0];
    const id = $('editor-product').value;
    event.target.value = '';
    if (!file) return;
    if (!imageTypes.has(file.type) || file.size > 5*1024*1024) {
      $('editor-status').textContent = tr('invalid');
      return;
    }
    const url = URL.createObjectURL(file);
    const candidate = new Image();
    candidate.src = url;
    try { await candidate.decode(); }
    catch {
      URL.revokeObjectURL(url);
      if (request === imageRequest) $('editor-status').textContent = tr('invalid');
      return;
    }
    if (request !== imageRequest || !$('editor-dialog').open) {
      URL.revokeObjectURL(url);
      return;
    }
    setImage(id,url);
    $('editor-status').textContent = tr('updated');
  });

  renderLanguage();
})();
