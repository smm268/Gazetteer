<?php
header('Content-Type: application/json');

// Ensure the capital is set
if (!isset($_GET['capital'])) {
    echo json_encode(['error' => 'Capital city is missing']);
    exit;
}

$capitalCity = urlencode($_GET['capital']);
$apiKey = 'a7e56466749cbee89130a3eed002da3a'; // Replace with your OpenWeather API key

// Fetch weather data for the capital city
$apiUrl = "https://api.openweathermap.org/data/2.5/weather?q={$capitalCity}&appid={$apiKey}&units=metric";

$response = file_get_contents($apiUrl);
$data = json_decode($response, true);

// Check if the data is valid
if (isset($data['main'])) {
    $weather = [
        'temperature' => $data['main']['temp'],
        'description' => $data['weather'][0]['description'],
        'humidity' => $data['main']['humidity'],
        'windSpeed' => $data['wind']['speed']
    ];
    echo json_encode($weather);
} else {
    echo json_encode(['error' => 'Weather data not found']);
}
?>
