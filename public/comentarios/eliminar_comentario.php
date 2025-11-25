<?php
// comentarios/eliminar_comentarios.php

// Incluye los archivos de configuración y middleware necesarios
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';

// Manejo de solicitudes OPTIONS (CORS preflight)
// Responde a las solicitudes OPTIONS para permitir peticiones desde otros dominios.

// Validar método HTTP
// Solo se permite el método DELETE para esta operación.
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405); // Código de estado 405 Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Autenticar usuario
try {
    $usuario = autenticarToken(); // Llama a la función para autenticar el token del usuario
} catch (Exception $e) {
    http_response_code(401); // Código de estado 401 Unauthorized
    echo json_encode(['error' => 'Token inválido o expirado']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

// Obtener ID del comentario desde el cuerpo de la solicitud
$input = json_decode(file_get_contents('php://input'), true);
$id_comentario = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT); // Valida el ID del comentario

// Verifica si el ID del comentario es válido
if (!$id_comentario || $id_comentario < 1) {
    http_response_code(400); // Código de estado 400 Bad Request
    echo json_encode(['error' => 'ID de comentario inválido']); // Mensaje de error en formato JSON
    exit; // Termina la ejecución del script
}

try {
    // Obtener el comentario y verificar permisos
    $stmt = $db->prepare("
        SELECT id_usuario FROM comentarios 
        WHERE id = :id LIMIT 1
    ");
    $stmt->bindValue(':id', $id_comentario, SQLITE3_INTEGER); // Vincula el ID del comentario
    $result = $stmt->execute(); // Ejecuta la consulta
    $comentario = $result->fetchArray(SQLITE3_ASSOC); // Obtiene el comentario

    // Verifica si el comentario existe
    if (!$comentario) {
        http_response_code(404); // Código de estado 404 Not Found
        echo json_encode(['error' => 'Comentario no encontrado']); // Mensaje de error en formato JSON
        exit; // Termina la ejecución del script
    }

    // Verificar permisos (autor o admin)
    if ($comentario['id_usuario'] != $usuario['id'] && $usuario['rol'] !== 'admin') {
        http_response_code(403); // Código de estado 403 Forbidden
        echo json_encode(['error' => 'No tienes permisos para eliminar este comentario']); // Mensaje de error en formato JSON
        exit; // Termina la ejecución del script
    }

    // Eliminar comentario
    $stmt = $db->prepare("DELETE FROM comentarios WHERE id = :id");
    $stmt->bindValue(':id', $id_comentario, SQLITE3_INTEGER); // Vincula el ID del comentario

    // Ejecuta la eliminación y verifica si se realizó con éxito
    if ($stmt->execute()) {
        if ($db->changes() > 0) { // Verifica si se eliminó algún registro
            http_response_code(200); // Código de estado 200 OK
            echo json_encode(['success' => true]); // Mensaje de éxito en formato JSON
        } else {
            http_response_code(500); // Código de estado 500 Internal Server Error
            echo json_encode(['error' => 'No se eliminó ningún registro']); // Mensaje de error en formato JSON
        }
    } else {
        http_response_code(500); // Código de estado 500 Internal Server Error
        echo json_encode(['error' => 'Error al eliminar el comentario']); // Mensaje de error en formato JSON
    }
} catch (Exception $e) {
    http_response_code(500); // Código de estado 500 Internal Server Error
    echo json_encode([
        'error' => 'Error en el servidor', // Mensaje de error en formato JSON
        'details' => $e->getMessage() // Detalles del error
    ]);
}
?>


