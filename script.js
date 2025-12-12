let reports = []
function minutesSince(timestamp) {
    let now = new Date();
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

        let item = document.createElement("div");
        item.innerHTML = `
            <p><strong>${med}</strong></p>
            <p style="color:${color}; font-weight:600;">${risk}</p>
            <small>Last seen available: ${lastSeenText}</small>
        `;

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
        timestamp: new Date().toLocaleString(),//used Chatgpt to do this
        lat: selectedLocation.lat,   // location added
        lng: selectedLocation.lng
    }
    reports.push(report)
    renderReports()
    showRiskSummary()
})
// AI for the map
let selectedLocation = null;

const map = L.map("map").setView([1.3521, 103.8198], 12); // Singapore default coords

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(map);

let marker = null;

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

document.getElementById("searchButton").addEventListener("click",function(){
    let searchText = document.getElementById("medSearch").value.toLowerCase()
    let results = []
    for (let i = 0; i < reports.length; i++) {
        let medName = reports[i].medicine.toLowerCase();
        if (medName.includes(searchText)) {
            results.push(reports[i])
        }
    }

    showResults(results)
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