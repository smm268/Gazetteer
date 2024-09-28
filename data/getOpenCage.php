<?php
if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];

    // OpenCage API key (you need to sign up for one)
    $apiKey = 'eb581a03425e482c86521447b05443b2';
    $url = "https://api.opencagedata.com/geocode/v1/json?q=$lat+$lng&key=$apiKey";

    $response = file_get_contents($url);
    $data = json_decode($response, true);

    if (!empty($data['results'])) {
        $countryCode = $data['results'][0]['components']['country_code'];
        $countryName = $data['results'][0]['components']['country'];

        echo json_encode([
            'iso_code' => $countryCode,
            'country_name' => $countryName,
        ]);
    } else {
        echo json_encode(['error' => 'Unable to retrieve location data']);
    }
} else {
    echo json_encode(['error' => 'Invalid parameters']);
}
?>
