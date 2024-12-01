<?php
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$uri = $_ENV['MONGODB_URI'];

try {
    // Connect to MongoDB Atlas.
    $client = new MongoDB\Client($uri);
    $collectionTiles = $client->FinalProject->tiles;
    $collectionUsers = $client->FinalProject->users;
} catch (Exception $e) {
    echo $e->getMessage();
}
