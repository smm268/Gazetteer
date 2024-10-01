<?php
header('Content-Type: application/json');

// Get the country name from the query parameters
if (isset($_GET['country_name'])) {
    $countryName = urlencode($_GET['country_name']);

   
    $username = 'smm488';

    // Fetch country code using GeoNames API based on country name
    $urlCountryInfo = "http://api.geonames.org/searchJSON?q={$countryName}&maxRows=1&username={$username}";
    $countryInfoResponse = file_get_contents($urlCountryInfo);
    $countryInfoData = json_decode($countryInfoResponse, true);

    if (isset($countryInfoData['geonames'][0]['countryCode'])) {
        // Extract country code from the response
        $countryCode = $countryInfoData['geonames'][0]['countryCode'];

        // Fetch detailed country info using the country code
        $urlDetailedInfo = "http://api.geonames.org/countryInfoJSON?formatted=true&country={$countryCode}&username={$username}";
        $detailedResponse = file_get_contents($urlDetailedInfo);
        $detailedData = json_decode($detailedResponse, true);

        if (isset($detailedData['geonames'][0])) {
            $countryDetails = $detailedData['geonames'][0];

            // Return the relevant details as a JSON response
            echo json_encode([
                'countryName' => $countryDetails['countryName'],
                'capital' => $countryDetails['capital'],
                'population' => number_format($countryDetails['population']),
                'language' => $countryDetails['languages'],
            ]);
        } else {
            // Error in fetching detailed country info
            echo json_encode(['error' => 'Country details not found']);
        }
    } else {
        // Error if country not found
        echo json_encode(['error' => 'Country not found']);
    }
} else {
    echo json_encode(['error' => 'Country name is missing']);
}
?>
