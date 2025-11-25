<?php
// borrar_usuario.php
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';

// Manejo de solicitud OPTIONS (CORS preflight)

// Verificar método DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
if (!$usuarioPayload || $usuarioPayload['rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado']);
    exit;
}

// Obtener datos del cuerpo de la solicitud
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta ID de usuario a borrar']);
    exit;
}

// Borrar usuario en la base de datos
$id = $input['id'];
$consulta = $db->prepare('DELETE FROM usuarios WHERE id = :id');
$consulta->bindValue(':id', $id, SQLITE3_INTEGER);

if ($consulta->execute()) {
    echo json_encode(['mensaje' => 'Usuario borrado correctamente']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo borrar el usuario']);
}

