class EmpresaVista {
  constructor(empresa) {
    this.id = empresa.id;
    this.nombre = empresa.nombre;
    this.telefono = empresa.telefono;
    this.ubicacion = empresa.ubicacion;
    this.tieneCarrito = empresa.tieneCarrito ?? false;
    this.moduloMesero = empresa.moduloMesero ?? false;
    this.deshabilitarExcel = empresa.deshabilitarExcel ?? false;
    this.unicoPrecio =
      empresa.unicoPrecio == null
        ? true
        : [true, 1, "1", "true"].includes(empresa.unicoPrecio);
    this.efectivo = empresa.efectivo ?? false;
    this.tarjeta = empresa.tarjeta ?? false;
    this.transferencia = empresa.transferencia ?? false;
    this.precio_delivery = empresa.precio_delivery ?? 1;
    this.precio_espectaculo = empresa.precio_espectaculo ?? 1;
    this.botonPedirCuenta = empresa.botonPedirCuenta ?? false;
    this.botonLlamarMesero = empresa.botonLlamarMesero ?? false;
    this.tieneContrasenaMesero = empresa.tieneContrasenaMesero;
    this.logo_url = empresa.logo_url;
  }

  update(
    nombre,
    telefono,
    ubicacion,
    efectivo,
    tarjeta,
    transferencia,
    precio_delivery,
    precio_espectaculo,
    botonPedirCuenta,
    botonLlamarMesero,
    unicoPrecio = this.unicoPrecio,
  ) {
    this.nombre = nombre;
    this.telefono = telefono;
    this.ubicacion = ubicacion;
    this.efectivo = efectivo;
    this.tarjeta = tarjeta;
    this.transferencia = transferencia;
    this.precio_delivery = precio_delivery;
    this.precio_espectaculo = precio_espectaculo;
    this.botonPedirCuenta = botonPedirCuenta;
    this.botonLlamarMesero = botonLlamarMesero;
    this.unicoPrecio = unicoPrecio;
  }

  mostrarUna() {
    const divEmpresa = document.createElement("div");
    divEmpresa.classList.add("empresa");
    divEmpresa.dataset.empresaId = this.id; //🤣😎
    divEmpresa.style.backgroundImage = `url('${this.logo_url || "/Archivos/Logos/Vacio.png"}')`;

    const pNombre = document.createElement("p");
    pNombre.textContent = this.nombre;
    divEmpresa.appendChild(pNombre);

    divEmpresa.addEventListener("click", () => {
      const event = new CustomEvent("empresaSeleccionada", {
        detail: {
          empresaId: this.id,
          empresaNombre: this.nombre,
          empresaTelefono: this.telefono,
          empresaUbicacion: this.ubicacion,
          empresaTieneCarrito: this.tieneCarrito,
          empresaModuloMesero: this.moduloMesero,
          empresaUnicoPrecio: this.unicoPrecio,
          empresaDeshabilitarExcel: this.deshabilitarExcel,
          empresaEfectivo: this.efectivo,
          empresaTarjeta: this.tarjeta,
          empresaTransferencia: this.transferencia,
          empresaPrecio_delivery: this.precio_delivery,
          empresaPrecio_espectaculo: this.precio_espectaculo,
          empresaBotonPedirCuenta: this.botonPedirCuenta,
          empresaTieneContrasenaMesero: this.tieneContrasenaMesero,
          empresaLogoUrl: this.logo_url,
        },
      });
      document.dispatchEvent(event);
      if (typeof window.gestorDeEmpresasCallback === "function") {
        window.gestorDeEmpresasCallback(this);
      }
    });

    return divEmpresa;
  }

  async asignarIconoYPagina(texto) {
    try {
      // Cambiar el título de la pestaña
      document.title = `${this.nombre} ${texto}`;

      // Crear nuevo favicon con el logo de la empresa
      const nuevoFavicon = document.createElement("link");
      nuevoFavicon.rel = "icon";
      nuevoFavicon.type = "image/png";
      nuevoFavicon.href = this.logo_url || "/Archivos/Logos/Vacio.png";

      document.head.appendChild(nuevoFavicon);
    } catch (error) {
      console.error(
        "Error al asignar el ícono o el título de la pestaña:",
        error,
      );
    }
  }

