// 初始化地图
const map = L.map('map').setView([43.6532, -79.3832], 13); // Toronto
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 模拟事件数据（如果 data.js 存在则使用）
//let events = typeof mockReports !== 'undefined' ? [...mockReports] : [];
let events = [];

// Load the JSON seed file before setting up Socket.IO
fetch('/events.json')
  .then(res => res.json())
  .then(data => {
    events = data;
    renderEvents();
    // Draw initial markers from the JSON
    events.forEach(e => L.marker(e.latlng).addTo(map).bindPopup(e.title));
    // Then connect to socket
    initSocket();
  })
  .catch(err => console.error('Failed to load events.json:', err));

window.socket = null;
function initSocket() {
  window.socket = io();

  window.socket.on('initialEvents', serverEvents => {
    events = serverEvents;
    renderEvents();
    events.forEach(e => L.marker(e.latlng).addTo(map).bindPopup(e.title));
  });

  window.socket.on('reportAdded', report => {
    events.push(report);
    L.marker(report.latlng).addTo(map).bindPopup(report.title);
    renderEvents();
  });

  window.socket.on('statusToggled', ({ index, status }) => {
    events[index].status = status;
    renderEvents();
  });
}

const eventList = document.getElementById('eventList');

// 渲染事件列表
function renderEvents() {
  eventList.innerHTML = '';
  events.forEach((e, i) => {
    const div = document.createElement('div');
    div.className = 'event' + (e.status === 'done' ? ' done' : '');
    div.innerHTML = `<strong>${e.title}</strong><br>
      Type: ${e.type}<br>
      Postal Code: ${e.postalCode || 'N/A'}<br>
      Status: ${e.status}<br>`;
    const btn = document.createElement('button');
    btn.innerText = e.status === 'pending' ? 'Done' : 'To be done';
    btn.onclick = () => {
      //events[i].status = events[i].status === 'pending' ? 'done' : 'pending';
      const newStatus = events[i].status === 'pending' ? 'done' : 'pending';
      socket.emit('toggleStatus', { index: i, status: newStatus });
      //renderEvents();
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
//events.forEach(e => {
  //L.marker(e.latlng).addTo(map).bindPopup(e.title);
//});

renderEvents();
