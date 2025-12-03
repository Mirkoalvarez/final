<?php
//reiniciar_db.php
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Borrar tablas si existen
$db->exec("DROP TABLE IF EXISTS comentarios;");
$db->exec("DROP TABLE IF EXISTS publicaciones;");
$db->exec("DROP TABLE IF EXISTS usuarios;");
$db->exec("DROP TABLE IF EXISTS categorias;");
$db->exec("DROP TABLE IF EXISTS estilos;");

// Crear las tablas utilizando esquema.sql
$sql = file_get_contents(__DIR__ . '/../../adicional/sql/esquema.sql');
if (!$sql) {
    http_response_code(500); // Error en la carga del archivo SQL
    echo json_encode(['error' => 'No se pudo leer el esquema.sql']);
    exit;
}

try {
    $db->exec($sql); // Ejecutar el esquema SQL
} catch (Exception $e) {
    http_response_code(500); // Error en la ejecución del esquema SQL
    echo json_encode(['error' => 'No se pudo crear las tablas: ' . $e->getMessage()]);
    exit;
}
//---------------------------------------

// Insertar el usuario administrador
$adminEmail = 'admin@admin.com';
$adminClave = password_hash('Admin123', PASSWORD_DEFAULT);
$rol = 'admin';

$insertar = $db->prepare('INSERT INTO usuarios (nombre, email, clave, rol) VALUES (:nombre, :email, :clave, :rol)');
$insertar->bindValue(':nombre', 'Administrador', SQLITE3_TEXT);
$insertar->bindValue(':email', $adminEmail, SQLITE3_TEXT);
$insertar->bindValue(':clave', $adminClave, SQLITE3_TEXT);
$insertar->bindValue(':rol', $rol, SQLITE3_TEXT);

if ($insertar->execute()) {
    echo json_encode(['mensaje' => 'Base de datos reiniciada correctamente']);
} else {
    http_response_code(500); // Error al insertar el admin
    echo json_encode(['error' => 'No se pudo insertar el usuario administrador']);
}

