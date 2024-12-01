<?php
session_start();

$msg = array();
if ($_SESSION['user']) {
    $msg["response"] = "success";
    $msg['user'] = $_SESSION['user'];
} else {
    $msg["response"] = "error";
    $msg["error"] = "User not logged in.";
}

echo json_encode($msg);
