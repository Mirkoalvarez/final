<?php
// actualizar_comentario.php
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';

// Manejo de solicitud OPTIONS (CORS preflight)

// Verificar que la solicitud sea de tipo PATCH
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Autenticar el token y obtener el payload del usuario
$usuarioPayload = autenticarToken();

// Obtener la entrada JSON
$entrada = json_decode(file_get_contents("php://input"), true);
$id_comentario = $entrada['id'] ?? null;
$texto = $entrada['texto'] ?? null;

// Validar que se hayan proporcionado los campos requeridos
if (!$id_comentario || !isset($entrada['texto'])) { // Usar isset para permitir cadena vacía si es válido
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos requeridos (id o texto)']);
    exit;
}

// Validar que el texto no esté vacío después de trim
if (trim($texto) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'El texto del comentario no puede estar vacío']);
    exit;
}

// Verificar si el comentario existe
$consulta = $db->prepare('SELECT id_usuario FROM comentarios WHERE id = :id');
$consulta->bindValue(':id', $id_comentario, SQLITE3_INTEGER);
$resultado = $consulta->execute();
$comentario = $resultado->fetchArray(SQLITE3_ASSOC);

if (!$comentario) {
    http_response_code(404);
    echo json_encode(['error' => 'Comentario no encontrado']);
    exit;
}

// Verificar permisos del usuario
if ($comentario['id_usuario'] !== $usuarioPayload['id'] && $usuarioPayload['rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permiso para modificar este comentario']);
    exit;
}

// Actualizar el comentario
$update = $db->prepare('UPDATE comentarios SET texto = :texto WHERE id = :id');
$update->bindValue(':texto', trim($texto), SQLITE3_TEXT); // Guardar el texto trimmeado
$update->bindValue(':id', $id_comentario, SQLITE3_INTEGER);

if ($update->execute()) {
    http_response_code(200);
    echo json_encode(['mensaje' => 'Comentario actualizado correctamente']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo actualizar el comentario']);
}
?>


