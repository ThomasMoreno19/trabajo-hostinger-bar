// Scripts/Cliente/Vista/Js/PantallaCliente.js
class PantallaCliente {
    
    constructor() {
      // Inicializamos el Gestor y los elementos del DOM
      this.header = document.getElementById('header');
      this.imagenHeader = document.getElementById('imagen-header');
      this.tituloPagina = document.getElementById('titulo-pagina');
      this.infoExtra = document.getElementById('info-extra');
      this.gestor = new GestorCliente();
      this.listaArticulos = document.getElementById('lista-articulos');
      this.listaRubros = document.getElementById('lista-rubros');
      this.barraBusqueda = document.getElementById('barra-busqueda');
      this.onBuscarGeneral = this.filtrarArticulos.bind(this);
      this.onBuscarRubro = null;
      this.onClickVolver = this.eventClickVolver.bind(this);
      this.onClickTelefono = this.eventClickTelefono.bind(this);
      this.onClickModalCarrito = this.abrirModalCarrito.bind(this);
      this.botonVolver = document.getElementById('boton-volver');
      this.tituloRubros= document.getElementById('titulo-rubros');
      this.loader = document.getElementById('loader');
      this.botonCarrito = document.getElementById('boton-carrito');
      this.cantidadArticulosCarrito = document.getElementById('cantidad-articulos-carrito');
      this.horarios = [];

      this.listaCentral = document.getElementById('lista-central');

      this.carrito = new Carrito();
      this.articulo = null;
      this.listaArticulosSeleccionados = [];
      // Almacenamiento de referencias a los elementos del DOM
      this.todosLosArticulos = [];
      this.todosLosRubros = [];
      
      this.agregarEventListeners();
    }
    
    async init() {
      const data = await this.gestor.conocerEmpresa(this.conocerSlug(2));
      this.empresa = new EmpresaVista(data);
      if(this.empresa.tieneCarrito){
        window.gestorDeArticulosCallback = (articulo) => {
          this.articuloSeleccionado(articulo);
        }
        this.botonCarrito.removeEventListener('click', this.onClickModalCarrito);
        this.botonCarrito.addEventListener('click', this.onClickModalCarrito);
        if (!document.getElementById("css-articulo-seleccionado")) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "/Scripts/Cliente/Vista/Css/articuloSeleccionado.css";
          link.id = "css-articulo-seleccionado";
          document.head.appendChild(link);
        }
      }
      const textoAdicional = '- Carta';
      this.horarios = await this.gestor.obtenerHorarios(this.empresa.id);

