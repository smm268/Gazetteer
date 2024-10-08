<?php
header('Content-Type: application/json');
$iso_a2 = $_GET['iso_a2'];
$api_url = "http://api.geonames.org/earthquakesJSON?north=90&south=-90&east=180&west=-180&maxRows=10&username=smm488";
$response = file_get_contents($api_url);
$data = json_decode($response, true);

// Extract relevant information
$earthquakes = [];
foreach ($data['earthquakes'] as $quake) {
    $earthquakes[] = [
        'lat' => $quake['lat'],
        'lng' => $quake['lng'],
        'magnitude' => $quake['magnitude'],
        'depth' => $quake['depth'],
    ];
}

echo json_encode(['earthquakes' => $earthquakes]);
?>
