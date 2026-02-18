class ArticuloVista {
    
    constructor(articulo) {
        const { id, id_rubro, nombre, descripcion, precio, codigo_carta, seleccionado = false } = articulo;
        this.id = id;
        this.id_rubro = id_rubro;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.codigo_carta = codigo_carta;
        this.seleccionado = seleccionado;
    }
    
    mostrarUna() {
        const divArticulo = document.createElement('div');
        divArticulo.classList.add('articulo');
        divArticulo.dataset.articuloId = this.id;  //🤣😎
        divArticulo.dataset.nombre = this.nombre;
        divArticulo.dataset.descripcion = this.descripcion;
        divArticulo.dataset.precio = this.precio;
        
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('articulo-info');
        
        const pNombre = document.createElement('p');
        pNombre.id = 'nombre-articulo';
        
        // Concatenar código de carta si existe
        if (this.codigo_carta) {
            pNombre.textContent = `${this.nombre} (${this.codigo_carta})`;
        } else {
            pNombre.textContent = this.nombre;
        }
        
        infoContainer.appendChild(pNombre);
        
        const pPrecio = document.createElement('p');
        pPrecio.id = 'id-articulo';
        pPrecio.textContent = '$'+this.precio;
        infoContainer.appendChild(pPrecio);
        
        divArticulo.appendChild(infoContainer);
        
        if(this.descripcion){
            const pDescripcion = document.createElement('p');
            pDescripcion.textContent = this.descripcion;
            pDescripcion.classList.add("descripcion");
            
            divArticulo.appendChild(pDescripcion);
        }
        
        divArticulo.addEventListener('click', () => {
            const event = new CustomEvent('articuloSeleccionado', { detail: this });
            document.dispatchEvent(event);
            
            divArticulo.classList.toggle('seleccionado');

            // Reinicia animación si ya estaba activa
            divArticulo.classList.remove('pulse');
            void divArticulo.offsetWidth;
            divArticulo.classList.add('pulse');

            if (typeof window.gestorDeArticulosCallback === 'function') {
                window.gestorDeArticulosCallback(this);
            }
        });
        
        return divArticulo;
    }
    
    modalConfigurar() {
        const modalConfigurarArticulo = document.createElement('div');
        modalConfigurarArticulo.classList.add('modal');
        modalConfigurarArticulo.id = 'modal-configurar-articulo';

        const modalContenido = document.createElement('div');
        modalContenido.classList.add('modal-content-partial');

        const codigoCartaTexto = this.codigo_carta ? ` (${this.codigo_carta})` : '';

        const htmlContent = `
            <form id="form-configurar-articulo">
                <h2 id="nombre-articulo-modal">${this.nombre}${codigoCartaTexto}</h2>
                <p class="descripcion">${this.descripcion || ''}</p>
                <h2 id="id-articulo">$${this.precio}</h2>
                <button type="button" class="submit-button" id="modificar">Modificar</button>
            </form>`;

        modalContenido.innerHTML = htmlContent;
        modalConfigurarArticulo.appendChild(modalContenido);

        return modalConfigurarArticulo;
    }
    
    modalModificar() {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.id = 'modal-modificar-articulo';

        const contenido = document.createElement('div');
        contenido.classList.add('modal-content-partial');

        // Quitar puntos del precio (si lo guardas con formato 1.234, etc.)
        const precioSinPuntos = this.sacarPuntosPrecio(this.precio);

        contenido.innerHTML = `
            <form id="form-modificar-articulo">
                <h2>Modificar Artículo</h2>
                <div class="form-group">
                    <label>Nombre:</label>
                    <input type="text" name="nombre" value="${this.nombre}" required>
                </div>
                <div class="form-group">
                    <label>Código de carta:</label>
                    <input type="text" name="codigo_carta" value="${this.codigo_carta || ''}">
                </div>
                <div class="form-group">
                    <label>Descripción:</label>
                    <input type="text" name="descripcion" value="${this.descripcion || ''}">
                </div>
                <div class="form-group">
                    <label>Precio:</label>
                    <input type="text" name="precio" value="${precioSinPuntos}" required>
                </div>
                <button type="submit" class="submit-button">Guardar Cambios</button>
            </form>
        `;

        modal.appendChild(contenido);
        return modal;
    }
    
    sacarPuntosPrecio(precioConPuntos){
        return precioConPuntos.replace(/\./g, '');
    }
}