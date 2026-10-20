(function(){
'use strict';
var SAVE_KEY='mm_saved';
function getSaved(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');}catch(e){return [];}}
function setSaved(list){try{localStorage.setItem(SAVE_KEY,JSON.stringify(list));}catch(e){}}

/* header shadow + back to top */
var top=document.getElementById('top'),toTop=document.getElementById('toTop');
function onScrollUI(){var y=window.scrollY||0;if(top)top.classList.toggle('scrolled',y>8);if(toTop)toTop.classList.toggle('show',y>600);}
window.addEventListener('scroll',onScrollUI,{passive:true});onScrollUI();
if(toTop)toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});

/* mobile menu */
var b=document.getElementById('menuBtn'),n=document.getElementById('nav');
if(b&&n){b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);});
document.addEventListener('click',function(e){if(n.classList.contains('open')&&!n.contains(e.target)&&e.target!==b&&!b.contains(e.target)){n.classList.remove('open');b.setAttribute('aria-expanded','false');}});}

/* reveal on scroll */
var rv=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window&&rv.length){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  rv.forEach(function(el){io.observe(el);});
}else{rv.forEach(function(el){el.classList.add('in');});}

/* saved recipes */
function paintSaved(){
  var list=getSaved();
  document.querySelectorAll('[data-save]').forEach(function(btn){btn.setAttribute('aria-pressed',list.indexOf(btn.getAttribute('data-save'))>-1?'true':'false');});
  document.querySelectorAll('[data-saved-count]').forEach(function(c){c.textContent=list.length;c.hidden=list.length===0;});
  var sg=document.getElementById('savedGrid');
  if(sg){var shown=0;sg.querySelectorAll('.card').forEach(function(c){var on=list.indexOf(c.getAttribute('data-slug'))>-1;c.classList.toggle('saved',on);if(on){shown++;c.classList.add('in');}});
    var t=document.getElementById('savedTotal');if(t)t.textContent=shown;var em=document.getElementById('savedEmpty');if(em)em.style.display=shown?'none':'flex';}
}
document.addEventListener('click',function(e){
  var btn=e.target.closest('[data-save]');if(!btn)return;
  e.preventDefault();var slug=btn.getAttribute('data-save'),list=getSaved(),i=list.indexOf(slug);
  if(i>-1)list.splice(i,1);else list.push(slug);
  setSaved(list);paintSaved();
  btn.animate([{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:300,easing:'ease-out'});
});
document.querySelectorAll('[data-clear-saved]').forEach(function(x){x.addEventListener('click',function(){setSaved([]);paintSaved();x.textContent='Cleared.';});});
paintSaved();

/* recipe popup ("Read more") */
var m=document.getElementById('recipeModal');
function clearHash(){if(location.hash==='#read-more')history.replaceState(null,'',location.pathname+location.search);}
function openM(){if(!m)return;if(m.showModal){if(!m.open)m.showModal();}else m.setAttribute('open','');m.scrollTop=0;document.body.style.overflow='hidden';}
function closeM(){if(!m)return;if(m.close)m.close();else m.removeAttribute('open');clearHash();document.body.style.overflow='';}
document.querySelectorAll('[data-open="recipeModal"]').forEach(function(x){x.addEventListener('click',openM);});
document.querySelectorAll('[data-close]').forEach(function(x){x.addEventListener('click',closeM);});
if(m){m.addEventListener('click',function(e){if(e.target===m)closeM();});m.addEventListener('cancel',clearHash);m.addEventListener('close',function(){clearHash();document.body.style.overflow='';});if(location.hash==='#read-more')setTimeout(openM,150);
  var boxes=m.querySelectorAll('.check input'),prog=m.querySelector('[data-progress]');
  function upd(){var d=0;boxes.forEach(function(c){if(c.checked)d++;});if(prog)prog.textContent=d+'/'+boxes.length;}
  boxes.forEach(function(c){c.addEventListener('change',upd);});
}

/* recipe index: filter + search + sort */
var g=document.getElementById('grid');
if(g){
  var p=new URLSearchParams(location.search),cat=(p.get('cat')||'').toLowerCase(),q=(p.get('s')||'').toLowerCase().trim(),tier=(p.get('tier')||'').toLowerCase();if(tier!=='free'&&tier!=='paid')tier='';
  var input=document.getElementById('q');if(input&&q)input.value=p.get('s');
  var f=document.getElementById('searchForm');
  if(f&&cat){var h=document.createElement('input');h.type='hidden';h.name='cat';h.value=cat;f.appendChild(h);}
  if(f&&tier){var h2=document.createElement('input');h2.type='hidden';h2.name='tier';h2.value=tier;f.appendChild(h2);}
  document.querySelectorAll('.chip.tier').forEach(function(c){c.classList.toggle('on',(c.getAttribute('data-tier')||'')===tier);var u=new URLSearchParams();if(cat)u.set('cat',cat);if(c.getAttribute('data-tier'))u.set('tier',c.getAttribute('data-tier'));c.href='recipes.html'+(u.toString()?'?'+u.toString():'');});
  document.querySelectorAll('.filter').forEach(function(c){if(!tier)return;var u=new URLSearchParams();if(c.getAttribute('data-filter'))u.set('cat',c.getAttribute('data-filter'));u.set('tier',tier);c.href='recipes.html?'+u.toString();});
  document.querySelectorAll('.filter').forEach(function(c){c.classList.toggle('on',(c.getAttribute('data-filter')||'')===cat);});
  var cards=Array.prototype.slice.call(g.querySelectorAll('.card'));
  cards.forEach(function(c,i){c.setAttribute('data-i',i);});
  function apply(){
    var shown=0;
    cards.forEach(function(c){
      var ok=(!cat||(' '+c.getAttribute('data-cats')+' ').indexOf(' '+cat+' ')>-1)&&(!tier||c.getAttribute('data-tier')===tier)&&(!q||c.getAttribute('data-title').indexOf(q)>-1);
      c.hidden=!ok;if(ok){shown++;c.classList.add('in');}
    });
    document.getElementById('count').textContent=shown;
    document.getElementById('empty').hidden=shown>0;
  }
  apply();
  if(input){input.addEventListener('input',function(){q=input.value.toLowerCase().trim();apply();});if(location.hash==='#q')setTimeout(function(){input.focus();},100);}
  var sort=document.getElementById('sort');
  if(sort){sort.addEventListener('change',function(){
    var v=sort.value;var arr=cards.slice();
    function num(c,sel){var t=c.querySelector(sel);return t?parseInt(t.textContent,10)||0:0;}
    if(v==='price-asc'||v==='price-desc')arr.sort(function(a,b){var d=parseFloat(a.getAttribute('data-price'))-parseFloat(b.getAttribute('data-price'));return v==='price-asc'?d:-d;});
    else if(v==='time')arr.sort(function(a,b){return num(a,'.meta span:nth-child(1)')-num(b,'.meta span:nth-child(1)');});
    else if(v==='cal')arr.sort(function(a,b){return num(a,'.meta span:nth-child(3)')-num(b,'.meta span:nth-child(3)');});
    else if(v==='name')arr.sort(function(a,b){return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);});
    else arr.sort(function(a,b){return a.getAttribute('data-i')-b.getAttribute('data-i');});
    arr.forEach(function(c){g.appendChild(c);});
  });}
  if(cat||tier){var label=(tier==='free'?'Free ':tier==='paid'?'Premium ':'')+(cat?cat.charAt(0).toUpperCase()+cat.slice(1)+' recipes':'recipes');label=label.charAt(0).toUpperCase()+label.slice(1);var t=document.getElementById('listTitle');if(t)t.textContent=label;document.title=label+' | Moss & Mill';}
}

