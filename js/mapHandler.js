// 初始化地图
const map = L.map('map').setView([43.6532, -79.3832], 13); // Toronto
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 模拟事件数据（如果 data.js 存在则使用）
let events = typeof mockReports !== 'undefined' ? [...mockReports] : [];

const eventList = document.getElementById('eventList');

// 渲染事件列表
function renderEvents() {
  eventList.innerHTML = '';
  events.forEach((e, i) => {
    const div = document.createElement('div');
    div.className = 'event' + (e.status === 'done' ? ' done' : '');
    div.innerHTML = `<strong>${e.title}</strong><br>Type: ${e.type}<br>Status: ${e.status}<br>`;
    const btn = document.createElement('button');
    btn.innerText = e.status === 'pending' ? 'Done' : 'To be done';
    btn.onclick = () => {
      events[i].status = events[i].status === 'pending' ? 'done' : 'pending';
      renderEvents();
    };
    div.appendChild(btn);
    eventList.appendChild(div);
  });
}

// 地图点击时打开表单
map.on('click', e => {
  openModal(e.latlng);
});

// 按钮点击打开表单
document.getElementById('reportBtn').addEventListener('click', () => {
  openModal();
});

// 提交按钮调用 submitForm
document.getElementById('submitForm').addEventListener('click', () => {
  submitForm(events, map, renderEvents);
});

// 初始化历史数据（加在地图上）
events.forEach(e => {
  L.marker(e.latlng).addTo(map).bindPopup(e.title);
});

renderEvents();

