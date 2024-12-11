<?php
include 'db.php';

// Start session.
session_start();

$gridSize = 0.0135; // Approximate degrees corresponding to 1.5 km.
$canvaSize = 312; // Size of the canvas in pixels.

// Check if two elements are too close.
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

// Generate random lifeforms.
function generateRandomLifeforms($canvaSize)
{
    $lifeforms = array(
        'fly' => array(
            'names' => ['insect_fly', 'insect_fly_swarm'],
            'quantity' => rand(0, 5),
            'resize' => 0.25
        ),
        'bee' => array(
            'names' => ['insect_bee'],
            'quantity' => rand(0, 3),
            'resize' => 0.25
        ),
        'bird' => array(
            'names' => ['animal_bird_0'],
            'quantity' => rand(0, 1),
            'resize' => 1
        ),
    );

    $lifeform = [];
    $minDistance = 50; // Minimum distance between elements in pixels.

    foreach ($lifeforms as $item) {
        for ($i = 0; $i < $item['quantity']; $i++) {
            do {
                $x = rand(0, $canvaSize);
                $y = rand(0, $canvaSize);
            } while (isTooClose($x, $y, $lifeform, $minDistance));

            $lifeform[] = [
                'name' => $item['names'][array_rand($item['names'])],
                'x' => $x,
                'y' => $y,
                'resize' => $item['resize']
            ];
        }
    }

    return $lifeform;
}

// Generate random environment.
function generateRandomEnvironment($canvaSize)
{
    $envItems = array(
        'rock' => array(
            'names' => ['small_rocks', 'rock_0', 'big_rocks_1'],
            'quantity' => rand(3, 8)
        ),
        'grass' => array(
            'names' => ['grass_0', 'grass_1', 'grass_2', 'grass_3', 'grass_4'],
            'quantity' => rand(7, 15)
        ),
        'puddle' => array(
            'names' => ['water_puddle_1', 'water_puddle_2'],
            'quantity' => rand(0, 3)
        )
    );
    $environment = [];
    $minDistance = 50; // Minimum distance between elements in pixels.

    foreach ($envItems as $item) {
        for ($i = 0; $i < $item['quantity']; $i++) {
            do {
                $x = rand(0, $canvaSize);
                $y = rand(0, $canvaSize);
            } while (isTooClose($x, $y, $environment, $minDistance));

            $environment[] = [
                'name' => $item['names'][array_rand($item['names'])],
                'x' => $x,
                'y' => $y
            ];
        }
    }

    return $environment;
}

// Update plant (seed).
function updatePlant($userLat, $userLon, $seed, $username)
{
    global $gridSize;

    $tileID = getTileID($userLon, $userLat, $gridSize);
    $currentTile = getTile($tileID);
    if (!$currentTile) return ['error' => 'Invalid tile.'];

    $found = false;
    foreach ($currentTile['seeds'] as $key => $currentSeed) {
        if ($currentSeed['x'] === $seed['x'] && $currentSeed['y'] === $seed['y']) {
            $currentTile['seeds'][$key] = $seed;
            $found = true;
            break;
        }
    }

    if (!$found) return ['error' => 'Invalid seed.'];

    updateTileSeeds($tileID, $currentTile['seeds']);
    decrementUserAction($username, 'seed');

    return $currentTile['seeds'];
}

// Plant seed.
function plantSeed($userLat, $userLon, $seed, $username)
{
    global $gridSize;

    $tileID = getTileID($userLon, $userLat, $gridSize);
    $currentTile = getTile($tileID);
    if (!$currentTile) return ['error' => 'Invalid tile.'];

    $currentTile['seeds'][] = $seed;
    updateTileSeeds($tileID, $currentTile['seeds']);
    decrementUserAction($username, str_contains($seed['name'], 'seed') ? 'seed' : 'small_crops_0');

    return $currentTile['seeds'];
}

// Get the tile ID.
function getTileID($lon, $lat, $gridSize)
{
    $tileX = floor($lon / $gridSize);
    $tileY = floor($lat / $gridSize);
    return $tileX . '_' . $tileY;
}

// Get a tile.
function getTile($tileID)
{
    global $collectionTiles;
    return $collectionTiles->findOne(['tileID' => $tileID]);
}

// Update the seeds of a tile.
function updateTileSeeds($tileID, $seeds)
{
    global $collectionTiles;
    $collectionTiles->updateOne(['tileID' => $tileID], ['$set' => ['seeds' => $seeds]]);
}

// Decrement the user action.
function decrementUserAction($username, $itemName)
{
    global $collectionUsers;
    $user = $collectionUsers->findOne(['username' => $username]);
    if ($user['actions'] <= 0) return;

    $collectionUsers->updateOne(['username' => $username], ['$inc' => ['actions' => -1]]);
    $collectionUsers->updateOne(['username' => $username, 'inventory.name' => $itemName], ['$inc' => ['inventory.$.quantity' => -1]]);
    $collectionUsers->updateOne(
        ['username' => $username, 'inventory' => ['$elemMatch' => ['name' => $itemName, 'quantity' => ['$lte' => 0]]]],
        ['$pull' => ['inventory' => ['name' => $itemName]]]
    );
}

// Handle a POST request.
function handlePostRequest($input)
{
    if (!isset($input['action'])) return ['error' => 'Invalid action.'];

    $userLat = isset($input['lat']) ? floatval($input['lat']) : null;
    $userLon = isset($input['lon']) ? floatval($input['lon']) : null;
    $seed = $input['seed'] ?? null;
    $username = $input['username'] ?? null;

    if ($userLat === null || $userLon === null) return ['error' => 'Invalid location.'];
    if ($seed === null) return ['error' => 'Invalid seed.'];
    if ($username === null) return ['error' => 'Invalid username.'];

    switch ($input['action']) {
        case 'plantSeed':
            return ['seeds' => plantSeed($userLat, $userLon, $seed, $username)];
        case 'updatePlant':
            return ['seeds' => updatePlant($userLat, $userLon, $seed, $username)];
        default:
            return ['error' => 'Unknown action.'];
    }
}

// Handle a GET request.
function handleGetRequest($userLat, $userLon, $range = 1)
{
    global $collectionTiles, $gridSize, $canvaSize;

    $lonIndex = floor($userLon / $gridSize);
    $latIndex = floor($userLat / $gridSize);
    $response = [];

    for ($dx = -$range; $dx <= $range; $dx++) {
        for ($dy = -$range; $dy <= $range; $dy++) {
            $tileID = ($lonIndex + $dx) . '_' . ($latIndex + $dy);
            $currentTile = getTile($tileID);

            if (!$currentTile) {
                $currentTile = [
                    'tileID' => $tileID,
                    'seeds' => [],
                    'environment' => generateRandomEnvironment($canvaSize)
                ];
                $collectionTiles->insertOne($currentTile);
            }

            if ($dx === 0 && $dy === 0) {
                $currentTile['lifeforms'] = generateRandomLifeforms($canvaSize);
            }

            $response[$tileID] = $currentTile;
        }
    }

    return $response;
}

// Main entry point.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    echo json_encode(handlePostRequest($input));
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
    $userLon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;

    if ($userLat === null || $userLon === null) {
        echo json_encode(['error' => 'Missing latitude or longitude.']);
    } else {
        echo json_encode(handleGetRequest($userLat, $userLon));
    }
}
