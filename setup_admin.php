<?php
require_once __DIR__ . '/config.php';
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    if (strlen($username) < 3 || strlen($username) > 80 || strlen($password) < 12) {
        $message = 'Use a username of 3–80 characters and a password of at least 12 characters.';
    } else {
        try {
            $count = (int)db()->query('SELECT COUNT(*) FROM admins')->fetchColumn();
            if ($count > 0) {
                $message = 'An admin already exists. Delete this setup file from the server.';
            } else {
                $stmt = db()->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)');
                $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
                $message = 'Admin created. Delete setup_admin.php from the server immediately, then open /admin/.';
            }
        } catch (Throwable $e) {
            $message = 'Database error. Import database.sql and check config.php.';
        }
    }
}
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin setup</title><link rel="stylesheet" href="assets/style.css"></head>
<body><main class="auth-card"><span class="eyebrow">ONE-TIME SETUP</span><h1>Create administrator</h1><p>After creating the account, remove this file from the server.</p>
<?php if ($message): ?><div class="notice"><?= h($message) ?></div><?php endif; ?>
<form method="post" class="checkout-form"><label>Username<input name="username" minlength="3" maxlength="80" required></label><label>Password (12+ characters)<input type="password" name="password" minlength="12" required></label><button class="primary-button" type="submit">Create admin account</button></form></main></body></html>
