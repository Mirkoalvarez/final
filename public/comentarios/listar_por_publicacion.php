<?php
// comentarios/listar_por_publicacion.php

// Incluye los archivos de configuración necesarios
require_once '../config/encabezados.php';
require_once '../config/configuracion.php';

// Manejo de solicitudes OPTIONS (CORS preflight)
// Responde a las solicitudes OPTIONS para permitir peticiones desde otros dominios.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Establece las cabeceras CORS permitiendo el origen, los encabezados y los métodos.
    header("Access-Control-Allow-Origin: http://localhost:4200");
    header("Access-Control-Allow-Headers: Authorization, Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    http_response_code(200); // Responde con un código 200 OK
    exit; // Termina la ejecución del script
}

// Obtiene el ID de la publicación de los parámetros de la URL
// Si no se proporciona, se establece como null.
$id_publicacion = $_GET['id'] ?? null;

// Verifica si el ID de la publicación es nulo o está vacío
if (!$id_publicacion) {
    http_response_code(400); // Código de estado 400 Bad Request
    echo json_encode(['error' => 'ID de publicación requerido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Prepara la consulta SQL para seleccionar los comentarios de una publicación específica.
// Se unen las tablas 'comentarios' y 'usuarios' para obtener el nombre del autor.
$stmt = $db->prepare("
    SELECT c.id, c.texto, c.id_usuario, u.nombre AS autor
    FROM comentarios c
    JOIN usuarios u ON c.id_usuario = u.id
    WHERE c.id_publicacion = :id
    ORDER BY c.id ASC
");
// Vincula el valor del ID de la publicación al marcador de posición :id en la consulta.
$stmt->bindValue(':id', $id_publicacion, SQLITE3_INTEGER);
// Ejecuta la consulta preparada.
$result = $stmt->execute();

// Inicializa un array para almacenar los comentarios.
$comentarios = [];
// Itera sobre los resultados de la consulta y añade cada fila al array de comentarios.
while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
    $comentarios[] = $fila;
}

// Devuelve los comentarios en formato JSON.
echo json_encode($comentarios);
?>
