<?php
header('Content-Type: application/json');

$username = 'smm488';


$north = $_GET['north'];
$south = $_GET['south'];
$east = $_GET['east'];
$west = $_GET['west'];


$url = "http://api.geonames.org/earthquakesJSON?north=$north&south=$south&east=$east&west=$west&username=$username";



$response = file_get_contents($url);
if ($response === FALSE) {
  echo json_encode(['error' => 'Error fetching data from GeoNames API']);
  exit();
}

$data = json_decode($response, true);


if (!isset($data['earthquakes'])) {
  echo json_encode(['error' => 'No earthquake data found']);
  exit();
}

echo json_encode($data);
?>
