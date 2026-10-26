<?php

class Empresa
{
  private int $id;
  private string $nombre;
  private string $fecha_creacion;
  private string $logo_url;
  private string $telefono;
  private string $ubicacion;
  private bool $tieneCarrito;
  private bool $moduloMesero;
  private bool $unicoPrecio;
  private array $rubros;
  private bool $tieneContrasenaMesero;


  //Constructor
  public function __construct(int $id, string $nombre, string $fecha_creacion, string $logo_url, string $telefono, string $ubicacion, bool $tieneCarrito, bool $moduloMesero, bool $tieneContrasenaMesero, ?array $rubros = [], bool $unicoPrecio = true)
  {
    $this->id = $id;
    $this->nombre = $nombre;
    $this->fecha_creacion = $fecha_creacion;
    $this->logo_url = $logo_url;
    $this->telefono = $telefono;
    $this->ubicacion = $ubicacion;
    $this->tieneCarrito = $tieneCarrito;
    $this->moduloMesero = $moduloMesero;
    $this->unicoPrecio = $unicoPrecio;
    $this->tieneContrasenaMesero = $tieneContrasenaMesero;
    $this->rubros = $rubros;
  }


  //Getters
  public function getId(): ?int
  {
    return $this->id;
  }

  public function getNombre(): ?string
  {
    return $this->nombre;
  }

  public function getFechaCreacion(): ?string
  {
    return $this->fecha_creacion;
  }

  public function getLogoUrl(): ?string
  {
    return $this->logo_url;
  }

  public function getTelefono(): ?string
  {
    return $this->telefono;
  }

  public function getUbicacion(): ?string
  {
    return $this->ubicacion;
  }

  public function getTieneCarrito(): bool
  {
    return $this->tieneCarrito;
  }

  public function getmoduloMesero(): bool
  {
    return $this->moduloMesero;
  }

  public function getUnicoPrecio(): bool
  {
    return $this->unicoPrecio;
  }

  public function getRubros(): array
  {
    return $this->rubros;
  }

  public function tieneContrasenaMesero(): bool
  {
    return $this->tieneContrasenaMesero;
  }


  //Setters
  public function setId(int $id): void
  {
    $this->id = $id;
  }

  public function setNombre(string $nombre): void
  {
    $this->nombre = $nombre;
  }

  public function setFechaCreacion(string $fecha_creacion): void
  {
    $this->fecha_creacion = $fecha_creacion;
  }

  public function setLogoUrl(string $logo_url): void
  {
    $this->logo_url = $logo_url;
  }

  public function setRubros(array $rubros): void
  {
    $this->rubros = $rubros;
  }

  public function setTelefono(string $telefono): void
  {
    $this->telefono = $telefono;
  }

  public function setUbicacion(string $ubicacion): void
  {
    $this->ubicacion = $ubicacion;
  }

  public function setTieneCarrito(bool $tieneCarrito): void
  {
    $this->tieneCarrito = $tieneCarrito;
  }

  public function setmoduloMesero(bool $moduloMesero): void
  {
    $this->moduloMesero = $moduloMesero;
  }

  public function setUnicoPrecio(bool $unicoPrecio): void
  {
    $this->unicoPrecio = $unicoPrecio;
  }

  public function agregarRubro(Rubro $rubro): void
  {
    $this->rubros[] = $rubro;
  }

  public function setTieneContrasenaMesero(bool $tieneContrasenaMesero): void
  {
    $this->tieneContrasenaMesero = $tieneContrasenaMesero;
  }
}
