<?php
require_once __DIR__ . '/../config.php';

if (isset($_GET['logout'])) {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    header('Location: index.php');
    exit;
}
$error = '';
if (!isset($_SESSION['admin_id']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    try {
        $stmt = db()->prepare('SELECT id, username, password_hash FROM admins WHERE username = ?');
        $stmt->execute([$username]);
        $admin = $stmt->fetch();
        if ($admin && password_verify($password, $admin['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            header('Location: index.php');
            exit;
        }
        $error = 'Invalid username or password.';
    } catch (Throwable $e) {
        $error = 'Database not ready. Import database.sql and check config.php.';
    }
}

if (!isset($_SESSION['admin_id'])):
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BluePlate Admin Login</title><link rel="stylesheet" href="../assets/style.css"></head>
<body><main class="auth-card"><a href="../" class="back-link">← Restaurant website</a><span class="eyebrow">ADMIN PORTAL</span><h1>Sign in</h1>
<?php if ($error): ?><div class="notice error"><?= h($error) ?></div><?php endif; ?>
<form method="post" class="checkout-form"><label>Username<input name="username" autocomplete="username" required></label><label>Password<input type="password" name="password" autocomplete="current-password" required></label><button class="primary-button" type="submit">Sign in</button></form></main></body></html>
<?php
exit;
endif;

$pdo = db();
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['order_id'], $_POST['status'])) {
    $allowed = ['Pending','Preparing','Ready','Completed','Cancelled'];
    $status = (string)$_POST['status'];
    $orderId = filter_var($_POST['order_id'], FILTER_VALIDATE_INT);
    if ($orderId && in_array($status, $allowed, true)) {
        $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$status, $orderId]);
    }
    header('Location: index.php');
    exit;
}

$orders = $pdo->query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100')->fetchAll();
$meals = $pdo->query('SELECT * FROM meals ORDER BY id')->fetchAll();
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BluePlate Admin</title><link rel="stylesheet" href="../assets/style.css"></head>
<body><div class="admin-wrap"><header class="admin-header"><div><span class="eyebrow">BLUEPLATE</span><h1>Admin dashboard</h1><p>Signed in as <?= h($_SESSION['admin_username'] ?? 'admin') ?></p></div><a class="small-button" href="?logout=1">Sign out</a></header>
<section class="admin-section"><h2>Customer orders</h2>
<?php if (!$orders): ?><p class="muted">No orders have been placed yet.</p><?php else: ?>
<div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Contact</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody>
<?php foreach ($orders as $order): ?><tr><td>#<?= (int)$order['id'] ?><br><small><?= h($order['created_at']) ?></small></td><td><?= h($order['customer_name']) ?><br><small><?= h($order['delivery_address']) ?></small></td><td><?= h($order['phone']) ?></td><td>GH₵ <?= number_format((float)$order['total'], 2) ?></td><td><?= h($order['status']) ?></td><td><form method="post" class="status-form"><input type="hidden" name="order_id" value="<?= (int)$order['id'] ?>"><select name="status"><?php foreach (['Pending','Preparing','Ready','Completed','Cancelled'] as $status): ?><option <?= $status === $order['status'] ? 'selected' : '' ?>><?= h($status) ?></option><?php endforeach; ?></select><button class="small-button" type="submit">Save</button></form></td></tr><?php endforeach; ?>
</tbody></table></div><?php endif; ?></section>
<section class="admin-section"><h2>Current menu</h2><p class="muted">Menu editing is the next extension; current menu items are seeded in database.sql.</p><div class="table-wrap"><table><thead><tr><th>Meal</th><th>Category</th><th>Price</th><th>Available</th></tr></thead><tbody><?php foreach ($meals as $meal): ?><tr><td><?= h($meal['emoji']) ?> <?= h($meal['name']) ?></td><td><?= h($meal['category']) ?></td><td>GH₵ <?= number_format((float)$meal['price'],2) ?></td><td><?= $meal['available'] ? 'Yes' : 'No' ?></td></tr><?php endforeach; ?></tbody></table></div></section>
</div></body></html>
