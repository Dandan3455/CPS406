let range;
let circles = [];
let eventsInRange = [];

//M6J 2V5
/* const testData = [
    {
        title: "Pothole near Midland Ave",
        type: "Road Damage",
        postalCode: "M1M1R5",
        image: "pothole1.jpg",
        email: "user1@mail.com",
        solved: false,
        address: "123 Midland Ave, Scarborough, ON",
        latlng: { lat: 43.7328, lng: -79.2685 }, // ✅ ~100m away
    },
    {
        title: "Cracked Sidewalk on Danforth Rd",
        type: "Pavement Issue",
        postalCode: "M1J3H6",
        image: "sidewalk.jpg",
        email: "user2@mail.com",
        solved: true,
        address: "456 Danforth Rd, Scarborough, ON",
        latlng: { lat: 43.7341, lng: -79.2687 }, // ✅ ~250m away
    },
    {
        title: "Traffic Light Issue at Kennedy Rd",
        type: "Signal Issue",
        postalCode: "M1K4A3",
        image: "trafficlight.jpg",
        email: "user3@mail.com",
        solved: false,
        address: "789 Kennedy Rd, Toronto, ON",
        latlng: { lat: 43.7355, lng: -79.2689 }, // ✅ ~400m away
    },
    {
        title: "Large Pothole on Eglinton Ave",
        type: "Pothole",
        postalCode: "M4A1N1",
        image: "pothole2.jpg",
        email: "user4@mail.com",
        solved: false,
        address: "202 Eglinton Ave, Toronto, ON",
        latlng: { lat: 43.7373, lng: -79.2691 }, // ✅ ~600m away
    },
    {
        title: "Broken Streetlight on Birchmount Rd",
        type: "Lighting Issue",
        postalCode: "M1K2J3",
        image: "streetlight.jpg",
        email: "user5@mail.com",
        solved: false,
        address: "303 Birchmount Rd, Scarborough, ON",
        latlng: { lat: 43.7387, lng: -79.2694 }, // ✅ ~750m away
    },
    {
        title: "Flooding on St. Clair Ave",
        type: "Flooding",
        postalCode: "M1L3Z5",
        image: "flooding.jpg",
        email: "user6@mail.com",
        solved: true,
        address: "404 St. Clair Ave, Toronto, ON",
        latlng: { lat: 43.74, lng: -79.2698 }, // ✅ ~900m away
    },
    {
        title: "Debris on Kingston Rd",
        type: "Debris Issue",
        postalCode: "M1N1R1",
        image: "debris.jpg",
        email: "user7@mail.com",
        solved: false,
        address: "505 Kingston Rd, Toronto, ON",
        latlng: { lat: 43.7409, lng: -79.27 }, // ✅ ~1000m away
    },
    {
        title: "Road Blockage near Lawrence Ave",
        type: "Obstruction",
        postalCode: "M1E2T8",
        image: "roadblock.jpg",
        email: "user8@mail.com",
        solved: false,
        address: "606 Lawrence Ave, Toronto, ON",
        latlng: { lat: 43.743, lng: -79.2715 }, // ❌ ~1200m away (outside max range)
    },
]; */

document.addEventListener("DOMContentLoaded", () => {
    // Setting the range value
    const rangeInput = document.getElementById("range");
    const rangeValue = document.getElementById("range_value");
    function updateRangeValue() {
        rangeValue.textContent = `${rangeInput.value}m`;
        range = Number(rangeInput.value);
    }
    rangeInput.addEventListener("input", updateRangeValue);
    updateRangeValue();
});

function searchPostalCode(map) {
    const postal_code = document.getElementById("postal_code").value;
    if (postal_code.at(0)!=='M'){
        return
    }
    const eventsInRangeDOM = document.getElementById("eventInRange")
    eventsInRangeDOM.style.display = "none"
    // Grab Latitude and Longitube using postal code
    fetch(
        `https://geocoder.ca/?locate=${postal_code}&geoit=XML&json=1`
    ).then((response) => {
        if (response.ok) {
            return response.json();
        }
    }).then((data) => {
        const lat = data.latt;
        const long = data.longt;

        // Remove existing circles and markers from the map
        if (circles.length !== 0) {
            circles.forEach((c) => map.removeLayer(c));
            circles = [];
        }
        if (eventsInRange.length !== 0) {
            eventsInRange = []
            eventsInRangeDOM.innerHTML = `<div>
                <i class="fa-solid fa-xmark" onclick="closeEventInRangeModal()"></i>
            </div>`
        }

        // Navigate to the specified postal code and putting all the markers for all the valid locations
        map.flyTo([lat, long], 17 - Math.ceil(range / 200) / 2, {
            duration: 0.9,
        });
        let circle = L.circle([lat, long], {
            color: "#0f67aa",
            fillColor: "#52ceff",
            fillOpacity: 0.5,
            radius: getMapRadius(),
        }).addTo(map);
        circles.push(circle);
        events.forEach((e) => {
            if (isWithinRange(lat, long, e.latlng.lat, e.latlng.lng)) {
                eventsInRange.push(e)
            }
        })
        console.log(eventsInRange)
        eventsInRange.forEach(ev => {
            const div = document.createElement("div")
            div.innerHTML = `
<div class="displayReport">
    <strong>Title: ${ev.title}</strong>
    <p>Type: ${ev.type}</p>
    <p>Postal Code: ${ev.postalCode}</p>
    <p>Email: ${ev.email}</p>
    <p>Status: ${ev.status}</p>
    <p>Address: ${ev.address}</p>
    <p>Latitude: ${ev.latlng.lat}</p>
    <p>Longitude: ${ev.latlng.lng}</p>
</div>`
            eventsInRangeDOM.appendChild(div)
        })
        if (eventsInRange.length !== 0){
            eventsInRangeDOM.style.display = "block"
        }
    }).catch((err) => {
        console.log(err)
    });
}

function haversine(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000;
    const rad = Math.PI / 180;
    const phi1 = lat1 * rad;
    const phi2 = lat2 * rad;
    const deltaPhi = (lat2 - lat1) * rad;
    const deltaLambda = (lon2 - lon1) * rad;
    const a =
        Math.sin(deltaPhi / 2) ** 2 +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
}

function isWithinRange(lat1, lon1, lat2, lon2) {
    const dist = haversine(lat1, lon1, lat2, lon2);
    return dist <= range;
}

function getMapRadius() {
    return 1.20 * range
}

function closeEventInRangeModal() {
    document.getElementById("eventInRange").style.display = "none"
}
