<?php
header('Content-Type: application/json');

$apiKey = 'eb581a03425e482c86521447b05443b2';

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];
    $apiUrl = "https://api.opencagedata.com/geocode/v1/json?q=$lat+$lng&key=$apiKey";
} elseif (isset($_GET['country_name'])) {
    $countryName = urlencode($_GET['country_name']);
    $apiUrl = "https://api.opencagedata.com/geocode/v1/json?q=$countryName&key=$apiKey";
} else {
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$response = file_get_contents($apiUrl);
if ($response === FALSE) {
    echo json_encode(['error' => 'Failed to fetch data from OpenCage API']);
    exit;
}

$data = json_decode($response, true);
if (isset($data['results']) && count($data['results']) > 0) {
    $result = $data['results'][0];

    if (isset($_GET['lat']) && isset($_GET['lng'])) {
        $countryISO = strtoupper($result['components']['country_code']);
        $countryName = $result['components']['country'];
        echo json_encode([
            'countryISO' => $countryISO,
            'countryName' => $countryName
        ]);
    } elseif (isset($_GET['country_name'])) {
        $lat = $result['geometry']['lat'];
        $lng = $result['geometry']['lng'];
        $countryISO = strtoupper($result['components']['country_code']);
        $countryName = $result['components']['country'];
        echo json_encode([
            'lat' => $lat,
            'lng' => $lng,
            'countryISO' => $countryISO,
            'countryName' => $countryName
        ]);
    }
} else {
    echo json_encode(['error' => 'No results from OpenCage API']);
}
?>
