let events = [];
    const eventList = document.getElementById('eventList');
    
    // Threshold for duplicate detection in meters.
    const DUPLICATE_THRESHOLD = 50;

    // Haversine formula to calculate distance between two points in meters.
    function getDistance(latlng1, latlng2) {
      const R = 6371e3; // Earth's radius in meters
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

map.on('click', (e) => {
      const title = prompt('Description:');
      if (title) {
        // Check if there's an existing event within the threshold distance.
        let duplicateOf = null;
        events.forEach(event => {
          if (event.latlng) {
            const distance = getDistance(event.latlng, e.latlng);
            if (distance < DUPLICATE_THRESHOLD && !duplicateOf) {
              duplicateOf = event.title;
            }
          }
        });

        // Determine status based on duplicate detection.
        const status = duplicateOf ? 'duplicated event' : 'pending';
        // Create marker on the map.
        const marker = L.marker(e.latlng).addTo(map).bindPopup(title);
        // Add event with determined status and duplicateOf reference.
        events.push({ title, status, latlng: e.latlng, duplicateOf: duplicateOf });
        renderEvents();
      }
    });
    
    
