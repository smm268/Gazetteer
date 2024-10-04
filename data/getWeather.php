<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!isset($_GET['lat']) || !isset($_GET['lon'])) {
    echo json_encode(['error' => 'Latitude and longitude not provided']);
    exit();
}



$apiKey = '41285fd9b56c453191c122118240410';

// Get latitude and longitude from the request
$lat = $_GET['lat'];
$lon = $_GET['lon'];

// URL for fetching weather data
$url = "http://api.weatherapi.com/v1/forecast.json?key=$apiKey&q=$lat,$lon&days=3";

// Fetch the weather data
$response = file_get_contents($url);

// Check if the response is valid
if ($response === FALSE) {
    echo json_encode(['error' => 'Failed to fetch data from WeatherAPI']);
    exit;
}

// Return the response
header('Content-Type: application/json');
echo $response;
?>
