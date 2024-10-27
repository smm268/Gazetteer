<?php

header('Content-Type: application/json');

$iso_a2 = isset($_GET['iso_a2']) ? $_GET['iso_a2'] : '';

if (!$iso_a2) {
    echo json_encode(['error' => 'No country code provided.']);
    exit;
}


function getCountryName($iso_a2) {
    $url = "https://restcountries.com/v3.1/alpha/" . strtolower($iso_a2);
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    
    if (isset($data[0]['name']['common'])) {
        return $data[0]['name']['common'];
    } else {
        return null;
    }
}


$title = getCountryName($iso_a2);

if (!$title) {
    echo json_encode(['error' => 'Country not found.']);
    exit;
}

$url = "https://en.wikipedia.org/w/api.php?action=parse&page=" . urlencode($title) . "&format=json&origin=*";

$response = file_get_contents($url);
$data = json_decode($response, true);

if (isset($data['error'])) {
    echo json_encode(['error' => 'Failed to fetch article.']);
    exit;
}

$article_title = $data['parse']['title'];
$article_content = $data['parse']['text']['*'];

echo json_encode(['title' => $article_title, 'content' => $article_content]);
?>
