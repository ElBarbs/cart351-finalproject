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
    $repeatPassword = isset($_POST['repeatPassword']) ? $_POST['repeatPassword'] : null;

    $msg = array();

    if (strlen($username) < 3) {
        $msg["response"] = "error";
        $msg["error"] = "Username must be at least 3 characters long.";
        echo json_encode($msg);
        exit;
    }

    if (strlen($username) > 14) {
        $msg["response"] = "error";
        $msg["error"] = "Username must be at most 14 characters long.";
        echo json_encode($msg);
        exit;
    }

    $ch = curl_init("https://www.purgomalum.com/service/containsprofanity?text=$username");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $msg["response"] = "error";
        $msg["error"] = curl_error($ch);
        echo json_encode($msg);
        exit;
    } else {
        if ($response === 'true') {
            $msg["response"] = "error";
            $msg["error"] = "Username must not contain profanity.";
            echo json_encode($msg);
            exit;
        }
    }
    curl_close($ch);

    $username = strtolower($username);
    $user = $collectionUsers->findOne(['username' => $username]);

    if ($user) {
        $msg["response"] = "error";
        $msg["error"] = "Username already taken.";
        echo json_encode($msg);
        exit;
    }

    if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/', $password)) {
        $msg["response"] = "error";
        $msg["error"] = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and one number.";
        echo json_encode($msg);
        exit;
    }

    if ($password !== $repeatPassword) {
        $msg["response"] = "error";
        $msg["error"] = "Passwords do not match.";
        json_encode($msg);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $newUser = [
        'username' => $username,
        'password' => $passwordHash,
        'actions' => 3,
        'inventory' => array(
            array(
                'name' => 'small_crops_0',
                'quantity' => 2
            ),
            array(
                'name' => 'seed',
                'variant' => ['a', 'b', 'c'][rand(0, 2)],
                'state' => 0,
                'quantity' => 2
            )
        ),
    ];
    $collectionUsers->insertOne($newUser);

    $_SESSION['username'] = $username;

    $msg["response"] = "success";
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
            <form action="" id="formRegister">
                <label for="username">Username</label>
                <input type="text" id="inputUsername" name="username" />
                <label for="password">Password</label>
                <input type="password" id="inputPassword" name="password" />
                <label for="repeatPassword">Repeat Password</label>
                <input type="password" id="inputRepeatPassword" name="repeatPassword" />
                <button id="btnRegister" type="submit">Register</button>
                <span id="msgError"></span>
            </form>
        </div>
    </main>
</body>

<script>
    window.onload = function() {
        const inputUsername = document.getElementById("inputUsername");
        inputUsername.focus();
        document.getElementById("formRegister").addEventListener('submit', function(e) {
            e.preventDefault();

            const form = e.target;
            const data = new FormData(form);

            fetch('/register.php', {
                    method: 'POST',
                    body: data,
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.response !== 'success') {
                        form.style.maxHeight = '15.5rem';
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