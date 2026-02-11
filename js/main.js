/* ============================================
   HowToBeYoung.com — Main JavaScript
   Vanilla JS · No Dependencies · Accessible
   ============================================ */

(function () {
  'use strict';

  /* --- Scroll Animations (Intersection Observer) --- */
  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll(
      '.fade-in, .fade-in-left, .fade-in-right, .scale-in, .stagger-children'
    );

    if (!animatedElements.length) return;

    if (!('IntersectionObserver' in window)) {
      animatedElements.forEach(function (el) {
        el.classList.add(el.classList.contains('stagger-children')
          ? 'stagger-children--visible'
          : el.className.split(' ').find(function (c) { return c.startsWith('fade-in') || c.startsWith('scale-in'); }) + '--visible'
        );
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          if (el.classList.contains('stagger-children')) {
            el.classList.add('stagger-children--visible');
          } else if (el.classList.contains('fade-in')) {
            el.classList.add('fade-in--visible');
          } else if (el.classList.contains('fade-in-left')) {
            el.classList.add('fade-in-left--visible');
          } else if (el.classList.contains('fade-in-right')) {
            el.classList.add('fade-in-right--visible');
          } else if (el.classList.contains('scale-in')) {
            el.classList.add('scale-in--visible');
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(function (el) { observer.observe(el); });
  }

  /* --- Counter Animations --- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-counter'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = 2000;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /* --- Score Metric Bar Animations --- */
  function initScoreMetrics() {
    var fills = document.querySelectorAll('.score-metric__fill');
    if (!fills.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var fill = entry.target;
          var targetWidth = fill.getAttribute('data-width') || '70%';
          setTimeout(function () {
            fill.style.width = targetWidth;
          }, 300);
          observer.unobserve(fill);
        }
      });
    }, { threshold: 0.3 });

    fills.forEach(function (el) { observer.observe(el); });
  }

  /* --- Score Circle Animation --- */
  function initScoreCircle() {
    var circle = document.querySelector('.score-circle__fill');
    if (!circle) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var targetOffset = circle.getAttribute('data-offset') || '170';
          setTimeout(function () {
            circle.style.strokeDashoffset = targetOffset;
          }, 500);

          var numberEl = document.querySelector('.score-circle__number');
          if (numberEl) {
            var targetScore = parseInt(numberEl.getAttribute('data-score') || '78', 10);
            animateScoreNumber(numberEl, targetScore);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    var scoreSection = document.querySelector('.score-preview');
    if (scoreSection) observer.observe(scoreSection);
  }

  function animateScoreNumber(el, target) {
    var duration = 2000;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* --- Navigation --- */
  function initNavigation() {
    var nav = document.querySelector('.nav');
    var toggle = document.querySelector('.nav__toggle');
    var mobileMenu = document.querySelector('.nav__mobile');
    var body = document.body;

    if (!nav) return;

    // Scroll behavior
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
      var currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });

    // Mobile menu toggle
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.contains('nav__mobile--open');
        if (isOpen) {
          mobileMenu.classList.remove('nav__mobile--open');
          toggle.classList.remove('nav__toggle--open');
          body.style.overflow = '';
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          mobileMenu.classList.add('nav__mobile--open');
          toggle.classList.add('nav__toggle--open');
          body.style.overflow = 'hidden';
          toggle.setAttribute('aria-expanded', 'true');
        }
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('nav__mobile--open');
          toggle.classList.remove('nav__toggle--open');
          body.style.overflow = '';
        });
      });
    }
  }

  /* --- Smooth Scroll for Anchor Links --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          var offset = 80;
          var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      });
    });
  }

  /* --- Image Lazy Loading --- */
  function initLazyImages() {
    var images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    if ('IntersectionObserver' in window) {
      var imgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            img.addEventListener('load', function () {
              img.classList.add('loaded');
            });
            imgObserver.unobserve(img);
          }
        });
      }, { rootMargin: '100px' });

      images.forEach(function (img) { imgObserver.observe(img); });
    } else {
      images.forEach(function (img) {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }
  }

  /* --- Youth Score Calculator (Full Page) --- */
  function initYouthScoreCalculator() {
    var form = document.querySelector('.score-form');
    if (!form) return;

    var sliders = form.querySelectorAll('input[type="range"]');
    var resultSection = document.querySelector('.score-result');
    var calculateBtn = document.querySelector('#calculate-score');

    // Update displayed values on slider change
    sliders.forEach(function (slider) {
      var valueDisplay = slider.parentElement.querySelector('.score-form__value');
      if (valueDisplay) {
        slider.addEventListener('input', function () {
          var labels = JSON.parse(slider.getAttribute('data-labels') || '[]');
          if (labels.length) {
            valueDisplay.textContent = labels[parseInt(slider.value, 10)] || slider.value;
          } else {
            valueDisplay.textContent = slider.value;
          }
        });
      }
    });

    if (calculateBtn) {
      calculateBtn.addEventListener('click', function () {
        var total = 0;
        var count = 0;

        sliders.forEach(function (slider) {
          total += parseInt(slider.value, 10);
          count++;
        });

        var average = count > 0 ? Math.round((total / count) * 10) : 0;

        if (resultSection) {
          resultSection.style.display = 'block';
          var numberEl = resultSection.querySelector('.score-result__number');
          if (numberEl) {
            animateScoreNumber(numberEl, average);
          }

          var labelEl = resultSection.querySelector('.score-result__label');
          if (labelEl) {
            if (average >= 80) labelEl.textContent = resultSection.getAttribute('data-label-excellent') || 'Excellent';
            else if (average >= 60) labelEl.textContent = resultSection.getAttribute('data-label-good') || 'Good';
            else if (average >= 40) labelEl.textContent = resultSection.getAttribute('data-label-fair') || 'Needs Attention';
            else labelEl.textContent = resultSection.getAttribute('data-label-low') || 'Take Action';
          }

          // Populate breakdown
          sliders.forEach(function (slider) {
            var name = slider.getAttribute('data-name');
            var itemValue = resultSection.querySelector('[data-breakdown="' + name + '"]');
            if (itemValue) {
              itemValue.textContent = Math.round(parseInt(slider.value, 10) * 10) + '/100';
            }
          });

          resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  /* --- Active Navigation Highlight --- */
  function initActiveNav() {
    var currentPath = window.location.pathname;
    document.querySelectorAll('.nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && currentPath.includes(href) && href !== '#') {
        link.classList.add('nav__link--active');
      }
    });
  }

  /* --- Initialize Everything --- */
  function init() {
    initNavigation();
    initScrollAnimations();
    initCounters();
    initScoreMetrics();
    initScoreCircle();
    initSmoothScroll();
    initLazyImages();
    initYouthScoreCalculator();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
