<?php
 
  $username = 'smm488';

  // Get country ISO code from request
  $iso_a2 = $_GET['iso_a2'];

  // Geonames API URL for city data
  $cityUrl = "http://api.geonames.org/searchJSON?country=$iso_a2&maxRows=1&featureClass=P&orderby=population&username=$username";

  // Fetch data from API
  $cityData = file_get_contents($cityUrl);
  
  // Return JSON data
  echo $cityData;
?>
