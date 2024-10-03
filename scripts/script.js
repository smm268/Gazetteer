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
  // Event listener for country selection from menu
  document
    .getElementById("countrySelect")
    .addEventListener("change", function () {
      const iso_a2 = this.value.toUpperCase(); // Ensure uppercase
      console.log(`Country selected: ${iso_a2}`); // Debugging

      loadCountryBorders(iso_a2);

      // Fetch and display country details in modal using PHP
      fetchCountryDetails(iso_a2);
    
      
 


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

       loadCountryBorders(countryISO);

       if (lat && lng) {
         map.setView([lat, lng], 6);
       }
     })
     .catch((error) => console.error("Error during forward geocoding:", error));
 });

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
// Fetch country details and populate modal using the PHP proxy
function fetchCountryDetails(isoCode) {
  const url = `data/getCountryDetails.php?iso_a2=${isoCode}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const countryData = data[0]; // Get the first result

       // Country name, capital, population, languages
       const countryName = countryData.name.common;
       const capital = countryData.capital ? countryData.capital[0] : "No data";
       const population = countryData.population.toLocaleString();
       const language = Object.values(countryData.languages || {}).join(", ");
         
      // Handle the currency data
      const currency = countryData.currencies
      ? Object.values(countryData.currencies).map(curr => curr.name).join(", ")
      : "No data available";
 
       // Populate modal fields
       document.getElementById("countryName").textContent = countryName;
       document.getElementById("capital").textContent = capital;
       document.getElementById("population").textContent = population;
       document.getElementById("language").textContent = language;
       document.getElementById("currency").textContent = currency;

      // Open modal
      $("#exampleModal").modal("show");
    })
    .catch((error) => console.error("Error fetching country details:", error));
}

