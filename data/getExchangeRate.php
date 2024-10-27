<?php
$apiKey = '2207b37df7564933861356998530f49c';
$baseCurrency = 'USD';
$url = "https://openexchangerates.org/api/latest.json?app_id={$apiKey}&base={$baseCurrency}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    echo $response;
} else {
    echo json_encode(['error' => 'Unable to fetch exchange rates.']);
}
?>
