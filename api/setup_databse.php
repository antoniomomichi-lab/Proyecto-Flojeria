<?php
require_once 'db-connection.php';

try {
    $pdo = getConnection();

    $email = "admin@floreria.com";
    $password_plano = "admin123"; // La contraseña que quieres usar
    $role = "admin";
    $nombre = "Admin General";

    // 1. "Licuar" la contraseña
    $hash = password_hash($password_plano, PASSWORD_DEFAULT);

    // 2. Insertar el usuario con el HASH
    $stmt = $pdo->prepare(
        "INSERT INTO empleados (email, password_hash, role, nombre) 
         VALUES (?, ?, ?, ?)"
    );
    
    $stmt->execute([$email, $hash, $role, $nombre]);

    echo "¡Usuario Admin Creado con Éxito!";
    echo "<br>Email: " . $email;
    echo "<br>Contraseña: " . $password_plano;

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>