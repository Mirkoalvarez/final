<?php
// publicaciones/listar_publicaciones.php

// Incluir archivos de configuración necesarios
require_once '../config/encabezados.php';
require_once '../config/configuracion.php';

// Manejo de solicitud OPTIONS (CORS preflight)
// Responde a las solicitudes OPTIONS para permitir peticiones desde otros dominios.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:4200"); // Permitir acceso desde el origen especificado
    header("Access-Control-Allow-Headers: Authorization, Content-Type"); // Permitir encabezados específicos
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS"); // Permitir métodos HTTP específicos
    http_response_code(200); // Responde con un código 200 OK
    exit; // Termina la ejecución del script
}

// Verificar que se use el método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Código de estado 405 Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Obtener parámetros de filtro desde la URL
$id_categoria = $_GET['id_categoria'] ?? null; // ID de la categoría
$id_estilo = $_GET['id_estilo'] ?? null; // ID del estilo
$autor_nombre = $_GET['autor'] ?? null; // Nombre del autor para búsqueda

// Construir la consulta SQL base
$sql = "
    SELECT
        p.id, p.titulo, p.descripcion, p.imagen, p.archivo, p.fecha_publicacion,
        u.nombre AS autor,
        c.nombre AS categoria,
        e.nombre AS estilo,
        p.id_usuario, p.id_categoria, p.id_estilo,
        (SELECT COUNT(*) FROM comentarios WHERE id_publicacion = p.id) AS cantidad_comentarios
    FROM publicaciones p
    JOIN usuarios u ON p.id_usuario = u.id
    LEFT JOIN categorias c ON p.id_categoria = c.id
    LEFT JOIN estilos e ON p.id_estilo = e.id
";

// Inicializar condiciones y parámetros
$conditions = [];
$params = [];

// Agregar condiciones según los parámetros de filtro
if ($id_categoria) {
    $conditions[] = "p.id_categoria = :id_categoria"; // Condición para la categoría
    $params[':id_categoria'] = $id_categoria; // Agregar parámetro
}

if ($id_estilo) {
    $conditions[] = "p.id_estilo = :id_estilo"; // Condición para el estilo
    $params[':id_estilo'] = $id_estilo; // Agregar parámetro
}

if ($autor_nombre) {
    // Usar LIKE para búsqueda parcial y LOWER para hacerla insensible a mayúsculas/minúsculas
    $conditions[] = "LOWER(u.nombre) LIKE LOWER(:autor_nombre)"; // Condición para el nombre del autor
    $params[':autor_nombre'] = '%' . $autor_nombre . '%'; // Agregar parámetro
}

// Añadir condiciones a la consulta si existen
if (!empty($conditions)) {
    $sql .= " WHERE " . implode(' AND ', $conditions); // Combina las condiciones
}

// Ordenar los resultados por fecha de publicación en orden descendente
$sql .= " ORDER BY p.fecha_publicacion DESC";

// Preparar y ejecutar la consulta
$stmt = $db->prepare($sql); // Prepara la consulta

// Vincular los parámetros a la consulta
foreach ($params as $key => $value) {
    // Determinar el tipo de parámetro para bindValue
    $type = SQLITE3_TEXT; // Por defecto, asumimos que es texto
    if (strpos($key, 'id_') !== false) { // Asumimos que los IDs son enteros
        $type = SQLITE3_INTEGER; // Cambia el tipo a entero
    }
    $stmt->bindValue($key, $value, $type); // Vincula el parámetro
}

// Ejecutar la consulta
$resultado = $stmt->execute(); // Ejecuta la consulta

// Inicializar un array para almacenar las publicaciones
$publicaciones = [];
while ($fila = $resultado->fetchArray(SQLITE3_ASSOC)) {
    $publicaciones[] = $fila; // Agrega cada fila al array de publicaciones
}

// Devolver el resultado en formato JSON
echo json_encode($publicaciones); // Envía las publicaciones como respuesta
?>
