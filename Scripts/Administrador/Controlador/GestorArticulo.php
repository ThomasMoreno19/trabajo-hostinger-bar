<?php
// Scripts/Administrador/Controlador/GestorArticulo.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Repositorio/ArticuloRepositorio.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Repositorio/RubroRepositorio.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Incluye/Config.php';

class GestorArticulo {
    private PDO $pdo;
    private ArticuloRepositorio $articuloRepositorio;
    private RubroRepositorio $rubroRepositorio;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
        $this->articuloRepositorio = new ArticuloRepositorio($pdo);
        $this->rubroRepositorio = new RubroRepositorio($pdo);
    }

    
    public function derivarURL(string $porcionURL): void {
        header('Content-Type: application/json');
        $url_segmentada = explode('/', $porcionURL);
        $primer_segmento = $url_segmentada[0]; //mostrar || modificar || crear
        
        switch (strtolower($primer_segmento)) {
            
            
            case 'mostrar':
                
                switch (strtolower($url_segmentada[1] ?? '')) {
                    
                    case '':
                        $this->mostrarTodos();
                        break;

                    case 'rubros':
                        $this->mostrarRubro();
                        break;

                    default:
                        if (is_numeric($url_segmentada[1])) {
                            $this->obtenerPorId();
                        }
                        break;
                    break;
                }
                break;
            
            case 'modificar':
                $this->modificar();
                break;

            case 'crear':
                $this->crear();
                break;
            
            case 'cargar-lista':
                $this->cargarLista();
                break;
            
            
            case 'subir-logo':
                $this->subirLogo();
                break;
            
            default:
                http_response_code(404);
                echo json_encode(['error' => 'Acción no encontrada para Articulo.']);
                break;
        }
    }
    
    
    private function mostrarTodos(): void {
        $datos = json_decode(file_get_contents('php://input'), true);

        $id_rubro = $datos['id_rubro'];
        $id_empresa = $datos['id_empresa'];
        
        // === CACHE EN ARCHIVO ===
        $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/articulos_rubro_{$id_rubro}_empresa_{$id_empresa}.json";

        if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TIME) {
            http_response_code(200);
            echo file_get_contents($cacheFile);
            return;
        }

        try {
            $listaArticulos = $this->articuloRepositorio->obtenerTodos($id_rubro);
            
            // ¡AHORA SÍ! Usa el nombre del campo
            foreach ($listaArticulos as &$articulo) {
                $articulo['precio'] = number_format((float)$articulo['precio'], 0, '', '.');
            }
            unset($articulo); // buena práctica

            $json = json_encode($listaArticulos);
            file_put_contents($cacheFile, $json);

            http_response_code(200);
            echo $json;

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
        }
    }

    private function mostrarRubro(): void {
        $datos = json_decode(file_get_contents('php://input'), true);

        $id = (int)$datos['id'];

        if (is_null($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos para mostrar el rubro']);
            return;
        }

        try {
            $rubro = $this->articuloRepositorio->obtenerRubro($id);
            http_response_code(200);
            echo json_encode($rubro);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al mostrar los rubros: ' . $e->getMessage()]);
        }
    }
    
    
    private function crear(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $id = $datos['id'];
        $id_rubro = $datos['nombre_rubro'];
        $id_empresa = $datos['id_empresa'];
        $nombre = $datos['nombre'];
        $descripcion = $datos['descripcion'];
        $precio = $datos['precio'];
        $codigo_carta = $datos['codigo_carta'];
        
        if (empty($nombre) || empty($id) || empty($id_rubro) || empty($precio)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos para crear el articulo.']);
            return;
        }

        try {
            $articulo = $this->articuloRepositorio->crear($id, $id_rubro, $id_empresa, $nombre, $precio, $codigo_carta, $descripcion);
            echo json_encode([
            'id' => $articulo['id'],
            'id_rubro' => $articulo['id_rubro'],
            'id_empresa' => $articulo['id_empresa'],
            'nombre' => $articulo['nombre'],
            'descripcion' => $articulo['descripcion'],
            'precio' => $articulo['precio'],
            'codigo_carta' => $articulo['codigo_carta']]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear el articulo: ' . $e->getMessage()]);
        }
    }
    
    private function cargarLista(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        $listaArticulos = $datos['lista'] ?? [];
        $id_empresa = $datos['id_empresa'];
    
        if (empty($listaArticulos)) {
            http_response_code(400);
            echo json_encode(['error' => 'No se recibieron artículos.']);
            return;
        }
        
        if (empty($id_empresa)) {
            http_response_code(400);
            echo json_encode(['error' => 'No se recibió id_empresa.']);
            return;
        }
    
        // Preparamos los artículos para enviarlos al repositorio
        $articulosParaRepo = [];
        foreach ($listaArticulos as $articulo) {
            $articulosParaRepo[] = [
                'id' => $articulo['id_articulo'],
                'id_rubro' => $articulo['nombre_rubro'],
                'id_empresa' => $id_empresa,
                'nombre' => $articulo['nombre_articulo'],
                'descripcion' => $articulo['descripcion'] ?? '',
                'precio' => $articulo['precio_articulo'],
                'codigo_carta' => $articulo['codigo_carta_articulo'] ?? ''
            ];
        }
    
        try {
            // Llamamos al nuevo método del repositorio que recibe todos los artículos
            $resultado = $this->articuloRepositorio->crearListaCsv($articulosParaRepo);
            $this->borrarCacheTodos($id_empresa);
            echo json_encode($resultado);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear los artículos: ' . $e->getMessage()]);
        }
    }

    private function borrarCacheTodos(int $id_empresa): void {
        $cacheDir = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/";
        $pattern = $cacheDir . "articulos_rubro_*_empresa_{$id_empresa}.json";
    
        $archivos = glob($pattern);
        if (!$archivos) {
            return; // si no hay archivos, simplemente termina
        }
    
        foreach ($archivos as $archivo) {
            if (file_exists($archivo)) {
                @unlink($archivo); // el @ evita warnings si ya fue borrado
            }
        }
    }
    
    private function borrarCacheDeUnRubro(int $id_rubro): void {
        $cacheDir = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/";
        $pattern = $cacheDir . "articulos_rubro_{$id_rubro}_empresa_*.json";
    
        $archivos = glob($pattern);
        if (!$archivos) {
            return;
        }
    
        foreach ($archivos as $archivo) {
            if (file_exists($archivo)) {
                @unlink($archivo);
            }
        }
    }


    
    
    private function modificar(): void {
        $datos = json_decode(file_get_contents('php://input'), true);
        
        $id = $datos['id'];
        $id_rubro = $datos['id_rubro'];
        $nombre = $datos['nombre'];
        $descripcion = $datos['descripcion'];
        $precio = $datos['precio'];
        $codigo_carta = $datos['codigo_carta'];
        
        
        $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/cache/articulos_rubro_{$id_rubro}.json";
        if (file_exists($cacheFile)) {
            unlink($cacheFile); // Borra cache
        }
        
        if (empty($nombre) || empty($id) || empty($id_rubro) || empty($precio)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos válidos para modificar el articulo con el id recibido']);
            return;
        }

        try {
            $articuloModificado = $this->articuloRepositorio->modificar($id, $id_rubro, $nombre, $descripcion, $precio, $codigo_carta);
            $this->borrarCacheDeUnRubro($id_rubro);
            echo json_encode($articuloModificado);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al modificar el articulo: ' . $e->getMessage()]);
        }
    }
}