  static modalNuevaEmpresa() {
    const modalNuevaEmpresa = document.createElement("div");
    modalNuevaEmpresa.classList.add("modal-backdrop");
    modalNuevaEmpresa.id = "modalNuevaEmpresa";

    const modalNuevaEmpresaContenido = document.createElement("div");
    modalNuevaEmpresaContenido.classList.add("modal-content");

    const htmlContent = `
      <form id="formNuevaEmpresa">
      <div id="header-wrapper">
        <h2 id ="titulo-modal">Nueva Cafetería</h2>
        <button type="button" id="cerrar-wrapper" class="boton-cerrar">&times;</button>
      </div>
        <div class="form-group">
          <label for="nombre" class="required" >Nombre</label>
          <input type="text" id="nombre" name="nombre" required>
        </div>
        <div class="form-group">
          <label for="telefono">Nro de telefono</label>
          <input type="text" id="telefono" name="telefono" maxlength=18>
        </div>
        <div class="form-group">
          <label for="ubicacion">Direccion</label>
          <input type="text" id="ubicacion" name="ubicacion">
        </div>
        <text id="titulo-modulos"> Módulos Disponibles </text>
        <div class="lista-botones">
          <button type="button"
              id="btnCarrito"
              class="toggle-btn ${this.tieneCarrito ? "active" : ""}">
            Módulo Carrito
          </button>

          <button type="button"
              id="btnMesero"
              class="toggle-btn ${this.moduloMesero ? "active" : ""}">
            Módulo Mesero
          </button>

          <button type="button"
              id="btnDeshabilitarExcel"
              class="toggle-btn ${this.deshabilitarExcel ? "active" : ""}">
            Deshabilitar Excel
          </button>
        </div>
        <text id="titulo-modulos"> Métodos de pago </text>
        <div class="lista-botones">
          <button type="button"
              id="btnEfectivo"
              class="toggle-btn ${this.efectivo ? "active" : ""}">
            Efectivo
          </button>

          <button type="button"
              id="btnTarjeta"
              class="toggle-btn ${this.tarjeta ? "active" : ""}">
            Tarjeta
          </button>

          <button type="button"
              id="btnTransferencia"
              class="toggle-btn ${this.transferencia ? "active" : ""}">
            Transferencia
          </button>
        </div>
        <input type="hidden" name="tieneCarrito" id="tieneCarrito" value="${!!this.tieneCarrito}">
        <input type="hidden" name="moduloMesero" id="moduloMesero" value="${!!this.moduloMesero}">
        <input type="hidden" name="deshabilitarExcel" id="deshabilitarExcel" value="${!!this.deshabilitarExcel}">
        <input type="hidden" name="efectivo" id="efectivo" value="${!!this.efectivo}">
        <input type="hidden" name="tarjeta" id="tarjeta" value="${!!this.tarjeta}">
        <input type="hidden" name="transferencia" id="transferencia" value="${!!this.transferencia}">
        <div class="form-group">
          <label for="imagen">Imagen</label>
          <input type="file" id="imagen" name="imagen" accept="image/*">
        </div>
        <div class="form-group">
          <label for="usuario" class="required">Usuario</label>
          <input type="text" id="usuario" name="usuario" required>
        </div>
        <div class="form-group">
          <label for="contrasena" class="required">Contraseña</label>
          <input type="password" id="contrasena" name="contrasena" required>
        </div>
        <div class="footer-wrapper">
          <button type="submit" class="submit-button" id="boton-guardar-empresa">Enviar</button>
        </div>
      </form>
    `;

    modalNuevaEmpresaContenido.innerHTML = htmlContent;
    modalNuevaEmpresa.appendChild(modalNuevaEmpresaContenido);

    return modalNuevaEmpresa;
  }

  modalConfigurarEspectaculos() {
    const modalEspectaculos = document.createElement("div");
    modalEspectaculos.classList.add("wrapper");
    modalEspectaculos.id = "modalConfigurarEspectaculos";

    const modalEspectaculosContenido = document.createElement("div");
    modalEspectaculosContenido.classList.add("wrapper-content");

    const dias = DIAS_SEMANA.map((nombre) => ({
      nombre,
      abierto: false,
      horaApertura: "",
      horaCierre: "",
    }));

    const botonesDiasHTML = dias
      .map(
        (dia, index) => `
      <button type="button"
          id="btnDia${index}"
          class="toggle-btn ${dia.abierto ? "active" : ""}">
        ${dia.nombre}
      </button>
    `,
      )
      .join("");

    const htmlContent = `
      <form id="formConfigurarEspectaculosEmpresa">
        <header id="header-wrapper">
          <h2 id="titulo-wrapper" class="titulo">Configuración de Espectáculos</h2>
          <button type="button" id="cerrar-wrapper" class="boton-cerrar">&times;</button>
        </header>

        <div class="modulos">
          <text id="titulo-modulos" class="required"> Seleccione los días de espectáculos </text>

          <div class="lista-botones">
            ${botonesDiasHTML}
          </div>

          <div class="form-group">
            <label for="horaInicio" class="required">Hora de Inicio</label>
            <input type="time" id="horaInicio" name="horaInicio" required>
          </div>

          <div class="form-group">
            <label for="horaFin" class="required">Hora de Fin</label>
            <input type="time" id="horaFin" name="horaFin" required>
          </div>

          <!-- ESTE submit es para REGISTRAR en el array -->
          <button type="submit" class="boton" id="boton-registrar-espectaculos">
            + Registrar
          </button>
          
        </div>

        <div class="lista-espectaculos"></div>
          <h3 class="subtitulo-espectaculos">Vista previa de Horarios de Espectáculos</h3>
          <div id="listaEspectaculosRegistrados" class="espectaculos-grid"></div>
        </div>


        <!-- BOTÓN FINAL -->
        <div class="boton-final-container">

          <button type="button" class="botonCambiarForm" id="btnFormEspectaculoDiaFijo">
            Configurar Excepciones
          </button>

          <button type="button" class="boton boton-final disabled" id="btnGuardarEspectaculos">
            Guardar
          </button>
        </div>
      </form>

    `;

    modalEspectaculosContenido.innerHTML = htmlContent;
    modalEspectaculos.appendChild(modalEspectaculosContenido);

    return modalEspectaculos;
  }

