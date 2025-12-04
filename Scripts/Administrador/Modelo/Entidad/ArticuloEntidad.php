<?php
// Scripts/Administrador/Modelo/Entidad/ArticuloEntidad.php

class Articulo {
    private int $id;
    private int $id_rubro;
    private int $id_empresa;
    private string $nombre;
    private string $descripcion;
    private int $precio;
    private string $codigo_carta;
    private string $fecha_eliminado;
    private bool $aparece_en_csv;
    private bool $creado_en_pagina;
    private string $logo_url;



    //Constructor
    public function __construct(int $id,int $id_rubro, int $id_empresa,string $nombre, string $descripcion, int $precio, string $codigo_carta, bool $aparece_en_csv, bool $creado_en_pagina, string $logo_url = 'Archivos/Logos/Vacio.png', ?string $fecha_eliminado = '') {
        $this->id = $id;
        $this->id_rubro = $id_rubro;
        $this->id_empresa = $id_empresa;
        $this->nombre = $nombre;
        $this->descripcion = $descripcion;
        $this->precio = $precio;
        $this->codigo_carta = $codigo_carta;
        $this->fecha_eliminado = $fecha_eliminado;
        $this->aparece_en_csv = $aparece_en_csv;
        $this->creado_en_pagina = $creado_en_pagina;
        $this->logo_url = $logo_url;
    }



    //Getters
    public function getId(): int {
        return $this->id;
    }

    public function getIdRubro(): int {
        return $this->id_rubro;
    }
    
    public function getIdEmpresa(): int {
        return $this->id_empresa;
    }

    public function getNombre(): string {
        return $this->nombre;
    }
    
    public function getDescripcion(): string {
        return $this->descripcion;
    }
    
    public function getPrecio(): float {
        return $this->precio;
    }
    
    public function getCodigoCarta(): string {
        return $this->codigo_carta;
    }
    
    public function getFechaEliminado(): string {
        return $this->fecha_eliminado;
    }
    
    public function getApareceEnCsv(): bool {
        return $this->aparece_en_csv;
    }
    
    public function getCreadoEnPagina(): bool {
        return $this->creado_en_pagina;
    }
    
    public function getLogoUrl(): string {
        return $this->logo_url;
    }
    
    
    
    //Setters
    public function setId(id $id): void {
        $this->id = $id;
    }
    
    public function setIdRubro(int $id_rubro): void {
        $this->id_rubro = $id_rubro;
    }
    
    public function setIdEmpresa(int $id_empresa): void {
        $this->id_empresa = $id_empresa;
    }
    
    public function setNombre(string $nombre): void {
        $this->nombre = $nombre;
    }
    
    public function setDescripcion(string $descripcion): void {
        $this->descripcion = $descripcion;
    }
    
    public function setPrecio(float $precio): void{
        $this->precio = $precio;
    }
    
    public function setCodigoCarta(string $codigo_carta): void{
        $this->codigo_carta = $codigo_carta;
    }
    
    public function setFechaEliminado(string $fecha_eliminado): void{
        $this->fecha_eliminado = $fecha_eliminado;
    }
    
    public function setApareceEnCsv(bool $aparece_en_csv): void{
        $this->aparece_en_csv = $aparece_en_csv;
    }
    
    public function setCreadoEnPagina(bool $creado_en_pagina): void{
        $this->creado_en_pagina = $creado_en_pagina;
    }
    
    public function setLogoUrl(string $logo_url): void{
        $this->logo_url = $logo_url;
    }
}