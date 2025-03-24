let pendingLatlng = null;

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
  document.getElementById('reportModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('reportModal').style.display = 'none';
  pendingLatlng = null;
}

// Show custom type field if "other" is selected
function handleTypeChange() {
  const type = document.getElementById('type').value;
  if (type === 'Other') {
    document.getElementById('customType').style.display = 'block';
  } else {
    document.getElementById('customType').style.display = 'none';
  }
}

function isValidEmail(email) {
  // This regex checks for the presence of characters before and after "@" and a dot in the domain
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function submitForm(events, map, renderEvents) {
  const desc = document.getElementById('desc').value.trim();
  const type = document.getElementById('type').value;
  const email = document.getElementById('email').value.trim();
  const postalCode = document.getElementById('postalCode').value.trim();
  const customTypeInput = document.getElementById('customType').value.trim();
  const imageInput = document.getElementById('image');
  const solved = false;
  const address = null;
  let imageURL = '';
  if (imageInput.files && imageInput.files[0]) {
    // Create an object URL for preview; note: for real storage, you'll need to upload the file.
    imageURL = URL.createObjectURL(imageInput.files[0]);


  }
  
  // Use custom type if "Other" is selected and a custom value is provided
  const finalType = (type === 'Other' && customTypeInput !== '') ? customTypeInput : type;
  
  const latlng = pendingLatlng || map.getCenter();

  let errorMessage = [];

  if (isFakeReport({ desc, postalCode, email, latlng, type })) {
    errorMessage.push("Submission blocked: suspicious or invalid report.\n");
  }

  /*
  if (!desc) {
    errorMessage.push("Please enter a description.\n");
  }

  if (!postalCode) {
    errorMessage.push("Please enter a postal code\n");
  }
  */

  if (!isValidEmail(email)) {
    errorMessage.push("Please enter a valid email address for future updates\n");
  }
  
  // more error handling code (duplication, not valid email,)

  if (errorMessage.length > 0){
    alert(errorMessage.join("\n"));
    return;
  }

  L.marker(latlng).addTo(map).bindPopup(desc);

  const marker = L.marker(latlng).addTo(map).bindPopup(desc);
  events.push({ title: desc, type: finalType, postalCode, status: 'pending', latlng, email });
  renderEvents();
  closeModal();
  alert("Thanks for your report!");
}
