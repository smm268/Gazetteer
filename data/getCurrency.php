

<?php
// Check if currencyCode is set
if (!isset($_GET['currencyCode'])) {
    echo json_encode(['error' => 'Currency code is missing']);
    exit;
}

$currencyCode = $_GET['currencyCode'];

// Fetch currency data from OpenExchangeRates API

$apiUrl = "https://openexchangerates.org/api/latest.json?app_id=2207b37df7564933861356998530f49c";

$response = file_get_contents($apiUrl);
$data = json_decode($response, true);

// Check if the currency code exists in the data
if (isset($data['rates'][$currencyCode])) {
    $rate = $data['rates'][$currencyCode];
    echo json_encode(['rate' => $rate]);
} else {
    echo json_encode(['error' => 'Currency not found']);
}
?>
