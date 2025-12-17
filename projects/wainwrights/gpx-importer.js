// Styling for marker/icon popup content
const popupCSS = `
.leaflet-popup-content {
  margin: 10px 14px;
  font-family: "Dosis", sans-serif;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--text);
}

.popup-title {
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 2px;
  color: var(--text);
}

.popup-height {
  font-size: 1.0rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 6px;
}

.popup-section {
  color: #4a5668;
}

.popup-section div {
  margin-bottom: 2px;
}

.popup-links {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.popup-links a {
  font-size: 12px;
  padding: 4px 8px;
  background: #f1f1f1;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
}

.popup-links a:hover {
  background: #e0e0e0;
}
`;

const popupStyle = document.createElement('style');
popupStyle.appendChild(document.createTextNode(popupCSS));
document.head.appendChild(popupStyle);

// Styling for stats control button/box
const statsCSS = `
.stats-control {
  background-color: var(--bg-col, #fff);
  padding: 10px;
  font-family: inherit;
  font-size: 14px;
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.1);
  border-radius: 5px;
  line-height: 1.4;

}
`;

const style = document.createElement('style');
style.appendChild(document.createTextNode(statsCSS));
document.head.appendChild(style);

// Styling for fullscreen map control
const fullscreenCSS = `
.map-fullscreen {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999;
  background: #fff;
}

.leaflet-control-fullscreen {
  background-color: #fff;
  width: 43px;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.leaflet-control-fullscreen:hover {
  background-color: #f0f0f0;
}
`;

const fullscreenStyle = document.createElement('style');
fullscreenStyle.appendChild(document.createTextNode(fullscreenCSS));
document.head.appendChild(fullscreenStyle);

// Base layers
// OpenStreetMap
const osm = L.tileLayer("https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
});

// OpenTopoMap
const openTopo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17
});

// Google Maps
const googleStreets = L.tileLayer("https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga", {
    attribution: '&copy; Google',
    maxZoom: 22
});

// Google Satellite
const satellite = L.tileLayer("https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga", {
    attribution: '&copy; Google Satellite',
    maxZoom: 22
});

// Google Terrain
const terrain = L.tileLayer("https://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}&s=Ga", {
    attribution: '&copy; Google Terrain',
    maxZoom: 22
});


// Initialize map
const map = L.map('map', {
    center: [54.496555, -3.062749],
    zoom: 11,
    layers: [openTopo]
});

// Layer control, associate map names to layers
const baseMaps = {
    "OpenStreetMap": osm,
    "OpenTopoMap": openTopo,
    "Google Maps": googleStreets,
    "Google Satellite": satellite,
    "Google Terrain": terrain
};

// Large default icon (not used, but kept for reference)
const largeIconSize = [25, 41];
const largeIconAnchor = [12, 41];
const largePopupAnchor = [1, -34];
const largeShadowSize = [41, 41];

// Small icon for Wainwrights
const smallMarkerSize = [15, 25];   // width, height
const smallAnchor = [7.5, 25];      // half width, full height
const smallPopupAnchor = [0, -22];
const smallShadowSize = [25, 25];

// Red icon for not completed
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: smallMarkerSize,
  iconAnchor: smallAnchor,
  popupAnchor: smallPopupAnchor,
  shadowSize: smallShadowSize
});

// Green icon for completed Wainwrights
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: smallMarkerSize,
  iconAnchor: smallAnchor,
  popupAnchor: smallPopupAnchor,
  shadowSize: smallShadowSize
});

