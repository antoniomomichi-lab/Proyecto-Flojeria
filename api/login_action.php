<?php
session_start();

require_once 'db-connection.php';

header('Content-Type: application/json');
$response = ['success' => false, 'message' => 'Error desconocido.'];

try {
    $data = json_decode(file_get_contents('php://input'));


    if (!isset($data->email) || !isset($data->password)) {
        throw new Exception('Email y contraseña son requeridos.');
    }

    $email = $data->email;
    $password_plano = $data->password;

    // 3. Conecta a la BD
    $pdo = getConnection();

    // 4. Busca al usuario por su email
    $stmt = $pdo->prepare("SELECT * FROM empleados WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // 5. Verifica si el usuario existe Y si la contraseña es correcta
    // ¡Aquí ocurre la magia del hashing!
    if ($user && password_verify($password_plano, $user['password_hash'])) {
        
        // ¡Éxito!
        $response['success'] = true;
        $response['message'] = 'Login exitoso.';
        $response['role'] = $user['role']; // Envía el rol al JS

        // Guarda datos en la sesión de PHP (opcional, pero recomendado)
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];

    } else {
        // Credenciales incorrectas
        $response['message'] = 'Email o contraseña incorrectos.';
    }

} catch (PDOException $e) {
    // Error de Base de Datos
    $response['message'] = 'Error de base de datos: ' . $e->getMessage();
} catch (Exception $e) {
    // Otro tipo de error (como datos faltantes)
    $response['message'] = $e->getMessage();
}

// 6. Envía la respuesta JSON al JavaScript
echo json_encode($response);
exit;
?>