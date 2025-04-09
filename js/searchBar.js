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

        const latlng = L.latLng(lat, long)

        // Navigate to the specified postal code and putting all the markers for all the valid locations
        map.flyTo([lat, long], 17 - Math.ceil(range / 200) / 2, {
            duration: 0.9,
        });
        events.forEach((e) => {
            const distance = map.distance(latlng, L.latLng(e.latlng.lat, e.latlng.lng))
            if (distance <= range) {
                eventsInRange.push(e)
            }
        })
        let circle = L.circle([lat, long], {
            color: "#0f67aa",
            fillColor: "#52ceff",
            fillOpacity: 0.5,
            radius: getMapRadius(),
        }).addTo(map);
        circles.push(circle);
        eventsInRange.forEach(ev => {
            const div = document.createElement("div")
            div.innerHTML = `
<div class='individual-event ${ev.status === "Solved" ? "solved-edge" : "pending-edge"}'>
    <strong>Reference Number: ${ev.referencenumber}</strong>
    <i>Type: ${ev.type}</i>
    <i>Postal Code: ${ev.postalCode}</i>
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

function getMapRadius() {
    return 1.10 * range
}

function closeEventInRangeModal() {
    document.getElementById("events_in_range_container").style.display = "none"
    document.getElementById("eventInRange").style.display = "none"
    closeIndividualEventModal()
}

function viewEvent(ev) {
    const date = new Date(ev.time);
    const pad = (n) => n.toString().padStart(2, '0');
    const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    const individualEvent = document.getElementById("individual-event-view")
    document.getElementById("individual-event-view-header").textContent = `Report: ${ev.referencenumber}`
    document.getElementById("individual-event-view-subheader").textContent = `Type: ${ev.type}`
    document.getElementById("individual-event-view-time").textContent = `Time: ${formatted}`
    document.getElementById("individual-event-view-description").textContent = `Description: ${ev.desc}`
    document.getElementById("individual-event-view-address").textContent = `Address: ${ev.address}`
    document.getElementById("individual-event-view-postalCode").textContent = `Postal Code: ${ev.postalCode}`
    document.getElementById("individual-event-view-govDept").textContent = `Government Department: ${ev.govDept}`
    document.getElementById("individual-event-view-govDeptEmail").textContent = `Department Email: ${ev.govDeptEmail}`
    document.getElementById("individual-event-view-status").innerHTML = `
Status: <i>${ev.status}</i>
${ev.status === "Solved" ?
            '<i class="fa-solid fa-check" style="color: #028a0f;"></i>' :
            '<i class="fa-solid fa-hourglass-half" style="color: #FFD43B;"></i>'}
`
    document.getElementById("individual-event-view-image").src = ev.image
    document.getElementById("individual-event-view-image").style.maxWidth = "100%"
    individualEvent.style.display = "block"
}

function closeIndividualEventModal() {
    document.getElementById("individual-event-view").style.display = "none"
}
