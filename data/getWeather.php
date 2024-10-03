<?php

$apiKey = "a7e56466749cbee89130a3eed002da3a";

// Get latitude and longitude from query parameters
$lat = isset($_GET['lat']) ? $_GET['lat'] : '';
$lon = isset($_GET['lon']) ? $_GET['lon'] : '';

// If lat or lon is empty, return an error
if (empty($lat) || empty($lon)) {
    echo json_encode(['error' => 'Latitude and Longitude are required']);
    exit();
}

// OpenWeather API URLs
$currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&units=metric";
$forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&units=metric";

// Function to fetch data from URL
function fetchWeatherData($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Fetch current weather and forecast data
$currentWeatherData = fetchWeatherData($currentWeatherUrl);
$forecastData = fetchWeatherData($forecastUrl);

// Combine the results and send it back as a JSON response
$result = [
    'current' => $currentWeatherData,
    'forecast' => $forecastData
];

header('Content-Type: application/json');
echo json_encode($result);
?>