<?php
//Scripts/Administrador/Modelo/Repositorio/ArticuloRepositorio.php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Entidad/ArticuloEntidad.php';


class ArticuloRepositorio {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }
    
    
    public function obtenerPorId(int $id, int $id_rubro): ?Articulo {
        $stmt = $this->pdo->prepare("SELECT * FROM Articulo WHERE id = :id AND id_rubro = :id_rubro");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':id_rubro', $id_rubro, PDO::PARAM_INT);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if($data){
            return new Articulo(
                $data['id'],
                $data['id_rubro'],
                $data['id_empresa'],
                $data['nombre'],
                $data['descripcion'],
                $data['precio'],
                $data['fecha_eliminado'],
                $data['aparece_en_csv'],
                $data['creado_en_pagina'],
                $data['logo_url']);
        }
        return null;
    }
    
    public function obtenerTodos(int $id_rubro): array {
        $articulos = [];
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, 
                    id_rubro, 
                    id_empresa,
                    nombre, 
                    descripcion, 
                    precio, 
                    codigo_carta 
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

    public function crearPorCsv(int $id, int $id_rubro, int $id_empresa,string $nombre,float $precio, string $codigo_carta = '', string $descripcion = '', ?string $logo_url = 'Archivos/Logos/Vacio.png'): array {
        try {
            $stmt = $this->pdo->prepare(
                "INSERT INTO Articulo (id, id_rubro, id_empresa,nombre, descripcion, precio, codigo_carta, aparece_en_csv, creado_en_pagina, logo_url)
                VALUES (:id, :id_rubro, :nombre, :descripcion, :precio, :codigo_carta, 1, 0, :logo_url)
                ON DUPLICATE KEY UPDATE
                    id_rubro = VALUES(id_rubro),
                    id_empresa = VALUES(id_empresa),
                    nombre = VALUES(nombre),
                    descripcion = VALUES(descripcion),
                    precio = VALUES(precio),
                    codigo_carta = VALUES(codigo_carta),
                    aparece_en_csv = 1;");
                
            $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
            $stmt->bindValue(':id_rubro', (int)$id_rubro, PDO::PARAM_INT);
            $stmt->bindValue(':id_empresa', (int)$id_empresa, PDO::PARAM_INT);
            $stmt->bindValue(':nombre', $nombre, PDO::PARAM_STR);
            $stmt->bindValue(':descripcion', $descripcion ?? '', PDO::PARAM_STR);
            // precio como string o float; PDO no tiene PARAM_FLOAT -> pasar como string o usar PDO::PARAM_STR
            $stmt->bindValue(':precio', (string)$precio, PDO::PARAM_STR);
            $stmt->bindValue(':codigo_carta', $codigo_carta ?? '', PDO::PARAM_STR);
            $stmt->bindValue(':logo_url', $logo_url, PDO::PARAM_STR);

            if ($stmt->execute()) {
                return  [
                    'id' => $id,
                    'id_rubro' => $id_rubro,
                    'id_empresa' => $id_empresa,
                    'descripcion' => $descripcion,
                    'nombre' => $nombre,
                    'precio' => $precio,
                    'codigo_carta' => $codigo_carta,
                ];
            }else{
                return null;
            }
        } catch (PDOException $e) {
            error_log("Error al guardar nueva articulo: " . $e->getMessage());
        }
        return null;
    }
    
    public function crearListaCsv(array $articulos): array {
        $values = [];
        $params = [];
        foreach ($articulos as $i => $a) {
            $values[] = "(:id$i, :id_rubro$i, :id_empresa$i,:nombre$i, :descripcion$i, :precio$i, :codigo_carta$i, 1, 0, :logo_url$i)";
            $params[":id$i"] = $a['id'];
            $params[":id_rubro$i"] = $a['id_rubro'];
            $params[":id_empresa$i"] = $a['id_empresa'];
            $params[":nombre$i"] = $a['nombre'];
            $params[":descripcion$i"] = $a['descripcion'] ?? '';
            $params[":precio$i"] = (string)$a['precio'];
            $params[":codigo_carta$i"] = $a['codigo_carta'] ?? '';
            $params[":logo_url$i"] = 'Archivos/Logos/Vacio.png';
        }
    
        $sql = "INSERT INTO Articulo (id, id_rubro, id_empresa, nombre, descripcion, precio, codigo_carta, aparece_en_csv, creado_en_pagina, logo_url)
                VALUES " . implode(', ', $values) . "
                ON DUPLICATE KEY UPDATE
                    id_rubro = VALUES(id_rubro),
                    id_empresa = VALUES(id_empresa),
                    nombre = VALUES(nombre),
                    descripcion = VALUES(descripcion),
                    precio = VALUES(precio),
                    codigo_carta = VALUES(codigo_carta),
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

    
    public function crearPorPagina(int $id, int $id_rubro, string $nombre, string $descripcion, float $precio, string $codigo_carta, ?string $logoUrl = 'Archivos/Logos/Vacio.png'): ?Articulo {
        try {
            $stmt = $this->pdo->prepare(
                "INSERT INTO Articulo (id, id_rubro, nombre, descripcion, precio, codigo_carta, fecha_eliminado, aparece_en_csv, creado_en_pagina, logo_url)
                VALUES (:id, :id_rubro, :nombre, :descripcion, :precio, :codigo_carta, '', 0, 1, :logo_url)
                ON DUPLICATE KEY UPDATE
                    id_rubro = VALUES(id_rubro),
                    nombre = VALUES(nombre),
                    descripcion = VALUES(descripcion),
                    precio = VALUES(precio),
                    codigo_carta = VALUES(codigo_carta),
                    creado_en_pagina = 1;");
            
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':id_rubro', $id_rubro, PDO::PARAM_STR);
            $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
            $stmt->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
            $stmt->bindParam(':precio', $precio, PDO::PARAM_STR);
            $stmt->bindParam(':codigo_carta', $codigo_carta, PDO::PARAM_STR);
            $stmt->bindParam(':logo_url', $logoUrl, PDO::PARAM_STR);

            if ($stmt->execute()) {
                return new Articulo(
                    $id,
                    $id_rubro,
                    $nombre,
                    $descripcion,
                    $precio,
                    $codigo_carta,
                    '',
                    1,
                    0,
                    $logo_url);
            }
        } catch (PDOException $e) {
            error_log("Error al guardar nueva articulo: " . $e->getMessage());
        }
        return null;
    }
    
    public function modificar(int $id, int $id_rubro, string $nombre, string $descripcion, string $precio, string $codigo_carta): bool {
        try {
            $stmt = $this->pdo->prepare(
                "UPDATE Articulo
                 SET nombre = :nombre,
                    descripcion = :descripcion,
                    precio = :precio,
                    codigo_carta = :codigo_carta
                 WHERE id = :id AND id_rubro = :id_rubro;");
                    
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':id_rubro', $id_rubro, PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
            $stmt->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
            $stmt->bindParam(':precio', $precio, PDO::PARAM_STR);
            $stmt->bindParam(':codigo_carta', $codigo_carta, PDO::PARAM_STR);

            if ($stmt->execute()) {
                return true;
            }
            
        } catch (PDOException $e) {
            error_log("Error al guardar nueva articulo: " . $e->getMessage());
        }
        return false;
    }
    
    public function eliminarNoUtilizados(int $id_rubro): bool {
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
    
    public function setearCSVEn0(int $id_rubro): bool {
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
    
    public function sosAtributo(string $atributo) {
        $atributosPermitidos = ['id_rubro', 'nombre', 'descripcion', 'precio', 'codigo_carta', 'fecha_eliminado', 'logo_url'];
        return in_array($atributo, $atributosPermitidos);
    }
}