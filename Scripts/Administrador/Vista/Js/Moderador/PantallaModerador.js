// Scripts/Administrador/Vista/Js/PantallaModerador.js
class PantallaModerador {
  constructor() {
    // Inicializamos el Gestor y los elementos del DOM
    this.gestor = new GestorModerador();
    this.listaArticulos = document.getElementById("lista-articulos");
    this.listaRubros = document.getElementById("lista-rubros");
    this.listaCentral = document.getElementById("lista-central");
    this.articuloSeleccionado = null;
    this.horariosGuardados = [];
    this.espectaculosGuardados = [];
    this.diasNoLaboralesGuardados = [];
    this.horarios = [];
    this.espectaculos = [];
    this.MINUTOS_DIA = 1440;

    this.botonListaArticulos = document.getElementById(
      "boton-mostrar-articulos",
    );
    this.botonListaRubros = document.getElementById("boton-mostrar-rubros");
    this.botonCargarArticulos = document.getElementById(
      "boton-cargar-articulos",
    );

    this.botonModificarCafeteria = document.getElementById(
      "modificar-cafeteria",
    );

    this.barraBusqueda = document.getElementById("barra-busqueda");
    this.contenedorBarraBusqueda = document.getElementById(
      "contenedor-busqueda",
    );
    this.tituloPagina = document.getElementById("titulo-pagina");
    this.loader = document.getElementById("loader");
    window.gestorDeArticulosCallback = (articulo) =>
      this.abrirModalModificarArticulo(articulo);
    window.gestorDeRubrosCallback = (rubro) => {
      this.modalRubroModificar(rubro);
    };

    this.agregarEventListeners();
    this.todosLosArticulos = [];
    this.arrayContainerRubro = [];
  }

  async init() {
    const data = await this.gestor.conocerEmpresa(this.obtenerIdEmpresa());
    this.empresa = new EmpresaVista(data);
    if (this.empresa.deshabilitarExcel) {
      this.botonCargarArticulos.classList.add("hidden");
    }

    try {
      this.horarios = await this.gestor.obtenerHorarios(this.empresa.id);
      this.espectaculos = await this.gestor.obtenerEspectaculos(
        this.empresa.id,
      );
      window.eliminarVideoArticulo = (articulo) => {
        this.eliminarVideoArticulo(articulo);
      };

      window.eliminarVideoRubro = (rubro) => {
        this.eliminarVideoRubro(rubro);
      };
    } catch (error) {
      this.horariosGuardados = [];
      this.diasNoLaboralesGuardados = [];
      this.espectaculosGuardados = [];
      this.excepcionesGuardadas = [];
      console.warn(
        "No se pudieron cargar los horarios o días no laborales previos.",
        error,
      );
    }

    await this.asignarTituloPagina("Gestión de");
  }

  insertarLoader(modalPadre) {
    if (!modalPadre) return;

    modalPadre.innerHTML = `
      <div class="loader-container">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
    `;
  }

  mensajeError(modalPadre, mensaje) {
    modalPadre.innerHTML = `
      <div class="exito-error-container">
        <img src="../../../../Archivos/Iconos/error.svg" alt="Error Icon" class="icon" id="error-icon" height="50" width="50"/>
        <h2 id="error-title">¡Algo ha salido mal!</h2>
        <p>${mensaje}</p>
      </div>
    `;
  }

  mensajeExitoso(modalPadre, mensaje) {
    modalPadre.innerHTML = `
      <div class="exito-error-container">
        <img src="../../../../Archivos/Iconos/check.svg" alt="Exitoso Icon" class="icon" id="exitoso-icon" height="50" width="50"/>
        <h2 id="exitoso-title">¡Operación exitosa!</h2>
        <p>${mensaje}</p>
      </div>
    `;
  }

  agregarEventListeners() {
    if (this.botonListaArticulos && this.botonListaRubros) {
      this.botonListaArticulos.addEventListener("click", () => {
        if (this.loader.classList.contains("hidden")) {
          this.botonListaArticulos.classList.add("activo");
          this.botonListaRubros.classList.remove("activo");
          this.listaRubros.classList.add("hidden");
          this.listaArticulos.classList.remove("hidden");
          this.barraBusqueda.classList.remove("hidden");
          this.contenedorBarraBusqueda.classList.remove("hidden");
        }
      });

      this.botonListaRubros.addEventListener("click", () => {
        if (this.loader.classList.contains("hidden")) {
          this.botonListaArticulos.classList.remove("activo");
          this.botonListaRubros.classList.add("activo");
          this.listaRubros.classList.remove("hidden");
          this.listaArticulos.classList.add("hidden");
          this.barraBusqueda.classList.add("hidden");
          this.contenedorBarraBusqueda.classList.add("hidden");
        }
      });
    }
    if (this.barraBusqueda) {
      this.barraBusqueda.addEventListener("input", () =>
        this.filtrarArticulos(),
      );
    }
    this.botonCargarArticulos.addEventListener("click", () => {
      if (this.empresa.deshabilitarExcel) return;
      this.abrirModalCargarArticulos();
    });

    this.botonModificarCafeteria.addEventListener("click", (event) => {
      event.preventDefault();
      this.configurarEmpresa();
    });
  }

  async habilitarVentanaPrincipal() {
    // El método se encarga de mostrar los datos en la pantalla
    this.precioActual = await this.calcularPrecioActual();
    this.loader.classList.remove("hidden");
    await this.mostrarLista(this.listaRubros);
    this.listaRubros.classList.add("hidden");
    this.listaArticulos.classList.add("hidden");
    await this.mostrarLista(this.listaArticulos);
    this.loader.classList.add("hidden");
    this.listaArticulos.classList.remove("hidden");
  }

  clickFuera(modal) {
    let clickEmpezoAfuera = false;

    modal.addEventListener("mousedown", (event) => {
      clickEmpezoAfuera = event.target === modal;
    });

    modal.addEventListener("mouseup", (event) => {
      const clickTerminoAfuera = event.target === modal;

      if (clickEmpezoAfuera && clickTerminoAfuera) {
        document.body.removeChild(modal);
      }
    });
  }

  async mostrarLista(lista) {
    if (!lista) return;

    try {
      let esArticulo = lista === this.listaArticulos;
      lista.innerHTML = ""; // Limpiar la lista antes de cargar nuevos datos

      if (esArticulo) {
        // 1. Obtener la lista de todos los rubros
        const rubrosRecibidos = await this.gestor.mostrarListaRubros(
          this.empresa.id,
        );
        const articulosRecibidos =
          await this.gestor.mostrarListaArticulosPorEmpresa(this.empresa.id);
        const articulosPorRubro = articulosRecibidos.reduce((acc, articulo) => {
          const idRubro = String(articulo.id_rubro);
          if (!acc[idRubro]) {
            acc[idRubro] = [];
          }
          acc[idRubro].push(articulo);
          return acc;
        }, {});

        if (rubrosRecibidos.length === 0) {
          lista.innerHTML = `<p class="texto-vacio"> No se encontraron artículos. </p>`;
          return;
        }

        // 2. Iterar sobre cada rubro
        for (const rubroArray of rubrosRecibidos) {
          const id_rubro = rubroArray["id"];
          const nombre_rubro = rubroArray["nombre"];

          // Crear el contenedor para el rubro
          const containerRubro = document.createElement("div");
          containerRubro.classList.add("container-rubro");

          // Crear y agregar el título del rubro
          const nombreRubroTitulo = document.createElement("h2");
          nombreRubroTitulo.classList.add("titulo-rubro");
          nombreRubroTitulo.textContent = nombre_rubro;
          containerRubro.appendChild(nombreRubroTitulo);

          // 3. Obtener la lista de artículos para el rubro actual (cargada en bloque)
          const listaArticulosRecibidos =
            articulosPorRubro[String(id_rubro)] || [];

          // 4. Crear un contenedor para los artículos dentro del rubro
          const listaArticulosDiv = document.createElement("div");
          listaArticulosDiv.classList.add("lista-articulos-rubro");

          // Iterar sobre los artículos y crear sus vistas
          if (listaArticulosRecibidos.length > 0) {
            for (const articulo of listaArticulosRecibidos) {
              const articuloRecibido = new ArticuloVista(articulo);
              // ✅ Corregido: Crear el elemento solo una vez
              const elementoArticulo = articuloRecibido.mostrarUna(
                this.precioActual,
              );

              // ✅ Agregarlo al DOM
              listaArticulosDiv.appendChild(elementoArticulo);

              // ✅ Y luego, guardar la misma referencia en el array
              this.todosLosArticulos.push(elementoArticulo);
              this.arrayContainerRubro.push(containerRubro);
            }
          } else {
            const noArticulosMsg = document.createElement("p");
            noArticulosMsg.textContent = "No hay artículos en este rubro.";
            listaArticulosDiv.appendChild(noArticulosMsg);
          }

          // Agregar la lista de artículos al contenedor del rubro
          containerRubro.appendChild(listaArticulosDiv);

          // Agregar el contenedor del rubro a la lista principal
          lista.appendChild(containerRubro);
        }
      } else {
        // Lógica para mostrar solo los rubros (moderadores)
        const rubrosRecibidos = await this.gestor.mostrarListaRubros(
          this.empresa.id,
        );
        if (rubrosRecibidos.length === 0) {
          lista.innerHTML = `<p class="texto-vacio"> No se encontraron rubros. </p>`;
        } else {
          rubrosRecibidos.forEach((rubroArray) => {
            const rubroRecibido = new RubroVista(rubroArray);
            lista.appendChild(rubroRecibido.mostrarUno());
          });
        }
      }
      await this.aplicarColoresAlternados(lista);
      this.barraBusqueda.classList.remove("hidden");
      this.contenedorBarraBusqueda.classList.remove("hidden");
    } catch (error) {
      console.error("Error en mostrarLista:", error);
      lista.innerHTML = `<p class="texto-error"> Error al cargar los datos: ${error.message}. Por favor, recargue la página. </p>`;
    }
  }

