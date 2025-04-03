let range;
let circles = [];
let eventsInRange = [];

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
    if (postal_code.at(0) !== 'M') {
        return
    }
    const eventsInRangeContainer = document.getElementById("events_in_range_container")
    const eventsInRangeDOM = document.getElementById("eventInRange")
    eventsInRangeContainer.style.display = "none"
    eventsInRangeDOM.style.display = "none"
    // Grab Latitude and Longitube using postal code
    fetch(
        `https://geocoder.ca/?locate=${postal_code}&geoit=XML&json=1`
    ).then((response) => {
        if (response.ok) {
            return response.json();
        }
    }).then((data) => {
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
        let lat;
        let long;
        if (data) {
            lat = data.latt;
            long = data.longt;
        } else {
            lat = 43.660624;
            long = -79.365955;
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
        eventsInRange.forEach(ev => {
            const div = document.createElement("div")
            div.innerHTML = `
<div class='individual-event ${ev.status === "Solved" ? "solved-edge" : "pending-edge"}'>
    <strong>Description: ${ev.desc}</strong>
    <i>Type: ${ev.type}</i>
    <i>Address: ${ev.address}</i>
    <div class="event-status-mark">
        ${ev.status === "Solved" ?
                    '<i class="fa-solid fa-check" style="color: #028a0f;"></i>' :
                    '<i class="fa-solid fa-hourglass-half" style="color: #FFD43B;"></i>'}
        <i>${ev.status}</i>
    </div>
</div>`;
            div.querySelector(".individual-event").addEventListener("click", () => {
                viewEvent(ev)
            });
            eventsInRangeDOM.appendChild(div)
        })
        if (eventsInRange.length !== 0) {
            setTimeout(() => {
                eventsInRangeContainer.style.display = "block"
                eventsInRangeDOM.style.display = "block"
            }, 750)
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
    document.getElementById("events_in_range_container").style.display = "none"
    document.getElementById("eventInRange").style.display = "none"
}

function viewEvent(ev) {
    console.log("View Event: ", ev)
    const individualEvent = document.getElementById("individual-event-view")
    individualEvent.style.display = "block"
    individualEvent.innerHTML = `
<i class="fa-solid fa-xmark" onclick="closeIndividualEventModal()"></i>
<div>
    <h2>${ev.desc}</h2>
    <h4><i>${ev.type}</i></h4>
    <p>${ev.postalCode}<br/>${ev.status}</p>
    <img src="${ev.image}">
</div>
`
}

function closeIndividualEventModal() {
    document.getElementById("individual-event-view").style.display = "none"
}
