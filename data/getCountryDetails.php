<?php

if (isset($_GET['iso_a2'])) {
    $isoCode = strtoupper($_GET['iso_a2']);

    $url = "https://restcountries.com/v3.1/alpha/" . $isoCode;

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    
    $response = curl_exec($ch);

  
    if ($response === false) {
        echo json_encode(['error' => 'Error fetching country data']);
        exit;
    }

    curl_close($ch);

    header('Content-Type: application/json');
    echo $response;
} else {
    echo json_encode(['error' => 'No country ISO code provided']);
}
?>
