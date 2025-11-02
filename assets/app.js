// ===== CONFIG (replace with your links) =====
const CAL_URL_COMMUNITY = "https://cal.com/your-handle/30min?embed=1";
const CAL_URL_CONSULTING = "https://cal.com/your-handle/30min-consulting?embed=1";
const STRIPE_LINK_TSHIRT = "https://buy.stripe.com/test_REPLACE"; // replace
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
  // THEME: default light; honor saved/system preference
  const THEME_KEY = 'velthra_theme';
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (!saved && prefersDark) document.body.classList.add('theme-dark');
  if (saved === 'dark') document.body.classList.add('theme-dark');
  if (saved === 'light') document.body.classList.remove('theme-dark');
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn?.addEventListener('click', () => {
    document.body.classList.toggle('theme-dark');
    const isDark = document.body.classList.contains('theme-dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    toggleBtn.textContent = isDark ? '🌙' : '☀️';
  });
  if (toggleBtn) toggleBtn.textContent = document.body.classList.contains('theme-dark') ? '🌙' : '☀️';

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mark current nav link (simple match by filename)
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav a').forEach(a=>{
    const href = (a.getAttribute('href')||'').toLowerCase();
    if (href === path) a.setAttribute('aria-current','page');
  });

  // Toast
  window.toast = (msg) => {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'card pad';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.remove('hidden');
    setTimeout(()=>t.classList.add('hidden'), 2400);
  };

  // Modal booking
  const modal = document.getElementById('booking-modal');
  const frame = document.getElementById('booking-frame');
  const main = document.querySelector('main');
  let lastFocus = null;
  window.openBooking = (which) => {
    const url = which === 'consulting' ? CAL_URL_CONSULTING : CAL_URL_COMMUNITY;
    if (!url) { toast('Set your Cal.com link first.'); return; }
    lastFocus = document.activeElement;
    frame.src = url;
    main?.setAttribute('inert','');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
  };
  window.closeBooking = () => {
    modal.style.display = 'none';
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    frame.src = 'about:blank';
    main?.removeAttribute('inert');
    lastFocus?.focus();
  };

  // Page-specific initializers
  const page = document.body.dataset.page;

  if (page === 'community') {
    const host = document.getElementById('community-services');
    if (host) {
      const boxes = [
        { title:'Mentorship', body:'One-on-one support for clarity, mindset, and next steps.' },
        { title:'Career Progression', body:'Positioning, resume/story, and strategic moves.' },
        { title:'Image Consulting', body:'Presence, communication, and practical polish.' }
      ];
      host.innerHTML = '';
      boxes.forEach(it=>{
        const el = document.createElement('article');
        el.className='card pad';
        el.innerHTML = `<h3>${it.title}</h3><p class="small">${it.body}</p><button class="btn" onclick="openBooking('community')">Book →</button>`;
        host.appendChild(el);
      });
    }
  }

  if (page === 'consulting') {
    const consultingPackages=[
      {id:'intel', title:'Intelligence & Analysis Products', body:'Decision briefs, white papers, and policy-aligned reports.'},
      {id:'assessment', title:'Organizational Assessments', body:'Structure, workflow, and reporting chain reviews with recommendations.'},
      {id:'efficiency', title:'Operational Efficiency Audits', body:'Redundancy/bottleneck identification, roadmap, and quick wins.'},
      {id:'pilot', title:'Implementation & Pilot Programs', body:'AI prototyping; NIST/IT standards pilots; multi-org adoption reporting.'}
    ];
    const sel = document.getElementById('consulting-package');
    const wrap = document.getElementById('consulting-cards');
    if (sel && wrap) {
      sel.innerHTML = '<option value="">— Select —</option>'+consultingPackages.map(p=>`<option value="${p.id}">${p.title}</option>`).join('');
      wrap.innerHTML='';
      consultingPackages.forEach(p=>{
        const box=document.createElement('article');
        box.className='card pad';
        box.innerHTML = `<h3>${p.title}</h3><p class="small">${p.body}</p><button class="btn" onclick="openBooking('consulting')">Book →</button>`;
        wrap.appendChild(box);
      });
      window.bookConsultingWithPackage = () => {
        if (!sel.value){ toast('Choose a package first.'); sel.focus(); return; }
        openBooking('consulting');
      };
    }
  }

  if (page === 'partnerships') {
    // Tabs
    const pTabs = { merch:'p-merch', moonpay:'p-moonpay', opps:'p-opps', contact:'p-contact' };
    function switchTab(tab){
      for (const [k,id] of Object.entries(pTabs)){
        const on = k===tab;
        document.getElementById(id)?.classList.toggle('hidden',!on);
        const btn = document.querySelector(`[data-p-tab="${k}"]`);
        btn?.classList.toggle('primary', on);
        btn?.setAttribute('aria-selected', String(on));
      }
    }
    document.querySelectorAll('[role="tab"]').forEach((b,i,arr)=>{
      b.addEventListener('click',()=>switchTab(b.dataset.pTab));
      b.addEventListener('keydown',e=>{
        let n=i;
        if(e.key==='ArrowRight') n=(i+1)%arr.length;
        if(e.key==='ArrowLeft')  n=(i-1+arr.length)%arr.length;
        if(n!==i){ e.preventDefault(); arr[n].focus(); arr[n].click(); }
      });
    });
    switchTab('merch');

    // Stripe
    const tshirtBtn = document.getElementById('stripe-buy');
    tshirtBtn?.addEventListener('click',()=>{
      if(!STRIPE_LINK_TSHIRT || STRIPE_LINK_TSHIRT.includes('REPLACE')){
        toast('Add your Stripe Payment Link.'); return;
      }
      window.open(STRIPE_LINK_TSHIRT,'_blank','noopener,noreferrer');
    });

    // MoonPay builder
    function buildMoonPayURL(){
      const base='https://buy.moonpay.com';
      const amount=Number(document.getElementById('mp-amount').value||0);
      const currency=document.getElementById('mp-currency').value;
      const wallet=(document.getElementById('mp-wallet').value||'').trim();
      const redirect=(document.getElementById('mp-redirect').value||'').trim();
      const key=(document.getElementById('mp-key').value||'').trim();
      if(!key){toast('Enter your MoonPay public key.');return null;}
      if(!wallet){toast('Enter a destination wallet address.');return null;}
      if(!amount||amount<5){toast('Enter an amount ≥ 5 USD.');return null;}
      const p=new URLSearchParams({
        apiKey:key,currencyCode:currency,baseCurrencyAmount:String(amount),
        baseCurrencyCode:'usd',walletAddress:wallet,redirectURL:redirect,showWalletAddressForm:'true'
      });
      return `${base}?${p.toString()}`;
    }
    const mpOpen=document.getElementById('mp-open');
    const mpPrev=document.getElementById('mp-preview');
    const mpURL=document.getElementById('mp-url');
    mpOpen?.addEventListener('click',()=>{ const url=buildMoonPayURL(); if(url) window.open(url,'_blank','noopener,noreferrer'); });
    mpPrev?.addEventListener('click',()=>{ const url=buildMoonPayURL(); if(url){ mpURL.style.display='block'; mpURL.textContent=url; } });

    // Contact form (demo)
    const contactForm=document.getElementById('contact-form');
    contactForm?.addEventListener('submit',e=>{
      e.preventDefault();
      const fd=new FormData(contactForm);
      if(fd.get('company')) return; // honeypot
      toast('Message sent — we will reply shortly.');
      contactForm.reset();
      location.href='thank-you.html';
    });
  }

  if (page === 'tools') {
    const toolsData=[
      { name:'CryptPad', url:'https://cryptpad.org', category:'zero-knowledge', tags:['open-source','nist-800-171'], blurb:'Collaborative docs with client-side encryption.' },
      { name:'Proton Drive', url:'https://proton.me/drive', category:'zero-knowledge', tags:['fips-140-3'], blurb:'Zero-knowledge cloud storage and sharing.' },
      { name:'OpenSCAP', url:'https://www.open-scap.org', category:'open-source', tags:['nist-800-53'], blurb:'Compliance scanning and policy tooling.' },
      { name:'CloudMapper', url:'https://github.com/duo-labs/cloudmapper', category:'open-source', tags:['soc2'], blurb:'AWS environment visualization and auditing.' },
      { name:'FedRAMP Marketplace', url:'https://marketplace.fedramp.gov', category:'fedramp', tags:['nist-800-53'], blurb:'Catalog of authorized cloud services.' },
      { name:'LM Studio', url:'https://lmstudio.ai', category:'ai', tags:['open-source'], blurb:'Run local large language models on your machine.' },
      { name:'GPT4All', url:'https://gpt4all.io', category:'ai', tags:['open-source','zero-knowledge'], blurb:'Run lightweight LLMs locally.' },
      { name:'Hugging Face', url:'https://huggingface.co', category:'ai', tags:['open-source'], blurb:'Models, datasets, and open AI research.' }
    ];
    const list=document.getElementById('tools-list');
    const catSel=document.getElementById('tools-category');
    const search=document.getElementById('tools-search');
    const tags=Array.from(document.querySelectorAll('.tools-tag'));
    function render(){
      const q=(search.value||'').toLowerCase().trim();
      const wantCat=catSel.value;
      const wantTags=tags.filter(x=>x.checked).map(x=>x.value);
      const res=toolsData.filter(t=>
        (wantCat==='all'||t.category===wantCat) &&
        (!wantTags.length||wantTags.every(tag=>t.tags.includes(tag))) &&
        (!q||`${t.name} ${t.blurb} ${t.tags.join(' ')}`.toLowerCase().includes(q))
      ).sort((a,b)=>a.name.localeCompare(b.name));
      document.getElementById('tools-count').textContent=String(res.length);
      list.innerHTML='';
      if(!res.length){
        const empty=document.createElement('div');
        empty.className='card pad';
        empty.style.gridColumn='1 / -1';
        empty.textContent='No tools match your filters yet.';
        list.appendChild(empty); return;
      }
      res.forEach(t=>{
        const card=document.createElement('article');
        card.className='card pad';
        const tagsHTML=t.tags.map(x=>`<span class="small" style="background:rgba(110,139,87,.18);padding:2px 8px;border-radius:999px;margin-right:6px;display:inline-block">${x}</span>`).join(' ');
        card.innerHTML = `<h3>${t.name}</h3><p class="small" style="margin-top:6px">${t.blurb}</p>
          <div style="margin-top:6px">${tagsHTML}</div>
          <div style="margin-top:10px"><a class="btn" href="${t.url}" target="_blank" rel="noopener">Visit →</a></div>`;
        list.appendChild(card);
      });
    }
    catSel.addEventListener('input',render);
    search.addEventListener('input',render);
    tags.forEach(cb=>cb.addEventListener('change',render));
    render();
  }
});
