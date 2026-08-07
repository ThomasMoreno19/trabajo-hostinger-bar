<?php
//Scripts/Administrador/Modelo/Repositorio/ArticuloRepositorio.php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Entidad/ArticuloEntidad.php';


class ArticuloRepositorio
{
  private $pdo;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
  }


  public function obtenerPorId(int $id, int $id_rubro): ?Articulo
  {
    $stmt = $this->pdo->prepare("SELECT * FROM Articulo WHERE id = :id AND id_rubro = :id_rubro");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->bindParam(':id_rubro', $id_rubro, PDO::PARAM_INT);
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($data) {
      return new Articulo(
        $data['id'],
        $data['id_rubro'],
        $data['id_empresa'],
        $data['nombre'],
        $data['descripcion'],
        $data['precio1'],
        $data['precio2'],
        $data['precio3'],
        $data['fecha_eliminado'],
        $data['aparece_en_csv'],
        $data['creado_en_pagina'],
        $data['logo_url'],
        $data['video_url'],
      );
    }
    return null;
  }

  public function obtenerTodos(int $id_rubro): array
  {
    $articulos = [];
    try {
      $stmt = $this->pdo->prepare("
                SELECT 
                    id, 
                    id_rubro, 
                    id_empresa,
                    nombre, 
                    descripcion, 
                    precio1, 
                    precio2, 
                    precio3, 
                    codigo_carta,
                    video_url
                FROM Articulo
                WHERE id_rubro = :id_rubro
                ORDER BY nombre ASC
            ");
      $stmt->bindParam(':id_rubro', $id_rubro, PDO::PARAM_INT);
      $stmt->execute();

      // ¡Devuelve directamente el array asociativo!
      $articulos = $stmt->fetchAll(PDO::FETCH_ASSOC);

      return $articulos;
    } catch (PDOException $e) {
      error_log("Error al obtener todos los artículos: " . $e->getMessage());
      return [];
    }
  }

  public function obtenerTodosPorEmpresa(int $id_empresa): array
  {
    try {
      $stmt = $this->pdo->prepare(" 
                SELECT
                    id,
                    id_rubro,
                    id_empresa,
                    nombre,
                    descripcion,
                    precio1,
                    precio2,
                    precio3,
                    codigo_carta,
                    no_procesado,
                    video_url
                FROM Articulo
                WHERE id_empresa = :id_empresa
                ORDER BY id_rubro ASC, nombre ASC
            ");

      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Error al obtener artículos por empresa: " . $e->getMessage());
      return [];
    }
  }

  public function obtenerParaCliente(int $id_empresa): array
  {
    try {
      $stmt = $this->pdo->prepare(" 
                SELECT
                    id,
                    id_rubro,
                    id_empresa,
                    nombre,
                    descripcion,
                    precio1,
                    precio2,
                    precio3,
                    codigo_carta,
                    no_procesado,
                    video_url
                FROM Articulo
                WHERE id_empresa = :id_empresa AND solo_mesero = 0
                ORDER BY id_rubro ASC, nombre ASC
            ");

      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->execute();

      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      error_log("Error al obtener artículos por empresa: " . $e->getMessage());
      return [];
    }
  }

  public function crearPorCsv(int $id, int $id_rubro, int $id_empresa, string $nombre, float $precio1, float $precio2, float $precio3, string $codigo_carta = '', string $descripcion = '', ?string $logo_url = 'Archivos/Logos/Vacio.png'): array
  {
    try {
      $stmt = $this->pdo->prepare(
        "INSERT INTO Articulo (id, id_rubro, id_empresa,nombre, descripcion, precio1, precio2, precio3, codigo_carta, aparece_en_csv, creado_en_pagina, logo_url)
                VALUES (:id, :id_rubro, :id_empresa, :nombre, :descripcion, :precio1, :precio2, :precio3, :codigo_carta, 1, 0, :logo_url)
                ON DUPLICATE KEY UPDATE
                    id_rubro = VALUES(id_rubro),
                    id_empresa = VALUES(id_empresa),
                    nombre = VALUES(nombre),
                    descripcion = VALUES(descripcion),
                    precio1 = VALUES(precio1),
                    precio2 = VALUES(precio2),
                    precio3 = VALUES(precio3),
                    codigo_carta = VALUES(codigo_carta),
                    aparece_en_csv = 1;"
      );

      $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
      $stmt->bindValue(':id_rubro', (int)$id_rubro, PDO::PARAM_INT);
      $stmt->bindValue(':id_empresa', (int)$id_empresa, PDO::PARAM_INT);
      $stmt->bindValue(':nombre', $nombre, PDO::PARAM_STR);
      $stmt->bindValue(':descripcion', $descripcion ?? '', PDO::PARAM_STR);
      // precio como string o float; PDO no tiene PARAM_FLOAT -> pasar como string o usar PDO::PARAM_STR
      $stmt->bindValue(':precio1', (string)$precio1, PDO::PARAM_STR);
      $stmt->bindValue(':precio2', (string)$precio2, PDO::PARAM_STR);
      $stmt->bindValue(':precio3', (string)$precio3, PDO::PARAM_STR);
      $stmt->bindValue(':codigo_carta', $codigo_carta ?? '', PDO::PARAM_STR);
      $stmt->bindValue(':logo_url', $logo_url, PDO::PARAM_STR);

      if ($stmt->execute()) {
        return  [
          'id' => $id,
          'id_rubro' => $id_rubro,
          'id_empresa' => $id_empresa,
          'descripcion' => $descripcion,
          'nombre' => $nombre,
          'precio1' => $precio1,
          'precio2' => $precio2,
          'precio3' => $precio3,
          'codigo_carta' => $codigo_carta,
        ];
      } else {
        return [];
      }
    } catch (PDOException $e) {
      error_log("Error al guardar nueva articulo: " . $e->getMessage());
    }
    return [];
  }

  public function crearListaCsv(array $articulos): array
  {
    $values = [];
    $params = [];
    foreach ($articulos as $i => $a) {
      $values[] = "(:id$i, :id_rubro$i, :id_empresa$i,:nombre$i, :descripcion$i, :precio1$i, :precio2$i, :precio3$i, :codigo_carta$i, :solo_mesero$i, :no_procesado$i, 1, 0, :logo_url$i)";
      $params[":id$i"] = $a['id'];
      $params[":id_rubro$i"] = $a['id_rubro'];
      $params[":id_empresa$i"] = $a['id_empresa'];
      $params[":nombre$i"] = $a['nombre'];
      $params[":descripcion$i"] = $a['descripcion'] ?? '';
      $params[":precio1$i"] = (string)$a['precio1'];
      $params[":precio2$i"] = (string)$a['precio2'];
      $params[":precio3$i"] = (string)$a['precio3'];
      $params[":codigo_carta$i"] = $a['codigo_carta'] ?? '';
      $params[":solo_mesero$i"] = $a['solo_mesero'] ?? 0;
      $params[":no_procesado$i"] = $a['no_procesado'] ?? 0;
      $params[":logo_url$i"] = 'Archivos/Logos/Vacio.png';
    }

    $sql = "INSERT INTO Articulo (id, id_rubro, id_empresa, nombre, descripcion, precio1, precio2, precio3, codigo_carta, solo_mesero, no_procesado, aparece_en_csv, creado_en_pagina, logo_url)
                VALUES " . implode(', ', $values) . "
                ON DUPLICATE KEY UPDATE
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
                    aparece_en_csv = 1;";

    try {
      $stmt = $this->pdo->prepare($sql);
      foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
      }
      $stmt->execute();
      return $articulos; // devolvemos la lista guardada
    } catch (PDOException $e) {
      error_log("Error al guardar artículos: " . $e->getMessage());
      return [];
    }
  }

  public function modificar(int $id, int $id_rubro, string $nombre, string $descripcion, string $precio1, string $precio2, string $precio3, string $codigo_carta): bool
  {
    try {
      $stmt = $this->pdo->prepare(
        "UPDATE Articulo
                 SET nombre = :nombre,
                    descripcion = :descripcion,
                    precio1 = :precio1,
                    precio2 = :precio2,
                    precio3 = :precio3,
                    codigo_carta = :codigo_carta
                 WHERE id = :id AND id_rubro = :id_rubro;"
      );

      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->bindParam(':id_rubro', $id_rubro, PDO::PARAM_INT);
      $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
      $stmt->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
      $stmt->bindParam(':precio1', $precio1, PDO::PARAM_STR);
      $stmt->bindParam(':precio2', $precio2, PDO::PARAM_STR);
      $stmt->bindParam(':precio3', $precio3, PDO::PARAM_STR);
      $stmt->bindParam(':codigo_carta', $codigo_carta, PDO::PARAM_STR);

      if ($stmt->execute()) {
        return true;
      }
    } catch (PDOException $e) {
      error_log("Error al guardar nueva articulo: " . $e->getMessage());
    }
    return false;
  }

  public function eliminarNoUtilizados(int $id_rubro): bool
  {
    try {
      $stmt = $this->pdo->prepare(
        "DELETE FROM Articulo
                 WHERE aparece_en_csv = 0 AND creado_en_pagina = 0 AND id_rubro = :id_rubro;"
      );

      $stmt->bindParam(':id_rubro', $id_rubro, PDO::PARAM_INT);

      return $stmt->execute();
    } catch (PDOException $e) {
      error_log("Error al eliminar articulo: " . $e->getMessage());
      return false;
    }
  }

  public function setearCSVEn0(int $id_rubro): bool
  {
    try {
      $stmt = $this->pdo->prepare(
        "UPDATE Articulo
             SET aparece_en_csv = 0
             WHERE id_rubro = :id_rubro;"
      );
      $stmt->bindParam(':id_rubro', $id_rubro, PDO::PARAM_INT);

      $exito = $stmt->execute();

      if ($exito) {
        $filas_afectadas = $stmt->rowCount();
        if ($filas_afectadas > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        // Esto se ejecuta si execute() falla, aunque es raro con PDO
        error_log("La ejecución del UPDATE falló para el rubro con ID: " . $id_rubro);
        return false;
      }
    } catch (PDOException $e) {
      error_log("Error al setear CSV en 0: " . $e->getMessage());
      return false;
    }
  }

  public function agregarUrlVideo(int $id, int $id_empresa, string $video_url): bool
  {
    try {
      $stmt = $this->pdo->prepare(
        "UPDATE Articulo
             SET video_url = :video_url
             WHERE id = :id AND id_empresa = :id_empresa;"
      );

      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);
      $stmt->bindParam(':video_url', $video_url, PDO::PARAM_STR);

      if ($stmt->execute()) {
        return true;
      }
    } catch (PDOException $e) {
      error_log("Error al agregar URL de video al artículo: " . $e->getMessage());
    }
    return false;
  }

  public function eliminarUrlVideo(int $id, int $id_empresa): bool
  {
    try {
      $stmt = $this->pdo->prepare(
        "UPDATE Articulo
             SET video_url = ''
             WHERE id = :id AND id_empresa = :id_empresa;"
      );

      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);

      if ($stmt->execute()) {
        return true;
      }
    } catch (PDOException $e) {
      error_log("Error al eliminar URL de video del artículo: " . $e->getMessage());
    }
    return false;
  }

  public function eliminar(int $id, int $id_empresa): bool
  {
    try {
      $stmt = $this->pdo->prepare(
        "DELETE FROM Articulo
             WHERE id = :id AND id_empresa = :id_empresa;"
      );

      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->bindParam(':id_empresa', $id_empresa, PDO::PARAM_INT);

      if ($stmt->execute()) {
        return true;
      }
    } catch (PDOException $e) {
      error_log("Error al eliminar artículo: " . $e->getMessage());
    }
    return false;
  }
}
