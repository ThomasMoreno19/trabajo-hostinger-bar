<?php
// Scripts/Administrador/Modelo/Repositorio/EmpresaRepositorio.php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Entidad/EmpresaEntidad.php';

class EmpresaRepositorio
{
  private $pdo;
  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
  }

  public function obtenerPorId(int $id): ?array
  {
    $stmt = $this->pdo->prepare("
      SELECT 
        *,
        (contrasenaMesero IS NOT NULL AND contrasenaMesero <> '') AS tieneContrasenaMesero
      FROM Empresa 
      WHERE id = :id
    ");

    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($data) {
      return $empresa = [
        'id' => $data['id'],
        'nombre' => $data['nombre'],
        'logo_url' => $data['logo_url'],
        'telefono' => $data['telefono'],
        'ubicacion' => $data['ubicacion'],
        'tieneCarrito' => $data['tieneCarrito'],
        'moduloMesero' => $data['moduloMesero'],
        'unicoPrecio' => (bool)$data['unicoPrecio'],
        'deshabilitarExcel' => $data['deshabilitar_excel'],
        'efectivo' => $data['efectivo'],
        'tarjeta' => $data['tarjeta'],
        'transferencia' => $data['transferencia'],
        'precio_delivery' => $data['precio_delivery'],
        'precio_espectaculo' => $data['precio_espectaculo'],
        'botonPedirCuenta' => $data['botonPedirCuenta'],
        'botonLlamarMesero' => $data['botonLlamarMesero'],
        'fecha_creacion' => $data['fecha_creacion'],
        'tieneContrasenaMesero' => (bool)$data['tieneContrasenaMesero'],
      ];
    }

    return null;
  }

  public function obtenerTodas(): array
  {
    $empresas = [];
    try {
      $stmt = $this->pdo->query(
        "SELECT * FROM Empresa ORDER BY nombre ASC;"
      );
      while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $empresas[] = [
          'id' => $data['id'],
          'nombre' => $data['nombre'],
          'telefono' => $data['telefono'],
          'ubicacion' => $data['ubicacion'],
          'tieneCarrito' => $data['tieneCarrito'],
          'moduloMesero' => $data['moduloMesero'],
          'unicoPrecio' => (bool)$data['unicoPrecio'],
          'deshabilitarExcel' => $data['deshabilitar_excel'],
          'efectivo' => $data['efectivo'],
          'tarjeta' => $data['tarjeta'],
          'transferencia' => $data['transferencia'],
          'logo_url' => $data['logo_url'],
          'fecha_creacion' => $data['fecha_creacion'],
        ];
      }
    } catch (PDOException $e) {
      error_log("Error al obtener todas las empresas: " . $e->getMessage());
    }
    return $empresas;
  }

  public function modificar(int $id, string $nombre, string $ubicacion, string $telefono, bool $tieneCarrito, bool $moduloMesero, bool $deshabilitar_excel, bool $efectivo, bool $tarjeta, bool $transferencia, ?string $contrasenaMesero = null, ?string $logo_url = null): bool
  {
    try {
      $sql = "UPDATE Empresa
          SET nombre = :nombre,
          telefono = :telefono,
          ubicacion = :ubicacion,
          tieneCarrito = :tieneCarrito,
          moduloMesero = :moduloMesero,
          deshabilitar_excel = :deshabilitar_excel,
          efectivo = :efectivo,
          tarjeta = :tarjeta,
          transferencia = :transferencia";

      if ($contrasenaMesero !== null && $contrasenaMesero !== '') {
        $sql .= ", contrasenaMesero = :contrasenaMesero";
      }

      if ($logo_url !== null && $logo_url !== '') {
        $sql .= ", logo_url = :logo_url";
      }

      $sql .= " WHERE id = :id;";

      $stmt = $this->pdo->prepare($sql);

      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
      $stmt->bindParam(':telefono', $telefono, PDO::PARAM_STR);
      $stmt->bindParam(':ubicacion', $ubicacion, PDO::PARAM_STR);
      $stmt->bindParam(':tieneCarrito', $tieneCarrito, PDO::PARAM_BOOL);
      $stmt->bindParam(':moduloMesero', $moduloMesero, PDO::PARAM_BOOL);
      $stmt->bindParam(':deshabilitar_excel', $deshabilitar_excel, PDO::PARAM_BOOL);
      $stmt->bindParam(':efectivo', $efectivo, PDO::PARAM_BOOL);
      $stmt->bindParam(':tarjeta', $tarjeta, PDO::PARAM_BOOL);
      $stmt->bindParam(':transferencia', $transferencia, PDO::PARAM_BOOL);

      if ($contrasenaMesero !== null && $contrasenaMesero !== '') {
        $contrasenaMeseroHash = password_hash($contrasenaMesero, PASSWORD_DEFAULT);
        $stmt->bindParam(':contrasenaMesero', $contrasenaMeseroHash, PDO::PARAM_STR);
      }

      if ($logo_url !== null && $logo_url !== '') {
        $stmt->bindParam(':logo_url', $logo_url, PDO::PARAM_STR);
      }

      return $stmt->execute();
    } catch (PDOException $e) {
      error_log("Error al modificar la empresa: " . $e->getMessage());
      return false;
      return false;
    }
  }

  public function modificarParaModerador(int $id, string $nombre, string $ubicacion, string $telefono, bool $efectivo, bool $tarjeta, bool $transferencia, int $precio_delivery, int $precio_espectaculo, bool $botonPedirCuenta, bool $botonLlamarMesero, bool $unicoPrecio, ?string $contrasenaMesero = null): bool
  {
    try {
      $sql = "UPDATE Empresa
          SET nombre = :nombre,
          telefono = :telefono,
          ubicacion = :ubicacion,
          efectivo = :efectivo,
          tarjeta = :tarjeta,
          transferencia = :transferencia,
          precio_delivery = :precio_delivery,
          precio_espectaculo = :precio_espectaculo,
          botonPedirCuenta = :botonPedirCuenta,
          botonLlamarMesero = :botonLlamarMesero,
          unicoPrecio = :unicoPrecio";

      if ($contrasenaMesero !== null && $contrasenaMesero !== '') {
        $sql .= ", contrasenaMesero = :contrasenaMesero";
      }

      $sql .= " WHERE id = :id;";

      $stmt = $this->pdo->prepare($sql);

      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
      $stmt->bindParam(':telefono', $telefono, PDO::PARAM_STR);
      $stmt->bindParam(':ubicacion', $ubicacion, PDO::PARAM_STR);
      $stmt->bindParam(':efectivo', $efectivo, PDO::PARAM_BOOL);
      $stmt->bindParam(':tarjeta', $tarjeta, PDO::PARAM_BOOL);
      $stmt->bindParam(':transferencia', $transferencia, PDO::PARAM_BOOL);
      $stmt->bindParam(':precio_delivery', $precio_delivery, PDO::PARAM_INT);
      $stmt->bindParam(':precio_espectaculo', $precio_espectaculo, PDO::PARAM_INT);
      $stmt->bindParam(':botonPedirCuenta', $botonPedirCuenta, PDO::PARAM_BOOL);
      $stmt->bindParam(':botonLlamarMesero', $botonLlamarMesero, PDO::PARAM_BOOL);
      $stmt->bindParam(':unicoPrecio', $unicoPrecio, PDO::PARAM_BOOL);
      if ($contrasenaMesero !== null && $contrasenaMesero !== '') {
        $contrasenaMeseroHash = password_hash($contrasenaMesero, PASSWORD_DEFAULT);
        $stmt->bindParam(':contrasenaMesero', $contrasenaMeseroHash, PDO::PARAM_STR);
      }

      return $stmt->execute();
    } catch (PDOException $e) {
      error_log("Error al modificar la empresa: " . $e->getMessage());
      return false;
    }
  }

  public function modificarLogo(int $id, string $logo_url): ?array
  {
    try {
      $stmt = $this->pdo->prepare(
        "UPDATE Empresa
          SET logo_url = :logo_url
          WHERE id = :id;"
      );


      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->bindParam(':logo_url', $logo_url, PDO::PARAM_STR);

      if ($stmt->execute()) {
        return [
          'id' => $id,
          'logo_url' => $logo_url
        ];
      } else {
        error_log("Falló la ejecución del UPDATE en modificarLogo().");
      }
    } catch (PDOException $e) {
      error_log("Error al modificar el logo de la empresa: " . $e->getMessage());
    }
    return null;
  }

  public function crear(string $nombre, string $logo_url, string $telefono, string $ubicacion, bool $tieneCarrito, bool $moduloMesero, bool $deshabilitar_excel, bool $efectivo, bool $tarjeta, bool $transferencia, string $contrasenaMesero): array
  {
    try {
      $fecha_actual = date('Y-m-d');
      $fecha_actual = date('Y-m-d');
      $stmt = $this->pdo->prepare(
        "INSERT INTO Empresa (nombre, fecha_creacion, logo_url, telefono, ubicacion, tieneCarrito, moduloMesero, unicoPrecio, deshabilitar_excel, efectivo, tarjeta, transferencia, precio_delivery, precio_espectaculo, contrasenaMesero)
        VALUES (:nombre, :fecha_actual, :logo_url, :telefono, :ubicacion, :tieneCarrito, :moduloMesero, 1, :deshabilitar_excel, :efectivo, :tarjeta, :transferencia, 1, 1, :contrasenaMesero)"
      );
      $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
      $stmt->bindParam(':logo_url', $logo_url, PDO::PARAM_STR);
      $stmt->bindParam(':telefono', $telefono, PDO::PARAM_STR);
      $stmt->bindParam(':ubicacion', $ubicacion, PDO::PARAM_STR);
      $stmt->bindParam(':tieneCarrito', $tieneCarrito, PDO::PARAM_BOOL);
      $stmt->bindParam(':moduloMesero', $moduloMesero, PDO::PARAM_BOOL);
      $stmt->bindParam(':deshabilitar_excel', $deshabilitar_excel, PDO::PARAM_BOOL);
      $stmt->bindParam(':efectivo', $efectivo, PDO::PARAM_BOOL);
      $stmt->bindParam(':tarjeta', $tarjeta, PDO::PARAM_BOOL);
      $stmt->bindParam(':transferencia', $transferencia, PDO::PARAM_BOOL);
      $contrasenaMeseroHash = password_hash($contrasenaMesero, PASSWORD_DEFAULT);
      $stmt->bindParam(':contrasenaMesero', $contrasenaMeseroHash, PDO::PARAM_STR);
      $stmt->bindParam(':fecha_actual', $fecha_actual, PDO::PARAM_STR);
      $stmt->execute();


      $id = $this->pdo->lastInsertId();
      $stmt = $this->pdo->prepare("SELECT * FROM Empresa WHERE id = :id");
      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->execute();


      $data = $stmt->fetch(PDO::FETCH_ASSOC);



      if ($data) {
        return [
          'id' => $data['id'],
          'nombre' => $data['nombre'],
          'fecha_creacion' => $data['fecha_creacion'],
          'logo_url' => $data['logo_url'],
          'telefono' => $data['telefono'],
          'ubicacion' => $data['ubicacion'],
          'tieneCarrito' => $data['tieneCarrito'],
          'moduloMesero' => $data['moduloMesero'],
          'unicoPrecio' => (bool)$data['unicoPrecio'],
          'deshabilitar_excel' => $data['deshabilitar_excel'],
          'efectivo' => $data['efectivo'],
          'tarjeta' => $data['tarjeta'],
          'transferencia' => $data['transferencia'],
          'precio_delivery' => $data['precio_delivery'],
          'precio_espectaculo' => $data['precio_espectaculo'],
          'contrasenaMesero' => $data['contrasenaMesero'],
        ];
      }
    } catch (PDOException $e) {
      error_log("Error al guardar nueva empresa: " . $e->getMessage());
    }
    return [];
  }

  public function guardarHorarios(int $id_empresa, array $horarios): bool
  {
    try {
      $this->pdo->beginTransaction();

      // 1) Borrar horarios anteriores
      $stmtDelete = $this->pdo->prepare(
        "DELETE FROM horarios_empresa WHERE id_empresa = :id_empresa"
      );
      $stmtDelete->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmtDelete->execute();

      // 2) Preparar insert
      $stmtInsert = $this->pdo->prepare(
        "INSERT INTO horarios_empresa (id_empresa, dia_semana, hora_apertura, hora_cierre)
        VALUES (:id_empresa, :dia_semana, :hora_apertura, :hora_cierre)"
      );

      // 3) Recorrer tu payload agrupado
      foreach ($horarios as $diaObj) {

        if (!isset($diaObj['diaIndex'], $diaObj['rangos']) || !is_array($diaObj['rangos'])) {
          throw new Exception("Formato de horario inválido (día sin rangos).");
        }

        $dia_semana = (int)$diaObj['diaIndex'];

        if ($dia_semana < 0 || $dia_semana > 6) {
          throw new Exception("Día inválido: $dia_semana");
        }

        foreach ($diaObj['rangos'] as $rango) {

          if (!isset($rango['apertura'], $rango['cierre'])) {
            throw new Exception("Formato de rango inválido.");
          }

          $apertura = $rango['apertura'];
          $cierre = $rango['cierre'];

          $stmtInsert->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
          $stmtInsert->bindParam(':dia_semana', $dia_semana, PDO::PARAM_INT);
          $stmtInsert->bindParam(':hora_apertura', $apertura, PDO::PARAM_STR);
          $stmtInsert->bindParam(':hora_cierre', $cierre, PDO::PARAM_STR);

          $stmtInsert->execute();
        }
      }

      $this->pdo->commit();
      return true;
    } catch (Exception $e) {
      $this->pdo->rollBack();
      error_log("Error al guardar horarios (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function guardarDiasNoLaborales(int $id_empresa, array $dias_no_laborales): array
  {
    try {
      $this->pdo->beginTransaction();

      // Reemplazar la lista completa de la empresa.
      $stmtDelete = $this->pdo->prepare(
        "DELETE FROM dias_no_laborales_empresa
        WHERE id_empresa = :id_empresa"
      );
      $stmtDelete->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmtDelete->execute();

      $stmtInsert = $this->pdo->prepare(
        "INSERT INTO dias_no_laborales_empresa (id_empresa, dia_mes)
        VALUES (:id_empresa, :dia_mes)"
      );

      $diasLimpios = [];

      foreach ($dias_no_laborales as $dia_mes) {
        if (!is_string($dia_mes) || !preg_match('/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/', $dia_mes)) {
          throw new Exception("Formato inválido de día no laboral: $dia_mes");
        }

        $diasLimpios[$dia_mes] = true;
      }

      $diasOrdenados = array_keys($diasLimpios);
      usort($diasOrdenados, function ($a, $b) {
        [$da, $ma, $ya] = explode('/', $a);
        [$db, $mb, $yb] = explode('/', $b);

        if ((int)$ma !== (int)$mb) return (int)$ma - (int)$mb;
        return (int)$da - (int)$db;
      });

      foreach ($diasOrdenados as $diaMes) {
        $stmtInsert->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
        $stmtInsert->bindParam(':dia_mes', $diaMes, PDO::PARAM_STR);
        $stmtInsert->execute();
      }

      $this->pdo->commit();
      return $diasOrdenados;
    } catch (Exception $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      error_log("Error al guardar días no laborales (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function guardarEspectaculos(int $id_empresa, array $espectaculos): bool
  {
    try {
      $this->pdo->beginTransaction();

      // 1) Borrar espectaculos anteriores
      $stmtDelete = $this->pdo->prepare(
        "DELETE FROM espectaculo_empresa WHERE id_empresa = :id_empresa"
      );
      $stmtDelete->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmtDelete->execute();

      // 2) Preparar insert
      $stmtInsert = $this->pdo->prepare(
        "INSERT INTO espectaculo_empresa (id_empresa, dia_semana, hora_inicio, hora_fin)
        VALUES (:id_empresa, :dia_semana, :hora_inicio, :hora_fin)"
      );

      // 3) Recorrer tu payload agrupado
      foreach ($espectaculos as $diaObj) {

        if (!isset($diaObj['diaIndex'], $diaObj['rangos']) || !is_array($diaObj['rangos'])) {
          throw new Exception("Formato de horario inválido (día sin rangos).");
        }

        $dia_semana = (int)$diaObj['diaIndex'];

        if ($dia_semana < 0 || $dia_semana > 6) {
          throw new Exception("Día inválido: $dia_semana");
        }

        foreach ($diaObj['rangos'] as $rango) {

          if (!isset($rango['inicio'], $rango['fin'])) {
            throw new Exception("Formato de rango inválido.");
          }

          $apertura = $rango['inicio'];
          $cierre = $rango['fin'];

          $stmtInsert->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
          $stmtInsert->bindParam(':dia_semana', $dia_semana, PDO::PARAM_INT);
          $stmtInsert->bindParam(':hora_inicio', $apertura, PDO::PARAM_STR);
          $stmtInsert->bindParam(':hora_fin', $cierre, PDO::PARAM_STR);

          $stmtInsert->execute();
        }
      }

      $this->pdo->commit();
      return true;
    } catch (Exception $e) {
      $this->pdo->rollBack();
      error_log("Error al guardar horarios (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function guardarExcepcionesEspectaculos($id_empresa, $excepciones)
  {
    try {
      $this->pdo->beginTransaction();

      // 1) Borrar espectaculos anteriores
      $stmtDelete = $this->pdo->prepare(
        "DELETE FROM espectaculo_excepcion WHERE id_empresa = :id_empresa"
      );
      $stmtDelete->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmtDelete->execute();

      // 2) Preparar insert (reutilizable para cada excepción habilitada que venga en el array

      $stmtInsert = $this->pdo->prepare(
        "INSERT INTO espectaculo_excepcion (id_empresa, fecha, hora_inicio, hora_fin, cancelada)
        VALUES (:id_empresa, :fecha, :hora_inicio, :hora_fin, :cancelada)"
      );

      foreach ($excepciones as $excepcion) {

        if (
          !is_string($excepcion['fecha']) ||
          !preg_match('/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/', $excepcion['fecha'])
        ) {
          throw new Exception("Formato inválido de día de excepción habilitada: " . $excepcion['fecha']);
        }

        foreach ($excepcion['rangos'] as $rango) {

          $stmtInsert->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
          $stmtInsert->bindParam(':fecha', $excepcion['fecha'], PDO::PARAM_STR);
          $stmtInsert->bindParam(':hora_inicio', $rango['horaInicio'], PDO::PARAM_STR);
          $stmtInsert->bindParam(':hora_fin', $rango['horaFin'], PDO::PARAM_STR);
          $stmtInsert->bindParam(':cancelada', $excepcion['cancelada'], PDO::PARAM_BOOL);

          $stmtInsert->execute();
        }
      }

      $this->pdo->commit();
    } catch (Exception $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      error_log("Error al guardar excepciones habilitadas de espectáculos (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function obtenerDiasNoLaborales(int $id_empresa): array
  {
    try {
      $stmt = $this->pdo->prepare(
        "SELECT
          d.dia_mes AS dia_mes
        FROM dias_no_laborales_empresa d
        WHERE d.id_empresa = :id_empresa
        ORDER BY STR_TO_DATE(d.dia_mes, '%d/%m/%Y') ASC"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (PDOException $e) {
      error_log("Error al obtener días no laborales (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function obtenerHorariosYDiasNoLaborales(int $id_empresa): array
  {
    try {
      $stmt = $this->pdo->prepare(
        "SELECT dia_semana, hora_apertura, hora_cierre
         FROM horarios_empresa
         WHERE id_empresa = :id_empresa
         ORDER BY dia_semana ASC, hora_apertura ASC"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      $porDia = [];

      while ($fila = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $diaIndex = (int)$fila['dia_semana'];

        if (!isset($porDia[$diaIndex])) {
          $porDia[$diaIndex] = [
            'diaIndex' => $diaIndex,
            'rangos' => []
          ];
        }

        $porDia[$diaIndex]['rangos'][] = [
          'apertura' => substr($fila['hora_apertura'], 0, 5),
          'cierre' => substr($fila['hora_cierre'], 0, 5),
        ];
      }

      ksort($porDia);

      return [
        'horarios' => array_values($porDia),
        'noLab' => $this->obtenerDiasNoLaborales($id_empresa),
      ];
    } catch (PDOException $e) {
      error_log("Error al obtener horarios y no laborales (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function obtenerEspectaculosYExcepciones(int $id_empresa): array
  {
    try {
      // 1. Horarios base del espectáculo
      $stmt = $this->pdo->prepare(
        "SELECT dia_semana, hora_inicio, hora_fin
       FROM espectaculo_empresa
       WHERE id_empresa = :id_empresa
       ORDER BY dia_semana ASC, hora_inicio ASC"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      $espectaculo = [];

      while ($fila = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $diaIndex = (int)$fila['dia_semana'];

        if (!isset($espectaculo[$diaIndex])) {
          $espectaculo[$diaIndex] = [
            'diaIndex' => $diaIndex,
            'rangos' => []
          ];
        }

        $espectaculo[$diaIndex]['rangos'][] = [
          'horaInicio' => substr($fila['hora_inicio'], 0, 5),
          'horaFin'    => substr($fila['hora_fin'], 0, 5),
        ];
      }

      ksort($espectaculo);

      // 2. Excepciones
      $stmtExc = $this->pdo->prepare(
        "SELECT fecha, hora_inicio, hora_fin, cancelada
       FROM espectaculo_excepcion
       WHERE id_empresa = :id_empresa
       ORDER BY fecha ASC, hora_inicio ASC"
      );
      $stmtExc->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmtExc->execute();

      $excepciones = [];

      while ($fila = $stmtExc->fetch(PDO::FETCH_ASSOC)) {

        $fecha = $fila['fecha'];

        if (!isset($excepciones[$fecha])) {
          $excepciones[$fecha] = [
            'fecha' => $fecha,
            'rangos' => [],
            'cancelada' => (bool)$fila['cancelada']
          ];
        }

        $excepciones[$fecha]['rangos'][] = [
          'horaInicio' => substr($fila['hora_inicio'], 0, 5),
          'horaFin'    => substr($fila['hora_fin'], 0, 5),
        ];
      }


      // Reindexar habilitadas (porque usaste clave por fecha)
      $excepciones = array_values($excepciones);

      return [
        'espectaculo' => array_values($espectaculo),
        'excepciones' => $excepciones
      ];
    } catch (PDOException $e) {
      error_log("Error al obtener espectáculos y excepciones (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function obtenerEspectaculos(int $id_empresa): array
  {
    try {
      $stmt = $this->pdo->prepare(
        "SELECT dia_semana, hora_inicio, hora_fin
             FROM espectaculo_empresa
             WHERE id_empresa = :id_empresa
             ORDER BY dia_semana ASC, hora_inicio ASC"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      $porDia = [];
      while ($fila = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $diaIndex = (int)$fila['dia_semana'];
        if (!isset($porDia[$diaIndex])) {
          $porDia[$diaIndex] = [
            'diaIndex' => $diaIndex,
            'rangos'   => []
          ];
        }
        $porDia[$diaIndex]['rangos'][] = [
          'horaInicio' => substr($fila['hora_inicio'], 0, 5),
          'horaFin'    => substr($fila['hora_fin'], 0, 5),
        ];
      }
      ksort($porDia);

      return array_values($porDia);
    } catch (PDOException $e) {
      error_log("Error al obtener espectaculos (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function verificarContrasenaMesero(int $id_empresa, string $contrasena): bool
  {

    try {
      $stmt = $this->pdo->prepare(
        "SELECT contrasenaMesero FROM Empresa WHERE id = :id_empresa LIMIT 1"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      $hash = $stmt->fetchColumn();
      if (($hash === null || $hash === '') && $contrasena === '') {
        return true; // si querés que vacío sea válido
      }

      if (!$hash) return false;

      return password_verify($contrasena, $hash);
    } catch (PDOException $e) {
      error_log("Error al verificar contraseña mesero (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function registrarContrasenaCompartida(int $id_empresa, string $contrasena): void
  {
    try {
      $hash = password_hash($contrasena, PASSWORD_DEFAULT);

      $stmt = $this->pdo->prepare(
        "UPDATE Empresa SET contrasenaMesero = :contrasena WHERE id = :id_empresa"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->bindParam(':contrasena', $hash, PDO::PARAM_STR);
      $stmt->execute();
    } catch (PDOException $e) {
      error_log("Error al registrar contraseña compartida (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function eliminarContrasenaCompartida(int $id_empresa): void
  {
    try {
      $stmt = $this->pdo->prepare(
        "UPDATE Empresa SET contrasenaMesero = NULL WHERE id = :id_empresa"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();
    } catch (PDOException $e) {
      error_log("Error al eliminar contraseña compartida (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }

  public function eliminar(int $id): bool
  {
    try {
      // Una sola consulta multitabla
      $this->pdo->beginTransaction();

      $this->pdo->prepare("DELETE FROM Moderador WHERE id_empresa = ?")->execute([$id]);
      $this->pdo->prepare("DELETE FROM Mesero WHERE id_empresa = ?")->execute([$id]);
      $this->pdo->prepare("DELETE FROM Articulo WHERE id_empresa = ?")->execute([$id]);
      $this->pdo->prepare("DELETE FROM Rubro WHERE id_empresa = ?")->execute([$id]);
      $this->pdo->prepare("DELETE FROM horarios_empresa WHERE id_empresa = ?")->execute([$id]);
      $this->pdo->prepare("DELETE FROM espectaculo_empresa WHERE id_empresa = ?")->execute([$id]);
      $this->pdo->prepare("DELETE FROM espectaculo_excepcion WHERE id_empresa = ?")->execute([$id]);
      $this->pdo->prepare("DELETE FROM dias_no_laborales_empresa WHERE id_empresa = ?")->execute([$id]);

      $this->pdo->prepare("DELETE FROM Empresa WHERE id = ?")->execute([$id]);

      $this->pdo->commit();

      return true;
    } catch (PDOException $e) {
      error_log("Error al eliminar empresa y relacionados en una consulta ($id): " . $e->getMessage());
      throw $e;
    }
  }
}
