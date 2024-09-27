<?php
//Read Json File
$jsonData = file_get_contents("countryBorders.geo.json");
//Decode Json data into a PHP array
$dataArray = json_decode($jsonData, true);
//Initialise an array to holf extracted data
$isoNamesArray = [];
//Loop through the data and extract the iso_code and name
foreach ($dataArray["features"] as $feature) {
    $isoNamesArray[] = [
        "iso_code" => $feature["properties"]["iso_a2"],
        "name" => $feature["properties"]["name"]
    ];
}

//Encode the result as a Json object and output it
header("Content-Type: application/json");
echo json_encode($isoNamesArray, JSON_PRETTY_PRINT);

?>
