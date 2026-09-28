
/* ==========================================================================
   Responsive engine — one IIFE owns layout, three modes:
     land     >=700px and landscape-ish  (the base composition)
     tabport  >=700px and portrait       (masthead band + full-measure card)
     phone    <700px                     (document flow, no viewport scaling)
   ========================================================================== */
(function(){
  'use strict';

  var REF_W=1464, REF_H=949, PHOTO_W=836, PANE_W=628, CARD_W=613, CARD_H=922;
  var CONTENT_H=697;                      /* form block + breathing room, reference px */
  var IMG_W=1177, IMG_H=1336, IMG_REF_SCALE=836/1177;
  var PANE_RATIO=PANE_W/REF_W;
  var HERO_W=681, HERO_H=219;             /* hero block extents, reference px */
  var REF_CARD_ASPECT=692/855;
  var RAMP_HI=1280, RAMP_LO=1000, PHOTO_MIN=0.42;
  var RAMP_LO2=820, PHOTO_MIN2=0.36;
  /* btFs (0.02876) and heroFs (0.1058) are both kept as their own keys. */
  var TP={"pad":0.1076,"h1Top":0.08656,"h1Fs":0.06839,"subTop":0.17368,"subFs":0.0309,"emTop":0.25435,"emH":0.10257,"emR":0.0202,"ephFs":0.02702,"ephPad":0.0332,"pwTop":0.36851,"pwH":0.10839,"btnTop":0.50435,"btnH":0.10981,"btnFs":0.0275,"arrow":0.026,"btnGap":0.02,"divTop":0.68222,"orFs":0.02245,"orPad":0.051,"divH":0.0026,"gTop":0.76445,"gH":0.09966,"gIcon":0.032,"gtFs":0.03205,"gGap":0.026,"btTop":0.89668,"btFs":0.02876,"heroFs":0.1058,"badgeH":0.0742,"heroLh":1.1246,"heroBot":0.06493,"heroGap":-0.30423,"heroSide":0.0525};

  var mqLandscape = window.matchMedia('(min-width:700px) and (min-aspect-ratio:51/50)');
  var mqPortrait  = window.matchMedia('(min-width:700px) and (max-aspect-ratio:51/50)');

  var root = document.documentElement;
  var stage = document.getElementById('attract');
  var body = document.body;   /* only the scratch measure host */
  var photo = stage.querySelector('.photo');
  var pane  = stage.querySelector('.pane');
  var card  = document.getElementById('card');
  var cardIn= document.getElementById('cardIn');
  var hero  = document.getElementById('hero');
  var hl1   = document.getElementById('hl1');

  var mode = null;

  function setPx(el,name,value){ el.style.setProperty(name, (Math.round(value*100)/100)+'px'); }
  function kebab(s){ return s.replace(/[A-Z]/g, function(c){ return '-'+c.toLowerCase(); }); }

  /* Inline styles outrank the stylesheet: wipe before a mode can change. */
  function clearInline(){
    photo.style.cssText='';
    pane.style.cssText='';
    card.style.cssText='';
    cardIn.style.cssText='';
    hero.style.cssText='';
  }

  function setMode(m){
    if(mode===m){ return; }
    mode=m;
    clearInline();
    stage.classList.remove('land','tabport','stacked');
    stage.classList.add(m==='phone' ? 'stacked' : m);
  }

  /* Modes read the stage's own box: the document scrolls, so the window
     width includes a scrollbar the composition does not sit under. */
  function stageBox(){
    var r = stage.getBoundingClientRect();
    return {
      w: Math.round(r.width)  || document.documentElement.clientWidth,
      h: Math.round(r.height) || document.documentElement.clientHeight
    };
  }
  function pickMode(){
    var b = stageBox();
    if(b.w < 700){ return 'phone'; }
    return (b.w / b.h >= 51/50) ? 'land' : 'tabport';
  }

  /* Photo column width as a fraction of the frame: 57.1% at >=1280,
     easing linearly to .42 by 1000 and .36 by 820. Continuous, no jump. */
  function photoRatio(vw){
    var t;
    if(vw>=RAMP_HI){ return 1-PANE_RATIO; }
    if(vw>=RAMP_LO){
      t=(RAMP_HI-vw)/(RAMP_HI-RAMP_LO);
      return (1-PANE_RATIO)+t*(PHOTO_MIN-(1-PANE_RATIO));
    }
    if(vw>=RAMP_LO2){
      t=(RAMP_LO-vw)/(RAMP_LO-RAMP_LO2);
      return PHOTO_MIN+t*(PHOTO_MIN2-PHOTO_MIN);
    }
    return PHOTO_MIN2;
  }

  function placeCard(paneW, vh){
    var cs = Math.min(paneW/PANE_W, vh/CONTENT_H);
    var gapL = 1*cs, mT = 14*cs, mB = 13*cs, mR = 14*cs;
    var cw = Math.max(CARD_W*cs, paneW-gapL-mR);
    var ch = vh-mT-mB;

    card.style.left = gapL+'px';
    card.style.top = mT+'px';
    card.style.width = cw+'px';
    card.style.height = ch+'px';
    card.style.setProperty('--cs', String(cs));

    /* the interior is scaled, never re-measured */
    cardIn.style.left = '0px';
    cardIn.style.top = '0px';
    cardIn.style.transform = 'translate('+((cw-CARD_W*cs)/2)+'px,0) scale('+cs+')';
  }

  function seatHero(photoW, vh){
    var imgScale = Math.max(photoW/IMG_W, vh/IMG_H);
    var s = Math.min(imgScale/IMG_REF_SCALE, photoW*0.92/HERO_W);
    hero.style.transform = 'scale('+s+')';
  }

  function land(vw, vh){
    var r = photoRatio(vw);
    var pct = (r*100).toFixed(4)+'%';
    photo.style.width = pct;
    pane.style.left = pct;
    var photoW = vw*r;
    placeCard(vw-photoW, vh);
    seatHero(photoW, vh);
  }

  /* Width of the full headline at its current (band-derived) size. */
  function headlineMeasure(){
    var cs = getComputedStyle(hl1);
    var m = document.createElement('span');
    m.textContent = 'Find Signal to Action Instantly';
    m.style.position = 'absolute';
    m.style.left = '-10000px';
    m.style.top = '0';
    m.style.visibility = 'hidden';
    m.style.whiteSpace = 'nowrap';
    m.style.fontFamily = cs.fontFamily;
    m.style.fontSize = cs.fontSize;
    m.style.fontWeight = cs.fontWeight;
    m.style.letterSpacing = cs.letterSpacing;
    m.style.wordSpacing = cs.wordSpacing;
    m.style.fontVariationSettings = cs.fontVariationSettings;
    body.appendChild(m);
    var w = m.getBoundingClientRect().width;
    body.removeChild(m);
    return w;
  }

  /* Keys whose base is the card's own measure. */
  var VKEYS = {h1Top:1,subTop:1,emTop:1,emH:1,pwTop:1,pwH:1,btnTop:1,btnH:1,divTop:1,divH:1,gTop:1,gH:1,btTop:1};
  var WKEYS = {pad:1,orPad:1,ephPad:1};
  var BKEYS = {heroFs:1,heroLh:1,heroBot:1,heroGap:1,heroSide:1,badgeH:1};

  function tabport(vw, vh){
    var band   = Math.round(vh*0.425);
    var side   = Math.round(vw*0.0525);
    var footer = Math.round(vh*0.0297);
    var cardW  = Math.max(1, vw-side*2);
    var cardH  = Math.max(1, vh-band-footer);
    var S      = Math.min(cardH, cardW*REF_CARD_ASPECT);

    stage.style.setProperty('--band-h', band+'px');
    stage.style.setProperty('--tp-side', side+'px');
    stage.style.setProperty('--tp-footer', footer+'px');

    /* hero + badge keys ride the band */
    setPx(hero,'--tp-hero-fs', band*TP.heroFs);
    hero.style.setProperty('--tp-hero-lh', String(TP.heroLh));
    setPx(hero,'--tp-hero-bot', band*TP.heroBot);
    setPx(hero,'--tp-hero-gap', band*TP.heroGap);   /* deliberately negative */
    setPx(hero,'--tp-hero-side', side);
    setPx(hero,'--tp-badge-h', band*TP.badgeH);
    setPx(hero,'--tp-headline-measure', Math.round(headlineMeasure()*0.61));

    /* interior keys: verticals off cardH, pads off cardW, the rest off S */
    for(var k in TP){
      if(!Object.prototype.hasOwnProperty.call(TP,k)){ continue; }
      if(Object.prototype.hasOwnProperty.call(BKEYS,k)){ continue; }
      var v = VKEYS[k] ? cardH*TP[k] : (WKEYS[k] ? cardW*TP[k] : S*TP[k]);
      setPx(cardIn,'--tp-'+kebab(k), v);
    }
  }

  function layout(){
    var box = stageBox();
    var vw = box.w;
    var vh = box.h;
    var m = pickMode();
    if(m==='phone'){ setMode('phone'); return; }
    setMode(m);
    if(m==='land'){ land(vw, vh); } else { tabport(vw, vh); }
  }

  window.addEventListener('resize', layout, {passive:true});
  window.addEventListener('orientationchange', layout);
  if(mqLandscape.addEventListener){
    mqLandscape.addEventListener('change', layout);
    mqPortrait.addEventListener('change', layout);
  }else if(mqLandscape.addListener){
    mqLandscape.addListener(layout);
    mqPortrait.addListener(layout);
  }
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(layout); }
  layout();
})();
