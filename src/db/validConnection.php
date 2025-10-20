<?php
header('Content-Type: application/json'); 
require_once 'connection.php'; 

try {    
    $conn=ConexionDB::setConnection();
    echo json_encode(["estadoDB" => "Conexión exitosa!!"]); 

} catch (Exception $e) {
    echo json_encode(["errorDB" => $e->getMessage()]); 
}
