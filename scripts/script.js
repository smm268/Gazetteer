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

//overlays
var earthquakes = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
});
var cities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
});
//icons
var cityIcon = L.ExtraMarkers.icon({
      prefix: "fa",
      icon: "fa-city",
      markerColor: "green",
      shape: "square"
    });
const overlayMaps = {
  "Cities": cities,
  "Earthquakes": earthquakes,
};
// Add layer control
L.control.layers(basemaps,overlayMaps).addTo(map);
earthquakes.addTo(map);
cities.addTo(map);

getEarthquakes();
getCities();

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

      getCities(iso_a2);
      // Get country bounding box from GeoJSON layer
      let bounds = countryLayer.getBounds();
      let north = bounds.getNorth(); // Northernmost latitude
      let south = bounds.getSouth(); // Southernmost latitude
      let east = bounds.getEast();   // Easternmost longitude
      let west = bounds.getWest();   // Westernmost longitude

      // Debugging output to ensure bounding box is correct
      console.log(`Bounding Box - North: ${north}, South: ${south}, East: ${east}, West: ${west}`);

      // Now that we have the bounding box, load earthquakes for this country
      getEarthquakes(north, south, east, west);  // Pass the bounding box to loadEarthquakes function
    })
    .catch((error) => console.error("Error retrieving country border:", error));
}