  modalConfigurarEspectaculoHabilitarExcepcion() {
    const modalDiasFijos = document.createElement("div");
    modalDiasFijos.classList.add("wrapper");
    modalDiasFijos.id = "modalConfigurarEspectaculoHabilitarExcepcion";

    const modalContenido = document.createElement("div");
    modalContenido.classList.add("wrapper-content");

    const htmlContent = `
      <form id="formConfigurarEspectaculoHabilitarExcepcion">
        <header id="header-wrapper">
          <h2 id="titulo-wrapper" class="titulo">Excepciones Habilitadas</h2>
          <button type="button" id="cerrar-wrapper-espectaculo-excepcion-habilitada" class="boton-cerrar">&times;</button>
        </header>

        <div class="modulos">

          <div class="form-group">
            <label for="fechaExcepcionHabilitada" class="required">Fecha:</label>
            <input type="date" class="fecha-input" id="fechaExcepcionHabilitada" name="fechaExcepcionHabilitada" title="Seleccioná una fecha" required>

            <div class="form-group">
              <label for="horaInicio" class="required">Hora de Inicio</label>
              <input type="time" id="horaInicio" name="horaInicio" required>
            </div>

            <div class="form-group">
              <label for="horaFin" class="required">Hora de Fin</label>
              <input type="time" id="horaFin" name="horaFin" required>
            </div>

            <div class="lista-botones form-group precios">
              <label for="tipo-excepcion" class="required">Tipo de excepción</label>
              <select id="tipo-excepcion" name="tipo-excepcion" required>
                <option value="" selected disabled>Seleccionar</option>
                <option value="0" > Habilitar </option>
                <option value="1" > Cancelar </option>
              </select>
            </div>
          </div>

          <button type="submit" class="boton" id="habilitarExcepcion">
            + Agregar fecha
          </button>

        </div>

        <h3 class="subtitulo-horarios">Vista previa de Excepciones</h3>
        <div id="listaExcepcionesHabilitadas" class="horarios-grid"></div>

        <div class="boton-final-container">
          <button type="button" class="botonCambiarForm" id="btnFormConfigurarEspectaculo">
            Configurar espectáculos
          </button>
          <button type="button" class="boton boton-final disabled" id="btnGuardarDiasFijos">
            Guardar
          </button>
        </div>
      </form>
    `;

    modalContenido.innerHTML = htmlContent;
    modalDiasFijos.appendChild(modalContenido);

    return modalDiasFijos;
  }

  modalConfigurarHorarios() {
    const modalHorarios = document.createElement("div");
    modalHorarios.classList.add("wrapper");
    modalHorarios.id = "modalConfigurarHorarios";

    const modalHorarioContenido = document.createElement("div");
    modalHorarioContenido.classList.add("wrapper-content");

    const dias = DIAS_SEMANA.map((nombre) => ({
      nombre,
      abierto: false,
      horaApertura: "",
      horaCierre: "",
    }));

    const botonesDiasHTML = dias
      .map(
        (dia, index) => `
      <button type="button"
          id="btnDia${index}"
          class="toggle-btn ${dia.abierto ? "active" : ""}">
        ${dia.nombre}
      </button>
    `,
      )
      .join("");

    const htmlContent = `
      <form id="formConfigurarHorariosEmpresa">
        <header id="header-wrapper">
          <h2 id="titulo-wrapper" class="titulo">Configuración de Horarios</h2>
          <button type="button" id="cerrar-wrapper" class="boton-cerrar">&times;</button>
        </header>

        <div class="modulos">
          <text id="titulo-modulos" class="required"> Seleccione los días de apertura </text>

          <div class="lista-botones">
            ${botonesDiasHTML}
          </div>

          <div class="form-group">
            <label for="horaApertura" class="required">Hora de Apertura</label>
            <input type="time" id="horaApertura" name="horaApertura" required>
          </div>

          <div class="form-group">
            <label for="horaCierre" class="required">Hora de Cierre</label>
            <input type="time" id="horaCierre" name="horaCierre" required>
          </div>

          <!-- ESTE submit es para REGISTRAR en el array -->
          <button type="submit" class="boton" id="boton-registrar-horarios">
            + Registrar
          </button>
          
        </div>

        <div class="lista-horarios"></div>
          <!-- LISTA DE HORARIOS -->
          <h3 class="subtitulo-horarios">Vista previa de Horarios</h3>
          <div id="listaHorariosRegistrados" class="horarios-grid"></div>
        </div>


        <!-- BOTÓN FINAL -->
        <div class="boton-final-container">
          <button type="button" class="botonCambiarForm" id="btnFormDiasNoLaborales">
            Configurar días no laborales
          </button>

          <button type="button" class="boton boton-final disabled" id="btnGuardarHorarios">
            Guardar
          </button>
        </div>
      </form>
    `;

    modalHorarioContenido.innerHTML = htmlContent;
    modalHorarios.appendChild(modalHorarioContenido);

    return modalHorarios;
  }

