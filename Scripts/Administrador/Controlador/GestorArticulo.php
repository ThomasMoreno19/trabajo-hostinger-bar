<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Repositorio/ArticuloRepositorio.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Repositorio/RubroRepositorio.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Incluye/Config.php';

class GestorArticulo
{
  private PDO $pdo;
  private ArticuloRepositorio $articuloRepositorio;
  private RubroRepositorio $rubroRepositorio;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
    $this->articuloRepositorio = new ArticuloRepositorio($pdo);
    $this->rubroRepositorio = new RubroRepositorio($pdo);
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

          case 'empresa':
            $this->mostrarTodosPorEmpresa();
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

      case 'importar-excel':
        $this->importarExcel();
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
        echo json_encode(['error' => 'Acción no encontrada para Articulo.']);
        break;
    }
  }


  private function mostrarTodos(): void
  {
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
        $articulo['precio1'] = number_format((float)$articulo['precio1'], 0, '', '.');
        $articulo['precio2'] = number_format((float)$articulo['precio2'], 0, '', '.');
        $articulo['precio3'] = number_format((float)$articulo['precio3'], 0, '', '.');
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

  private function mostrarTodosPorEmpresa(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);
    if ($id_empresa <= 0) {
      http_response_code(400);
      echo json_encode(['error' => 'Falta id_empresa para mostrar los artículos.']);
      return;
    }

    $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/articulos_empresa_{$id_empresa}.json";

    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TIME) {
      http_response_code(200);
      echo file_get_contents($cacheFile);
      return;
    }

    try {
      $listaArticulos = $this->articuloRepositorio->obtenerTodosPorEmpresa($id_empresa);

      foreach ($listaArticulos as &$articulo) {
        $articulo['precio1'] = number_format((float)$articulo['precio1'], 0, '', '.');
        $articulo['precio2'] = number_format((float)$articulo['precio2'], 0, '', '.');
        $articulo['precio3'] = number_format((float)$articulo['precio3'], 0, '', '.');
      }
      unset($articulo);

      $json = json_encode($listaArticulos);
      file_put_contents($cacheFile, $json);

      http_response_code(200);
      echo $json;
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mostrar artículos por empresa: ' . $e->getMessage()]);
    }
  }

  private function mostrarParaCliente(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id_empresa = (int)($datos['id_empresa'] ?? 0);
    if ($id_empresa <= 0) {
      http_response_code(400);
      echo json_encode(['error' => 'Falta id_empresa para mostrar los artículos.']);
      return;
    }

    $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/articulos_empresa_{$id_empresa}_cliente.json";

    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TIME) {
      http_response_code(200);
      echo file_get_contents($cacheFile);
      return;
    }

    try {
      $listaArticulos = $this->articuloRepositorio->obtenerParaCliente($id_empresa);

      foreach ($listaArticulos as &$articulo) {
        $articulo['precio1'] = number_format((float)$articulo['precio1'], 0, '', '.');
        $articulo['precio2'] = number_format((float)$articulo['precio2'], 0, '', '.');
        $articulo['precio3'] = number_format((float)$articulo['precio3'], 0, '', '.');
      }
      unset($articulo);

      $json = json_encode($listaArticulos);
      file_put_contents($cacheFile, $json);

      http_response_code(200);
      echo $json;
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al mostrar artículos por empresa: ' . $e->getMessage()]);
    }
  }

  private function cargarLista(): void
  {
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
        'precio1' => $articulo['precio1'],
        'precio2' => $articulo['precio2'],
        'precio3' => $articulo['precio3'],
        'codigo_carta' => $articulo['codigo_carta_articulo'] ?? '',
        'solo_mesero' => $articulo['publica_art'] ?? 0,
        'no_procesado' => $articulo['no_procesado'] ?? 0,
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

  private function importarExcel(): void
  {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
      http_response_code(405);
      header('Allow: POST');
      echo json_encode(['error' => 'Este endpoint solo acepta solicitudes POST.']);
      return;
    }

    try {
      $datos = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
      if (!is_array($datos)) {
        throw new InvalidArgumentException('El cuerpo de la solicitud debe ser un objeto JSON.');
      }

      $id_empresa = $this->enteroImportacion($datos['id_empresa'] ?? null, 'id_empresa');
      $modo = strtolower(trim((string)($datos['modo'] ?? '')));
      if (!in_array($modo, ['actualizar', 'sincronizar'], true)) {
        throw new InvalidArgumentException('El comando debe ser Actualizar o Sincronizar.');
      }

      $filas = $datos['filas'] ?? null;
      if (!is_array($filas) || count($filas) < 3) {
        throw new InvalidArgumentException('El Excel no contiene encabezados y artículos para importar.');
      }
      if (count($filas) > 20002 || array_values($filas) !== $filas) {
        throw new InvalidArgumentException('El Excel supera el límite de 20.000 artículos o tiene filas inválidas.');
      }

      $empresaStmt = $this->pdo->prepare('SELECT id, unicoPrecio FROM Empresa WHERE id = :id_empresa LIMIT 1');
      $empresaStmt->execute([':id_empresa' => $id_empresa]);
      $empresa = $empresaStmt->fetch(PDO::FETCH_ASSOC);
      if (!$empresa) {
        http_response_code(404);
        echo json_encode(['error' => "No existe la empresa {$id_empresa}."]);
        return;
      }

      $unicoPrecio = (bool)$empresa['unicoPrecio'];
      $this->validarEncabezadosExcel($filas[1] ?? null, $unicoPrecio);
      $maximoIndiceColumna = $unicoPrecio ? 7 : 9;
      $filasValidadas = [];
      $ids = [];

      foreach ($filas as $indice => $fila) {
        if ($indice < 2) {
          continue;
        }
        $numeroFila = $indice + 1;
        if (!is_array($fila)) {
          throw new InvalidArgumentException("La fila {$numeroFila} no tiene un formato válido.");
        }
        if (!$this->filaExcelTieneDatos($fila)) {
          continue;
        }

        for ($columna = $maximoIndiceColumna + 1; $columna < count($fila); $columna++) {
          if ($this->tieneValorExcel($fila[$columna] ?? null)) {
            $plantilla = $unicoPrecio ? 'Articulos1Importe.xlsx' : 'Articulos.xlsx';
            throw new InvalidArgumentException(
              "La fila {$numeroFila} tiene datos en columnas que no corresponden al formato de la empresa. Usá {$plantilla}."
            );
          }
        }

        $indiceRubro = $unicoPrecio ? 3 : 5;
        $indicesObligatorios = $unicoPrecio ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5];
        foreach ($indicesObligatorios as $indiceColumna) {
          if (!$this->tieneValorExcel($fila[$indiceColumna] ?? null)) {
            $plantilla = $unicoPrecio ? 'Articulos1Importe.xlsx' : 'Articulos.xlsx';
            throw new InvalidArgumentException(
              "La fila {$numeroFila} no tiene todas las columnas requeridas para esta empresa. Usá {$plantilla}."
            );
          }
        }

        $id = $this->enteroImportacion($fila[0] ?? null, "Código del artículo en la fila {$numeroFila}");
        if (isset($ids[$id])) {
          throw new InvalidArgumentException("El ID {$id} está repetido en el Excel.");
        }
        $ids[$id] = true;

        $nombre = $this->textoImportacion($fila[1] ?? null, "nombre del artículo en la fila {$numeroFila}");
        $rubro = $this->textoImportacion($fila[$indiceRubro] ?? null, "rubro en la fila {$numeroFila}");
        if ($nombre === '' || $rubro === '') {
          throw new InvalidArgumentException("La fila {$numeroFila} debe incluir el nombre del artículo y el rubro.");
        }

        $indiceDescripcion = $unicoPrecio ? 4 : 6;
        $indicePublicaArticulo = $unicoPrecio ? 5 : 7;
        $indicePublicaRubro = $unicoPrecio ? 6 : 8;
        $indiceNoProcesado = $unicoPrecio ? 7 : 9;
        $precio1 = $this->numeroImportacion($fila[2] ?? null, "precio 1 en la fila {$numeroFila}");
        $precio2 = $unicoPrecio
          ? $precio1
          : $this->numeroImportacion($fila[3] ?? null, "precio 2 en la fila {$numeroFila}");
        $precio3 = $unicoPrecio
          ? $precio1
          : $this->numeroImportacion($fila[4] ?? null, "precio 3 en la fila {$numeroFila}");
        $descripcion = $this->textoImportacion($fila[$indiceDescripcion] ?? '', "composición en la fila {$numeroFila}");
        $descripcion = preg_replace('/[\r\n]+/', ', ', $descripcion);

        $filasValidadas[] = [
          'id' => $id,
          'nombre' => $nombre,
          'descripcion' => $descripcion,
          'rubro' => $rubro,
          'precio1' => $precio1,
          'precio2' => $precio2,
          'precio3' => $precio3,
          'codigo_carta' => '',
          'solo_mesero' => $this->banderaImportacion($fila[$indicePublicaArticulo] ?? 0, "PUBLICA ART en la fila {$numeroFila}"),
          'solo_mesero_rubro' => $this->banderaImportacion($fila[$indicePublicaRubro] ?? 0, "PUBLICA RUB en la fila {$numeroFila}"),
          'no_procesado' => $this->banderaImportacion($fila[$indiceNoProcesado] ?? 0, "NO PROCESA en la fila {$numeroFila}"),
        ];
      }

      if (!$filasValidadas) {
        throw new InvalidArgumentException('No se encontraron artículos en las filas posteriores a los encabezados.');
      }

      $this->pdo->beginTransaction();
      $eliminados = ['articulos' => 0, 'rubros' => 0];
      if ($modo === 'sincronizar') {
        $marcarRubros = $this->pdo->prepare(
          'UPDATE Rubro SET aparece_en_csv = 0 WHERE id_empresa = :id_empresa AND creado_en_pagina = 0'
        );
        $marcarRubros->execute([':id_empresa' => $id_empresa]);

        $marcarArticulos = $this->pdo->prepare(
          'UPDATE Articulo SET aparece_en_csv = 0 WHERE id_empresa = :id_empresa AND creado_en_pagina = 0'
        );
        $marcarArticulos->execute([':id_empresa' => $id_empresa]);
      }

      $buscarRubro = $this->pdo->prepare(
        'SELECT id FROM Rubro WHERE nombre = :nombre AND id_empresa = :id_empresa LIMIT 1'
      );
      $crearRubro = $this->pdo->prepare(
        "INSERT INTO Rubro (nombre, id_empresa, logo_url, solo_mesero, fecha_eliminado, aparece_en_csv, creado_en_pagina)
         VALUES (:nombre, :id_empresa, '/Archivos/Logos/Vacio.png', :solo_mesero, '', 1, 0)"
      );
      $actualizarRubro = $this->pdo->prepare(
        'UPDATE Rubro SET solo_mesero = :solo_mesero, aparece_en_csv = 1 WHERE id = :id AND id_empresa = :id_empresa'
      );
      $guardarArticulo = $this->pdo->prepare(
         "INSERT INTO Articulo (
            id, id_rubro, id_empresa, nombre, descripcion, precio1, precio2, precio3,
            codigo_carta, solo_mesero, no_procesado, aparece_en_csv, creado_en_pagina, logo_url, video_url
          ) VALUES (
            :id, :id_rubro, :id_empresa, :nombre, :descripcion, :precio1, :precio2, :precio3,
            :codigo_carta, :solo_mesero, :no_procesado, 1, 0, '/Archivos/Logos/Vacio.png', NULL
          ) ON DUPLICATE KEY UPDATE
           id_rubro = VALUES(id_rubro),
           id_empresa = VALUES(id_empresa),
           nombre = VALUES(nombre),
           descripcion = VALUES(descripcion),
           precio1 = VALUES(precio1),
           precio2 = VALUES(precio2),
           precio3 = VALUES(precio3),
           codigo_carta = VALUES(codigo_carta),
           solo_mesero = VALUES(solo_mesero),
           no_procesado = VALUES(no_procesado),
           aparece_en_csv = 1"
      );

      foreach ($filasValidadas as $articulo) {
        $buscarRubro->execute([
          ':nombre' => $articulo['rubro'],
          ':id_empresa' => $id_empresa,
        ]);
        $id_rubro = $buscarRubro->fetchColumn();

        if ($id_rubro === false) {
          $crearRubro->execute([
            ':nombre' => $articulo['rubro'],
            ':id_empresa' => $id_empresa,
            ':solo_mesero' => $articulo['solo_mesero_rubro'],
          ]);
          $id_rubro = (int)$this->pdo->lastInsertId();
        } else {
          $id_rubro = (int)$id_rubro;
          $actualizarRubro->execute([
            ':solo_mesero' => $articulo['solo_mesero_rubro'],
            ':id' => $id_rubro,
            ':id_empresa' => $id_empresa,
          ]);
        }

        $guardarArticulo->execute([
          ':id' => $articulo['id'],
          ':id_rubro' => $id_rubro,
          ':id_empresa' => $id_empresa,
          ':nombre' => $articulo['nombre'],
          ':descripcion' => $articulo['descripcion'],
          ':precio1' => (string)$articulo['precio1'],
          ':precio2' => (string)$articulo['precio2'],
          ':precio3' => (string)$articulo['precio3'],
          ':codigo_carta' => $articulo['codigo_carta'],
          ':solo_mesero' => $articulo['solo_mesero'],
          ':no_procesado' => $articulo['no_procesado'],
        ]);
      }

      if ($modo === 'sincronizar') {
        $contarArticulos = $this->pdo->prepare(
          'SELECT COUNT(*) FROM Articulo WHERE id_empresa = :id_empresa AND aparece_en_csv = 0 AND creado_en_pagina = 0'
        );
        $contarArticulos->execute([':id_empresa' => $id_empresa]);
        $eliminados['articulos'] = (int)$contarArticulos->fetchColumn();

        $contarRubros = $this->pdo->prepare(
          'SELECT COUNT(*) FROM Rubro WHERE id_empresa = :id_empresa AND aparece_en_csv = 0 AND creado_en_pagina = 0'
        );
        $contarRubros->execute([':id_empresa' => $id_empresa]);
        $eliminados['rubros'] = (int)$contarRubros->fetchColumn();

        $borrarArticulos = $this->pdo->prepare(
          'DELETE FROM Articulo WHERE id_empresa = :id_empresa AND aparece_en_csv = 0 AND creado_en_pagina = 0'
        );
        $borrarArticulos->execute([':id_empresa' => $id_empresa]);

        $borrarRubros = $this->pdo->prepare(
          'DELETE FROM Rubro WHERE id_empresa = :id_empresa AND aparece_en_csv = 0 AND creado_en_pagina = 0'
        );
        $borrarRubros->execute([':id_empresa' => $id_empresa]);
      }

      $this->pdo->commit();
      $this->borrarCacheImportacion($id_empresa);

      echo json_encode([
        'modo' => $modo,
        'procesados' => count($filasValidadas),
        'eliminados' => $eliminados,
      ]);
    } catch (JsonException $e) {
      http_response_code(400);
      echo json_encode(['error' => 'El cuerpo de la solicitud no contiene JSON válido.']);
    } catch (InvalidArgumentException $e) {
      http_response_code(400);
      echo json_encode(['error' => $e->getMessage()]);
    } catch (Throwable $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      error_log('Error al importar artículos desde Excel: ' . $e->getMessage());
      http_response_code(500);
      echo json_encode(['error' => 'No se pudo completar la importación: ' . $e->getMessage()]);
    }
  }

  private function enteroImportacion($valor, string $campo): int
  {
    if (is_int($valor) && $valor > 0) {
      return $valor;
    }
    if (is_float($valor) && is_finite($valor) && floor($valor) === $valor && $valor > 0 && $valor <= PHP_INT_MAX) {
      return (int)$valor;
    }
    if (is_string($valor) && preg_match('/^[1-9][0-9]*$/', trim($valor))) {
      $entero = filter_var(trim($valor), FILTER_VALIDATE_INT);
      if ($entero !== false && $entero > 0) {
        return $entero;
      }
    }
    throw new InvalidArgumentException("{$campo} debe ser un entero positivo.");
  }

  private function validarEncabezadosExcel($encabezados, bool $unicoPrecio): void
  {
    if (!is_array($encabezados)) {
      throw new InvalidArgumentException('No se encontró la fila de encabezados del Excel.');
    }

    $plantilla = $unicoPrecio ? 'Articulos1Importe.xlsx' : 'Articulos.xlsx';
    $esperados = [
      0 => [['codigo', 'codigoarticulo', 'id'], 'código'],
      1 => [['descripcion', 'articulo', 'nombre', 'nombrearticulo'], 'descripción'],
    ];
    if ($unicoPrecio) {
      $esperados[2] = [['importe', 'precio'], 'importe'];
      $esperados[3] = [['rubro', 'categoria'], 'rubro'];
      $opcionales = [
        4 => [['composicion', 'detalle', 'observaciones'], 'composición'],
        5 => [['publicaart', 'publicaarticulo'], 'PUBLICA ART'],
        6 => [['publicarub', 'publicarubro'], 'PUBLICA RUB'],
        7 => [['noprocesa', 'noprocesado', 'noprocesar'], 'NO PROCESA'],
      ];
      $maximaColumna = 7;
    } else {
      $esperados[2] = [['importe', 'importe1', 'precio', 'precio1'], 'precio 1'];
      $esperados[3] = [['importe', 'importe2', 'precio', 'precio2'], 'precio 2'];
      $esperados[4] = [['importe', 'importe3', 'precio', 'precio3'], 'precio 3'];
      $esperados[5] = [['rubro', 'categoria'], 'rubro'];
      $opcionales = [
        6 => [['composicion', 'detalle', 'observaciones'], 'composición'],
        7 => [['publicaart', 'publicaarticulo'], 'PUBLICA ART'],
        8 => [['publicarub', 'publicarubro'], 'PUBLICA RUB'],
        9 => [['noprocesa', 'noprocesado', 'noprocesar'], 'NO PROCESA'],
      ];
      $maximaColumna = 9;
    }

    foreach ($esperados as $indice => [$nombresAceptados, $nombreColumna]) {
      $actual = $this->normalizarEncabezadoExcel($encabezados[$indice] ?? null);
      if (!in_array($actual, $nombresAceptados, true)) {
        throw new InvalidArgumentException(
          'La columna ' . ($indice + 1) . " debe ser {$nombreColumna} para la configuración de esta empresa. Usá {$plantilla}."
        );
      }
    }

    foreach ($opcionales as $indice => [$nombresAceptados, $nombreColumna]) {
      $valor = $encabezados[$indice] ?? null;
      if (!$this->tieneValorExcel($valor)) {
        continue;
      }
      $actual = $this->normalizarEncabezadoExcel($valor);
      if (!in_array($actual, $nombresAceptados, true)) {
        throw new InvalidArgumentException(
          'La columna ' . ($indice + 1) . " ({$actual}) no corresponde a {$nombreColumna} en {$plantilla}."
        );
      }
    }

    for ($indice = $maximaColumna + 1; $indice < count($encabezados); $indice++) {
      if ($this->tieneValorExcel($encabezados[$indice] ?? null)) {
        throw new InvalidArgumentException(
          "El Excel tiene columnas adicionales que no corresponden a {$plantilla}."
        );
      }
    }
  }

  private function normalizarEncabezadoExcel($valor): string
  {
    if (!is_scalar($valor)) {
      return '';
    }
    $texto = strtr(trim((string)$valor), [
      'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ü' => 'U', 'Ñ' => 'N',
      'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
    ]);
    return strtolower((string)preg_replace('/[^a-zA-Z0-9]+/', '', $texto));
  }

  private function filaExcelTieneDatos(array $fila): bool
  {
    foreach ($fila as $valor) {
      if ($this->tieneValorExcel($valor)) {
        return true;
      }
    }
    return false;
  }

  private function tieneValorExcel($valor): bool
  {
    if ($valor === null) {
      return false;
    }
    if (!is_scalar($valor)) {
      return true;
    }
    return $valor !== null && trim((string)$valor) !== '';
  }

  private function textoImportacion($valor, string $campo): string
  {
    if ($valor === null) {
      return '';
    }
    if (!is_scalar($valor)) {
      throw new InvalidArgumentException("El campo {$campo} debe ser texto.");
    }
    return trim((string)$valor);
  }

  private function numeroImportacion($valor, string $campo): float
  {
    if (is_string($valor)) {
      $valor = str_replace(['$', ' ', "\xc2\xa0"], '', trim($valor));
      if (strpos($valor, ',') !== false && strpos($valor, '.') !== false) {
        if (strrpos($valor, ',') > strrpos($valor, '.')) {
          $valor = str_replace('.', '', $valor);
          $valor = str_replace(',', '.', $valor);
        } else {
          $valor = str_replace(',', '', $valor);
        }
      } elseif (strpos($valor, ',') !== false) {
        $valor = str_replace(',', '.', $valor);
      }
    }
    if (is_bool($valor) || !is_numeric($valor) || !is_finite((float)$valor)) {
      throw new InvalidArgumentException("{$campo} debe ser un número válido.");
    }
    return (float)$valor;
  }

  private function banderaImportacion($valor, string $campo): int
  {
    if (is_bool($valor)) {
      return $valor ? 1 : 0;
    }
    if (is_numeric($valor) && ((float)$valor === 0.0 || (float)$valor === 1.0)) {
      return (int)$valor;
    }

    $texto = strtolower(trim((string)$valor));
    if (in_array($texto, ['true', 'verdadero', 'si', 'sí'], true)) {
      return 1;
    }
    if (in_array($texto, ['false', 'falso', 'no', ''], true)) {
      return 0;
    }
    throw new InvalidArgumentException("{$campo} debe indicar 0 o 1.");
  }

  private function borrarCacheImportacion(int $id_empresa): void
  {
    $this->borrarCacheTodos($id_empresa);
    $cacheDir = $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Cache/';
    foreach ([
      "rubros_empresa_{$id_empresa}.json",
      "rubros_empresa_{$id_empresa}_cliente.json",
    ] as $nombreArchivo) {
      $archivo = $cacheDir . $nombreArchivo;
      if (is_file($archivo)) {
        @unlink($archivo);
      }
    }
  }

  private function borrarCacheTodos(int $id_empresa): void
  {
    $cacheDir = $_SERVER['DOCUMENT_ROOT'] . "/Scripts/Cache/";
    $pattern = $cacheDir . "articulos_rubro_*_empresa_{$id_empresa}.json";

    $archivos = glob($pattern);
    if ($archivos) {
      foreach ($archivos as $archivo) {
        if (file_exists($archivo)) {
          @unlink($archivo); // el @ evita warnings si ya fue borrado
        }
      }
    }

    $cacheEmpresa = $cacheDir . "articulos_empresa_{$id_empresa}.json";
    $cacheCliente = $cacheDir . "articulos_empresa_{$id_empresa}_cliente.json";
    if (file_exists($cacheEmpresa)) {
      @unlink($cacheEmpresa);
    }
    if (file_exists($cacheCliente)) {
      @unlink($cacheCliente);
    }
  }

  private function subirVideo(): void
  {
    // Al usar FormData en JS, los campos de texto viajan en $_POST
    if (empty($_POST['id_articulo']) || empty($_POST['id_empresa']) || empty($_FILES['archivo']['tmp_name'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos obligatorios o el archivo de video.']);
      return;
    }

    $id_articulo = (int)$_POST['id_articulo'];
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

    $nombreArchivo = $nombreBase . "-articulo" . $id_articulo . "_empresa" . $id_empresa . $extension;
    $rutaDestino = $directorioDestino . $nombreArchivo;

    if (move_uploaded_file($_FILES['archivo']['tmp_name'], $rutaDestino)) {
      // Nueva URL relativa para almacenar en la BD
      $video_url = '/Archivos/Videos/' . $id_empresa . '/' . $nombreArchivo;

      // Guardar en la base de datos a través del repositorio
      $guardadoExitoso = $this->articuloRepositorio->agregarUrlVideo($id_articulo, $id_empresa, $video_url);

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

    $id_articulo = $datos['id_articulo'];
    $id_empresa = $datos['id_empresa'];
    $video_url = $datos['video_url'];

    if ($video_url) {
      $rutaVideo = $_SERVER['DOCUMENT_ROOT'] . $video_url;
      if (file_exists($rutaVideo) && is_file($rutaVideo)) {
        unlink($rutaVideo);
      }
    }


    $guardadoExitoso = $this->articuloRepositorio->eliminarUrlVideo($id_articulo, $id_empresa, $video_url);

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

  private function modificar(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id = $datos['id'];
    $id_rubro = $datos['id_rubro'];
    $id_empresa = $datos['id_empresa'];
    $nombre = $datos['nombre'];
    $descripcion = $datos['descripcion'];
    $precio1 = $datos['precio1'];
    $precio2 = $datos['precio2'];
    $precio3 = $datos['precio3'];
    $codigo_carta = $datos['codigo_carta'];


    $cacheFile = $_SERVER['DOCUMENT_ROOT'] . "/cache/articulos_empresa_{$id_empresa}.json";
    if (file_exists($cacheFile)) {
      unlink($cacheFile); // Borra cache
    }

    if (empty($nombre) || empty($id) || empty($id_rubro) || empty($precio1) || empty($precio2) || empty($precio3)) {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos válidos para modificar el articulo con el id recibido']);
      return;
    }

    try {
      $articuloModificado = $this->articuloRepositorio->modificar($id, $id_rubro, $nombre, $descripcion, $precio1, $precio2, $precio3, $codigo_carta);
      $this->borrarCacheTodos($id_empresa);
      echo json_encode($articuloModificado);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al modificar el articulo: ' . $e->getMessage()]);
    }
  }

  private function eliminar(): void
  {
    $datos = json_decode(file_get_contents('php://input'), true);

    $id = $datos['id'];
    $id_empresa = $datos['id_empresa'];
    try {
      $eliminado = $this->articuloRepositorio->eliminar($id, $id_empresa);
      if ($eliminado) {
        $this->borrarCacheTodos($id_empresa);
        http_response_code(200);
        echo json_encode(['success' => true]);
      } else {
        http_response_code(404);
        echo json_encode(['error' => 'Artículo no encontrado o ya eliminado.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al eliminar el artículo: ' . $e->getMessage()]);
    }
  }
}
