<!DOCTYPE html>
<html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/Scripts/Cliente/Vista/Css/pantalla.css">
      <link rel="stylesheet" href="/Scripts/Cliente/Vista/Css/ListaArticulos.css?v=1.1">
      <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/BotonesAlta.css">
      <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/BotonesMostrarLista.css">
      <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/BotonCargar.css">
      <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/BarraBusqueda.css">
      <link rel="stylesheet" href="/Scripts/Cliente/Vista/Css/BotonVolver.css">
      <link rel="stylesheet" href="/Scripts/Cliente/Vista/Css/MadeBy.css">
      <link rel="stylesheet" href="/Scripts/Administrador/Vista/Css/Loader.css">
      <link rel="stylesheet" href="/Scripts/Cliente/Vista/Css/modalCarrito.css">
      <link rel="stylesheet" href="/Scripts/Cliente/Vista/Css/modalPedirNombreYTel.css">
      <link rel="stylesheet" href="/Scripts/Cliente/Vista/Css/formgroup.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  </head>
  <body>
    <header id="header">
      <img id="imagen-header"/>
      <h1 id="titulo-pagina"/>
      <h1 id="info-extra"/>
    </header>

    <button id="boton-carrito" class="hidden" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" id="icono-carrito">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"></path>
      </svg>
      <div class="text">
        <span id="cantidad-articulos-carrito"></span>
      </div>
    </button>

    <div class="lista-central" id="lista-central">
      <button class="hidden boton-volver" id="boton-volver" type="button" >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path>
        </svg>
        <div class="text">
          Volver
        </div>
      </button>

      <input type="text" id="barra-busqueda" class="barra .hidden" placeholder="Buscar artículos...">
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
        <h2 id="titulo-rubros">Rubros</h2>
        <div class="lista" id="lista-articulos"></div>
        <div class="lista" id="lista-rubros"></div>
      </div>
    </div>
    <div class="made-by">
      <div class="social-icons">
        <a href="https://www.instagram.com/iteracion.informatica/" target="_blank" class="instagram" title="Instagram">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="https://www.facebook.com" target="_blank" class="facebook" title="Facebook">
          <i class="fab fa-facebook-f"></i>
        </a>
      </div>
      <p><?php echo date('Y'); ?> - IteraciON</p>
    </div>
    
    <script src="/Scripts/Administrador/Vista/Js/Articulo.js"></script>
    <script src="/Scripts/Administrador/Vista/Js/Rubro.js"></script>
    <script src="/Scripts/Administrador/Vista/Js/Empresa.js"></script>
    <script src="/Scripts/Cliente/Vista/Js/Carrito.js"></script>
    <script src="/Scripts/Cliente/Vista/Js/ModalCarrito.js"></script>
    <script src="/Scripts/Cliente/Vista/Js/PantallaCliente.js"></script>
    <script src="/Scripts/Cliente/Vista/Js/GestorCliente.js"></script>
  </body>
</html>