// =========================
// Helper functions
// =========================
function extractField(regex, text) {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function cleanHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// Custom control for statistics
const StatsControl = L.Control.extend({
  onAdd: function(map) {
    this._div = L.DomUtil.create('div', 'stats-control');
    this.update();
    
    // Prevent map interactions when mouse is over the stats box
    L.DomEvent.disableClickPropagation(this._div);
    return this._div;
  },
  update: function(stats) {
    if (!stats) {
      this._div.innerHTML = '<h4>Wainwright Stats</h4><p>Loading...</p>';
      return;
    }
    const { total, completed, percentCompleted, avgHeight } = stats;
    this._div.innerHTML = `
      <h4>Wainwright Stats</h4>
      <b>Total Fells:</b> ${total} <br/>
      <b>Completed:</b> ${completed} <br/>
      <b>Completion:</b> ${percentCompleted.toFixed(1)}% <br/>
      <b>Avg Height Completed:</b> ${avgHeight.toFixed(0)} m
    `;
  },
  show: function () {
    this._div.style.display = 'block';
  },
  hide: function () {
    this._div.style.display = 'none';
  },
  toggle: function() {
    if (this._div.style.display === 'none' || this._div.style.display === '') {
      this.show();
    } else {
      this.hide();
    }
  }
});

// Toggle button for stats control
const ToggleStatsControl = L.Control.extend({
  onAdd: function(map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.backgroundColor = '#fff';
    container.style.width = '43px';
    container.style.height = '43px';
    container.style.cursor = 'pointer';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.title = 'Toggle Wainwright Stats';

    // You can use an icon or simple text for the button:
    container.innerHTML = '📊'; // chart emoji for stats

    // Disable map click events when clicking the button
    L.DomEvent.disableClickPropagation(container);

    container.onclick = function() {
      statsControl.toggle();
    };

    return container;
  },
  position: 'topright'
});

// =========================
// Fullscreen Control
// =========================
const FullscreenControl = L.Control.extend({
  onAdd: function () {
    const container = L.DomUtil.create(
      'div',
      'leaflet-bar leaflet-control leaflet-control-fullscreen'
    );

    container.title = 'Toggle Fullscreen';
    container.innerHTML = '⛶'; // fullscreen icon

    L.DomEvent.disableClickPropagation(container);

    container.onclick = () => toggleFullscreen();

    return container;
  }
});

const mapContainer = document.getElementById('map');
let isFullscreen = false;

function toggleFullscreen() {
  isFullscreen = !isFullscreen;

  if (isFullscreen) {
    mapContainer.classList.add('map-fullscreen');
  } else {
    mapContainer.classList.remove('map-fullscreen');
  }

  // Important: tell Leaflet to recalc size
  setTimeout(() => {
    map.invalidateSize();
  }, 200);
}

// =========================
// Initialize and add controls to map
// =========================

// Create the fullscreen button and add to map
const fullscreenControl = new FullscreenControl({ position: 'topright' });
fullscreenControl.addTo(map);

// Add layer options to map
L.control.layers(baseMaps).addTo(map);

// Create the stats window and add to map
const statsControl = new StatsControl({ position: 'topright' });
statsControl.addTo(map);
statsControl.hide(); // initially hidden

// Create the toggle button and add to map
const toggleStats = new ToggleStatsControl({ position: 'topright' });
toggleStats.addTo(map);

// Move toggle button below layers control button visually:
const container = document.querySelector('.leaflet-control-layers');
if (container) {
  const toggleEl = document.querySelector('.leaflet-control-custom');
  container.parentNode.insertBefore(toggleEl, container.nextSibling);
}

// =========================
// Stats variables
// =========================

const completedHeights = [];
let completedCount = 0;
const TOTAL_WAINWRIGHTS = 214;

// =========================
// Load and parse GPX
// =========================
fetch('Wainwrights-comaps.gpx')
  .then(res => res.text())
  .then(gpxText => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(gpxText, 'application/xml');

    const wpts = xml.getElementsByTagName('wpt');

    let completed = 0;
    const completedHeights = [];
    const bounds = [];

    Array.from(wpts).forEach(wpt => {
      const lat = parseFloat(wpt.getAttribute('lat'));
      const lon = parseFloat(wpt.getAttribute('lon'));

      const name = wpt.getElementsByTagName('name')[0]?.textContent ?? '';
      const rawDesc = wpt.getElementsByTagName('desc')[0]?.textContent ?? '';

      // -------------------------
      // Parse structured fields
      // -------------------------
      const height = extractField(/\((\d+)m\)/, rawDesc);
      const ukArea = extractField(/UK Area:\s*([^<]+)/i, rawDesc);
      const gridRef = extractField(/OS Grid Ref:\s*([A-Z]{2}\d+)/i, rawDesc);
      const maps = extractField(/OS Maps:\s*([^<]+)/i, rawDesc);

      // Extract links safely
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = rawDesc;

      const osMapLink = tempDiv.querySelector("a[href*='map-detail']");
      const hillLink = tempDiv.querySelector("a[href*='hillnumber']");

      // -------------------------
      // Completion status
      // -------------------------
      const colorEl = wpt.getElementsByTagName('color')[0];
      const isCompleted = colorEl?.textContent === '#FF3C8C3C';

      if (isCompleted) {
        completed++;
        if (height) completedHeights.push(parseInt(height, 10));
      }

      // -------------------------
      // Build popup HTML
      // -------------------------
      const popupHTML = `
        <div class="popup">
          <div class="popup-title">${name}</div>
          ${height ? `<div class="popup-height">${height} m</div>` : ''}

          <div class="popup-section">
            ${ukArea ? `<div><b>Area:</b> ${ukArea}</div>` : ''}
            ${gridRef ? `<div><b>OS Grid:</b> ${gridRef}</div>` : ''}
            ${maps ? `<div><b>Maps:</b> ${maps}</div>` : ''}
          </div>

          <div class="popup-links">
            ${osMapLink ? `<a href="${osMapLink.href}" target="_blank">OS Map</a>` : ''}
            ${hillLink ? `<a href="${hillLink.href}" target="_blank">Harold Street</a>` : ''}
          </div>
        </div>
      `;

      // -------------------------
      // Marker
      // -------------------------
      const marker = L.marker([lat, lon], {
        icon: isCompleted ? greenIcon : redIcon
      })
      .bindPopup(popupHTML)
      .addTo(map);

      bounds.push([lat, lon]);
    });

    // -------------------------
    // Update stats + fit bounds
    // -------------------------
    if (bounds.length) map.fitBounds(bounds);

    const TOTAL = 214;
    const avgHeight =
      completedHeights.length
        ? completedHeights.reduce((a, b) => a + b, 0) / completedHeights.length
        : 0;

    statsControl.update({
      total: TOTAL,
      completed,
      percentCompleted: (completed / TOTAL) * 100,
      avgHeight
    });
  })
  .catch(err => console.error('GPX load error:', err));
