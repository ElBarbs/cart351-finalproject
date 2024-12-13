<?php

// Get origin.
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'];

// Get path.
$path = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');

// Replace backslashes with forward slashes.
$path = str_replace("\\", "/", $path);

// Add a trailing slash if it doesn't exist.
if (substr($path, -1) !== '/') {
    $path .= '/';
}

$BASE_PATH = $protocol . $host . $path;
