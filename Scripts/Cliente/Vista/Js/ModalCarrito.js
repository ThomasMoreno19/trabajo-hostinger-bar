class ModalCarrito {
    constructor(carrito, empresa, onEliminarArticulo) {
        this.carrito = carrito;
        this.empresa = empresa;
        this.onEliminarArticulo = onEliminarArticulo;
        this.listaCentral = document.getElementById('lista-central');
        this.wrapper = null;
    }

    abrirModalCarrito() {
        this.crearModal();        // crea el HTML del modal en el DOM
        this.botonEnviar = this.wrapper.querySelector("#boton-finalizar-compra");
        this.renderCarrito();     // dibuja las filas en base al carrito actual
        this.inicializarEventos(); // agrega delegación de eventos sobre elementos ya presentes
    }

    crearModal() {
        // Elimino modal previo si existe (evita duplicados)
        this.wrapper = document.getElementById("modal-carrito-wrapper");
        if (this.wrapper) this.wrapper.remove();
        
        this.wrapper = document.createElement("div");
        this.wrapper.id = "modal-carrito-wrapper";
        this.wrapper.innerHTML = `
        <div class="modal-carrito">
            <!-- HEADER -->
            <header id="header-modal-carrito">
                <h2>Carrito</h2>
                <button id="cerrar-modal-carrito" class="boton-cerrar">&times;</button>
            </header>

            <div class="modal-content">

                <!-- LISTA DE ARTÍCULOS -->
                <div id="lista-articulos-wrapper">

                    <div id="lista-articulos-contenedor">
                        <div id="cuerpo-tabla-carrito"></div>
                    </div>
                </div>

                <!-- TOTAL + BOTÓN -->
                <div id="zona-total">
                    <div id="total-carrito">
                        Total: $<span id="monto-total-carrito">0.00</span>
                    </div>

                    <button id="boton-finalizar-compra">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                            <!-- ICONO WHATSAPP -->
                            <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
                            <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774
                                c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006
                                c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
                        </svg>
                        Enviar pedido
                    </button>
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(this.wrapper);
    }

    renderCarrito() {
        const cuerpo = document.getElementById("cuerpo-tabla-carrito");
        const totalSpan = document.querySelector("#monto-total-carrito");

        if (!cuerpo || !totalSpan) return;

        cuerpo.innerHTML = "";

        const articulos = this.carrito.mostrarArticulos();

        if (!articulos || articulos.length === 0) {
            cuerpo.innerHTML = `
                <div class="vacio">
                    El carrito está vacío.
                </div>
            `;
            this.botonEnviar.removeEventListener("click", () => this.pedirTelefonoYNombre());
            this.botonEnviar.classList.add("desactivado");
            totalSpan.textContent = this.carrito.obtenerTotal() || "0.00";
            return;
        }
        this.botonEnviar.removeEventListener("click", () => this.pedirTelefonoYNombre());
        this.botonEnviar.addEventListener("click", () => this.pedirTelefonoYNombre());

        articulos.forEach(articulo => {

            if (typeof articulo.cantidad === "undefined") articulo.cantidad = 1;
            if (typeof articulo.subtotal === "undefined") articulo.subtotal = this.carrito.eliminarPuntoPrecio(articulo.precio) * articulo.cantidad;
            if (!articulo.observaciones) {
                articulo.observaciones = ["", "", ""];
            }

            articulo.subtotal = this.carrito.eliminarPuntoPrecio(articulo.precio) * articulo.cantidad;
            articulo.precio = this.carrito.insertarPuntoPrecio(articulo.precio);
            articulo.subtotal = this.carrito.insertarPuntoPrecio(articulo.subtotal);

            const bloque = document.createElement("div");
            bloque.classList.add("bloque-articulo");

            bloque.innerHTML = `
                <div class="fila-articulo">
                    <div class="nombre-precioUnitario">
                        <div class="col-nombre">${articulo.nombre}</div>
                        <div class="col-precio">$${articulo.precio} c/u</div>
                    </div>

                    <div class="observacion-wrapper">
                        <textarea class="observacion-textarea"
                            data-id="${articulo.id}"
                            data-index="0"
                            maxlength="50"
                            placeholder="Observación">
                        </textarea>

                        <textarea class="observacion-textarea hidden"
                            data-id="${articulo.id}"
                            data-index="1"
                            maxlength="50"
                            placeholder="Observación adicional">
                        </textarea>

                        <textarea class="observacion-textarea hidden"
                            data-id="${articulo.id}"
                            data-index="2"
                            maxlength="50"
                            placeholder="Observación adicional">
                        </textarea>
                    </div>
                    
                </div>

                <div class="info-extra">
                        <div class="subtotal-eliminar">
                            <div class="celda col-subtotal">$${articulo.subtotal}</div>
                            <button class="btn-eliminar" data-id="${articulo.id}" aria-label="Eliminar">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" version="1.1" id="Capa_1" width="19px" height="19px" viewBox="0 0 485 485" xml:space="preserve">
                                <g>
                                    <g>
                                        <rect x="67.224" width="350.535" height="71.81"/>
                                        <path d="M417.776,92.829H67.237V485h350.537V92.829H417.776z M165.402,431.447h-28.362V146.383h28.362V431.447z M256.689,431.447    h-28.363V146.383h28.363V431.447z M347.97,431.447h-28.361V146.383h28.361V431.447z"/>
                                    </g>
                                </g>
                                </svg>
                            </button>
                        </div>
                        <div class="col-cantidad">
                            <button class="btn-cant menos" data-id="${articulo.id}">-</button>
                            <span class="cantidad" data-id="${articulo.id}">${articulo.cantidad}</span>
                            <button class="btn-cant mas" data-id="${articulo.id}">+</button>
                        </div>
                    </div>
            `;

            cuerpo.appendChild(bloque);
            const textareas = bloque.querySelectorAll(".observacion-textarea");

            textareas.forEach((ta, i) => {
                ta.value = articulo.observaciones[i] || "";

                if (i > 0 && articulo.observaciones[i - 1].length <= 35) {
                    ta.classList.add("hidden");
                } else {
                    ta.classList.remove("hidden");
                }
            });

        });

        totalSpan.textContent = this.carrito.obtenerTotal();

        // Listener para textarea
        cuerpo.querySelectorAll(".observacion-textarea").forEach(textarea => {
            textarea.addEventListener("input", () => {
                const id = textarea.dataset.id;
                const index = Number(textarea.dataset.index);

                const articulo = this.carrito.mostrarArticulos()
                    .find(a => String(a.id) === String(id));

                if (!articulo) return;

                articulo.observaciones[index] = textarea.value;

                const wrapper = textarea.closest(".observacion-wrapper");
                const textareas = wrapper.querySelectorAll(".observacion-textarea");

                // Obs 2
                if (textareas[0].value.length > 35) {
                    textareas[1].classList.remove("hidden");
                } else {
                    textareas[1].classList.add("hidden");
                    textareas[1].value = "";
                    articulo.observaciones[1] = "";
                }

                // Obs 3
                if (textareas[1].value.length > 35) {
                    textareas[2].classList.remove("hidden");
                } else {
                    textareas[2].classList.add("hidden");
                    textareas[2].value = "";
                    articulo.observaciones[2] = "";
                }
            });
        });
    }


    inicializarEventos() {
        this.wrapper = document.getElementById("modal-carrito-wrapper");
        if (!this.wrapper) return;

        const cuerpo = this.wrapper.querySelector("#cuerpo-tabla-carrito");
        const botonCerrar = this.wrapper.querySelector("#cerrar-modal-carrito");
        if (!cuerpo) return;

        if (!cuerpo._listenerAttached) {
            // Delegación: un solo listener en el tbody para manejar +, -, eliminar
            cuerpo.addEventListener("click", (e) => {
                // Buscamos si el click vino de (o dentro de) un btn-eliminar
                const btnEliminar = e.target.closest(".btn-eliminar");
                if (btnEliminar) {
                    const id = btnEliminar.dataset.id;
                    
                    this.carrito.eliminarArticulo(id);

                    // notificar a PantallaCliente
                    if (this.onEliminarArticulo) {
                        this.onEliminarArticulo(id);
                    }

                    this.renderCarrito();
                    return;
                }


                // Aumentar / Disminuir
                const btnCant = e.target.closest(".btn-cant");
                if (btnCant && cuerpo.contains(btnCant)) {
                    const id = btnCant.dataset.id;
                    const articulo = this.carrito.mostrarArticulos().find(a => String(a.id) === String(id));
                    if (!articulo) return;

                    if (btnCant.classList.contains("mas") && articulo.cantidad<15) articulo.cantidad = (Number(articulo.cantidad) || 0) + 1;
                    else if (btnCant.classList.contains("menos") && Number(articulo.cantidad) > 1) {
                        articulo.cantidad = Number(articulo.cantidad) - 1;
                    }

                    this.renderCarrito();
                    return;
                }
            });

            cuerpo._listenerAttached = true;
        }

        // Listener para cerrar
        if (botonCerrar) {
            botonCerrar.addEventListener("click", () => {
                this.listaCentral.classList.remove('hidden');
                if (this.wrapper) this.wrapper.remove();
            });
        }
    }

    enviarPedidoWhatsApp(nombreCliente, telefonoCliente) {
        const articulos = this.carrito.mostrarArticulos();
        if (!articulos || articulos.length === 0) {

            alert("El carrito está vacío.");
            return;
        }

        // Construyo el mensaje
        let mensaje = `Nombre: ${nombreCliente}\nCelular: ${telefonoCliente}\n`;

        articulos.forEach(a => {
            const id      = String(a.id).padEnd(6).slice(0, 6);
            const nombre  = String(a.nombre).padEnd(30).slice(0, 30);
            const cant    = String(a.cantidad).padEnd(10).slice(0, 10);
            const obs = this.formatearObservacion(a.observaciones || ["", "", ""]);

            mensaje += `${id}${nombre}${cant}${obs}\n`;
        });

        // Teléfono del cliente
        const numeroWhatsApp = this.empresa.telefono.replace(/[^0-9]/g, '');

        // Codifico el mensaje para URL
        const mensajeCodificado = encodeURIComponent(mensaje);

        const esMovil = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    
        // Seleccionar la URL según el dispositivo
        const url = esMovil
            ? `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`
            : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensajeCodificado}`;
        
        // Abrir WhatsApp
        window.open(url, "_blank");

        articulos.forEach(articulo => {
            this.onEliminarArticulo(articulo.id);
        });
                    
    }

    pedirTelefonoYNombre() {
        // Eliminar modal previo si existe
        const viejo = document.getElementById("modal-datos-cliente");
        if (viejo) viejo.remove();

        const wrapper = document.createElement("div");
        wrapper.id = "modal-datos-cliente";

        wrapper.innerHTML = `
            <div class="modal-datos">
                <h2>Ingrese sus datos</h2>

                <label class="labels">Nombre*:</label>
                <input type="text" id="input-nombre-cliente" placeholder="Tu nombre" required>

                <label class="labels">Teléfono*:</label>
                <input 
                    type="tel" 
                    id="input-telefono-cliente"
                    placeholder="Ej: 3534123456"
                    maxlength="12"
                    inputmode="numeric"
                    pattern="[0-9]*
                    required">

                <button id="btn-confirmar-datos" class="confirmar">Enviar pedido</button>
            </div>
        `;

        document.body.appendChild(wrapper);
        document.getElementById("input-telefono-cliente").addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
        });
        const modalContenido = wrapper.querySelector(".modal-datos");

        // Cerrar modal al hacer click fuera
        wrapper.addEventListener("click", (e) => {
            if (!modalContenido.contains(e.target)) {
                wrapper.remove();
            }
        });

        document.getElementById("btn-confirmar-datos").onclick = () => {
            const nombre = document.getElementById("input-nombre-cliente").value.trim();
            const telefono = document.getElementById("input-telefono-cliente").value.trim();

            if (!nombre || !telefono) {
                return;
            }

            wrapper.remove();
            this.enviarPedidoWhatsApp(nombre, telefono);
            this.carrito.vaciarCarrito();
            const modalCarrito = document.getElementById("modal-carrito-wrapper");
            if (modalCarrito) modalCarrito.remove();
            this.listaCentral.classList.remove('hidden');
        };
    }

    formatearObservacion(observaciones) {
        return observaciones
            .map(obs => (obs || "").padEnd(50, " ").slice(0, 50))
            .join("");
    }
}
