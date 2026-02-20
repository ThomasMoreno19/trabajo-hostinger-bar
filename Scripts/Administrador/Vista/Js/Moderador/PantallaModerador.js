// Scripts/Administrador/Vista/Js/PantallaModerador.js
class PantallaModerador {
  constructor() {
    // Inicializamos el Gestor y los elementos del DOM
    this.gestor = new GestorModerador();
    this.listaArticulos = document.getElementById('lista-articulos');
    this.listaRubros = document.getElementById('lista-rubros');
    this.listaCentral = document.getElementById('lista-central');
    this.articuloSeleccionado = null;
    this.horariosGuardados = [];
    this.diasNoLaboralesGuardados = [];
    this.horarios = [];
    this.MINUTOS_DIA = 1440;
    
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

    try {
      this.horarios = await this.gestor.obtenerHorarios(this.empresa.id);

    } catch (error) {
      this.horariosGuardados = [];
      this.diasNoLaboralesGuardados = [];
      console.warn('No se pudieron cargar los horarios o días no laborales previos.', error);
    }

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
        const articulosRecibidos = await this.gestor.mostrarListaArticulosPorEmpresa(this.empresa.id);
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

          // 3. Obtener la lista de artículos para el rubro actual (cargada en bloque)
          const listaArticulosRecibidos = articulosPorRubro[String(id_rubro)] || [];

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
        const rubrosRecibidos = await this.gestor.mostrarListaRubros(this.empresa.id);
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
      if (event.target === modal){
        document.body.removeChild(modal);
        this.articuloSeleccionado = null;
      }
    });

    botonModificarArticulo.addEventListener('click', () => {
      this.abrirModalModificarArticulo(modal);
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
  
  abrirModalModificarArticulo(modalPadre) {
    const articulo = this.articuloSeleccionado;
    if (!articulo) return;
    const padre = modalPadre;
    const modal = this.articuloSeleccionado.modalModificar();
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
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
          formData.get('codigo-carta') || ''
        );

        document.body.removeChild(modal);
        document.body.removeChild(padre);
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
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content-partial">
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
    this.listaCentral.classList.add('hidden');
    
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

      const botonCerrar = document.getElementById('cerrar-wrapper');
      botonCerrar.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.removeChild(modal);  
        document.body.appendChild(modalPadre);
        this.listaCentral.classList.remove('hidden');
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
        const contrasenaMesero = formData.get('contrasenaMesero');
        
        try {
          // Llamamos al método del gestor con el nombre y el archivo.
          await this.gestor.modificarModerador(moderador.id, usuario, contrasena);
          await this.gestor.modificarEmpresa(this.empresa.id, nombre, telefono, ubicacion, efectivo, tarjeta, transferencia, contrasenaMesero);
          this.empresa.update(nombre, telefono, ubicacion, efectivo, tarjeta, transferencia);
          modal.classList.add('hidden');
          document.body.removeChild(modal);
          this.listaCentral.classList.remove('hidden');
          
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      });
  }

  async configurarEmpresa() {
    const modal = this.empresa.modalConfigurarEmpresa();
    
    // Agregamos un ID al modal para poder identificarlo
    document.body.appendChild(modal);
    const botonSecccionModificar = document.getElementById('seccion-modificar');
    const botonVisitarPagina = document.getElementById('visitar-pagina');
    const botonConfigurarHorarios = document.getElementById('configurar-horarios');

    
    const botonVisitarGestion = document.getElementById('visitar-gestion');
    botonVisitarGestion.classList.add('hidden');
    
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

    botonConfigurarHorarios.addEventListener('click', async (event) => {
      event.preventDefault();
      await this.abrirModalConfigurarHorarios(modal);
      document.body.removeChild(modal);
    });
  }

  async abrirModalConfigurarHorarios() {
    const modal = this.empresa.modalConfigurarHorarios();
    this.listaCentral.classList.add('hidden');

    document.body.appendChild(modal);
    
    this.horariosGuardados = Array.isArray(this.horarios.horarios)
        ? this.horarios.horarios.map((h) => {
            const diaIndex = Number(h.diaIndex);

            return {
              ...h,
              dia: DIAS_SEMANA[diaIndex] || '',
              nombre: NOMBRE_DIAS[diaIndex] || '',
              rangos: Array.isArray(h.rangos) ? h.rangos : []
            };
          })
        : [];


    this.renderHorariosEnModal(modal);

    const botonFormDiasNoLaborales = document.getElementById('btnFormDiasNoLaborales');
    botonFormDiasNoLaborales.addEventListener('click', async (event) => {
      event.preventDefault();
      await this.abrirModalConfigurarDiasNoLaborales(modal);
      document.body.removeChild(modal);
    });

    const botonCerrar = document.getElementById('cerrar-wrapper');

    if (botonCerrar) {
      botonCerrar.addEventListener("click", (e) => {
        e.preventDefault();

        const hayHorarios = this.horarios.horarios.length !== this.horariosGuardados.length;

        if (hayHorarios) {
          const seguro = confirm(
            "¿Estás seguro de que querés salir?\nSe borrará tu progreso."
          );

          if (!seguro) return;
        }

        this.listaCentral.classList.remove("hidden");
        modal.classList.add("hidden");
        document.body.removeChild(modal);
      });
    }

    
    const botonesDias = modal.querySelectorAll('.toggle-btn');
    // Listener para los botones de dias de la semana
    botonesDias.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
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

      const error = this.validarNoSuperposicion(nuevosHorarios, horariosExistentesPlano);

      if (error) {
        alert("No se puede guardar: ese horario pisa otro.");
        return;
      }

      // Guardar (agrupando por día)
      nuevosHorarios.forEach((nuevo) => {
        const existente = this.horariosGuardados.find(h => h.diaIndex === nuevo.diaIndex);

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
            rangos: [{
              apertura: nuevo.apertura,
              cierre: nuevo.cierre,
            }]
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
              dia: DIAS_SEMANA[diaIndex] || '',
              nombre: NOMBRE_DIAS[diaIndex] || '',
              rangos: Array.isArray(h.rangos) ? h.rangos : []
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
  
  async abrirModalConfigurarDiasNoLaborales() {
    const modal = this.empresa.modalConfigurarDiasNoLaborales();
    this.listaCentral.classList.add('hidden');

    document.body.appendChild(modal);

    const botonFormHorarios = modal.querySelector('#btnFormConfigurarHorarios');
    botonFormHorarios.addEventListener('click', async (event) => {
      event.preventDefault();
      await this.abrirModalConfigurarHorarios(modal);
      document.body.removeChild(modal);
    });

    const botonCerrar = modal.querySelector('#cerrar-wrapper-dias-no-laborales');
    const botonAgregarDia = modal.querySelector('#agregarDiaNoLaboral');
    const botonAgregarRango = modal.querySelector('#agregarRangoNoLaboral');
    const form = modal.querySelector('#formConfigurarDiasNoLaborales');

    try {
      this.diasNoLaboralesGuardados = Array.isArray(this.horarios.noLab)
        ? [...new Set(this.horarios.noLab)]
        : [];
    } catch (error) {
      this.diasNoLaboralesGuardados = [];
      console.warn('No se pudieron cargar los días no laborales previos.', error);
    }

    this.renderDiasNoLaboralesEnModal(modal);

    botonCerrar.addEventListener('click', (e) => {
      const hayHorarios = this.horarios.noLab.length !== this.diasNoLaboralesGuardados.length;

        if (hayHorarios) {
          const seguro = confirm(
            "¿Estás seguro de que querés salir?\nSe borrará tu progreso."
          );

          if (!seguro) return;
        }
        
      e.preventDefault();
      this.listaCentral.classList.remove('hidden');
      modal.classList.add('hidden');
      document.body.removeChild(modal);
    });

    botonAgregarDia.addEventListener('click', () => {
      const inputFecha = modal.querySelector('#fechaNoLaboral');
      const fecha = inputFecha.value;

      if (!fecha) {
        alert('Seleccioná una fecha para agregar.');
        return;
      }

      this.agregarFechaNoLaboral(fecha);
      inputFecha.value = '';
      this.renderDiasNoLaboralesEnModal(modal);
    });

    botonAgregarRango.addEventListener('click', () => {
      const desde = modal.querySelector('#fechaNoLaboralInicio').value;
      const hasta = modal.querySelector('#fechaNoLaboralFin').value;

      if (!desde || !hasta) {
        alert('Tenés que seleccionar fecha de inicio y fecha de fin.');
        return;
      }

      if (new Date(desde) > new Date(hasta)) {
        alert('La fecha de inicio no puede ser mayor a la fecha de fin.');
        return;
      }

      this.agregarRangoNoLaboral(desde, hasta);
      modal.querySelector('#fechaNoLaboralInicio').value = '';
      modal.querySelector('#fechaNoLaboralFin').value = '';
      this.renderDiasNoLaboralesEnModal(modal);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.diasNoLaboralesGuardados.length) {
        alert('No hay días no laborales cargados para guardar.');
        return;
      }

      try {
        await this.gestor.guardarDiasNoLaborales(this.diasNoLaboralesGuardados, this.empresa.id);
        this.horarios = await this.gestor.obtenerHorarios(this.empresa.id); // Actualizamos los horarios con lo que se guardó
        this.diasNoLaboralesGuardados = Array.isArray(this.horarios.noLab)
        ? [...new Set(this.horarios.noLab)]
        : [];
        alert('Días no laborales guardados correctamente ✔️');
      } catch (error) {
        alert(`Error guardando días no laborales: ${error.message}`);
      }
    });
  }

  agregarFechaNoLaboral(fechaISO) {
    const fechaFormateada = this.formatearFechaMMDD(fechaISO);

    if (!fechaFormateada) {
      alert('La fecha seleccionada no es válida.');
      return;
    }

    if (!this.diasNoLaboralesGuardados.includes(fechaFormateada)) {
      this.diasNoLaboralesGuardados.push(fechaFormateada);
    }
  }

  agregarRangoNoLaboral(inicioISO, finISO) {
    let cursor = new Date(`${inicioISO}T00:00:00`);
    const fin = new Date(`${finISO}T00:00:00`);

    while (cursor <= fin) {
      const yyyy = cursor.getFullYear();
      const mm = String(cursor.getMonth() + 1).padStart(2, '0');
      const dd = String(cursor.getDate()).padStart(2, '0');
      this.agregarFechaNoLaboral(`${yyyy}-${mm}-${dd}`);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  formatearFechaMMDD(fechaISO) {
    if (!fechaISO || !fechaISO.includes('-')) return null;
    const [, mes, dia] = fechaISO.split('-');
    if (!mes || !dia) return null;
    return `${dia}/${mes}`;
  }

  renderDiasNoLaboralesEnModal(modal) {
    const contenedor = modal.querySelector('#listaDiasNoLaborales');
    const btnGuardar = modal.querySelector('#btnGuardarDiasNoLaborales');

    contenedor.innerHTML = '';

    if (!this.diasNoLaboralesGuardados || this.diasNoLaboralesGuardados.length === 0) {
      contenedor.innerHTML = `<p style="opacity:0.6; text-align:center;">
        Todavía no cargaste días no laborales.
      </p>`;

      if (btnGuardar) btnGuardar.disabled = true;
      return;
    }

    if (btnGuardar) btnGuardar.disabled = false;

    const ordenados = [...this.diasNoLaboralesGuardados].sort((a, b) => {
      const [diaA, mesA] = a.split('/').map(Number);
      const [diaB, mesB] = b.split('/').map(Number);
      if (mesA !== mesB) return mesA - mesB;
      return diaA - diaB;
    });

    ordenados.forEach((fecha) => {
      const card = document.createElement('div');
      card.classList.add('horario-card');

      card.innerHTML = `
        <button type="button" class="btn-eliminar-horario" data-fecha="${fecha}">
          ✖
        </button>
        <div class="horario-dia">${fecha}</div>
      `;

      contenedor.appendChild(card);
    });

    contenedor.querySelectorAll('.btn-eliminar-horario').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fecha = btn.dataset.fecha;
        this.diasNoLaboralesGuardados = this.diasNoLaboralesGuardados.filter((d) => d !== fecha);
        this.renderDiasNoLaboralesEnModal(modal);
      });
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

  renderHorariosEnModal(modal) {
    const contenedor = modal.querySelector("#listaHorariosRegistrados");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const btnGuardar = modal.querySelector("#btnGuardarHorarios");

    // Si no hay horarios
    if (!Array.isArray(this.horariosGuardados) || this.horariosGuardados.length === 0) {
      contenedor.innerHTML = `<p style="opacity:0.6; text-align:center;">
        Todavía no cargaste horarios.
      </p>`;

      if (btnGuardar) btnGuardar.disabled = true;
      return;
    }

    if (btnGuardar) btnGuardar.disabled = false;

    // Ordenar por día
    const ordenados = [...this.horariosGuardados].sort(
      (a, b) => Number(a.diaIndex) - Number(b.diaIndex)
    );

    for (const dia of ordenados) {
      const card = document.createElement("div");
      card.classList.add("horario-card");

      // 👇 por si rangos viene null o undefined
      const rangos = Array.isArray(dia.rangos) ? dia.rangos : [];

      const rangosOrdenados = [...rangos].sort((a, b) =>
        (a.apertura || "").localeCompare(b.apertura || "")
      );

      const rangosHTML = rangosOrdenados
        .map(
          (r) => `
            <div class="horario-linea">Apertura: ${r.apertura}</div>
            <div class="horario-linea cierre">Cierre: ${r.cierre}</div>
          `
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
          (h) => Number(h.diaIndex) !== diaIndex
        );

        this.renderHorariosEnModal(modal);
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

        const nuevoPlus = { start: nuevo.start + semana, end: nuevo.end + semana };
        const existentePlus = { start: existente.start + semana, end: existente.end + semana };

        if (this.overlap(nuevoPlus, existente)) return `Hay choque de horarios (por cruce semanal).`;
        if (this.overlap(nuevo, existentePlus)) return `Hay choque de horarios (por cruce semanal).`;
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
      }))
    );
  }



}


// --- Inicialización ---
// Se crea una instancia de PantallaAdministrador cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
  const pantalla = new PantallaModerador();
  await pantalla.init();
  pantalla.habilitarVentanaPrincipal();
});
