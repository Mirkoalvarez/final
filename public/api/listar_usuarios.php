<?php
//listar_usuario.php
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';

// Manejo de solicitud OPTIONS (CORS preflight)

// Verificar método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener token desde Authorization: Bearer xxx
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!str_starts_with($authHeader, 'Bearer ')) {
    http_response_code(401);
    echo json_encode(['error' => 'Falta token de autenticación']);
    exit;
}

$token = substr($authHeader, 7); // Quita "Bearer "

// Verificar token con middleware
$usuarioPayload = autenticarToken();
if (!$usuarioPayload) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido']);
    exit;
}

// Obtener usuarios de la base de datos
$resultado = $db->query('SELECT id, nombre, email, rol FROM usuarios');
$usuarios = [];

while ($fila = $resultado->fetchArray(SQLITE3_ASSOC)) {
    $usuarios[] = $fila;
}

// Devolver respuesta
echo json_encode(['usuarios' => $usuarios]);

