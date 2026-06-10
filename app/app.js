// ============ Guardian App 原型交互 v2 ============

// ===== 问候语随时间变化(人文细节) =====
(() => {
  const h = new Date().getHours();
  const name = '禹涵';
  let text;
  if (h < 5) text = `夜深了,${name} 🌙`;
  else if (h < 11) text = `早上好,${name} 🌤`;
  else if (h < 14) text = `中午好,${name} ☀️`;
  else if (h < 18) text = `下午好,${name} ☀️`;
  else text = `晚上好,${name} 🌆`;
  const el = document.getElementById('greeting');
  if (el) el.textContent = text;
})();

// ===== Tab 切换 =====
const tabs = document.querySelectorAll('.tab');
const screens = document.querySelectorAll('.screen');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    screens.forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.screen).classList.add('active');
  });
});

// ===== 浮层系统(兽医/月报/商店/保障/提醒) =====
document.querySelectorAll('[data-overlay]').forEach(trigger => {
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const ov = document.getElementById(trigger.dataset.overlay);
    if (!ov) return;
    // 先关闭其它浮层(支持从提醒跳转到兽医)
    document.querySelectorAll('.overlay.open').forEach(o => { if (o !== ov) o.classList.remove('open'); });
    ov.classList.add('open');
    // 打开提醒中心后清除小红点
    if (trigger.dataset.overlay === 'ov-alerts') {
      const dot = document.getElementById('bellDot');
      if (dot) dot.style.display = 'none';
    }
  });
});
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.overlay').classList.remove('open'));
});

// ===== 多宠物切换 =====
const PETS = {};
document.querySelectorAll('.pet-chip[data-pet]').forEach(chip => {
  PETS[chip.dataset.pet] = { breed: chip.dataset.breed, emoji: chip.dataset.emoji };
  chip.addEventListener('click', () => {
    document.querySelectorAll('.pet-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const name = chip.dataset.pet;
    document.querySelectorAll('[data-pet-name]').forEach(el => el.textContent = name);
    document.querySelectorAll('[data-pet-breed]').forEach(el => el.textContent = PETS[name].breed);
    document.querySelectorAll('[data-pet-emoji]').forEach(el => el.textContent = PETS[name].emoji);
  });
});

// ===== 提醒卡片展开/收起 =====
document.querySelectorAll('.alert-card').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.closest('button')) return;
    card.classList.toggle('open');
  });
});

// ===== 健康页时间段切换(演示态) =====
document.querySelectorAll('.seg').forEach(seg => {
  seg.addEventListener('click', () => {
    document.querySelectorAll('.seg').forEach(s => s.classList.remove('active'));
    seg.classList.add('active');
  });
});

// ===== 围栏开关 =====
document.querySelectorAll('.switch').forEach(sw => {
  sw.addEventListener('click', () => sw.classList.toggle('on'));
});

// ===== 社区点赞 =====
document.querySelectorAll('.like-btn').forEach(btn => {
  if (!btn.textContent.includes('❤️')) return;
  btn.addEventListener('click', () => {
    const n = btn.querySelector('span');
    if (btn.classList.toggle('liked')) {
      const v = n.textContent;
      n.dataset.prev = v;
      n.textContent = v.includes('k') ? v : String(parseInt(v, 10) + 1);
    } else {
      n.textContent = n.dataset.prev || n.textContent;
    }
  });
});

// ===== 联名 Drop 倒计时 =====
(() => {
  let total = 3 * 3600 + 12 * 60 + 44; // 03:12:44
  const els = [document.getElementById('dropTimer'), document.getElementById('dropTimer2')].filter(Boolean);
  if (!els.length) return;
  const pad = n => String(n).padStart(2, '0');
  setInterval(() => {
    total = Math.max(0, total - 1);
    const t = `${pad(Math.floor(total / 3600))} : ${pad(Math.floor(total % 3600 / 60))} : ${pad(total % 60)}`;
    els.forEach(el => el.textContent = t);
  }, 1000);
})();

// ===== 云端兽医对话(演示态) =====
(() => {
  const input = document.getElementById('chatInput');
  const send = document.getElementById('chatSend');
  const body = document.getElementById('chatBody');
  if (!input || !send || !body) return;

  const replies = [
    '收到,我记下了。从数据看暂时没有新的异常趋势,今晚保持观察就好,有变化随时告诉我。',
    '好的。建议把它今晚的进食情况拍照记录一下,明天复诊或线上复述时会很有用。',
    '别担心,你做得已经很好了。我们和数据都在,有任何变化第一时间会提醒你。'
  ];
  let i = 0;

  const submit = () => {
    const text = input.value.trim();
    if (!text) return;
    const u = document.createElement('div');
    u.className = 'bubble user';
    u.textContent = text;
    body.appendChild(u);
    input.value = '';
    body.scrollTop = body.scrollHeight;
    setTimeout(() => {
      const v = document.createElement('div');
      v.className = 'bubble vet';
      v.innerHTML = '<span class="bubble-who">李医生 · 执业兽医</span>' + replies[i++ % replies.length];
      body.appendChild(v);
      body.scrollTop = body.scrollHeight;
    }, 900);
  };
  send.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
})();
