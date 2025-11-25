<?php
// api/perfil/actualizar_perfil.php
// Incluir archivos de configuración necesarios
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';
// Manejo de solicitud OPTIONS (CORS preflight)
// Responde a las solicitudes OPTIONS para permitir peticiones desde otros dominios.

// Verificar método PATCH
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Autenticar token y obtener payload del usuario
$usuarioPayload = autenticarToken();
if (!$usuarioPayload) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido o expirado']);
    exit;
}

$id_usuario_token = $usuarioPayload['id'];

// Obtener datos del cuerpo de la solicitud
$input = json_decode(file_get_contents('php://input'), true);

// Validar que al menos un campo para actualizar esté presente
if (empty($input['nombre']) && empty($input['email']) && empty($input['clave'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay campos para actualizar']);
    exit;
}

// Buscar usuario por ID (del token)
$consulta = $db->prepare('SELECT * FROM usuarios WHERE id = :id');
$consulta->bindValue(':id', $id_usuario_token, SQLITE3_INTEGER);
$resultado = $consulta->execute();
$usuarioExistente = $resultado->fetchArray(SQLITE3_ASSOC);

if (!$usuarioExistente) {
    http_response_code(404);
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}

// Preparar campos a actualizar
$campos = [];
if (isset($input['nombre']) && $input['nombre'] !== $usuarioExistente['nombre']) {
    $campos['nombre'] = htmlspecialchars(trim($input['nombre']), ENT_QUOTES, 'UTF-8');
}
if (isset($input['email']) && $input['email'] !== $usuarioExistente['email']) {
    $email_validado = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
    if (!$email_validado) {
        http_response_code(400);
        echo json_encode(['error' => 'Formato de email inválido']);
        exit;
    }
    // Verificar si el nuevo email ya existe para otro usuario
    $consulta_email = $db->prepare('SELECT id FROM usuarios WHERE email = :email AND id != :id');
    $consulta_email->bindValue(':email', $email_validado, SQLITE3_TEXT);
    $consulta_email->bindValue(':id', $id_usuario_token, SQLITE3_INTEGER);
    $resultado_email = $consulta_email->execute();
    if ($resultado_email->fetchArray(SQLITE3_ASSOC)) {
        http_response_code(400);
        echo json_encode(['error' => 'El email ya está registrado por otro usuario']);
        exit;
    }
    $campos['email'] = $email_validado;
}
if (isset($input['clave']) && !empty($input['clave'])) {
    // Validación de seguridad de la contraseña
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/', $input['clave'])) {
        http_response_code(400);
        echo json_encode(['error' => 'La contraseña no cumple con los requisitos de seguridad (mín. 6 caracteres, 1 mayúscula, 1 minúscula, 1 número)']);
        exit;
    }
    $campos['clave'] = password_hash($input['clave'], PASSWORD_DEFAULT);
}

if (empty($campos)) {
    http_response_code(200);
    echo json_encode(['mensaje' => 'No se detectaron cambios para actualizar']);
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
$consulta->bindValue(':id', $id_usuario_token, SQLITE3_INTEGER);

// Ejecutar
if ($consulta->execute()) {
    echo json_encode(['mensaje' => 'Perfil actualizado correctamente']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo actualizar el perfil']);
}
?>


