
/* ==========================================================================
   Entrance — plays exactly once, never again on resize.
   ========================================================================== */
(function(){
  'use strict';

  var root = document.documentElement;

  function releaseEntrance(){
    root.classList.remove('entry-pending');
    if(window.__entryFallback){
      clearTimeout(window.__entryFallback);
      window.__entryFallback = null;
    }
  }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(reduced || !Element.prototype || typeof Element.prototype.animate !== 'function'){
    releaseEntrance();
    return;
  }

  var ease     = 'cubic-bezier(.16,1,.3,1)';
  var softEase = 'cubic-bezier(.22,1,.36,1)';
  var compact  = window.matchMedia('(max-width:699px)').matches;

  var cardFrom = compact ? 'translateY(14px)' : 'translateY(12px) scale(.988)';
  var hlFrom   = compact ? 12 : 16;

  var steps = [
    ['.card',        40,  820, ease,     {opacity:0, transform:cardFrom}],
    ['#hl1',        240,  760, ease,     {opacity:0, transform:'translateY('+hlFrom+'px)', clipPath:'inset(100% 0 0 0)'}],
    ['#hl2',        330,  760, ease,     {opacity:0, transform:'translateY('+hlFrom+'px)', clipPath:'inset(100% 0 0 0)'}],
    ['#pitch',      470,  700, ease,     {opacity:0, transform:'translateY(10px)'}]
  ];

  var animations = [];

  function schedule(){
    for(var i=0;i<steps.length;i++){
      var s = steps[i];
      var el = document.querySelector(s[0]);
      if(!el){ continue; }
      var to = {opacity:1, transform:'none'};
      if(s[4].clipPath){ to.clipPath = 'inset(0 0 0 0)'; }
      animations.push(el.animate([s[4], to], {
        delay:s[1],
        duration:s[2],
        easing:s[3],
        fill:'both'
      }));
    }
    /* the animation layer now owns the hidden first frame */
    root.classList.remove('entry-pending');

    Promise.allSettled(animations.map(function(a){ return a.finished; })).then(function(){
      for(var j=0;j<animations.length;j++){ animations[j].cancel(); }
      animations.length = 0;
      releaseEntrance();
    });
  }

  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  Promise.race([
    fontsReady,
    new Promise(function(resolve){ setTimeout(resolve, 300); })
  ]).catch(function(){
    return null;
  }).then(function(){
    requestAnimationFrame(function(){
      requestAnimationFrame(schedule);
    });
  });
})();
