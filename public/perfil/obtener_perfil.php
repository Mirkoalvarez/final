<?php
// api/perfil/obtener_perfil.php
// Incluir archivos de configuración necesarios
require_once '../config/encabezados.php';
require_once '../config/configuracion.php';
require_once '../middleware/auth_middleware.php';
// Manejo de solicitud OPTIONS (CORS preflight)
// Responde a las solicitudes OPTIONS para permitir peticiones desde otros dominios.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:4200"); // Permitir acceso desde el origen especificado
    header("Access-Control-Allow-Headers: Authorization, Content-Type"); // Permitir encabezados específicos
    header("Access-Control-Allow-Methods: GET, OPTIONS"); // Permitir métodos HTTP específicos
    http_response_code(200); // Responde con un código 200 OK
    exit; // Termina la ejecución del script
}

// Verificar que se use el método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Código de estado 405 Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Autenticar token y obtener payload del usuario
$usuarioPayload = autenticarToken();
if (!$usuarioPayload) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido o expirado']);
    exit;
}

$id_usuario = $usuarioPayload['id'];

// Obtener datos del usuario de la base de datos
$consulta = $db->prepare('SELECT id, nombre, email, rol FROM usuarios WHERE id = :id');
$consulta->bindValue(':id', $id_usuario, SQLITE3_INTEGER);
$resultado = $consulta->execute();
$usuario = $resultado->fetchArray(SQLITE3_ASSOC);

if (!$usuario) {
    http_response_code(404);
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}

// Devolver datos del usuario (sin la clave)
echo json_encode($usuario);
?>
