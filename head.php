<?php

include 'path.php';

$faviconPath = $BASE_PATH . 'public/favicon.png';

?>

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Digital Garden</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Lato&display=swap"
        rel="stylesheet" />
    <link rel="stylesheet" href="style.css" />
    <link rel="icon" type="image/png" href="<?php echo $faviconPath ?>" />

    <?php
    $currentPage = basename($_SERVER['PHP_SELF']);
    if ($currentPage === 'index.php') {
        echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>';
        echo '<script type="module" src="main.js"></script>';
    }
    ?>
</head>