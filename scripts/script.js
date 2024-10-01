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
// Function to fetch country info and populate the modal
function fetchCountryInfo(countryName) {
  fetch(`data/countryInfo.php?country_name=${encodeURIComponent(countryName)}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Error fetching country data:', data.error);
        return;
      }

      // Populate modal fields with received data
      document.getElementById('countryName').innerText = data.countryName || 'N/A';
      document.getElementById('capital').innerText = data.capital || 'N/A';
      document.getElementById('population').innerText = data.population || 'N/A';
      document.getElementById('language').innerText = data.language || 'N/A';

  
      // Fetch and display the currency rate
      fetchCurrencyRate(data.currencyCode);

      // Fetch and display the weather info
      fetchWeatherInfo(data.capital);

      // Fetch and display Wikipedia info
      fetchWikipediaInfo(data.countryName);

    })
    .catch(error => console.error('Error fetching country info:', error));
}

// Event listener for the dropdown menu selection
document.getElementById('countrySelect').addEventListener('change', function() {
  const selectedCountry = this.options[this.selectedIndex].text;  // Get selected country name
  fetchCountryInfo(selectedCountry);  // Fetch and populate modal
});


// Function to fetch the currency exchange rate
function fetchCurrencyRate(currencyCode) {
  fetch(`data/getCurrency.php?currencyCode=${currencyCode}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById('currency').textContent = 'Currency not found';
        document.getElementById('exchangeRate').textContent = 'N/A';
      } else {
        // Populate the currency and exchange rate in the modal
        document.getElementById('currency').textContent = currencyCode;
        document.getElementById('exchangeRate').textContent = data.rate.toFixed(2); // Format to 2 decimal places
      }
    })
    .catch(error => {
      console.error("Failed to fetch currency data", error);
    });
}

// Function to fetch weather data using the capital city
function fetchWeatherInfo(capitalCity) {
  fetch(`data/weather.php?capital=${encodeURIComponent(capitalCity)}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById('weather').textContent = 'Weather data not available';
        console.error('Error fetching weather data:', data.error);
      } else {
        // Display weather information in the modal
        const weatherDescription = `${data.temperature}°C, ${data.description}`;
        document.getElementById('weather').textContent = weatherDescription;
      }
    })
    .catch(error => {
      console.error("Failed to fetch weather data", error);
    });
}

// Function to fetch Wikipedia data using the country name
function fetchWikipediaInfo(countryName) {
  fetch(`data/getWikipediaInfo.php?country_name=${encodeURIComponent(countryName)}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById('wikipediaInfo').textContent = 'Wikipedia information not available';
        console.error('Error fetching Wikipedia data:', data.error);
      } else {
        // Display Wikipedia information in the modal
        const wikiContent = `
          <strong>${data.title}</strong><br>
          ${data.extract} <br>
          <a href="${data.url}" target="_blank">Read more on Wikipedia</a>
        `;
        document.getElementById('wikipediaInfo').innerHTML = wikiContent;
      }
    })
    .catch(error => {
      console.error("Failed to fetch Wikipedia data", error);
    });
}