// Base layers
const osm = L.tileLayer("https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
});

const openTopo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17
});

const googleStreets = L.tileLayer("https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga", {
    attribution: '&copy; Google',
    maxZoom: 22
});

const satellite = L.tileLayer("https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga", {
    attribution: '&copy; Google Satellite',
    maxZoom: 22
});

const terrain = L.tileLayer("https://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}&s=Ga", {
    attribution: '&copy; Google Terrain',
    maxZoom: 22
});

const osOutdoor = L.tileLayer(
  "https://api.os.uk/maps/raster/v1/zxy/Outdoor_3857/{z}/{x}/{y}.png?key=fHAifbIOxV6JwdcOuc2YAAwsL7fWQCH5",
  {
    attribution: '© Ordnance Survey',
    maxZoom: 16,
    tileSize: 256
  }
);

const osRoad = L.tileLayer(
  "https://api.os.uk/maps/raster/v1/zxy/Road_3857/{z}/{x}/{y}.png?key=fHAifbIOxV6JwdcOuc2YAAwsL7fWQCH5",
  {
    attribution: '© Ordnance Survey',
    maxZoom: 16,
    tileSize: 256
  }
);


// Initialize map
const map = L.map('map', {
    center: [54.496555, -3.062749],
    zoom: 11,
    layers: [openTopo]
});

// Layer control
const baseMaps = {
    "OpenStreetMap": osm,
    "OpenTopoMap": openTopo,
    "Google Streets": googleStreets,
    "Google Satellite": satellite,
    "Google Terrain": terrain,
    "OS Maps Outdoor": osOutdoor,
    "OS Maps Road": osRoad
};

L.control.layers(baseMaps).addTo(map);


const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
  show: function() {
    this._div.style.display = 'block';
  },
  hide: function() {
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

// Add styles for the control
const css = `
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
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);


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

// Create the control and add to map
const statsControl = new StatsControl({ position: 'topright' });
statsControl.addTo(map);
statsControl.hide(); // initially hidden

const toggleStats = new ToggleStatsControl({ position: 'topright' });
toggleStats.addTo(map);

// Move toggle button below layers control button visually:
const container = document.querySelector('.leaflet-control-layers');
if (container) {
  const toggleEl = document.querySelector('.leaflet-control-custom');
  container.parentNode.insertBefore(toggleEl, container.nextSibling);
}

// Load GeoJSON and update stats
fetch('wainwrights-list.geojson')
  .then(res => res.json())
  .then(data => {
    // Add all markers
    L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        // Choose icon based on completion status
        const icon = feature.properties.completed ? greenIcon : redIcon;
        return L.marker(latlng, { icon: icon });
      },
      onEachFeature: function(feature, layer) {
        const props = feature.properties;
        const popupContent = `
          <strong>${props.name}</strong><br>
          Height: ${props.height || '—'} m<br>
          Book: ${props.book || '—'}<br>
          Date Completed: ${props.dateCompleted || '—'}<br>
          ${props.description || ''}
        `;
        layer.bindPopup(popupContent);
      }
    }).addTo(map);

    // Calculate stats
    // const total = data.features.length;
    const total = 214;
    const completedFeatures = data.features.filter(f => f.properties.completed);
    const completed = completedFeatures.length;

    const avgHeight = completedFeatures.length > 0 ? completedFeatures.reduce((sum, f) => {
      const h = f.properties.height ? parseFloat(f.properties.height) : 0;
      return sum + h;
    }, 0) / completedFeatures.length : 0;

    const percentCompleted = (completed / total) * 100;

    // Update the stats panel
    statsControl.update({ total, completed, percentCompleted, avgHeight });
  })
  .catch(err => {
    console.error('Error loading GeoJSON:', err);
    statsControl.update({ total: 0, completed: 0, percentCompleted: 0, avgHeight: 0 });
  });












// fetch('wainwrights-list.geojson')
// .then(response => response.json())
// .then(data => {
//     L.geoJSON(data, {
//     onEachFeature: function (feature, layer) {
//         const props = feature.properties;
//         const popupContent = `
//         <strong>${props.name}</strong><br>
//         Height: ${props.height || '—'}<br>
//         Book: ${props.book || '—'}<br>
//         ${props.description || ''}
//         `;
//         layer.bindPopup(popupContent);
//     }
//     }).addTo(map);
// })
// .catch(err => console.error('Error loading GeoJSON:', err));

// // Load GeoJSON data
// fetch('wainwrights-list.geojson')
//     .then(response => response.json())
//     .then(data => {
//         L.geoJSON(data, {
//             onEachFeature: function (feature, layer) {
//                 const props = feature.properties;
//                 const popupContent = `<strong>${props.name}</strong><br>
//                                     Height: ${props.height}<br>
//                                     Book: ${props.book}<br>
//                                     ${props.description}`;
//                 layer.bindPopup(popupContent);
//             },
//             pointToLayer: function (feature, latlng) {
//                 return L.marker(latlng, {
//                 icon: L.icon({
//                     iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Example icon
//                     iconSize: [41, 41],
//                     iconAnchor: [12, 41],
//                     popupAnchor: [10, -34],
//                     shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
//                     shadowSize: [41, 41]
//                 })
//                 });
//             }
//         }).addTo(map);
//     });