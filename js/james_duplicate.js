// js/james_duplicate.js

(function(){
  // Define the duplicate detection threshold in meters.
  const DUPLICATE_THRESHOLD = 50;
  
  // Haversine formula: calculates the distance (in meters) between two lat/lng points.
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
  
  // Override the push method of the global 'events' array to perform duplicate detection.
  if (typeof events !== "undefined" && Array.isArray(events)) {
    const originalPush = events.push;
    events.push = function(newEvent) {
      // Check existing events for duplicates.
      let duplicateOf = null;
      for (let i = 0; i < this.length; i++) {
        const event = this[i];
        if (event.latlng && newEvent.latlng) {
          const distance = getDistance(event.latlng, newEvent.latlng);
          if (distance < DUPLICATE_THRESHOLD && !duplicateOf) {
            duplicateOf = event.title;
            break;
          }
        }
      }
      // If a duplicate is detected, mark the new event accordingly.
      if (duplicateOf) {
        newEvent.status = "duplicated event";
        newEvent.duplicateOf = duplicateOf;
      }
      // Otherwise, keep the original status (assumed to be set by caller, e.g., "pending").
      return originalPush.call(this, newEvent);
    };
  }
  
  // Optionally expose functions/constants globally if needed.
  window.getDistance = getDistance;
  window.DUPLICATE_THRESHOLD = DUPLICATE_THRESHOLD;
})();
