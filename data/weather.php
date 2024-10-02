
<?php
// Set the header to return JSON
header('Content-Type: application/json');

// Get the capital city from the query parameters
$capital = isset($_GET['capital']) ? $_GET['capital'] : null;

if (!$capital) {
    echo json_encode(['error' => 'Capital city is required']);
    exit;
}

// OpenWeatherMap API URL and API key
$apiKey = 'a7e56466749cbee89130a3eed002da3a';
$apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" . urlencode($capital) . "&appid=" . $apiKey . "&units=metric";

// Fetch data from the OpenWeatherMap API
$response = file_get_contents($apiUrl);
$data = json_decode($response, true);

// Check for errors in the API response
if (isset($data['cod']) && $data['cod'] != 200) {
    echo json_encode(['error' => $data['message']]);
    exit;
}

// Prepare the weather information
$temperature = $data['main']['temp'];
$description = $data['weather'][0]['description'];

// Return the result
echo json_encode([
    'temperature' => $temperature,
    'description' => ucfirst($description) // Capitalize the description
]);
?>
