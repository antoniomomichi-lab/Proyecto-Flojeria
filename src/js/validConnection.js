
const establecerConexion = async () => {
    try {
        const response = await fetch('./src/database/validConnection.php');
        if (!response.ok) {
            throw new Error('Error del servidor HTTP: ' + response.status); // lanza un error si el archivo o ruta es incorrecto
        }
        return await response.json(); // devuelve la respuesta JSON del servidor con la conexión a la Base de Datos
    } catch (error) {
        return { errorServer: error.message }; // manejo de error con el servidor
    }
}

export default { establecerConexion };