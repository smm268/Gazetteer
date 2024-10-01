<?php
header('Content-Type: application/json');

// Check if country_name parameter is set
if (isset($_GET['country_name'])) {
    $countryName = urlencode($_GET['country_name']);
    $username = 'smm488'; // Your GeoNames username

    // Fetch country code using GeoNames API based on country name
    $urlCountryInfo = "http://api.geonames.org/searchJSON?q={$countryName}&maxRows=1&username={$username}";
    $countryInfoResponse = file_get_contents($urlCountryInfo);
    $countryInfoData = json_decode($countryInfoResponse, true);

    if (isset($countryInfoData['geonames'][0]['countryCode'])) {
        // Extract country code (ISO Alpha-2) from the response
        $countryCode = $countryInfoData['geonames'][0]['countryCode'];

        // Fetch detailed country info using the country code
        $urlDetailedInfo = "http://api.geonames.org/countryInfoJSON?formatted=true&country={$countryCode}&username={$username}";
        $detailedResponse = file_get_contents($urlDetailedInfo);
        $detailedData = json_decode($detailedResponse, true);

        if (isset($detailedData['geonames'][0])) {
            $countryDetails = $detailedData['geonames'][0];

            // Now fetch the currency code from the detailed country info
            $currencyCode = $countryDetails['currencyCode'];

            // Return the relevant details as a JSON response
            echo json_encode([
                'countryName' => $countryDetails['countryName'],
                'capital' => $countryDetails['capital'],
                'population' => number_format($countryDetails['population']),
                'language' => $countryDetails['languages'],
                'currencyCode' => $currencyCode  // Add currencyCode to the response
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