  async modalRubroModificar(rubro) {
    if (this.empresa.deshabilitarExcel) return;
    const Rubro = new RubroVista(rubro);
    const modal = rubro.modalModificar(rubro.nombre);

    // Agregamos un ID al modal para poder identificarlo
    document.body.appendChild(modal);

    this.clickFuera(modal);

    const botonSubirVideo = document.getElementById("boton-subir-video-rubro");
    botonSubirVideo.addEventListener("click", () => {
      this.abrirModalSubirVideoRubro(rubro);
      document.body.removeChild(modal);
    });

    const botonEliminar = document.getElementById("eliminar-rubro");
    botonEliminar.addEventListener("click", () => {
      this.confirmarEliminar(rubro, "rubro");
      document.body.removeChild(modal);
    });

    const form = document.getElementById("form-modificar-rubro");
    const botonEnviarDatos = document.getElementById("boton-modificar-rubro");
    botonEnviarDatos.addEventListener("click", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const nombre = formData.get("nombre");
      let imagen = formData.get("imagen");
      if (!imagen || imagen.size === 0) {
        imagen = null;
      }

      try {
        // Llamamos al método del gestor con el nombre y el archivo.
        const rubroModificado = await this.gestor.modificarRubro(
          rubro.id,
          rubro.id_empresa,
          nombre,
          imagen,
          rubro.logo_url,
        );
        if (rubroModificado) {
          document.body.removeChild(modal);
          await this.habilitarVentanaPrincipal();
          this.listaArticulos.classList.add("hidden");
          this.listaRubros.classList.remove("hidden");
          this.botonListaRubros.classList.add("activo");
          this.botonListaArticulos.classList.remove("activo");
          this.barraBusqueda.classList.add("hidden");
          this.contenedorBarraBusqueda.classList.add("hidden");
        } else {
          document.body.appendChild(modal);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }

  abrirModalModificarArticulo(articulo) {
    if (!articulo) return;
    const modal = articulo.modalModificar();
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    const botonEliminar = document.getElementById("eliminar-articulo");
    botonEliminar.addEventListener("click", () => {
      this.confirmarEliminar(articulo, "articulo");
      document.body.removeChild(modal);
    });

    const botonSubirVideo = document.getElementById(
      "boton-subir-video-articulo",
    );
    botonSubirVideo.addEventListener("click", () => {
      this.abrirModalSubirVideoArticulo(articulo);
      document.body.removeChild(modal);
    });

    const form = modal.querySelector("#form-modificar-articulo");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        await this.gestor.modificarArticulo(
          articulo.id,
          articulo.id_rubro,
          this.empresa.id,
          formData.get("nombre"),
          formData.get("descripcion") || "",
          formData.get("precio1"),
          formData.get("precio2"),
          formData.get("precio3"),
          formData.get("codigo-carta") || "",
        );

        document.body.removeChild(modal);
        await this.habilitarVentanaPrincipal();
      } catch (error) {
        alert("Error al modificar: " + error.message);
      }
    });
  }

  async confirmarEliminar(entidad, tipo) {
    if (
      confirm(
        "Seguro que desea eliminar?",
        tipo === "articulo"
          ? ""
          : "Se eliminarán todos los artículos asociados.",
      )
    ) {
      const respuesta = await this.gestor.eliminarEntidad(
        entidad.id,
        tipo,
        this.empresa.id,
      );

      if (respuesta?.success) {
        await this.mostrarLista(this.listaArticulos);
        this.botonListaArticulos.click();
      }
    }
  }

