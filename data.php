<?php

header('Content-Type: application/json');

$filepath = 'data/seeds.json';
$gridSize = 0.0135; // Approximate degrees corresponding to 1.5 km.

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the user's latitude and longitude from query parameters
    $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
    $userLon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;

    $input = json_decode(file_get_contents('php://input'), true);
    $seedsData = json_decode(file_get_contents($filepath), true) ?: [];

    // Check if the required fields are present in the input and lat/lon are valid.
    if (isset($input['x']) && isset($input['y']) && $userLat !== null && $userLon !== null && isset($input['state'])) {
        // Calculate the grid indices for the user's location
        $latIndex = floor($userLat / $gridSize);
        $lonIndex = floor($userLon / $gridSize);
        $gridKey = "grid_{$latIndex}_{$lonIndex}";

        // Initialize the grid array if it doesn't exist
        if (!isset($seedsData[$gridKey])) {
            $seedsData[$gridKey] = [];
        }

        // Add the new seed to the grid array.
        $seedsData[$gridKey][] = $input;

        // Save the updated seeds array back to the JSON file
        file_put_contents($filepath, json_encode($seedsData));

        // Return the updated seeds array in the correct JSON format
        echo json_encode(['seeds' => $seedsData[$gridKey]]);
    } else {
        echo json_encode(['error' => 'Missing required fields']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get the user's latitude and longitude from query parameters
    $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
    $userLon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;

    if ($userLat !== null && $userLon !== null) {
        $seedsData = json_decode(file_get_contents($filepath), true) ?: [];

        // Calculate the grid indices for the user's location
        $latIndex = floor($userLat / $gridSize);
        $lonIndex = floor($userLon / $gridSize);
        $gridKey = "grid_{$latIndex}_{$lonIndex}";

        // Retrieve seeds for the user's grid square if it exists
        $nearbySeeds = isset($seedsData[$gridKey]) ? $seedsData[$gridKey] : [];

        // Return the nearby seeds in the correct JSON format
        echo json_encode(['seeds' => $nearbySeeds]);
    } else {
        echo json_encode(['error' => 'Invalid location']);
    }
}