// Function to load earthquake data based on bounding box
function getEarthquakes(north, south, east, west) {
  console.log("Fetching earthquake data...");

  // Fetch earthquake data based on the country's bounding box
  fetch(`data/getEarthquakes.php?north=${north}&south=${south}&east=${east}&west=${west}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Earthquake Data Received:", data); // Debugging
      // Clear the previous earthquake markers
      earthquakes.clearLayers();
    
       // Create earthquake markers
       data.earthquakes.forEach((quake) => {
        const magnitude = quake.magnitude;
        const lat = quake.lat;
        const lng = quake.lng;

        // Create earthquake icon based on magnitude
        const earthquakeIcon = L.ExtraMarkers.icon({
          icon: 'fa-solid fa-house-crack',
          markerColor:  'red' ,  // Red for magnitude > 5
          shape: "square",
          prefix: 'fa',
        });
     
     // Create a marker for the earthquake and bind popup details
     const marker = L.marker([lat, lng], { icon: earthquakeIcon })
     .bindPopup(`
       <strong>Location:</strong> ${quake.src}<br>
       <strong>Magnitude:</strong> ${magnitude}<br>
       <strong>Depth:</strong> ${quake.depth} km<br>
       <strong>Date:</strong> ${new Date(quake.datetime).toLocaleString()}
     `);

   // Add the marker to the earthquakes layer
   earthquakes.addLayer(marker);
 });
})
    .catch((error) => console.error("Error fetching earthquake data:", error));
}

function getCities(iso_a2) {
  fetch(`data/getCity.php?iso_a2=${iso_a2}`)
    .then(response => response.json())
    .then(data => {
      // Clear previous city markers
      cities.clearLayers();

    // Loop through city data and create markers
        data.cities.forEach(city => {
          const marker = L.marker([city.lat, city.lng], { icon: cityIcon })
            .bindPopup(`<b>${city.name}</b><br>Population: ${city.population}`);

          // Add the marker to the cities layer
          cities.addLayer(marker);
        })
    })
    .catch(error => console.error('Error loading cities:', error));
}

// Update the dropdown listener
document.getElementById("countrySelect").addEventListener("change", function () {
  const iso_a2 = this.value.toUpperCase();
  loadCountryBorders(iso_a2);
});
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

// Wikipedia button
const wikiBtn = L.easyButton("fa-brands fa-wikipedia-w", function (btn, map) {
  const iso_a2 = document.getElementById("countrySelect").value;
  if (iso_a2) {
    loadWikipediaArticle(iso_a2);
  } else {
    // If no country is selected, show an alert instead
    alert("Please select a country first!");
  }
});
wikiBtn.addTo(map);


  
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

    // Sort the country data alphabetically by the country name
    data.sort((a, b) => a.name.localeCompare(b.name));


      // Populate the dropdown menu
      const selectElement = document.getElementById("countrySelect");
      data.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.iso_code.toUpperCase(); // Ensure uppercase
        option.textContent = country.name;
        selectElement.appendChild(option);
      });
    
       // Log to confirm dropdown is populated
    console.log("Dropdown populated with sorted country data");

      // Remove the preloader once the dropdown is populated
      const preloader = document.querySelector('#preloader');
      if (preloader) {
        preloader.remove(); // Preloader removed after data load
      }
    })
    .catch((error) => console.error("Error fetching the country data:", error));

    // Get user's current location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
 
 
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
    .getElementById("countrySelect").addEventListener("change", function () {
      const iso_a2 = this.value.toUpperCase(); // Ensure uppercase
      document.getElementById('preloader');
      console.log(`Country selected: ${iso_a2}`); // Debugging

      loadCountryBorders(iso_a2);

      // Fetch and display country details in modal using PHP
      fetchCountryDetails(iso_a2);
     
      loadWikipediaArticle(iso_a2);
     
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
     }else{

      //current weather
      document.getElementById('weatherModalLabel').textContent= `Weather in ${data.location.name}, ${data.location.country}`;
      document.getElementById('todayConditions').textContent= data.current.condition.text;
      document.getElementById('todayMaxTemp').textContent= Math.round(data.forecast.forecastday[0].day.maxtemp_c);
      document.getElementById('todayMinTemp').textContent=Math.round(data.forecast.forecastday[0].day.mintemp_c);
     
      //current weather icon
      const iconUrl = `https:${data.current.condition.icon}`;
      document.getElementById('todayIcon').src = iconUrl;
      document.getElementById('todayIcon').alt = data.current.condition.text;
      document.getElementById('todayIcon').title = data.current.condition.text;
      //day1 weather
      document.getElementById('day1Date').textContent= data.forecast.forecastday[1].date;
      document.getElementById('day1MaxTemp').textContent= Math.round(data.forecast.forecastday[1].day.maxtemp_c);
      document.getElementById('day1MinTemp').textContent=Math.round(data.forecast.forecastday[1].day.mintemp_c);
      //day1 weather icon
      const day1IconUrl = `https:${data.forecast.forecastday[1].day.condition.icon}`;
      document.getElementById('day1Icon').src = day1IconUrl;
      document.getElementById('day1Icon').alt = data.forecast.forecastday[1].day.condition.text;
      document.getElementById('day1Icon').title = data.forecast.forecastday[1].day.condition.text;
       //day2 weather
       document.getElementById('day2Date').textContent= data.forecast.forecastday[2].date;
       document.getElementById('day2MaxTemp').textContent= Math.round(data.forecast.forecastday[2].day.maxtemp_c);
       document.getElementById('day2MinTemp').textContent=Math.round(data.forecast.forecastday[2].day.mintemp_c);
       //day1 weather icon
       const day2IconUrl = `https:${data.forecast.forecastday[2].day.condition.icon}`;
       document.getElementById('day2Icon').src = day2IconUrl;
       document.getElementById('day2Icon').alt = data.forecast.forecastday[2].day.condition.text;
       document.getElementById('day2Icon').title = data.forecast.forecastday[2].day.condition.text;
     }
     // Show the modal
     $("#weatherModal").modal("show");
 })
 .catch((error) => console.error("Error fetching weather data:", error));
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
          document.getElementById("article1").innerHTML =
            "<p>Unable to fetch news at this time.</p>";
          return;
        }else{
        const articles = data.articles; 

        // Check if there are articles available
        for (let i = 0; i<articles.length; i++) {
          const article = articles[i];
          // Populate each item based on its index
          document.getElementById(`img${i + 1}`).innerHTML = `<img class="img-fluid rounded" src="${article.image_url}" alt="${article.title}">`;
          document.getElementById(`article${i + 1}`).textContent = article.title;
          document.getElementById(`link${i + 1}`).innerHTML = `<a href="${article.link}" target="_blank">Read more</a>`;
        }
      }
       
       

        // Show the news modal
        $("#newsModal").modal("show");
      })
      .catch((error) => console.error("Error fetching news data:", error));
  }

// Load Wikipedia article for the selected country
function loadWikipediaArticle(iso_a2) {
  console.log(`Fetching Wikipedia article for country code: ${iso_a2}`); // Debugging

  fetch(`data/getWikipediaArticle.php?iso_a2=${iso_a2}`)
    .then((response) => {
      console.log("Response received"); // Debugging
      return response.json();
    })
    .then((data) => {
      console.log("Data received:", data); // Debugging

      if (data.error) {
        console.error(data.error);
        document.getElementById("wikiArticleTitle").innerText = "Error fetching article.";
        document.getElementById("wikiArticleContent").innerText = data.error;
        return;
      }

      // Update modal with article content
      document.getElementById("wikiArticleTitle").innerText = data.title;
      document.getElementById("wikiArticleContent").innerHTML = data.content; // Ensure content is safe for innerHTML use
      $("#wikipediaModal").modal("show"); // Show the modal
    })
    .catch((error) => console.error("Error retrieving Wikipedia article:", error));
}