<?php

header('Content-Type: application/json');

$filepath = 'data/terrains.json';
$gridSize = 0.0135; // Approximate degrees corresponding to 1.5 km.
$canvaSize = 490; // Size of the canvas in pixels.

function loadTerrainsData($filepath)
{
    return json_decode(file_get_contents($filepath), true) ?: [];
}

function saveTerrainsData($filepath, $data)
{
    file_put_contents($filepath, json_encode($data));
}

function calculateGridKey($lon, $lat, $gridSize)
{
    $lonIndex = floor($lon / $gridSize);
    $latIndex = floor($lat / $gridSize);
    return "grid_{$lonIndex}_{$latIndex}";
}

// Helper function to check if two elements are too close
function isTooClose($x, $y, $environment, $minDistance)
{
    foreach ($environment as $element) {
        $distance = sqrt(pow($x - $element['x'], 2) + pow($y - $element['y'], 2));
        if ($distance < $minDistance) {
            return true;
        }
    }
    return false;
}

function generateRandomEnvironment($canvaSize)
{
    $rocks = ["small_rocks", "rock_0"];
    $grass = ["grass_0", "grass_1", "grass_2", "grass_3", "grass_4"];
    $environment = [];
    $minDistance = 50; // Minimum distance between elements in pixels.

    // Generate rocks with minimum distance check
    for ($i = 0; $i < rand(3, 8); $i++) {
        do {
            $x = rand(0, $canvaSize);
            $y = rand(0, $canvaSize);
        } while (isTooClose($x, $y, $environment, $minDistance));

        $environment[] = [
            'type' => $rocks[array_rand($rocks)],
            'x' => $x,
            'y' => $y
        ];
    }

    // Generate grass with minimum distance check
    for ($i = 0; $i < rand(7, 15); $i++) {
        do {
            $x = rand(0, $canvaSize);
            $y = rand(0, $canvaSize);
        } while (isTooClose($x, $y, $environment, $minDistance));

        $environment[] = [
            'type' => $grass[array_rand($grass)],
            'x' => $x,
            'y' => $y
        ];
    }

    return $environment;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
    $userLon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;
    $input = json_decode(file_get_contents('php://input'), true);

    if ($userLat === null || $userLon === null || !isset($input['x'], $input['y'], $input['state'])) {
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $terrainsData = loadTerrainsData($filepath);
    $gridKey = calculateGridKey($userLon, $userLat, $gridSize);

    $terrainsData[$gridKey]['seeds'][] = $input;
    saveTerrainsData($filepath, $terrainsData);

    echo json_encode($terrainsData[$gridKey]['seeds']);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
    $userLon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;
    $range = 1;

    if ($userLat === null || $userLon === null) {
        echo json_encode(['error' => 'Invalid location']);
        exit;
    }

    $terrainsData = loadTerrainsData($filepath);
    $lonIndex = floor($userLon / $gridSize);
    $latIndex = floor($userLat / $gridSize);
    $response = [];

    for ($dx = -$range; $dx <= $range; $dx++) {
        for ($dy = -$range; $dy <= $range; $dy++) {
            $currentLonIndex = $lonIndex + $dx;
            $currentLatIndex = $latIndex + $dy;
            $gridKey = "grid_{$currentLonIndex}_{$currentLatIndex}";

            $seeds = $terrainsData[$gridKey]["seeds"] ?? [];
            $environment = $terrainsData[$gridKey]['environment'] ?? generateRandomEnvironment($canvaSize);

            $terrainsData[$gridKey]['environment'] = $environment;

            $response[$gridKey] = [
                'seeds' => $seeds,
                'environment' => $environment
            ];
        }
    }

    saveTerrainsData($filepath, $terrainsData);
    echo json_encode($response);
}
