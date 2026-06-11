// ===== 导航滚动状态 =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

// ===== 移动端菜单 =====
const navToggle = document.getElementById('navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('open'))
  );
}

// ===== 滚动渐显 =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== 数字滚动计数 =====
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    countObserver.unobserve(e.target);
    const el = e.target;
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = prefix + Math.round(target * eased).toLocaleString() + '<small>' + suffix + '</small>';
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.4 });
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// ===== TAM 条形动画 =====
const tamObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    tamObserver.unobserve(e.target);
    e.target.style.width = e.target.dataset.width + '%';
  });
}, { threshold: 0.4 });
document.querySelectorAll('.tam-fill').forEach(el => tamObserver.observe(el));

// ===== 合作意向表单(演示态) =====
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', e => {
    e.preventDefault();
    leadForm.querySelectorAll('label, input, select, textarea, .btn').forEach(el => el.style.display = 'none');
    document.getElementById('formOk').style.display = 'block';
  });
}

// ===== 全站图片预热:本页加载完后,空闲时把其它页面的图片提前拉进缓存 =====
(() => {
  const ALL_IMAGES = [
    // 首页
    'launch-poster.jpg', 'img/dog-5.jpg', 'img/dog-39.jpg', 'img/dog-139.jpg', 'img/dog-82.jpg',
    // 产品页
    'feature-poster.jpg', 'img/dog-101.jpg', 'img/dog-120.jpg', 'img/dog-77.jpg', 'img/dog-212.jpg',
    'img/dog-33.jpg', 'img/dog-145.jpg', 'img/dog-88.jpg', 'img/dog-167.jpg', 'img/dog-191.jpg', 'img/dog-54.jpg',
    // 为什么是我们
    'img/dog-23.jpg', 'img/dog-63.jpg', 'img/dog-178.jpg',
    // 商务与投资
    'img/dog-247.jpg',
  ];
  const warm = () => {
    ALL_IMAGES.forEach(src => { const im = new Image(); im.decoding = 'async'; im.src = src; });
  };
  if (document.readyState === 'complete') {
    ('requestIdleCallback' in window) ? requestIdleCallback(warm, { timeout: 3000 }) : setTimeout(warm, 800);
  } else {
    window.addEventListener('load', () => {
      ('requestIdleCallback' in window) ? requestIdleCallback(warm, { timeout: 3000 }) : setTimeout(warm, 800);
    }, { once: true });
  }
})();
