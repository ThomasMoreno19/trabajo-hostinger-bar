class RubroVista {
    
    constructor(id, id_empresa, nombre, logo_url) {
        this.id = id;
        this.id_empresa = id_empresa;
        this.nombre = nombre;
        this.logo_url = logo_url;
    }
    
    mostrarUno() {
        const divRubro = document.createElement('div');
        divRubro.classList.add('rubro');
        divRubro.dataset.RubroId = this.id;  //🤣😎
        divRubro.style.backgroundImage = `url(${this.logo_url})`;
        

        const pNombre = document.createElement('h3');
        pNombre.textContent = this.nombre;
        // 2. Adjuntar la imagen al div principal
        divRubro.appendChild(pNombre);
        
        divRubro.addEventListener('click', () => {
            const event = new CustomEvent('rubroSeleccionado', { detail: { rubroId: this.id, rubroIdEmpresa: this.id_empresa, rubroNombre: this.nombre, rubroLogo: this.logo_url } });
            document.dispatchEvent(event);

            if (typeof window.gestorDeRubrosCallback === 'function') {
                window.gestorDeRubrosCallback(this.id, this.id_empresa, this.nombre, this.logo_url);
            }
        });
        
        return divRubro;
    }
    
    modalModificar(nombre) { 
        const modalModificar = document.createElement('div'); 
        modalModificar.classList.add('modal'); 
        modalModificar.id = 'modal-modificar-rubro'; 
    
        const modalModificarContenido = document.createElement('div'); 
        modalModificarContenido.classList.add('modal-content-partial'); 
    
        const htmlContent = `
            <form id="form-modificar-rubro" method="POST" enctype="multipart/form-data"> 
                <h2 id ="titulo-modal">Modificar Rubro</h2> 
                <div class="form-group"> 
                    <label for="nombre">Nombre:</label> 
                    <input type="text" id="nombre" name="nombre" value="${nombre}" required> 
                </div> 
                <div class="form-group"> 
                    <label for="nombre">Imagen:</label> 
                    <input type="file" id="imagen" name="imagen" accept="image/*"> 
                </div> 
                <button type="submit" class="submit-button" id="boton-modificar-rubro">Enviar</button> 
            </form> `
        ; 
    
        modalModificarContenido.innerHTML = htmlContent; 
        modalModificar.appendChild(modalModificarContenido); 
        return modalModificar; 
    }


    
}