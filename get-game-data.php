<?php
include 'db.php';

$gridSize = 0.0135; // Approximate degrees corresponding to 1.5 km.
$canvaSize = 312; // Size of the canvas in pixels.

function getTileID($lon, $lat, $gridSize)
{
    $lonIndex = floor($lon / $gridSize);
    $latIndex = floor($lat / $gridSize);
    return "{$lonIndex}_{$latIndex}";
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

function addSeed($userLat, $userLon, $seed)
{
    global $collectionTiles, $gridSize;

    $tileID = getTileID($userLon, $userLat, $gridSize);

    $currentTile = $collectionTiles->findOne(['tileID' => $tileID]);

    if (!$currentTile) {
        return ['error' => 'Invalid tile.'];
        exit;
    } else {
        // Update the seed array with the new seed.
        $currentTile['seeds'][] = $seed;
        $collectionTiles->updateOne(['tileID' => $tileID], ['$set' => ['seeds' => $currentTile['seeds']]]);
    }

    return $currentTile['seeds'];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['action'])) {
        if ($input['action'] == 'addSeed') {
            $userLat = isset($input['lat']) ? floatval($input['lat']) : null;
            $userLon = isset($input['lon']) ? floatval($input['lon']) : null;
            $seed = isset($input['seed']) ? $input['seed'] : null;

            if ($userLat === null || $userLon === null) {
                echo json_encode(['error' => 'Invalid location.']);
                exit;
            } else if ($seed === null) {
                echo json_encode(['error' => 'Invalid seed.']);
                exit;
            }

            $response = addSeed($userLat, $userLon, $seed);

            echo json_encode($response);
        } elseif ($input['action'] == 'register') {
            $username = isset($input['username']) ? $input['username'] : null;
            $password = isset($input['password']) ? $input['password'] : null;

            if ($username === null || $password === null) {
                echo json_encode(['error' => 'Missing username or password.']);
                exit;
            }

            $user = $collectionUsers->findOne(['username' => $username]);

            if ($user) {
                echo json_encode(['error' => 'Username already exists.']);
                exit;
            } else {
                $newUser = [
                    'username' => $username,
                    'password' => password_hash($password, PASSWORD_DEFAULT),
                    'inventory' => []
                ];
                $collectionUsers->insertOne($newUser);
                echo json_encode($newUser);
            }
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
        }
    }

    echo json_encode($response);
}
