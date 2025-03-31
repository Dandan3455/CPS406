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

  const report = {
    desc,
    postalCode,
    email,
    latlng,
    type: finalType,
  };

  // Step 1: Validate required fields (email, desc, postalCode)
  if (validateReportFields(report)) return;

  // Step 2: Behavior-based scoring
  const result = isFakeReport(report);
  const emailKey = email.toLowerCase();

  if (!window.emailScores) window.emailScores = {};
  if (!window.emailScores[emailKey]) window.emailScores[emailKey] = 0;

  window.emailScores[emailKey] += result.score;

  // Step 3: If email is blocked
  if (window.emailScores[emailKey] >= 5) {
    setError("submitError", "Your email has been blocked due to repeated abuse.");
    return;
  }

  // Step 4: If this report triggered offensive score
  if (result.blocked) {
    const current = window.emailScores[emailKey];
    setError("submitError", `${result.reason} You've been penalized 2 points. Current score: ${current}/5.`);
    return;
  }

  // Step 5: Submit report
  const newReport = {
    // title: desc,
    desc: desc,
    type: finalType,
    postalCode: postalCode,
    image: imageURL,
    email: email,
    status: status,
    address: address || '',
    latlng: latlng,
  };

  if (window.socket?.emit) {
    socket.emit('newReport', newReport); // storing report on server
  } else {
    const marker = L.marker(latlng).addTo(map).bindPopup(desc);
    events.push(newReport);
    renderEvents();
  }

  closeModal();
  alert("Thanks for your report!");
}
