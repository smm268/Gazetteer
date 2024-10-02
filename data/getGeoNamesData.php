<?php
if (isset($_GET['countryISO'])) {
    $countryISO = $_GET['countryISO'];
    $username = 'smm488';  // Replace with your GeoNames username

    // GeoNames API URL
    $apiUrl = "http://api.geonames.org/countryInfoJSON?formatted=true&country=" . urlencode($countryISO) . "&username=" . urlencode($username);

    // Initialize cURL session
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    // Return the GeoNames API response as JSON
    header('Content-Type: application/json');
    echo $response;
} else {
    echo json_encode(['error' => 'Country ISO code not provided']);
}
?>
