<?php
// Inicia la sesión globalmente, ya que todas las solicitudes pasan por aquí.
session_start();
// Detectar si estás en local o en Hostinger
if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['SERVER_NAME'] === 'localhost') {
    // 🖥️ Entorno local
    require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Incluye/localBD.php';
} else {
    // ☁️ Entorno Hostinger
    require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Incluye/ConexionBD.php';
}
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Controlador/GestorEmpresa.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Controlador/GestorAdministrador.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Controlador/GestorModerador.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Controlador/GestorArticulo.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Controlador/GestorRubro.php';

$url = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'); // Tomar la url (Elimina barras iniciales/finales).

// Dividir la url en un array
$url_segmentada = explode('/', $url);
$url_principal = $url_segmentada[0]; //lo que va antes de la primer barra en el slug, si el slug es Empresa/mostrar/123, entonces url_principal es Empresa
$porcionURL = implode('/', array_slice($url_segmentada, 1)); // el resto de la url, si la url entera es Empresa/mostrar/123, entonces porcionURl será mostrar/123

$pdo = conectarBD();

// Distribuir, dependiendo del primer segmento
try {
    switch (strtolower($url_principal)) {
        case 'admin':
            $controlador = new GestorAdministrador($pdo);
            $controlador->derivarURL($porcionURL);
            break;

        case 'moderador':
            $controlador = new GestorModerador($pdo);
            $controlador->derivarURL($porcionURL);
            break;
        
        case 'empresa':
            $controlador = new GestorEmpresa($pdo);
            $controlador->derivarURL($porcionURL);
            break;
            
        case 'articulo':
            $controlador = new GestorArticulo($pdo);
            $controlador->derivarURL($porcionURL);
            break;
            
        case 'rubro':
            $controlador = new GestorRubro($pdo);
            $controlador->derivarURL($porcionURL);
            break;
            
        case 'carta':
            require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Cliente/Vista/Html/PantallaCliente.php';
            exit;
            
        default:
            http_response_code(404);
            echo "<h1>404 - Página no encontrada</h1>";
            break;
    }
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    error_log("Error en el enrutador central para URI: " . $requestUri . " - " . $e->getMessage());
    echo "<h1>500 - Error Interno del Servidor</h1>";
}

exit;