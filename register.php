<?php
include 'db.php';

// Start session.
session_start();

// Set base path.
$basePath = dirname($_SERVER['PHP_SELF']);

// Redirect to index if logged in.
if (isset($_SESSION['username'])) {
    header('Location: ' . $basePath . '/');
    exit;
}

// Register.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? $_POST['username'] : null;
    $password = isset($_POST['password']) ? $_POST['password'] : null;
    $repeatPassword = isset($_POST['repeatPassword']) ? $_POST['repeatPassword'] : null;

    $msg = array();

    // Check if username is less than 3 characters.
    if (strlen($username) < 3) {
        $msg["response"] = "error";
        $msg["error"] = "Username must be at least 3 characters long.";
        echo json_encode($msg);
        exit;
    }

    // Check if username is more than 14 characters.
    if (strlen($username) > 14) {
        $msg["response"] = "error";
        $msg["error"] = "Username must be at most 14 characters long.";
        echo json_encode($msg);
        exit;
    }

    // Check if username contains profanity.
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

    // Check if username is already taken.
    $username = strtolower($username);
    $user = $collectionUsers->findOne(['username' => $username]);

    if ($user) {
        $msg["response"] = "error";
        $msg["error"] = "Username already taken.";
        echo json_encode($msg);
        exit;
    }

    // Check if password matches requirements.
    if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/', $password)) {
        $msg["response"] = "error";
        $msg["error"] = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and one number.";
        echo json_encode($msg);
        exit;
    }

    // Check if passwords match.
    if ($password !== $repeatPassword) {
        $msg["response"] = "error";
        $msg["error"] = "Passwords do not match.";
        echo json_encode($msg);
        exit;
    }

    // Add user to database.
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

    // Set the session username.
    $_SESSION['username'] = $username;

    $msg["response"] = "success";
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

            const basePath = '<?php echo $basePath; ?>';

            const form = e.target;
            const data = new FormData(form);

            fetch(`${basePath}/register.php`, {
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
                        window.location.href = `${basePath}/index.php`;
                    }
                });
        });
    }
</script>

</html>