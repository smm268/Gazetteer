<?php
header('Content-Type: application/json');

// Check if country_name parameter is set
if (isset($_GET['country_name'])) {
    $countryName = $_GET['country_name'];
    $username = 'smm488';

    // GeoNames API URL
    $apiUrl = "http://api.geonames.org/countryInfoJSON?formatted=true&country=" . urlencode($countryName) . "&username=" . urlencode($username);

    // Fetch data from the GeoNames API
    $response = file_get_contents($apiUrl);
    if ($response === FALSE) {
        echo json_encode(['error' => 'Failed to connect to GeoNames API']);
        exit;
    }

    $data = json_decode($response, true);
    if (isset($data['geonames']) && count($data['geonames']) > 0) {
        $countryDetails = $data['geonames'][0];
        echo json_encode([
            'countryName' => $countryDetails['countryName'],
            'capital' => $countryDetails['capital'],
            'population' => number_format($countryDetails['population']),
            'language' => $countryDetails['languages'],
            'currencyCode' => $countryDetails['currencyCode']
        ]);
    } else {
        echo json_encode(['error' => 'Country details not found']);
    }
} else {
    echo json_encode(['error' => 'Country name is missing']);
}
?>
