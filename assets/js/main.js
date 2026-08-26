(function(){
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* headline palavra a palavra */
  function split(el){
    var frag = document.createDocumentFragment(), i = 0;
    function walk(node, target){
      Array.prototype.forEach.call(node.childNodes, function(n){
        if (n.nodeType === 3){
          n.textContent.split(/(\s+)/).forEach(function(t){
            if (!t) return;
            if (/^\s+$/.test(t)) { target.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'word';
            var inner = document.createElement('i');
            inner.textContent = t;
            inner.style.setProperty('--wd', (i++ * 42) + 'ms');
            w.appendChild(inner); target.appendChild(w);
          });
        } else if (n.nodeType === 1){
          var clone = n.cloneNode(false); walk(n, clone); target.appendChild(clone);
        }
      });
    }
    walk(el, frag);
    el.textContent = ''; el.appendChild(frag);
  }
  if (!reduz) document.querySelectorAll('[data-split]').forEach(split);

  var alvos = document.querySelectorAll('.reveal, .rise, [data-split]');
  if (reduz || !('IntersectionObserver' in window)) {
    alvos.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('is-in'); obs.unobserve(e.target); }
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -5% 0px'});
    alvos.forEach(function(el){ obs.observe(el); });
  }

  var header = document.getElementById('header'),
      dock   = document.getElementById('dock'),
      bar    = document.getElementById('progress'),
      hero   = document.querySelector('.hero'),
      oferta = document.getElementById('oferta'),
      shot   = document.querySelector('[data-parallax]'),
      tl     = document.getElementById('timeline'),
      fill   = document.getElementById('tlfill'),
      tick   = false;

  function onScroll(){
    var y = window.pageYOffset,
        h = document.documentElement.scrollHeight - window.innerHeight,
        passouHero = y > (hero ? hero.offsetHeight * 0.7 : 600);

    if (header) header.classList.toggle('is-visible', passouHero);
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';

    if (dock && oferta){
      var oTop = oferta.getBoundingClientRect().top + y;
      dock.classList.toggle('is-visible', passouHero && y < oTop - window.innerHeight);
    }
    if (shot && !reduz){
      var r = shot.getBoundingClientRect(),
          p = Math.min(Math.max(1 - r.top / window.innerHeight, 0), 1);
      shot.style.transform = 'perspective(1600px) rotateX(' + (6 - p * 6).toFixed(2) + 'deg)';
    }
    if (tl && fill && !reduz){
      var tr = tl.getBoundingClientRect(),
          prog = Math.min(Math.max((window.innerHeight * 0.65 - tr.top) / tr.height, 0), 1);
      fill.style.height = (prog * (tr.height - 24)) + 'px';
    }
    tick = false;
  }
  function req(){ if (!tick){ tick = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', req, {passive:true});
  window.addEventListener('resize', req);
  onScroll();

  document.querySelectorAll('[data-count]').forEach(function(el){
    var alvo = parseInt(el.dataset.count, 10);
    var fmt = function(n){ return n.toLocaleString('pt-BR'); };
    if (reduz || !('IntersectionObserver' in window)){ el.textContent = fmt(alvo); return; }
    new IntersectionObserver(function(entries, o){
      if (!entries[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function step(t){
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = fmt(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, {threshold: 0.5}).observe(el);
  });

  /* lightbox dos prints */
  var lb = document.getElementById('lb'),
      lbImg = document.getElementById('lbImg'),
      lbClose = document.getElementById('lbClose'),
      ultimo = null;
  function abrir(img){
    ultimo = img.closest('.proof__btn');
    lbImg.src = img.src; lbImg.alt = img.alt;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function fechar(){
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    lbImg.src = '';
    if (ultimo) ultimo.focus();
  }
  document.querySelectorAll('.proof__btn').forEach(function(btn){
    btn.addEventListener('click', function(){ abrir(btn.querySelector('img')); });
  });
  if (lb){
    lbClose.addEventListener('click', fechar);
    lb.addEventListener('click', function(e){ if (e.target === lb) fechar(); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && lb.classList.contains('is-open')) fechar();
    });
  }

  document.querySelectorAll('.acc').forEach(function(acc){
    var itens = acc.querySelectorAll('details');
    itens.forEach(function(d){
      d.addEventListener('toggle', function(){
        if (!d.open) return;
        itens.forEach(function(o){ if (o !== d) o.open = false; });
      });
    });
  });
})();