  abrirModalCargarArticulos() {
    const modal = this.modalCargarArticulos();
    document.body.appendChild(modal);

    this.clickFuera(modal);

    const modalContent = modal.querySelector(".modal-content-partial");

    const form = document.getElementById("form-cargar");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const archivoInput = document.getElementById("archivo");
      const archivo = archivoInput.files[0];

      try {
        // Envía la lista procesada al controlador
        this.insertarLoader(modalContent);
        const respuesta = await this.gestor.cargarArticulosYRubros(
          archivo,
          this.empresa.id,
        );

        this.mensajeExitoso(modalContent, "Artículos cargados exitosamente.");
        // Actualiza la lista de artículos
        this.loader.classList.remove("hidden");
        this.listaRubros.classList.add("hidden");
        this.listaArticulos.classList.add("hidden");
        await this.mostrarLista(this.listaRubros);
        await this.mostrarLista(this.listaArticulos);
        this.loader.classList.add("hidden");
        this.listaArticulos.classList.remove("hidden");
      } catch (error) {
        if (error.value == "Error al procesar el archivo:")
          this.mensajeError(modalContent, error);
      }
    });
  }

  // Método auxiliar para crear el HTML del modal
  modalCargarArticulos() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
      <div class="modal-content-partial">
      <span class="close-modal-btn" style="position: absolute; top: 5px; right: 5px; cursor: pointer; font-size: 30px;">&times;</span>
        <h2>Excel</h2>
        
        <form id="form-cargar">

          <div id="dropzone" class="dropzone">
            <div class="drop-content">
              <img src="../../../../Archivos/Iconos/excel.svg" alt="Upload Icon" class="icon" height="50" width="50"/>
              <p>Arrastrá tu archivo aquí o hacé click</p>
            </div>

            <input type="file" id="archivo" name="archivo"
              accept=".csv,.xlsx,.xls" hidden required>
          </div>

          <div id="file-preview" class="file-preview hidden"></div>

          <button type="submit" class="submit-button disabled" id="boton-cargar">Enviar</button>

        </form>
      </div>
    `;
    const dropzone = modal.querySelector("#dropzone");
    const input = modal.querySelector("#archivo");
    const preview = modal.querySelector("#file-preview");

    function accionBotonCargar(estado) {
      const boton = document.querySelector("#boton-cargar");

      if (!boton) return;

      boton.disabled = !estado;

      if (estado) {
        boton.classList.remove("disabled");
      } else {
        boton.classList.add("disabled");
      }
    }

    // Click abre selector
    dropzone.addEventListener("click", () => input.click());

    // Drag events
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");

      const file = e.dataTransfer.files[0];
      input.files = e.dataTransfer.files;

      mostrarArchivo(file);
    });

    // Cambio manual
    input.addEventListener("change", () => {
      const file = input.files[0];
      mostrarArchivo(file);
    });

    // Mostrar info
    function mostrarArchivo(file) {
      if (!file) return;

      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      const validExtensions = /\.(xls|xlsx)$/i;

      if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
        preview.classList.remove("hidden");
        preview.innerHTML =
          "<strong>❌ Archivo inválido. Solo se permiten .xls o .xlsx</strong>";

        input.value = "";
        accionBotonCargar(false);
        return;
      }

      preview.classList.remove("hidden");
      preview.innerHTML = `
      <div class="file-info">
        <strong>${file.name}</strong>
        <strong>
          ${(file.size / 1024).toFixed(2)} KB
        </strong>
      </div>
      `;
      accionBotonCargar(true);
    }

    const closeBtn = modal.querySelector(".close-modal-btn");
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    return modal;
  }

  abrirModalSubirVideoArticulo(articulo) {
    const modal = articulo.modalSubirVideoArticulo();
    document.body.appendChild(modal);

    this.clickFuera(modal);

    const modalContent = modal.querySelector(".modal-content-partial");

    const form = document.getElementById("form-cargar-video");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const archivoInput = document.getElementById("archivo-video");
      const archivo = archivoInput.files[0];

      try {
        this.insertarLoader(modalContent);

        // Llamada al método correspondiente en tu gestor (adaptar según tu backend)
        const respuesta = await this.gestor.subirVideoArticulo(
          archivo,
          articulo.id,
          this.empresa.id,
          articulo.video_url, // O el id del artículo si disponés de él aquí
        );

        this.mensajeExitoso(modalContent, "Video/GIF cargado exitosamente.");

        // Actualización de la vista si es necesario
        this.loader.classList.remove("hidden");
        this.listaArticulos.classList.add("hidden");
        await this.mostrarLista(this.listaArticulos);
        this.loader.classList.add("hidden");
        this.listaArticulos.classList.remove("hidden");
      } catch (error) {
        this.mensajeError(modalContent, error);
      }
    });
  }

  abrirModalSubirVideoRubro(rubro) {
    const modal = rubro.modalSubirVideoRubro();
    document.body.appendChild(modal);

    this.clickFuera(modal);

    const modalContent = modal.querySelector(".modal-content-partial");

    const form = document.getElementById("form-cargar-video");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const archivoInput = document.getElementById("archivo-video");
      const archivo = archivoInput.files[0];

      try {
        this.insertarLoader(modalContent);

        // Llamada al método correspondiente en tu gestor (adaptar según tu backend)
        const respuesta = await this.gestor.subirVideoRubro(
          archivo,
          rubro.id,
          this.empresa.id,
          rubro.video_url, // O el id del artículo si disponés de él aquí
        );

        this.mensajeExitoso(modalContent, "Video/GIF cargado exitosamente.");

        // Actualización de la vista si es necesario
        this.loader.classList.remove("hidden");
        this.listaRubros.classList.add("hidden");
        await this.mostrarLista(this.listaRubros);
        this.loader.classList.add("hidden");
        this.listaRubros.classList.remove("hidden");
      } catch (error) {
        if (error.value == "Error al procesar el archivo:") {
          this.mensajeError(modalContent, error);
        }
      }
    });
  }

  async abrirModalModificar(modalPadre) {
    const moderador = await this.gestor.obtenerModerador(this.empresa.id);
    const modal = this.empresa.modalModificarParaModerador(moderador);
    this.listaCentral.classList.add("hidden");

    document.body.appendChild(modal);
    this.clickFuera(modal);

    // Listener para los botones de metodos de pago
    document.querySelectorAll(".toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        const activo = btn.classList.contains("active");

        if (btn.id === "btnEfectivo") {
          document.getElementById("efectivo").value = activo;
        }

        if (btn.id === "btnTarjeta") {
          document.getElementById("tarjeta").value = activo;
        }

        if (btn.id === "btnTransferencia") {
          document.getElementById("transferencia").value = activo;
        }

        if (btn.id === "btnPedirCuenta") {
          document.getElementById("pedirCuenta").value = activo;
        }

        if (btn.id === "btnLlamarMesero") {
          document.getElementById("llamarMesero").value = activo;
        }
      });
    });

    document.querySelectorAll(".toggle-btn-precios").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".toggle-btn-precios").forEach((b) => {
          b.classList.remove("active");
        });

        btn.classList.add("active");
      });
    });

    const botonCerrar = document.getElementById("cerrar-wrapper");
    botonCerrar.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.body.removeChild(modal);
      document.body.appendChild(modalPadre);
      this.listaCentral.classList.remove("hidden");
    });

    const form = document.getElementById("formModificarEmpresa");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const nombre = formData.get("nombre");
      const telefono = formData.get("telefono");
      const ubicacion = formData.get("ubicacion");
      const efectivo = formData.get("efectivo") === "true";
      const tarjeta = formData.get("tarjeta") === "true";
      const transferencia = formData.get("transferencia") === "true";
      const precio_delivery = formData.get("precio-delivery");
      const precio_espectaculo = formData.get("precio-espectaculo");
      const botonPedirCuenta = formData.get("pedirCuenta") === "true";
      const botonLlamarMesero = formData.get("llamarMesero") === "true";
      const usuario = formData.get("usuario");
      const contrasena = formData.get("contrasena");
      const contrasenaMesero = formData.get("contrasenaMesero");
      const imagen = formData.get("imagen");

      try {
        // Llamamos al método del gestor con el nombre y el archivo.
        await this.gestor.modificarModerador(moderador.id, usuario, contrasena);
        await this.gestor.modificarEmpresa(
          this.empresa.id,
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
          contrasenaMesero,
        );
        if (imagen && imagen.size > 0) {
          const empresaConNuevoLogo = await this.gestor.cambiarLogoEmpresa(
            this.empresa.id,
            imagen,
            nombre,
          );
          if (empresaConNuevoLogo?.logo_url) {
            this.empresa.logo_url = empresaConNuevoLogo.logo_url;
          }
        }
        this.empresa.update(
          nombre,
          telefono,
          ubicacion,
          efectivo,
          tarjeta,
          transferencia,
          parseInt(precio_delivery),
          parseInt(precio_espectaculo),
          botonPedirCuenta,
          botonLlamarMesero,
        );
        this.mostrarLista(this.listaArticulos);
        modal.classList.add("hidden");
        document.body.removeChild(modal);
        this.listaCentral.classList.remove("hidden");
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }

  async configurarEmpresa() {
    const modal = this.empresa.modalConfigurarEmpresa();

    // Agregamos un ID al modal para poder identificarlo
    document.body.appendChild(modal);
    const botonEliminar = document.getElementById("btn-eliminar-empresa");
    botonEliminar.classList.add("hidden");
    const idEmpresa = document.getElementById("id-empresa");
    idEmpresa.classList.add("hidden");
    const botonSecccionModificar = document.getElementById("seccion-modificar");
    const botonConfigurarHorarios = document.getElementById(
      "configurar-horarios",
    );
    const botonConfigurarEspectaculos = document.getElementById(
      "configurar-espectaculos",
    );
    const botonMeseros = document.getElementById("meseros");

    this.clickFuera(modal);
    botonSecccionModificar.addEventListener("click", async (event) => {
      event.preventDefault();
      await this.abrirModalModificar(modal);
      document.body.removeChild(modal);
    });

    botonConfigurarHorarios.addEventListener("click", async (event) => {
      event.preventDefault();
      await this.abrirModalConfigurarHorarios(modal);
      document.body.removeChild(modal);
    });

    botonConfigurarEspectaculos.addEventListener("click", async (event) => {
      event.preventDefault();
      await this.abrirModalConfigurarEspectaculos(modal);
      document.body.removeChild(modal);
    });

    botonMeseros.addEventListener("click", (event) => {
      event.preventDefault();
      this.abrirModalMeseros(modal);
    });
  }

  async abrirModalConfigurarEspectaculos() {
    const modal = this.empresa.modalConfigurarEspectaculos();
    this.listaCentral.classList.add("hidden");

    document.body.appendChild(modal);

    this.espectaculosGuardados = Array.isArray(this.espectaculos.espectaculo)
      ? this.espectaculos.espectaculo.map((h) => {
          const diaIndex = Number(h.diaIndex);
          return {
            ...h,
            dia: DIAS_SEMANA[diaIndex] || "",
            nombre: NOMBRE_DIAS[diaIndex] || "",
            rangos: Array.isArray(h.rangos) ? h.rangos : [],
          };
        })
      : [];

    this.renderEspectaculosEnModal(modal);

    const botonFormEspectaculoDiaFijo = document.getElementById(
      "btnFormEspectaculoDiaFijo",
    );
    botonFormEspectaculoDiaFijo.addEventListener("click", async (event) => {
      event.preventDefault();
      const hayHorarios =
        this.espectaculos.espectaculo.length !==
        this.espectaculosGuardados.length;

      if (hayHorarios) {
        const seguro = confirm(
          "¿Estás seguro de que querés salir?\nSe borrará tu progreso.",
        );

        if (!seguro) return;
      }

      this.listaCentral.classList.remove("hidden");
      modal.classList.add("hidden");
      await this.abrirModalConfigurarEspectaculoHabilitarExcepcion(modal);
      document.body.removeChild(modal);
    });

    const botonCerrar = document.getElementById("cerrar-wrapper");

    if (botonCerrar) {
      botonCerrar.addEventListener("click", (e) => {
        e.preventDefault();

        const hayEspectaculos =
          this.espectaculos.espectaculo.length !==
          this.espectaculosGuardados.length;

        if (hayEspectaculos) {
          const seguro = confirm(
            "¿Estás seguro de que querés salir?\nSe borrará tu progreso.",
          );

          if (!seguro) return;
        }

        this.listaCentral.classList.remove("hidden");
        modal.classList.add("hidden");
        document.body.removeChild(modal);
      });
    }

    const botonesDias = modal.querySelectorAll(".toggle-btn");
    // Listener para los botones de dias de la semana
    botonesDias.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
      });
    });

    const form = document.getElementById("formConfigurarEspectaculosEmpresa");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const horaInicio = document.getElementById("horaInicio").value;
      const horaFin = document.getElementById("horaFin").value;

      if (!horaInicio || !horaFin) {
        alert("Tenés que elegir hora de inicio y finalización");
        return;
      }

      const botonesActivos = modal.querySelectorAll(".toggle-btn.active");

      if (botonesActivos.length === 0) {
        alert("Tenés que seleccionar al menos un día");
        return;
      }

      // Armamos nuevos espectaculos
      const nuevosEspectaculos = Array.from(botonesActivos).map((btn) => {
        const diaNombre = btn.textContent.trim();

        const diaIndex = DIAS_SEMANA.indexOf(diaNombre);
        const nombreDia = NOMBRE_DIAS[diaIndex];

        return {
          dia: diaNombre,
          nombre: nombreDia,
          diaIndex,
          inicio: horaInicio,
          fin: horaFin,
        };
      });

      // Validar choque
      const espectaculosExistentesPlano = this.aplanarEspectaculosGuardados();
      const error = this.validarNoSuperposicionEspectaculos(
        nuevosEspectaculos,
        espectaculosExistentesPlano,
      );

      if (error) {
        alert("No se puede guardar: ese horario pisa otro.");
        return;
      }

      // Guardar (agrupando por día)
      nuevosEspectaculos.forEach((nuevo) => {
        const existente = this.espectaculosGuardados.find(
          (h) => h.diaIndex === nuevo.diaIndex,
        );

        if (existente) {
          // Si ya existe el día, agregamos un rango nuevo
          existente.rangos.push({
            horaInicio: nuevo.inicio,
            horaFin: nuevo.fin,
          });
        } else {
          // Si no existe, creamos el día con su primer rango
          this.espectaculosGuardados.push({
            dia: nuevo.dia,
            nombre: nuevo.nombre,
            diaIndex: nuevo.diaIndex,
            rangos: [
              {
                horaInicio: nuevo.inicio,
                horaFin: nuevo.fin,
              },
            ],
          });
        }
      });

      // Reset del formulario (para seguir cargando más)
      botonesActivos.forEach((btn) => btn.classList.remove("active"));
      document.getElementById("horaInicio").value = "";
      document.getElementById("horaFin").value = "";

      // Render
      this.renderEspectaculosEnModal(modal);
    });

    const btnGuardar = modal.querySelector("#btnGuardarEspectaculos");
    btnGuardar.addEventListener("click", async () => {
      if (
        !this.espectaculosGuardados ||
        this.espectaculosGuardados.length === 0
      ) {
        alert("No hay espectáculos cargados para guardar.");
        return;
      }

      // 🔥 Payload recomendado
      const espectaculos = this.espectaculosGuardados.map((d) => ({
        diaIndex: d.diaIndex,
        dia: d.dia,
        rangos: d.rangos.map((r) => ({
          inicio: r.horaInicio || r.inicio,
          fin: r.horaFin || r.fin,
        })),
      }));

      try {
        await this.gestor.guardarEspectaculos(espectaculos, this.empresa.id);
        alert("Horarios de espectáculos guardados correctamente ✔️");
        this.espectaculos = await this.gestor.obtenerEspectaculos(
          this.empresa.id,
        ); // Actualizamos los espectaculos con lo que se guardó
        this.espectaculosGuardados = Array.isArray(
          this.espectaculos.espectaculo,
        )
          ? this.espectaculos.espectaculo.map((e) => {
              const diaIndex = Number(e.diaIndex);

              return {
                ...e,
                dia: DIAS_SEMANA[diaIndex] || "",
                nombre: NOMBRE_DIAS[diaIndex] || "",
                rangos: Array.isArray(e.rangos) ? e.rangos : [],
              };
            })
          : [];
        // limpiar progreso
        this.renderEspectaculosEnModal(modal);
      } catch (error) {
        alert(`Error guardando espectaculos: ${error.message}`);
      }
    });
  }

  async renderizarMeseros(modal) {
    try {
      const listaContainer = modal.querySelector(".lista-meseros");

      const meseros = await this.gestor.mostrarListaMeseros(this.empresa.id);

      listaContainer.innerHTML = ""; // limpiar

      if (!meseros || meseros.length === 0) {
        listaContainer.innerHTML = "<p>No hay meseros</p>";
        return;
      }

      meseros.forEach((m) => {
        const item = document.createElement("div");
        item.classList.add("mesero-item");

        item.innerHTML = `
          <div class="mesero-info">
            <span class="mesero-codigo">${m.codigo ?? "-"}</span>
            <span class="mesero-nombre">${m.nombre}</span>
            <span class="mesero-abreviatura">${m.abreviaturaNombre ?? "-"}</span>
          </div>

          <div class="mesero-acciones">
            <button class="btn-mesero btn-editar" data-id="${m.id}">
              <img src="../../../../Archivos/Iconos/lapiz.png" alt="Editar">
            </button>
            <button class="btn-mesero btn-eliminar" data-id="${m.id}">
              <img src="../../../../Archivos/Iconos/trash.svg" alt="Eliminar">
            </button>
          </div>
        `;

        listaContainer.appendChild(item);
      });

      const botonesEditar = modal.querySelectorAll(".btn-editar");
      botonesEditar.forEach((boton) => {
        boton.addEventListener("click", async (e) => {
          e.preventDefault();
          const id = Number(boton.getAttribute("data-id"));
          await this.abrirModalModificarMesero(
            modal,
            meseros.find((m) => m.id === id),
          );
        });
      });

      const botonesEliminar = modal.querySelectorAll(".btn-eliminar");
      botonesEliminar.forEach((boton) => {
        boton.addEventListener("click", async (e) => {
          e.preventDefault();
          const id = Number(boton.getAttribute("data-id"));
          const mesero = meseros.find((m) => m.id === id);
          await this.pedirConfirmacionEliminarMesero(modal, mesero);
        });
      });
    } catch (error) {
      console.error("Error cargando lista de meseros:", error);
    }
  }

  async abrirModalModificarMesero(modalPadre, mesero) {
    const modal = this.empresa.modalModificarMesero(mesero);
    document.body.appendChild(modal);

    this.clickFuera(modal);

    const form = document.getElementById("formModificarMesero");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const nombre = formData.get("nombre");
      const abreviaturaNombre = formData.get("abreviaturaNombre");
      const contrasena = formData.get("contrasena");

      try {
        // Llamamos al método del gestor con el nombre y el archivo.
        const response = await this.gestor.modificarMesero(
          mesero.id,
          nombre,
          abreviaturaNombre,
          contrasena,
        );

        modal.classList.add("hidden");
        document.body.removeChild(modal);
        document.body.appendChild(modalPadre);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }

  pedirConfirmacionEliminarMesero(modal, mesero) {
    return new Promise((resolve) => {
      const confirmacion = confirm(
        `¿Estás seguro de eliminar al mesero ${mesero.nombre}?`,
      );
      if (confirmacion) {
        this.gestor.eliminarMesero(mesero.id);
        this.renderizarMeseros(modal);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  abrirModalMeseros() {
    const html = this.empresa.modalMeseros();

    this.listaCentral.classList.add("hidden");
    document.body.insertAdjacentHTML("beforeend", html);

    const modal = document.getElementById("modalMeseros");

    const botonCerrar = modal.querySelector("#cerrar-wrapper");
    botonCerrar.addEventListener("click", () => {
      modal.remove();
      this.listaCentral.classList.remove("hidden");
    });

    const botonRegistrarMesero = modal.querySelector(
      "#contenedorRegistrarMesero",
    );
    botonRegistrarMesero.addEventListener("click", async () => {
      await this.abrirModalRegistrarMesero(modal);
    });

    const botonCargarMeseros = modal.querySelector("#btnCargarMeseros");
    botonCargarMeseros.addEventListener("click", async () => {
      await this.abrirModalCargarMeseros(modal);
    });

    const form = document.getElementById("formRegistrarContrasenaCompartida");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.PedirConfirmacionRegistrarContrasenaCompartida(modal, form);
    });

    const botonEliminarContrasenaCompartida = modal.querySelector(
      "#btnEliminarContrasenaCompartida",
    );
    botonEliminarContrasenaCompartida.addEventListener("click", async () => {
      await this.PedirConfirmacionEliminarContrasenaCompartida();
    });

    this.renderizarMeseros(modal);
  }

  async abrirModalRegistrarMesero(modalPadre) {
    const modal = this.empresa.modalRegistrarMesero();
    document.body.appendChild(modal);

    this.clickFuera(modal);

    const form = document.getElementById("formRegistrarMesero");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const nombre = formData.get("nombre");
      const abreviaturaNombre = formData.get("abreviaturaNombre");
      const contrasena = formData.get("contrasena");

      try {
        // Llamamos al método del gestor con el nombre y el archivo.

        this.gestor.registrarMesero(
          nombre,
          abreviaturaNombre,
          contrasena,
          this.empresa.id,
        );
        this.renderizarMeseros(modalPadre);
        modal.classList.add("hidden");
        document.body.removeChild(modal);
        document.body.appendChild(modalPadre);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }

  async abrirModalCargarMeseros(modalPadre) {
    const modal = this.empresa.modalCargarMeseros();
    document.body.appendChild(modal);

    this.clickFuera(modal);

    const form = document.getElementById("formCargarMeseros");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const archivo = formData.get("archivo");

      try {
        // Llamamos al método del gestor con el nombre y el archivo.
        await this.gestor.cargarMeseros(archivo, this.empresa.id);
        await this.renderizarMeseros(modalPadre);
        modal.classList.add("hidden");
        document.body.removeChild(modal);
        document.body.appendChild(modalPadre);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }

  async PedirConfirmacionRegistrarContrasenaCompartida(modal, form) {
    const formData = new FormData(form);
    const contrasena = formData.get("contrasenaCompartida");

    const seguro = confirm(
      `¿Estas seguro de registrar la contraseña compartida? 
