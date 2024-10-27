// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

let map;
let selectedCountryLayer; // Holds country borders layer

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
const earthquakes = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
  }
});
const cities = L.markerClusterGroup({
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
      if (selectedCountryLayer) {
        map.removeLayer(selectedCountryLayer);
      }

      var myStyle = {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };
      // Add new layer border
      selectedCountryLayer = L.geoJSON(data.geometry,{
        style: myStyle
      }).addTo(map);
     
      map.fitBounds(selectedCountryLayer.getBounds());
      

    
      // Get country bounding box from GeoJSON layer
      let bounds = selectedCountryLayer.getBounds();
      let north = bounds.getNorth(); 
      let south = bounds.getSouth(); 
      let east = bounds.getEast();  
      let west = bounds.getWest();  

      console.log(`Bounding Box - North: ${north}, South: ${south}, East: ${east}, West: ${west}`);

      getEarthquakes(north, south, east, west);  
      getCities(iso_a2);
    })
    .catch((error) => console.error("Error retrieving country border:", error));
}

//fetch earthquake
function getEarthquakes(north, south, east, west) {
  console.log("Fetching earthquake data...");

  fetch(`data/getEarthquakes.php?north=${north}&south=${south}&east=${east}&west=${west}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Earthquake Data Received:", data); // Debugging
      
      // Clear previous earthquake markers
      earthquakes.clearLayers();

      // Check if the earthquakes array exists and is an array
      if (Array.isArray(data.earthquakes)) {
        data.earthquakes.forEach((quake) => {
          const magnitude = quake.magnitude;
          const lat = quake.lat;
          const lng = quake.lng;

          // Create earthquake icon based on magnitude
          const earthquakeIcon = L.ExtraMarkers.icon({
            icon: 'fa-solid fa-house-crack',
            markerColor: 'red', // Red for magnitude > 5
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
      } else {
        console.log("No earthquake data available for the selected area.");
      }
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

const overlayMaps = {
  "Cities": cities,
  "Earthquakes": earthquakes,
};

// Add layer control
L.control.layers(basemaps,overlayMaps).addTo(map);




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
  $("#exchangeRateModal").modal("show"); 
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


// Clear all logs and errors
console.log = function () {};


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

     fetch('data/getCountryCode.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng }),
      })
        .then(response => response.json())
        .then(data => {
          const countryCode = data.countryCode;
          if (countryCode) {
            // Set the country select dropdown and trigger change event
            const countrySelect = document.getElementById("countrySelect");
            countrySelect.value = countryCode.toUpperCase();
            countrySelect.dispatchEvent(new Event('change'));

            
          } else {
            console.error('Country code not found');
          }
        })
        .catch(error => console.error('Error fetching country code:', error));
       
    },
      function (error) {
        console.error("Error getting geolocation: ", error);
      }
    );
   } else {
    console.error("Geolocation is not supported by this browser.");
   }

  // Event listener for country selection from menu
  document.getElementById("countrySelect").addEventListener("change", function () {
      const iso_a2 = this.value.toUpperCase(); 
      document.getElementById('preloader');
      console.log(`Country selected: ${iso_a2}`); 

      loadCountryBorders(iso_a2);

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
      if (selectedCountryLayer) {
        map.removeLayer(selectedCountryLayer);
      }

      var myStyle = {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };
      // Add new layer border
      selectedCountryLayer = L.geoJSON(data.geometry,{
        style: myStyle
      }).addTo(map);
      // Adjust map view with borders
      map.fitBounds(selectedCountryLayer.getBounds());
      
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
      const population = numeral(countryData.population).format('0,0');
      const language = Object.values(countryData.languages || {}).join(", ");

      // Handle the currency data and get currency code
      const currencyInfo = countryData.currencies
        ? Object.values(countryData.currencies)[0]
        : null;
      const currency = currencyInfo ? currencyInfo.name : "No data available";
   
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
      document.getElementById('todayMaxTemp').textContent = numeral(Math.round(data.forecast.forecastday[0].day.maxtemp_c)).format('0,0');
      document.getElementById('todayMinTemp').textContent = numeral(Math.round(data.forecast.forecastday[0].day.mintemp_c)).format('0,0') ;
      //current weather icon
      const iconUrl = `https:${data.current.condition.icon}`;
      document.getElementById('todayIcon').src = iconUrl;
      document.getElementById('todayIcon').alt = data.current.condition.text;
      document.getElementById('todayIcon').title = data.current.condition.text;
      //day1 weather
      document.getElementById('day1Date').textContent = formatDate(data.forecast.forecastday[1].date);
      document.getElementById('day1MaxTemp').textContent = numeral(Math.round(data.forecast.forecastday[1].day.maxtemp_c)).format('0,0');
      document.getElementById('day1MinTemp').textContent = numeral(Math.round(data.forecast.forecastday[1].day.mintemp_c)).format('0,0');

      //day1 weather icon
      const day1IconUrl = `https:${data.forecast.forecastday[1].day.condition.icon}`;
      document.getElementById('day1Icon').src = day1IconUrl;
      document.getElementById('day1Icon').alt = data.forecast.forecastday[1].day.condition.text;
      document.getElementById('day1Icon').title = data.forecast.forecastday[1].day.condition.text;
       //day2 weather
       document.getElementById('day2Date').textContent = formatDate(data.forecast.forecastday[2].date);
       document.getElementById('day2MaxTemp').textContent = numeral(Math.round(data.forecast.forecastday[2].day.maxtemp_c)).format('0,0');
       document.getElementById('day2MinTemp').textContent = numeral(Math.round(data.forecast.forecastday[2].day.mintemp_c)).format('0,0');
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

// Function to format dates using date-fns
function formatDate(dateString) {
  const date = new Date(dateString); 
  return dateFns.format(date, 'eeee, MMMM d'); 
}


// Fetch currency rates 
document.addEventListener("DOMContentLoaded", function () {
  const fromAmount = document.getElementById("fromAmount");
  const toAmount = document.getElementById("toAmount");
  const exchangeRateSelect = document.getElementById("exchangeRate");

  function fetchRates() {
      fetch("data/getExchangeRate.php")
          .then(response => {
              if (!response.ok) {
                  throw new Error("Network response was not ok " + response.statusText);
              }
              return response.json();
          })
          .then(data => {
              if (data && data.rates) {
                  populateCurrencyOptions(data.rates);
              } else {
                  alert("Failed to load exchange rates.");
              }
          })
          .catch(error => console.error("Error fetching rates:", error));
  }

  // Populate the dropdown with currency options
  function populateCurrencyOptions(rates) {
      exchangeRateSelect.innerHTML = "";
      for (const currencyCode in rates) {
          const option = document.createElement("option");
          option.value = rates[currencyCode];
          option.textContent = currencyCode;
          exchangeRateSelect.appendChild(option);
      }
  }

  // Update converted amount
  function updateConversion() {
      const rate = parseFloat(exchangeRateSelect.value);
      const amount = parseFloat(fromAmount.value);
      if (!isNaN(rate) && !isNaN(amount)) {
        const convertedAmount = amount * rate;
        toAmount.value = numeral(convertedAmount).format('0,0.00');
      }
  }

  // Event Listeners
  fromAmount.addEventListener("input", updateConversion);
  exchangeRateSelect.addEventListener("change", updateConversion);

  // Fetch initial exchange rates on load
  fetchRates();
});


//function to fetch news
function fetchNews() {
  fetch('data/getNews.php')
      .then((response) => response.json())
      .then((data) => {
          if (data.error) {
              console.error("Error fetching news:", data.error);
              return;
          }

          if (data.articles && data.articles.length > 0) {
              const newsContent = document.getElementById('newsContent');
              newsContent.innerHTML = ''; // Clear existing content

              data.articles.forEach((article) => {
                  const articleHTML = `
                  <table class="table table-borderless mb-0">
                          <tr>
                              <td rowspan="2" width="50%">
                                  <img class="img-fluid rounded" src="${article.imageUrl}" alt="news image" title="${article.title}">
                              </td>
                              <td>
                                  <a href="${article.url}" class="fw-bold fs-6 text-black" target="_blank">${article.title}</a>
                              </td>
                          </tr>
                          <tr>
                              <td class="align-bottom pb-0">
                                  <p class="fw-light fs-6 mb-1">${article.source}</p>
                              </td>            
                          </tr>
                      </table>
                      <hr>
                  `;
                  newsContent.insertAdjacentHTML('beforeend', articleHTML);
              });

              // Show the news modal
              $("#newsModal").modal("show");
          } else {
              console.error("No articles found in the response.");
          }
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