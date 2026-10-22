
/* ==========================================================================
   MediAura — progressive enhancement only.
   Everything renders and reads without JS; this adds scroll polish.
   ========================================================================== */
(function(){
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- sticky header + scroll progress ---------- */
  var hdr = doc.getElementById('hdr');
  var prog = doc.getElementById('prog');
  var attract = doc.getElementById('attract');
  var ticking = false;

  function onScroll(){
    var y = window.pageYOffset || root.scrollTop || 0;
    hdr.classList.toggle('is-stuck', y > 16);

    /* the entrance splash owns the first screen — no site chrome over it */
    var showUI = true;
    if(attract){
      var eh = attract.offsetHeight || 0;
      showUI = (eh <= 240) || (y >= eh - 120);
    }
    hdr.classList.toggle('is-visible', showUI);
    prog.classList.toggle('is-visible', showUI);

    var max = doc.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; window.requestAnimationFrame(onScroll); }
  }, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  onScroll();

  /* ---------- mobile drawer ---------- */
  var burger = doc.getElementById('burger');
  var drawer = doc.getElementById('drawer');

  function setMenu(open){
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.classList.toggle('is-open', open);
    doc.body.style.overflow = open ? 'hidden' : '';
  }
  if(burger && drawer){
    drawer.hidden = false;
    burger.addEventListener('click', function(){
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function(e){
      if(e.target === drawer || e.target.tagName === 'A'){ setMenu(false); }
    });
    doc.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true'){ setMenu(false); burger.focus(); }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = [].slice.call(doc.querySelectorAll('.reveal, .reveal-x'));

  if(reduce || !hasIO){
    revealables.forEach(function(el){ el.classList.add('is-in'); });
  }else{
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, {rootMargin:'0px 0px -6% 0px', threshold:0.06});
    revealables.forEach(function(el){ io.observe(el); });

    /* anything already on screen shows immediately (no flash of hidden content) */
    window.setTimeout(function(){
      revealables.forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.top < window.innerHeight && r.bottom > 0){ el.classList.add('is-in'); io.unobserve(el); }
      });
    }, 60);
  }

  /* ---------- stat counters ---------- */
  var stats = doc.getElementById('stats');
  if(stats){
    var nums = [].slice.call(stats.querySelectorAll('[data-count]'));
    var finish = function(n){
      n.textContent = n.getAttribute('data-count') + (n.getAttribute('data-suffix') || '');
    };
    var count = function(n, delay){
      /* fixed-format values like "24/7" must not tick through "12/7" */
      if((n.getAttribute('data-suffix') || '') === '/7'){
        window.setTimeout(function(){ finish(n); }, delay);
        return;
      }
      window.setTimeout(function(){
        var target = parseInt(n.getAttribute('data-count'), 10) || 0;
        var suffix = n.getAttribute('data-suffix') || '';
        var t0 = null;
        var dur = 1300;
        function step(ts){
          if(t0 === null){ t0 = ts; }
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          n.textContent = Math.round(target * eased) + suffix;
          if(p < 1){ window.requestAnimationFrame(step); }
        }
        window.requestAnimationFrame(step);
      }, delay);
    };
    var startStats = function(){
      nums.forEach(function(n, i){ count(n, reduce ? 0 : i * 110); });
    };

    if(reduce || !hasIO){
      nums.forEach(finish);
    }else{
      var sio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ startStats(); sio.disconnect(); }
        });
      }, {threshold:0.35});
      sio.observe(stats);
      window.setTimeout(function(){
        var r = stats.getBoundingClientRect();
        if(r.top < window.innerHeight && r.bottom > 0){ startStats(); sio.disconnect(); }
      }, 1200);
    }
  }

  /* ---------- FAQ: only one panel open at a time ---------- */
  var accordions = [].slice.call(doc.querySelectorAll('.acc'));
  accordions.forEach(function(acc){
    acc.addEventListener('toggle', function(e){
      var el = e.target;
      if(el.tagName !== 'DETAILS' || !el.open){ return; }
      [].slice.call(acc.querySelectorAll('details[open]')).forEach(function(other){
        if(other !== el){ other.open = false; }
      });
    }, true);
  });

  /* ---------- newsletter (demo only) ---------- */
  var form = doc.getElementById('newsForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var input = form.querySelector('input');
      var note = doc.getElementById('newsNote');
      if(!input.value || input.value.indexOf('@') < 0){
        note.textContent = 'Please enter a valid email address.';
        input.focus();
        return;
      }
      form.style.display = 'none';
      note.textContent = 'Thanks — check your inbox to confirm your subscription.';
    });
  }

  /* ---------- online booking (demo only: confirms in-page, no backend) ---------- */
  var book = doc.getElementById('bookForm');
  if(book){
    var bookDate = book.querySelector('input[type=date]');
    if(bookDate){ bookDate.min = new Date().toISOString().slice(0,10); }
    book.addEventListener('submit', function(e){
      e.preventDefault();
      var data = new FormData(book);
      var ref = 'MA-' + String(Date.now()).slice(-6);
      lastRef = ref;
      var when = (data.get('date') || 'next available day') + ' at ' + (data.get('time') || 'the first free slot');
      var dept = data.get('dept') || 'Consultation';
      var who = data.get('name') ? ' for ' + data.get('name') : '';
      var note = doc.getElementById('bookDone');
      note.textContent = 'Booked online - reference ' + ref + '. ' + dept + ' on ' + when + who +
        '. We will text a confirmation within 15 minutes; call +1 (800) 555-0123 to change it.';
      book.classList.add('is-done');
    });

    /* ---------- cancel / re-book ---------- */
    var bookNote  = doc.getElementById('bookDone');
    var cancelBtn = doc.getElementById('bookCancel');
    var againBtn  = doc.getElementById('bookAgain');
    var lastRef   = '';

    if(cancelBtn){
      cancelBtn.addEventListener('click', function(){
        if(bookNote){
          bookNote.textContent = 'Appointment ' + lastRef + ' has been cancelled. Nothing to pay - '
            + 'when you are ready, pick a new slot below.';
        }
        book.classList.add('is-cancelled');
        if(againBtn){ againBtn.focus(); }
      });
    }
    if(againBtn){
      againBtn.addEventListener('click', function(){
        book.classList.remove('is-done');
        book.classList.remove('is-cancelled');
        book.reset();
        if(bookNote){ bookNote.textContent = ''; }
        var first = book.querySelector('input');
        if(first){ first.focus(); }
      });
    }

    /* ---------- booking popup open / close ---------- */
    var bookModal = doc.getElementById('bookModal');

    function openBook(){
      if(!bookModal){ return; }
      bookModal.classList.add('is-open');
      bookModal.setAttribute('aria-hidden', 'false');
      doc.body.classList.add('book-open');
      var first = book.querySelector('input');
      if(first){ first.focus(); }
    }

    function closeBook(){
      if(!bookModal){ return; }
      bookModal.classList.remove('is-open');
      bookModal.setAttribute('aria-hidden', 'true');
      doc.body.classList.remove('book-open');
      book.classList.remove('is-done');
      book.classList.remove('is-cancelled');
      book.reset();
      if(bookNote){ bookNote.textContent = ''; }
    }

    [].slice.call(doc.querySelectorAll('[data-book-open]')).forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        openBook();
      });
    });
    [].slice.call(doc.querySelectorAll('[data-book-close]')).forEach(function(btn){
      btn.addEventListener('click', closeBook);
    });
    doc.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && bookModal && bookModal.classList.contains('is-open')){
        closeBook();
      }
    });
  }

  /* ---------- back to top (footer arrow + floating button) ---------- */
  var toTop = doc.getElementById('toTop');
  var footTop = doc.getElementById('footTop');
  if(toTop || footTop){
    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
    var goTop = function(){
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var skip = doc.querySelector('.skip');
      if(skip){ skip.focus({ preventScroll: true }); }
    };
    if(toTop){
      var footArrowSeen = false;
      var toggleTop = function(){
        var y = window.pageYOffset || root.scrollTop || 0;
        toTop.classList.toggle('is-visible', y > 600 && !footArrowSeen);
      };
      window.addEventListener('scroll', toggleTop, {passive:true});
      /* once the footer's own arrow is on screen, hide the floating one */
      if(footTop && 'IntersectionObserver' in window){
        new IntersectionObserver(function(entries){
          footArrowSeen = entries[0].isIntersecting;
          toggleTop();
        }, { threshold: 0.4 }).observe(footTop);
      }
      toggleTop();
    }
    [toTop, footTop].filter(Boolean).forEach(function(btn){
      btn.addEventListener('click', goTop);
    });
  }

  /* ---------- footer backdrop video: play only while visible ---------- */
  var footVid = doc.querySelector('.foot__video');
  if(footVid){
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
    var skipFootVideo = saveData || reducedMotion;

    if(skipFootVideo){
      /* keep the poster frame — no decode cost, no autoplay */
      footVid.autoplay = false;
      footVid.removeAttribute('autoplay');
      footVid.pause();
    }

    if(!skipFootVideo && 'IntersectionObserver' in window){
      var footIO = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            var p = footVid.play();
            if(p && p.catch){ p.catch(function(){}); }
          } else if(!footVid.paused){
            footVid.pause();
          }
        });
      }, { threshold: 0.05 });
      footIO.observe(footVid.closest('.foot') || footVid);
    }
  }

  /* ---------- in-page links close the menu and respect reduced motion ---------- */
  root.classList.add('ready');
})();