Los meseros registrados no se tomarán en cuenta mientras haya una contraseña compartida`,
    );

    if (seguro) {
      await this.gestor.registrarContrasenaCompartida(
        contrasena,
        this.empresa.id,
      );
    }
  }

  async PedirConfirmacionEliminarContrasenaCompartida() {
    const seguro = confirm(
      `¿Estas seguro de eliminar la contraseña compartida?`,
    );
    if (seguro) {
      this.gestor.eliminarContrasenaCompartida(this.empresa.id);
    }
  }

  async abrirModalConfigurarHorarios() {
    const modal = this.empresa.modalConfigurarHorarios();
    this.listaCentral.classList.add("hidden");

    document.body.appendChild(modal);

    this.horariosGuardados = Array.isArray(this.horarios.horarios)
      ? this.horarios.horarios.map((h) => {
          const diaIndex = Number(h.diaIndex);

          return {
            ...h,
            dia: DIAS_SEMANA[diaIndex] || "",
            nombre: NOMBRE_DIAS[diaIndex] || "",
            rangos: Array.isArray(h.rangos) ? h.rangos : [],
          };
        })
      : [];

    this.renderHorariosEnModal(modal);

    const botonFormDiasNoLaborales = document.getElementById(
      "btnFormDiasNoLaborales",
    );
    botonFormDiasNoLaborales.addEventListener("click", async (event) => {
      event.preventDefault();
      const hayHorarios =
        this.horarios.horarios.length !== this.horariosGuardados.length;

      if (hayHorarios) {
        const seguro = confirm(
          "¿Estás seguro de que querés salir?\nSe borrará tu progreso.",
        );

        if (!seguro) return;
      }

      this.listaCentral.classList.remove("hidden");
      modal.classList.add("hidden");
      await this.abrirModalConfigurarDiasNoLaborales(modal);
      document.body.removeChild(modal);
    });

    const botonCerrar = document.getElementById("cerrar-wrapper");

    if (botonCerrar) {
      botonCerrar.addEventListener("click", (e) => {
        e.preventDefault();

        const hayHorarios =
          this.horarios.horarios.length !== this.horariosGuardados.length;

        if (hayHorarios) {
          const seguro = confirm(
            "¿Estás seguro de que querés salir?\nSe borrará tu progreso.",
          );

          if (!seguro) return;
        }

        this.listaCentral.classList.remove("hidden");
        modal.classList.add("hidden");
        document.body.removeChild(modal);
      });
    }

    const botonesDias = modal.querySelectorAll(".toggle-btn");
    // Listener para los botones de dias de la semana
    botonesDias.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
      });
    });

    const form = document.getElementById("formConfigurarHorariosEmpresa");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const horaApertura = document.getElementById("horaApertura").value;
      const horaCierre = document.getElementById("horaCierre").value;

      if (!horaApertura || !horaCierre) {
        alert("Tenés que elegir hora de apertura y cierre");
        return;
      }

      const botonesActivos = modal.querySelectorAll(".toggle-btn.active");

      if (botonesActivos.length === 0) {
        alert("Tenés que seleccionar al menos un día");
        return;
      }

      // Armamos nuevos horarios
      const nuevosHorarios = Array.from(botonesActivos).map((btn) => {
        const diaNombre = btn.textContent.trim();

        const diaIndex = DIAS_SEMANA.indexOf(diaNombre);
        const nombreDia = NOMBRE_DIAS[diaIndex];

        return {
          dia: diaNombre,
          nombre: nombreDia,
          diaIndex,
          apertura: horaApertura,
          cierre: horaCierre,
        };
      });

      // Validar choque

      const horariosExistentesPlano = this.aplanarHorariosGuardados();

      const error = this.validarNoSuperposicion(
        nuevosHorarios,
        horariosExistentesPlano,
      );

      if (error) {
        alert("No se puede guardar: ese horario pisa otro.");
        return;
      }

      // Guardar (agrupando por día)
      nuevosHorarios.forEach((nuevo) => {
        const existente = this.horariosGuardados.find(
          (h) => h.diaIndex === nuevo.diaIndex,
        );

        if (existente) {
          // Si ya existe el día, agregamos un rango nuevo
          existente.rangos.push({
            apertura: nuevo.apertura,
            cierre: nuevo.cierre,
          });
        } else {
          // Si no existe, creamos el día con su primer rango
          this.horariosGuardados.push({
            dia: nuevo.dia,
            nombre: nuevo.nombre,
            diaIndex: nuevo.diaIndex,
            rangos: [
              {
                apertura: nuevo.apertura,
                cierre: nuevo.cierre,
              },
            ],
          });
        }
      });

      // Reset del formulario (para seguir cargando más)
      botonesActivos.forEach((btn) => btn.classList.remove("active"));
      document.getElementById("horaApertura").value = "";
      document.getElementById("horaCierre").value = "";

      // Render
      this.renderHorariosEnModal(modal);
    });

    const btnGuardar = modal.querySelector("#btnGuardarHorarios");
    btnGuardar.addEventListener("click", async () => {
      if (!this.horariosGuardados || this.horariosGuardados.length === 0) {
        alert("No hay horarios cargados para guardar.");
        return;
      }

      // 🔥 Payload recomendado
      const horarios = this.horariosGuardados.map((d) => ({
        diaIndex: d.diaIndex,
        dia: d.dia,
        rangos: d.rangos.map((r) => ({
          apertura: r.apertura,
          cierre: r.cierre,
        })),
      }));

      try {
        await this.gestor.guardarHorarios(horarios, this.empresa.id);
        alert("Horarios guardados correctamente ✔️");
        this.horarios = await this.gestor.obtenerHorarios(this.empresa.id); // Actualizamos los horarios con lo que se guardó
        this.horariosGuardados = Array.isArray(this.horarios.horarios)
          ? this.horarios.horarios.map((h) => {
              const diaIndex = Number(h.diaIndex);

              return {
                ...h,
                dia: DIAS_SEMANA[diaIndex] || "",
                nombre: NOMBRE_DIAS[diaIndex] || "",
                rangos: Array.isArray(h.rangos) ? h.rangos : [],
              };
            })
          : [];
        // limpiar progreso
        this.renderHorariosEnModal(modal);
      } catch (error) {
        alert(`Error guardando horarios: ${error.message}`);
      }
    });
  }

  async abrirModalConfigurarEspectaculoHabilitarExcepcion() {
    const modal = this.empresa.modalConfigurarEspectaculoHabilitarExcepcion();
    this.listaCentral.classList.add("hidden");

    document.body.appendChild(modal);

    this.excepcionesGuardadas = Array.isArray(this.espectaculos.excepciones)
      ? this.espectaculos.excepciones.map((h) => {
          const diaIndex = Number(h.diaIndex);

          return {
            ...h,
            rangos: Array.isArray(h.rangos) ? h.rangos : [],
          };
        })
      : [];

    this.renderExcepcionesHabilitadasEnModal(modal);

    const botonFormEspectaculos = document.getElementById(
      "btnFormConfigurarEspectaculo",
    );
    botonFormEspectaculos.addEventListener("click", async (event) => {
      event.preventDefault();
      const hayExcepciones =
        this.espectaculos.excepciones.length !==
        this.excepcionesGuardadas.length;

      if (hayExcepciones) {
        const seguro = confirm(
          "¿Estás seguro de que querés salir?\nSe borrará tu progreso.",
        );

        if (!seguro) return;
      }

      modal.classList.add("hidden");
      await this.abrirModalConfigurarEspectaculos(modal);
      document.body.removeChild(modal);
    });

    const botonCerrar = document.getElementById(
      "cerrar-wrapper-espectaculo-excepcion-habilitada",
    );

    if (botonCerrar) {
      botonCerrar.addEventListener("click", (e) => {
        e.preventDefault();

        const hayExcepciones =
          this.espectaculos.excepciones.length !==
          this.excepcionesGuardadas.length;

        if (hayExcepciones) {
          const seguro = confirm(
            "¿Estás seguro de que querés salir?\nSe borrará tu progreso.",
          );

          if (!seguro) return;
        }

        this.listaCentral.classList.remove("hidden");
        modal.classList.add("hidden");
        document.body.removeChild(modal);
      });
    }

    const form = document.getElementById(
      "formConfigurarEspectaculoHabilitarExcepcion",
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fecha = document.getElementById("fechaExcepcionHabilitada").value;
      const horaInicio = document.getElementById("horaInicio").value;
      const horaFin = document.getElementById("horaFin").value;
      const cancelada = document.getElementById("tipo-excepcion").value;

      const fechaFormateada = this.formatearFechaCompleta(fecha);

      const nuevaExcepcion = {
        fecha: fechaFormateada,
        rangos: [{ horaInicio: horaInicio, horaFin: horaFin }],
        cancelada: cancelada === "1",
      };

      const haySuperposicion = this.validarNoSuperposicionExcepciones(
        nuevaExcepcion,
        this.excepcionesGuardadas,
      );

      if (haySuperposicion) {
        alert("Ese horario se superpone con otro existente");
        return;
      }

      const canceladaBooleano = cancelada === "1";

      const existente = this.excepcionesGuardadas.find(
        (h) =>
          h.fecha === nuevaExcepcion.fecha && h.cancelada === canceladaBooleano,
      );

      if (existente) {
        // Si ya existe el día, agregamos un rango nuevo
        existente.rangos.push({
          horaInicio: nuevaExcepcion.rangos[0].horaInicio,
          horaFin: nuevaExcepcion.rangos[0].horaFin,
        });
      } else {
        // Si no existe, creamos el día con su primer rango
        this.excepcionesGuardadas.push({
          fecha: nuevaExcepcion.fecha,
          rangos: [
            {
              horaInicio: nuevaExcepcion.rangos[0].horaInicio,
              horaFin: nuevaExcepcion.rangos[0].horaFin,
            },
          ],
          cancelada: cancelada === "1",
        });
      }

      // reset visual
      document.getElementById("fechaExcepcionHabilitada").value = "";
      document.getElementById("horaInicio").value = "";
      document.getElementById("horaFin").value = "";

      this.renderExcepcionesHabilitadasEnModal(modal);
    });

    const btnGuardar = modal.querySelector("#btnGuardarDiasFijos");
    btnGuardar.addEventListener("click", async () => {
      const horariosExcepciones = this.excepcionesGuardadas.map((d) => ({
        fecha: d.fecha,
        rangos: d.rangos.map((r) => ({
          horaInicio: r.horaInicio,
          horaFin: r.horaFin,
        })),
        cancelada: d.cancelada,
      }));

      try {
        await this.gestor.guardarExcepcion(
          horariosExcepciones,
          this.empresa.id,
        );
        alert("Horarios guardados correctamente ✔️");
        this.espectaculos = await this.gestor.obtenerEspectaculos(
          this.empresa.id,
        ); // Actualizamos las excepciones habilitadas con lo que se guardó
        // limpiar progreso
        this.renderHorariosEnModal(modal);
      } catch (error) {
        alert(`Error guardando horarios: ${error.message}`);
      }
    });
  }

  validarNoSuperposicionExcepciones(nuevaExcepcion, excepcionesExistentes) {
    const nuevosSeg = [];
    const existentesSeg = [];

    // =========================
    // NUEVO (siempre uno, pero puede generar 1 o 2 segmentos)
    // =========================
    const r = nuevaExcepcion.rangos[0];
    const baseNueva = this.dateToIndex(nuevaExcepcion.fecha);

    const segsNuevo = this.toSegments(0, r.horaInicio, r.horaFin);

    for (const s of segsNuevo) {
      nuevosSeg.push({
        start: baseNueva + s.start,
        end: baseNueva + s.end,
      });
    }

    // =========================
    // EXISTENTES
    // =========================
    for (const e of excepcionesExistentes) {
      const base = this.dateToIndex(e.fecha);

      for (const r of e.rangos) {
        const segs = this.toSegments(0, r.horaInicio, r.horaFin);

        for (const s of segs) {
          existentesSeg.push({
            start: base + s.start,
            end: base + s.end,
          });
        }
      }
    }

    // =========================
    // COMPARACIÓN
    // =========================
    for (const nuevo of nuevosSeg) {
      for (const existente of existentesSeg) {
        if (this.overlap(nuevo, existente)) {
          return true;
        }
      }
    }

    return false;
  }

  dateToIndex(fecha) {
    if (typeof fecha !== "string") {
      throw new Error(`Fecha inválida: ${fecha}`);
    }

    const [d, m, y] = fecha.split("/").map(Number);

    if (
      Number.isNaN(d) ||
      Number.isNaN(m) ||
      Number.isNaN(y) ||
      m < 1 ||
      m > 12 ||
      d < 1 ||
      d > 31
    ) {
      throw new Error(`Formato de fecha inválido: ${fecha}`);
    }

    // UTC para evitar problemas de zona horaria
    const timestamp = Date.UTC(y, m - 1, d);

    return Math.floor(timestamp / 60000);
  }

  async abrirModalConfigurarDiasNoLaborales() {
    const modal = this.empresa.modalConfigurarDiasNoLaborales();
    this.listaCentral.classList.add("hidden");

    document.body.appendChild(modal);

    const botonFormHorarios = modal.querySelector("#btnFormConfigurarHorarios");
    botonFormHorarios.addEventListener("click", async (event) => {
      event.preventDefault();
      const hayHorarios =
        this.horarios.noLab.length !== this.diasNoLaboralesGuardados.length;

      if (hayHorarios) {
        const seguro = confirm(
          "¿Estás seguro de que querés salir?\nSe borrará tu progreso.",
        );

        if (!seguro) return;
      }
      this.listaCentral.classList.remove("hidden");
      modal.classList.add("hidden");
      await this.abrirModalConfigurarHorarios(modal);
      document.body.removeChild(modal);
    });

    const botonCerrar = modal.querySelector(
      "#cerrar-wrapper-dias-no-laborales",
    );
    const botonAgregarDia = modal.querySelector("#agregarDiaNoLaboral");
    const botonAgregarRango = modal.querySelector("#agregarRangoNoLaboral");
    const form = modal.querySelector("#formConfigurarDiasNoLaborales");

    try {
      this.diasNoLaboralesGuardados = Array.isArray(this.horarios.noLab)
        ? [
            ...new Set(
              this.horarios.noLab
                .map((f) => this.normalizarFechaNoLaboralAlCargar(f))
                .filter(Boolean),
            ),
          ]
        : [];
    } catch (error) {
      this.diasNoLaboralesGuardados = [];
      console.warn(
        "No se pudieron cargar los días no laborales previos.",
        error,
      );
    }

    this.renderDiasNoLaboralesEnModal(modal);

    botonCerrar.addEventListener("click", (e) => {
      const hayHorarios =
        this.horarios.noLab.length !== this.diasNoLaboralesGuardados.length;

      if (hayHorarios) {
        const seguro = confirm(
          "¿Estás seguro de que querés salir?\nSe borrará tu progreso.",
        );

        if (!seguro) return;
      }

      e.preventDefault();
      this.listaCentral.classList.remove("hidden");
      modal.classList.add("hidden");
      document.body.removeChild(modal);
    });

    botonAgregarDia.addEventListener("click", () => {
      const inputFecha = modal.querySelector("#fechaNoLaboral");
      const fecha = inputFecha.value;

      if (!fecha) {
        alert("Seleccioná una fecha para agregar.");
        return;
      }

      this.agregarFechaNoLaboral(fecha);
      inputFecha.value = "";
      this.renderDiasNoLaboralesEnModal(modal);
    });

    botonAgregarRango.addEventListener("click", () => {
      const desde = modal.querySelector("#fechaNoLaboralInicio").value;
      const hasta = modal.querySelector("#fechaNoLaboralFin").value;

      if (!desde || !hasta) {
        alert("Tenés que seleccionar fecha de inicio y fecha de fin.");
        return;
      }

      const fechaInicio = this.parsearFechaNoLaboral(desde);
      const fechaFin = this.parsearFechaNoLaboral(hasta);

      if (!fechaInicio || !fechaFin) {
        alert("Las fechas deben tener formato DD/MM/YYYY.");
        return;
      }

      if (fechaInicio > fechaFin) {
        alert("La fecha de inicio no puede ser mayor a la fecha de fin.");
        return;
      }

      if (!this.confirmarAnioSiCorresponde([desde, hasta])) {
        return;
      }

      this.agregarRangoNoLaboral(desde, hasta);
      modal.querySelector("#fechaNoLaboralInicio").value = "";
      modal.querySelector("#fechaNoLaboralFin").value = "";
      this.renderDiasNoLaboralesEnModal(modal);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!this.diasNoLaboralesGuardados.length) {
        alert("No hay días no laborales cargados para guardar.");
        return;
      }

      try {
        await this.gestor.guardarDiasNoLaborales(
          this.diasNoLaboralesGuardados,
          this.empresa.id,
        );
        this.horarios = await this.gestor.obtenerHorarios(this.empresa.id); // Actualizamos los horarios con lo que se guardó
        this.diasNoLaboralesGuardados = Array.isArray(this.horarios.noLab)
          ? [
              ...new Set(
                this.horarios.noLab
                  .map((f) => this.normalizarFechaNoLaboralAlCargar(f))
                  .filter(Boolean),
              ),
            ]
          : [];
        alert("Días no laborales guardados correctamente ✔️");
      } catch (error) {
        alert(`Error guardando días no laborales: ${error.message}`);
      }
    });
  }

  agregarFechaNoLaboral(fechaInput, validarAnio = true) {
    const fechaFormateada = this.formatearFechaCompleta(fechaInput);

    if (!fechaFormateada) {
      alert("La fecha seleccionada no es válida.");
      return;
    }

    if (validarAnio && !this.confirmarAnioSiCorresponde([fechaFormateada])) {
      return;
    }

    if (!this.diasNoLaboralesGuardados.includes(fechaFormateada)) {
      this.diasNoLaboralesGuardados.push(fechaFormateada);
    }
  }

  agregarRangoNoLaboral(inicioInput, finInput) {
    let cursor = this.parsearFechaNoLaboral(inicioInput);
    const fin = this.parsearFechaNoLaboral(finInput);

    if (!cursor || !fin) {
      return;
    }

    while (cursor <= fin) {
      const yyyy = cursor.getFullYear();
      const mm = String(cursor.getMonth() + 1).padStart(2, "0");
      const dd = String(cursor.getDate()).padStart(2, "0");
      this.agregarFechaNoLaboral(`${dd}/${mm}/${yyyy}`, false);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  formatearFechaCompleta(fechaISO) {
    if (!fechaISO) return null;
    const fecha = String(fechaISO).trim();
    const partesNumericas = fecha.match(/\d+/g) || [];

    // Soporta DD/MM/YYYY, DD-MM-YYYY, DDMMYYYY, y YYYY-MM-DD.
    if (partesNumericas.length === 3) {
      const [a, b, c] = partesNumericas;
      let dd = "";
      let mm = "";
      let yyyy = "";

      if (a.length === 4) {
        yyyy = a;
        mm = b;
        dd = c;
      } else {
        dd = a;
        mm = b;
        yyyy = c;
      }

      const ddNorm = String(parseInt(dd, 10)).padStart(2, "0");
      const mmNorm = String(parseInt(mm, 10)).padStart(2, "0");
      const yyyyNorm = String(parseInt(yyyy, 10)).padStart(4, "0");
      if (!this.esFechaCompletaValida(ddNorm, mmNorm, yyyyNorm)) return null;
      return `${ddNorm}/${mmNorm}/${yyyyNorm}`;
    }

    if (/^\d{8}$/.test(fecha)) {
      const dd = fecha.slice(0, 2);
      const mm = fecha.slice(2, 4);
      const yyyy = fecha.slice(4, 8);
      if (!this.esFechaCompletaValida(dd, mm, yyyy)) return null;
      return `${dd}/${mm}/${yyyy}`;
    }

    return null;
  }

  normalizarFechaNoLaboralAlCargar(fechaInput) {
    const completa = this.formatearFechaCompleta(fechaInput);
    if (completa) return completa;

    const fecha = String(fechaInput || "").trim();
    const partes = fecha.match(/\d+/g) || [];
    if (partes.length !== 2) return null;

    const dd = String(parseInt(partes[0], 10)).padStart(2, "0");
    const mm = String(parseInt(partes[1], 10)).padStart(2, "0");
    const yyyy = String(new Date().getFullYear());
    if (!this.esFechaCompletaValida(dd, mm, yyyy)) return null;
    return `${dd}/${mm}/${yyyy}`;
  }

  parsearFechaNoLaboral(fechaInput) {
    const fechaNormalizada = this.formatearFechaCompleta(fechaInput);
    if (!fechaNormalizada) return null;

    const [dia, mes, anio] = fechaNormalizada.split("/").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    if (
      fecha.getFullYear() !== anio ||
      fecha.getMonth() + 1 !== mes ||
      fecha.getDate() !== dia
    ) {
      return null;
    }

    return fecha;
  }

  esFechaCompletaValida(dia, mes, anio) {
    const dd = Number(dia);
    const mm = Number(mes);
    const yyyy = Number(anio);
    if (
      !Number.isInteger(dd) ||
      !Number.isInteger(mm) ||
      !Number.isInteger(yyyy)
    )
      return false;
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
    if (yyyy < 1000 || yyyy > 9999) return false;

    const fecha = new Date(yyyy, mm - 1, dd);
    return (
      fecha.getFullYear() === yyyy &&
      fecha.getMonth() + 1 === mm &&
      fecha.getDate() === dd
    );
  }

  confirmarAnioSiCorresponde(fechas) {
    const anioActual = new Date().getFullYear();
    let anio = null;
    const hayAnioDistinto = (fechas || []).some((fechaInput) => {
      const fecha = this.formatearFechaCompleta(fechaInput);
      if (!fecha) return false;
      anio = Number(fecha.split("/")[2]);
      return anio !== anioActual;
    });

    if (!hayAnioDistinto) return true;
    return confirm(
      `La fecha que quiere registrar pertenece al año ${anio}, está seguro que desea registrarlo?`,
    );
  }

  renderDiasNoLaboralesEnModal(modal) {
    const contenedor = modal.querySelector("#listaDiasNoLaborales");
    const btnGuardar = modal.querySelector("#btnGuardarDiasNoLaborales");

    contenedor.innerHTML = "";

    if (
      !this.diasNoLaboralesGuardados ||
      this.diasNoLaboralesGuardados.length === 0
    ) {
      contenedor.innerHTML = `<p style="opacity:0.6; text-align:center;">
        Todavía no cargaste días no laborales.
      </p>`;

      if (btnGuardar) btnGuardar.classList.add("disabled");
      return;
    }

    if (btnGuardar) btnGuardar.classList.remove("disabled");

    const ordenados = [...this.diasNoLaboralesGuardados].sort((a, b) => {
      const fechaA = this.parsearFechaNoLaboral(a);
      const fechaB = this.parsearFechaNoLaboral(b);
      return (fechaA?.getTime() || 0) - (fechaB?.getTime() || 0);
    });

    ordenados.forEach((fecha) => {
      const card = document.createElement("div");
      card.classList.add("horario-card");

      card.innerHTML = `
        <button type="button" class="btn-eliminar-horario" data-fecha="${fecha}">
          ✖
        </button>
        <div class="horario-dia">${fecha}</div>
      `;

      contenedor.appendChild(card);
    });

    contenedor.querySelectorAll(".btn-eliminar-horario").forEach((btn) => {
      btn.addEventListener("click", () => {
        const fecha = btn.dataset.fecha;
        this.diasNoLaboralesGuardados = this.diasNoLaboralesGuardados.filter(
          (d) => d !== fecha,
        );
        this.renderDiasNoLaboralesEnModal(modal);
      });
    });
  }

  renderExcepcionesHabilitadasEnModal(modal) {
    const contenedor = modal.querySelector("#listaExcepcionesHabilitadas");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const btnGuardar = modal.querySelector("#btnGuardarDiasFijos");

    if (
      !Array.isArray(this.excepcionesGuardadas) ||
      this.excepcionesGuardadas.length === 0
    ) {
      contenedor.innerHTML = `<p style="opacity:0.6; text-align:center;">
        Todavía no cargaste excepciones habilitadas.
      </p>`;
      return;
    }

    if (btnGuardar) btnGuardar.classList.remove("disabled");

    const ordenados = [...this.excepcionesGuardadas].sort((a, b) => {
      const fechaCmp = (a.fecha || "").localeCompare(b.fecha || "");
      if (fechaCmp !== 0) return fechaCmp;
      // cancelados al final dentro del mismo día
      return Number(a.cancelada) - Number(b.cancelada);
    });

    for (const dia of ordenados) {
      const card = document.createElement("div");
      card.classList.add("horario-card");
      if (dia.cancelada) card.classList.add("cancelado");
      else card.classList.add("habilitado");

      const rangos = Array.isArray(dia.rangos) ? dia.rangos : [];

      const rangosOrdenados = [...rangos].sort((a, b) =>
        (a.inicio || "").localeCompare(b.inicio || ""),
      );

      const rangosHTML = rangosOrdenados
        .map(
          (r) => `
            <div class="horario-linea">Inicio: ${r.horaInicio}</div>
            <div class="horario-linea cierre">Fin: ${r.horaFin}</div>
          `,
        )
        .join("");

      // Clave compuesta fecha+cancelado para identificar unívocamente el elemento
      const claveUnica = `${dia.fecha}__${dia.cancelada ? "1" : "0"}`;

      card.innerHTML = `
        <button type="button" class="btn-eliminar-espectaculo" data-clave="${claveUnica}">
          ✖
        </button>

        <div class="horario-dia">
          <div class="texto-cancelada">
            ${dia.cancelada ? "Cancelado" : "Habilitado"}
          </div>
          ${dia.fecha}

        </div>
        ${rangosHTML}
      `;

      contenedor.appendChild(card);
    }

    contenedor.querySelectorAll(".btn-eliminar-espectaculo").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [fecha, canceladaFlag] = btn.dataset.clave.split("__");
        const cancelada = canceladaFlag === "1";

        this.excepcionesGuardadas = this.excepcionesGuardadas.filter(
          (h) => !(h.fecha === fecha && Boolean(h.cancelada) === cancelada),
        );

        this.renderExcepcionesHabilitadasEnModal(modal);
      });
    });
  }

  filtrarArticulos() {
    const textoBusqueda = this.normalizarTexto(this.barraBusqueda.value);

    if (textoBusqueda.length === 0) {
      this.volverAtras();
      this.todosLosArticulos.forEach((articulo) =>
        articulo.classList.remove("hidden"),
      );
      this.arrayContainerRubro.forEach((rubro) =>
        rubro.classList.remove("hidden"),
      );
      this.aplicarColoresAlternados(this.listaArticulos);
      return;
    }

    this.todosLosArticulos.forEach((articulo) => {
      const nombreArticulo = articulo.dataset.nombre.toLowerCase();
      const containerRubro = articulo.closest(".container-rubro");

      // Mostrar u ocultar el artículo
      if (nombreArticulo.includes(textoBusqueda)) {
        articulo.classList.remove("hidden");
        containerRubro.classList.remove("hidden");
      } else {
        articulo.classList.add("hidden");
      }
    });

    // Mostrar u ocultar el contenedor del rubro si todos sus artículos están ocultos
    document.querySelectorAll(".container-rubro").forEach((containerRubro) => {
      const articulosVisibles = containerRubro.querySelectorAll(
        ".articulo:not(.hidden)",
      ).length;
      if (articulosVisibles === 0) {
        containerRubro.classList.add("hidden");
      } else {
        containerRubro.classList.remove("hidden");
      }
    });
    this.aplicarColoresAlternados(this.listaArticulos);
  }

  volverAtras() {
    // Show the list of rubros
    this.listaArticulos.classList.remove("hidden");
  }

  obtenerIdEmpresa() {
    const url_segmentada = window.location.pathname.split("/");
    const ultimo_slug = url_segmentada[url_segmentada.length - 1];
    return ultimo_slug;
  }

  async asignarTituloPagina(texto) {
    try {
      this.tituloPagina.innerHTML = `${texto} ${this.empresa.nombre}`;
      document.title = `WinCoffe - ${this.empresa.nombre}`;
    } catch (error) {
      console.error("Error al asignar el título de la página:", error);
      this.tituloPagina.innerHTML = `<p>Error al cargar el título.</p>`;
    }
  }

  aplicarColoresAlternados(container) {
    let articulos = [];

    if (container instanceof HTMLElement) {
      articulos = Array.from(
        container.querySelectorAll(".articulo:not(.hidden)"),
      );
    } else if (Array.isArray(container)) {
      articulos = container.filter((el) => !el.classList.contains("hidden"));
    } else {
      console.warn("aplicarColoresAlternados: argumento no válido", container);
      return;
    }

    articulos.forEach((articulo, index) => {
      articulo.style.backgroundColor = index % 2 === 0 ? "#1d1d1d" : "#2c2c2e";
    });
  }

  normalizarTexto(texto) {
    return texto
      .normalize("NFD") // Descompone caracteres con tildes
      .replace(/[\u0300-\u036f]/g, "") // Elimina marcas diacríticas (tildes, acentos, etc.)
      .toLowerCase(); // Convierte a minúsculas
  }

  renderHorariosEnModal(modal) {
    const contenedor = modal.querySelector("#listaHorariosRegistrados");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const btnGuardar = modal.querySelector("#btnGuardarHorarios");

    // Si no hay horarios
    if (
      !Array.isArray(this.horariosGuardados) ||
      this.horariosGuardados.length === 0
    ) {
      contenedor.innerHTML = `<p style="opacity:0.6; text-align:center;">
        Todavía no cargaste horarios.
      </p>`;

      if (btnGuardar) btnGuardar.classList.add("disabled");
      return;
    }

    if (btnGuardar) btnGuardar.classList.remove("disabled");

    // Ordenar por día
    const ordenados = [...this.horariosGuardados].sort(
      (a, b) => Number(a.diaIndex) - Number(b.diaIndex),
    );

    for (const dia of ordenados) {
      const card = document.createElement("div");
      card.classList.add("horario-card");

      // 👇 por si rangos viene null o undefined
      const rangos = Array.isArray(dia.rangos) ? dia.rangos : [];

      const rangosOrdenados = [...rangos].sort((a, b) =>
        (a.apertura || "").localeCompare(b.apertura || ""),
      );

      const rangosHTML = rangosOrdenados
        .map(
          (r) => `
            <div class="horario-linea">Apertura: ${r.apertura}</div>
            <div class="horario-linea cierre">Cierre: ${r.cierre}</div>
          `,
        )
        .join("");

      card.innerHTML = `
        <button type="button" class="btn-eliminar-horario" data-diaindex="${dia.diaIndex}">
          ✖
        </button>

        <div class="horario-dia">${dia.nombre || dia.dia || `Día ${dia.diaIndex}`}</div>
        ${rangosHTML}
      `;

      contenedor.appendChild(card);
    }

    // Listener eliminar
    contenedor.querySelectorAll(".btn-eliminar-horario").forEach((btn) => {
      btn.addEventListener("click", () => {
        const diaIndex = Number(btn.dataset.diaindex);

        this.horariosGuardados = this.horariosGuardados.filter(
          (h) => Number(h.diaIndex) !== diaIndex,
        );

        this.renderHorariosEnModal(modal);
      });
    });
  }

  renderEspectaculosEnModal(modal) {
    const contenedor = modal.querySelector("#listaEspectaculosRegistrados");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const btnGuardar = modal.querySelector("#btnGuardarEspectaculos");

    // Si no hay horarios
    if (
      !Array.isArray(this.espectaculosGuardados) ||
      this.espectaculosGuardados.length === 0
    ) {
      contenedor.innerHTML = `<p style="opacity:0.6; text-align:center;">
        Todavía no cargaste horarios.
      </p>`;

      if (btnGuardar) btnGuardar.classList.add("disabled");
      return;
    }

    if (btnGuardar) btnGuardar.classList.remove("disabled");

    // Ordenar por día
    const ordenados = [...this.espectaculosGuardados].sort(
      (a, b) => Number(a.diaIndex) - Number(b.diaIndex),
    );

    for (const dia of ordenados) {
      const card = document.createElement("div");
      card.classList.add("horario-card");

      // 👇 por si rangos viene null o undefined
      const rangos = Array.isArray(dia.rangos) ? dia.rangos : [];

      const rangosOrdenados = [...rangos].sort((a, b) =>
        (a.inicio || "").localeCompare(b.inicio || ""),
      );

      const rangosHTML = rangosOrdenados
        .map(
          (r) => `
            <div class="horario-linea">Inicio: ${r.horaInicio}</div>
            <div class="horario-linea cierre">Fin: ${r.horaFin}</div>
          `,
        )
        .join("");

      card.innerHTML = `
        <button type="button" class="btn-eliminar-espectaculo" data-diaindex="${dia.diaIndex}">
          ✖
        </button>

        <div class="horario-dia">${dia.nombre || dia.dia || `Día ${dia.diaIndex}`}</div>
        ${rangosHTML}
      `;

      contenedor.appendChild(card);
    }

    // Listener eliminar
    contenedor.querySelectorAll(".btn-eliminar-espectaculo").forEach((btn) => {
      btn.addEventListener("click", () => {
        const diaIndex = Number(btn.dataset.diaindex);

        this.espectaculosGuardados = this.espectaculosGuardados.filter(
          (h) => Number(h.diaIndex) !== diaIndex,
        );

        this.renderEspectaculosEnModal(modal);
      });
    });
  }

  timeToMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  // Devuelve segmentos en "timeline semanal"
  // Ej: Lunes 19:00-02:00 => [{start:1140, end:1560}]
  toSegments(diaIndex, apertura, cierre) {
    const startMin = diaIndex * this.MINUTOS_DIA + this.timeToMinutes(apertura);
    let endMin = diaIndex * this.MINUTOS_DIA + this.timeToMinutes(cierre);

    // Si cierre <= apertura => cruza medianoche
    if (this.timeToMinutes(cierre) <= this.timeToMinutes(apertura)) {
      endMin += this.MINUTOS_DIA;
    }

    return [{ start: startMin, end: endMin }];
  }

  // Detecta si dos rangos se pisan
  overlap(a, b) {
    return a.start < b.end && b.start < a.end;
  }

  validarNoSuperposicion(nuevosHorarios, horariosExistentes) {
    const existentesSeg = [];
    const nuevosSeg = [];

    // EXISTENTES -> segmentos
    for (const h of horariosExistentes) {
      const segs = this.toSegments(h.diaIndex, h.apertura, h.cierre);

      for (const s of segs) {
        existentesSeg.push({
          dia: h.dia,
          start: s.start,
          end: s.end,
        });
      }
    }

    // NUEVOS -> segmentos
    for (const h of nuevosHorarios) {
      const segs = this.toSegments(h.diaIndex, h.apertura, h.cierre);

      for (const s of segs) {
        nuevosSeg.push({
          dia: h.dia,
          start: s.start,
          end: s.end,
        });
      }
    }

    // Comparar nuevos contra existentes
    for (const nuevo of nuevosSeg) {
      for (const existente of existentesSeg) {
        if (this.overlap(nuevo, existente)) {
          return `El horario de ${nuevo.dia} pisa otro horario existente.`;
        }

        const semana = 7 * this.MINUTOS_DIA;

        const nuevoPlus = {
          start: nuevo.start + semana,
          end: nuevo.end + semana,
        };
        const existentePlus = {
          start: existente.start + semana,
          end: existente.end + semana,
        };

        if (this.overlap(nuevoPlus, existente))
          return `Hay choque de horarios (por cruce semanal).`;
        if (this.overlap(nuevo, existentePlus))
          return `Hay choque de horarios (por cruce semanal).`;
      }
    }

    // Comparar nuevos entre sí
    for (let i = 0; i < nuevosSeg.length; i++) {
      for (let j = i + 1; j < nuevosSeg.length; j++) {
        if (this.overlap(nuevosSeg[i], nuevosSeg[j])) {
          return `Los nuevos horarios se pisan entre sí (${nuevosSeg[i].dia} con ${nuevosSeg[j].dia}).`;
        }
      }
    }

    return null;
  }

  validarNoSuperposicionEspectaculos(nuevosHorarios, horariosExistentes) {
    const existentesSeg = [];
    const nuevosSeg = [];

    // EXISTENTES -> segmentos
    for (const h of horariosExistentes) {
      const segs = this.toSegments(h.diaIndex, h.inicio, h.fin);

      for (const s of segs) {
        existentesSeg.push({
          dia: h.dia,
          start: s.start,
          end: s.end,
        });
      }
    }

    // NUEVOS -> segmentos
    for (const h of nuevosHorarios) {
      const segs = this.toSegments(h.diaIndex, h.inicio, h.fin);

      for (const s of segs) {
        nuevosSeg.push({
          dia: h.dia,
          start: s.start,
          end: s.end,
        });
      }
    }

    // Comparar nuevos contra existentes
    for (const nuevo of nuevosSeg) {
      for (const existente of existentesSeg) {
        if (this.overlap(nuevo, existente)) {
          return `El horario de ${nuevo.dia} pisa otro horario existente.`;
        }

        const semana = 7 * this.MINUTOS_DIA;

        const nuevoPlus = {
          start: nuevo.start + semana,
          end: nuevo.end + semana,
        };
        const existentePlus = {
          start: existente.start + semana,
          end: existente.end + semana,
        };

        if (this.overlap(nuevoPlus, existente))
          return `Hay choque de horarios (por cruce semanal).`;
        if (this.overlap(nuevo, existentePlus))
          return `Hay choque de horarios (por cruce semanal).`;
      }
    }

    // Comparar nuevos entre sí
    for (let i = 0; i < nuevosSeg.length; i++) {
      for (let j = i + 1; j < nuevosSeg.length; j++) {
        if (this.overlap(nuevosSeg[i], nuevosSeg[j])) {
          return `Los nuevos horarios se pisan entre sí (${nuevosSeg[i].dia} con ${nuevosSeg[j].dia}).`;
        }
      }
    }

    return null;
  }

  aplanarHorariosGuardados() {
    return this.horariosGuardados.flatMap((dia) =>
      dia.rangos.map((r) => ({
        dia: dia.dia,
        nombre: dia.nombre,
        diaIndex: dia.diaIndex,
        apertura: r.apertura,
        cierre: r.cierre,
      })),
    );
  }

  aplanarEspectaculosGuardados() {
    return this.espectaculosGuardados.flatMap((dia) =>
      dia.rangos.map((r) => ({
        dia: dia.dia,
        diaIndex: dia.diaIndex,
        inicio: r.horaInicio,
        fin: r.horaFin,
      })),
    );
  }

  async calcularPrecioActual() {
    if (this.empresa.precio_espectaculo === 1) {
      return 1;
    }
    const now = new Date();
    // Día de la semana (0-6)
    const diaIndex = now.getDay();

    // Fecha en formato dd/mm/yyyy
    const fechaActual = this.formatearFechaCompleta(
      now.toISOString().slice(0, 10),
    );

    // Hora en HH:mm
    const horaActual = now.toTimeString().slice(0, 5);

    const ahoraMin =
      diaIndex * this.MINUTOS_DIA + this.timeToMinutes(horaActual);

    const semana = 7 * this.MINUTOS_DIA;
    const ahoraSeg = { start: ahoraMin, end: ahoraMin + 1 };

    // =========================
    // 1. CANCELADAS
    // =========================
    for (const e of this.espectaculos.excepciones) {
      if (e.fecha === fechaActual && e.cancelada) {
        console.log("❌ Día cancelado");
        return 1;
      }
    }

    // =========================
    // 2. HABILITADAS
    // =========================
    for (const e of this.espectaculos.excepciones) {
      if (e.cancelada) continue;
      const fechaAyer = this.obtenerFechaAnterior(fechaActual);

      if (e.fecha === fechaActual || e.fecha === fechaAyer) {
        const diaIndexExcepcion = this.dateToDayIndex(e.fecha);

        for (const r of e.rangos) {
          const segs = this.toSegments(
            diaIndexExcepcion,
            r.horaInicio,
            r.horaFin,
          );

          for (const seg of segs) {
            if (this.overlap(ahoraSeg, seg)) {
              return this.empresa.precio_espectaculo;
            }

            const segPlus = {
              start: seg.start + semana,
              end: seg.end + semana,
            };

            if (this.overlap(ahoraSeg, segPlus)) {
              return this.empresa.precio_espectaculo;
            }
          }
        }
      }
    }

    // =========================
    // 3. HORARIO BASE
    // =========================
    for (const h of this.espectaculos.espectaculo) {
      for (const r of h.rangos) {
        const segs = this.toSegments(h.diaIndex, r.horaInicio, r.horaFin);

        for (const seg of segs) {
          if (this.overlap(ahoraSeg, seg)) {
            return this.empresa.precio_espectaculo;
          }

          const segPlus = {
            start: seg.start + semana,
            end: seg.end + semana,
          };

          if (this.overlap(ahoraSeg, segPlus)) {
            return this.empresa.precio_espectaculo;
          }
        }
      }
    }
    return 1;
  }

  dateToDayIndex(fecha) {
    const [d, m, y] = fecha.split("/").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCDay(); // 0 domingo - 6 sábado
  }

  obtenerFechaAnterior(fecha) {
    const [d, m, y] = fecha.split("/").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));

    date.setUTCDate(date.getUTCDate() - 1);

    const dia = String(date.getUTCDate()).padStart(2, "0");
    const mes = String(date.getUTCMonth() + 1).padStart(2, "0");
    const anio = date.getUTCFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  async eliminarVideoArticulo(articulo) {
    const mensaje = await this.gestor.eliminarVideoArticulo(
      articulo.id,
      articulo.video_url,
      this.empresa.id,
    );
    console.log(mensaje);
    await this.mostrarLista(this.listaArticulos);
  }

  async eliminarVideoRubro(rubro) {
    await this.gestor.eliminarVideoRubro(
      rubro.id,
      rubro.video_url,
      this.empresa.id,
    );
    await this.mostrarLista(this.listaRubros);
  }
}

// --- Inicialización ---
// Se crea una instancia de PantallaAdministrador cuando el DOM está listo
document.addEventListener("DOMContentLoaded", async () => {
  const pantalla = new PantallaModerador();
  await pantalla.init();
  pantalla.habilitarVentanaPrincipal();
});