      await this.mostrarLogoEmpresa();
      await this.empresa.asignarIconoYPagina(textoAdicional);
    }
    
    agregarEventListeners() {
      this.limpiarBusqueda();
      this.barraBusqueda.removeEventListener('input', this.onBuscarGeneral);
      this.barraBusqueda.addEventListener('input', this.onBuscarGeneral);

      this.botonVolver.removeEventListener('click', this.onClickVolver);
      this.botonVolver.addEventListener('click', this.onClickVolver);
    }
    
    async habilitarVentanaPrincipal() {
      // Cargar y mostrar los rubros y artículos
      this.loader.classList.remove('hidden');
      this.tituloRubros.classList.add('hidden');
      this.barraBusqueda.classList.add('hidden');
      this.listaArticulos.classList.add('hidden');
      this.listaRubros.classList.add('hidden');
      await this.mostrarTodo();
      this.aplicarColoresAlternados(this.listaArticulos);
      this.loader.classList.add('hidden');
      this.tituloRubros.classList.remove('hidden');
      this.barraBusqueda.classList.remove('hidden');
      this.listaArticulos.classList.remove('hidden');
      this.listaRubros.classList.remove('hidden');
    }
    
    async mostrarTodo() {
      if (!this.listaArticulos || !this.listaRubros) return;
      try {
        // Limpiar las listas antes de cargar nuevos datos
        this.listaRubros.innerHTML = '';
        this.listaArticulos.innerHTML = '';
        this.todosLosArticulos = [];

        // Obtener la lista de todos los rubros
        const rubrosRecibidos = await this.gestor.mostrarListaRubros(this.empresa.id);
        
        // Si no hay rubros, mostrar mensaje y salir
        if (rubrosRecibidos.length === 0) {
          this.listaArticulos.innerHTML = `<p class="texto-vacio"> No se encontraron artículos. </p>`;
          return;
        }

        // 1. Generar la lista de rubros como botones y guardar las referencias
        rubrosRecibidos.forEach(rubro => {
          const id = rubro.id;
          const nombre = rubro.nombre;
          const id_empresa = rubro.id_empresa;
          const logo_url = rubro.logo_url;
          
          const rubroVista = new RubroVista(id, id_empresa, nombre, logo_url);
          const rubroBoton = rubroVista.mostrarUno(); // 'mostrarUno' ahora actúa como un botón
          rubroBoton.onclick = () => {
            this.barraBusqueda.value = '';
            this.tituloRubros.classList.add('hidden');
            this.filtrarArticulosPorRubro(id);
            this.cambiarHeaderPorRubro(nombre, logo_url);
          };
          this.listaRubros.appendChild(rubroBoton);
          this.todosLosRubros.push(rubroBoton);
        });

        // 2. Generar la lista de artículos agrupados por rubro
        for (const rubro of rubrosRecibidos) {
          const id_rubro = rubro['id'];
          
          // Crear el contenedor para el rubro
          const containerRubro = document.createElement('div');
          containerRubro.classList.add('container-rubro');
          containerRubro.classList.add('hidden');
          containerRubro.dataset.rubroId = id_rubro; // Asignar el ID del rubro para filtrar
          
          // Obtener la lista de artículos para el rubro actual
          const listaArticulosRecibidos = await this.gestor.mostrarListaArticulos(id_rubro, this.empresa.id);
          
          const listaArticulosDiv = document.createElement('div');
          listaArticulosDiv.classList.add('lista-articulos-rubro');
          
          if (listaArticulosRecibidos.length > 0) {
            listaArticulosRecibidos.forEach(articulo => {
              const articuloRecibido = new ArticuloVista(articulo);
              const elementoArticulo = articuloRecibido.mostrarUna();
              
              listaArticulosDiv.appendChild(elementoArticulo);
              this.todosLosArticulos.push(elementoArticulo);
            });
          } else {
            const noArticulosMsg = document.createElement('p');
            noArticulosMsg.textContent = 'No hay artículos en este rubro.';
            listaArticulosDiv.appendChild(noArticulosMsg);
          }
          
          containerRubro.appendChild(listaArticulosDiv);
          this.listaArticulos.appendChild(containerRubro);
          this.listaArticulos.classList.add('hidden');
        }
          
      
      } catch (error) {
        console.error('Error en mostrarTodo:', error);
        this.listaArticulos.innerHTML = `<p class="texto-error"> Error al cargar los datos: ${error.message}. Por favor, recargue la página. </p>`;
      }
    }
    
    // Al clickear un rubro, mostrar los artículos de ese rubro
    filtrarArticulosPorRubro(idRubroSeleccionado) {
      this.limpiarBusqueda();
      this.botonVolver.classList.remove('hidden');
      this.barraBusqueda.classList.remove('hidden');
      this.listaRubros.classList.add('hidden');
      this.listaArticulos.classList.remove('hidden');
      
      // Ocultar todos los contenedores de rubros
      document.querySelectorAll('.container-rubro').forEach(containerRubro => {
        if(containerRubro.dataset.rubroId !== idRubroSeleccionado.toString())
          containerRubro.classList.add('hidden');
        else
          containerRubro.classList.remove('hidden');
      });

      // Crear y registrar el nuevo listener para este rubro
      this.onBuscarRubro = () => this.filtrarArticulosEnRubro(idRubroSeleccionado);
      this.barraBusqueda.removeEventListener('input', this.onBuscarRubro);
      this.barraBusqueda.addEventListener('input', this.onBuscarRubro);
    }

    limpiarBusqueda() {
      if (this.onBuscarGeneral) {
        this.barraBusqueda.removeEventListener('input', this.onBuscarGeneral);
      }
      if (this.onBuscarRubro) {
        this.barraBusqueda.removeEventListener('input', this.onBuscarRubro);
        this.onBuscarRubro = null;
      }
    }

    
    filtrarArticulos() {
      this.tituloRubros.classList.add('hidden');
      const textoBusqueda = this.normalizarTexto(this.barraBusqueda.value);
  
      if (textoBusqueda.length === 0) {
        this.tituloRubros.classList.remove('hidden');
        this.restaurarVistaOriginal();
        return;
      }
  
      this.ocultarRubrosYPrepararLista();
  
      const listaPlana = this.crearListaPlana(textoBusqueda);
      this.listaArticulos.appendChild(listaPlana);
  
      this.aplicarColoresAlternados(listaPlana);
    }
    
    /* Restaura la vista original (rubros visibles, sin búsqueda activa) */
    restaurarVistaOriginal() {
      // Mostrar todo nuevamente
      this.todosLosArticulos.forEach(articulo => articulo.classList.remove('hidden'));
      document.querySelectorAll('.container-rubro').forEach(container => container.classList.remove('hidden'));
  
      // Volver a mostrar la vista inicial
      this.listaArticulos.classList.add('hidden');
      this.listaRubros.classList.remove('hidden');
      this.botonVolver.classList.add('hidden');
  
      // Eliminar cualquier lista plana residual
      const listaPlana = this.listaArticulos.querySelector('.lista-plana');
      if (listaPlana) listaPlana.remove();
  
      this.aplicarColoresAlternados(this.todosLosArticulos);
    }
    
    /* Oculta rubros y prepara el contenedor principal */
    ocultarRubrosYPrepararLista() {
      this.listaRubros.classList.add('hidden');
      this.botonVolver.classList.remove('hidden');
      this.listaArticulos.classList.remove('hidden');
  
      document.querySelectorAll('.container-rubro').forEach(c => c.classList.add('hidden'));
  
      const listaPlanaAnterior = this.listaArticulos.querySelector('.lista-plana');
      if (listaPlanaAnterior)
        listaPlanaAnterior.remove();
    }
    
    crearListaPlana(textoBusqueda) {
      const listaPlana = document.createElement('div');
      listaPlana.classList.add('lista-plana');

      this.todosLosArticulos.forEach(articulo => {
        const nombre = this.normalizarTexto(articulo.dataset.nombre || '');
        if (!nombre.includes(textoBusqueda)) return;

        const clon = articulo.cloneNode(true);
        clon.onClick =() => {
          const id = Number(clon.dataset.articuloId);
          if (!this.listaArticulosSeleccionados.includes(id)) {
            clon.classList.add('seleccionado');
            this.listaArticulosSeleccionados.push(id);
            this.carrito.agregarArticulo(clon);
            this.seleccionarArticulo(id);
          }
          else {
            clon.classList.remove('seleccionado');
            this.carrito.eliminarArticulo(id);
            this.listaArticulosSeleccionados =
              this.listaArticulosSeleccionados.filter(x => x !== id);
            this.sacarArticulo(id);
          }
          this.cantidadArticulosCarrito.textContent = this.listaArticulosSeleccionados.length;
          this.botonCarrito.classList.toggle('hidden', this.listaArticulosSeleccionados.length === 0);
        };
        
        listaPlana.appendChild(clon);
      });

      return listaPlana;
    }

    seleccionarArticulo(id){
      this.todosLosArticulos.forEach(articulo => {
        if (articulo.dataset.articuloId == id) articulo.classList.add('seleccionado');
      })
    }

    sacarArticulo(id){
      this.todosLosArticulos.forEach(articulo => {
        if (articulo.dataset.articuloId == id) articulo.classList.remove('seleccionado');
      })
    }

    removerClon(clon)  {
      const index = this.listaArticulosSeleccionados.findIndex(id => {
        if (id) return id === clon.dataset.articuloId;
      });
      if (index !== -1) this.listaArticulosSeleccionados.splice(index, 1);
    }

    /* Filtra artículos dentro de un rubro específico según la barra de búsqueda */
    filtrarArticulosEnRubro(idRubroSeleccionado) {
      const textoBusqueda = this.normalizarTexto(this.barraBusqueda.value);
  
      if (textoBusqueda.length === 0) {
        // Si no hay texto, solo mostramos el rubro seleccionado
        this.mostrarSoloRubro(idRubroSeleccionado);
        return;
      }
  
      this.ocultarRubrosYPrepararLista();
  
      const containerRubro = this.obtenerContainerRubro(idRubroSeleccionado);
      if (!containerRubro) return;
      const articulosRubro = this.obtenerArticulosDeRubro(containerRubro);
      const articulosFiltrados = articulosRubro.filter(articulo => {
        const nombre = this.normalizarTexto(articulo.dataset.nombre);
        return nombre.includes(textoBusqueda);
      });
  
      const listaPlana = this.crearListaPlanaDesdeArticulos(articulosFiltrados, 'No se encontraron artículos de este rubro con el texto buscado.');
      this.mostrarListaPlana(listaPlana);
      this.aplicarColoresAlternados(listaPlana);
    }
    
    /* Obtiene el container del rubro por su id */
    obtenerContainerRubro(idRubro) {
      return document.querySelector(`.container-rubro[data-rubro-id="${idRubro}"]`);
    }
    
    /* Obtiene todos los artículos dentro de un container de rubro */
    obtenerArticulosDeRubro(containerRubro) {
      return Array.from(containerRubro.querySelectorAll('.articulo'));
    }
    
    /* Crea una lista plana a partir de artículos filtrados (no usa texto, reutiliza lógica) */
    crearListaPlanaDesdeArticulos(articulosFiltrados, mensajeVacio) {
      const listaPlana = document.createElement('div');
      listaPlana.classList.add('lista-plana');

      if (articulosFiltrados.length === 0) {
        listaPlana.id = 'lista-vacia';
        listaPlana.textContent = mensajeVacio;
        return listaPlana;
      }

      articulosFiltrados.forEach(a => {
        const clon = a.cloneNode(true);
        clon.onClick = () => {
          const id = Number(clon.dataset.articuloId);
          if (!this.listaArticulosSeleccionados.includes(id)) {
            clon.classList.add('seleccionado');
            this.listaArticulosSeleccionados.push(Number(clon.dataset.articuloId));
            this.carrito.agregarArticulo(clon);
            this.seleccionarArticulo(id);
          }
          else {
            clon.classList.remove('seleccionado');
            this.listaArticulosSeleccionados =
              this.listaArticulosSeleccionados.filter(x => x !== id);
            this.sacarArticulo(id);
          }
          this.cantidadArticulosCarrito.textContent = this.listaArticulosSeleccionados.length;
          this.botonCarrito.classList.toggle('hidden', this.listaArticulosSeleccionados.length === 0);
        };
        listaPlana.appendChild(clon);
      });

      return listaPlana;
    }

    
    /* Muestra únicamente el rubro seleccionado sin filtrar artículos */
    mostrarSoloRubro(idRubroSeleccionado) {
      this.listaRubros.classList.add('hidden');
      this.botonVolver.classList.remove('hidden');
      this.listaArticulos.classList.remove('hidden');
  
      // Ocultar todos los demás rubros
      document.querySelectorAll('.container-rubro').forEach(c => {
        if (c.dataset.rubroId === idRubroSeleccionado.toString()) {
          c.classList.remove('hidden');
        } else {
          c.classList.add('hidden');
        }
      });
  
      // Eliminar cualquier lista plana previa
      const listaPlanaAnterior = this.listaArticulos.querySelector('.lista-plana');
      if (listaPlanaAnterior) listaPlanaAnterior.remove();
  
      // Aplicar colores alternados al rubro visible
      const container = this.obtenerContainerRubro(idRubroSeleccionado);
      if (container) this.aplicarColoresAlternados(container);
    }
    
    /* Inserta la lista plana en el DOM y elimina la anterior si existía */
    mostrarListaPlana(listaPlana) {
      const listaPlanaAnterior = this.listaArticulos.querySelector('.lista-plana');
      if (listaPlanaAnterior) listaPlanaAnterior.remove();
  
      this.listaArticulos.appendChild(listaPlana);
    }

    
    volverAtras(){
      this.limpiarBusqueda();
      
      // Hide the back button and search bar
      this.botonVolver.classList.add('hidden');
      this.listaArticulos.classList.add('hidden');
      this.listaRubros.classList.remove('hidden');
      this.tituloRubros.classList.remove('hidden');

      // Hide ALL article containers
      document.querySelectorAll('.container-rubro').forEach(container => {
        container.classList.remove('hidden');
      });
      
      if (this.headerOriginal) {
        this.infoExtra.classList.remove('hidden');
        this.tituloPagina.textContent = this.headerOriginal.titulo;
        this.imagenHeader.src = this.headerOriginal.logo;
        this.imagenHeader.style.opacity = '1';
        delete this.headerOriginal; // limpiar
      }
      
      this.agregarEventListeners();
    }
    
    conocerSlug(texto) {
      const url_segmentada = window.location.pathname.split('/');
      const slug = url_segmentada[texto];
      return slug;
    }

    conocerEsMesero(){
      const slug = this.conocerSlug(3);
      return (slug === 'mesero' && this.empresa.moduloMesero);
    }
    
    async mostrarLogoEmpresa() {
      try {
        // 1. Mostrar el logo de la empresa
        if (this.empresa.logo_url) {
          this.imagenHeader.src = this.empresa.logo_url;
        }

        // 2. Mostrar el nombre de la empresa en el título
        if (this.tituloPagina && this.empresa.nombre) {
          this.tituloPagina.textContent = this.empresa.nombre;
        }

        // 3. Mostrar ubicación y teléfono en info-extra
        if (this.infoExtra) {
          let infoHTML = '';

          if (this.empresa.ubicacion) {
            infoHTML += `<span class="info-ubicacion">📍 ${this.empresa.ubicacion}</span>`;
          }

          if (this.empresa.telefono) {
            // Icono SVG de WhatsApp (color verde oficial)
            const whatsappIcon = `
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="15" viewBox="0 0 48 48">
                <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path><path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path><path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path><path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path><path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
              </svg>
            `;

            infoHTML += `
              <span id="info-telefono" class="info-telefono" style="cursor:pointer; user-select:none;">
                ${whatsappIcon}${this.empresa.telefono}
              </span>
            `;
          }

          if (!infoHTML) {
            infoHTML = '<span class="info-vacia">Información no disponible</span>';
          }

          this.infoExtra.innerHTML = infoHTML;
          this.botonTelefono();
        }
  
      } catch (error) {
        console.error('Error al cargar el logo y datos de la empresa:', error);
        if (this.tituloPagina) this.tituloPagina.textContent = 'Carta';
        if (this.infoExtra) this.infoExtra.innerHTML = '<span class="info-error">Error al cargar datos</span>';
      }
    }
    
    
    botonTelefono() {
      const telefono = document.getElementById('info-telefono');
      if (!telefono) return;
  
      telefono.classList.add('copiable');
      telefono.removeEventListener('click', this.onClickTelefono);
      telefono.addEventListener('click', this.onClickTelefono);
    }
    
    normalizarTexto(texto) {
      return texto
        .normalize('NFD')                    // Descompone caracteres con tildes
        .replace(/[\u0300-\u036f]/g, '')     // Elimina marcas diacríticas (tildes)
        .toLowerCase();                      // Convierte a minúsculas
    }
    
    cambiarHeaderPorRubro(nombreRubro, logoRubro) {
      // Guardar estado original si no existe
      if (!this.headerOriginal) {
        this.headerOriginal = {
          titulo: this.tituloPagina.textContent,
          logo: this.imagenHeader.src
        };
      }
      this.infoExtra.classList.add('hidden');
  
      // Cambiar título
      this.tituloPagina.textContent = nombreRubro;
  
      // Cambiar logo (con fallback)
      if (logoRubro && logoRubro.trim() !== '') {
        this.imagenHeader.src = logoRubro;
        this.imagenHeader.style.transition = 'height 0.3s ease, transform 0.3s ease, opacity 0.8s ease';
        this.imagenHeader.style.opacity = '0';
        this.imagenHeader.onload = () => {
          this.imagenHeader.style.opacity = '1';
        };
      }
    }

    articuloSeleccionado(articulo) {
      const articuloId = articulo.id;
      articulo.precio = this.carrito.eliminarPuntoPrecio(articulo.precio);

      // Buscar si ya está seleccionado
      const index = this.listaArticulosSeleccionados.findIndex(id => id === articuloId);

      // Buscar el elemento del DOM correspondiente
      const elemento = this.todosLosArticulos.find(e => e.dataset.articuloId == articuloId);

      if (!elemento) return;

      if (index === -1) {
        // No está seleccionado → agregar
        this.carrito.agregarArticulo(articulo);
        this.listaArticulosSeleccionados.push(articulo.id);
        elemento.classList.add('seleccionado');
      } else {
        // Ya estaba seleccionado → eliminar
        this.carrito.eliminarArticulo(articulo.id);
        this.listaArticulosSeleccionados.splice(index, 1);
        elemento.classList.remove('seleccionado');
        elemento.classList.remove('pulse');
      }

      if (this.listaArticulosSeleccionados.length > 0) {
        this.botonCarrito.classList.remove('hidden');
      }else {
        this.botonCarrito.classList.add('hidden');
      }
      this.cantidadArticulosCarrito.textContent = this.listaArticulosSeleccionados.length;
    }

    articuloSeleccionadoPorId(idArticulo) {

      const articulo = this.todosLosArticulos.find(a => a.dataset.articuloId == idArticulo);
      articulo.precio = this.carrito.eliminarPuntoPrecio(articulo.dataset.precio);
      const index = this.listaArticulosSeleccionados.findIndex(id => {
        id === articulo.dataset.id
      }
      );

      if (index === -1) {
        this.carrito.agregarArticulo(articulo);
        this.listaArticulosSeleccionados.push(articulo.dataset.articuloId);
        articulo.classList.add('seleccionado');
      } else {
        this.carrito.eliminarArticulo(articulo.dataset.articuloId);
        this.listaArticulosSeleccionados.splice(index, 1);
        articulo?.classList.remove('seleccionado', 'pulse');
        this.removerSeleccionVisual(articulo.dataset.articuloId);
      }

      this.cantidadArticulosCarrito.textContent = this.listaArticulosSeleccionados.length;
      this.botonCarrito.classList.toggle('hidden', this.listaArticulosSeleccionados.length === 0);
    }


    abrirModalCarrito() {
      const modalCarrito = new ModalCarrito(
        this.carrito,
        this.empresa,
        (idEliminado) => {
          this.removerSeleccionVisual(idEliminado)
        },
        () => {
          this.carrito.vaciarCarrito();
          this.listaArticulosSeleccionados = [];
          this.borrarSeleccion();
          this.cantidadArticulosCarrito.textContent = 0;
          this.botonCarrito.classList.add('hidden');
        },
        this.conocerEsMesero(),
        this.horarios
      );
      this.listaCentral.classList.add('hidden');
      modalCarrito.abrirModalCarrito();
    }

    borrarSeleccion() {
      this.todosLosArticulos.forEach(articulo => {
        articulo.classList.remove('seleccionado');
        articulo.classList.remove('pulse');
      });
      this.volverAtras();
      this.barraBusqueda.value = '';
    }


    removerSeleccionVisual(idArticulo) {
      // sacar de listaArticulosSeleccionados
      this.listaArticulosSeleccionados = 
        this.listaArticulosSeleccionados.filter(id => id !== idArticulo);

      // quitar clase 'seleccionado' del DOM
      const elemento = this.todosLosArticulos
        .find(e => e.dataset.articuloId == idArticulo);

      if (elemento) {
        elemento.classList.remove('seleccionado');
        elemento.classList.remove('pulse');
      }

      // actualizar contador del carrito
      this.cantidadArticulosCarrito.textContent = 
        this.listaArticulosSeleccionados.length;

      // ocultar botón si no quedan artículos
      if (this.listaArticulosSeleccionados.length === 0) {
        this.botonCarrito.classList.add('hidden');
      }
    }

    /* Aplica colores alternados a los artículos visibles */
    aplicarColoresAlternados(lista) {
      let articulos = [];
  
      if (Array.isArray(lista)) {
        // Si es un array de elementos ya obtenidos
        articulos = lista;
      } else if (lista instanceof HTMLElement) {
        // Si es un contenedor del DOM
        articulos = Array.from(lista.querySelectorAll('.articulo'));
      } else {
        console.warn('aplicarColoresAlternados: argumento no válido', lista);
        return;
      }
  
      articulos.forEach((a, i) => {
        a.classList.toggle("fondo-par", i % 2 === 0);
        a.classList.toggle("fondo-impar", i % 2 === 1);
      });
    }

    eventClickVolver() {
      this.restaurarVistaOriginal();
      this.barraBusqueda.value = '';
      this.volverAtras();
    }

    eventClickTelefono() {
      navigator.clipboard.writeText(this.empresa.telefono).then(() => {
        const numero = this.empresa.telefono.replace(/[^0-9]/g, '');
        const esMovil = /Android|iPhone/i.test(navigator.userAgent);
        const url = esMovil
          ? `https://wa.me/${numero}`
          : `https://web.whatsapp.com/send?phone=${numero}`;
        window.open(url, '_blank');
      });
    }

}


