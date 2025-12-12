let reports = []
let allReports = []
let alternatives = {
    "Neuflo": ["Danzen", "Leftose"],
    "Danzen": ["Leftose", "Neuflo"],
    "Leftose": ["Danzen", "Neuflo"],
    "Zyrtec": ["Loratadine", "Cetirizine"],
    "Loratadine":["Zyrtec","Cetirizine"],
    "Cetirizine":["Zyrtec","Loratadine"],
    "ART test kit": ["COVID self-test kit (other brands)"]
};
function minutesSince(timestamp) {
    let now = new Date()
    let then = new Date(timestamp);
    return Math.floor((now - then) / 60000);
}

function getConfidence(minutes) {
    if (minutes <= 120) return "High confidence";
    if (minutes <= 360) return "Medium confidence";
    return "Low confidence";
}

function renderReports() {
    let container = document.getElementById("reportsList");
    container.innerHTML = "";

    for (let i = 0; i < reports.length; i++) {
        let r = reports[i];
        let mins = minutesSince(r.timestamp);
        let confidence = getConfidence(mins);

        let color =
            confidence === "High confidence" ? "#10b981" :
            confidence === "Medium confidence" ? "#f59e0b" :
            "#ef4444";

        let item = document.createElement("div");
        item.innerHTML = `
            <p>
                <strong>${r.medicine}</strong> (${r.status})
                <span style="color:#64748b; font-size:0.85em;">
                    • ${r.category}
                </span>
            </p>
            <p>${r.store}</p>
            <p>${r.notes}</p>
            <small>
                ${mins} min ago • 
                <span style="color:${color}; font-weight:600;">
                    ${confidence}
                </span>
            </small>
            <hr>
        `;

        container.appendChild(item);
    }
}
//AI
function renderRiskSummary() {
    let summary = {};

    for (let r of reports) {
        if (!summary[r.medicine]) {
            summary[r.medicine] = {
                inStock: 0,
                lowStock: 0,
                outStock: 0,
                lastSeen: null
            };
        }

        if (r.status === "IN_STOCK") {
            summary[r.medicine].inStock++;
            summary[r.medicine].lastSeen = r.timestamp;
        } else if (r.status === "LOW_STOCK") {
            summary[r.medicine].lowStock++;
        } else {
            summary[r.medicine].outStock++;
        }
    }

    return summary;
}

function showRiskSummary() {
    let container = document.getElementById("riskList");
    container.innerHTML = "";

    let summary = renderRiskSummary();

    for (let med in summary) {
        let s = summary[med];

        let risk =
            s.outStock > 0 ? "High risk" :
            s.lowStock > 0 ? "Medium risk" :
            "Low risk";

        let color =
            risk === "High risk" ? "#ef4444" :
            risk === "Medium risk" ? "#f59e0b" :
            "#10b981";

        let lastSeenText = s.lastSeen
            ? `${minutesSince(s.lastSeen)} min ago`
            : "No recent in-stock reports";

        let hasAlternatives = alternatives[med];

        let item = document.createElement("div");

        item.innerHTML = `
            <p><strong>${med}</strong></p>
            <p style="color:${color}; font-weight:600;">${risk}</p>
            <small>Last seen available: ${lastSeenText}</small>

            ${
                hasAlternatives
                ? `
                    <p class="toggle-alt" style="cursor:pointer; color:#2563eb; font-weight:600; margin-top:8px;">
                        Show alternatives
                    </p>
                    <div class="alt-list" style="display:none; margin-top:6px;">
                        <ul>
                            ${alternatives[med].map(a => `<li>${a}</li>`).join("")}
                        </ul>
                    </div>
                    <p style="margin-top:6px; font-size:0.75rem; color:#6b7280;">
                        Disclaimer: Alternatives shown are for general reference only. Please consult a pharmacist or healthcare professional.
                    </p>
                  `
                : `
                    <p style="font-size:0.85rem; margin-top:6px; color:#6b7280;">
                        Common alternatives not updated yet
                    </p>
                  `
            }
        `;

        let toggle = item.querySelector(".toggle-alt");
        let list = item.querySelector(".alt-list");

        if (toggle && list) {
            toggle.addEventListener("click", () => {
                let open = list.style.display === "block";
                list.style.display = open ? "none" : "block";
                toggle.textContent = open ? "Show alternatives" : "Hide alternatives";
            });
        }

        container.appendChild(item);
    }
}

