<?php
// utils.php

// Función para redimensionar una imagen
function redimensionarImagen($origen, $destino, $anchoMax, $altoMax) {
    list($ancho, $alto, $tipo) = getimagesize($origen); // Obtener dimensiones y tipo de la imagen
    $ratio = min($anchoMax / $ancho, $altoMax / $alto); // Calcular el ratio de redimensionamiento

    if ($ratio >= 1) {
        return; // No redimensionar si la imagen es más pequeña que el límite
    }

    $nuevoAncho = (int)($ancho * $ratio); // Calcular nuevo ancho
    $nuevoAlto = (int)($alto * $ratio); // Calcular nuevo alto

    // Crear imagen a partir del tipo
    $imagen = match($tipo) {
        IMAGETYPE_JPEG => imagecreatefromjpeg($origen),
        IMAGETYPE_PNG  => imagecreatefrompng($origen),
        IMAGETYPE_WEBP => imagecreatefromwebp($origen),
        default        => null,
    };

    if (!$imagen) return; // Si no se pudo crear la imagen, salir

    $nuevaImagen = imagecreatetruecolor($nuevoAncho, $nuevoAlto); // Crear nueva imagen
    imagecopyresampled($nuevaImagen, $imagen, 0, 0, 0, 0, $nuevoAncho, $nuevoAlto, $ancho, $alto); // Redimensionar

    // Guardar la nueva imagen según su tipo
    match($tipo) {
        IMAGETYPE_JPEG => imagejpeg($nuevaImagen, $destino, 85),
        IMAGETYPE_PNG  => imagepng($nuevaImagen, $destino, 8),
        IMAGETYPE_WEBP => imagewebp($nuevaImagen, $destino, 85),
        default        => null,
    };

    imagedestroy($imagen); // Liberar memoria
    imagedestroy($nuevaImagen); // Liberar memoria
}

// Función para crear una miniatura de una imagen
function crearMiniatura($origen, $destino, $tamano = 150) {
    list($ancho, $alto, $tipo) = getimagesize($origen); // Obtener dimensiones y tipo de la imagen

    // Crear imagen a partir del tipo
    $imagen = match($tipo) {
        IMAGETYPE_JPEG => imagecreatefromjpeg($origen),
        IMAGETYPE_PNG  => imagecreatefrompng($origen),
        IMAGETYPE_WEBP => imagecreatefromwebp($origen),
        default        => null,
    };

    if (!$imagen) return; // Si no se pudo crear la imagen, salir

    $nuevaImagen = imagecreatetruecolor($tamano, $tamano); // Crear nueva imagen para la miniatura

    // Fondo blanco (para PNG o WEBP transparentes)
    $blanco = imagecolorallocate($nuevaImagen, 255, 255, 255);
    imagefill($nuevaImagen, 0, 0, $blanco); // Rellenar el fondo

    // Calcular proporciones para no deformar
    $ratio = min($tamano / $ancho, $tamano / $alto);
    $nuevoAncho = (int)($ancho * $ratio); // Calcular nuevo ancho
    $nuevoAlto = (int)($alto * $ratio); // Calcular nuevo alto
    $x = (int)(($tamano - $nuevoAncho) / 2); // Calcular posición X
    $y = (int)(($tamano - $nuevoAlto) / 2); // Calcular posición Y

    imagecopyresampled($nuevaImagen, $imagen, $x, $y, 0, 0, $nuevoAncho, $nuevoAlto, $ancho, $alto); // Redimensionar

    // Guardar la miniatura según su tipo
    match($tipo) {
        IMAGETYPE_JPEG => imagejpeg($nuevaImagen, $destino, 85),
        IMAGETYPE_PNG  => imagepng($nuevaImagen, $destino, 8),
        IMAGETYPE_WEBP => imagewebp($nuevaImagen, $destino, 85),
        default        => null,
    };

    imagedestroy($imagen); // Liberar memoria
    imagedestroy($nuevaImagen); // Liberar memoria
}

// Función para manejar la subida de archivos
function handleUpdateFileUpload($campo, $uploadDir, $redimension = false, $maxAncho = 800, $maxAlto = 800) {
    // Verificar si se ha subido un archivo sin errores
    if (!empty($_FILES[$campo]['tmp_name']) && $_FILES[$campo]['error'] === UPLOAD_ERR_OK) {
        $extension = strtolower(pathinfo($_FILES[$campo]['name'], PATHINFO_EXTENSION)); // Obtener la extensión del archivo
        $nombreSeguro = uniqid($campo . '_') . '.' . $extension; // Generar un nombre único para el archivo
        $rutaDestino = $uploadDir . $nombreSeguro; // Ruta de destino para el archivo

        // Mover el archivo a la ubicación de destino
        if (move_uploaded_file($_FILES[$campo]['tmp_name'], $rutaDestino)) {
            // Redimensionar la imagen si se indica
            if ($redimension) {
                redimensionarImagen($rutaDestino, $rutaDestino, $maxAncho, $maxAlto);
            }

            // Crear miniatura
            $rutaMiniatura = $uploadDir . 'thumb_' . $nombreSeguro; // Ruta de la miniatura
            crearMiniatura($rutaDestino, $rutaMiniatura); // Crear la miniatura

            return $nombreSeguro; // Devolver el nombre del archivo subido
        }
    }
    return null; // Si no se subió archivo, devolver null
}
?>
