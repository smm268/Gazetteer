<?php
header('Content-Type: application/json');

// GeoNames API credentials
$username = 'smm488';

// Get the bounding box coordinates (min_lat, max_lat, min_lon, max_lon) for the selected country from the URL parameters
$north = $_GET['north'];
$south = $_GET['south'];
$east = $_GET['east'];
$west = $_GET['west'];

// GeoNames Earthquakes API URL (replace with actual parameters)
$url = "http://api.geonames.org/earthquakesJSON?north=$north&south=$south&east=$east&west=$west&username=$username";

// Fetch earthquake data from the GeoNames API
$response = file_get_contents($url);
echo $response;
?>
