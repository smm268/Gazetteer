<?php
// Get the country ISO code from the query string
if (isset($_GET['iso_a2'])) {
    $isoCode = strtoupper($_GET['iso_a2']);

    // REST Countries API URL with the country ISO code
    $url = "https://restcountries.com/v3.1/alpha/" . $isoCode;

    // Initialize cURL session
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute cURL session
    $response = curl_exec($ch);

    // Check for errors
    if ($response === false) {
        echo json_encode(['error' => 'Error fetching country data']);
        exit;
    }

    // Close cURL session
    curl_close($ch);

    // Output the response
    header('Content-Type: application/json');
    echo $response;
} else {
    echo json_encode(['error' => 'No country ISO code provided']);
}
?>
