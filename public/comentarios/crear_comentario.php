<?php
//comentarios/crear_comentario.php
require_once dirname(__DIR__, 2) . '/config/encabezados.php';
require_once dirname(__DIR__, 2) . '/config/configuracion.php';
require_once dirname(__DIR__, 2) . '/middleware/auth_middleware.php';

// Manejo de solicitud OPTIONS (CORS preflight)

// Validar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Autenticar usuario
try {
    $usuario = autenticarToken();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido o expirado']);
    exit;
}

// Validar y limpiar entrada
$input = json_decode(file_get_contents('php://input'), true);
$id_publicacion = filter_var($input['id_publicacion'] ?? null, FILTER_VALIDATE_INT);
$texto = trim($input['contenido'] ?? '');

// Validaciones
if (!$id_publicacion || $id_publicacion < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de publicación inválido']);
    exit;
}

if (empty($texto)) {
    http_response_code(400);
    echo json_encode(['error' => 'El contenido no puede estar vacío']);
    exit;
}

if (strlen($texto) > 1000) {
    http_response_code(400);
    echo json_encode(['error' => 'El contenido excede el límite de 1000 caracteres']);
    exit;
}
//-------------------------------
// Validaciones
try {
    // Verificar existencia de publicación
    $stmt = $db->prepare("SELECT id FROM publicaciones WHERE id = :id LIMIT 1");
    $stmt->bindValue(':id', $id_publicacion, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    if (!$result->fetchArray()) {
        http_response_code(404);
        echo json_encode(['error' => 'La publicación no existe']);
        exit;
    }

    // Insertar comentario
    $stmt = $db->prepare("
        INSERT INTO comentarios (id_publicacion, id_usuario, texto, fecha)
        VALUES (:id_publicacion, :id_usuario, :texto, datetime('now'))
    ");
    $stmt->bindValue(':id_publicacion', $id_publicacion, SQLITE3_INTEGER);
    $stmt->bindValue(':id_usuario', $usuario['id'], SQLITE3_INTEGER);
    $stmt->bindValue(':texto', $texto, SQLITE3_TEXT);

    if ($stmt->execute()) {
        $idComentario = $db->lastInsertRowID();
        
        // Devolver datos completos del nuevo comentario
        $stmt = $db->prepare("
            SELECT c.*, u.nombre as autor 
            FROM comentarios c
            JOIN usuarios u ON c.id_usuario = u.id
            WHERE c.id = :id
        ");
        $stmt->bindValue(':id', $idComentario, SQLITE3_INTEGER);
        $result = $stmt->execute();
        $nuevoComentario = $result->fetchArray(SQLITE3_ASSOC);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'comentario' => $nuevoComentario
        ]);
    } else {
        throw new Exception('Error al crear comentario');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error en el servidor',
        'details' => $e->getMessage()
    ]);
}
?>


