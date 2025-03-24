let pendingLatlng = null;

function openModal(latlng = null) {
  pendingLatlng = latlng;
  document.getElementById('desc').value = '';
  document.getElementById('type').value = 'Pothole';
  document.getElementById('image').value = '';
  document.getElementById('email').value = '';
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('reportModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('reportModal').style.display = 'none';
  pendingLatlng = null;
}

function submitForm(events, map, renderEvents) {
  const desc = document.getElementById('desc').value.trim();
  const type = document.getElementById('type').value;
  const email = document.getElementById('email').value.trim();
  const postalCode = document.getElementById('postalCode').value.trim(); // 获取邮编
  const latlng = pendingLatlng || map.getCenter();

  // 🔍 调用虚假报告判定函数
  if (isFakeReport({ desc, postalCode, email, latlng, type })) {
    alert("Submission blocked: suspicious or invalid report.");
    return;
  }

  // 基础字段验证（描述）
  if (!desc) {
    alert("Please enter a description.");
    return;
  }

  // 正常流程
  const marker = L.marker(latlng).addTo(map).bindPopup(desc);
  events.push({ title: desc, type, status: 'pending', latlng, email, postalCode });
  renderEvents();
  closeModal();
  alert("Thanks for your report!");
}


