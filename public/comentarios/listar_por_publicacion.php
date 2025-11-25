<?php
// comentarios/listar_por_publicacion.php

require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';

$id_publicacion = $_GET['id'] ?? null;
if (!$id_publicacion) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de publicacion requerido']);
    exit;
}

$stmt = $db->prepare("
    SELECT c.id, c.texto, c.id_usuario, u.nombre AS autor
    FROM comentarios c
    JOIN usuarios u ON c.id_usuario = u.id
    WHERE c.id_publicacion = :id
    ORDER BY c.id ASC
");
$stmt->bindValue(':id', $id_publicacion, SQLITE3_INTEGER);
$result = $stmt->execute();

$comentarios = [];
while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
    $comentarios[] = $fila;
}

echo json_encode($comentarios);


