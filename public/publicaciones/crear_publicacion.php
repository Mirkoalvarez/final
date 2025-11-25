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
// El middleware autenticarToken() ya se encarga de validar el token
// y de salir con un error 401/403 si no es válido o no tiene permisos.
$usuarioPayload = autenticarToken(); // Llama a la función para autenticar el token del usuario

// Obtener el ID del usuario directamente del payload del token
$id_usuario = $usuarioPayload['id'] ?? null; // Si no se encuentra, se establece como null

// Verificar si el ID del usuario es válido
if (!$id_usuario) {
    // Esto no debería ocurrir si autenticarToken() funciona correctamente,
    // pero es una buena medida de seguridad.
    http_response_code(401); // Código de estado 401 Unauthorized
    echo json_encode(['error' => 'Usuario no autenticado o ID de usuario no encontrado en el token.']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Directorio para subir archivos
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true); // Crea el directorio si no existe
}

// Obtener datos de la publicación desde los datos POST
$data = $_POST; // Obtiene todos los datos enviados en la solicitud POST

// Asignar valores a las variables, usando valores por defecto si no se proporcionan
$titulo = $data['titulo'] ?? ''; // Título de la publicación
$descripcion = $data['descripcion'] ?? ''; // Descripción de la publicación
$id_categoria = $data['id_categoria'] ?? null; // ID de la categoría
$id_estilo = $data['id_estilo'] ?? null; // ID del estilo

// Manejar la subida de la imagen y el archivo
$imagen = handleUpdateFileUpload('imagen', $uploadDir, true); // Maneja la subida de la imagen
$archivo = handleUpdateFileUpload('archivo', $uploadDir); // Maneja la subida del archivo

// Preparar la consulta SQL para insertar la nueva publicación
$stmt = $db->prepare("INSERT INTO publicaciones (id_usuario, titulo, descripcion, imagen, archivo, id_categoria, id_estilo)
                        VALUES (:id_usuario, :titulo, :descripcion, :imagen, :archivo, :id_categoria, :id_estilo)");

// Vincular los valores a la consulta
$stmt->bindValue(':id_usuario', $id_usuario, SQLITE3_INTEGER); // Vincula el ID del usuario
$stmt->bindValue(':titulo', $titulo, SQLITE3_TEXT); // Vincula el título
$stmt->bindValue(':descripcion', $descripcion, SQLITE3_TEXT); // Vincula la descripción
$stmt->bindValue(':imagen', $imagen, SQLITE3_TEXT); // Vincula la imagen
$stmt->bindValue(':archivo', $archivo, SQLITE3_TEXT); // Vincula el archivo
$stmt->bindValue(':id_categoria', $id_categoria, SQLITE3_INTEGER); // Vincula la categoría
$stmt->bindValue(':id_estilo', $id_estilo, SQLITE3_INTEGER); // Vincula el estilo

// Ejecutar la consulta y devolver el resultado
if ($stmt->execute()) {
    echo json_encode(['mensaje' => 'Publicación creada con éxito']); // Mensaje de éxito en formato JSON
} else {
    http_response_code(500); // Código de estado 500 Internal Server Error
    echo json_encode(['error' => 'Error al crear la publicación']); // Mensaje de error en formato JSON
}
?>
