<?php
// Scripts/Administrador/Modelo/Repositorio/EmpresaRepositorio.php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Entidad/EmpresaEntidad.php';

class EmpresaRepositorio {
  private $pdo;


  public function __construct(PDO $pdo) {
    $this->pdo = $pdo;
  }
  
  
  public function obtenerRubros(int $id): array{
    $rubros = [];
    try{
      $stmt = $this->pdo->prepare(
        "SELECT * FROM Rubro WHERE id_empresa = :id ORDER BY nombre ASC");
      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->execute();
      while ($data= $stmt->fetch(PDO::FETCH_ASSOC)){
        $rubros[] = [$data['id'],
          $data['nombre'],
          $data['id_empresa'],
          $data['logo_url'],
          $data['aparece_en_csv'],
          $data['creado_en_pagina']];
      }
    } catch (PDOException $e) {
      error_log("Error al obtener rubros para la empresa con ID " . $id . ": " . $e->getMessage());
    }
    return $rubros; 
  }
  
  public function obtenerPorId(int $id): ?array {
    $stmt = $this->pdo->prepare("SELECT * FROM Empresa WHERE id = :id;");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    if($data){
      return $empresa= [
        'id' => $data['id'],
        'nombre' => $data['nombre'],
        'logo_url' => $data['logo_url'],
        'telefono' => $data['telefono'],
        'ubicacion' => $data['ubicacion'],
        'tieneCarrito' => $data['tieneCarrito'],
        'moduloMesero' => $data['moduloMesero'],
        'efectivo' => $data['efectivo'],
        'tarjeta' => $data['tarjeta'],
        'transferencia' => $data['transferencia'],
        'fecha_creacion' => $data['fecha_creacion'],
      ];
    }
    return null;
  }
  
  
  public function obtenerTodas(): array {
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
  
  
  public function modificar(int $id, string $nombre, string $ubicacion, string $telefono, bool $tieneCarrito, bool $moduloMesero, bool $efectivo, bool $tarjeta, bool $transferencia, ?string $contrasenaMesero = null): bool {
    try {
      $sql = "UPDATE Empresa
          SET nombre = :nombre,
          telefono = :telefono,
          ubicacion = :ubicacion,
          tieneCarrito = :tieneCarrito,
          moduloMesero = :moduloMesero,
          efectivo = :efectivo,
          tarjeta = :tarjeta,
          transferencia = :transferencia";

      if ($contrasenaMesero !== null && $contrasenaMesero !== '') {
        $sql .= ", contrasenaMesero = :contrasenaMesero";
      }

      $sql .= " WHERE id = :id;";

      $stmt = $this->pdo->prepare($sql);

      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
      $stmt->bindParam(':telefono', $telefono, PDO::PARAM_STR);
      $stmt->bindParam(':ubicacion', $ubicacion, PDO::PARAM_STR);
      $stmt->bindParam(':tieneCarrito', $tieneCarrito, PDO::PARAM_BOOL);
      $stmt->bindParam(':moduloMesero', $moduloMesero, PDO::PARAM_BOOL);
      $stmt->bindParam(':efectivo', $efectivo, PDO::PARAM_BOOL);
      $stmt->bindParam(':tarjeta', $tarjeta, PDO::PARAM_BOOL);
      $stmt->bindParam(':transferencia', $transferencia, PDO::PARAM_BOOL);

      if ($contrasenaMesero !== null && $contrasenaMesero !== '') {
        $contrasenaMeseroHash = password_hash($contrasenaMesero, PASSWORD_DEFAULT);
        $stmt->bindParam(':contrasenaMesero', $contrasenaMeseroHash, PDO::PARAM_STR);
      }

      return $stmt->execute();

    } catch (PDOException $e) {
      error_log("Error al modificar la empresa: " . $e->getMessage());
      return null;
    }
  }

  public function modificarParaModerador(int $id, string $nombre, string $ubicacion, string $telefono, bool $efectivo, bool $tarjeta, bool $transferencia, ?string $contrasenaMesero = null): bool {
    try {
      $sql = "UPDATE Empresa
          SET nombre = :nombre,
          telefono = :telefono,
          ubicacion = :ubicacion,
          efectivo = :efectivo,
          tarjeta = :tarjeta,
          transferencia = :transferencia";

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

      if ($contrasenaMesero !== null && $contrasenaMesero !== '') {
        $contrasenaMeseroHash = password_hash($contrasenaMesero, PASSWORD_DEFAULT);
        $stmt->bindParam(':contrasenaMesero', $contrasenaMeseroHash, PDO::PARAM_STR);
      }

      return $stmt->execute();

    } catch (PDOException $e) {
      error_log("Error al modificar la empresa: " . $e->getMessage());
      return null;
    }
  }
  
  public function modificarLogo(int $id, string $logo_url): ?array {
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

  
  public function crear(string $nombre, string $logo_url, string $telefono, string $ubicacion, bool $tieneCarrito, bool $moduloMesero, bool $efectivo, bool $tarjeta, bool $transferencia, string $contrasenaMesero): array {
    try {
      $fecha_actual= date('Y-m-d');
      $stmt = $this->pdo->prepare(
        "INSERT INTO Empresa (nombre, fecha_creacion, logo_url, telefono, ubicacion, tieneCarrito, moduloMesero, efectivo, tarjeta, transferencia, contrasenaMesero) 
        VALUES (:nombre, :fecha_actual, :logo_url, :telefono, :ubicacion, :tieneCarrito, :moduloMesero, :efectivo, :tarjeta, :transferencia, :contrasenaMesero)"
      );
      $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
      $stmt->bindParam(':logo_url', $logo_url, PDO::PARAM_STR);
      $stmt->bindParam(':telefono', $telefono, PDO::PARAM_STR);
      $stmt->bindParam(':ubicacion', $ubicacion, PDO::PARAM_STR);
      $stmt->bindParam(':tieneCarrito', $tieneCarrito, PDO::PARAM_BOOL);
      $stmt->bindParam(':moduloMesero', $moduloMesero, PDO::PARAM_BOOL);
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
        return $data;
      }
    } catch (PDOException $e) {
      error_log("Error al guardar nueva empresa: " . $e->getMessage());
    }
    return null;
  }
  
  public function guardarHorarios(int $id_empresa, array $horarios): bool {
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


  public function guardarDiasNoLaborales(int $id_empresa, array $dias_no_laborales): array {
    try {
      $this->pdo->beginTransaction();

      $stmtDelete = $this->pdo->prepare(
        "DELETE FROM dias_no_laborales_empresa WHERE id_empresa = :id_empresa"
      );
      $stmtDelete->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmtDelete->execute();

      $stmtInsert = $this->pdo->prepare(
        "INSERT INTO dias_no_laborales_empresa (id_empresa, dia_mes)
        VALUES (:id_empresa, :dia_mes)"
      );

      $diasLimpios = [];

      foreach ($dias_no_laborales as $dia_mes) {
        if (!is_string($dia_mes) || !preg_match('/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/', $dia_mes)) {
          throw new Exception("Formato inválido de día no laboral: $dia_mes");
        }

        $diasLimpios[$dia_mes] = true;
      }

      $diasOrdenados = array_keys($diasLimpios);
      sort($diasOrdenados);

      foreach ($diasOrdenados as $dia_mes) {
        $stmtInsert->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
        $stmtInsert->bindParam(':dia_mes', $dia_mes, PDO::PARAM_STR);
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

  public function obtenerDiasNoLaborales(int $id_empresa): array {
    try {
      $stmt = $this->pdo->prepare(
        "SELECT dia_mes FROM dias_no_laborales_empresa WHERE id_empresa = :id_empresa ORDER BY dia_mes ASC"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_COLUMN);

    } catch (PDOException $e) {
      error_log("Error al obtener días no laborales (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }


  public function obtenerHorariosYDiasNoLaborales(int $id_empresa): array {
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

  public function verificarContrasenaMesero(int $id_empresa, string $contrasena): bool {
    try {
      $stmt = $this->pdo->prepare(
        "SELECT contrasenaMesero FROM Empresa WHERE id = :id_empresa LIMIT 1"
      );
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      $hash = $stmt->fetchColumn();

      if (!$hash) return false;

      return password_verify($contrasena, $hash);

    } catch (PDOException $e) {
      error_log("Error al verificar contraseña mesero (empresa $id_empresa): " . $e->getMessage());
      throw $e;
    }
  }


  
  public function sosAtributo(string $atributo) {
    $atributosPermitidos = ['nombre', 'fecha_creacion'];
    return in_array($atributo, $atributosPermitidos);
  }

}