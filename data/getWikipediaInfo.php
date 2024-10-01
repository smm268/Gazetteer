<?php
header('Content-Type: application/json');

// Check if country_name is provided
if (!isset($_GET['country_name'])) {
    echo json_encode(['error' => 'Country name is missing']);
    exit;
}

$countryName = urlencode($_GET['country_name']);

// Wikipedia API URL
$wikiApiUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/{$countryName}";

// Fetch Wikipedia page summary
$response = file_get_contents($wikiApiUrl);
$data = json_decode($response, true);

// Check if the page exists
if (isset($data['extract'])) {
    echo json_encode([
        'title' => $data['title'],
        'extract' => $data['extract'],
        'url' => $data['content_urls']['desktop']['page']
    ]);
} else {
    echo json_encode(['error' => 'Wikipedia info not found']);
}
?>
