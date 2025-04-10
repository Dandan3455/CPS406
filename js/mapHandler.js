// initialise map
const map = L.map('map').setView([43.6532, -79.3832], 13); // Toronto
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Ensure global events array exists and is used everywhere.
window.events = window.events || [];
let events = window.events;

// Fetch events from JSON and update the global events array without reassigning it.
fetch('/events.json')
  .then(res => res.json())
  .then(data => {
    // Clear the existing global events array but keep the same reference.
    events.length = 0;
    data.forEach(item => events.push(item));
    renderEvents();
    // Draw initial markers from the JSON.
    events.forEach(e => L.marker(e.latlng).addTo(map).bindPopup(e.desc));
    initSocket();
  })
  .catch(err => console.error('Failed to load events.json:', err));

window.socket = io();

function initSocket() { // for storing JSON on node server
  window.socket.on('initialEvents', serverEvents => {
    // Instead of reassigning events, clear and push new items.
    events.length = 0;
    serverEvents.forEach(item => events.push(item));
    renderEvents();
    events.forEach(e => L.marker(e.latlng).addTo(map).bindPopup(e.desc));
  });

  window.socket.on('reportAdded', report => {
    events.unshift(report);
    L.marker(report.latlng).addTo(map).bindPopup(report.desc);
    renderEvents();
  });

  window.socket.on('statusToggled', ({ index, status }) => {
    events[index].status = status;
    renderEvents();
  });
}

const eventList = document.getElementById('eventList');

// 渲染事件列表
// function renderEvents() {
//   eventList.innerHTML = '';
//   events.forEach((e, i) => {
//     const div = document.createElement('div');
//     // Add class "done" if status is done; and you can also add a class for duplicate if desired.
//     let classes = 'event';
//     if (e.status === 'done') classes += ' done';
//     if (e.status === 'duplicate') classes += ' duplicate';
//     div.className = classes;
//     div.innerHTML = `<strong>${e.title}</strong><br>Type: ${e.type}<br>Status: ${e.status}<br>`;
//     eventList.appendChild(div);
//   });
// }


function renderEvents() {
  eventList.innerHTML = '';
  events.forEach((e, i) => {
    const div = document.createElement('div');
    let classes = 'event';
    if (e.status === 'done') classes += ' done';
    if (e.status === 'duplicate') classes += ' duplicate';
    div.className = classes;
    if (e.status === 'Solved') {
      div.style.backgroundColor = 'lightgreen';
    } else if (e.status === 'Pending') {
      div.style.backgroundColor = 'lightyellow';
    }
    else if (e.status === 'duplicate') {
      div.style.backgroundColor = 'orange';
    }
    const ref = e.referencenumber || e["referencenumber"];
    div.innerHTML = `
      <strong>📍 ${e.postalCode || 'Unknown Location'}</strong><br>
      Details: ${e.desc}<br>
      Type: ${e.type}<br>
      Status: ${e.status}<br>
      ReferenceNumber: ${ref}
    `;

    eventList.appendChild(div);
  });
}


// When the map is clicked, open the report modal with the clicked latlng.
map.on('click', e => {
  openModal(e.latlng);
});

map.on('click', async e => {
  const latlng = e.latlng;
  openModal(latlng);

  try {
    const postalCode = await getPostalCodeFromLatLng(latlng.lat, latlng.lng);
    if (isTorontoPostalCode(postalCode)) {
      document.getElementById('postalCode').value = postalCode;
    } else {
      alert('Selected location is out of Toronto range.');
    }
  } catch (err) {
    console.error('Failed to fetch postal code:', err);
    alert('Failed to fetch postal code. Please try again.');
  }
});



// When the report button is clicked, open the report modal.
document.getElementById('reportBtn').addEventListener('click', () => {
  openModal();
});

// When the submit button is clicked, call submitForm.
// (submitForm is defined in your formHandler.js.)
document.getElementById('submitForm').addEventListener('click', () => {
  submitForm(events, map, renderEvents);
});

//When the search bar button is clicked
document.getElementById('searchPostalCode').addEventListener('click', () => {
  searchPostalCode(map)
})



renderEvents();

async function getPostalCodeFromLatLng(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.address && data.address.postcode) {
    return data.address.postcode;
  } else {
    throw new Error("Postal code not found");
  }
}

function isTorontoPostalCode(postalCode) {
  return postalCode.trim().toUpperCase().startsWith("M");
}
