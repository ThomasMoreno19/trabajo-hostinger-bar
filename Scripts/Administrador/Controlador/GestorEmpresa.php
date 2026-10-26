<?php
// Scripts/Administrador/Controlador/GestorEmpresa.php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Repositorio/EmpresaRepositorio.php';

class GestorEmpresa
{
  private PDO $pdo;
  private empresaRepositorio $empresaRepositorio;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
    $this->empresaRepositorio = new EmpresaRepositorio($pdo);
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
            echo json_encode($this->empresaRepositorio->obtenerTodas());
            break;


          case 'id':
            $this->mostrarPorId();
            break;
        }
        break;

      case 'modificar':
        $this->modificar();
        break;

      case 'modificar-para-moderador':
        $this->modificarParaModerador();
        break;

      case 'crear':
        $this->crear();
        break;

      case 'eliminar':
        $this->eliminarEmpresa();
        break;

      case 'modificar-logo':
        $this->modificarLogo();
        break;

      case 'guardar-horarios':
        $this->guardarHorarios();
        break;

      case 'guardar-dias-no-laborales':
        $this->guardarDiasNoLaborales();
        break;

      case 'guardar-espectaculos':
        $this->guardarEspectaculos();
        break;

      case 'mostrar-horarios':
        $this->mostrarHorarios();
        break;

      case 'mostrar-espectaculos':
        $this->mostrarEspectaculos();
        break;

      case 'verificar-contrasena-mesero':
        $this->verificarContrasenaMesero();
        break;

      case 'registrar-contrasena-compartida':
        $this->registrarContrasenaCompartida();
        break;

      case 'eliminar-contrasena-compartida':
        $this->eliminarContrasenaCompartida();
        break;

      case 'guardar-excepciones-espectaculos':
        $this->guardarExcepcionesEspectaculos();
        break;

      default:
        http_response_code(404);
        echo json_encode(['error' => 'Acción no encontrada para Empresa.']);
        break;
    }
  }

  private function mostrarPorId(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)$datos['id_empresa'];

    if (empty($id_empresa)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para mostrar la empresa.']);
      return;
    }

    // === CACHE EN ARCHIVO ===
    $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/empresa_{$id_empresa}.json";

    // Si existe cache y no venció el tiempo definido en CACHE_TIME
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TIME) {
      http_response_code(200);
      echo file_get_contents($cacheFile);
      return;
    }

    try {
      $empresa = $this->empresaRepositorio->obtenerPorId($id_empresa);

      // Guardar en caché
      $json = json_encode($empresa);
      file_put_contents($cacheFile, $json);

      http_response_code(200);
      echo $json;
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mostrar la empresa: ' . $e->getMessage()]);
    }
  }


  private function crear(): void
  {
    // 1️⃣ Verificar y decodificar JSON o multipart
    // Si el frontend manda FormData (con archivo), usamos $_POST y $_FILES
    $nombre = $_POST['nombre'];
    $telefono = $_POST['telefono'];
    $ubicacion = $_POST['ubicacion'];
    $tieneCarrito   = filter_var($_POST['tieneCarrito'], FILTER_VALIDATE_BOOLEAN);
    $moduloMesero   = filter_var($_POST['moduloMesero'], FILTER_VALIDATE_BOOLEAN);
    $deshabilitar_excel = filter_var($_POST['deshabilitarExcel'], FILTER_VALIDATE_BOOLEAN);
    $efectivo       = filter_var($_POST['efectivo'], FILTER_VALIDATE_BOOLEAN);
    $tarjeta        = filter_var($_POST['tarjeta'], FILTER_VALIDATE_BOOLEAN);
    $transferencia  = filter_var($_POST['transferencia'], FILTER_VALIDATE_BOOLEAN);
    $contrasenaMesero = trim($_POST['contrasenaMesero']);
    $imagen = null;

    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
      $imagen = $_FILES['imagen'];
    }

    // 2️⃣ Validaciones
    if (empty($nombre)) {
      http_response_code(400);
      echo json_encode(['error' => 'Falta el nombre de la empresa.']);
      return;
    }

    try {
      // 3️⃣ Si hay imagen, la subimos y obtenemos la URL
      $logo_url = 'Archivo/Logos/Vacio.png';
      if ($imagen) {
        $logo_url = $this->subirLogo($nombre, $imagen);
      }

      // 4️⃣ Crear la empresa en la base de datos
      $empresa = $this->empresaRepositorio->crear($nombre, $logo_url, $telefono, $ubicacion, $tieneCarrito, $moduloMesero, $deshabilitar_excel, $efectivo, $tarjeta, $transferencia, $contrasenaMesero);

      // 5️⃣ Devolver respuesta
      http_response_code(200);
      echo json_encode([
        'id' => $empresa['id'],
        'nombre' => $empresa['nombre'],
        'telefono' => $empresa['telefono'],
        'ubicacion' => $empresa['ubicacion'],
        'tieneCarrito' => $empresa['tieneCarrito'],
        'moduloMesero' => $empresa['moduloMesero'],
        'unicoPrecio' => $empresa['unicoPrecio'],
        'deshabilitar_excel' => $empresa['deshabilitar_excel'],
        'efectivo' => $empresa['efectivo'],
        'tarjeta' => $empresa['tarjeta'],
        'transferencia' => $empresa['transferencia'],
        'fecha_creacion' => $empresa['fecha_creacion'],
        'logo_url' => $empresa['logo_url'],
        'contrasenaMesero' => $empresa['contrasenaMesero']
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al crear la empresa: ' . $e->getMessage()]);
    }
  }



  private function modificar(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($_POST['id'] ?? 0);
    $nombre = $_POST['nombre'];
    $ubicacion = $_POST['ubicacion'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $tieneCarrito = filter_var($_POST['tieneCarrito'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $moduloMesero = filter_var($_POST['moduloMesero'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $deshabilitar_excel = filter_var($_POST['deshabilitarExcel'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $efectivo = filter_var($_POST['efectivo'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $tarjeta = filter_var($_POST['tarjeta'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $transferencia = filter_var($_POST['transferencia'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $contrasenaMesero = trim($_POST['contrasenaMesero']);
    $imagen = null;

    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
      $imagen = $_FILES['imagen'];
    }



    if (empty($id_empresa) || empty($nombre)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para modificar la empresa.']);
      return;
    }


    try {
      // 3️⃣ Si hay imagen, la subimos y obtenemos la URL
      $logo_url = '';
      if ($imagen) {
        $logo_url = $this->subirLogo($nombre, $imagen);
      }

      $empresaModificada = $this->empresaRepositorio->modificar($id_empresa, $nombre, $ubicacion, $telefono, $tieneCarrito, $moduloMesero, $deshabilitar_excel, $efectivo, $tarjeta, $transferencia, $contrasenaMesero, $logo_url);

      // 🔥 Borrar caché para esta empresa
      $this->borrarCacheEmpresa($id_empresa);

      http_response_code(200);
      echo json_encode($empresaModificada);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al modificar la empresa: ' . $e->getMessage()]);
    }
  }

  private function modificarParaModerador(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)$datos['id'];
    $nombre = $datos['nombre'];
    $ubicacion = $datos['ubicacion'];
    $telefono = $datos['telefono'];
    $efectivo = $datos['efectivo'];
    $tarjeta = $datos['tarjeta'];
    $transferencia = $datos['transferencia'];
    $precio_delivery = $datos['precio_delivery'];
    $precio_espectaculo = $datos['precio_espectaculo'];
    $botonPedirCuenta = $datos['botonPedirCuenta'];
    $botonLlamarMesero = $datos['botonLlamarMesero'];
    $unicoPrecio = filter_var($datos['unicoPrecio'] ?? true, FILTER_VALIDATE_BOOLEAN);
    $contrasenaMesero = trim($datos['contrasenaMesero'] ?? '');

    if (empty($id_empresa) || empty($nombre)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para modificar la empresa.']);
      return;
    }


    try {
      $empresaModificada = $this->empresaRepositorio->modificarParaModerador($id_empresa, $nombre, $ubicacion, $telefono, $efectivo, $tarjeta, $transferencia, $precio_delivery, $precio_espectaculo, $botonPedirCuenta, $botonLlamarMesero, $unicoPrecio, $contrasenaMesero);

      // 🔥 Borrar caché para esta empresa
      $this->borrarCacheEmpresa($id_empresa);

      http_response_code(200);
      echo json_encode($empresaModificada);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al modificar la empresa: ' . $e->getMessage()]);
    }
  }


  private function modificarLogo(): void
  {

    $id = $_POST['id_empresa'];
    $nombre = $_POST['nombre'];
    $imagen = $_FILES['imagen'];

    $logo_url = $this->subirLogo($nombre, $imagen);

    if (is_null($logo_url)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos válidos para modificar la empresa con el id recibido']);
      return;
    }

    try {
      $empresaModificada = $this->empresaRepositorio->modificarLogo($id, $logo_url);
      $this->borrarCacheEmpresa((int)$id);
      echo json_encode($empresaModificada);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al modificar la empresa: ' . $e->getMessage()]);
    }
  }

  private function subirLogo(string $nombre, array $archivoImagen): string
  {
    // 1️⃣ Definir el directorio donde se guardarán los logos
    $directorioDestino = $_SERVER['DOCUMENT_ROOT'] . '/Archivos/Logos/Empresa/';

    // 2️⃣ Extensión del archivo original
    $extension = strtolower(pathinfo($archivoImagen['name'], PATHINFO_EXTENSION));

    // 3️⃣ Definir el nombre final del archivo
    // Reemplazamos espacios por guiones bajos para evitar problemas
    $nombreLimpio = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nombre);
    $nombreArchivo = $nombreLimpio . '.' . $extension;

    $rutaDestino = $directorioDestino . $nombreArchivo;

    // 4️⃣ Si ya existe un archivo con ese nombre, lo eliminamos
    if (file_exists($rutaDestino)) {
      unlink($rutaDestino);
    }

    // 5️⃣ Mover el archivo subido desde el temporal a la carpeta final
    if (!move_uploaded_file($archivoImagen['tmp_name'], $rutaDestino)) {
      throw new Exception('No se pudo mover el archivo subido.');
    }

    // 6️⃣ Construir la URL pública que se devolverá
    $logo_url = '/Archivos/Logos/Empresa/' . $nombreArchivo;

    return $logo_url;
  }



  private function borrarCacheEmpresa(int $id_empresa): void
  {
    $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/empresa_{$id_empresa}.json";

    if (file_exists($cacheFile)) {
      @unlink($cacheFile);
    }
  }

  private function guardarHorarios(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)$datos['id_empresa'];
    $horarios = $datos['horarios'];

    if (empty($id_empresa) || !is_array($horarios)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para guardar los horarios.']);
      return;
    }

    try {
      $this->empresaRepositorio->guardarHorarios($id_empresa, $horarios);
      $this->borrarCacheEmpresa($id_empresa);
      http_response_code(200);
      echo json_encode(true);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al guardar los horarios: ' . $e->getMessage()]);
    }
  }



  private function guardarDiasNoLaborales(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);
    $dias_no_laborales = $datos['dias_no_laborales'] ?? null;

    if (empty($id_empresa) || !is_array($dias_no_laborales)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para guardar los días no laborales.']);
      return;
    }

    try {
      $diasGuardados = $this->empresaRepositorio->guardarDiasNoLaborales($id_empresa, $dias_no_laborales);
      $this->borrarCacheEmpresa($id_empresa);
      http_response_code(200);
      echo json_encode([
        'message' => 'Días no laborales guardados correctamente.',
        'dias_no_laborales' => $diasGuardados
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al guardar los días no laborales: ' . $e->getMessage()]);
    }
  }


  private function guardarEspectaculos(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);
    $espectaculos = $datos['espectaculos'] ?? null;

    if (empty($id_empresa) || !is_array($espectaculos)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para guardar los espectáculos.']);
      return;
    }

    try {
      $espectaculosGuardados = $this->empresaRepositorio->guardarEspectaculos($id_empresa, $espectaculos);
      $this->borrarCacheEmpresa($id_empresa);
      http_response_code(200);
      echo json_encode([
        'message' => 'Espectaculos guardados correctamente.',
        'espectaculos' => $espectaculosGuardados
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al guardar los espectaculos: ' . $e->getMessage()]);
    }
  }

  private function guardarExcepcionesEspectaculos(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);
    $excepciones = $datos['excepciones'] ?? [];

    if (empty($id_empresa)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para guardar las excepciones habilitadas de espectáculos.']);
      return;
    }

    try {
      $excepcionesGuardadas = $this->empresaRepositorio->guardarExcepcionesEspectaculos($id_empresa, $excepciones);
      $this->borrarCacheEmpresa($id_empresa);
      http_response_code(200);
      echo json_encode([
        'message' => 'Excepciones habilitadas de espectáculos guardadas correctamente.',
        'excepciones_habilitadas' => $excepcionesGuardadas
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al guardar las excepciones habilitadas de espectáculos: ' . $e->getMessage()]);
    }
  }

  private function mostrarHorarios(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);

    if (empty($id_empresa)) {
      http_response_code(400);
      echo json_encode(['error' => 'Falta id_empresa para mostrar el horario de la empresa.']);
      return;
    }

    try {
      $diasNoLaborales = $this->empresaRepositorio->obtenerHorariosYDiasNoLaborales($id_empresa);
      http_response_code(200);
      echo json_encode($diasNoLaborales);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mostrar el horario: ' . $e->getMessage()]);
    }
  }

  private function mostrarEspectaculos(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);

    if (empty($id_empresa)) {
      http_response_code(400);
      echo json_encode(['error' => 'Falta id_empresa para mostrar los espectaculos de la empresa.']);
      return;
    }

    try {
      $espectaculos = $this->empresaRepositorio->obtenerEspectaculosYExcepciones($id_empresa);
      http_response_code(200);
      echo json_encode($espectaculos);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mostrar los espectaculos: ' . $e->getMessage()]);
    }
  }

  private function verificarContrasenaMesero(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);
    $contrasena = (string)($datos['contrasena'] ?? '');

    if (empty($id_empresa)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para validar contraseña de mesero.']);
      return;
    }

    try {
      $esValida = $this->empresaRepositorio->verificarContrasenaMesero($id_empresa, $contrasena);
      http_response_code(200);
      echo json_encode(['valida' => $esValida]);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al verificar contraseña de mesero: ' . $e->getMessage()]);
    }
  }

  private function registrarContrasenaCompartida(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);
    $contrasena = (string)($datos['contrasena'] ?? '');

    if (empty($id_empresa)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para registrar contraseña compartida.']);
      return;
    }

    try {
      $this->empresaRepositorio->registrarContrasenaCompartida($id_empresa, $contrasena);
      $this->borrarCacheEmpresa($id_empresa);
      http_response_code(200);
      echo json_encode(['message' => 'Contraseña compartida registrada correctamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al registrar contraseña compartida: ' . $e->getMessage()]);
    }
  }

  private function eliminarContrasenaCompartida(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);

    if (empty($id_empresa)) {
      http_response_code(400);
      echo json_encode(['error' => 'Falta id_empresa para eliminar la contrasena compartida.']);
      return;
    }

    try {
      $this->empresaRepositorio->eliminarContrasenaCompartida($id_empresa);
      $this->borrarCacheEmpresa($id_empresa);
      http_response_code(200);
      echo json_encode(['message' => 'Contraseña compartida eliminada correctamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al eliminar la contrasena compartida: ' . $e->getMessage()]);
    }
  }

  private function eliminarEmpresa(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);

    if (empty($id_empresa)) {
      http_response_code(400);
      echo json_encode(['error' => 'Falta id_empresa para eliminar la empresa.']);
      return;
    }

    try {
      $this->empresaRepositorio->eliminar($id_empresa);
      $this->borrarCacheEmpresa($id_empresa);
      http_response_code(200);
      echo json_encode(['message' => 'Empresa eliminada correctamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al eliminar la empresa: ' . $e->getMessage()]);
    }
  }
}
