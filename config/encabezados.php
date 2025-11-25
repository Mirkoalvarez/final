<?php
// config/encabezados.php
// CORS centralizado para evitar inconsistencias entre endpoints.
$allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
];
$allowCredentials = false; // Activa cookies/envio de credenciales desde el front.

$origin = $_SERVER['HTTP_ORIGIN'] ?? null;
$originAllowed = $origin && in_array($origin, $allowedOrigins, true);

if ($originAllowed) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    if ($allowCredentials) {
        header('Access-Control-Allow-Credentials: true');
    }
} else {
    if ($allowCredentials) {
        http_response_code(403);
        echo json_encode(['error' => 'Origen no permitido']);
        exit;
    }
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
