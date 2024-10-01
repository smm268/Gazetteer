// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

let map;
let countryLayer; // Holds country borders layer

// Tile layers
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

// Buttons
const infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

// (document).ready block begins--------
$(document).ready(function () {
  // Initialise Map and add controls
  map = L.map("map", {
    layers: [streets],
  }).setView([54.5, -4], 6); // Adjust map center and zoom if needed

  // Layers switching control
  L.control.layers(basemaps).addTo(map);

  // Info button
  infoBtn.addTo(map);

  // Fetch country data and populate dropdown
  fetch("data/extract_iso_names.php")
    .then((response) => response.json())
    .then((data) => {
      console.log("Country data received:", data);
      const selectElement = document.getElementById("countrySelect");
      data.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.iso_code.toUpperCase(); // Ensure uppercase
        option.textContent = country.name;
        selectElement.appendChild(option);
      });
      console.log("Dropdown populated with country data");
    })
    .catch((error) => console.error("Error fetching country data:", error));

  // Event listener for country selection from dropdown menu
  document
    .getElementById("countrySelect")
    .addEventListener("change", function () {
      const selectedCountryName = this.options[this.selectedIndex].text; // Get the selected country name
      console.log(`Selected Country: ${selectedCountryName}`); // Debugging

      // Call the PHP backend to fetch geocoding data based on the selected country name
      fetch(`data/opencage.php?country_name=${encodeURIComponent(selectedCountryName)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
            return;
          }

          const { lat, lng, countryISO } = data;
          document.getElementById("countrySelect").value = countryISO;

          // Fetch detailed country info from GeoNames using the countryISO code
          fetch(`http://api.geonames.org/countryInfoJSON?formatted=true&country=${countryISO}&username=smm488`)
            .then((response) => response.json())
            .then((geoNamesData) => {
              console.log('GeoNames country data:', geoNamesData); // Log data from GeoNames to the console

              // Optionally, you could handle the fetched data here and display it in the UI
            })
            .catch((error) => console.error("Error fetching GeoNames country data:", error));

          // Load country borders and set map view if lat/lng is available
          loadCountryBorders(countryISO);
          if (lat && lng) {
            map.setView([lat, lng], 6);
          }
        })
        .catch((error) => console.error("Error during forward geocoding:", error));
    });

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

        // Reverse geocode to get the country ISO code
        reverseGeocode(lat, lng);
      },
      function (error) {
        console.error("Error getting geolocation: ", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
});

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
      if (countryLayer) {
        map.removeLayer(countryLayer);
      }
      countryLayer = L.geoJSON(data.geometry).addTo(map);
      map.fitBounds(countryLayer.getBounds());
    })
    .catch((error) => console.error("Error retrieving country border:", error));
}

// Reverse geocode using OpenCage API to get country based on lat/lng
function reverseGeocode(lat, lng) {
  fetch(`data/opencage.php?lat=${lat}&lng=${lng}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const { countryISO, countryName } = data;
      console.log(`Reverse geocoded country: ${countryName} (${countryISO})`);

      // Set the dropdown to the correct country ISO code
      document.getElementById("countrySelect").value = countryISO;

      // Load borders and center map on the country
      loadCountryBorders(countryISO);
    })
    .catch((error) => console.error("Error during reverse geocoding:", error));
}
