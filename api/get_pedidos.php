<?php
require_once 'db-connection.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => []];

try {
    $pdo = getConnection();
    // Unimos las 3 tablas para obtener la información completa
    $sql = "SELECT 
                p.idPedido, 
                c.nombre AS nombreCliente, 
                p.fechaPedido, 
                p.fechaEntrega, 
                p.estado,
                v.total,
                v.metodoPago
            FROM pedidos p
            JOIN clientes c ON p.idCliente = c.idCliente
            LEFT JOIN ventas v ON p.idPedido = v.idPedido
            ORDER BY p.fechaPedido DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $response['success'] = true;
    $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>