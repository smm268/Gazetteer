<?php
// Set the header to return JSON
header('Content-Type: application/json');

// Get the country name from the query parameters
$country_name = isset($_GET['country_name']) ? $_GET['country_name'] : null;

if (!$country_name) {
    echo json_encode(['error' => 'Country name is required']);
    exit;
}

// URL encode the country name to ensure it's safe for the API request
$country_name_encoded = urlencode($country_name);

// Wikipedia API endpoint for searching
$api_url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={$country_name_encoded}&format=json&utf8=1&origin=*";

// Fetch data from the Wikipedia API
$response = file_get_contents($api_url);
$data = json_decode($response, true);

// Check for errors in the API response
if (isset($data['error'])) {
    echo json_encode(['error' => $data['error']['info']]);
    exit;
}

// Check if there are search results
if (isset($data['query']['search']) && count($data['query']['search']) > 0) {
    // Get the first search result
    $result = $data['query']['search'][0];

    // Prepare the response with the title, extract, and URL
    $title = $result['title'];
    $extract = $result['snippet']; // This snippet can contain HTML tags, you might want to strip them out
    $url = "https://en.wikipedia.org/wiki/" . urlencode($title);

    // Return the result
    echo json_encode([
        'title' => $title,
        'extract' => strip_tags($extract), // Optionally strip HTML tags for better presentation
        'url' => $url,
    ]);
} else {
    // No results found
    echo json_encode(['error' => 'No Wikipedia information found']);
}
?>
