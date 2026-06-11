/* ============ Guardian App(中文版)· 原型交互 v3 ============ */

/* ====== 地图配置 —— 填入你自己的 key 即启用实景地图 ======
   高德 Amap:  https://console.amap.com 申请(Web端 JS API + 安全密钥)
   Google:    https://console.cloud.google.com 申请(Maps JavaScript API)
   留空则显示演示地图。 */
const MAP_CONFIG = {
  amapKey: '',        // 高德 Web 端(JS API 2.0)key
  amapSecurity: '',   // 高德 安全密钥 securityJsCode
  googleKey: '',      // Google Maps JavaScript API key
  center: { lng: 120.1551, lat: 30.2741 }, // 演示坐标:杭州
  radius: 200,
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const phone = $('#phone');

/* ===== 问候语随时间变化 ===== */
(() => {
  const h = new Date().getHours(), name = '禹涵';
  let t;
  if (h < 5) t = `夜深了,${name} 🌙`;
  else if (h < 11) t = `早上好,${name} 🌤`;
  else if (h < 14) t = `中午好,${name} ☀️`;
  else if (h < 18) t = `下午好,${name} ☀️`;
  else t = `晚上好,${name} 🌆`;
  const el = $('#greeting'); if (el) el.textContent = t;
})();

/* ====================== 登录 ====================== */
function enterApp() {
  phone.classList.add('logged-in');
  $$('.screen').forEach(s => s.classList.remove('active'));
  $$('.tab').forEach(t => t.classList.remove('active'));
  $('#screen-home').classList.add('active');
  $('.tab[data-screen="screen-home"]').classList.add('active');
}
function showLoginMethods() {
  $('#loginMethods').classList.remove('hide');
  $('#emailFlow').classList.remove('show');
  $('#emailStep1').hidden = false;
  $('#emailStep2').hidden = true;
}

// Google / 微信 一键登录(演示态免密)
$$('.auth-btn[data-auth]').forEach(btn => {
  if (btn.id === 'emailToggle') return;
  btn.addEventListener('click', () => {
    btn.textContent = '登录中…';
    setTimeout(enterApp, 550);
  });
});
// 邮箱 → 验证码流程
$('#emailToggle').addEventListener('click', () => {
  $('#loginMethods').classList.add('hide');
  $('#emailFlow').classList.add('show');
});
$('#sendCode').addEventListener('click', () => {
  const email = $('#emailInput').value.trim();
  if (!email || !/.+@.+\..+/.test(email)) { $('#emailInput').focus(); return; }
  $('#emailEcho').textContent = email;
  $('#emailStep1').hidden = true;
  $('#emailStep2').hidden = false;
  setTimeout(() => $('.otp')?.focus(), 100);
});
$('#verifyCode').addEventListener('click', enterApp);
// 验证码自动跳格
$$('.otp').forEach((o, i, arr) => {
  o.addEventListener('input', () => {
    o.value = o.value.replace(/\D/g, '');
    if (o.value && arr[i + 1]) arr[i + 1].focus();
    if (arr.every(x => x.value)) setTimeout(enterApp, 250);
  });
  o.addEventListener('keydown', e => { if (e.key === 'Backspace' && !o.value && arr[i - 1]) arr[i - 1].focus(); });
});
$$('.link-back').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.back === 'methods') showLoginMethods();
  else { $('#emailStep2').hidden = true; $('#emailStep1').hidden = false; }
}));
// 退出登录
$('#logoutBtn')?.addEventListener('click', () => {
  phone.classList.remove('logged-in');
  $$('.overlay.open').forEach(o => o.classList.remove('open'));
  showLoginMethods();
});

/* ====================== Tab 切换 ====================== */
$$('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach(t => t.classList.remove('active'));
    $$('.screen').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    $('#' + tab.dataset.screen).classList.add('active');
    if (tab.dataset.screen === 'screen-map') initMap(state.provider);
  });
});

