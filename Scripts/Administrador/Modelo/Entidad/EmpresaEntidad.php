<?php
//Scripts/Administrador/Modelo/Entidad/EmpresaEntidad.php

class Empresa {
  private int $id;
  private string $nombre;
  private string $fecha_creacion;
  private string $logo_url;
  private string $telefono;
  private string $ubicacion;
  private bool $tieneCarrito;
  private bool $moduloMesero;
  private array $rubros;


  //Constructor
  public function __construct(int $id, string $nombre, string $fecha_creacion, string $logo_url, string $telefono, string $ubicacion, bool $tieneCarrito, bool $moduloMesero, ?array $rubros = []) {
    $this->id = $id;
    $this->nombre = $nombre;
    $this->fecha_creacion = $fecha_creacion;
    $this->logo_url = $logo_url;
    $this->telefono = $telefono;
    $this->ubicacion = $ubicacion;
    $this->tieneCarrito = $tieneCarrito;
    $this->moduloMesero = $moduloMesero;
    $this->rubros = $rubros;
  }
  
  
  //Getters
  public function getId(): ?int {
    return $this->id;
  }

  public function getNombre(): ?string {
    return $this->nombre;
  }

  public function getFechaCreacion(): ?string {
    return $this->fecha_creacion;
  }

  public function getLogoUrl(): ?string {
    return $this->logo_url;
  }
  
  public function getTelefono(): ?string {
    return $this->telefono;
  }
  
  public function getUbicacion(): ?string {
    return $this->ubicacion;
  }

  public function getTieneCarrito(): bool {
    return $this->tieneCarrito;
  }

  public function getmoduloMesero(): bool {
    return $this->moduloMesero;
  }
  
  public function getRubros(): array {
    return $this->rubros;
  }
  
  
  //Setters
  public function setId(int $id): void {
    $this->id = $id;
  }
  
  public function setNombre(string $nombre): void {
    $this->nombre = $nombre;
  }
  
  public function setFechaCreacion(string $fecha_creacion): void {
    $this->fecha_creacion = $fecha_creacion;
  }
  
  public function setLogoUrl(string $logo_url): void {
    $this->logo_url = $logo_url;
  }
  
  public function setRubros(array $rubros): void {
    $this->rubros = $rubros;
  }
  
  public function setTelefono(array $telefono): void {
    $this->telefono = $telefono;
  }
  
  public function setUbicacion(array $ubicacion): void {
    $this->ubicacion = $ubicacion;
  }

  public function setTieneCarrito(bool $tieneCarrito): void {
    $this->tieneCarrito = $tieneCarrito;
  }

  public function setmoduloMesero(bool $moduloMesero): void {
    $this->moduloMesero = $moduloMesero;
  }
  
  public function agregarRubro(Rubro $rubro): void {
    $this->rubros[] = $rubro;
  }
}