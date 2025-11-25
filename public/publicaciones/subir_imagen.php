<?php
// publicaciones/subir_imagen.php

// Incluir archivos de configuración y middleware necesarios
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';

// Manejo de solicitud OPTIONS (CORS preflight)
// Responde a las solicitudes OPTIONS para permitir peticiones desde otros dominios.

// Verificar que el método sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Código de estado 405 Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Verifica el token JWT
autenticarToken(); // Lanza error 401 si el token no es válido

// Ruta base del servidor (para devolver URL pública)
$baseUrl = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/../uploads/';
$uploadDir = __DIR__ . '/../uploads/'; // Directorio para subir archivos

// Crear el directorio si no existe
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true); // Permisos más restrictivos
}

// Inicializar la respuesta
$response = [];
$archivos = ['imagen', 'archivo']; // Campos de archivos a manejar

// Iterar sobre los campos de archivos
foreach ($archivos as $campo) {
    // Verificar si el archivo fue subido sin errores
    if (isset($_FILES[$campo]) && $_FILES[$campo]['error'] === UPLOAD_ERR_OK) {
        $archivo = $_FILES[$campo]; // Obtener información del archivo
        $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION)); // Obtener la extensión del archivo
        $nombreSeguro = uniqid($campo . '_') . '.' . $extension; // Generar un nombre único para el archivo
        $rutaDestino = $uploadDir . $nombreSeguro; // Ruta de destino para el archivo

        $mime = mime_content_type($archivo['tmp_name']); // Obtener el tipo MIME del archivo
        $tiposPermitidos = [
            'imagen' => ['image/jpeg', 'image/png', 'image/webp'], // Tipos permitidos para imágenes
            'archivo' => ['application/pdf'] // Tipos permitidos para archivos
        ];

        // Verificar si el tipo MIME es permitido
        if (in_array($mime, $tiposPermitidos[$campo])) {
            // Mover el archivo a la ubicación de destino
            if (move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
                $response[$campo] = $baseUrl . $nombreSeguro; // URL pública del archivo subido
            } else {
                http_response_code(500); // Código de estado 500 Internal Server Error
                $response[$campo] = "Error al mover el archivo."; // Mensaje de error en formato JSON
            }
        } else {
            http_response_code(400); // Código de estado 400 Bad Request
            $response[$campo] = "Tipo no permitido para $campo: $mime"; // Mensaje de error en formato JSON
        }
    } else {
        $response[$campo] = null; // No se subió archivo para este campo
    }
}

// Devolver la respuesta en formato JSON
echo json_encode($response); // Envía la respuesta como JSON
?>