  modalConfigurarDiasNoLaborales() {
    const modalDiasNoLaborales = document.createElement("div");
    modalDiasNoLaborales.classList.add("wrapper");
    modalDiasNoLaborales.id = "modalConfigurarDiasNoLaborales";

    const modalContenido = document.createElement("div");
    modalContenido.classList.add("wrapper-content");

    const htmlContent = `
      <form id="formConfigurarDiasNoLaborales">
        <header id="header-wrapper">
          <h2 id="titulo-wrapper" class="titulo">Configuración de días no laborales</h2>
          <button type="button" id="cerrar-wrapper-dias-no-laborales" class="boton-cerrar">&times;</button>
        </header>

        <div class="modulos">
          <text id="titulo-modulos-dia"> Agregar día individual </text>

          <div class="form-group">
            <label for="fechaNoLaboral">Fecha:</label>
            <input type="date" class="fecha-no-laboral-input" id="fechaNoLaboral" name="fechaNoLaboral" title="Seleccioná una fecha">
          </div>

          <button type="button" class="boton" id="agregarDiaNoLaboral">
            + Agregar día
          </button>

          <text id="titulo-modulos-rango"> Agregar rango de fechas </text>

          <div class="form-group">
            <label for="fechaNoLaboralInicio">Desde:</label>
            <input type="date" class="fecha-no-laboral-input" id="fechaNoLaboralInicio" name="fechaNoLaboralInicio" title="Seleccioná una fecha">
          </div>

          <div class="form-group">
            <label for="fechaNoLaboralFin">Hasta:</label>
            <input type="date" class="fecha-no-laboral-input" id="fechaNoLaboralFin" name="fechaNoLaboralFin" title="Seleccioná una fecha">
          </div>

          <button type="button" class="boton" id="agregarRangoNoLaboral">
            + Agregar rango
          </button>
        </div>

        <h3 class="subtitulo-horarios">Vista previa de Días no laborales </h3>
        <div id="listaDiasNoLaborales" class="horarios-grid"></div>

        <div class="boton-final-container">
          <button type="button" class="botonCambiarForm" id="btnFormConfigurarHorarios">
            Configurar horarios
          </button>
          <button type="submit" class="boton boton-final disabled" id="btnGuardarDiasNoLaborales">
            Guardar
          </button>
        </div>
      </form>
    `;

    modalContenido.innerHTML = htmlContent;
    modalDiasNoLaborales.appendChild(modalContenido);

    return modalDiasNoLaborales;
  }

  modalMeseros() {
    return `
      <div class="wrapper" id="modalMeseros">
        <div class="wrapper-content" id="lista-meseros-contenido">
          <form id="formConfigurarHorariosEmpresa">
            <header id="header-wrapper">
              <h2 id="titulo-wrapper" class="titulo">Configuración de Meseros</h2>
              <button type="button" id="cerrar-wrapper" class="boton-cerrar">&times;</button>
            </header>

            <div class="modulos">
              <div class="lista-meseros">
              </div>
              <div class="mesero-item" id="contenedorRegistrarMesero">
                <button type="button" class="boton-mesero" id="btnRegistrarMesero">
                  + Registrar Mesero
                </button>
              </div>
            </div>
          </form>
          

          <div class="contrasena-compartida-meseros">
            <form class="form-group" id="formRegistrarContrasenaCompartida">
              <label for="contrasenaCompartida">Contraseña compartida:</label>
              
              <input 
                type="password" 
                id="contrasenaCompartida" 
                name="contrasenaCompartida" 
                maxlength="20"
              >

              <button 
                type="button"
                class="btn-mesero btn-eliminar" 
                id="btnEliminarContrasenaCompartida"
              >
                <img src="../../../../Archivos/Iconos/trash.svg" alt="Eliminar">
              </button>

              <button 
                type="submit" 
                class="mesero-item" 
                id="btnGuardarContrasenaCompartida"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        <div class="boton-final-container-meseros">
          <button type="button" class="boton-mesero" id="btnCargarMeseros">
            + Cargar Meseros
          </button>
        </div>
      </div>
    `;
  }