/* forms: enquiry, deletion, newsletter -> stored in this browser (static site) */
function setMsg(form,text,cls){var e=form.querySelector('.form-msg');if(!e)return;e.textContent=text;e.className='form-msg '+(cls||'');}
var FORM_OK={newsletter:'You are on the list! Use WELCOME10 for 10% off your first order.',enquiry:'Thanks! Your enquiry was sent. We reply within one business day.',deletion:'Your deletion request was received. We confirm by email within 7 days.'};
document.querySelectorAll('form[data-local]').forEach(function(form){
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var type=form.getAttribute('data-local');
    var hp=form.querySelector('input[name="website"]');
    if(hp&&hp.value){setMsg(form,FORM_OK[type],'ok');form.reset();return;}
    if(!form.checkValidity()){form.reportValidity();setMsg(form,'Please complete the highlighted fields.','err');return;}
    var em=form.querySelector('input[type="email"]');
    if(em&&!/^[^@ ]+@[^@ ]+[.][^@ ]{2,}$/.test(em.value.trim())){setMsg(form,'Please enter a valid email address.','err');em.focus();return;}
    if(type==='deletion'&&!form.querySelector('input[name="scope[]"]:checked')){setMsg(form,'Choose at least one thing to delete.','err');return;}
    var data={};new FormData(form).forEach(function(v,k){if(k==='website')return;k=k.replace('[]','');if(data[k]){data[k]=[].concat(data[k],v);}else data[k]=v;});
    data.type=type;data.page=location.pathname.split('/').pop()||'index.php';data.at=new Date().toISOString();
    var list=[];try{list=JSON.parse(localStorage.getItem('mm_forms')||'[]');}catch(x){}
    list.push(data);try{localStorage.setItem('mm_forms',JSON.stringify(list.slice(-50)));}catch(x){}
    var btn=form.querySelector('button[type="submit"]');if(btn){btn.disabled=true;setTimeout(function(){btn.disabled=false;},1200);}
    setMsg(form,FORM_OK[type]||'Thanks!','ok');form.reset();
    if(form.closest('#promo'))setTimeout(closePromo,2500);
  });
});

