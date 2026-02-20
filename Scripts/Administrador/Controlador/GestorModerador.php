<?php
// Scripts/Administrador/Controlador/GestorModerador.php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Repositorio/ModeradorRepositorio.php';

class GestorModerador {
    private PDO $pdo;
    private moderadorRepositorio $moderadorRepositorio;
    
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
        $this->moderadorRepositorio = new ModeradorRepositorio($pdo);
    }
    
    
    public function derivarURL(string $porcionURL): void {
        $url_segmentada = explode('/', $porcionURL);
        $primer_segmento = $url_segmentada[0]; //mostrar || cambiar-contrasena || modificar || eliminar || crear
        if (is_numeric($url_segmentada[0])) {
            if (!isset($_SESSION['admin_logueado'])) {
                if(!isset($_SESSION['moderador_logueado'])){
                    require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Vista/Html/FormIniciarSesionModerador.html';
                    exit;
                }
                
                if($_SESSION['id_moderador'] != (int)$primer_segmento){
                    require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Vista/Html/FormIniciarSesionModerador.html';
                    exit;
                }
                
                require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Vista/Html/PantallaModerador.html';
                exit;
            }else{
                if(isset($_SESSION['admin_logueado'])){
                    require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Vista/Html/PantallaModerador.html';
                    exit;
                }
            }
        }
        
        header('Content-Type: application/json');
        switch (strtolower($primer_segmento)) {
            
            
            case 'mostrar':
                
                switch (strtolower($url_segmentada[1] ?? '')) {
                    
                    case '':
                        echo json_encode($this->moderadorRepositorio->obtenerTodos());
                        break;
                    
                    case 'entre':
                        $this->mostrarEntre();
                        break;

                    default:
                        if (is_numeric($url_segmentada[1])) {
                            $this->obtenerPorId();
                        }
                        break;
                    break;
                }
                break;
            
            case 'cambiar-contrasena':
                $this->cambiarContrasena();
                break;
            
            case 'obtener-por-empresa':
                $this->obtenerPorEmpresa();
                break;
            
            case 'obtener-logo-empresa':
                $this->obtenerLogoEmpresa();
                break;
            
            case 'modificar':
                $this->modificar();
                break;

            case 'crear':
                $this->crear();
                break;
            
            case 'eliminar':
                $this->eliminar();
                break;
            
            case 'login':
                $this ->iniciarSesion();
                break;
            
            default:
                http_response_code(404);
                echo json_encode([
                    'url completa' => $porcionURL,
                    'url  $url_segmentada[0]'=> is_numeric($url_segmentada[0]),
                ]);
                break;
        }
    }
    
    private function crear(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $id_empresa = $datos['id_empresa'];
        $nombre = $datos['nombre'];
        $contrasena = $datos['contrasena'];
        
        if (is_null($id_empresa) || empty($nombre) || empty($contrasena)) {
            http_response_code(400);
            echo json_encode([
            'error' => 'Faltan datos para crear el moderador.',
            'debug' => ['id_empresa' => $id_empresa, 'nombre' => $nombre, 'contrasena' => $contrasena]]);
        }

        try {
            $moderador = $this->moderadorRepositorio->crear($id_empresa, $nombre, $contrasena);
            echo json_encode([
            'id' => $moderador['id'],
            'id_empresa' => $moderador['id_empresa'],
            'nombre' => $moderador['nombre'],
            'contrasena' => $moderador['contrasena']]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear el moderador: ' . $e->getMessage()]);
        }
    }
    
    
    private function modificar(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $id = $datos['id'];
        $nombre = $datos['nombre'];
        $contrasena = $datos['contrasena'];

        if (is_null($nombre)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos válidos para modificar el Moderador']);
            return;
        }

        try {
            if (is_null($contrasena)){
                $moderador = $this->moderadorRepositorio->modificarSinContrasena($id, $nombre);
                echo json_encode(['mensaje' => $moderador]);
            }
            $moderador = $this->moderadorRepositorio->modificar($id, $nombre, $contrasena);
            echo json_encode(['mensaje' => $moderador]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al modificar el moderador: ' . $e->getMessage()]);
        }
    }


    private function cambiarContrasena(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $id = $datos['id'];
        $contrasena = $datos['contrasena'];

        if ((is_null($id) && is_null($contrasena))) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos válidos para cambiar la contrasena del moderador']);
            return;
        }

        try {
            $contrasenaCambiada = $this->moderadorRepositorio->cambiarContrasena($id, $contrasena);
            echo json_encode($contrasenaCambiada);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cambiar la contraseña del moderador: ' . $e->getMessage()]);
        }
    }


    private function eliminar(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $id = $datos['id'];

        if (is_null($id) ) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos válidos para eliminar el moderador']);
            return;
        }

        try {
            $estaEliminado = $this->moderadorRepositorio->eliminar($id);
            echo json_encode($estaEliminado);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar el moderador: ' . $e->getMessage()]);
        }
    }
    
    private function obtenerPorEmpresa(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $id_empresa = $datos['id_empresa'];

        if (is_null($id_empresa)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos válidos para verificar si empresa tiene moderador asignado']);
            return;
        }

        try {
            $obtenerPorEmpresa = $this->moderadorRepositorio->obtenerPorEmpresa($id_empresa);
            echo json_encode([
            'id' => $obtenerPorEmpresa['id'],
            'nombre' => $obtenerPorEmpresa['nombre'],
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener el moderador: ' . $e->getMessage()]);
        }
    }
    
    private function obtenerLogoEmpresa(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $id_empresa = $datos['id_empresa'];

        if (is_null($id_empresa)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos válidos para verificar si empresa tiene moderador asignado']);
            return;
        }

        try {
            $logoEmpresa = $this->moderadorRepositorio->obtenerLogoEmpresa($id_empresa);
            echo json_encode($logoEmpresa);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cambiar la contraseña del moderador: ' . $e->getMessage()]);
        }
    }
    
    private function iniciarSesion(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $nombre = $datos['nombre'];
        $contrasena = $datos['contrasena'];
        $id_empresa = (int)$datos['id_empresa'];

        if (is_null($nombre) || is_null($contrasena)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos válidos para ingresar sesion de moderador']);
        }

        try {
            $response = $this->moderadorRepositorio->iniciarSesion($nombre, $contrasena, $id_empresa);
            if($response){
                $_SESSION['moderador_logueado'] = true;
                $_SESSION['id_moderador'] = $id_empresa;
                echo json_encode(true);
            }else{
                echo json_encode(false);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cambiar la contraseña del moderador: ' . $e->getMessage()]);
        }
    }
}