  modalCargarMeseros() {
    const modalCargarMeseros = document.createElement("div");
    modalCargarMeseros.classList.add("modal-configurar");
    modalCargarMeseros.id = "modalCargarMeseros";

    const modalCargarMeserosContenido = document.createElement("div");
    modalCargarMeserosContenido.classList.add("modal-content-partial");

    const htmlContent = `
      <form id="formCargarMeseros">
        <h2 id="titulo-modal">Cargar Meseros</h2>
        <div class="form-group">
          <label for="archivo">Seleccionar archivo Excel:</label>
          <input type="file" id="archivo" name="archivo"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            required>
        </div>
        <div >
          <button type="submit" class="submit-button">Cargar</button>
        </div>
      </form>
    `;

    modalCargarMeserosContenido.innerHTML = htmlContent;
    modalCargarMeseros.appendChild(modalCargarMeserosContenido);

    return modalCargarMeseros;
  }

  modalRegistrarMesero() {
    const modalRegistrarMesero = document.createElement("div");
    modalRegistrarMesero.classList.add("modal-configurar");
    modalRegistrarMesero.id = "modalRegistrarMesero";

    const modalRegistrarMeseroContenido = document.createElement("div");
    modalRegistrarMeseroContenido.classList.add("modal-content-partial");

    const htmlContent = `
      <form id="formRegistrarMesero">
        <h2 id="titulo-modal">Registrar Mesero</h2>
        <div class="form-group">
          <label for="nombre" class="required">Nombre</label>
          <input type="text" id="nombre" name="nombre" required>
        </div>
        <div class="form-group">
          <label for="abreviaturaNombre">Abreviatura</label>
          <input type="text" id="abreviaturaNombre" name="abreviaturaNombre" maxlength="10">
        </div>
        <div class="form-group">
          <label for="contrasena">Contraseña</label>
          <input type="password" id="contrasena" name="contrasena" maxlength="20">
        </div>
        <button type="submit" class="boton" id="btnGuardarMesero">
          Guardar
        </button>
        
      </form>
    `;

    modalRegistrarMeseroContenido.innerHTML = htmlContent;
    modalRegistrarMesero.appendChild(modalRegistrarMeseroContenido);

    return modalRegistrarMesero;
  }

  modalModificarMesero(mesero) {
    const modalModificarMesero = document.createElement("div");
    modalModificarMesero.classList.add("modal-configurar");
    modalModificarMesero.id = "modalModificarMesero";

    const modalModificarMeseroContenido = document.createElement("div");
    modalModificarMeseroContenido.classList.add("modal-content-partial");

    const htmlContent = `
      <form id="formModificarMesero">
        <h2 id="titulo-modal">Modificar Mesero</h2>
        <div class="form-group">
          <label for="nombre" class="required">Nombre</label>
          <input type="text" id="nombre" name="nombre" value="${mesero.nombre}" required>
        </div>
        <div class="form-group">
          <label for="abreviaturaNombre">Abreviatura</label>
          <input type="text" id="abreviaturaNombre" name="abreviaturaNombre" value="${mesero.abreviaturaNombre}" maxlength="10" required>
        </div>
        <div class="form-group">
          <label for="contrasena">Contraseña</label>
          <input type="password" id="contrasena" name="contrasena" placeholder="Dejar en blanco para no cambiar" maxlength="20">
        </div>
        <button type="submit" class="boton" id="btnGuardarMesero">
          Guardar
        </button>
      </form>
    `;

    modalModificarMeseroContenido.innerHTML = htmlContent;
    modalModificarMesero.appendChild(modalModificarMeseroContenido);

    return modalModificarMesero;
  }

