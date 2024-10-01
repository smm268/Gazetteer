<?php
header('Content-Type: application/json');

// Check if iso_code parameter is set
if (isset($_GET['iso_code'])) {
    $isoCode = urlencode($_GET['iso_code']);
    $username = 'smm488'; // Your GeoNames username

    // Fetch detailed country info using GeoNames API with country code
    $urlDetailedInfo = "http://api.geonames.org/countryInfoJSON?formatted=true&country={$isoCode}&username={$username}";
    $detailedResponse = file_get_contents($urlDetailedInfo);

    // Check if the API call was successful
    if ($detailedResponse === FALSE) {
        echo json_encode(['error' => 'Failed to connect to GeoNames API']);
        exit;
    }

    $detailedData = json_decode($detailedResponse, true);

    if (isset($detailedData['geonames'][0])) {
        $countryDetails = $detailedData['geonames'][0];

        // Return the relevant details as a JSON response
        echo json_encode([
            'countryName' => $countryDetails['countryName'],
            'capital' => $countryDetails['capital'],
            'population' => number_format($countryDetails['population']),
            'language' => $countryDetails['languages'],
            'currencyCode' => $countryDetails['currencyCode']
        ]);
    } else {
        // Error in fetching detailed country info
        echo json_encode(['error' => 'Country details not found']);
    }
} else {
    echo json_encode(['error' => 'Country ISO code is missing']);
}
?>
