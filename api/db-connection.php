<?php
// Configuración de la Base de Datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'pruebaXD'); // El nombre de tu BD
define('DB_USER', 'root');
define('DB_PASS', '');       // Tu contraseña de XAMPP (suele estar vacía)
define('DB_CHARSET', 'utf8mb4');

function getConnection() {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
         return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
         // En un caso real, no mostrarías el error, solo lo registrarías
         throw new PDOException("Error de conexión: " . $e->getMessage());
    }
}
?>