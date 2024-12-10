<?php

session_start();

if (!isset($_SESSION['username'])) {
  header('Location: /login.php');
  exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  session_destroy();
  echo json_encode(['response' => 'success']);
  exit;
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CART351 - Final Project</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Lato&display=swap"
    rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
  <script type="module" src="main.js"></script>
</head>

<body>
  <header>
    <a href="/">
      <h2>Digital Garden</h2>
    </a>
  </header>
  <main>
    <div id="game"></div>
    <div id="ui-container">
      <div id="inventory"></div>
      <div>
        <div id="map"></div>
        <div id="ui-buttons">
          <button id="btnView">Switch View</button>
          <button id="btnLogout">Logout</button>
        </div>
      </div>
      <div id="user-info-container">
        <div id="user-info">
          <span id="username"></span>
          <span id="actions">
            <span id="actions-count"></span>
            <span id="actions-label"> actions left today.</span>
          </span>
        </div>
      </div>
    </div>
  </main>
</body>

</html>