<?php
header('Content-Type: application/json');
$path = "countryBorders.geo.json";

// Debugging: Check if file exists
if (!file_exists($path)) {
    echo json_encode(['error' => 'File not found']);
    exit;
}

// Debugging: Check if iso_a2 is set
if (!isset($_GET["iso_a2"])) {
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$iso_a2 = $_GET["iso_a2"];
$data = json_decode(file_get_contents($path), true);

// Debugging: Check if data is read correctly
if ($data === null) {
    echo json_encode(['error' => 'Failed to read JSON data']);
    exit;
}

$country = null;

// Debugging: Check the content of $data['features']
file_put_contents('debug.txt', print_r($data['features'], true));

foreach ($data["features"] as $feature) {
    if (isset($feature["properties"]["iso_a2"]) && $feature["properties"]["iso_a2"] === $iso_a2) {
        $country = $feature;
        break;
    }
}

// Debugging: Output country data or error
if ($country) {
    echo json_encode($country);
} else {
    echo json_encode(['error' => 'Country not found', 'input_iso' => $iso_a2]);
}
?>