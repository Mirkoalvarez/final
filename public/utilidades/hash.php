<?php //utilidades/hash.php
$clave = 'admin123';
echo password_hash($clave, PASSWORD_DEFAULT);
