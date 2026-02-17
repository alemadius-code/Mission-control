const TEAM = [
  { id:'coder', name:'المبرمج', role:'برمجة وإصلاح', emoji:'💻', color:'#22c55e', tags:['Code','Debug','Ship'] },
  { id:'researcher', name:'الباحث', role:'بحث وتحليل', emoji:'🔍', color:'#3b82f6', tags:['بحث','تحليل','مصادر'] },
  { id:'designer', name:'المصمم', role:'تصميم وتجربة', emoji:'🎨', color:'#a855f7', tags:['UX','تصميم','ميكانيكا'] },
  { id:'qa', name:'المراقب', role:'فحص وجودة', emoji:'🛡️', color:'#f59e0b', tags:['QA','فحص','اختبار'] },
  { id:'reporter', name:'كاتب التقارير', role:'تقارير دورية', emoji:'📝', color:'#06b6d4', tags:['تقارير','ملخصات'] }
];

// Tabs
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('view-' + t.dataset.tab).classList.add('active');
  });
});

// DateTime
function updateClock() {
  const now = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone:'Asia/Qatar' };
  document.getElementById('dateTime').textContent = now.toLocaleString('ar-QA', opts);
}
setInterval(updateClock, 1000);
updateClock();

// Render desks
function renderDesks(data) {
  const grid = document.getElementById('desksGrid');
  grid.innerHTML = '';
  const team = data.team || [];
  
  team.forEach((agent, i) => {
    const info = TEAM[i] || TEAM[0];
    const status = agent.status || 'idle';
    const progress = agent.progress || 0;
    const progressClass = progress > 75 ? 'green' : progress > 40 ? 'purple' : 'yellow';
    
    const card = document.createElement('div');
    card.className = `desk-card ${status}`;
    card.innerHTML = `
      <div class="desk-header">
        <div>
          <span style="font-size:24px">${info.emoji}</span>
          <span class="desk-name">${info.name}</span>
          <div class="desk-role">${info.role}</div>
        </div>
        <span class="desk-badge ${status}">${status === 'working' ? 'WORKING' : status === 'idle' ? 'IDLE' : 'OFFLINE'}</span>
      </div>
      <div class="desk-progress">
        <div class="progress-bar">
          <div class="progress-fill ${progressClass}" style="width:${progress}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span style="font-size:11px;color:var(--muted)">❤️ مركز</span>
          <span style="font-size:12px;font-weight:700;color:${info.color}">${progress}%</span>
        </div>
      </div>
      <div class="desk-meta">
        ${info.tags.map(t => `<span class="meta-tag">${t}</span>`).join('')}
      </div>
      <div class="desk-task">
        <span class="desk-task-icon">⚡</span> ${agent.task || '—'}
      </div>
      <div class="desk-model">${agent.model || ''} · ${agent.lastActive || 'الآن'}</div>
    `;
    grid.appendChild(card);
  });
}

// Render meeting
function renderMeeting(data) {
  const content = document.getElementById('meetingContent');
  const notes = document.getElementById('meetingNotes');
  const meetings = data.meeting || [];
  
  if (meetings.length === 0) {
    content.innerHTML = '<p class="empty">لا توجد اجتماعات حالياً</p>';
  } else {
    content.innerHTML = meetings.map(m => `<p>• ${m}</p>`).join('');
  }
  
  const notesList = data.notes || [];
  notes.innerHTML = notesList.map(n => `<li>${n}</li>`).join('') || '<li>لا توجد ملاحظات</li>';
}

// Render reports
function renderReports(data) {
  const list = document.getElementById('reportsList');
  const reports = data.reports || data.activity || [];
  
  if (reports.length === 0) {
    list.innerHTML = '<p class="empty">لا توجد تقارير بعد</p>';
  } else {
    list.innerHTML = reports.map(r => {
      if (typeof r === 'string') {
        return `<div class="report-item"><div class="report-title">${r}</div></div>`;
      }
      return `<div class="report-item">
        <div class="report-title">${r.title || ''}</div>
        <div class="report-time">${r.time || ''}</div>
        <div class="report-body">${r.body || ''}</div>
      </div>`;
    }).join('');
  }
}

// Render chat
function renderChat(data) {
  const msgs = document.getElementById('chatMessages');
  const chat = data.chat || [];
  const online = document.getElementById('chatOnline');
  
  const activeCount = (data.team || []).filter(t => t.status === 'working').length;
  online.textContent = `ONLINE ${activeCount}`;
  
  if (chat.length === 0) {
    msgs.innerHTML = '<p class="empty">لا توجد رسائل</p>';
  } else {
    msgs.innerHTML = chat.map(c => {
      const info = TEAM.find(t => t.id === c.from) || TEAM[0];
      return `<div class="chat-msg">
        <div class="chat-avatar" style="background:${info.color}30">${info.emoji}</div>
        <div class="chat-bubble">
          <div class="chat-sender">${info.name}</div>
          <div>${c.text}</div>
          <div class="chat-time">${c.time || ''}</div>
        </div>
      </div>`;
    }).join('');
  }
}

// Stats
function renderStats(data) {
  const team = data.team || [];
  const active = team.filter(t => t.status === 'working').length;
  document.getElementById('activeCount').textContent = `${active}/${team.length}`;
  document.getElementById('agentCount').textContent = `${team.length} agents`;
  document.getElementById('tasksComplete').textContent = data.tasksComplete || '0/0';
  document.getElementById('winStatus').textContent = data.windows || 'OK';
  document.getElementById('winDetail').textContent = data.windowsDetail || 'Windows';
  document.getElementById('lastUpdate').textContent = data.lastUpdate || '—';
}

// Fetch & render
async function refresh() {
  try {
    const res = await fetch('data/status.json?t=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    renderDesks(data);
    renderMeeting(data);
    renderReports(data);
    renderChat(data);
    renderStats(data);
  } catch(e) { console.error(e); }
}

setInterval(refresh, 30000);
window.addEventListener('load', refresh);

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