/* marketing popup: once per session, after 7s or 45% scroll, not on recipe pages */
var promo=document.getElementById('promo');
function closePromo(){if(!promo)return;promo.hidden=true;try{sessionStorage.setItem('mm_promo','1');}catch(e){}}
function openPromo(){if(!promo||!promo.hidden)return;if(m&&m.open)return;promo.hidden=false;var i=promo.querySelector('input[type=email]');if(i)setTimeout(function(){i.focus();},50);}
if(promo){
  var seen=false;try{seen=sessionStorage.getItem('mm_promo')==='1';}catch(e){}
  if(!seen){
    var timer=setTimeout(openPromo,7000);
    var onScroll=function(){var d=document.documentElement;if((window.scrollY+window.innerHeight)/d.scrollHeight>.45){clearTimeout(timer);openPromo();window.removeEventListener('scroll',onScroll);}};
    window.addEventListener('scroll',onScroll,{passive:true});
  }
  promo.querySelectorAll('[data-promo-close]').forEach(function(x){x.addEventListener('click',closePromo);});
  promo.addEventListener('click',function(e){if(e.target===promo)closePromo();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!promo.hidden)closePromo();});
}
})();
(function shopClient(CAT, COUPONS, INFO) {
  'use strict';
  var CART_KEY = 'mm_cart', ORD_KEY = 'mm_orders', CPN_KEY = 'mm_coupon', FORMS_KEY = 'mm_forms';
  var page = (location.pathname.split('/').pop() || 'index.php').toLowerCase();

  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  function round2(n) { return Math.round(n * 100) / 100; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fmtDate(iso) { try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return iso; } }

  /* ---------- cart ---------- */
  function getCart() {
    var c = load(CART_KEY, []);
    if (!Array.isArray(c)) c = [];
    return c.filter(function (s, i) { return CAT[s] && CAT[s].p > 0 && c.indexOf(s) === i; });
  }
  function setCart(c) { store(CART_KEY, c); paint(); }
  function inCart(s) { return getCart().indexOf(s) > -1; }
  function addToCart(s) { var c = getCart(); if (c.indexOf(s) < 0 && CAT[s] && CAT[s].p > 0) { c.push(s); setCart(c); return true; } return false; }
  function removeFromCart(s) { setCart(getCart().filter(function (x) { return x !== s; })); }
  function getOrders() { var o = load(ORD_KEY, []); return Array.isArray(o) ? o : []; }
  function setOrders(o) { store(ORD_KEY, o); }

  function totals() {
    var cart = getCart(), sub = 0;
    cart.forEach(function (s) { sub += CAT[s].p; });
    sub = round2(sub);
    var code = load(CPN_KEY, ''), cp = COUPONS[code], disc = 0, note = '';
    if (cp) {
      if (sub >= cp.min) disc = cp.type === 'percent' ? round2(sub * cp.value / 100) : Math.min(cp.value, sub);
      else if (cart.length) note = code + ' needs a subtotal of ' + money(cp.min) + ' — add ' + money(cp.min - sub) + ' more.';
    } else code = '';
    return { cart: cart, count: cart.length, subtotal: sub, code: code, discount: disc, total: round2(Math.max(sub - disc, 0)), note: note };
  }

  var toastEl = $('#toast'), toastT;
  function toast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html; toastEl.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }

  function lineItem(s, removable) {
    var r = CAT[s];
    return '<div class="line-item"><img src="' + r.img + '" alt="" width="64" height="64"><div><b><a href="' + r.url + '">' + esc(r.n) + '</a></b><small>' + esc(r.c) + ' · recipe card (PDF)</small></div><div class="li-right"><span class="li-price">' + money(r.p) + '</span>' +
      (removable ? '<button class="rm" type="button" data-remove="' + s + '" aria-label="Remove ' + esc(r.n) + '">' + INFO.trash + 'Remove</button>' : '') + '</div></div>';
  }

  function paintSummary(t) {
    $$('[data-sum-count]').forEach(function (e) { e.textContent = '(' + t.count + (t.count === 1 ? ' item)' : ' items)'); });
    $$('[data-sum-subtotal]').forEach(function (e) { e.textContent = money(t.subtotal); });
    $$('[data-sum-total]').forEach(function (e) { e.textContent = money(t.total); });
    $$('[data-sum-discount-row]').forEach(function (e) { e.hidden = !t.discount; });
    $$('[data-sum-discount]').forEach(function (e) { e.textContent = '−' + money(t.discount); });
    $$('[data-sum-code]').forEach(function (e) { e.textContent = t.code ? '(' + t.code + ')' : ''; });
    $$('[data-coupon-on]').forEach(function (e) {
      e.hidden = !t.code;
      if (t.code) e.innerHTML = '<span>' + INFO.tag + ' <b>' + esc(t.code) + '</b> — ' + esc(COUPONS[t.code].label) + '</span><button type="button" data-coupon-remove>Remove</button>';
    });
    $$('[data-coupon-form]').forEach(function (f) { f.hidden = !!t.code; });
    if (t.note) $$('[data-coupon-msg]').forEach(function (e) { e.textContent = t.note; e.className = 'coupon-msg err'; });
    $$('[data-sum-items]').forEach(function (e) { e.innerHTML = t.cart.map(function (s) { return lineItem(s, false); }).join(''); });
  }

  function paint() {
    var t = totals();
    $$('[data-cart-count]').forEach(function (e) { e.textContent = t.count; e.hidden = !t.count; });
    $$('[data-cart-count-text]').forEach(function (e) { e.textContent = '(' + t.count + ')'; });
    var list = $('[data-cart-list]');
    if (list) list.innerHTML = t.cart.map(function (s) { return lineItem(s, true); }).join('');
    var em = $('[data-cart-empty]'), ft = $('[data-cart-foot]');
    if (em) em.style.display = t.count ? 'none' : 'flex';
    if (list) list.style.display = t.count ? '' : 'none';
    if (ft) ft.style.display = t.count ? '' : 'none';
    $$('[data-cart-subtotal]').forEach(function (e) { e.textContent = money(t.subtotal); });
    $$('[data-add]').forEach(function (b) {
      var on = t.cart.indexOf(b.getAttribute('data-add')) > -1, l = b.querySelector('[data-add-label]');
      b.classList.toggle('in-cart', on);
      if (l) { if (!b.hasAttribute('data-label')) b.setAttribute('data-label', l.textContent); l.textContent = on ? 'In cart — view' : b.getAttribute('data-label'); }
    });
    var rows = $('[data-cart-rows]');
    if (rows) {
      rows.innerHTML = t.count ? '<div class="cart-head-row"><span>Recipe card</span><span>Price</span></div>' + t.cart.map(function (s) {
        var r = CAT[s];
        return '<div class="cart-row"><a href="' + r.url + '"><img src="' + r.img + '" alt="" width="96" height="80"></a><div><h3><a href="' + r.url + '">' + esc(r.n) + '</a></h3><p>' + esc(r.c) + ' · printable PDF card · lifetime access</p></div><div class="cr-right"><span class="cr-price">' + money(r.p) + '</span><button class="rm" type="button" data-remove="' + s + '">' + INFO.trash + 'Remove</button></div></div>';
      }).join('') : '';
      rows.style.display = t.count ? '' : 'none';
      var pe = $('[data-cart-page-empty]'), ac = $('[data-cart-actions]'), sm = $('[data-cart-page] [data-summary]');
      if (pe) pe.style.display = t.count ? 'none' : 'flex';
      if (ac) ac.style.display = t.count ? '' : 'none';
      if (sm) sm.style.display = t.count ? '' : 'none';
    }
    $$('[data-rec]').forEach(function (e) { e.hidden = t.cart.indexOf(e.getAttribute('data-rec')) > -1; });
    paintSummary(t);
    paintOrderNotes();
    var coForm = $('[data-co-form]'), coEmpty = $('[data-co-empty]');
    if (coForm && !coForm.hasAttribute('data-placing')) { coForm.hidden = !t.count; if (coEmpty) coEmpty.style.display = t.count ? 'none' : 'flex'; }
  }

  function paintOrderNotes() {
    var orders = getOrders();
    $$('[data-order-note]').forEach(function (e) {
      var s = e.getAttribute('data-order-note'), o = null;
      for (var i = 0; i < orders.length; i++) if (orders[i].status !== 'Cancelled' && orders[i].items.some(function (it) { return it.slug === s; })) { o = orders[i]; break; }
      if (o) e.innerHTML = 'You ordered this card on ' + esc(fmtDate(o.createdAt)) + ' (order <b>' + esc(o.id) + '</b>, status <b>' + esc(o.status) + '</b>). <a href="order-confirmation.html?order=' + encodeURIComponent(o.id) + '">View order</a>';
      else if (inCart(s)) e.innerHTML = 'This card is in your cart. <a href="checkout.html">Checkout as guest →</a>';
      e.hidden = !(o || inCart(s));
    });
  }

  /* ---------- drawer ---------- */
  var drawer = $('#cartDrawer'), shade = $('#drawerShade'), lastFocus = null;
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    if (shade) shade.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { drawer.focus(); }, 60);
  }
  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('open')) return;
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    if (shade) shade.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (shade) shade.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  function applyCoupon(raw, msgEl) {
    var code = String(raw || '').trim().toUpperCase(), cp = COUPONS[code], t = totals();
    var say = function (txt, ok) { $$('[data-coupon-msg]').forEach(function (e) { e.textContent = txt; e.className = 'coupon-msg ' + (ok ? 'ok' : 'err'); }); };
    if (!code) { say('Enter a coupon code.', false); return false; }
    if (!cp) { say('“' + code + '” is not a valid coupon code.', false); return false; }
    store(CPN_KEY, code);
    if (t.subtotal < cp.min) say(code + ' saved. It applies once your subtotal reaches ' + money(cp.min) + '.', true);
    else say(code + ' applied — ' + cp.label + '.', true);
    paint();
    return true;
  }

  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-add]'))) {
      e.preventDefault();
      var s = el.getAttribute('data-add');
      if (addToCart(s)) {
        $$('[data-cart-count]').forEach(function (c) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
        toast(INFO.check + ' <span>' + esc(CAT[s].n) + ' added.</span> <a href="cart.html">View cart</a>');
      }
      if (page !== 'cart.html' && page !== 'checkout.html') openDrawer();
      return;
    }
    if ((el = e.target.closest('[data-buy]'))) { e.preventDefault(); addToCart(el.getAttribute('data-buy')); location.href = 'checkout.html'; return; }
    if ((el = e.target.closest('[data-remove]'))) {
      e.preventDefault();
      var rs = el.getAttribute('data-remove');
      removeFromCart(rs);
      toast(esc(CAT[rs].n) + ' removed. <a href="#" data-undo="' + rs + '">Undo</a>');
      return;
    }
    if ((el = e.target.closest('[data-undo]'))) { e.preventDefault(); addToCart(el.getAttribute('data-undo')); if (toastEl) toastEl.hidden = true; return; }
    if ((el = e.target.closest('[data-cart-open]'))) {
      if (page === 'cart.html' || page === 'checkout.html' || !drawer) return;
      e.preventDefault(); openDrawer(); return;
    }
    if (e.target.closest('[data-cart-close]')) { closeDrawer(); return; }
    if (e.target.closest('[data-cart-clear]')) { if (confirm('Remove every recipe card from your cart?')) setCart([]); return; }
    if (e.target.closest('[data-coupon-remove]')) { store(CPN_KEY, ''); $$('[data-coupon-msg]').forEach(function (m) { m.textContent = 'Coupon removed.'; m.className = 'coupon-msg'; }); paint(); return; }
    if ((el = e.target.closest('[data-copy]'))) {
      var code = el.getAttribute('data-copy');
      try { if (navigator.clipboard) navigator.clipboard.writeText(code); } catch (x) {}
      store(CPN_KEY, code); paint();
      toast(INFO.tag + ' <span>Code <b>' + esc(code) + '</b> copied and saved — it applies at checkout.</span>');
      return;
    }
    if ((el = e.target.closest('[data-clear-device]'))) {
      if (!confirm('Clear your cart, coupon, and order receipts from this browser?')) return;
      [CART_KEY, ORD_KEY, CPN_KEY].forEach(function (k) { try { localStorage.removeItem(k); } catch (x) {} });
      el.textContent = 'Cleared.'; paint(); return;
    }
  });

  $$('[data-coupon-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); if (applyCoupon(f.code.value)) f.reset(); });
  });

  /* sticky buy bar on premium recipe pages */
  var sticky = $('[data-sticky-buy]');
  if (sticky) {
    var onS = function () { sticky.classList.toggle('show', (window.scrollY || 0) > 760 && (window.innerHeight + window.scrollY) < document.documentElement.scrollHeight - 260); };
    window.addEventListener('scroll', onS, { passive: true }); onS();
  }

  /* ---------- checkout ---------- */
  var form = $('[data-co-form]');
  if (form) initCheckout(form);

  function cardBrand(num) {
    if (/^4/.test(num)) return 'VISA';
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(num)) return 'MASTERCARD';
    if (/^3[47]/.test(num)) return 'AMEX';
    if (/^(6011|65|64[4-9])/.test(num)) return 'DISCOVER';
    return '';
  }
  function luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) { var d = +num[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; }
    return sum % 10 === 0;
  }
  function orderId() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', a = new Uint8Array(4);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else for (var j = 0; j < 4; j++) a[j] = Math.floor(Math.random() * 256);
    for (var i = 0; i < 4; i++) out += chars[a[i] % chars.length];
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return 'MM-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + out;
  }

  function initCheckout(form) {
    var el = form.elements, alertBox = $('[data-co-alert]');
    var stateSel = $('[data-state-select]'), regionIn = $('[data-region-input]');
    function isUS() { return el.country.value === 'United States'; }
    function method() { var m = form.querySelector('input[name="payment"]:checked'); return m ? m.value : 'card'; }

    function syncCountry() {
      stateSel.hidden = !isUS(); regionIn.hidden = isUS();
      el.zip.placeholder = isUS() ? '12345' : 'Postal code';
    }
    el.country.addEventListener('change', function () { syncCountry(); check('state'); if (el.zip.value) check('zip'); });
    syncCountry();

    function syncPay() {
      var m = method();
      $$('[data-pay-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-pay-panel') !== m; });
      ['cardName', 'cardNumber', 'cardExp', 'cardCvc'].forEach(function (n) { if (m !== 'card') setErr(n, ''); });
    }
    $$('input[name="payment"]', form).forEach(function (r) { r.addEventListener('change', syncPay); });
    syncPay();

    var numIn = $('[data-card-number]'), brandEl = $('[data-card-brand]');
    numIn.addEventListener('input', function () {
      var d = numIn.value.replace(/\D/g, '').slice(0, 19), b = cardBrand(d), out;
      if (b === 'AMEX') out = [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
      else out = d.replace(/(.{4})/g, '$1 ').trim();
      numIn.value = out; brandEl.textContent = b;
    });
    var expIn = $('[data-card-exp]');
    expIn.addEventListener('input', function (e) {
      var d = expIn.value.replace(/\D/g, '').slice(0, 4);
      if (d.length === 1 && +d > 1) d = '0' + d;
      expIn.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : (d.length === 2 && e.inputType !== 'deleteContentBackward' ? d + '/' : d);
    });
    var cvcIn = $('[data-card-cvc]');
    cvcIn.addEventListener('input', function () { cvcIn.value = cvcIn.value.replace(/\D/g, '').slice(0, 4); });

    function v(n) { return el[n] ? String(el[n].value || '').trim() : ''; }
    var rules = {
      email: function () { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email')) ? '' : v('email') ? 'Enter a valid email address, like name@example.com.' : 'Email is required for your receipt.'; },
      phone: function () { var d = v('phone').replace(/\D/g, ''); return !v('phone') || (d.length >= 7 && d.length <= 15) ? '' : 'Enter a valid phone number or leave it blank.'; },
      first: function () { return v('first') ? '' : 'First name is required.'; },
      last: function () { return v('last') ? '' : 'Last name is required.'; },
      address1: function () { return v('address1').length >= 4 ? '' : 'Street address is required.'; },
      city: function () { return v('city') ? '' : 'City is required.'; },
      state: function () { return isUS() ? (v('state') ? '' : 'Choose your state.') : ''; },
      zip: function () { var z = v('zip'); if (!z) return 'ZIP / postal code is required.'; return isUS() ? (/^\d{5}(-\d{4})?$/.test(z) ? '' : 'Enter a 5-digit ZIP code.') : (z.length >= 3 ? '' : 'Enter a valid postal code.'); },
      cardName: function () { return method() !== 'card' || v('cardName').length >= 2 ? '' : 'Enter the name shown on the card.'; },
      cardNumber: function () {
        if (method() !== 'card') return '';
        var d = v('cardNumber').replace(/\D/g, ''), b = cardBrand(d);
        if (!d) return 'Card number is required.';
        if (!b) return 'We accept Visa, Mastercard, American Express, and Discover.';
        if ((b === 'AMEX' ? d.length !== 15 : d.length < 16) || !luhn(d)) return 'This card number is not valid. Please check it.';
        return '';
      },
      cardExp: function () {
        if (method() !== 'card') return '';
        var m = /^(\d{2})\/(\d{2})$/.exec(v('cardExp'));
        if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the format MM/YY.';
        var now = new Date(), y = 2000 + +m[2];
        if (y < now.getFullYear() || (y === now.getFullYear() && +m[1] < now.getMonth() + 1)) return 'This card has expired.';
        if (y > now.getFullYear() + 20) return 'Check the expiry year.';
        return '';
      },
      cardCvc: function () {
        if (method() !== 'card') return '';
        var need = cardBrand(v('cardNumber').replace(/\D/g, '')) === 'AMEX' ? 4 : 3;
        return v('cardCvc').length === need ? '' : 'Enter the ' + need + '-digit security code.';
      },
      terms: function () { return el.terms.checked ? '' : 'Please accept the terms and refund policy.'; },
      digital: function () { return el.digital.checked ? '' : 'Please confirm you understand delivery is digital.'; },
    };
    function setErr(n, msg) {
      var holder = form.querySelector('[data-field="' + n + '"]'), t = form.querySelector('[data-err="' + n + '"]');
      if (t) t.textContent = msg;
      if (holder) { holder.classList.toggle('invalid', !!msg); if (holder.classList.contains('fld')) holder.classList.toggle('valid', !msg && !!v(n)); }
      var input = el[n]; if (input && input.setAttribute) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function check(n) {
      var msg = rules[n] ? rules[n]() : ''; setErr(n, msg);
      if (!alertBox.hidden) { var left = form.querySelectorAll('.invalid').length; if (!left) alertBox.hidden = true; else alertBox.textContent = 'Please fix ' + left + (left === 1 ? ' field' : ' fields') + ' before placing your order.'; }
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var input = el[n]; if (!input || !input.addEventListener) return;
      var touched = false;
      input.addEventListener('blur', function () { touched = true; check(n); });
      input.addEventListener(input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'input', function () { if (touched || input.type === 'checkbox' || input.tagName === 'SELECT') check(n); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = totals();
      if (!t.count) { paint(); return; }
      var bad = Object.keys(rules).filter(function (n) { return !check(n); });
      if (bad.length) {
        alertBox.hidden = false;
        alertBox.textContent = bad.length === 1 ? 'Please fix 1 field before placing your order.' : 'Please fix ' + bad.length + ' fields before placing your order.';
        var first = el[bad[0]];
        var target = first && first.scrollIntoView ? first : form.querySelector('[data-field="' + bad[0] + '"]');
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { if (target.focus) target.focus({ preventScroll: true }); }, 350); }
        return;
      }
      alertBox.hidden = true;
      var btn = form.querySelector('[data-place]');
      btn.disabled = true; btn.innerHTML = 'Placing your order…';
      form.setAttribute('data-placing', '1');

      var m = method(), digits = v('cardNumber').replace(/\D/g, '');
      var now = new Date().toISOString(), id = orderId();
      var labels = { card: 'Credit / debit card', paypal: 'PayPal (payment request by email)', bank: 'Bank transfer (ACH) or Zelle' };
      var order = {
        id: id, createdAt: now, status: 'Pending', paymentStatus: 'Awaiting payment', currency: 'USD',
        items: t.cart.map(function (s) { var r = CAT[s]; return { slug: s, name: r.n, price: r.p, category: r.c, image: r.img, url: r.url }; }),
        subtotal: t.subtotal, coupon: t.discount ? t.code : '', discount: t.discount, total: t.total,
        customer: { email: v('email').toLowerCase(), phone: v('phone'), marketing: !!el.marketing.checked },
        billing: { first: v('first'), last: v('last'), company: v('company'), country: v('country'), address1: v('address1'), address2: v('address2'), city: v('city'), state: isUS() ? v('state') : v('region'), zip: v('zip').toUpperCase() },
        payment: { method: m, label: labels[m], brand: m === 'card' ? cardBrand(digits) : '', last4: m === 'card' ? digits.slice(-4) : '' },
        notes: v('notes'),
        history: [{ status: 'Pending', at: now, note: 'Order placed as guest. Awaiting payment confirmation.' }],
      };
      el.cardNumber.value = ''; el.cardCvc.value = ''; el.cardExp.value = '';
      var orders = getOrders(); orders.unshift(order);
      if (order.customer.marketing) { var fl = load(FORMS_KEY, []); fl.push({ type: 'newsletter', email: order.customer.email, page: 'checkout', at: now }); store(FORMS_KEY, fl); }
      setTimeout(function () {
        if (!store(ORD_KEY, orders)) { alertBox.hidden = false; alertBox.textContent = 'Your browser blocked saving the order. Please enable storage or email ' + INFO.orderEmail + '.'; btn.disabled = false; btn.textContent = 'Place order'; form.removeAttribute('data-placing'); return; }
        store(CART_KEY, []); store(CPN_KEY, '');
        location.href = 'order-confirmation.html?order=' + encodeURIComponent(id);
      }, 900);
    });
  }

  /* ---------- confirmation ---------- */
  function findOrder(id) { id = String(id || '').trim().toUpperCase(); var o = getOrders(); for (var i = 0; i < o.length; i++) if (o[i].id === id) return o[i]; return null; }
  function statusBadge(s, big) { return '<span class="status ' + String(s).toLowerCase() + (big ? ' big' : '') + '">' + esc(s) + '</span>'; }
  function payInstructions(o) {
    if (o.status === 'Cancelled') return 'This order was cancelled. No payment will be taken.';
    if (o.payment.method === 'card') return 'We verify your ' + esc(o.payment.brand || 'card') + ' ending in <b>' + esc(o.payment.last4) + '</b> and charge <b>' + money(o.total) + '</b> within one business hour. You will get a payment receipt by email.';
    if (o.payment.method === 'paypal') return 'Watch for a PayPal payment request for <b>' + money(o.total) + '</b> sent to <b>' + esc(o.customer.email) + '</b> within one business hour.';
    return 'Send <b>' + money(o.total) + '</b> by Zelle to <b>' + esc(INFO.zelle) + '</b> or by ACH using the details in your confirmation email. Use <b>' + esc(o.id) + '</b> as the payment reference.';
  }
  function itemsTable(o) {
    return o.items.map(function (it) { return '<div class="line-item"><img src="' + esc(it.image) + '" alt="" width="64" height="64"><div><b><a href="' + esc(it.url) + '">' + esc(it.name) + '</a></b><small>' + esc(it.category) + ' · recipe card (PDF)</small></div><div class="li-right"><span class="li-price">' + money(it.price) + '</span></div></div>'; }).join('') +
      '<div class="sum-lines"><div class="sum-line"><span>Subtotal</span><b>' + money(o.subtotal) + '</b></div>' +
      (o.discount ? '<div class="sum-line discount"><span>Discount <small>(' + esc(o.coupon) + ')</small></span><b>−' + money(o.discount) + '</b></div>' : '') +
      '<div class="sum-line"><span>Delivery</span><b class="ok-text">Free · by email</b></div><div class="sum-line total"><span>Total <small>USD</small></span><b>' + money(o.total) + '</b></div></div>';
  }
  var conf = $('[data-confirm]');
  if (conf) {
    var o = findOrder(new URLSearchParams(location.search).get('order'));
    if (o) {
      var b = o.billing, cancelled = o.status === 'Cancelled';
      document.title = 'Order ' + o.id + ' | ' + INFO.name;
      conf.innerHTML =
        '<div class="confirm-hero"><div class="confirm-tick">' + (cancelled ? '×' : INFO.check) + '</div><div><p class="kicker">' + (cancelled ? 'Order cancelled' : 'Thank you, ' + esc(b.first) + '!') + '</p><h1>' + (cancelled ? 'This order was cancelled' : 'Your order has been placed') + '</h1><p>Order <span class="order-id">' + esc(o.id) + '</span> · ' + esc(fmtDate(o.createdAt)) + ' · confirmation sent to <b>' + esc(o.customer.email) + '</b></p></div>' + statusBadge(o.status, true) + '</div>' +
        '<div class="confirm-grid"><div>' +
        (cancelled ? '' : '<div class="next-box"><b>What happens next:</b> your order is <b>Pending</b> until payment is confirmed. ' + payInstructions(o) + ' Your recipe cards are emailed as soon as payment clears.</div>') +
        '<div class="panel" style="margin-top:1.2rem"><h2>Order progress</h2><ol class="timeline">' +
        '<li class="done"><span class="dot">' + INFO.check + '</span><b>Order placed</b><small>' + esc(fmtDate(o.createdAt)) + ' · guest checkout</small></li>' +
        (cancelled ? '<li class="done"><span class="dot">×</span><b>Cancelled</b><small>' + esc(fmtDate(o.history[o.history.length - 1].at)) + ' · no payment taken</small></li>'
          : '<li class="now"><span class="dot"></span><b>Payment confirmation</b><small>' + esc(o.paymentStatus) + ' — ' + esc(o.payment.label) + '</small></li><li><span class="dot"></span><b>Recipe cards emailed</b><small>Printable PDF cards sent to ' + esc(o.customer.email) + '</small></li>') +
        '</ol></div>' +
        '<div class="panel"><h2>Items</h2>' + itemsTable(o) + '</div></div>' +
        '<div><div class="panel"><h2>Payment</h2><dl class="kv"><dt>Status</dt><dd>' + statusBadge(o.status) + '</dd><dt>Payment</dt><dd>' + esc(o.paymentStatus) + '</dd><dt>Method</dt><dd>' + esc(o.payment.label) + '</dd>' +
        (o.payment.last4 ? '<dt>Card</dt><dd>' + esc(o.payment.brand) + ' •••• ' + esc(o.payment.last4) + '</dd>' : '') + '<dt>Total</dt><dd>' + money(o.total) + ' USD</dd></dl>' +
        (o.payment.method === 'bank' && !cancelled ? '<div class="bank"><b>Zelle:</b> ' + esc(INFO.zelle) + '<br><b>Reference:</b> ' + esc(o.id) + '<br><small>ACH account details are in your confirmation email.</small></div>' : '') + '</div>' +
        '<div class="panel"><h2>Billing details</h2><dl class="kv"><dt>Name</dt><dd>' + esc(b.first + ' ' + b.last) + '</dd>' + (b.company ? '<dt>Company</dt><dd>' + esc(b.company) + '</dd>' : '') +
        '<dt>Address</dt><dd>' + esc(b.address1) + (b.address2 ? ', ' + esc(b.address2) : '') + '<br>' + esc(b.city) + ', ' + esc(b.state) + ' ' + esc(b.zip) + '<br>' + esc(b.country) + '</dd><dt>Email</dt><dd>' + esc(o.customer.email) + '</dd>' + (o.customer.phone ? '<dt>Phone</dt><dd>' + esc(o.customer.phone) + '</dd>' : '') + (o.notes ? '<dt>Notes</dt><dd>' + esc(o.notes) + '</dd>' : '') + '</dl></div>' +
        '<div class="confirm-actions"><button class="btn" type="button" onclick="window.print()">Print receipt</button><a class="btn outline dark" href="orders.html?order=' + encodeURIComponent(o.id) + '&email=' + encodeURIComponent(o.customer.email) + '">Track order</a><a class="btn outline dark" href="recipes.html">Continue shopping</a></div>' +
        '</div></div>';
    }
  }

  /* ---------- orders page ---------- */
  function orderCard(o) {
    return '<article class="order-card"><div class="oc-top"><div><b>' + esc(o.id) + '</b><br><small>' + esc(fmtDate(o.createdAt)) + ' · ' + o.items.length + (o.items.length === 1 ? ' card' : ' cards') + '</small></div>' + statusBadge(o.status) + '</div>' +
      '<div class="oc-items">' + o.items.map(function (it) { return '<img src="' + esc(it.image) + '" alt="' + esc(it.name) + '" title="' + esc(it.name) + '" width="48" height="48">'; }).join('') + '</div>' +
      '<div class="oc-foot"><span><b>' + money(o.total) + '</b> · ' + esc(o.paymentStatus) + '</span><div class="btns"><a class="btn small" href="order-confirmation.html?order=' + encodeURIComponent(o.id) + '">View details</a>' +
      (o.status === 'Pending' ? '<button class="btn small outline dark" type="button" data-cancel="' + esc(o.id) + '">Cancel order</button>' : '') + '</div></div></article>';
  }
  var oList = $('[data-order-list]');
  function paintOrders() {
    if (!oList) return;
    var all = getOrders();
    oList.innerHTML = all.map(orderCard).join('');
    var em = $('[data-order-empty]'); if (em) em.style.display = all.length ? 'none' : 'flex';
  }
  if (oList) {
    paintOrders();
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-cancel]'); if (!c) return;
      var id = c.getAttribute('data-cancel');
      if (!confirm('Cancel order ' + id + '? No payment will be taken.')) return;
      var all = getOrders(), now = new Date().toISOString();
      all.forEach(function (o) { if (o.id === id && o.status === 'Pending') { o.status = 'Cancelled'; o.paymentStatus = 'Not charged'; o.history.push({ status: 'Cancelled', at: now, note: 'Cancelled by customer.' }); } });
      setOrders(all); paintOrders(); runTrack(false); paintOrderNotes();
      toast('Order ' + esc(id) + ' cancelled.');
    });
  }
  var track = $('[data-track-form]');
  function runTrack(showMsg) {
    if (!track) return;
    var id = track.order.value.trim().toUpperCase(), em = track.email.value.trim().toLowerCase(), msg = $('[data-track-msg]'), res = $('[data-track-result]');
    if (!id && !em) return;
    if (!id || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { if (showMsg) { msg.textContent = 'Enter your order number and a valid email address.'; msg.className = 'form-msg err'; } return; }
    var o = findOrder(id);
    if (o && o.customer.email === em) { msg.textContent = 'Order found.'; msg.className = 'form-msg ok'; res.innerHTML = orderCard(o); }
    else { res.innerHTML = ''; msg.innerHTML = 'We could not find that order in this browser. Order receipts are stored on the device you ordered from — email <a href="mailto:' + INFO.orderEmail + '?subject=Order%20' + encodeURIComponent(id) + '">' + INFO.orderEmail + '</a> and we will look it up.'; msg.className = 'form-msg err'; }
  }
  if (track) {
    var qp = new URLSearchParams(location.search);
    if (qp.get('order')) track.order.value = qp.get('order');
    if (qp.get('email')) track.email.value = qp.get('email');
    track.addEventListener('submit', function (e) { e.preventDefault(); runTrack(true); });
    if (qp.get('order') && qp.get('email')) runTrack(true);
  }

  window.addEventListener('storage', function (e) { if (e.key === CART_KEY || e.key === CPN_KEY) paint(); if (e.key === ORD_KEY) paintOrders(); });
  paint();
})({"brown-butter-steel-cut-oats":{"n":"Brown Butter Steel-Cut Oats","p":0,"c":"Breakfast","img":"assets/img/brown-butter-steel-cut-oats.jpg","url":"recipe-brown-butter-steel-cut-oats.html"},"chicago-cinnamon-coffee-cake":{"n":"Chicago Cinnamon Coffee Cake","p":3.99,"c":"Breakfast","img":"assets/img/chicago-cinnamon-coffee-cake.jpg","url":"recipe-chicago-cinnamon-coffee-cake.html"},"mushroom-spinach-frittata":{"n":"Mushroom Spinach Frittata","p":0,"c":"Breakfast","img":"assets/img/mushroom-spinach-frittata.jpg","url":"recipe-mushroom-spinach-frittata.html"},"savory-cheddar-biscuits":{"n":"Savory Cheddar Chive Biscuits","p":2.99,"c":"Breakfast","img":"assets/img/savory-cheddar-biscuits.jpg","url":"recipe-savory-cheddar-biscuits.html"},"maple-pecan-french-toast-bake":{"n":"Maple Pecan French Toast Bake","p":4.99,"c":"Breakfast","img":"assets/img/maple-pecan-french-toast-bake.jpg","url":"recipe-maple-pecan-french-toast-bake.html"},"chicago-italian-beef":{"n":"Chicago Italian Beef Sandwich","p":4.99,"c":"Mains","img":"assets/img/chicago-italian-beef.jpg","url":"recipe-chicago-italian-beef.html"},"chicago-deep-dish-pizza":{"n":"Chicago Deep-Dish Pizza","p":5.99,"c":"Mains","img":"assets/img/chicago-deep-dish-pizza.jpg","url":"recipe-chicago-deep-dish-pizza.html"},"giardiniera-chicken-skillet":{"n":"Giardiniera Chicken Skillet","p":3.99,"c":"Mains","img":"assets/img/giardiniera-chicken-skillet.jpg","url":"recipe-giardiniera-chicken-skillet.html"},"creamy-tomato-basil-soup":{"n":"Creamy Tomato Basil Soup","p":0,"c":"Mains","img":"assets/img/creamy-tomato-basil-soup.jpg","url":"recipe-creamy-tomato-basil-soup.html"},"chicago-tavern-burger":{"n":"Chicago Tavern Smash Burger","p":3.99,"c":"Mains","img":"assets/img/chicago-tavern-burger.jpg","url":"recipe-chicago-tavern-burger.html"},"roasted-garlic-chicken-thighs":{"n":"Roasted Garlic Chicken Thighs","p":0,"c":"Mains","img":"assets/img/roasted-garlic-chicken-thighs.jpg","url":"recipe-roasted-garlic-chicken-thighs.html"},"jibarito-plantain-sandwich":{"n":"Jibarito Plantain Sandwich","p":4.99,"c":"Mains","img":"assets/img/jibarito-plantain-sandwich.jpg","url":"recipe-jibarito-plantain-sandwich.html"},"smoked-whitefish-spread":{"n":"Lake Michigan Smoked Whitefish Spread","p":3.99,"c":"Seafood","img":"assets/img/smoked-whitefish-spread.jpg","url":"recipe-smoked-whitefish-spread.html"},"pan-seared-trout":{"n":"Pan-Seared Trout with Lemon","p":0,"c":"Seafood","img":"assets/img/pan-seared-trout.jpg","url":"recipe-pan-seared-trout.html"},"shrimp-de-jonghe":{"n":"Chicago Shrimp De Jonghe","p":5.99,"c":"Seafood","img":"assets/img/shrimp-de-jonghe.jpg","url":"recipe-shrimp-de-jonghe.html"},"chicago-giardiniera":{"n":"Homemade Chicago Giardiniera","p":0,"c":"Sides","img":"assets/img/chicago-giardiniera.jpg","url":"recipe-chicago-giardiniera.html"},"crispy-potato-wedges":{"n":"Crispy Oven Potato Wedges","p":0,"c":"Sides","img":"assets/img/crispy-potato-wedges.jpg","url":"recipe-crispy-potato-wedges.html"},"roasted-asparagus-parmesan":{"n":"Roasted Asparagus with Parmesan","p":0,"c":"Sides","img":"assets/img/roasted-asparagus-parmesan.jpg","url":"recipe-roasted-asparagus-parmesan.html"},"cheddar-chive-cornbread":{"n":"Cheddar Chive Skillet Cornbread","p":2.99,"c":"Sides","img":"assets/img/cheddar-chive-cornbread.jpg","url":"recipe-cheddar-chive-cornbread.html"},"chicago-style-cheesecake":{"n":"Chicago-Style Baked Cheesecake","p":4.99,"c":"Desserts","img":"assets/img/chicago-style-cheesecake.jpg","url":"recipe-chicago-style-cheesecake.html"},"flourless-chocolate-cake":{"n":"Flourless Chocolate Cake","p":0,"c":"Desserts","img":"assets/img/flourless-chocolate-cake.jpg","url":"recipe-flourless-chocolate-cake.html"},"caramel-apple-hand-pies":{"n":"Caramel Apple Hand Pies","p":3.99,"c":"Desserts","img":"assets/img/caramel-apple-hand-pies.jpg","url":"recipe-caramel-apple-hand-pies.html"},"oatmeal-raisin-cookies":{"n":"Chewy Oatmeal Raisin Cookies","p":0,"c":"Desserts","img":"assets/img/oatmeal-raisin-cookies.jpg","url":"recipe-oatmeal-raisin-cookies.html"}}, {"WELCOME10":{"type":"percent","value":10,"min":0,"label":"10% off your first order"},"MOSS5":{"type":"fixed","value":5,"min":15,"label":"$5 off orders of $15 or more"},"MILL20":{"type":"percent","value":20,"min":20,"label":"20% off orders of $20 or more"}}, {"name":"Moss & Mill","orderEmail":"orders@mossandmill.com","zelle":"payments@mossandmill.com","check":"<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" aria-hidden=\"true\"><path d=\"M5 12.5l4.2 4.2L19 7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>","trash":"<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" aria-hidden=\"true\"><path d=\"M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>","tag":"<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" aria-hidden=\"true\"><path d=\"M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.2 6.2a1.5 1.5 0 0 1-2.1 0z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linejoin=\"round\"/><circle cx=\"8\" cy=\"8\" r=\"1.6\" fill=\"currentColor\"/></svg>"});
