// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

let map;
let countryLayer; // Holds country borders layer

// tile layers

const streets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
  }
);

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

const basemaps = {
  Streets: streets,
  Satellite: satellite,
};

// buttons

const infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

// (document).ready block begins--------
$(document).ready(function () {
  // Initialise Map and add controls
  map = L.map("map", {
    layers: [streets],
  }).setView([54.5, -4], 6); // setView is not required in your application as you will be deploying map.fitBounds() on the country border polygon

  // Layers switching control
  L.control.layers(basemaps).addTo(map);

  // Info button
  infoBtn.addTo(map);

  // Fetch country data and populate dropdown
  fetch("data/extract_iso_names.php")
    .then((response) => {
      console.log("Fetching country data...");
      return response.json();
    })
    .then((data) => {
      console.log("Country data received:", data);
      // Populate the dropdown menu
      const selectElement = document.getElementById("countrySelect");
      data.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.iso_code.toUpperCase(); // Ensure uppercase
        option.textContent = country.name;
        selectElement.appendChild(option);
      });
      // Log to confirm dropdown is populated
      console.log("Dropdown populated with country data");
    })
    .catch((error) => console.error("Error fetching the country data:", error));

  // Event listener for country selection from menu
  document
    .getElementById("countrySelect")
    .addEventListener("change", function () {
      const iso_a2 = this.value.toUpperCase(); // Ensure uppercase
      console.log(`Country selected: ${iso_a2}`); // Debugging
      loadCountryBorders(iso_a2);
    });
});
// End of (document).ready block -------

// Fetch and display country borders
function loadCountryBorders(iso_a2) {
  console.log(`Fetching borders for country code: ${iso_a2}`); // Debugging

  fetch(`data/getCountryBorder.php?iso_a2=${iso_a2}`)
    .then((response) => {
      console.log("Response received"); // Debugging
      return response.json();
    })
    .then((data) => {
      console.log("Data received:", data); // Debugging

      if (data.error) {
        console.error(data.error);
        return;
      }
      // Remove previous layer if needed
      if (countryLayer) {
        map.removeLayer(countryLayer);
      }
      // Add new layer border
      countryLayer = L.geoJSON(data.geometry).addTo(map);
      // Adjust map view with borders
      map.fitBounds(countryLayer.getBounds());
    })
    .catch((error) => console.error("Error retrieving country border:", error));
}
  

// Automatically detect location and make AJAX call to fetch country and borders
function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Success callback for geolocation
function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // Send latitude and longitude to the PHP file via AJAX
  fetch(`data/getCountryByLocation.php?lat=${latitude}&lng=${longitude}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      // Set the country in the dropdown
      const selectElement = document.getElementById("countrySelect");
      selectElement.value = data.iso_code.toUpperCase(); // Set selected country in dropdown

      // Load country borders for the detected country
      loadCountryBorders(data.iso_code);
    })
    .catch((error) => console.error("Error fetching the country data:", error));
}

// Error callback for geolocation
function showError(error) {
  console.error(`Geolocation error: ${error.message}`);
}