<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

$data = json_decode(file_get_contents('php://input'));

// 1. Validar datos
if (empty($data->id) || empty($data->nombre) || empty($data->email) || empty($data->role)) {
    $response['message'] = 'Faltan campos obligatorios (ID, Nombre, Email, Rol).';
    echo json_encode($response);
    exit;
}

try {
    $pdo = getConnection();
    
    // 2. Verificar si la contraseña se va a actualizar
    if (!empty($data->password)) {
        // --- SÍ se actualiza la contraseña ---
        $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare(
            "UPDATE empleados SET nombre = ?, email = ?, role = ?, password_hash = ? 
             WHERE id = ?"
        );
        $stmt->execute([
            $data->nombre,
            $data->email,
            $data->role,
            $password_hash,
            $data->id
        ]);
    } else {
        // --- NO se actualiza la contraseña ---
        $stmt = $pdo->prepare(
            "UPDATE empleados SET nombre = ?, email = ?, role = ? 
             WHERE id = ?"
        );
        $stmt->execute([
            $data->nombre,
            $data->email,
            $data->role,
            $data->id
        ]);
    }
    
    if ($stmt->rowCount() > 0) {
        $response['success'] = true;
        $response['message'] = 'Usuario actualizado correctamente.';
    } else {
        $response['message'] = 'No se realizó ningún cambio o el usuario no existe.';
    }

} catch (PDOException $e) {
    if ($e->errorInfo[1] == 1062) {
        $response['message'] = 'El email ya está registrado por otro usuario.';
    } else {
        $response['message'] = 'Error de base de datos: ' . $e->getMessage();
    }
}

echo json_encode($response);
exit;
?>