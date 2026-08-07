<?php
// Scripts/Administrador/Controlador/GestorRubro.php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Repositorio/RubroRepositorio.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Repositorio/ArticuloRepositorio.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Incluye/Config.php';

class GestorRubro
{
  private PDO $pdo;
  private rubroRepositorio $rubroRepositorio;
  private articuloRepositorio $articuloRepositorio;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
    $this->rubroRepositorio = new RubroRepositorio($pdo);
    $this->articuloRepositorio = new ArticuloRepositorio($pdo);
  }

  public function derivarURL(string $porcionURL): void
  {
    header('Content-Type: application/json');
    $url_segmentada = explode('/', $porcionURL);
    $primer_segmento = $url_segmentada[0]; //mostrar || modificar || crear

    switch (strtolower($primer_segmento)) {


      case 'mostrar':

        switch (strtolower($url_segmentada[1] ?? '')) {

          case '':
            $this->mostrarTodos();
            break;

          case 'para-cliente':
            $this->mostrarParaCliente();
            break;
        }
        break;

      case 'modificar':
        $this->modificar();
        break;

      case 'cargar-lista':
        $this->cargarLista();
        break;

      case 'subir-logo':
        $this->subirLogo();
        break;

      case 'setear-en-0':
        $this->setearEn0();
        break;

      case 'eliminar-no-utilizados':
        $this->eliminarNoUtilizados();
        break;

      case 'subir-video':
        $this->subirVideo();
        break;

      case 'eliminar-video':
        $this->eliminarVideo();
        break;

      case 'eliminar':
        $this->eliminar();
        break;

      default:
        http_response_code(404);
        echo json_encode(['error' => 'Acción no encontrada para Rubro.']);
        break;
    }
  }


  private function mostrarTodos(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);
    $id_empresa = $datos['id_empresa'] ?? 0;

    // === CACHE EN ARCHIVO ===
    $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/rubros_empresa_{$id_empresa}.json";

    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TIME) {
      http_response_code(200);
      echo file_get_contents($cacheFile);
      return;
    }

    try {
      $listaRubros = $this->rubroRepositorio->obtenerTodos($id_empresa);

      $json = json_encode($listaRubros);
      file_put_contents($cacheFile, $json); // Guarda cache

      http_response_code(200);
      echo $json;
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mostrar los rubros entre los valores recibidos' . $e->getMessage()]);
    }
  }

  private function mostrarParaCliente(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);
    $id_empresa = $datos['id_empresa'] ?? 0;

    // === CACHE EN ARCHIVO ===
    $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/rubros_empresa_{$id_empresa}_cliente.json";

    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TIME) {
      http_response_code(200);
      echo file_get_contents($cacheFile);
      return;
    }

    try {
      $listaRubros = $this->rubroRepositorio->obtenerParaCliente($id_empresa);

      $json = json_encode($listaRubros);
      file_put_contents($cacheFile, $json); // Guarda cache

      http_response_code(200);
      echo $json;
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mostrar los rubros entre los valores recibidos' . $e->getMessage()]);
    }
  }

  private function cargarLista(): void
  {
    $input = json_decode(file_get_contents('php://input'), true);
    $id_empresa = (int)$input['id_empresa'];
    $datos = $input['lista'];
    $nuevaLista = [];
    foreach ($datos as $item) {
      $nombre_rubro = $item['nombre_rubro'] ?? '';
      $para_mesero = (int)$item['publica_rub'] ?? 0;

      try {
        // Llama al repositorio para crear el rubro, pasando el id_empresa extraído
        $id_rubro = $this->rubroRepositorio->crearPorCsv($id_empresa, $nombre_rubro, $para_mesero);
        // Crea un nuevo array para el artículo final.
        $articulo_final = $item;
        // Añade el id_rubro al nuevo array.
        $articulo_final['nombre_rubro'] = $id_rubro;

        // Añade el artículo completo a la nueva lista.
        $nuevaLista[] = $articulo_final;
      } catch (Exception $e) {
      }
    }
    $this->borrarCacheTodos($id_empresa);
    echo json_encode($nuevaLista);
  }

  private function borrarCacheTodos(int $id_empresa): bool
  {
    $cacheDir = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/";
    $cacheFileCliente = $cacheDir . "rubros_empresa_{$id_empresa}_cliente.json";
    if (file_exists($cacheFileCliente)) {
      unlink($cacheFileCliente);
    }
    $cacheFile = $cacheDir . "rubros_empresa_{$id_empresa}.json";

    if (!file_exists($cacheFile)) {
      return false;
    }

    return unlink($cacheFile);
  }

  private function setearEn0(): void
  {
    $input = json_decode(file_get_contents('php://input'), true);
    $id_empresa = (int)$input['id_empresa'];
    $listaRubros = $this->rubroRepositorio->obtenerTodos($id_empresa);
    foreach ($listaRubros as $rubro) {
      $id_rubro = $rubro['id'];
      try {
        // Llama al repositorio para crear el rubro, pasando el id_empresa extraído
        $this->rubroRepositorio->setearCSVEn0($id_empresa);
        $this->articuloRepositorio->setearCSVEn0($id_rubro);
      } catch (Exception $e) {
        error_log("Hubo un error en setearEn0() (GestorRubro)");
      }
    }
  }

  private function eliminarNoUtilizados(): void
  {
    $input = json_decode(file_get_contents('php://input'), true);
    $id_empresa = (int)$input['id_empresa'];
    $listaRubros = $this->rubroRepositorio->obtenerTodos($id_empresa);
    foreach ($listaRubros as $rubro) {
      $id_rubro = $rubro['id'];
      try {
        // Llama al repositorio para crear el rubro, pasando el id_empresa extraído
        $this->articuloRepositorio->eliminarNoUtilizados($id_rubro);
        $this->rubroRepositorio->eliminarNoUtilizados($id_empresa);
      } catch (Exception $e) {
        error_log("Hubo un error en eliminarRubrosYArtNoUtilizados() (GestorRubro)");
      }
    }
  }

  private function modificar(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id = $datos['id'];
    $id_empresa = $datos['id_empresa'];
    $nombre = $datos['nombre'];
    $logo_url = $datos['logo_url'];

    if ((is_null($nombre) && is_null($id_empresa))) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos válidos para modificar la empresa con el id recibido']);
      return;
    }

    try {
      $rubroModificado = $this->rubroRepositorio->modificar($id, $id_empresa, $nombre, $logo_url);
      $this->borrarCacheTodos($id_empresa);
      echo json_encode($rubroModificado);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al modificar la empresa: ' . $e->getMessage()]);
    }
  }

  private function subirLogo(): void
  {

    if (empty($_FILES['imagen']['tmp_name'])) {
      http_response_code(400);
      echo json_encode(['error' => 'No se ha enviado ningún archivo.']);
      return;
    }

    $directorioDestino = $_SERVER['DOCUMENT_ROOT'] . '/Archivos/Logos/Rubro/';
    $nombreOriginal = basename($_FILES['imagen']['name']);
    $nombreSinEspacios = str_replace(' ', '-', $nombreOriginal); // Reemplaza espacios por guiones
    $nombreArchivo = uniqid() . '-' . $nombreSinEspacios;
    $rutaDestino = $directorioDestino . $nombreArchivo;

    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino)) {
      //Devuelve la ruta donde se guardó la imagen, para que la guarden en la BD
      $url = '/Archivos/Logos/Rubro/' . $nombreArchivo;
      echo json_encode(['url' => $url]);
    } else {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mover el archivo subido.']);
    }
  }

  private function subirVideo(): void
  {
    // Al usar FormData en JS, los campos de texto viajan en $_POST
    if (empty($_POST['id_rubro']) || empty($_POST['id_empresa']) || empty($_FILES['archivo']['tmp_name'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos obligatorios o el archivo de video.']);
      return;
    }

    $id_rubro = (int)$_POST['id_rubro'];
    $id_empresa = (int)$_POST['id_empresa'];

    // URL del video actual que viene desde el cliente para poder eliminarlo si existe
    $articulo_video_url = !empty($_POST['video_url']) ? $_POST['video_url'] : null;

    // 1. Configuración de ruta dinámica por empresa
    $directorioDestino = $_SERVER['DOCUMENT_ROOT'] . '/Archivos/Videos/' . $id_empresa . '/';

    if (!is_dir($directorioDestino)) {
      mkdir($directorioDestino, 0755, true);
    }

    // 2. Validación de límite de almacenamiento (1 GB por carpeta de empresa)
    $limiteMaximoBytes = 1 * 1024 * 1024 * 1024; // 1 GB en bytes
    $pesoCarpetaActual = $this->obtenerTamañoDirectorio($directorioDestino);
    $pesoNuevoArchivo = $_FILES['archivo']['size'];

    if (($pesoCarpetaActual + $pesoNuevoArchivo) > $limiteMaximoBytes) {
      http_response_code(400);
      echo json_encode(['error' => 'Se ha excedido el espacio máximo permitido de 1GB para esta empresa.']);
      return;
    }

    // Procesamiento del nombre del archivo
    $nombreOriginal = basename($_FILES['archivo']['name']);
    $nombreSinEspacios = str_replace(' ', '-', $nombreOriginal);

    $infoArchivo = pathinfo($nombreSinEspacios);
    $nombreBase = $infoArchivo['filename'];
    $extension = isset($infoArchivo['extension']) ? '.' . $infoArchivo['extension'] : '';

    $nombreArchivo = $nombreBase . "-rubro" . $id_rubro . "_empresa" . $id_empresa . $extension;
    $rutaDestino = $directorioDestino . $nombreArchivo;

    if (move_uploaded_file($_FILES['archivo']['tmp_name'], $rutaDestino)) {
      // Nueva URL relativa para almacenar en la BD
      $video_url = '/Archivos/Videos/' . $id_empresa . '/' . $nombreArchivo;

      // Guardar en la base de datos a través del repositorio
      $guardadoExitoso = $this->rubroRepositorio->agregarUrlVideo($id_rubro, $id_empresa, $video_url);

      if ($guardadoExitoso) {
        // 3. Si se guardó con éxito el nuevo, eliminamos el archivo físico anterior (si existía)
        if ($articulo_video_url) {
          $rutaVideoAnterior = $_SERVER['DOCUMENT_ROOT'] . $articulo_video_url;
          if (file_exists($rutaVideoAnterior) && is_file($rutaVideoAnterior)) {
            unlink($rutaVideoAnterior);
          }
        }

        http_response_code(200);
        $this->borrarCacheTodos($id_empresa);
        echo json_encode(['url' => $video_url, 'mensaje' => 'Video subido y registrado con éxito.']);
        return;
      } else {
        if (file_exists($rutaDestino)) {
          unlink($rutaDestino);
        }
        http_response_code(500);
        echo json_encode(['error' => 'Error al registrar la URL del video en la base de datos.']);
        return;
      }
    } else {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mover el archivo de video al servidor.']);
      return;
    }
  }

  private function obtenerTamañoDirectorio(string $ruta): int
  {
    $totalBytes = 0;
    if (!is_dir($ruta)) return $totalBytes;

    $elementos = scandir($ruta);
    foreach ($elementos as $elemento) {
      if ($elemento !== '.' && $elemento !== '..') {
        $rutaCompleta = $ruta . $elemento;
        if (is_file($rutaCompleta)) {
          $totalBytes += filesize($rutaCompleta);
        }
      }
    }
    return $totalBytes;
  }

  private function eliminarVideo(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_rubro = $datos['id_rubro'];
    $id_empresa = $datos['id_empresa'];
    $video_url = $datos['video_url'];

    if ($video_url) {
      $rutaVideo = $_SERVER['DOCUMENT_ROOT'] . $video_url;
      if (file_exists($rutaVideo) && is_file($rutaVideo)) {
        unlink($rutaVideo);
      }
    }

    $guardadoExitoso = $this->rubroRepositorio->eliminarUrlVideo($id_rubro, $id_empresa, $video_url);

    if ($guardadoExitoso) {
      http_response_code(200);
      $this->borrarCacheTodos($id_empresa);
      echo json_encode(['mensaje' => 'Video eliminado con éxito.']);
      return;
    } else {
      http_response_code(500);
      echo json_encode(['error' => 'Error al eliminar el video.']);
      return;
    }
  }

  private function eliminar(): void
  {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)$input['id'];
    $id_empresa = (int)$input['id_empresa'];

    if ($id <= 0 || $id_empresa <= 0) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos válidos para eliminar el rubro con el id recibido']);
      return;
    }

    try {
      $exito = $this->rubroRepositorio->eliminar($id, $id_empresa);
      if ($exito) {
        $this->borrarCacheTodos($id_empresa);
        echo json_encode(['success' => true]);
      } else {
        http_response_code(404);
        echo json_encode(['error' => 'No se encontró el rubro para eliminar.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al eliminar el rubro: ' . $e->getMessage()]);
    }
  }
}
