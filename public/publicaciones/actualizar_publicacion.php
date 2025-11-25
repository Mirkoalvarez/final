<?php
// Establecer cabeceras CORS específicas para el preflight
header("Access-Control-Allow-Origin: http://localhost:4200"); // Permitir acceso desde el origen especificado
header("Access-Control-Allow-Headers: Authorization, Content-Type"); // Permitir encabezados específicos
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS"); // Permitir métodos HTTP específicos

// Incluir archivos de configuración y utilidades necesarias
require_once '../config/encabezados.php';
require_once '../config/configuracion.php';
require_once '../middleware/auth_middleware.php';
require_once '../utilidades/utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200); // Responde con un código 200 OK
    exit; // Termina la ejecución del script
}

// Autenticar el token y obtener el payload del usuario
$usuarioPayload = autenticarToken(); // Llama a la función para autenticar el token del usuario

// Directorio para subir archivos
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true); // Crea el directorio si no existe
}

// Obtener ID de la publicación desde los datos POST
$id = $_POST['id'] ?? null; // Si no se proporciona, se establece como null
if (!$id) {
    http_response_code(400); // Código de estado 400 Bad Request
    echo json_encode(['error' => 'ID de publicación requerido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// 1. Obtener la publicación actual para conocer los archivos existentes
$stmt = $db->prepare("SELECT imagen, archivo, id_usuario FROM publicaciones WHERE id = :id");
$stmt->bindValue(':id', $id, SQLITE3_INTEGER); // Vincula el ID de la publicación
$result = $stmt->execute(); // Ejecuta la consulta
$publicacionExistente = $result->fetchArray(SQLITE3_ASSOC); // Obtiene la publicación existente

// Verifica si la publicación existe
if (!$publicacionExistente) {
    http_response_code(404); // Código de estado 404 Not Found
    echo json_encode(['error' => 'Publicación no encontrada']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Verificar permisos (solo el autor o un admin puede actualizar)
if ($publicacionExistente['id_usuario'] !== $usuarioPayload['id'] && $usuarioPayload['rol'] !== 'admin') {
    http_response_code(403); // Código de estado 403 Forbidden
    echo json_encode(['error' => 'No tienes permiso para modificar esta publicación']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Obtener datos de la publicación desde los datos POST o mantener los existentes
$titulo = $_POST['titulo'] ?? $publicacionExistente['titulo'];
$descripcion = $_POST['descripcion'] ?? $publicacionExistente['descripcion'];
$id_categoria = $_POST['id_categoria'] ?? $publicacionExistente['id_categoria'];
$id_estilo = $_POST['id_estilo'] ?? $publicacionExistente['id_estilo'];

// Manejar la subida de la nueva imagen y obtener su nombre
$nuevaImagen = handleUpdateFileUpload('imagen', $uploadDir, true); // Maneja la subida de la imagen
// Si no se subió una nueva imagen, mantener la existente
$imagenFinal = $nuevaImagen ?? $publicacionExistente['imagen'];

// Manejar la subida del nuevo archivo y obtener su nombre
$nuevoArchivo = handleUpdateFileUpload('archivo', $uploadDir); // Maneja la subida del archivo
// Si no se subió un nuevo archivo, mantener el existente
$archivoFinal = $nuevoArchivo ?? $publicacionExistente['archivo'];

// Lógica para eliminar la imagen antigua si se subió una nueva o si se eliminó la existente
if ($nuevaImagen !== null && $publicacionExistente['imagen'] && $nuevaImagen !== $publicacionExistente['imagen']) {
    // Eliminar la imagen antigua
    $rutaImagenAntigua = $uploadDir . $publicacionExistente['imagen'];
    $rutaMiniaturaAntigua = $uploadDir . 'thumb_' . $publicacionExistente['imagen'];
    if (file_exists($rutaImagenAntigua)) {
        unlink($rutaImagenAntigua); // Elimina la imagen antigua
    }
    if (file_exists($rutaMiniaturaAntigua)) {
        unlink($rutaMiniaturaAntigua); // Elimina la miniatura antigua
    }
} elseif (isset($_POST['imagen_borrar']) && $_POST['imagen_borrar'] === 'true' && $publicacionExistente['imagen']) {
    // Si se envió una señal para borrar la imagen y existía una
    $rutaImagenAntigua = $uploadDir . $publicacionExistente['imagen'];
    $rutaMiniaturaAntigua = $uploadDir . 'thumb_' . $publicacionExistente['imagen'];
    if (file_exists($rutaImagenAntigua)) {
        unlink($rutaImagenAntigua); // Elimina la imagen antigua
    }
    if (file_exists($rutaMiniaturaAntigua)) {
        unlink($rutaMiniaturaAntigua); // Elimina la miniatura antigua
    }
    $imagenFinal = null; // Establecer la imagen a null en la DB
}

// Lógica para eliminar el archivo antiguo si se subió uno nuevo o si se eliminó el existente
if ($nuevoArchivo !== null && $publicacionExistente['archivo'] && $nuevoArchivo !== $publicacionExistente['archivo']) {
    // Eliminar el archivo antiguo
    $rutaArchivoAntiguo = $uploadDir . $publicacionExistente['archivo'];
    if (file_exists($rutaArchivoAntiguo)) {
        unlink($rutaArchivoAntiguo); // Elimina el archivo antiguo
    }
} elseif (isset($_POST['archivo_borrar']) && $_POST['archivo_borrar'] === 'true' && $publicacionExistente['archivo']) {
    // Si se envió una señal para borrar el archivo y existía uno
    $rutaArchivoAntiguo = $uploadDir . $publicacionExistente['archivo'];
    if (file_exists($rutaArchivoAntiguo)) {
        unlink($rutaArchivoAntiguo); // Elimina el archivo antiguo
    }
    $archivoFinal = null; // Establecer el archivo a null en la DB
}

// Actualizar la publicación en la base de datos
$stmt = $db->prepare("UPDATE publicaciones
    SET titulo=:titulo, descripcion=:descripcion, imagen=:imagen, archivo=:archivo,
    id_categoria=:id_categoria, id_estilo=:id_estilo
    WHERE id=:id");
$stmt->bindValue(':titulo', $titulo, SQLITE3_TEXT); // Vincula el título
$stmt->bindValue(':descripcion', $descripcion, SQLITE3_TEXT); // Vincula la descripción
$stmt->bindValue(':imagen', $imagenFinal, SQLITE3_TEXT); // Usar $imagenFinal
$stmt->bindValue(':archivo', $archivoFinal, SQLITE3_TEXT); // Usar $archivoFinal
$stmt->bindValue(':id_categoria', $id_categoria, SQLITE3_INTEGER); // Vincula la categoría
$stmt->bindValue(':id_estilo', $id_estilo, SQLITE3_INTEGER); // Vincula el estilo
$stmt->bindValue(':id', $id, SQLITE3_INTEGER); // Vincula el ID de la publicación

// Ejecutar la actualización y devolver el resultado
if ($stmt->execute()) {
    echo json_encode(['mensaje' => 'Publicación actualizada con éxito']); // Mensaje de éxito en formato JSON
} else {
    http_response_code(500); // Código de estado 500 Internal Server Error
    echo json_encode(['error' => 'Error al actualizar la publicación']); // Mensaje de error en formato JSON
}
?>
