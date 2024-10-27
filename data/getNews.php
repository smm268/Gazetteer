<?php
header("Content-Type: application/json");


$apiKey = 'pub_55425db5f9441895ca34ed72624163514045c';


$country = isset($_GET['country']) ? $_GET['country'] : 'us';


$newsdataUrl = "https://newsdata.io/api/1/news?apikey=$apiKey&country=$country";

$newsResponse = file_get_contents($newsdataUrl);

if ($newsResponse === FALSE) {
    echo json_encode(['error' => 'Unable to fetch news.']);
    exit;
}


$newsData = json_decode($newsResponse, true);


if (isset($newsData['results']) && is_array($newsData['results'])) {
    $articles = array_map(function($article) {
        return [
            'title' => $article['title'] ?? 'No title',
            'description' => $article['description'] ?? 'No description',
            'url' => $article['link'] ?? '#',
            'imageUrl' => $article['image_url'] ?? '', 
            'source' => $article['source_id'] ?? 'Unknown Source'
        ];
    }, $newsData['results']);

    echo json_encode(['articles' => $articles]);
} else {
    echo json_encode(['error' => 'No articles found in the response.']);
}
?>
