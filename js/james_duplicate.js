// js/james_duplicate.js

(function() {
  // Duplicate detection threshold in meters.
  const DUPLICATE_THRESHOLD = 100;

  // Haversine formula: calculates distance (in meters) between two lat/lng points.
  function getDistance(latlng1, latlng2) {
    const R = 6371e3; // Earth's radius in meters.
    const lat1 = latlng1.lat * Math.PI / 180;
    const lat2 = latlng2.lat * Math.PI / 180;
    const deltaLat = (latlng2.lat - latlng1.lat) * Math.PI / 180;
    const deltaLng = (latlng2.lng - latlng1.lng) * Math.PI / 180;
    const a = Math.sin(deltaLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Ensure global events array exists on window.
  if (typeof window.events === "undefined") {
    console.warn("Global 'events' array not found. Creating one on window.events.");
    window.events = [];
  }
  // Force local variable events to refer to window.events.
  events = window.events;

  // Save the original push method.
  const originalPush = events.push;

  // Override the push method so that new events get marked as duplicate if needed.
  events.push = function(newEvent) {
    let duplicateOf = null;
    // Loop through current events.
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.latlng && newEvent.latlng) {
        const distance = getDistance(event.latlng, newEvent.latlng);
        if (distance < DUPLICATE_THRESHOLD && event.type === newEvent.type) {
          duplicateOf = event.postalCode;
          break;
        }

      }
    }
    if (duplicateOf) {
      newEvent.status = "duplicate";
      newEvent.duplicateOf = duplicateOf;
      newEvent.desc = newEvent.desc + " (duplication of \"" + duplicateOf + "\")";

    }
    return originalPush.call(events, newEvent);
  };

  // Optionally override renderEvents to style duplicate events with an orange background.
  if (typeof window.renderEvents === "function") {
    const originalRenderEvents = window.renderEvents;
    window.renderEvents = function() {
      originalRenderEvents();
      // After the original render, style duplicate events.
      const eventList = document.getElementById("eventList");
      if (eventList) {
        // Iterate through child divs.
        Array.from(eventList.children).forEach(div => {
          if (div.innerHTML.indexOf("Status: duplicate") !== -1) {
            div.style.backgroundColor = "orange";
          }

        });
      }
    };
  }

  // Expose helper functions/constants globally if needed.
  window.getDistance = getDistance;
  window.DUPLICATE_THRESHOLD = DUPLICATE_THRESHOLD;
})();



