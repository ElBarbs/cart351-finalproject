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
    <?php
    $basePath = dirname($_SERVER['PHP_SELF']);
    echo `<link rel="icon" type="image/png" href="$basePath/assets/favicon.png" />`;

    $currentPage = basename($_SERVER['PHP_SELF']);
    if ($currentPage === 'index.php') {
        echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>';
        echo '<script type="module" src="main.js"></script>';
    }
    ?>
</head>