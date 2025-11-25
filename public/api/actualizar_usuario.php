<?php
// actualizar_usuario.php
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';

// Manejo de solicitud OPTIONS (CORS preflight)

// Verificar método PATCH
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
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
if (!isset($input['id']) || !isset($input['email']) || !isset($input['rol'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

// Asignar ID y verificar
$id = $input['id'];
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta ID de usuario a actualizar']);
    exit;
}

// Buscar usuario por ID
$consulta = $db->prepare('SELECT * FROM usuarios WHERE id = :id');
$consulta->bindValue(':id', $id, SQLITE3_INTEGER);
$resultado = $consulta->execute();
$usuarioExistente = $resultado->fetchArray(SQLITE3_ASSOC);

if (!$usuarioExistente) {
    http_response_code(404);
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}

// Preparar campos a actualizar
$campos = [];
if (isset($input['nombre'])) {
    $campos['nombre'] = $input['nombre'];
}
if (isset($input['email'])) {
    $campos['email'] = $input['email'];
}
if (isset($input['clave'])) {
    $campos['clave'] = password_hash($input['clave'], PASSWORD_DEFAULT);
}
if (isset($input['rol'])) {
    $campos['rol'] = $input['rol'];
}

if (empty($campos)) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay campos para actualizar']);
    exit;
}

// Armar sentencia SQL dinámicamente
$sql = "UPDATE usuarios SET ";
$partes = [];
foreach ($campos as $clave => $valor) {
    $partes[] = "$clave = :$clave";
}
$sql .= implode(', ', $partes);
$sql .= " WHERE id = :id";

$consulta = $db->prepare($sql);
foreach ($campos as $clave => $valor) {
    $consulta->bindValue(":$clave", $valor, SQLITE3_TEXT);
}
$consulta->bindValue(':id', $id, SQLITE3_INTEGER);

// Ejecutar
if ($consulta->execute()) {
    echo json_encode(['mensaje' => 'Usuario actualizado correctamente']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo actualizar el usuario']);
}

