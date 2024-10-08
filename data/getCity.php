<?php
header('Content-Type: application/json');
$iso_a2 = $_GET['iso_a2'];
$api_url = "http://api.geonames.org/searchJSON?country={$iso_a2}&featureCode=PPL&maxRows=10&username=smm488";
$response = file_get_contents($api_url);
$data = json_decode($response, true);

// Extract relevant information
$cities = [];
foreach ($data['geonames'] as $city) {
    $cities[] = [
        'name' => $city['name'],
        'lat' => $city['lat'],
        'lng' => $city['lng'],
        'population' => $city['population'],
    ];
}

echo json_encode(['cities' => $cities]);
?>