// --- Inicialización ---
// Se crea una instancia de PantallaCliente cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
  const pantalla = new PantallaCliente();
  await pantalla.init();
  await pantalla.habilitarVentanaPrincipal();
  let ultimaPosicionScroll = 0;
  
  window.addEventListener('scroll', () => {
    header = document.getElementById('header');
    tituloPagina = document.getElementById('titulo-pagina');
    imagenHeader = document.getElementById('imagen-header');
    infoExtra = document.getElementById('info-extra');
    const posicionActual = window.scrollY;

    if(30 > posicionActual){
      header.classList.remove('minimizado');
      tituloPagina.classList.remove('minimizado');
      imagenHeader.classList.remove('minimizado');
      infoExtra.classList.remove('minimizado');
      infoExtra.classList.remove('oculto');
    }
    else {
      header.classList.add('minimizado');
      tituloPagina.classList.add('minimizado');
      imagenHeader.classList.add('minimizado');
      infoExtra.classList.add('oculto');
    }
    
    // Si bajás, ocultar el encabezado
    if (posicionActual > ultimaPosicionScroll && posicionActual > 100) {
      header.classList.add('oculto');
      tituloPagina.classList.add('oculto');
      imagenHeader.classList.add('oculto');
      infoExtra.classList.add('oculto');
      
      header.classList.remove('minimizado');
      tituloPagina.classList.remove('minimizado');
      imagenHeader.classList.remove('minimizado');
      infoExtra.classList.remove('minimizado');
    }
    // Si subís, mostrarlo de nuevo
    else if(ultimaPosicionScroll > posicionActual) {
      header.classList.remove('oculto');
      tituloPagina.classList.remove('oculto');
      imagenHeader.classList.remove('oculto');
    }
    
    ultimaPosicionScroll = posicionActual;
  });
});
