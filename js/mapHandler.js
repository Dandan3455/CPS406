// 初始化地图
const map = L.map('map').setView([43.6532, -79.3832], 13); // Toronto
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 模拟事件数据（如果 data.js 存在则使用）
// could not get this line to work, wont read from data.js no matter what i do, so i wrote some other code that fetches form the json 
//let events = typeof mockReports !== 'undefined' ? [...mockReports] : [];
let events = [];// make event an empty list and fetch it from the json file on start
fetch('/events.json')
  .then(res => res.json())
  .then(data => {
    events = data;
    renderEvents();
    // Draw initial markers from the JSON
    events.forEach(e => L.marker(e.latlng).addTo(map).bindPopup(e.title));
    // Then connect to socket
    if (typeof io !== 'undefined') {// makesure io exist, that means it is launched through node.js, if not, all server related functions will be stopped and store reports locally
      window.socket = io();
      initSocket();
    }
  })
.catch(err => console.error('Failed to load events.json:', err));
function initSocket() { // for storing json on node server
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
    div.innerHTML = `<strong>${e.title}</strong><br>Type: ${e.type}<br>Status: ${e.status}<br>`;
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

