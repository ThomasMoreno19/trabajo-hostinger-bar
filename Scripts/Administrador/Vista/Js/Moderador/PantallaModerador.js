// Scripts/Administrador/Vista/Js/PantallaModerador.js
class PantallaModerador {
  
  constructor() {
    // Inicializamos el Gestor y los elementos del DOM
    this.gestor = new GestorModerador();
    this.listaArticulos = document.getElementById('lista-articulos');
    this.listaRubros = document.getElementById('lista-rubros');
    this.articuloSeleccionado = null;
    
    this.botonListaArticulos = document.getElementById('boton-mostrar-articulos');
    this.botonListaRubros = document.getElementById('boton-mostrar-rubros');
    this.botonCargarArticulos = document.getElementById('boton-cargar-articulos');
    this.botonModificarCafeteria = document.getElementById('modificar-cafeteria');
    
    this.barraBusqueda = document.getElementById('barra-busqueda');
    this.tituloPagina = document.getElementById('titulo-pagina');
    this.loader = document.getElementById('loader');
    window.gestorDeArticulosCallback = (articulo) => this.modalArticuloSeleccionado(articulo);
    window.gestorDeRubrosCallback = (id, id_empresa, nombre, logo_url) => this.modalRubroSeleccionado(id, id_empresa, nombre, logo_url);
    this.agregarEventListeners();
    this.todosLosArticulos = [];
    this.arrayContainerRubro=[];
  }
  
  async init() {
    const data = await this.gestor.conocerEmpresa(this.obtenerIdEmpresa());
    this.empresa = new EmpresaVista(data);
    await this.asignarTituloPagina('Gestión de');
  }
  
  agregarEventListeners() {
    
    if (this.botonListaArticulos && this.botonListaRubros) {
      this.botonListaArticulos.addEventListener('click', () => {
        if(this.loader.classList.contains('hidden')){
          this.botonListaArticulos.classList.add('activo');
          this.botonListaRubros.classList.remove('activo');
          this.listaRubros.classList.add('hidden');
          this.listaArticulos.classList.remove('hidden');
          this.barraBusqueda.classList.remove('hidden');
        }
      });
      
      this.botonListaRubros.addEventListener('click', () => {
        if (this.loader.classList.contains('hidden')){
          this.botonListaArticulos.classList.remove('activo');
          this.botonListaRubros.classList.add('activo');
          this.listaRubros.classList.remove('hidden');
          this.listaArticulos.classList.add('hidden');
          this.barraBusqueda.classList.add('hidden');
        }
      });
    }
    if(this.barraBusqueda){
      this.barraBusqueda.addEventListener('input', () => this.filtrarArticulos());
    }
    this.botonCargarArticulos.addEventListener('click', () => {
      this.abrirModalCargarArticulos();
    });
    
    this.botonModificarCafeteria.addEventListener('click', (event) => {
      event.preventDefault();
      this.configurarEmpresa();
    })
  }
  
  async habilitarVentanaPrincipal() {
    // El método se encarga de mostrar los datos en la pantalla
    this.loader.classList.remove('hidden');
    await this.mostrarLista(this.listaRubros);
    this.listaRubros.classList.add('hidden');
    this.listaArticulos.classList.add('hidden');
    await this.mostrarLista(this.listaArticulos);
    this.loader.classList.add('hidden');
    this.listaArticulos.classList.remove('hidden');
  }
  
