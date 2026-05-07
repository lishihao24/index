/**
 * Matisse Cut-Out & Petroglyph System — 交互脚本
 * 刻意保留手工瑕疵的动画控制
 */

(function() {
  'use strict';

  /* ── 1. 导航链接点击时的纸张翻起感 ── */
  document.querySelectorAll('.cut-nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      // 如果点击的是当前页，不拦截
      const href = this.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;

      if (window.location.pathname.endsWith(href)) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const body = document.body;

      // 页面退出：像被风吹散的剪纸
      body.style.transition = 'transform 0.35s cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 0.35s ease';
      body.style.transform = 'translateY(-12px) rotate(0.8deg) scale(0.98)';
      body.style.opacity = '0';

      setTimeout(() => {
        window.location.href = href;
      }, 350);
    });
  });

  /* ── 3. 滚动触发：进入视口时淡入显示 ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  /* ── 4. 初始化 ── */
  function init() {
    // 页面进入：简洁淡入
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });


    // 左上角标记：跟随鼠标的轻微视线旋转
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const eyeWrap = document.querySelector('.site-header .glyph-mark');
    const eyeFollow = document.querySelector('.site-header .glyph-mark .eye-mark .eye-follow');
    if (!reduceMotion && eyeWrap && eyeFollow) {
      const maxDeg = 32;
      let rafId = null;
      let lastEvent = null;

      function update() {
        rafId = null;
        if (!lastEvent) return;
        const rect = eyeWrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = lastEvent.clientX - cx;
        const dy = lastEvent.clientY - cy;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        eyeFollow.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      }

      window.addEventListener('mousemove', (e) => {
        lastEvent = e;
        if (rafId) return;
        rafId = window.requestAnimationFrame(update);
      }, { passive: true });
    }

    document.querySelectorAll('.card-body, .cut-panel, .time-stone, .skill-chip').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    /* ── 5. 联系方式：点击复制 ── */
    document.querySelectorAll('.hc-value').forEach(el => {
      el.addEventListener('click', async () => {
        const text = el.dataset.copy;
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1500);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
