//let pendingLatlng = null;
window.pendingLatlng = null; // making it global as I was having issues due to it not initialising 

function openModal(latlng = null) {
  pendingLatlng = latlng;
  document.getElementById('postalCode').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('type').value = 'Pothole';
  document.getElementById('customType').style.display = 'none';
  document.getElementById('customType').value = '';
  document.getElementById('image').value = '';
  document.getElementById('email').value = '';
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('reportModal').style.display = 'block'; // added a few variables
}

function closeModal() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('reportModal').style.display = 'none';
  pendingLatlng = null;
}

function handleTypeChange() {
  const type = document.getElementById('type').value;
  if (type === 'Other') {
    document.getElementById('customType').style.display = 'block';
  } else {
    document.getElementById('customType').style.display = 'none';
  }
}

function submitForm(events, map, renderEvents) {
  const desc = document.getElementById('desc').value.trim();
  const type = document.getElementById('type').value;
  const email = document.getElementById('email').value.trim();
  const postalCode = document.getElementById('postalCode').value.trim();
  const customTypeInput = document.getElementById('customType').value.trim();
  const imageInput = document.getElementById('image');
  const status = 'pending';
  const address = null;
  let imageURL = '';

  if (imageInput.files && imageInput.files[0]) {
    imageURL = URL.createObjectURL(imageInput.files[0]);
  }
  const finalType = (type === 'Other' && customTypeInput !== '') ? customTypeInput : type;
  const latlng = pendingLatlng || map.getCenter();


  if (isFakeReport({ desc, postalCode, email, latlng, type })) {
    alert("Submission blocked: suspicious or invalid report.");
    return;
  }

  if (!desc) {
    alert("Please enter a description.");
    return;
  }


  /* 

  commented these out due to them being implemented in the socket.io functions, just
  remove the block comment if that is removed

  const marker = L.marker(latlng).addTo(map).bindPopup(desc);
  events.push({ title: desc, type, status: 'pending', latlng, email, postalCode });
  renderEvents();
  */
  const newReport = { 
    title:        desc,
    type:         finalType,
    postalCode:   postalCode,
    image:        imageURL,
    email:        email,
    status:       status,
    address:      address || '',
    latlng:       latlng
  };
    if (window.socket?.emit) {
    socket.emit('newReport', newReport);// storing report in json on node server
  } else {
    const marker = L.marker(latlng).addTo(map).bindPopup(desc);// store locally if user is not hosting server
    events.push({ title: desc, type, status: 'pending', latlng, email, postalCode });
    renderEvents();
}
  closeModal();
  alert("Thanks for your report!");
}


