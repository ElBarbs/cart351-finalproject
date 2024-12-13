<?php

include 'path.php';

// Start the session if not already started.
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// Redirect to login if not logged in.
if (!isset($_SESSION['username'])) {
  header('Location: ' . $BASE_PATH . 'login.php');
  exit();
}

// Logout.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  session_destroy();
  echo json_encode(['response' => 'success']);
  exit;
}

?>

<!DOCTYPE html>
<html lang="en">

<?php include('head.php'); ?>

<body>
  <?php include('header.php'); ?>
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