<?php
header("Content-Type: application/json");

$requestPayload = file_get_contents("php://input");
$data = json_decode($requestPayload, true);

if (isset($data['lat']) && isset($data['lng'])) {
    $lat = $data['lat'];
    $lng = $data['lng'];

    $username = 'smm488';
    $url = "http://api.geonames.org/countryCodeJSON?lat={$lat}&lng={$lng}&username={$username}";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
} else {
    echo json_encode(['error' => 'Invalid request']);
}
