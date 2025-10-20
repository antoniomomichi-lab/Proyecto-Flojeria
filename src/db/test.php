<?php
include 'connection.php';

try {
    $conn = ConexionDB::setConnection();
    echo "✅ Conexión exitosa a la base de datos";
} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage();
}
?>