/* ====================== 浮层 ====================== */
$$('[data-overlay]').forEach(trigger => {
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const ov = $('#' + trigger.dataset.overlay);
    if (!ov) return;
    $$('.overlay.open').forEach(o => { if (o !== ov) o.classList.remove('open'); });
    ov.classList.add('open');
    if (trigger.dataset.overlay === 'ov-alerts') { const d = $('#bellDot'); if (d) d.style.display = 'none'; }
  });
});
$$('.back-btn').forEach(b => b.addEventListener('click', () => b.closest('.overlay').classList.remove('open')));

/* ====================== 多宠切换 ====================== */
const PETS = {};
$$('.pet-chip[data-pet]').forEach(chip => {
  PETS[chip.dataset.pet] = { breed: chip.dataset.breed, emoji: chip.dataset.emoji };
  chip.addEventListener('click', () => {
    $$('.pet-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const n = chip.dataset.pet;
    $$('[data-pet-name]').forEach(el => el.textContent = n);
    $$('[data-pet-breed]').forEach(el => el.textContent = PETS[n].breed);
    $$('[data-pet-emoji]').forEach(el => el.textContent = PETS[n].emoji);
  });
});

/* ====================== 其它交互 ====================== */
$$('.alert-card').forEach(card => card.addEventListener('click', e => {
  if (e.target.closest('button')) return; card.classList.toggle('open');
}));
$$('.seg').forEach(seg => seg.addEventListener('click', () => {
  $$('.seg').forEach(s => s.classList.remove('active')); seg.classList.add('active');
}));
$$('.switch').forEach(sw => sw.addEventListener('click', () => sw.classList.toggle('on')));
$$('.like-btn').forEach(btn => {
  if (!btn.textContent.includes('❤️')) return;
  btn.addEventListener('click', () => {
    const n = btn.querySelector('span');
    if (btn.classList.toggle('liked')) { n.dataset.prev = n.textContent; n.textContent = n.textContent.includes('k') ? n.textContent : String(parseInt(n.textContent, 10) + 1); }
    else { n.textContent = n.dataset.prev || n.textContent; }
  });
});

/* ===== 联名 Drop 倒计时 ===== */
(() => {
  let total = 3 * 3600 + 12 * 60 + 44;
  const els = [$('#dropTimer'), $('#dropTimer2')].filter(Boolean);
  if (!els.length) return;
  const pad = n => String(n).padStart(2, '0');
  setInterval(() => {
    total = Math.max(0, total - 1);
    const t = `${pad(Math.floor(total / 3600))} : ${pad(Math.floor(total % 3600 / 60))} : ${pad(total % 60)}`;
    els.forEach(el => el.textContent = t);
  }, 1000);
})();

/* ===== 云端兽医对话(演示态) ===== */
(() => {
  const input = $('#chatInput'), send = $('#chatSend'), body = $('#chatBody');
  if (!input || !send || !body) return;
  const replies = [
    '收到,我记下了。从数据看暂时没有新的异常趋势,今晚保持观察就好,有变化随时告诉我。',
    '好的。建议把它今晚的进食情况拍照记录一下,明天复诊或线上复述时会很有用。',
    '别担心,你做得已经很好了。我们和数据都在,有任何变化第一时间会提醒你。'
  ];
  let i = 0;
  const submit = () => {
    const text = input.value.trim(); if (!text) return;
    const u = document.createElement('div'); u.className = 'bubble user'; u.textContent = text;
    body.appendChild(u); input.value = ''; body.scrollTop = body.scrollHeight;
    setTimeout(() => {
      const v = document.createElement('div'); v.className = 'bubble vet';
      v.innerHTML = '<span class="bubble-who">李医生 · 执业兽医</span>' + replies[i++ % replies.length];
      body.appendChild(v); body.scrollTop = body.scrollHeight;
    }, 850);
  };
  send.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
})();

/* ====================== 实景地图(高德 / Google / 演示) ====================== */
const state = { provider: 'amap', map: null, circle: null, loaded: { amap: false, google: false }, radius: MAP_CONFIG.radius };

function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; phone.appendChild(t); }
  t.textContent = msg; requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
}
function showDemo() { $('#mapDemo').classList.remove('hidden'); $('#map-canvas').innerHTML = ''; applyDemoRadius(state.radius); }
function applyDemoRadius(r) {
  const fence = $('#mapDemo .geofence'); if (!fence) return;
  const px = 90 + (r / 500) * 150;
  fence.style.width = fence.style.height = px + 'px';
}
function loadScript(src, cb, onerr) {
  const s = document.createElement('script'); s.src = src; s.async = true;
  s.onload = cb; s.onerror = onerr; document.head.appendChild(s);
}

