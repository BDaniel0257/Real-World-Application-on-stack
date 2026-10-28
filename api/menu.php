<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json; charset=utf-8');
try {
    $stmt = db()->query('SELECT id, name, category, description, price, emoji FROM meals WHERE available = 1 ORDER BY category, name');
    echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not load menu. Check database configuration.']);
}
