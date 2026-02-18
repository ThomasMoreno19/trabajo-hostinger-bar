class EmpresaVista {
  
  constructor(empresa) {
    this.id = empresa.id;
    this.nombre = empresa.nombre;
    this.telefono = empresa.telefono;
    this.ubicacion = empresa.ubicacion;
    this.tieneCarrito = empresa.tieneCarrito ?? false;
    this.moduloMesero = empresa.moduloMesero ?? false;
    this.efectivo = empresa.efectivo ?? false;
    this.tarjeta = empresa.tarjeta ?? false;
    this.transferencia = empresa.transferencia ?? false;
    this.logo_url = empresa.logo_url;
  }

  update(nombre, telefono, ubicacion, efectivo, tarjeta, transferencia){
    this.nombre = nombre;
    this.telefono = telefono;
    this.ubicacion = ubicacion;
    this.efectivo = efectivo;
    this.tarjeta = tarjeta;
    this.transferencia = transferencia;
  }

  mostrarUna() {
    const divEmpresa = document.createElement('div');
    divEmpresa.classList.add('empresa');
    divEmpresa.dataset.empresaId = this.id;  //🤣😎
    divEmpresa.style.backgroundImage = `url('${this.logo_url || '/Archivos/Logos/Vacio.png'}')`;
    
    const pNombre = document.createElement('p');
    pNombre.textContent = this.nombre;
    divEmpresa.appendChild(pNombre);
    
    divEmpresa.addEventListener('click', () => {
      const event = new CustomEvent('empresaSeleccionada', { detail: { empresaId: this.id, empresaNombre: this.nombre, empresaTelefono: this.telefono, empresaUbicacion: this.ubicacion, empresaTieneCarrito: this.tieneCarrito, empresaModuloMesero: this.moduloMesero, empresaEfectivo: this.efectivo, empresaTarjeta: this.tarjeta, empresaTransferencia: this.transferencia, empresaLogoUrl: this.logo_url } });
      document.dispatchEvent(event);
      if (typeof window.gestorDeEmpresasCallback === 'function') {
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
      console.error('Error al asignar el ícono o el título de la pestaña:', error);
    }
  }
  
  static modalNuevaEmpresa() {
    const modalNuevaEmpresa = document.createElement('div');
    modalNuevaEmpresa.classList.add('modal-backdrop');
    modalNuevaEmpresa.id = 'modalNuevaEmpresa';

    const modalNuevaEmpresaContenido = document.createElement('div');
    modalNuevaEmpresaContenido.classList.add('modal-content');
    
    const htmlContent = `
      <form id="formNuevaEmpresa">
        <h2 id ="titulo-modal">Nueva Cafetería/Bar</h2>
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" id="nombre" name="nombre" required>
        </div>
        <div class="form-group">
          <label for="telefono">Nro de telefono:</label>
          <input type="text" id="telefono" name="telefono" maxlength=18 required>
        </div>
        <div class="form-group">
          <label for="ubicacion">Direccion:</label>
          <input type="text" id="ubicacion" name="ubicacion" required>
        </div>
        <text id="titulo-modulos"> Módulos Disponibles </text>
        <div class="lista-botones">
          <button type="button"
              id="btnCarrito"
              class="toggle-btn ${this.tieneCarrito ? 'active' : ''}">
            Módulo Carrito
          </button>

          <button type="button"
              id="btnMesero"
              class="toggle-btn ${this.moduloMesero ? 'active' : ''}">
            Módulo Mesero
          </button>
        </div>
        <text id="titulo-modulos"> Métodos de pago </text>
        <div class="lista-botones">
          <button type="button"
              id="btnEfectivo"
              class="toggle-btn ${this.efectivo ? 'active' : ''}">
            Efectivo
          </button>

          <button type="button"
              id="btnTarjeta"
              class="toggle-btn ${this.tarjeta ? 'active' : ''}">
            Tarjeta
          </button>

          <button type="button"
              id="btnTransferencia"
              class="toggle-btn ${this.transferencia ? 'active' : ''}">
            Transferencia
          </button>
        </div>
        <input type="hidden" name="tieneCarrito" id="tieneCarrito" value="${!!this.tieneCarrito}">
        <input type="hidden" name="moduloMesero" id="moduloMesero" value="${!!this.moduloMesero}">
        <input type="hidden" name="efectivo" id="efectivo" value="${!!this.efectivo}">
        <input type="hidden" name="tarjeta" id="tarjeta" value="${!!this.tarjeta}">
        <input type="hidden" name="transferencia" id="transferencia" value="${!!this.transferencia}">
        <div class="form-group">
          <label for="imagen">Imagen:</label>
          <input type="file" id="imagen" name="imagen" accept="image/*">
        </div>
        <div class="form-group">
          <label for="usuario">Usuario:</label>
          <input type="text" id="usuario" name="usuario" required>
        </div>
        <div class="form-group">
          <label for="contrasena">Contrasena:</label>
          <input type="password" id="contrasena" name="contrasena" required>
        </div>
        <div class="form-group">
          <label for="contrasenaMesero">Contraseña de Mesero:</label>
          <input type="password" id="contrasenaMesero" name="contrasenaMesero">
        </div>
        <button type="submit" class="submit-button" id="boton-guardar-empresa">Enviar</button>
      </form>
    `;

    modalNuevaEmpresaContenido.innerHTML = htmlContent;
    modalNuevaEmpresa.appendChild(modalNuevaEmpresaContenido);
    
    return modalNuevaEmpresa;
  }

  modalConfigurarHorarios() {
    const modalHorarios = document.createElement('div');
    modalHorarios.classList.add('wrapper');
    modalHorarios.id = 'modalConfigurarHorarios';

    const modalHorarioContenido = document.createElement('div');
    modalHorarioContenido.classList.add('wrapper-content');
    
    const dias = DIAS_SEMANA.map(nombre => ({
      nombre,
      abierto: false,
      horaApertura: '',
      horaCierre: ''
    }));

    const botonesDiasHTML = dias.map((dia, index) => `
      <button type="button"
          id="btnDia${index}"
          class="toggle-btn ${dia.abierto ? 'active' : ''}">
        ${dia.nombre}
      </button>
    `).join('');

    const htmlContent = `
      <form id="formConfigurarHorariosEmpresa">
        <header id="header-wrapper">
          <h2 id="titulo-wrapper" class="titulo">Configuración de Horarios</h2>
          <button type="button" id="cerrar-wrapper" class="boton-cerrar">&times;</button>
        </header>

        <div class="modulos">
          <text id="titulo-modulos"> Seleccione los días de apertura </text>

          <div class="lista-botones">
            ${botonesDiasHTML}
          </div>

          <div class="form-group">
            <label for="horaApertura">Hora de Apertura:</label>
            <input type="time" id="horaApertura" name="horaApertura" required>
          </div>

          <div class="form-group">
            <label for="horaCierre">Hora de Cierre:</label>
            <input type="time" id="horaCierre" name="horaCierre" required>
          </div>

          <!-- ESTE submit es para REGISTRAR en el array -->
          <button type="submit" class="boton" id="boton-registrar-horarios">
            + Registrar
          </button>
          
        </div>

        <div class="lista-horarios"></div>
          <!-- LISTA DE HORARIOS -->
          <h3 class="subtitulo-horarios">Horarios registrados</h3>
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
    const modalDiasNoLaborales = document.createElement('div');
    modalDiasNoLaborales.classList.add('wrapper');
    modalDiasNoLaborales.id = 'modalConfigurarDiasNoLaborales';

    const modalContenido = document.createElement('div');
    modalContenido.classList.add('wrapper-content');

    const htmlContent = `
      <form id="formConfigurarDiasNoLaborales">
        <header id="header-wrapper">
          <h2 id="titulo-wrapper" class="titulo">Configuración de días no laborales</h2>
          <button id="cerrar-wrapper-dias-no-laborales" class="boton-cerrar">&times;</button>
        </header>

        <div class="modulos">
          <text id="titulo-modulos-dia"> Agregar día individual </text>

          <div class="form-group">
            <label for="fechaNoLaboral">Fecha:</label>
            <input type="date" id="fechaNoLaboral" name="fechaNoLaboral">
          </div>

          <button type="button" class="boton" id="agregarDiaNoLaboral">
            + Agregar día
          </button>

          <text id="titulo-modulos-rango"> Agregar rango de fechas </text>

          <div class="form-group">
            <label for="fechaNoLaboralInicio">Desde:</label>
            <input type="date" id="fechaNoLaboralInicio" name="fechaNoLaboralInicio">
          </div>

          <div class="form-group">
            <label for="fechaNoLaboralFin">Hasta:</label>
            <input type="date" id="fechaNoLaboralFin" name="fechaNoLaboralFin">
          </div>

          <button type="button" class="boton" id="agregarRangoNoLaboral">
            + Agregar rango
          </button>
        </div>

        <h3 class="subtitulo-horarios">Días no laborales registrados</h3>
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
  
  
  
  modalModificar(moderador) {
    const modalNuevaEmpresa = document.createElement('div');
    modalNuevaEmpresa.classList.add('modal-backdrop');
    modalNuevaEmpresa.id = 'modalModificarEmpresa';

    const modalNuevaEmpresaContenido = document.createElement('div');
    modalNuevaEmpresaContenido.classList.add('modal-content');
    
    const htmlContent = `
      <form id="formModificarEmpresa">
        <h2 id ="titulo-modal">Modificar ${this.nombre}</h2>
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" id="nombre" name="nombre" value="${this.nombre}" required>
        </div>
        <div class="form-group">
          <label for="telefono">Nro de telefono:</label>
          <input type="text" id="telefono" name="telefono" value="${this.telefono}" maxlength=18 required>
        </div>
        <div class="form-group">
          <label for="ubicacion">Direccion:</label>
          <input type="text" id="ubicacion" name="ubicacion" value="${this.ubicacion}" required>
        </div>
        <text id="titulo-modulos"> Módulos Disponibles </text>
        <div class="lista-botones">
          <button type="button"
              id="btnCarrito"
              class="toggle-btn ${this.tieneCarrito ? 'active' : ''}">
            Módulo Carrito
          </button>

          <button type="button"
              id="btnMesero"
              class="toggle-btn ${this.moduloMesero ? 'active' : ''}">
            Módulo Mesero
          </button>
        </div>
        <text id="titulo-modulos"> Métodos de pago </text>
        <div class="lista-botones">
          <button type="button"
              id="btnEfectivo"
              class="toggle-btn ${this.efectivo ? 'active' : ''}">
            Efectivo
          </button>

          <button type="button"
              id="btnTarjeta"
              class="toggle-btn ${this.tarjeta ? 'active' : ''}">
            Tarjeta
          </button>

          <button type="button"
              id="btnTransferencia"
              class="toggle-btn ${this.transferencia ? 'active' : ''}">
            Transferencia
          </button>
        </div>
        <input type="hidden" name="tieneCarrito" id="tieneCarrito" value="${!!this.tieneCarrito}">
        <input type="hidden" name="moduloMesero" id="moduloMesero" value="${!!this.moduloMesero}">
        <input type="hidden" name="efectivo" id="efectivo" value="${!!this.efectivo}">
        <input type="hidden" name="tarjeta" id="tarjeta" value="${!!this.tarjeta}">
        <input type="hidden" name="transferencia" id="transferencia" value="${!!this.transferencia}">
        <div class="form-group">
          <label for="usuario">Usuario:</label>
          <input type="text" id="usuario" name="usuario" value="${moderador.nombre}" required>
        </div>
        <div class="form-group">
          <label for="contrasena">Contrasena:</label>
          <input type="password" id="contrasena" name="contrasena" placeholder="Dejar vacío en caso de no cambiar la contrasena">
        </div>
        <div class="form-group">
          <label for="contrasenaMesero">Contraseña de Mesero:</label>
          <input type="password" id="contrasenaMesero" name="contrasenaMesero" placeholder="Dejar vacío en caso de no cambiar la contraseña del mesero">
        </div>
        <button type="submit" class="submit-button" id="boton-guardar-empresa">Enviar</button>
      </form>
    `;
    modalNuevaEmpresaContenido.innerHTML = htmlContent;

    modalNuevaEmpresa.appendChild(modalNuevaEmpresaContenido);
    
    return modalNuevaEmpresa;
  }

  modalConfigurarEmpresa() {
    const modalConfigurarEmpresa = document.createElement('div');
    modalConfigurarEmpresa.classList.add('modal-backdrop');
    modalConfigurarEmpresa.id = 'modal-configuracion-empresa';

    const modalConfigurarEmpresaContenido = document.createElement('div');
    modalConfigurarEmpresaContenido.classList.add('modal-content');
    const htmlContent = `
      <form id="form-configurar-empresa">
        <h2 id = "nombre-empresa-modal">Configuración</h2>
        <button type = "button" class = "submit-button" id = "seccion-modificar" >Modificar datos</button>
        <button type = "button" class = "submit-button" id = "cambiar-logo" >Cambiar Logo</button>
        <button type = "button" class = "submit-button" id = "visitar-pagina" >Página de Carta</button>
        <button type = "button" class = "submit-button" id = "configurar-horarios" >Configurar Horarios</button>
        <button type = "button" class = "submit-button" id = "visitar-gestion" >Página de Gestión</button>
      </form>
    `;

    modalConfigurarEmpresaContenido.innerHTML = htmlContent;
    modalConfigurarEmpresa.appendChild(modalConfigurarEmpresaContenido);
    
    return modalConfigurarEmpresa;
  }

  modalModificarParaModerador(moderador) {
    const modalNuevaEmpresa = document.createElement('div');
    modalNuevaEmpresa.classList.add('modal-backdrop');
    modalNuevaEmpresa.id = 'modalModificarEmpresa';

    const modalNuevaEmpresaContenido = document.createElement('div');
    modalNuevaEmpresaContenido.classList.add('modal-content');
    
    const htmlContent = `
      <form id="formModificarEmpresa">
        <h2 id ="titulo-modal">Modificar datos</h2>
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" id="nombre" name="nombre" value="${this.nombre}" required>
        </div>
        <div class="form-group">
          <label for="telefono">Nro de telefono:</label>
          <input type="text" id="telefono" name="telefono" value="${this.telefono}" maxlength=18 required>
        </div>
        <div class="form-group">
          <label for="ubicacion">Direccion:</label>
          <input type="text" id="ubicacion" name="ubicacion" value="${this.ubicacion}" required>
        </div>
        <text id="titulo-modulos"> Métodos de pago </text>
        <div class="lista-botones">
          <button type="button"
              id="btnEfectivo"
              class="toggle-btn ${this.efectivo ? 'active' : ''}">
            Efectivo
          </button>

          <button type="button"
              id="btnTarjeta"
              class="toggle-btn ${this.tarjeta ? 'active' : ''}">
            Tarjeta
          </button>

          <button type="button"
              id="btnTransferencia"
              class="toggle-btn ${this.transferencia ? 'active' : ''}">
            Transferencia
          </button>
        </div>
        <input type="hidden" name="efectivo" id="efectivo" value="${!!this.efectivo}">
        <input type="hidden" name="tarjeta" id="tarjeta" value="${!!this.tarjeta}">
        <input type="hidden" name="transferencia" id="transferencia" value="${!!this.transferencia}">
        <div class="form-group">
          <label for="usuario">Usuario:</label>
          <input type="text" id="usuario" name="usuario" value="${moderador.nombre}" required>
        </div>
        <div class="form-group">
          <label for="contrasena">Contrasena:</label>
          <input type="password" id="contrasena" name="contrasena" placeholder="Dejar vacío en caso de no cambiar la contrasena">
        </div>
        <div class="form-group">
          <label for="contrasenaMesero">Contraseña de Mesero:</label>
          <input type="password" id="contrasenaMesero" name="contrasenaMesero" placeholder="Dejar vacío en caso de no cambiar la contraseña del mesero">
        </div>
        <button type="submit" class="submit-button" id="boton-guardar-empresa">Enviar</button>
      </form>
    `;
    modalNuevaEmpresaContenido.innerHTML = htmlContent;
    if (!this.tieneCarrito) {
      const listaBotones = modalNuevaEmpresaContenido.querySelector('.lista-botones');
      const btnEfectivo = modalNuevaEmpresaContenido.querySelector('#btnEfectivo');
      const btnTarjeta = modalNuevaEmpresaContenido.querySelector('#btnTarjeta');
      const btnTransferencia = modalNuevaEmpresaContenido.querySelector('#btnTransferencia');
      const textoMetodosPago = modalNuevaEmpresaContenido.querySelector('#titulo-modulos');
      listaBotones.classList.add('hidden');
      textoMetodosPago.classList.add('hidden');
      btnEfectivo.classList.add('hidden');
      btnTarjeta.classList.add('hidden');
      btnTransferencia.classList.add('hidden');
    }

    modalNuevaEmpresa.appendChild(modalNuevaEmpresaContenido);
    
    return modalNuevaEmpresa;
  }
  
  modalCambiarLogo() {
    const modalCambiarLogoEmpresa = document.createElement('div');
    modalCambiarLogoEmpresa.classList.add('modal-backdrop');
    modalCambiarLogoEmpresa.id = 'modalCambiarLogoEmpresa';

    const modalCambiarLogoEmpresaContenido = document.createElement('div');
    modalCambiarLogoEmpresaContenido.classList.add('modal-content');
    
    const htmlContent = `
      <form id="formCambiarLogoEmpresa">
        <h2 id ="titulo-modal">Logo de ${this.nombre}</h2>
        <div class="form-group">
          <label for="imagen">Imagen:</label>
          <input type="file" id="imagen" name="imagen" accept="image/*">
        </div>
        <button type="submit" class="submit-button" id="boton-guardar-logo">Enviar</button>
      </form>
    `;

    modalCambiarLogoEmpresaContenido.innerHTML = htmlContent;
    modalCambiarLogoEmpresa.appendChild(modalCambiarLogoEmpresaContenido);
    
    return modalCambiarLogoEmpresa;
  }

}
