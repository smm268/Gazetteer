<?php

  $username = 'smm488';

  // Get country ISO code from request
  $iso_a2 = $_GET['iso_a2'];

  // Geonames API URL for earthquake data (example for past 30 days)
  $earthquakeUrl = "http://api.geonames.org/earthquakesJSON?north=44&south=36&east=-115&west=-125&username=$username"; // Set the bounding box dynamically if needed

  // Fetch data from API
  $earthquakeData = file_get_contents($earthquakeUrl);

  // Return JSON data
  echo $earthquakeData;
?>
