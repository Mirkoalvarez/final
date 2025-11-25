<?php
// eliminar_publicacion.php

// Establecer cabeceras CORS específicas para el preflight
header("Access-Control-Allow-Origin: http://localhost:4200"); // Permitir acceso desde el origen especificado
header("Access-Control-Allow-Headers: Authorization, Content-Type"); // Permitir encabezados específicos
header("Access-Control-Allow-Methods: DELETE, OPTIONS"); // Permitir métodos HTTP específicos

// Manejo de solicitudes OPTIONS

// Incluir archivos de configuración y middleware necesarios
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';

// Validar que el método HTTP sea DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405); // Código de estado 405 Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Autenticar el token y obtener el payload del usuario
$usuarioPayload = autenticarToken(); // Llama a la función para autenticar el token del usuario

// Obtener el ID de la publicación desde el cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true); // Decodifica el JSON recibido
$id = $data['id'] ?? null; // Si no se proporciona, se establece como null

// Verificar si se proporcionó un ID
if (!$id) {
    http_response_code(400); // Código de estado 400 Bad Request
    echo json_encode(['error' => 'ID requerido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Directorio de subida
$uploadDir = __DIR__ . '/../uploads/';

// 1. Obtener los nombres de los archivos asociados a la publicación
$stmt = $db->prepare("SELECT imagen, archivo, id_usuario FROM publicaciones WHERE id = :id");
$stmt->bindValue(':id', $id, SQLITE3_INTEGER); // Vincula el ID de la publicación
$result = $stmt->execute(); // Ejecuta la consulta
$publicacion = $result->fetchArray(SQLITE3_ASSOC); // Obtiene la publicación

// Verifica si la publicación existe
if (!$publicacion) {
    http_response_code(404); // Código de estado 404 Not Found
    echo json_encode(["error" => "Publicación no encontrada"]); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Verificar permisos (solo el autor o un admin puede eliminar)
if ($publicacion['id_usuario'] !== $usuarioPayload['id'] && $usuarioPayload['rol'] !== 'admin') {
    http_response_code(403); // Código de estado 403 Forbidden
    echo json_encode(['error' => 'No tienes permiso para eliminar esta publicación']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// 2. Eliminar los archivos físicos y sus miniaturas
if ($publicacion['imagen']) {
    $rutaImagen = $uploadDir . $publicacion['imagen']; // Ruta de la imagen
    $rutaMiniaturaImagen = $uploadDir . 'thumb_' . $publicacion['imagen']; // Ruta de la miniatura

    // Elimina la imagen si existe
    if (file_exists($rutaImagen)) {
        unlink($rutaImagen); // Elimina la imagen
    }
    // Elimina la miniatura si existe
    if (file_exists($rutaMiniaturaImagen)) {
        unlink($rutaMiniaturaImagen); // Elimina la miniatura
    }
}
if ($publicacion['archivo']) {
    $rutaArchivo = $uploadDir . $publicacion['archivo']; // Ruta del archivo

    // Elimina el archivo si existe
    if (file_exists($rutaArchivo)) {
        unlink($rutaArchivo); // Elimina el archivo
    }
}

// 3. Eliminar la entrada de la base de datos
$stmt = $db->prepare("DELETE FROM publicaciones WHERE id = :id");
$stmt->bindValue(':id', $id, SQLITE3_INTEGER); // Vincula el ID de la publicación

// Ejecutar la eliminación y devolver el resultado
if ($stmt->execute()) {
    if ($db->changes() > 0) { // Verifica si se eliminó algún registro
        echo json_encode(["mensaje" => "Publicación y archivos asociados eliminados correctamente"]); // Mensaje de éxito en formato JSON
    } else {
        http_response_code(500); // Código de estado 500 Internal Server Error
        echo json_encode(["error" => "No se eliminó ningún registro de la base de datos"]); // Mensaje de error en formato JSON
    }
} else {
    http_response_code(500); // Código de estado 500 Internal Server Error
    echo json_encode(["error" => "Error al eliminar la publicación de la base de datos"]); // Mensaje de error en formato JSON
}
?>


