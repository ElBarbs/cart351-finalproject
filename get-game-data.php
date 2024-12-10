<?php
include 'db.php';

session_start();

$gridSize = 0.0135; // Approximate degrees corresponding to 1.5 km.
$canvaSize = 312; // Size of the canvas in pixels.

function getTileIndex($lon, $lat, $gridSize)
{
    $tileX = floor($lon / $gridSize);
    $tileY = floor($lat / $gridSize);
    return [$tileX, $tileY];
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

function updatePlant($userLat, $userLon, $seed, $username)
{
    global $collectionTiles, $collectionUsers, $gridSize;

    $tileID = implode('_', getTileIndex($userLon, $userLat, $gridSize));

    $currentTile = $collectionTiles->findOne(['tileID' => $tileID]);

    if (!$currentTile) {
        return ['error' => 'Invalid tile.'];
        exit;
    } else {
        $found = false;
        foreach ($currentTile['seeds'] as $key => $currentSeed) {
            if ($currentSeed['x'] == $seed['x'] && $currentSeed['y'] == $seed['y']) {
                $currentTile['seeds'][$key] = $seed;
                $found = true;
                break;
            }
        }

        if (!$found) {
            return ['error' => 'Invalid seed.'];
            exit;
        }

        // Update the tile in the database.
        $collectionTiles->updateOne(['tileID' => $tileID], ['$set' => ['seeds' => $currentTile['seeds']]]);

        // Decrease the user's actions by 1.
        $user = $collectionUsers->findOne(['username' => $username]);
        if ($user['actions'] > 0) {
            $collectionUsers->updateOne(['username' => $username], ['$inc' => ['actions' => -1]]);
            $name = 'seed';
            $collectionUsers->updateOne(['username' => $username, 'inventory.name' => $name], ['$inc' => ['inventory.$.quantity' => -1]]);
            $collectionUsers->updateOne(
                [
                    'username' => $username,
                    'inventory' => [
                        '$elemMatch' => [
                            'name' => $name,
                            'quantity' => ['$lte' => 0]
                        ]
                    ]
                ],
                [
                    '$pull' => ['inventory' => ['name' => $name]]
                ]
            );
        }

        return $currentTile['seeds'];
    }
}

function plantSeed($userLat, $userLon, $seed, $username)
{
    global $collectionTiles, $collectionUsers, $gridSize;

    $tileID = implode('_', getTileIndex($userLon, $userLat, $gridSize));

    $currentTile = $collectionTiles->findOne(['tileID' => $tileID]);

    if (!$currentTile) {
        return ['error' => 'Invalid tile.'];
        exit;
    } else {
        // Update the seed array with the new seed.
        $currentTile['seeds'][] = $seed;
        // Update the tile in the database.
        $collectionTiles->updateOne(['tileID' => $tileID], ['$set' => ['seeds' => $currentTile['seeds']]]);

        $user = $collectionUsers->findOne(['username' => $username]);
        // Decrease the user's actions by 1.
        if ($user['actions'] > 0) {
            $collectionUsers->updateOne(['username' => $username], ['$inc' => ['actions' => -1]]);
            $name = str_contains($seed['name'], 'seed') ? 'seed' : 'small_crops_0';
            $collectionUsers->updateOne(['username' => $username, 'inventory.name' => $name], ['$inc' => ['inventory.$.quantity' => -1]]);
            $collectionUsers->updateOne(
                [
                    'username' => $username,
                    'inventory' => [
                        '$elemMatch' => [
                            'name' => $name,
                            'quantity' => ['$lte' => 0]
                        ]
                    ]
                ],
                [
                    '$pull' => ['inventory' => ['name' => $name]]
                ]
            );
        }

        return $currentTile['seeds'];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['action'])) {
        if ($input['action'] == 'plantSeed') {
            $userLat = isset($input['lat']) ? floatval($input['lat']) : null;
            $userLon = isset($input['lon']) ? floatval($input['lon']) : null;
            $seed = isset($input['seed']) ? $input['seed'] : null;
            $username = isset($input['username']) ? $input['username'] : null;

            if ($userLat === null || $userLon === null) {
                echo json_encode(['error' => 'Invalid location.']);
                exit;
            } else if ($seed === null) {
                echo json_encode(['error' => 'Invalid seed.']);
                exit;
            } else if ($username === null) {
                echo json_encode(['error' => 'Invalid username.']);
                exit;
            }

            $response['seeds'] = plantSeed($userLat, $userLon, $seed, $username);

            echo json_encode($response);
        } else if ($input['action'] == 'updatePlant') {
            $userLat = isset($input['lat']) ? floatval($input['lat']) : null;
            $userLon = isset($input['lon']) ? floatval($input['lon']) : null;
            $seed = isset($input['seed']) ? $input['seed'] : null;
            $username = isset($input['username']) ? $input['username'] : null;

            if ($userLat === null || $userLon === null) {
                echo json_encode(['error' => 'Invalid location.']);
                exit;
            } else if ($seed === null) {
                echo json_encode(['error' => 'Invalid seed.']);
                exit;
            } else if ($username === null) {
                echo json_encode(['error' => 'Invalid username.']);
                exit;
            }

            $response['seeds'] = updatePlant($userLat, $userLon, $seed, $username);

            echo json_encode($response);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
    $userLon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;
    $range = 1;

    if ($userLat === null || $userLon === null) {
        echo json_encode(['error' => 'Missing latitude or longitude.']);
        exit;
    }

    $lonIndex = floor($userLon / $gridSize);
    $latIndex = floor($userLat / $gridSize);
    $response = [];

    for ($dx = -$range; $dx <= $range; $dx++) {
        for ($dy = -$range; $dy <= $range; $dy++) {
            $currentLonIndex = $lonIndex + $dx;
            $currentLatIndex = $latIndex + $dy;
            $tileID = "{$currentLonIndex}_{$currentLatIndex}";

            $currentTile = $collectionTiles->findOne(['tileID' => $tileID]);

            if ($currentTile) {
                $response[$tileID] = $currentTile;
            } else {
                $newTile = [
                    'tileID' => $tileID,
                    'seeds' => [],
                    'environment' => generateRandomEnvironment($canvaSize)
                ];
                $collectionTiles->insertOne($newTile);
                $response[$tileID] = $newTile;
            }

            if ($dx === 0 && $dy === 0) {
                $response[$tileID]['lifeforms'] = generateRandomLifeforms($canvaSize);
            }
        }
    }

    echo json_encode($response);
}