//END OF AI

document.getElementById("submitButton").addEventListener("click", () =>{
    let med = document.getElementById("reportMed").value;
    let status = document.getElementById("reportStatus").value;
    let store = document.getElementById("reportStore").value;
    let notes = document.getElementById("reportNotes").value;

     if (!selectedLocation) {
        alert("Please click on the map to pick a location.");
        return;
    }
    let category = document.getElementById("reportCategory").value;
    let report = {
        medicine:med,
        category:category,
        status:status,
        store:store,
        notes:notes,
        timestamp: new Date().toISOString(), //used Chatgpt to do this
        lat: selectedLocation.lat,   // location added
        lng: selectedLocation.lng
    }
    allReports.push(report);
    reports = [...allReports];
    renderReports()
    showRiskSummary()
    renderMapReports();
})
// AI for the map
let selectedLocation = null;

const map = L.map("map").setView([1.3521, 103.8198], 12); // Singapore default coords

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(map);
let reportMarkers = L.layerGroup().addTo(map);


let marker = null;

function renderMapReports() {
    reportMarkers.clearLayers();

    for (let r of reports) {
        let color =
            r.status === "IN_STOCK" ? "#10b981" :
            r.status === "LOW_STOCK" ? "#f59e0b" :
            "#ef4444";

        L.circleMarker([r.lat, r.lng], {
            radius: 9,
            color: color,
            fillColor: color,
            fillOpacity: 0.35,   
            weight: 3,           
            opacity: 0.9
        })

        .bindPopup(`
            <strong>${r.medicine}</strong><br>
            ${r.status}<br>
            ${r.store}<br>
            ${minutesSince(r.timestamp)} min ago
        `)
        .addTo(reportMarkers);
    }
}

// When user clicks map → save location + show marker
map.on("click", function(e) {
    selectedLocation = e.latlng;

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);

    console.log("Selected location:", selectedLocation);
});
setTimeout(()=>{
    map.invalidateSize();
},200);
//END of AI


document.getElementById("searchButton").addEventListener("click", () => {
    let searchText = document.getElementById("medSearch").value.toLowerCase()
    let radius = document.getElementById("radiusSelect").value

    let filtered = []

    for (let r of allReports) {
        if (!r.medicine.toLowerCase().includes(searchText)) continue;

        if (radius !== "none" && selectedLocation) {
            let dist = getDistanceKm(
                selectedLocation.lat,
                selectedLocation.lng,
                r.lat,
                r.lng
            )

            if (dist > Number(radius)) continue;
        }

        filtered.push(r)
    }

    reports = filtered
    renderReports()
    showRiskSummary()
    renderMapReports()
})


function showResults(list) {
    let container = document.getElementById("reportsList")
    container.innerHTML = ""

    for (let i = 0; i < list.length; i++) {
        let r = list[i]

        let item = document.createElement("div")
        item.innerHTML = `
            <p><strong>${r.medicine}</strong> (${r.status})</p>
            <p>${r.store}</p>
            <p>${r.notes}</p>
            <small>${r.timestamp}</small>
            <hr>
        `
        container.appendChild(item)
    }
}
//USED AI FOR RUNSEARCHWITHRADIUS
function runSearchWithRadius(searchText, radius, userLocation) {
    let results = [];

    for (let r of reports) {
        if (!r.medicine.toLowerCase().includes(searchText)) continue;

        if (radius !== "none") {
            let distance = getDistanceKm(
                userLocation.lat,
                userLocation.lng,
                r.lat,
                r.lng
            );

            if (distance > Number(radius)) continue;
        }

        results.push(r);
    }

    showResults(results);
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
    let R = 6371;
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLng = (lng2 - lng1) * Math.PI / 180;

    let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
