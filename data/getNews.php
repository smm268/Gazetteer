<?php

$apiKey = 'pub_55425db5f9441895ca34ed72624163514045c'; 

// Get the country code or location passed from the client
$country = $_GET['country'] ?? 'us'; // default to 'us' if no country is provided

// Prepare the Newsdata.io API URL
$newsdataUrl = "https://newsdata.io/api/1/news?apikey=$apiKey&country=$country";

// Fetch news data from Newsdata.io API
$newsResponse = file_get_contents($newsdataUrl);

// Return the news data as JSON
if ($newsResponse) {
    echo $newsResponse;
} else {
    echo json_encode(['error' => 'Unable to fetch news.']);
}
?>