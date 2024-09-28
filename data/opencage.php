<?php
// Set the header to JSON response
header('Content-Type: application/json');

// Check if latitude and longitude are passed via GET request
if (!isset($_GET['lat']) || !isset($_GET['lng'])) {
    echo json_encode(['error' => 'Missing latitude or longitude']);
    exit;
}

$lat = $_GET['lat'];
$lng = $_GET['lng'];

// OpenCage API key - Replace with your actual API key
$apiKey = 'eb581a03425e482c86521447b05443b2';

// Build the OpenCage API URL
$apiUrl = "https://api.opencagedata.com/geocode/v1/json?q=$lat+$lng&key=$apiKey";

// Call the OpenCage API
$response = file_get_contents($apiUrl);

// Check if the API call was successful
if ($response === FALSE) {
    echo json_encode(['error' => 'Failed to fetch data from OpenCage API']);
    exit;
}

// Decode the API response
$data = json_decode($response, true);

// Check if the response contains results
if (isset($data['results']) && count($data['results']) > 0) {
    $countryISO = strtoupper($data['results'][0]['components']['country_code']);  // ISO country code
    $countryName = $data['results'][0]['components']['country'];                  // Country name

    // Return country code and name as JSON
    echo json_encode([
        'countryISO' => $countryISO,
        'countryName' => $countryName
    ]);
} else {
    echo json_encode(['error' => 'No results found']);
}
?>
