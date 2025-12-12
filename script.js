let reports = []

function renderReports(){
    let container = document.getElementById("reportsList")
    container.innerHTML = ""
    for (let i = 0;i < reports.length;i++){
        let r = reports[i]
        let item = document.createElement("div")
        item.innerHTML = `
            <p><strong>${r.medicine}</strong>(${r.status})</p>
            <p>${r.store}</p>
            <p>${r.notes}</p>
            <small>${r.timestamp}</small>
            <hr>
        `
        container.appendChild(item)
    }
}

document.getElementById("submitButton").addEventListener("click", () =>{
    let med = document.getElementById("reportMed").value;
    let status = document.getElementById("reportStatus").value;
    let store = document.getElementById("reportStore").value;
    let notes = document.getElementById("reportNotes").value;

     if (!selectedLocation) {
        alert("Please click on the map to pick a location.");
        return;
    }

    let report = {
        medicine:med,
        status:status,
        store:store,
        notes:notes,
        timestamp: new Date().toLocaleString(),//used Chatgpt to do this
        lat: selectedLocation.lat,   // location added
        lng: selectedLocation.lng
    }
    reports.push(report)
    renderReports()
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