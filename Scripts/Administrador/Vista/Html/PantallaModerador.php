<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="/Archivos/Logos/Iteracion.png">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/PantallaModerador.css?v=<?php echo APP_VERSION; ?>">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/ListaArticulos.css?v=<?php echo APP_VERSION; ?>">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/BotonesAlta.css?v=<?php echo APP_VERSION; ?>">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/BotonesMostrarLista.css?v=<?php echo APP_VERSION; ?>">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/BotonCargar.css?v=<?php echo APP_VERSION; ?>">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/BarraBusqueda.css?v=<?php echo APP_VERSION; ?>">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/Loader.css?v=<?php echo APP_VERSION; ?>">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/pantallaHorario.css?v=<?php echo APP_VERSION; ?>">
  <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/modalNuevaEmpresa.css?v=<?php echo APP_VERSION; ?>">
</head>

<body>
  <header id="titulo-pagina">
    <h1 id="titulo-pagina"></h1>
  </header>

  <div class="boton-carga">
    <button class="boton-cargar" type="button" id="boton-cargar-articulos">
      <img src="../../../../Archivos/Iconos/excel.svg" alt="Cargar" width="28" height="28">
      Cargar Artículos
    </button>
    <button class="boton-cargar" type="button" id="modificar-cafeteria">
      <img src="../../../../Archivos/Iconos/SVG-Settings.svg" alt="Configurar" width="35" height="35">
    </button>
  </div>

  <div class="lista-central" id="lista-central">
    <div class="botones-lista">
      <button class="boton-lista activo" type="button" id="boton-mostrar-articulos">Artículos</button>
      <button class="boton-lista" type="button" id="boton-mostrar-rubros">Rubros</button>
    </div>

    <div id="contenedor-busqueda" class="contenedor-busqueda">

      <input
        type="text"
        id="barra-busqueda"
        class="barra hidden"
        placeholder="Buscar artículos" />

      <svg
        class="icono-busqueda"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </div>

    <div class="loader" id="loader">
      <div class="cup">
        <div class="cup-handle"></div>
        <div class="smoke one"></div>
        <div class="smoke two"></div>
        <div class="smoke three"></div>
      </div>
      <div class="load">..........................</div>
    </div>
    <div class="listas">
      <div class="lista" id="lista-articulos"></div>
      <div class="lista" id="lista-rubros"></div>
    </div>
  </div>

  <script src="/Scripts/Administrador/Vista/Js/Articulo.js?v=<?php echo APP_VERSION; ?>"></script>
  <script src="/Scripts/Administrador/Vista/Js/Empresa.js?v=<?php echo APP_VERSION; ?>"></script>
  <script src="/Scripts/Administrador/Vista/Js/Rubro.js?v=<?php echo APP_VERSION; ?>"></script>
  <script src="/Scripts/Administrador/Vista/Js/Moderador.js?v=<?php echo APP_VERSION; ?>"></script>
  <script src="/Scripts/Administrador/Vista/Js/Moderador/PantallaModerador.js?v=<?php echo APP_VERSION; ?>"></script>
  <script src="/Scripts/Administrador/Vista/Js/Moderador/GestorModerador.js?v=<?php echo APP_VERSION; ?>"></script>
  <script src="/Scripts/Administrador/Vista/Js/dias_semana.const.js?v=<?php echo APP_VERSION; ?>"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
</body>

</html>
