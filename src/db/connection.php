<?php

class ConexionDB{
    public static function setConnection(){
        $host = "localhost"; // 127.0.0.1
        $dbname = 'flores';
        $user = 'root';
        $pass = '';
        $charset = 'utf8mb4';        
        $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try{
            return new PDO($dsn, $user, $pass, $options); // aquí se realiza la conexión a la BD
        }
        catch(PDOException $e){
            throw new PDOException(
                'Error de conexión a la base de datos:'.$e->getMessage());
        }
    }
}

?>