  async mostrarLista(lista) {
    if (!lista) return;

    try {
      let esArticulo = (lista === this.listaArticulos);
      lista.innerHTML = ''; // Limpiar la lista antes de cargar nuevos datos

      if (esArticulo) {
        // 1. Obtener la lista de todos los rubros
        const rubrosRecibidos = await this.gestor.mostrarListaRubros(this.empresa.id);

        if (rubrosRecibidos.length === 0) {
          lista.innerHTML = `<p class="texto-vacio"> No se encontraron artículos. </p>`;
          return;
        }
        
        // 2. Iterar sobre cada rubro
        for (const rubroArray of rubrosRecibidos) {
          const id_rubro = rubroArray['id'];
          const nombre_rubro = rubroArray['nombre'];

          // Crear el contenedor para el rubro
          const containerRubro = document.createElement('div');
          containerRubro.classList.add('container-rubro');

          // Crear y agregar el título del rubro
          const nombreRubroTitulo = document.createElement('h2');
          nombreRubroTitulo.classList.add('titulo-rubro');
          nombreRubroTitulo.textContent = nombre_rubro;
          containerRubro.appendChild(nombreRubroTitulo);

          // 3. Obtener la lista de artículos para el rubro actual
          const listaArticulosRecibidos = await this.gestor.mostrarListaArticulos(id_rubro, this.empresa.id);

          // 4. Crear un contenedor para los artículos dentro del rubro
          const listaArticulosDiv = document.createElement('div');
          listaArticulosDiv.classList.add('lista-articulos-rubro');
          
          // Iterar sobre los artículos y crear sus vistas
          if (listaArticulosRecibidos.length > 0) {
            listaArticulosRecibidos.forEach(articulo => {
              const articuloRecibido = new ArticuloVista(articulo);
              // ✅ Corregido: Crear el elemento solo una vez
              const elementoArticulo = articuloRecibido.mostrarUna(); 
              // ✅ Agregarlo al DOM
              listaArticulosDiv.appendChild(elementoArticulo); 
              
              // ✅ Y luego, guardar la misma referencia en el array
              this.todosLosArticulos.push(elementoArticulo);
              this.arrayContainerRubro.push(containerRubro);
            });
          } else {
            const noArticulosMsg = document.createElement('p');
            noArticulosMsg.textContent = 'No hay artículos en este rubro.';
            listaArticulosDiv.appendChild(noArticulosMsg);
          }

          // Agregar la lista de artículos al contenedor del rubro
          containerRubro.appendChild(listaArticulosDiv);
          
          // Agregar el contenedor del rubro a la lista principal
          lista.appendChild(containerRubro);
        }
      } else {
        // Lógica para mostrar solo los rubros (moderadores)
        const rubrosRecibidos = await this.gestor.mostrarListaRubros(this.empresa.id, this.empresa.id);
        if (rubrosRecibidos.length === 0) {
          lista.innerHTML = `<p class="texto-vacio"> No se encontraron rubros. </p>`;
        } else {
          rubrosRecibidos.forEach(rubroArray => {
            const id = rubroArray['id'];
            const nombre = rubroArray['nombre'];
            const id_empresa = rubroArray['id_empresa'];
            const logo_url = rubroArray['logo_url'];
            const rubroRecibido = new RubroVista(id, id_empresa, nombre, logo_url);
            lista.appendChild(rubroRecibido.mostrarUno());
          });
        }
      }
      await this.aplicarColoresAlternados(lista);
      this.barraBusqueda.classList.remove('hidden');
    } catch (error) {
      console.error('Error en mostrarLista:', error);
      lista.innerHTML = `<p class="texto-error"> Error al cargar los datos: ${error.message}. Por favor, recargue la página. </p>`;
    }
  }
  
  async modalArticuloSeleccionado(articulo) {
    const modal = articulo.modalConfigurar();
    this.articuloSeleccionado = articulo;
    // Agregamos un ID al modal para poder identificarlo
    document.body.appendChild(modal);
    const botonModificarArticulo = document.getElementById('modificar');
    
    //Se cierra el modal si se clickea afuera
    modal.addEventListener('click', (event) => {
      if (event.target === modal)
        document.body.removeChild(modal);
    });

    botonModificarArticulo.addEventListener('click', () => {
      this.abrirModalModificarArticulo();
    })
  }
  
