document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =============================================
  // Navbar Hide/Show
  // =============================================
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  if (navbar) {
    window.addEventListener('scroll', () => {
      const curr = window.pageYOffset;
      if (curr > 100) {
        navbar.classList.toggle('hidden', curr > lastScroll);
      } else {
        navbar.classList.remove('hidden');
      }
      lastScroll = curr;
    }, { passive: true });
  }

  // =============================================
  // Mobile Toggle
  // =============================================
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // =============================================
  // Text Morph — cycling blur/scale animation
  // =============================================
  function initTextMorph(el, words, opts) {
    opts = opts || {};
    var morph = Math.max(0.1, opts.morph || 0.8);
    var hold = Math.max(0, opts.hold || 2);
    var color = opts.color || "";
    var ease = opts.ease || "ease-in-out";
    var id = "tm-" + Math.random().toString(36).slice(2, 8);
    var filterId = "tm-thr-" + id;
    var animName = "tm-rot-" + id;
    var count = Math.max(1, words.length);
    var slot = morph + hold;
    var cycle = slot * count;
    function pct(s) { return Math.min(100, (s / cycle) * 100).toFixed(4); }
    var mIn = pct(morph);
    var mHold = pct(morph + hold);
    var mOut = pct(2 * morph + hold);

    var style = document.createElement("style");
    style.textContent = "@keyframes " + animName + "{0%{opacity:0;filter:blur(16px);transform:translate(-50%,-50%) scale(.85)}" + mIn + "%{opacity:1;filter:blur(0);transform:translate(-50%,-50%) scale(1)}" + mHold + "%{opacity:1;filter:blur(0);transform:translate(-50%,-50%) scale(1)}" + mOut + "%,100%{opacity:0;filter:blur(16px);transform:translate(-50%,-50%) scale(1.15)}}";
    document.head.appendChild(style);

    if (!document.getElementById(filterId)) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "position:absolute;width:0;height:0;pointer-events:none");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = "<defs><filter id=\"" + filterId + "\"><feColorMatrix in=\"SourceGraphic\" type=\"matrix\" values=\"1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 25 -9\" result=\"goo\"/><feComposite in=\"SourceGraphic\" in2=\"goo\" operator=\"atop\"/></filter></defs>";
      document.body.appendChild(svg);
    }

    var longest = words.reduce(function(a, b) { return a.length > b.length ? a : b; }, "");
    el.style.position = "relative";
    el.style.display = "flex";
    el.style.justifyContent = "center";
    el.style.alignItems = "center";
    el.style.overflow = "hidden";
    el.style.filter = "url(#" + filterId + ")";

    var inner = document.createElement("div");
    inner.style.cssText = "position:relative;display:inline-flex;justify-content:center;align-items:center;line-height:.9;min-height:1em;";

    var anchor = document.createElement("span");
    anchor.style.cssText = "visibility:hidden;white-space:nowrap;display:inline-block;";
    anchor.textContent = longest || " ";
    inner.appendChild(anchor);

    for (var i = 0; i < count; i++) {
      (function(word, idx) {
        var span = document.createElement("span");
        span.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0;white-space:nowrap;animation:" + animName + " " + cycle + "s " + (slot * idx).toFixed(3) + "s infinite " + ease + ";will-change:opacity,filter,transform";
        if (color) span.style.color = color;
        span.textContent = word;
        inner.appendChild(span);
      })(words[i], i);
    }

    el.textContent = "";
    el.appendChild(inner);
  }

  var heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    initTextMorph(heroTitle, [
      "The Ukraine War",
      "The Invasion",
      "The Resistance",
      "The Reckoning",
      "The Legacy"
    ], { color: "var(--accent2)", morph: 0.8, hold: 2 });
  }

  // =============================================
  // Questions (Accordion)
  // =============================================
  document.querySelectorAll('.question-card').forEach(card => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');
      document.querySelectorAll('.question-card.active').forEach(c => c.classList.remove('active'));
      if (!wasActive) card.classList.add('active');
    });
  });

  // =============================================
  // Animations (reduced-motion aware)
  // =============================================
  if (!prefersReduced) {

    // --- Progress Bar ---
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      function updateProgress() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight) * 100 + '%' : '0%';
      }
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }

    // --- Hero Fade-In (double rAF to ensure CSS transitions fire) ---
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        document.querySelector('.hero-content')?.classList.add('hero-revealed');
      });
    });

    // --- Intersection Observer for scroll-triggered reveals ---
    function observeTargets(selector, opts) {
      var els = document.querySelectorAll(selector);
      if (!els.length) return;
      opts = opts || {};
      var rootMargin = opts.rootMargin || '0px 0px -100px 0px';
      var stagger = opts.stagger || 0;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            if (stagger) {
              var siblings = entry.target.parentElement.querySelectorAll(selector);
              var idx = Array.prototype.indexOf.call(siblings, entry.target);
              entry.target.style.transitionDelay = (idx * stagger) + 's';
            }
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: rootMargin });
      els.forEach(function(el) { observer.observe(el); });
    }

    observeTargets('.section-header', { rootMargin: '0px 0px -150px 0px' });

    observeTargets('.player-card', { rootMargin: '0px 0px -100px 0px', stagger: 0.15 });
    observeTargets('.theory-card', { rootMargin: '0px 0px -100px 0px', stagger: 0.12 });
    observeTargets('.level-card', { rootMargin: '0px 0px -100px 0px', stagger: 0.12 });
    observeTargets('.legacy-card', { rootMargin: '0px 0px -100px 0px', stagger: 0.12 });
    observeTargets('.question-card', { rootMargin: '0px 0px -80px 0px', stagger: 0.08 });
    observeTargets('.source-card', { rootMargin: '0px 0px -80px 0px', stagger: 0.06 });

    // --- Timeline: vertical-scroll drives horizontal translation ---
    (function initTimelineHorizontal() {
      var section = document.querySelector('.section-timeline');
      var sticky = section && section.querySelector('.timeline-sticky');
      var wrap = section && section.querySelector('.timeline-scroll-wrap');
      var timeline = document.getElementById('timelineContainer');
      var progressBar = document.getElementById('timelineProgress');
      var progressFill = document.getElementById('timelineProgressFill');
      var endCue = section && section.querySelector('.timeline-scroll-end');
      if (!section || !sticky || !wrap || !timeline) return;

      function getLabelWidth() {
        var label = wrap && wrap.previousElementSibling;
        return label ? label.offsetWidth : 0;
      }

      function getScrollMetrics() {
        var items = timeline.querySelectorAll('.timeline-item');
        if (!items.length) return { maxTranslate: 0 };
        var first = items[0];
        var last = items[items.length - 1];
        var firstRect = first.getBoundingClientRect();
        var lastRect = last.getBoundingClientRect();
        var totalSpan = lastRect.right - firstRect.left;
        var visibleW = window.innerWidth - getLabelWidth();
        var maxTranslate = Math.max(0, totalSpan - visibleW + 120);
        return { maxTranslate: maxTranslate };
      }

      function setSectionHeight() {
        var m = getScrollMetrics();
        section.style.height = (window.innerHeight + m.maxTranslate) + 'px';
      }

      function updatePosition() {
        var rect = section.getBoundingClientRect();
        var sH = section.offsetHeight;
        var vH = window.innerHeight;
        var scrollable = sH - vH;
        if (scrollable <= 0) return;

        var progress = Math.max(0, Math.min(1, Math.abs(rect.top) / scrollable));

        var m = getScrollMetrics();
        if (m.maxTranslate > 0) {
          timeline.style.transform = 'translate3d(' + (-progress * m.maxTranslate) + 'px, 0, 0)';
        }

        var isActive = rect.top < vH && rect.bottom > 0 && progress > 0 && progress < 1;
        if (isActive) {
          progressBar.classList.add('active');
          progressFill.style.width = (progress * 100) + '%';
          if (endCue) endCue.classList.toggle('visible', progress > 0.85);
        } else {
          progressBar.classList.remove('active');
          progressFill.style.width = '0%';
          if (endCue) endCue.classList.remove('visible');
        }

        if (progress > 0.05) {
          var allItems = timeline.querySelectorAll('.timeline-item');
          allItems.forEach(function(item) { item.classList.add('revealed'); });
        }
      }

      setSectionHeight();
      updatePosition();
      window.addEventListener('scroll', updatePosition, { passive: true });
      window.addEventListener('resize', function() {
        setSectionHeight();
        updatePosition();
      });
    })();

    // --- Player Dim-Fill Bars ---
    (function initPlayerBars() {
      document.querySelectorAll('.player-card').forEach(function(card, i) {
        var bars = card.querySelectorAll('.player-dim-fill');
        if (!bars.length) return;
        var barObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var bar = entry.target;
              var w = bar.getAttribute('data-width') || 0;
              var idx = Array.prototype.indexOf.call(bars, bar);
              bar.style.transition = 'width 1.2s cubic-bezier(0.215, 0.61, 0.355, 1)';
              bar.style.transitionDelay = (i * 0.15 + idx * 0.1) + 's';
              bar.style.width = w + '%';
              barObserver.unobserve(bar);
            }
          });
        }, { rootMargin: '0px 0px -150px 0px' });
        bars.forEach(function(bar) { barObserver.observe(bar); });
      });
    })();

    // --- Stat Counter (replaced by live war duration timer in render()) ---

    // --- War Data Morph Card — cycles through all entries with scramble ---
    (function initWarDataMorph() {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$BkM/%';
      var rnd = function(p) { return p[Math.floor(Math.random() * p.length)]; };

      function scrambleText(el, target, duration, delay, cb) {
        var original = target;
        var startTime = null;
        var len = original.length;

        function tick(now) {
          if (!startTime) startTime = now;
          var elapsed = now - startTime - delay;
          if (elapsed < 0) { requestAnimationFrame(tick); return; }
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - (1 - progress) * (1 - progress) * (1 - progress);

          var result = '';
          for (var i = 0; i < len; i++) {
            if (eased > (i + 1) / len) {
              result += original[i];
            } else {
              var ch = original[i];
              if (' ,.+$%BkM/'.indexOf(ch) !== -1 && Math.random() < 0.7) {
                result += ch;
              } else {
                result += rnd(chars);
              }
            }
          }
          el.textContent = result;

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = original;
            if (cb) cb();
          }
        }
        requestAnimationFrame(tick);
      }

      var section = document.querySelector('.section-sim');
      if (!section || typeof UW === 'undefined' || !UW.simulation || !UW.simulation.length) return;
      var data = UW.simulation;

      var grid = document.getElementById('simGrid');
      if (!grid) return;

      var count = data.length;

      // Build single morph card
      var dotsHtml = '';
      for (var di = 0; di < count; di++) {
        dotsHtml += '<span class="morph-dot' + (di === 0 ? ' active' : '') + '"></span>';
      }
      grid.innerHTML =
        '<div class="sim-morph-card">' +
          '<div class="morph-progress"><div class="morph-progress-fill" id="morphProgress"></div></div>' +
          '<div class="sim-morph-inner">' +
            '<div class="sim-card-title" id="morphTitle"></div>' +
            '<div class="sim-card-subtitle" id="morphSub"></div>' +
            '<div class="sim-card-value" id="morphValue"></div>' +
            '<div class="sim-card-desc" id="morphDesc"></div>' +
            '<div id="morphItems"></div>' +
            '<div class="sim-card-source" id="morphSrc"></div>' +
          '</div>' +
          '<div class="morph-dots">' + dotsHtml + '</div>' +
        '</div>';

      var card = grid.querySelector('.sim-morph-card');
      var elTitle = document.getElementById('morphTitle');
      var elSub = document.getElementById('morphSub');
      var elValue = document.getElementById('morphValue');
      var elDesc = document.getElementById('morphDesc');
      var elItems = document.getElementById('morphItems');
      var elSrc = document.getElementById('morphSrc');
      var elProgress = document.getElementById('morphProgress');
      var elDots = grid.querySelectorAll('.morph-dot');

      var currentIdx = 0;
      var morphTimer = null;
      var started = false;
      var intervalMs = 7000;

      function setText(el, txt) { el.textContent = txt; }

      function updateDots(idx) {
        elDots.forEach(function(d, i) {
          d.classList.toggle('active', i === idx);
        });
      }

      function resetProgress() {
        elProgress.style.transition = 'none';
        elProgress.style.width = '0%';
        // Force reflow
        void elProgress.offsetWidth;
        elProgress.style.transition = 'width ' + intervalMs + 'ms linear';
        elProgress.style.width = '100%';
      }

      function renderCard(idx) {
        var d = data[idx];
        setText(elTitle, d.title);
        setText(elSub, d.subtitle);
        if (d.visualType === 'displacement') {
          setText(elValue, '');
        } else {
          setText(elValue, d.value + d.unit);
        }
        setText(elDesc, d.description);
        setText(elSrc, d.source);

        if (d.items) {
          elItems.innerHTML = '<div class="sim-card-items">' + d.items.map(function(i) { return '<div class="sim-card-item">' + i + '</div>'; }).join('') + '</div>';
        } else {
          elItems.innerHTML = '';
        }
        card.style.setProperty('--gradient', d.gradient);
      }

      function morphTo(idx) {
        var next = data[idx];
        var dur = 800;

        scrambleText(elTitle, next.title, dur, 0);
        scrambleText(elSub, next.subtitle, dur * 0.8, 100);
        if (next.visualType === 'displacement') {
          scrambleText(elValue, '', dur * 0.5, 200);
        } else {
          scrambleText(elValue, next.value + next.unit, dur * 1.2, 200);
        }
        scrambleText(elDesc, next.description, dur * 1.4, 350, function() {
          card.style.setProperty('--gradient', next.gradient);
        });
        scrambleText(elSrc, next.source, dur * 0.6, 500);

        // Update items after scramble starts
        setTimeout(function() {
          if (next.items) {
            elItems.innerHTML = '<div class="sim-card-items">' + next.items.map(function(i) { return '<div class="sim-card-item">' + i + '</div>'; }).join('') + '</div>';
          } else {
            elItems.innerHTML = '';
          }
        }, 600);

        currentIdx = idx;
        updateDots(idx);
        resetProgress();
      }

      function startCycle() {
        if (started) return;
        started = true;
        renderCard(0);
        card.classList.add('revealed');
        updateDots(0);
        resetProgress();
        morphTimer = setInterval(function() {
          var next = (currentIdx + 1) % data.length;
          morphTo(next);
        }, 7000);
      }

      // Start on scroll into view
      var morphObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          morphObserver.unobserve(entry.target);
          startCycle();
        });
      }, { rootMargin: '0px 0px -100px 0px' });
      morphObserver.observe(section);
    })();

  } else {
    // --- Reduced motion fallback: set stat values & render first morph card ---
    var gridRM = document.getElementById('simGrid');
    if (gridRM && typeof UW !== 'undefined' && UW.simulation && UW.simulation.length) {
      var rm = UW.simulation[0];
      var ihRM = rm.items ? '<div class="sim-card-items">' + rm.items.map(function(i) { return '<div class="sim-card-item">' + i + '</div>'; }).join('') + '</div>' : '';
      var vhRM = rm.visualType === 'displacement' ? '' : '<div class="sim-card-value">' + rm.value + rm.unit + '</div>';
      gridRM.innerHTML = '<div class="sim-morph-card revealed" style="--gradient: ' + rm.gradient + '"><div class="morph-progress"><div class="morph-progress-fill" style="width:100%;background:' + rm.gradient + '"></div></div><div class="sim-morph-inner"><div class="sim-card-title">' + rm.title + '</div><div class="sim-card-subtitle">' + rm.subtitle + '</div>' + vhRM + '<div class="sim-card-desc">' + rm.description + '</div>' + ihRM + '<div class="sim-card-source">' + rm.source + '</div></div><div class="morph-dots"><span class="morph-dot active"></span><span class="morph-dot"></span><span class="morph-dot"></span><span class="morph-dot"></span></div></div>';
    }

    document.querySelectorAll('.hero-dur-num').forEach(function(el) {
      var text = el.textContent;
      if (text && text.length <= 2) el.textContent = text;
    });
  }
});
