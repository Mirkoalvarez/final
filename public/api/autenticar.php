<?php
//autenticar.php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/../config/encabezados.php';
require_once __DIR__ . '/../config/configuracion.php';
require_once __DIR__ . '/../middleware/auth_middleware.php';

// Manejo de solicitud OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener datos del body (JSON)
$entrada = json_decode(file_get_contents('php://input'), true);
$email = $entrada['email'] ?? null;
$claveIngresada = $entrada['clave'] ?? null;

if (!$email || !$clave) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos requeridos']);
    exit;
}

// Buscar usuario en la base de datos
$consulta = $db->prepare('SELECT id, email, clave, rol FROM usuarios WHERE email = :email');
$consulta->bindValue(':email', $email, SQLITE3_TEXT);
$resultado = $consulta->execute();
$usuario = $resultado->fetchArray(SQLITE3_ASSOC);

if (!$usuario || !password_verify($claveIngresada, $usuario['clave'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Email o clave incorrectos']);
    exit;
}

// Generar JWT
$payload = [
    'id' => $usuario['id'],
    'email' => $usuario['email'],
    'rol' => $usuario['rol'],
    'exp' => time() + (60 * 60 * 2) // 2 horas
];

$jwt = JWT::encode($payload, $clave, 'HS256');

// Devolver token
echo json_encode([
    'mensaje' => 'Autenticación exitosa',
    'token' => $jwt
]);
