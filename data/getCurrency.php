<?php
$apiKey = '2207b37df7564933861356998530f49c';
$countryISO = $_GET['countryISO'];

$url = "https://openexchangerates.org/api/latest.json?app_id=$apiKey";

// Make the API call and return the response
$response = file_get_contents($url);
echo $response;
?>
