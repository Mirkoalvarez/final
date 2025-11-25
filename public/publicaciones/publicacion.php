<?php
//publicaciones/publicacion.php
// Incluir archivos de configuración necesarios
require_once '../config/encabezados.php';
require_once '../config/configuracion.php';

// Obtener el ID de la publicación desde los parámetros de la URL
$id = $_GET['id'] ?? null; // Si no se proporciona, se establece como null

// Verificar si se proporcionó un ID
if (!$id) {
    http_response_code(400); // Código de estado 400 Bad Request
    echo json_encode(['error' => 'ID requerido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Preparar la consulta SQL para obtener la publicación y sus detalles
$stmt = $db->prepare("
    SELECT p.*, u.nombre AS autor, c.nombre AS categoria, e.nombre AS estilo
    FROM publicaciones p
    LEFT JOIN usuarios u ON p.id_usuario = u.id
    LEFT JOIN categorias c ON p.id_categoria = c.id
    LEFT JOIN estilos e ON p.id_estilo = e.id
    WHERE p.id = :id
");

// Vincular el ID de la publicación a la consulta
$stmt->bindValue(':id', $id, SQLITE3_INTEGER); // Vincula el ID como un entero

// Ejecutar la consulta y obtener el resultado
$res = $stmt->execute()->fetchArray(SQLITE3_ASSOC); // Obtiene la fila como un array asociativo

// Verificar si se encontró la publicación
if ($res) {
    echo json_encode($res); // Devolver la publicación en formato JSON
} else {
    http_response_code(404); // Código de estado 404 Not Found
    echo json_encode(['error' => 'Publicación no encontrada']); // Mensaje de error en formato JSON
}
?>
