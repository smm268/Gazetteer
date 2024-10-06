<?php

$apiKey = '2207b37df7564933861356998530f49c';
$baseCurrency = isset($_GET['base']) ? $_GET['base'] : '';
$targetCurrency = isset($_GET['target']) ? $_GET['target'] : '';

if (!$baseCurrency || !$targetCurrency) {
    echo json_encode(['error' => 'Invalid parameters.']);
    exit;
}

// Use an external API to fetch exchange rate (e.g., Open Exchange Rates or CurrencyLayer)
$url = "https://api.exchangerate-api.com/v4/latest/$baseCurrency";

$response = file_get_contents($url);
$data = json_decode($response, true);

if (isset($data['error'])) {
    echo json_encode(['error' => $data['error']]);
    exit;
}

if (!isset($data['rates'][$targetCurrency])) {
    echo json_encode(['error' => 'Target currency not found.']);
    exit;
}

// Send back the exchange rate for the target currency
echo json_encode(['rate' => $data['rates'][$targetCurrency]]);
?>
