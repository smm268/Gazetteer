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

// Initialize the map
$(document).ready(function () {
  // Create map
  map = L.map("map", {
    layers: [streets],
  }).setView([54.5, -4], 6); // Initial view

  // Create marker groups for different categories
  const airportMarkers = L.layerGroup().addTo(map);
  const universityMarkers = L.layerGroup().addTo(map);
  const cityMarkers = L.layerGroup().addTo(map);
  const stadiumMarkers = L.layerGroup().addTo(map);

  // Sample data for each category (replace with real data)
  const airports = [
    { lat: 40.7128, lng: -74.0060, name: "John F. Kennedy International Airport" },
    { lat: 51.4700, lng: -0.4543, name: "London Heathrow Airport" }
  ];

  const universities = [
    { lat: 42.3601, lng: -71.0942, name: "Harvard University" },
    { lat: 51.7548, lng: -1.2544, name: "University of Oxford" }
  ];

  const cities = [
    { lat: 48.8566, lng: 2.3522, name: "Paris" },
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles" }
  ];

  const stadiums = [
    { lat: 40.8296, lng: -73.9262, name: "Yankee Stadium" },
    { lat: 51.5550, lng: -0.1086, name: "Emirates Stadium" }
  ];



 // Add markers for each category
 addMarkers(airportMarkers, airports, 'plane', 'blue');
 addMarkers(universityMarkers, universities, 'university', 'green');
 addMarkers(cityMarkers, cities, 'city', 'orange');
 addMarkers(stadiumMarkers, stadiums, 'soccer-ball-o', 'red');

  // Overlay maps for layer control
  const overlayMaps = {
    "Airports": airportMarkers,
    "Universities": universityMarkers,
    "Cities": cityMarkers,
    "Stadiums": stadiumMarkers,
  };


// Add layer control
L.control.layers(basemaps, overlayMaps).addTo(map);

// buttons
 // Create a button for fetching weather
 const weatherBtn = L.easyButton("fa-cloud fa-lg", function (btn, map) {
  const selectedCountry = document.getElementById("countrySelect").value;

  if (selectedCountry) {
      // Fetch coordinates based on selected country
      fetch(`data/opencage.php?country_name=${encodeURIComponent(selectedCountry)}`)
          .then((response) => response.json())
          .then((data) => {
              if (data.error) {
                  console.error(data.error);
                  return;
              }

              const { lat, lng } = data;

              // Fetch weather data
              fetchWeather(lat, lng);
          })
          .catch((error) => console.error("Error fetching coordinates:", error));
  } else {
      alert("Please select a country first!");
  }
});

weatherBtn.addTo(map);


// Add a currency exchange button to the map
const currencyBtn = L.easyButton("fa-coins", function (btn, map) {
  $("#currencyModal").modal("show"); 
});

currencyBtn.addTo(map);

 // Add a button to fetch and display local news
 const newsBtn = L.easyButton("fa-newspaper", function (btn, map) {
  // Get the selected country code from the dropdown
  const selectedCountry = document.getElementById("countrySelect").value;

  if (selectedCountry) {
    // Fetch and display news based on the selected country
    fetchNews(selectedCountry);
  } else {
    alert("Please select a country to fetch local news.");
  }
});

// Add the news button to the map
newsBtn.addTo(map);

// Add a countries info button to the map
const infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

  // Info button
  infoBtn.addTo(map);
});


  
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
 



// End of (document).ready block -------


// Function to add markers to respective layers
function addMarkers(layerGroup, data, iconName, color) {
  data.forEach(item => {
    L.marker([item.lat, item.lng], {
      icon: L.ExtraMarkers.icon({
        icon: iconName,
        markerColor: color,
        shape: 'circle',
        prefix: 'fa'
      })
    }).addTo(layerGroup).bindPopup(item.name);
  });
}


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

      // Handle the currency data and get currency code
      const currencyInfo = countryData.currencies
        ? Object.values(countryData.currencies)[0]
        : null;
      const currency = currencyInfo ? currencyInfo.name : "No data available";
      const currencyCode = currencyInfo ? currencyInfo.code : null;

      // Populate modal fields
      document.getElementById("countryName").textContent = countryName;
      document.getElementById("capital").textContent = capital;
      document.getElementById("population").textContent = population;
      document.getElementById("language").textContent = language;
      document.getElementById("currency").textContent = currency;

      // Fetch exchange rate if the country has a currency
      if (currencyCode) {
        fetchExchangeRateForCountry(currencyCode);
      } else {
        document.getElementById("exchangeRateText").textContent = "Currency data not available for this country.";
      }

      // Open modal
      $("#exampleModal").modal("show");
    })
    .catch((error) => console.error("Error fetching country details:", error));
}

 // Fetch country data and populate dropdown
 fetch("data/extract_iso_names.php")
 .then((response) => response.json())
 .then((data) => {
     const selectElement = document.getElementById("countrySelect");
     data.forEach((country) => {
         const option = document.createElement("option");
         option.value = country.iso_code.toUpperCase(); // Ensure uppercase
         option.textContent = country.name;
         selectElement.appendChild(option);
     });
 })
 .catch((error) => console.error("Error fetching the country data:", error));


