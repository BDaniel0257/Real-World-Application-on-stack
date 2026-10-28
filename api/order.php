<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request body.']);
    exit;
}

$name = trim((string)($data['customer_name'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$address = trim((string)($data['delivery_address'] ?? ''));
$notes = trim((string)($data['notes'] ?? ''));
$items = $data['items'] ?? [];

if ($name === '' || $phone === '' || $address === '' || !is_array($items) || count($items) === 0) {
    http_response_code(422);
    echo json_encode(['error' => 'Please complete your name, phone, delivery address, and cart.']);
    exit;
}
if (mb_strlen($name) > 120 || mb_strlen($phone) > 40 || mb_strlen($address) > 255) {
    http_response_code(422);
    echo json_encode(['error' => 'One or more fields are too long.']);
    exit;
}

try {
    $pdo = db();
    $pdo->beginTransaction();
    $validated = [];
    $total = 0.0;

    $mealStmt = $pdo->prepare('SELECT id, name, price FROM meals WHERE id = ? AND available = 1');
    foreach ($items as $item) {
        $mealId = filter_var($item['id'] ?? null, FILTER_VALIDATE_INT);
        $qty = filter_var($item['quantity'] ?? null, FILTER_VALIDATE_INT);
        if (!$mealId || !$qty || $qty < 1 || $qty > 50) {
            throw new InvalidArgumentException('Invalid cart item.');
        }
        $mealStmt->execute([$mealId]);
        $meal = $mealStmt->fetch();
        if (!$meal) throw new InvalidArgumentException('A selected meal is unavailable.');
        $lineTotal = (float)$meal['price'] * $qty;
        $total += $lineTotal;
        $validated[] = ['meal' => $meal, 'quantity' => $qty];
    }

    $orderStmt = $pdo->prepare('INSERT INTO orders (customer_name, phone, delivery_address, notes, total) VALUES (?, ?, ?, ?, ?)');
    $orderStmt->execute([$name, $phone, $address, $notes ?: null, $total]);
    $orderId = (int)$pdo->lastInsertId();

    $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, meal_id, meal_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)');
    foreach ($validated as $line) {
        $itemStmt->execute([
            $orderId,
            $line['meal']['id'],
            $line['meal']['name'],
            $line['quantity'],
            $line['meal']['price']
        ]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'order_id' => $orderId, 'total' => number_format($total, 2, '.', '')]);
} catch (InvalidArgumentException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(422);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Order could not be saved. Check database setup and try again.']);
}
