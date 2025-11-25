<?php
//crear_usuario.php
require_once __DIR__ . '/../config/encabezados.php';
require_once __DIR__ . '/../config/configuracion.php';

// Manejo de preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Obtener datos del cuerpo de la solicitud
$entrada = json_decode(file_get_contents('php://input'), true);
$email = filter_var(trim($entrada['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$clave = trim($entrada['clave'] ?? '');
$nombre = htmlspecialchars(trim($entrada['nombre'] ?? ''), ENT_QUOTES, 'UTF-8');

if (!$email || !$clave || !$nombre) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}
// validación más segura de clave
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/', $clave)) {
    http_response_code(400);
    echo json_encode(['error' => 'La contraseña no cumple con los requisitos de seguridad']);
    exit;
}

// Comprobar si el email ya existe
$consulta = $db->prepare('SELECT id FROM usuarios WHERE email = :email');
$consulta->bindValue(':email', $email, SQLITE3_TEXT);
$resultado = $consulta->execute();
$usuarioExistente = $resultado->fetchArray(SQLITE3_ASSOC);

if ($usuarioExistente) {
    http_response_code(400);
    echo json_encode(['error' => 'El email ya está registrado']);
    exit;
}

// Insertar nuevo usuario
$claveHashed = password_hash($clave, PASSWORD_DEFAULT);

// Insertar el nuevo usuario en la base de datos
$stmt = $db->prepare('INSERT INTO usuarios (nombre, email, clave, rol) VALUES (:nombre, :email, :clave, "usuario")');
$stmt->bindValue(':nombre', $nombre, SQLITE3_TEXT);
$stmt->bindValue(':email', $email, SQLITE3_TEXT);
$stmt->bindValue(':clave', $claveHashed, SQLITE3_TEXT);

if ($stmt->execute()) {
    echo json_encode(['mensaje' => 'Usuario creado exitosamente']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear el usuario']);
}