  modalModificar(moderador) {
    const modalNuevaEmpresa = document.createElement("div");
    modalNuevaEmpresa.classList.add("modal-backdrop");
    modalNuevaEmpresa.id = "modalModificarEmpresa";

    const modalNuevaEmpresaContenido = document.createElement("div");
    modalNuevaEmpresaContenido.classList.add("modal-content");

    const htmlContent = `
      <form id="formModificarEmpresa">
      <div id="header-wrapper">
        <h2 id ="titulo-modal">Modificar ${this.nombre}</h2>
        <button type="button" id="cerrar-wrapper" class="boton-cerrar">&times;</button>
      </div>
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" name="nombre" value="${this.nombre}" required>
        </div>
        <div class="form-group">
          <label for="telefono">Nro de telefono</label>
          <input type="text" id="telefono" name="telefono" value="${this.telefono}" maxlength=18 >
        </div>
        <div class="form-group">
          <label for="ubicacion" >Direccion</label>
          <input type="text" id="ubicacion" name="ubicacion" value="${this.ubicacion}" >
        </div>
        <text id="titulo-modulos"> Módulos Disponibles </text>
        <div class="lista-botones">
          <button type="button"
              id="btnCarrito"
              class="toggle-btn ${this.tieneCarrito ? "active" : ""}">
            Módulo Carrito
          </button>

          <button type="button"
              id="btnMesero"
              class="toggle-btn ${this.moduloMesero ? "active" : ""}">
            Módulo Mesero
          </button>

          <button type="button"
              id="btnDeshabilitarExcel"
              class="toggle-btn ${this.deshabilitarExcel ? "active" : ""}">
            Deshabilitar Excel
          </button>
        </div>
        <text id="titulo-modulos"> Métodos de pago </text>
        <div class="lista-botones">
          <button type="button"
              id="btnEfectivo"
              class="toggle-btn ${this.efectivo ? "active" : ""}">
            Efectivo
          </button>

          <button type="button"
              id="btnTarjeta"
              class="toggle-btn ${this.tarjeta ? "active" : ""}">
            Tarjeta
          </button>

          <button type="button"
              id="btnTransferencia"
              class="toggle-btn ${this.transferencia ? "active" : ""}">
            Transferencia
          </button>
        </div>
        <input type="hidden" name="tieneCarrito" id="tieneCarrito" value="${!!this.tieneCarrito}">
        <input type="hidden" name="moduloMesero" id="moduloMesero" value="${!!this.moduloMesero}">
        <input type="hidden" name="deshabilitarExcel" id="deshabilitarExcel" value="${!!this.deshabilitarExcel}">
        <input type="hidden" name="efectivo" id="efectivo" value="${!!this.efectivo}">
        <input type="hidden" name="tarjeta" id="tarjeta" value="${!!this.tarjeta}">
        <input type="hidden" name="transferencia" id="transferencia" value="${!!this.transferencia}">
        <div class="form-group">
          <label for="imagen">Imagen</label>
          <input type="file" id="imagen" name="imagen" accept="image/*">
        </div>
        <div class="form-group">
          <label for="usuario">Usuario</label>
          <input type="text" id="usuario" name="usuario" value="${moderador.nombre}" required>
        </div>
        <div class="form-group">
          <label for="contrasena">Contraseña</label>
          <input type="password" id="contrasena" name="contrasena" placeholder="Dejar vacío en caso de no cambiar la contrasena">
        </div>
        <div class="footer-wrapper">
        <button type="submit" class="submit-button" id="boton-guardar-empresa">Enviar</button>
        </div>
      </form>
    `;
    modalNuevaEmpresaContenido.innerHTML = htmlContent;

    modalNuevaEmpresa.appendChild(modalNuevaEmpresaContenido);

    return modalNuevaEmpresa;
  }

  modalConfigurarEmpresa() {
    const modalConfigurarEmpresa = document.createElement("div");
    modalConfigurarEmpresa.classList.add("modal-configurar");
    modalConfigurarEmpresa.id = "modal-configuracion-empresa";

    const modalConfigurarEmpresaContenido = document.createElement("div");
    modalConfigurarEmpresaContenido.classList.add("modal-content-configurar");
    const htmlContent = `
      <form id="form-configurar-empresa">
        <div class="header-configurar">
          <h2 id = "nombre-empresa-modal">${this.nombre}</h2>
          <div id = "botones-empresa" >
            <button id = "seccion-modificar" class="botones-empresa" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            <button type="button" id="btn-eliminar-empresa" class="botones-empresa">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <h3 id = "id-empresa"> ID ${this.id} </h3>
        <button type = "button" class = "submit-button" id = "configurar-horarios" >Horarios</button>
        <button type = "button" class = "submit-button" id = "configurar-espectaculos" >Espectáculos</button>
        <button type = "button" class = "submit-button" id = "meseros" >Meseros</button>
        <button type = "button" class = "submit-button" id = "qr-configuracion" >QR</button>
      </form>
    `;

    modalConfigurarEmpresaContenido.innerHTML = htmlContent;
    modalConfigurarEmpresa.appendChild(modalConfigurarEmpresaContenido);

    modalConfigurarEmpresa
      .querySelector("#qr-configuracion")
      .addEventListener("click", () => {
        const modalQR = this.modalQRConfiguracion();
        document.querySelector(".lista-central").classList.add("hidden");
        document.body.appendChild(modalQR); // Ensure modal is appended to the DOM
      });

    return modalConfigurarEmpresa;
  }