  async modalRubroSeleccionado(id, id_empresa, nombre, logo_url) {
    const rubro = new RubroVista(id, id_empresa, nombre, logo_url);
    const modal = rubro.modalModificar(nombre, logo_url);
    
    // Agregamos un ID al modal para poder identificarlo
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);}});

    const form = document.getElementById('form-modificar-rubro');
    const botonEnviarDatos = document.getElementById('boton-modificar-rubro');
    botonEnviarDatos.addEventListener('click', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const nombre = formData.get('nombre');
      let imagen = formData.get('imagen');
      if (!imagen || imagen.size === 0) {
        imagen = null;
      }
      
      try {
        // Llamamos al método del gestor con el nombre y el archivo.
        const rubroModificado = await this.gestor.modificarRubro(rubro.id, rubro.id_empresa, nombre, imagen, rubro.logo_url);
        if (rubroModificado){
          document.body.removeChild(modal);
          await this.habilitarVentanaPrincipal();
          this.listaArticulos.classList.add('hidden');
          this.listaRubros.classList.remove('hidden');
          this.botonListaRubros.classList.add('activo');
          this.botonListaArticulos.classList.remove('activo');
          this.barraBusqueda.classList.add('hidden');
        }else{
          document.body.appendChild(modal);
        }
          
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }
  
  abrirModalModificarArticulo() {
    const articulo = this.articuloSeleccionado;
    if (!articulo) return;

    const modal = this.articuloSeleccionado.modalModificar();
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        this.articuloSeleccionado = null;
      }
    });

    const form = modal.querySelector('#form-modificar-articulo');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        await this.gestor.modificarArticulo(
          articulo.id,
          articulo.id_rubro,
          formData.get('nombre'),
          formData.get('descripcion') || '',
          formData.get('precio'),
          formData.get('codigo_carta') || ''
        );

        document.body.removeChild(modal);
        this.articuloSeleccionado = null;
        await this.habilitarVentanaPrincipal();

      } catch (error) {
        alert('Error al modificar: ' + error.message);
      }
    });
  }
  
  
  abrirModalCargarArticulos() {
    const modal = this.modalCargarArticulos();
    document.body.appendChild(modal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        document.body.removeChild(modal);
      }
    });

    const form = document.getElementById('form-cargar');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const archivoInput = document.getElementById('archivo');
      const archivo = archivoInput.files[0];

      try {
        // Envía la lista procesada al controlador
        await this.gestor.cargarArticulosYRubros(archivo,this.empresa.id);
        document.body.removeChild(modal);
        // Actualiza la lista de artículos
        this.loader.classList.remove('hidden');
        this.listaRubros.classList.add('hidden');
        this.listaArticulos.classList.add('hidden');
        this.gestor.borrarCacheRubroYArticulo(this.empresa.id);
        await this.mostrarLista(this.listaRubros);
        await this.mostrarLista(this.listaArticulos);
        this.loader.classList.add('hidden');
        this.listaArticulos.classList.remove('hidden');
      } catch (error) {
        console.error(`Error al cargar el archivo: ${error.message}`);
      }
    });
  }
  
  // Método auxiliar para crear el HTML del modal
  modalCargarArticulos() {
    const modal = document.createElement('div');
    modal.classList.add('modal-backdrop');
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Excel</h2>
        <form id="form-cargar">
          <div class="form-group">
            <label for="archivo">Seleccionar archivo Excel:</label>
            <input type="file" id="archivo" name="archivo"
              accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              required>
          </div>
          <div >
            <button type="submit" class="submit-button">Cargar</button>
          </div>
        </form>
      </div>
    `;
    return modal;
  }
  
  async abrirModalModificar(modalPadre) {
    const moderador = await this.gestor.obtenerModerador(this.empresa.id);
    const modal = this.empresa.modalModificarParaModerador(moderador);
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.add('hidden');
        document.body.removeChild(modal);  
        document.body.appendChild(modalPadre);
      }});

      // Listener para los botones de metodos de pago
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('active');
          const activo = btn.classList.contains('active');

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

      const form = document.getElementById('formModificarEmpresa');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const nombre = formData.get('nombre');
        const telefono = formData.get('telefono');
        const ubicacion = formData.get('ubicacion');
        const efectivo = formData.get('efectivo') === 'true';
        const tarjeta = formData.get('tarjeta') === 'true';
        const transferencia = formData.get('transferencia') === 'true';
        const usuario = formData.get('usuario');
        const contrasena = formData.get('contrasena');
        
        try {
          // Llamamos al método del gestor con el nombre y el archivo.
          await this.gestor.modificarModerador(moderador.id, usuario, contrasena);
          await this.gestor.modificarEmpresa(this.empresa.id, nombre, telefono, ubicacion, efectivo, tarjeta, transferencia);
          this.empresa.update(nombre, telefono, ubicacion, efectivo, tarjeta, transferencia);
          modal.classList.add('hidden');
          document.body.removeChild(modal);
          await this.mostrarLista();
          
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      });
  }

  async configurarEmpresa() {
    const modal = this.empresa.modalConfigurarEmpresa();
    
    // Agregamos un ID al modal para poder identificarlo
    document.body.appendChild(modal);
    const botonCambiarLogo = document.getElementById('cambiar-logo');
    const botonSecccionModificar = document.getElementById('seccion-modificar');
    const botonVisitarGestion = document.getElementById('visitar-gestion');
    botonVisitarGestion.classList.add('hidden');
    const botonVisitarPagina = document.getElementById('visitar-pagina');
    
    //Se cierra el modal si se clickea afuera
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        document.body.removeChild(modal);
    }});
    
    botonVisitarPagina.addEventListener('click', (event) => {
      event.preventDefault();
      window.open(`/carta/${this.empresa.id}`, '_blank');
    });
    
    botonSecccionModificar.addEventListener('click', async (event) => {
      event.preventDefault();
      await this.abrirModalModificar(modal);
      document.body.removeChild(modal);
    });
    
    botonCambiarLogo.addEventListener('click', async (event) => {
      event.preventDefault();
      await this.abrirModalCambiarLogo(modal);
      document.body.removeChild(modal);
    });
  }
  
  async abrirModalCambiarLogo(modalPadre) {
    const modal = this.empresa.modalCambiarLogo();
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        document.body.appendChild(modalPadre);
        document.body.removeChild(modal);
      }
    });

    const form = document.getElementById('formCambiarLogoEmpresa');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const imagen = formData.get('imagen');
      
      try {
        await this.gestor.cambiarLogoEmpresa(this.empresa.id, imagen, this.empresa.nombre);
        modal.classList.add('hidden');
        document.body.removeChild(modal);
        await this.mostrarLista();
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }
  
  filtrarArticulos() {
    const textoBusqueda = this.normalizarTexto(this.barraBusqueda.value);
    
    if(textoBusqueda.length === 0){
      this.volverAtras();
      this.todosLosArticulos.forEach(articulo => articulo.classList.remove('hidden'));
      this.arrayContainerRubro.forEach(rubro => rubro.classList.remove('hidden'));
      this.aplicarColoresAlternados(this.listaArticulos);
      return;
    }
    
    this.todosLosArticulos.forEach(articulo => {
      const nombreArticulo = articulo.dataset.nombre.toLowerCase();
      const containerRubro = articulo.closest('.container-rubro');

      // Mostrar u ocultar el artículo
      if (nombreArticulo.includes(textoBusqueda)) {
        articulo.classList.remove('hidden');
        containerRubro.classList.remove('hidden');
      } else {
        articulo.classList.add('hidden');
      }
    });
    
    // Mostrar u ocultar el contenedor del rubro si todos sus artículos están ocultos
    document.querySelectorAll('.container-rubro').forEach(containerRubro => {
      const articulosVisibles = containerRubro.querySelectorAll('.articulo:not(.hidden)').length;
      if (articulosVisibles === 0) {
        containerRubro.classList.add('hidden');
      } else {
        containerRubro.classList.remove('hidden');
      }
    });
    this.aplicarColoresAlternados(this.listaArticulos);
  }
  
  volverAtras(){
    // Show the list of rubros
    this.listaArticulos.classList.remove('hidden');
  }
  
  obtenerIdEmpresa() {
    const url_segmentada = window.location.pathname.split('/');
    const ultimo_slug = url_segmentada[url_segmentada.length - 1];
    return ultimo_slug;
  }
  
  async asignarTituloPagina(texto) {
    try {
      this.tituloPagina.innerHTML = `${texto} ${this.empresa.nombre}`;
      document.title = `WinCoffe - ${this.empresa.nombre}`
    } catch (error) {
      console.error('Error al asignar el título de la página:', error);
      this.tituloPagina.innerHTML = `<p>Error al cargar el título.</p>`;
    }
  }
  
  aplicarColoresAlternados(container) {
    let articulos = [];

    if (container instanceof HTMLElement) {
      articulos = Array.from(container.querySelectorAll('.articulo:not(.hidden)'));
    } else if (Array.isArray(container)) {
      articulos = container.filter(el => !el.classList.contains('hidden'));
    } else {
      console.warn('aplicarColoresAlternados: argumento no válido', container);
      return;
    }

    articulos.forEach((articulo, index) => {
      articulo.style.backgroundColor = index % 2 === 0 ? 'rgb(26 24 36 / 96%)' : '#242130';
    });
      
  }
  
  normalizarTexto(texto) {
    return texto
      .normalize('NFD')                    // Descompone caracteres con tildes
      .replace(/[\u0300-\u036f]/g, '')     // Elimina marcas diacríticas (tildes, acentos, etc.)
      .toLowerCase();                      // Convierte a minúsculas
  }
}


// --- Inicialización ---
// Se crea una instancia de PantallaAdministrador cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
  const pantalla = new PantallaModerador();
  await pantalla.init();
  pantalla.habilitarVentanaPrincipal();
});