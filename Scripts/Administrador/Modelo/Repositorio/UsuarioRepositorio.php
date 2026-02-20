<?php
// Scripts/Modelo/Repositorios/EmpresaRepositorio.php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Scripts/Administrador/Modelo/Entidad/UsuarioEntidad.php'; // Incluimos la entidad Empresa

class UsuarioRepositorio {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }


    public function save(Usuario $usuario): int {
        
        $contrasenaHasheada = password_hash($usuario->getContrasena(), PASSWORD_DEFAULT);
        
        $stmt = $this->pdo->prepare(
            "INSERT INTO Usuario (nombre, contrasena) VALUES (:nombre, :contrasena)"
        );
        $stmt->bindValue(':nombre', $usuario->getNombre());
        $stmt->bindValue(':contrasena', $contrasenaHasheada);
        
        $stmt->execute();
        return (int)$this->pdo->lastInsertId();
    }
    
    public function findByNombre(string $nombre): ?Usuario {
        $stmt = $this->pdo->prepare("SELECT * FROM Usuario WHERE nombre = :nombre LIMIT 1");
        $stmt->bindValue(':nombre', $nombre);
        $stmt->execute();
    
        $data = $stmt->fetch();
    
        if ($data) {
            return new Usuario(
                $data['id'],
                $data['nombre'],
                $data['contrasena']
            );
        }
    
        return null;
    }



    public function IniciarSesion(string $nombre, string $contrasenaTextoPlano): bool {
        $usuario = $this->findByNombre($nombre);

        // Si el usuario no existe o la contraseña no coincide, retorna null
        if ($usuario) {
            
            return password_verify($contrasenaTextoPlano, $usuario->getContrasena());
        }
        return false;
    }

}