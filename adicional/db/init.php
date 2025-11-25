<?php
// adicional/db/init.php
$dbPath = __DIR__ . '/database.sqlite';

// Verificar si ya existe la base de datos
if (file_exists($dbPath)) {
    echo "La base de datos ya existe. Si deseas reiniciarla, elimina el archivo 'database.sqlite' primero.";
    exit;
}

try {
    $db = new SQLite3($dbPath);
} catch (Exception $e) {
    die("Error al crear/conectar con la base de datos: " . $e->getMessage());
}

$sql = file_get_contents(__DIR__ . '/../sql/esquema.sql');
if (!$sql) {
    die("No se pudo leer esquema.sql");
}

try {
    $db->exec($sql);
    echo "Base de datos inicializada correctamente.";
} catch (Exception $e) {
    echo "Error al ejecutar esquema.sql: " . $e->getMessage();
}
