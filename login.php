<?php

include 'path.php';
include 'db.php';

// Start the session if not already started.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Redirect to index if logged in.
if (isset($_SESSION['username'])) {
    header('Location: ' . $BASE_PATH);
    exit;
}

// Login.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? $_POST['username'] : null;
    $password = isset($_POST['password']) ? $_POST['password'] : null;

    $msg = array();

    // Check for missing username or password.
    if ($username === null || $password === null) {
        $msg["response"] = "error";
        $msg["error"] = "Missing username or password.";
        echo json_encode($msg);
        exit;
    }

    $username = strtolower($username);
    $user = $collectionUsers->findOne(['username' => $username]);

    // Verify if password is correct.
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

<?php include('head.php'); ?>

<body>
    <?php include('header.php'); ?>
    <main>
        <div id="userFormContainer">
            <form action="" id="formLogin">
                <label for="username">Username</label>
                <input type="text" id="inputUsername" title="username" name="username" />
                <label for="password">Password</label>
                <input type="password" id="inputPassword" title="password" name="password" />
                <span>Don't have an account yet? <a id="linkRegister">Register</a></span>
                <button id="btnLogin" type="submit">Login</button>
                <span id="msgError"></span>
            </form>
        </div>
    </main>
</body>

<script>
    window.onload = function() {
        const basePath = '<?php echo $BASE_PATH; ?>';

        const linkRegister = document.getElementById("linkRegister");
        linkRegister.href = `${basePath}register.php`;

        const inputUsername = document.getElementById("inputUsername");
        inputUsername.focus();

        document.getElementById("formLogin").addEventListener('submit', function(e) {
            e.preventDefault();

            const form = e.target;
            const data = new FormData(form);

            fetch(`${basePath}login.php`, {
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
                        window.location.href = basePath;
                    }
                });
        });
    }
</script>

</html>