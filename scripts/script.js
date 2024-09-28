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
 // Get user's current location
 if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Add a popup for the current location
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("You are here!")
        .openPopup();

      // Reverse geocode using OpenCage to get country ISO code
      reverseGeocode(lat, lng);
    },
    function (error) {
      console.error("Error getting geolocation: ", error);
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}


// Reverse geocode with OpenCage to get country ISO code
function reverseGeocode(lat, lng) {
const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${'eb581a03425e482c86521447b05443b2'}`;

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    if (data && data.results && data.results.length > 0) {
      const countryISO = data.results[0].components.country_code.toUpperCase();
      const countryName = data.results[0].components.country;

      console.log(`Detected Country: ${countryName} (${countryISO})`);

      // Select the country in the dropdown
      const selectElement = document.getElementById("countrySelect");
      selectElement.value = countryISO;

      // Load country borders and display on map
      loadCountryBorders(countryISO);
    } else {
      console.error("Unable to reverse geocode location.");
    }
  })
  .catch((error) => console.error("Error during reverse geocoding: ", error));
}

// Fetch and display country borders
function loadCountryBorders(iso_a2) {
console.log(`Fetching borders for country code: ${iso_a2}`); // Debugging

fetch(`data/getCountryBorder.php?iso_a2=${iso_a2}`)
  .then((response) => response.json())
  .then((data) => {
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