// Function to fetch and display weather
function fetchWeather(lat, lon) {
// Call the PHP backend to fetch weather data
fetch(`data/getWeather.php?lat=${lat}&lon=${lon}`)
 .then((response) => {
     if (!response.ok) {
         throw new Error('Network response was not ok: ' + response.statusText);
     }
     return response.json();
 })
 .then((data) => {
     if (data.error) {
         console.error(data.error);
         return;
     }

     // Get location name
     const location = data.location.name;
     document.getElementById("locationName").textContent = `Weather for ${location}`;

     // Clear the forecast cards
     const forecastCards = document.getElementById("forecastCards");
     forecastCards.innerHTML = "";

     // Loop through forecast data and display morning, afternoon, and evening forecasts for the next days
     data.forecast.forecastday.forEach((day) => {
         const morningForecast = day.hour[9]; // Morning forecast
         createForecastCard(morningForecast, "Morning", forecastCards);
         const afternoonForecast = day.hour[15]; // Afternoon forecast
         createForecastCard(afternoonForecast, "Afternoon", forecastCards);
         const eveningForecast = day.hour[18]; // Evening forecast
         createForecastCard(eveningForecast, "Evening", forecastCards);
     });

     // Show the modal
     $("#weatherModal").modal("show");
 })
 .catch((error) => console.error("Error fetching weather data:", error));
}

// Function to create a forecast card for each time of day
function createForecastCard(forecast, timeOfDay, container) {
const card = document.createElement("div");
card.classList.add("card", "mb-3");

card.innerHTML = `
 <div class="card-body">
     <h6 class="card-title">${timeOfDay}</h6>
     <p class="card-text">
         <strong>Temperature:</strong> ${forecast.temp_c}°C<br>
         <strong>Condition:</strong> ${forecast.condition.text}<br>
         <img src="https:${forecast.condition.icon}" alt="${forecast.condition.text}" /><br>
         <strong>Humidity:</strong> ${forecast.humidity}%<br>
         <strong>Wind Speed:</strong> ${forecast.wind_kph} kph
     </p>
 </div>
`;
container.appendChild(card);
}

// Event listener for country selection from dropdown menu
document.getElementById("countrySelect").addEventListener("change", function () {
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

      const { lat, lng, countryISO, currencyCode } = data;
      document.getElementById("countrySelect").value = countryISO;

      // Fetch and load the country borders
      loadCountryBorders(countryISO);

      if (lat && lng) {
        map.setView([lat, lng], 6);
      }

      // Fetch and display the exchange rate if currencyCode exists
      if (currencyCode) {
        fetchExchangeRateForCountry(currencyCode);
      } else {
        document.getElementById("exchangeRateText").textContent = "Currency data not available for this country.";
      }
    })
    .catch((error) => console.error("Error during forward geocoding:", error));
});

document.getElementById("getExchangeRateBtn").addEventListener("click", function () {
  const baseCurrency = document.getElementById("baseCurrency").value.toUpperCase();
  const targetCurrency = document.getElementById("targetCurrency").value.toUpperCase();

  if (!baseCurrency || !targetCurrency) {
    alert("Please fill in both fields!");
    return;
  }

  // Call the function to fetch exchange rate
  fetchExchangeRate(baseCurrency, targetCurrency);
});

// Function to fetch and display exchange rate
function fetchExchangeRate(baseCurrency, targetCurrency) {
  fetch(`data/getExchangeRate.php?base=${baseCurrency}&target=${targetCurrency}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        document.getElementById("exchangeRateText").textContent = "Error fetching exchange rate.";
        return;
      }

      // Display exchange rate
      const exchangeRate = data.rate;
      document.getElementById("exchangeRateText").innerHTML = `
        <strong>1 ${baseCurrency}</strong> = <strong>${exchangeRate} ${targetCurrency}</strong>`;
    })
    .catch(error => {
      console.error("Error fetching exchange rate:", error);
      document.getElementById("exchangeRateText").textContent = "Failed to fetch exchange rate. Please try again.";
    });
}

 // Function to fetch news from the backend and display it in the modal
  function fetchNews(countryCode) {
    fetch(`data/getNews.php?country=${countryCode}`)
      .then((response) => response.json())
      .then((data) => {
        // Handle the response and populate the modal
        if (data.error) {
          console.error("Error fetching news:", data.error);
          document.getElementById("newsContent").innerHTML =
            "<p>Unable to fetch news at this time.</p>";
          return;
        }

        // Clear the previous news content
        const newsContent = document.getElementById("newsContent");
        newsContent.innerHTML = "";

        // Loop through each news article and create a card
        data.results.forEach((article) => {
          const newsCard = document.createElement("div");
          newsCard.classList.add("card", "mb-3");

          newsCard.innerHTML = `
            <div class="card-body">
              <h5 class="card-title">${article.title}</h5>
              <p class="card-text">${article.description}</p>
              <a href="${article.link}" target="_blank" class="btn btn-primary">Read more</a>
            </div>
          `;

          newsContent.appendChild(newsCard);
        });

        // Show the news modal
        $("#newsModal").modal("show");
      })
      .catch((error) => console.error("Error fetching news data:", error));
  }