  modalModificarParaModerador(moderador) {
    const modalModificarEmpresa = document.createElement("div");
    modalModificarEmpresa.classList.add("modal-backdrop");
    modalModificarEmpresa.id = "modalModificarEmpresa";

    const modalModificarEmpresaContenido = document.createElement("div");
    modalModificarEmpresaContenido.classList.add("modal-content");
    const htmlContent = `
      <form id="formModificarEmpresa">
        <div id="header-wrapper">
          <h2 id ="titulo-modal">Modificar datos</h2>
          <button type="button" id="cerrar-wrapper" class="boton-cerrar">&times;</button>
        </div>
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" name="nombre" value="${this.nombre}" required>
        </div>
        <div class="form-group">
          <label for="telefono">Nro de telefono</label>
          <input type="text" id="telefono" name="telefono" value="${this.telefono}" maxlength=18>
        </div>
        <div class="form-group">
          <label for="ubicacion">Direccion</label>
          <input type="text" id="ubicacion" name="ubicacion" value="${this.ubicacion}">
        </div>
        <text id="titulo-modulos"> Métodos de pago </text>
        <div class="lista-botones">
          <button type="button"
              id="btnEfectivo"
              class="toggle-btn ${this.efectivo ? "active" : ""}">
            Efectivo
          </button>

          <button type="button"
              id="btnTarjeta"
              class="toggle-btn ${this.tarjeta ? "active" : ""}">
            Tarjeta
          </button>

          <button type="button"
              id="btnTransferencia"
              class="toggle-btn ${this.transferencia ? "active" : ""}">
            Transferencia
          </button>
        </div>

        <input type="hidden" name="efectivo" id="efectivo" value="${!!this.efectivo}">
        <input type="hidden" name="tarjeta" id="tarjeta" value="${!!this.tarjeta}">
        <input type="hidden" name="transferencia" id="transferencia" value="${!!this.transferencia}">

        <div class="lista-botones form-group precios">
          <label for="precio-delivery">Precio de delivery</label>
          <select id="precio-delivery" name="precio-delivery">
            <option value="1" ${this.precio_delivery === 1 ? "selected" : ""}>Sin determinar</option>
            <option value="2" ${this.precio_delivery === 2 ? "selected" : ""}>Precio 2</option>
            <option value="3" ${this.precio_delivery === 3 ? "selected" : ""}>Precio 3</option>
          </select>

          <label for="precio-espectaculo">Precio de espectáculo</label>
          <select id="precio-espectaculo" name="precio-espectaculo">
            <option value="1" ${this.precio_espectaculo === 1 ? "selected" : ""}>Sin determinar</option>
            <option value="2" ${this.precio_espectaculo === 2 ? "selected" : ""}>Precio 2</option>
            <option value="3" ${this.precio_espectaculo === 3 ? "selected" : ""}>Precio 3</option>
          </select>
        </div>

        <text id="titulo-modulos"> Funcionalidades </text>

        <div class="lista-botones funcionalidades">
          <button
            type="button"
            id="btnPedirCuenta"
            class="toggle-btn ${this.botonPedirCuenta ? "active" : ""}">
            Pedir cuenta
          </button>

          <button
            type="button"
            id="btnLlamarMesero"
            class="toggle-btn ${this.botonLlamarMesero ? "active" : ""}">
            Llamar mesero
          </button>

          <button
            type="button"
            id="btnUnicoPrecio"
            class="toggle-btn ${this.unicoPrecio ? "active" : ""}">
            Único precio
          </button>
        </div>

        <input
          type="hidden"
          name="pedirCuenta"
          id="pedirCuenta"
          value="${!!this.botonPedirCuenta}">

        <input
          type="hidden"
          name="llamarMesero"
          id="llamarMesero"
          value="${!!this.botonLlamarMesero}">

        <input
          type="hidden"
          name="unicoPrecio"
          id="unicoPrecio"
          value="${this.unicoPrecio}">
        
        <div class="form-group">
          <label for="imagen">Imagen</label>
          <input type="file" id="imagen" name="imagen" accept="image/*">
        </div>
        <div class="form-group">
          <label for="usuario">Usuario</label>
          <input type="text" id="usuario" name="usuario" value="${moderador.nombre}" required>
        </div>
        <div class="form-group">
          <label for="contrasena">Contraseña</label>
          <input type="password" id="contrasena" name="contrasena" placeholder="Dejar vacío en caso de no cambiar la contrasena">
        </div>
        <div class="footer-wrapper">
          <button type="submit" id="boton-guardar-empresa">Enviar</button>
        </div>
      </form>
    `;
    modalModificarEmpresaContenido.innerHTML = htmlContent;
    if (!this.tieneCarrito) {
      const listaBotones =
        modalModificarEmpresaContenido.querySelector(".lista-botones");
      const btnEfectivo =
        modalModificarEmpresaContenido.querySelector("#btnEfectivo");
      const btnTarjeta =
        modalModificarEmpresaContenido.querySelector("#btnTarjeta");
      const btnTransferencia =
        modalModificarEmpresaContenido.querySelector("#btnTransferencia");
      const textoMetodosPago =
        modalModificarEmpresaContenido.querySelector("#titulo-modulos");
      listaBotones.classList.add("hidden");
      textoMetodosPago.classList.add("hidden");
      btnEfectivo.classList.add("hidden");
      btnTarjeta.classList.add("hidden");
      btnTransferencia.classList.add("hidden");
    }

    modalModificarEmpresa.appendChild(modalModificarEmpresaContenido);

    return modalModificarEmpresa;
  }

