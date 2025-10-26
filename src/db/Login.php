<?php
header('Content-Type: application/json');
error_reporting(E_ERROR | E_PARSE);

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Faltan datos"]);
    exit;
}

$user = "admin@flores.com";
$pwd = "123456Db";

if ($email === $user && $password === $pwd) {
    echo json_encode(["success" => true, "role" => "admin", "email" => $email]);
    exit;
} else {
    echo json_encode(["success" => false, "message" => "Credenciales incorrectas"]);
    exit;
}

// ❌ NO cerrar PHP ni agregar espacios
