// ------------------------------
// Marker colours by photo type
// ------------------------------

const PHOTO_TYPE_COLOURS = {
    landscape: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",     // blue
    nature: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png", // green
    wildlife: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",  // red
    default: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png"    // grey fallback
};

function createPhotoIcon(type) {
    const iconUrl = PHOTO_TYPE_COLOURS[type] || PHOTO_TYPE_COLOURS.default;
    return L.icon({
        iconUrl,
        iconSize: [25, 41],       // Leaflet default size
        iconAnchor: [12, 41],     // tip of pin
        popupAnchor: [0, -36],
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
        shadowSize: [41, 41],
        shadowAnchor: [12, 41]
    });
}

// ------------------------------
// Marker storage by photo type
// ------------------------------

const markersByType = {};

// ------------------------------
// Base map initialisation
// ------------------------------

const map = L.map("photo-locations-map", {
    center: [54.5, -3.1], // UK-centric default (Lake District-ish)
    zoom: 6
});

// // Add marker clustering group
// const markerCluster = L.markerClusterGroup();
// map.addLayer(markerCluster);


// ------------------------------
// Tile layers
// ------------------------------

/*
 * OpenStreetMap
 */
const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }
);

/*
 * OpenTopoMap
 */
const openTopo = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 15,
        attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
    }
);

/*
 * Google Maps layers
 * Note: These are unofficial tile endpoints.
 * Fine for personal projects, but be aware of Google's ToS.
 */
const googleRoad = L.tileLayer(
    "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: '&copy; Google'
    }
);

const googleTerrain = L.tileLayer(
    "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: '&copy; Google'
    }
);

const googleSatellite = L.tileLayer(
    "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: '&copy; Google'
    }
);


// ------------------------------
// Layer control
// ------------------------------

const baseLayers = {
    "OpenStreetMap": osm,
    "OpenTopoMap": openTopo,
    "Google Maps": googleRoad,
    "Google Terrain": googleTerrain,
    "Google Satellite": googleSatellite
};

// Add default layer
osm.addTo(map);

// Add layer switcher
L.control.layers(baseLayers, null, {
    position: "topright"
}).addTo(map);

L.control.fullscreen({
    position: "topright",
    title: "View Fullscreen",
    titleCancel: "Exit Fullscreen"
}).addTo(map);

map.on("fullscreenchange", () => {
    map.invalidateSize();
});


// ------------------------------
// Legend + filters (merged)
// ------------------------------

const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    const div = L.DomUtil.create("div", "map-legend");

    div.innerHTML = `
        <h5>Photo Types</h5>
        ${Object.keys(PHOTO_TYPE_COLOURS)
            .filter(type => type !== "default" && markersByType[type])
            .map(type => `
                <div 
                    class="map-legend-item active" 
                    data-type="${type}"
                >
                    <span 
                        class="map-legend-marker"
                        style="background-image:url('${PHOTO_TYPE_COLOURS[type]}')"
                    ></span>
                    <span class="map-legend-label">
                        ${type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                </div>
            `)
            .join("")}
    `;

    // Prevent map interaction when clicking legend
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    return div;
};

function setupLegendFiltering() {
    document
        .querySelectorAll(".map-legend-item")
        .forEach(item => {
            item.addEventListener("click", () => {
                const type = item.dataset.type;
                const isActive = item.classList.contains("active");

                item.classList.toggle("active");

                markersByType[type].forEach(marker => {
                    if (isActive) {
                        map.removeLayer(marker);
                    } else {
                        marker.addTo(map);
                    }
                });
            });
        });
}


// ------------------------------
// Load photo location data
// ------------------------------

async function loadPhotoLocations() {
    const response = await fetch(
        "/photography/photo-locations/data/photo-locations.json"
    );

    if (!response.ok) {
        throw new Error("Failed to load photo locations JSON");
    }

    return await response.json();
}


loadPhotoLocations()
    .then(photos => {
        photos.forEach(photo => {

            const type = photo.type || "default";

            const marker = L.marker(photo.coords, {
                icon: createPhotoIcon(type)
            })
            .addTo(map)
            .bindPopup(`
                <div class="photo-popup">
                    <h4>${photo.title}</h4>

                    <img src="${photo.thumbnail}" alt="${photo.title}">

                    <ul class="photo-meta">
                        <li><strong>Camera:</strong> ${photo.metadata.camera}</li>
                        <li><strong>Lens:</strong> ${photo.metadata.lens}</li>
                        <li><strong>Exposure:</strong> ${photo.metadata.shutter} · ${photo.metadata.aperture} · ISO ${photo.metadata.iso}</li>
                        <li><strong>Date:</strong> ${photo.metadata.date}</li>
                    </ul>

                    <a href="${photo.fullImageUrl}" target="_blank" class="photo-link">
                        View full photo
                    </a>
                </div>
            `);

            // Store marker by type
            if (!markersByType[type]) {
                markersByType[type] = [];
            }
            markersByType[type].push(marker);
        });
        
        // ✅ Now that markers exist:
        legend.addTo(map);
        setupLegendFiltering();
    })
    .catch(err => {
        console.error(err);
    });


// ------------------------------
// Placeholder for future features
// ------------------------------

/*
 * Future ideas:
 * - Load GeoJSON photo data here
 * - Add marker clustering
 * - Add filters / search
 * - Add click side panel
 *
 * Keeping this empty for now keeps the map clean.
 */