  modalQRConfiguracion() {
    const modalQR = document.createElement("div");
    modalQR.classList.add("modal-backdrop");
    modalQR.id = "modal-qr-configuracion";

    const modalQRContenido = document.createElement("div");
    modalQRContenido.classList.add("modal-content");

    const htmlContent = `
    <div class="header-configurar">
      <h2 id="generar-qr-titulo">Generar QR</h2>
      <button type="button" id="cerrar-qr-modal" class="boton-cerrar">&times;</button>
    </div>

    <div class="engrupador">

      <div class="qr-options">
        <button id="qr-pagina-cafeteria" class="qr-button">Página de la cafetería (Configuraciones)</button>

        <button id="qr-carta-local" class="qr-button">Carta como cliente en el local</button>

        <button id="qr-carta-fuera" class="qr-button">Carta como cliente fuera del local (Delivery)</button>
        <button id="qr-carta-mesero" class="qr-button">Carta como mesero (Registración de pedidos)</button>
      </div>

      <div id="qr-resultado" style="margin-top:20px; text-align:center;"></div>
    </div>
  `;

    modalQRContenido.innerHTML = htmlContent;
    modalQR.appendChild(modalQRContenido);

    const baseURL = window.location.origin;

    // Eventos
    modalQR
      .querySelector("#qr-pagina-cafeteria")
      .addEventListener("click", () => {
        this.generarQR(`${baseURL}/moderador/${this.id}`, "pagina-cafeteria");
      });

    modalQR.querySelector("#qr-carta-local").addEventListener("click", () => {
      const subModal = this.modalSeleccionMesa();
      document.body.appendChild(subModal);
    });

    modalQR.querySelector("#qr-carta-fuera").addEventListener("click", () => {
      this.generarQR(`${baseURL}/carta/${this.id}`, "carta-delivery");
    });

    modalQR.querySelector("#qr-carta-mesero").addEventListener("click", () => {
      this.generarQR(`${baseURL}/carta/${this.id}/mesero`, "carta-mesero");
    });

    modalQR.querySelector("#cerrar-qr-modal").addEventListener("click", () => {
      modalQR.remove();
      document.querySelector(".lista-central").classList.remove("hidden");
    });

    return modalQR;
  }

  generarQR(url, palabraParaDescargar = "") {
    const contenedor = document.querySelector("#qr-resultado");
    contenedor.innerHTML = "";

    QRCode.toCanvas(url, { width: 200 }, (err, canvas) => {
      if (err) {
        console.error(err);
        return;
      }

      contenedor.appendChild(canvas);

      // Botón descargar
      const btnDescargar = document.createElement("button");
      btnDescargar.textContent = "Descargar QR";
      btnDescargar.classList.add("boton-descargar");
      btnDescargar.style.marginTop = "10px";

      btnDescargar.addEventListener("click", () => {
        const enlace = document.createElement("a");
        enlace.href = canvas.toDataURL("image/png");
        enlace.download = `qr-${this.nombre}-${palabraParaDescargar}.png`;
        enlace.click();
      });

      contenedor.appendChild(btnDescargar);

      // Link clickeable
      const link = document.createElement("a");
      link.href = url;
      link.textContent = url;
      link.target = "_blank";
      link.style.color = "#e89e13";
      link.style.display = "block";
      link.style.marginTop = "10px";

      contenedor.appendChild(link);
    });
  }

  modalSeleccionMesa() {
    const modal = document.createElement("div");
    modal.classList.add("modal-backdrop");

    const contenido = document.createElement("div");
    contenido.classList.add("modal-content");
    contenido.style.maxWidth = "300px";

    contenido.innerHTML = `
    <div class="header-configurar">
      <h3>Ingresar número de mesa (opcional)</h3>
      <button class="boton-cerrar" id="cerrar-submodal">&times;</button>
    </div>

    <div style="padding:15px; display:flex; flex-direction:column; gap:10px;">
      <input type="number" id="input-mesa" min="1" max="500" placeholder="Ej: 12">

      <button id="confirmar-mesa" class="submit-button">Generar QR</button>
    </div>
  `;

    modal.appendChild(contenido);

    // Cerrar
    contenido
      .querySelector("#cerrar-submodal")
      .addEventListener("click", () => modal.remove());

    const baseURL = window.location.origin;

    // Confirmar
    contenido.querySelector("#confirmar-mesa").addEventListener("click", () => {
      const valor = contenido.querySelector("#input-mesa").value;

      let url;

      if (valor && valor >= 1 && valor <= 500) {
        url = `${baseURL}/carta/${this.id}/local/${valor}`;
      } else {
        // slug opcional → sin mesa
        url = `${baseURL}/carta/${this.id}/local`;
      }

      this.generarQR(url, "carta-local" + valor);
      modal.remove();
    });

    return modal;
  }
}
