<?php
include 'db.php';

// Start session.
session_start();

// Initialize response message.
$msg = array();

// Return user info if logged in.
if ($_SESSION['username']) {
    $user = $collectionUsers->findOne(['username' => $_SESSION['username']]);

    $inventory = $user['inventory']->getArrayCopy();
    $inventory = array_map(function ($item) {
        return $item->getArrayCopy();
    }, $inventory);

    $userInfo = [
        'username' => $user['username'],
        'actions' => $user['actions'],
        'inventory' => $inventory,
    ];

    $msg["response"] = "success";
    $msg['user'] = $userInfo;
} else {
    $msg["response"] = "error";
    $msg["error"] = "User not logged in.";
}

echo json_encode($msg);
