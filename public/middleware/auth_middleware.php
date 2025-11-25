<?php
// middleware/auth_middleware.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Cargar clave desde archivo externo
$config = require __DIR__ . '/../config/clave.php';
$clave = $config['clave_secreta'];
$algoritmo = 'HS256';

/**
 * Obtiene el valor del header Authorization sin depender de Apache.
 */
function obtenerAuthorizationHeader() {
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim($_SERVER["HTTP_AUTHORIZATION"]);
    }

    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            return trim($headers['Authorization']);
        }
    }

    return null;
}

/**
 * Verifica el JWT y devuelve los datos decodificados.
 */
function autenticarToken() {
    global $clave, $algoritmo;

    $authHeader = obtenerAuthorizationHeader();

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['error' => 'Token no enviado o mal formado.']);
        exit;
    }

    $token = substr($authHeader, 7); // Quita "Bearer "

    try {
        $decoded = JWT::decode($token, new Key($clave, $algoritmo));
        return (array) $decoded;
    } catch (Exception $e) {
        // Aquí se captura la excepción de token inválido o expirado
        http_response_code(401); // Código de estado 401 (Unauthorized)
        echo json_encode(['error' => 'Token inválido: ' . $e->getMessage()]);
        exit; // Termina la ejecución del script
    }
}

