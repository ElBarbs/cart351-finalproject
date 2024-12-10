<?php
include 'db.php';

session_start();

if (isset($_SESSION['username'])) {
    header('Location: /');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? $_POST['username'] : null;
    $password = isset($_POST['password']) ? $_POST['password'] : null;

    $msg = array();

    if ($username === null || $password === null) {
        $msg["response"] = "error";
        $msg["error"] = "Missing username or password.";
        echo json_encode($msg);
        exit;
    }

    $username = strtolower($username);
    $user = $collectionUsers->findOne(['username' => $username]);

    if ($user && password_verify($password, $user['password'])) {
        $msg["response"] = "success";
        $_SESSION['username'] = $user['username'];
    } else {
        $msg["response"] = "error";
        $msg["error"] = "Invalid username or password.";
    }

    echo json_encode($msg);
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
</head>

<body>
    <header>
        <a href="/">
            <h2>Digital Garden</h2>
        </a>
    </header>
    <main>
        <div id="userFormContainer">
            <form action="" id="formLogin">
                <label for="username">Username</label>
                <input type="text" id="inputUsername" name="username" />
                <label for="password">Password</label>
                <input type="password" id="inputPassword" name="password" />
                <span>Don't have an account yet? <a href="/register.php">Register</a></span>
                <button id="btnLogin" type="submit">Login</button>
                <span id="msgError"></span>
            </form>
        </div>
    </main>
</body>

<script>
    window.onload = function() {
        const inputUsername = document.getElementById("inputUsername");
        inputUsername.focus();
        document.getElementById("formLogin").addEventListener('submit', function(e) {
            e.preventDefault();

            const form = e.target;
            const data = new FormData(form);

            fetch('/login.php', {
                    method: 'POST',
                    body: data,
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.response !== 'success') {
                        form.style.maxHeight = '12.5rem';
                        document.getElementById('msgError').innerText = data.error;
                        form.reset();
                        inputUsername.focus();
                    } else {
                        window.location.href = '/';
                    }
                });
        });
    }
</script>

</html>