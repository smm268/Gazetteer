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

  // Populate country dropdown
  fetchCountries();

  // Event listener for country selection
  document
    .getElementById("countrySelect")
    .addEventListener("change", handleCountrySelection);

  // Get user's current location
  getCurrentLocation();
});

// Fetch and populate the country dropdown
function fetchCountries() {
  fetch("data/extract_iso_names.php")
    .then((response) => response.json())
    .then((data) => {
      const selectElement = document.getElementById("countrySelect");
      data.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.iso_code.toUpperCase();
        option.textContent = country.name;
        selectElement.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching country data:", error));
}

// Handle country selection from dropdown
function handleCountrySelection() {
  const selectedCountryName = this.options[this.selectedIndex].text;
  fetchCountryData(selectedCountryName);
}

// Fetch country data based on the country name
function fetchCountryData(countryName) {
  fetch(`data/opencage.php?country_name=${encodeURIComponent(countryName)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const { lat, lng, countryISO } = data;
      document.getElementById("countrySelect").value = countryISO;

      // Fetch additional information (GeoNames, Currency, Weather, Wikipedia)
      fetchAdditionalCountryInfo(countryISO, lat, lng, countryName);

      // Load country borders and set map view if lat/lng is available
      loadCountryBorders(countryISO);
      if (lat && lng) {
        map.setView([lat, lng], 6);
      }
    })
    .catch((error) => console.error("Error during forward geocoding:", error));
}

// Fetch user's current location and reverse geocode
function getCurrentLocation() {
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
      document.getElementById("countrySelect").value = countryISO;

      // Load borders and center map on the country
      loadCountryBorders(countryISO);
    })
    .catch((error) => console.error("Error during reverse geocoding:", error));
}

// Fetch and display additional country information
function fetchAdditionalCountryInfo(countryISO, lat, lng, countryName) {
  // Fetch GeoNames data
  fetchGeoNamesData(countryISO).then((capitalCity) => {
    // After fetching GeoNames data, use the capital city for weather data
    fetchWeatherInfo(capitalCity);
  });

  // Fetch currency and Wikipedia data
  fetchCurrencyData(countryISO);
  fetchWikipediaInfo(countryName);
}

// Modify fetchGeoNamesData to return the capital city
function fetchGeoNamesData(countryISO) {
  return fetch(`data/getGeoNamesData.php?countryISO=${countryISO}`)
    .then(response => response.json())
    .then(geoNamesData => {
      if (geoNamesData && geoNamesData.geonames.length > 0) {
        const countryData = geoNamesData.geonames[0];

        // Update modal with GeoNames country info
        document.getElementById("countryName").textContent = countryData.countryName;
        document.getElementById("capital").textContent = countryData.capital;
        document.getElementById("population").textContent = numberWithCommas(countryData.population);
        document.getElementById("language").textContent = countryData.languages;

        // Return the capital city for further processing
        return countryData.capital;
      } else {
        throw new Error("GeoNames data not available");
      }
    })
    .catch(error => {
      console.error("Error fetching GeoNames country data:", error);
      return null; // Handle accordingly if needed
    });
}


// Fetch and display currency data
function fetchCurrencyData(countryISO) {
  fetch(`data/getCurrency.php?countryISO=${countryISO}`)
    .then((response) => response.json())
    .then((currencyData) => {
      if (currencyData && currencyData.rates) {
        const currencyCode = currencyData.base;
        const exchangeRate = currencyData.rates.USD;

        document.getElementById("currency").textContent = currencyCode;
        document.getElementById("exchangeRate").textContent = exchangeRate;
      } else {
        document.getElementById("currency").textContent = "Unavailable";
        document.getElementById("exchangeRate").textContent = "Unavailable";
      }
    })
    .catch((error) => {
      console.error("Error fetching currency data:", error);
      document.getElementById("currency").textContent = "Unavailable";
      document.getElementById("exchangeRate").textContent = "Unavailable";
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


// Fetch and display country borders
function loadCountryBorders(iso_a2) {
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
    .catch((error) => console.error("Error fetching country borders:", error));
}

// Utility function to add commas to population numbers
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
