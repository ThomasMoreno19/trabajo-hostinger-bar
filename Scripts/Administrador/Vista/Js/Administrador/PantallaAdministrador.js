class PantallaAdministrador {
  
  constructor() {
    // Inicializamos el Gestor y los elementos del DOM
    this.listaEmpresas = document.getElementById('lista-empresas');
    this.gestor = new GestorAdministrador();
    this.botonNuevaEmpresa = document.getElementById('alta-empresa');
    window.gestorDeEmpresasCallback = (empresa) => this.modalEmpresaSeleccionada(empresa);
    window.gestorDeModeradoresCallback = (moderador) => this.modalModeradorSeleccionado(moderador);
    
    this.agregarEventListeners();
  }
  
  agregarEventListeners() {
      
    if (this.botonNuevaEmpresa) {
      this.botonNuevaEmpresa.addEventListener('click', () => {
        this.abrirModalNuevaEmpresa();
      });
    }
  }
  
  async habilitarVentanaPrincipal() {
    await this.mostrarLista();
  }
  
  async mostrarLista() {

    try {
      const LISTA = await this.gestor.mostrarListaEmpresas();

      this.listaEmpresas.innerHTML = '';
      if (LISTA.length === 0) {
        this.listaEmpresas.innerHTML = `<p class="texto-vacio"> No hay empresas cargadas. </p>`;
      } else {
        LISTA.forEach(empresa => {
          const EMPRESA = new EmpresaVista(empresa);
          this.listaEmpresas.appendChild(EMPRESA.mostrarUna());
        });
      }
    } catch (error) {
      console.error('Error en mostrarListaEmpresas:', error);
      this.listaEmpresas.innerHTML = `
      <p class="texto-error"> Error al cargar los datos: ${error.message}. Por favor, recargue la página. </p>`;
    }
  }
  
  async modalEmpresaSeleccionada(empresa) {
    const MODAL = empresa.modalConfigurarEmpresa();
    
    // Agregamos un ID al modal para poder identificarlo
    document.body.appendChild(MODAL);
    const BOTON_CAMBIAR_LOGO = document.getElementById('cambiar-logo');
    const BOTON_SECCION_MODIFICAR = document.getElementById('seccion-modificar');
    const BOTON_GESTION_ARTICULOS = document.getElementById('visitar-gestion');
    const BOTON_VISITAR_PAGINA = document.getElementById('visitar-pagina');
    
    // Se cierra el modal si se clickea afuera
    MODAL.addEventListener('click', (event) => {
      if (event.target === MODAL) {
        document.body.removeChild(MODAL);
    }});
    
    BOTON_VISITAR_PAGINA.addEventListener('click', (event) => {
      event.preventDefault();
      window.open(`/carta/${empresa.id}`, '_blank');
    });
    
    BOTON_GESTION_ARTICULOS.addEventListener('click', (event) => {
      event.preventDefault();
      window.open(`/moderador/${empresa.id}`, '_blank');
    });
    
    BOTON_SECCION_MODIFICAR.addEventListener('click', async (event) => {
      event.preventDefault();
      await this.abrirModalModificar(empresa, MODAL);
      document.body.removeChild(MODAL);
    });
    
    BOTON_CAMBIAR_LOGO.addEventListener('click', async (event) => {
      event.preventDefault();
      await this.abrirModalCambiarLogo(empresa, MODAL);
      document.body.removeChild(MODAL);
    });
  }
  
  abrirModalNuevaEmpresa() {
    const MODAL = EmpresaVista.modalNuevaEmpresa();

    document.body.appendChild(MODAL);
    
    MODAL.addEventListener('click', (event) => {
      if (event.target === MODAL) {
        document.body.removeChild(MODAL);}});

      // Listener para los botones de metodos de pago
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('active');
          const activo = btn.classList.contains('active');

          if(btn.id === 'btnMesero') {
            document.getElementById('moduloMesero').value = activo;
          }
          if(btn.id === 'btnCarrito') {
            document.getElementById('tieneCarrito').value = activo;
          }
          if (btn.id === 'btnEfectivo') {
            document.getElementById('efectivo').value = activo;
          }

          if (btn.id === 'btnTarjeta') {
            document.getElementById('tarjeta').value = activo;
          }

          if (btn.id === 'btnTransferencia') {
            document.getElementById('transferencia').value = activo;
          }
        });
      });
    const FORM = document.getElementById('formNuevaEmpresa');
    FORM.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const FORMDATA = new FormData(FORM);
      const NOMBRE = FORMDATA.get('nombre');
      const IMAGEN = FORMDATA.get('imagen');
      const TELEFONO = FORMDATA.get('telefono');
      const UBICACION = FORMDATA.get('ubicacion');
      const TIENE_CARRITO = FORMDATA.get('tieneCarrito') === 'true';
      const MODULO_MESERO = FORMDATA.get('moduloMesero') === 'true';
      const EFECTIVO = FORMDATA.get('efectivo') === 'true';
      const TARJETA = FORMDATA.get('tarjeta') === 'true';
      const TRANSFERENCIA = FORMDATA.get('transferencia') === 'true';
      const USUARIO = FORMDATA.get('usuario');
      const CONTRASENA = FORMDATA.get('contrasena');

      try {
        // Llamamos al método del gestor con el nombre y el archivo.
        const EMPRESA = await this.gestor.crearEmpresa(NOMBRE, TELEFONO, UBICACION, TIENE_CARRITO, MODULO_MESERO, EFECTIVO, TARJETA, TRANSFERENCIA, IMAGEN);
        await this.gestor.crearModerador(USUARIO, EMPRESA.id, CONTRASENA);
        MODAL.classList.add('hidden');
        document.body.removeChild(MODAL);
        await this.mostrarLista();
          
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }
  
  async abrirModalModificar(empresa, modalPadre) {
    const MODERADOR = await this.gestor.obtenerModerador(empresa.id);
    const MODAL = empresa.modalModificar(MODERADOR);
    
    document.body.appendChild(MODAL);
    
    MODAL.addEventListener('click', (event) => {
      if (event.target === MODAL) {
        MODAL.classList.add('hidden');
        document.body.appendChild(modalPadre);
        document.body.removeChild(MODAL);  
      }
    });

    // Listener para los botones de metodos de pago
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const activo = btn.classList.contains('active');

        if(btn.id === 'btnMesero') {
          document.getElementById('moduloMesero').value = activo;
        }
        if(btn.id === 'btnCarrito') {
          document.getElementById('tieneCarrito').value = activo;
        }
        if (btn.id === 'btnEfectivo') {
          document.getElementById('efectivo').value = activo;
        }

        if (btn.id === 'btnTarjeta') {
          document.getElementById('tarjeta').value = activo;
        }

        if (btn.id === 'btnTransferencia') {
          document.getElementById('transferencia').value = activo;
        }
      });
    });
    
    const FORM = document.getElementById('formModificarEmpresa');
    FORM.addEventListener('submit', async (event) => {
      event.preventDefault();
      const FORMDATA = new FormData(FORM);
      const NOMBRE = FORMDATA.get('nombre');
      const TELEFONO = FORMDATA.get('telefono');
      const UBICACION = FORMDATA.get('ubicacion');
      const TIENE_CARRITO = FORMDATA.get('tieneCarrito') === 'true';
      const MODULO_MESERO = FORMDATA.get('moduloMesero') === 'true';
      const EFECTIVO = FORMDATA.get('efectivo') === 'true';
      const TARJETA = FORMDATA.get('tarjeta') === 'true';
      const TRANSFERENCIA = FORMDATA.get('transferencia') === 'true';
      const USUARIO = FORMDATA.get('usuario');
      const CONTRASENA = FORMDATA.get('contrasena');
    
      try {
        // Llamamos al método del gestor con el nombre y el archivo.
        await this.gestor.modificarModerador(MODERADOR.id, USUARIO, CONTRASENA);
        this.gestor.modificarEmpresa(empresa.id, NOMBRE, TELEFONO, UBICACION, TIENE_CARRITO, MODULO_MESERO, EFECTIVO, TARJETA, TRANSFERENCIA);
        MODAL.classList.add('hidden');
        document.body.removeChild(MODAL);
        await this.mostrarLista();
          
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }
  
  async abrirModalCambiarLogo(empresa, modalPadre) {
    const MODAL = empresa.modalCambiarLogo();
    
    document.body.appendChild(MODAL);
    
    MODAL.addEventListener('click', (event) => {
    if (event.target === MODAL) {
      document.body.appendChild(modalPadre);
      document.body.removeChild(MODAL);
    }});

    const FORM = document.getElementById('formCambiarLogoEmpresa');
    FORM.addEventListener('submit', async (event) => {
      event.preventDefault();
      const FORMDATA = new FormData(FORM);
      const IMAGEN = FORMDATA.get('imagen');
      
      try {
        await this.gestor.cambiarLogoEmpresa(empresa.id, IMAGEN, empresa.nombre);
        MODAL.classList.add('hidden');
        document.body.removeChild(MODAL);
        await this.mostrarLista();
        
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }
}


// --- Inicialización ---
// Se crea una instancia de PantallaAdministrador cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    const PANTALLA = new PantallaAdministrador();
    PANTALLA.habilitarVentanaPrincipal();
});