function renderAmap() {
  $('#mapDemo').classList.add('hidden');
  const { lng, lat } = MAP_CONFIG.center;
  state.map = new AMap.Map('map-canvas', { zoom: 15, center: [lng, lat], mapStyle: 'amap://styles/whitesmoke', resizeEnable: true });
  state.circle = new AMap.Circle({ center: [lng, lat], radius: state.radius, strokeColor: '#e8734a', strokeWeight: 2, fillColor: '#e8734a', fillOpacity: 0.14 });
  state.map.add(state.circle);
  state.map.add(new AMap.Marker({ position: [lng, lat], content: '<div style="font-size:26px">🐕</div>', offset: new AMap.Pixel(-13, -13) }));
}
function renderGoogle() {
  $('#mapDemo').classList.add('hidden');
  const c = { lat: MAP_CONFIG.center.lat, lng: MAP_CONFIG.center.lng };
  state.map = new google.maps.Map($('#map-canvas'), { center: c, zoom: 15, disableDefaultUI: true, gestureHandling: 'greedy' });
  state.circle = new google.maps.Circle({ center: c, radius: state.radius, map: state.map, strokeColor: '#e8734a', strokeWeight: 2, fillColor: '#e8734a', fillOpacity: 0.14 });
  new google.maps.Marker({ position: c, map: state.map, label: { text: '🐕', fontSize: '22px' }, icon: { path: 0, scale: 0 } });
}

function initMap(provider) {
  state.provider = provider;
  if (provider === 'amap') {
    if (!MAP_CONFIG.amapKey) return showDemo();
    if (state.loaded.amap) return renderAmap();
    window._AMapSecurityConfig = { securityJsCode: MAP_CONFIG.amapSecurity };
    loadScript(`https://webapi.amap.com/maps?v=2.0&key=${MAP_CONFIG.amapKey}`,
      () => { state.loaded.amap = true; renderAmap(); },
      () => { toast('高德地图加载失败,已切换演示地图'); showDemo(); });
    return;
  }
  if (provider === 'google') {
    if (!MAP_CONFIG.googleKey) return showDemo();
    if (state.loaded.google) return renderGoogle();
    loadScript(`https://maps.googleapis.com/maps/api/js?key=${MAP_CONFIG.googleKey}`,
      () => { state.loaded.google = true; renderGoogle(); },
      () => { toast('Google 地图加载失败,已切换演示地图'); showDemo(); });
    return;
  }
  showDemo();
}

// 地图源切换
$$('#mapProvider .prov').forEach(b => b.addEventListener('click', () => {
  $$('#mapProvider .prov').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  const p = b.dataset.prov;
  const key = p === 'amap' ? MAP_CONFIG.amapKey : MAP_CONFIG.googleKey;
  if (!key) toast(`在 app.js 填入${p === 'amap' ? '高德' : 'Google'} key 即可启用实景地图`);
  initMap(p);
}));

// 围栏半径滑块
const slider = $('#fenceRadius');
if (slider) slider.addEventListener('input', () => {
  state.radius = +slider.value;
  $('#radiusVal').textContent = state.radius + ' m';
  if (state.circle && state.circle.setRadius) state.circle.setRadius(state.radius);
  applyDemoRadius(state.radius);
});
applyDemoRadius(state.radius);

/* ===== 演示直达:?demo 跳过登录;&tab=screen-map 直达某 Tab ===== */
(() => {
  const q = new URLSearchParams(location.search);
  if (!q.has('demo')) return;
  enterApp();
  const tab = q.get('tab');
  if (tab) { const b = document.querySelector(`.tab[data-screen="${tab}"]`); if (b) b.click(); }
})();
