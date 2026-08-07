class RubroVista {
  constructor(rubro) {
    const { id, id_empresa, nombre, logo_url, video_url = null } = rubro;
    this.id = id;
    this.id_empresa = id_empresa;
    this.nombre = nombre;
    this.logo_url = logo_url;
    this.video_url = video_url;
    this.videoSVG = `<svg width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.25" fill-rule="evenodd" clip-rule="evenodd" d="M12 3C4.5885 3 3 4.5885 3 12C3 19.4115 4.5885 21 12 21C19.4115 21 21 19.4115 21 12C21 4.5885 19.4115 3 12 3ZM15.224 13.0171C16.011 12.5674 16.011 11.4326 15.224 10.9829L10.7817 8.44446C10.0992 8.05446 9.25 8.54727 9.25 9.33333L9.25 14.6667C9.25 15.4527 10.0992 15.9455 10.7817 15.5555L15.224 13.0171Z" fill="#000000"/>
      <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="#ffffff00" stroke-width="2"/>
      <path d="M10.9 8.8L10.6577 8.66152C10.1418 8.36676 9.5 8.73922 9.5 9.33333L9.5 14.6667C9.5 15.2608 10.1418 15.6332 10.6577 15.3385L10.9 15.2L15.1 12.8C15.719 12.4463 15.719 11.5537 15.1 11.2L10.9 8.8Z" stroke="#ffffff" fill="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  mostrarUno(paraCliente = false) {
    const divRubro = document.createElement("div");
    divRubro.classList.add("rubro");
    divRubro.dataset.RubroId = this.id;
    divRubro.style.backgroundImage = `url(${this.logo_url})`;

    const pNombre = document.createElement("h3");
    pNombre.textContent = this.nombre;
    // 2. Adjuntar la imagen al div principal
    divRubro.appendChild(pNombre);
    const container2 = document.createElement("div");

    if (this.video_url) {
      const botonVideo = document.createElement("button");
      botonVideo.classList.add("btn-ver-video");
      botonVideo.innerHTML = this.videoSVG;
      botonVideo.style = `
      position: absolute;
      top: 0px;
      right: 0px;
      padding: 0px;
      background-color: transparent;
      border: none;
      margin: 0px 5px;
      cursor: pointer;
      filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.9));`;

      botonVideo.addEventListener("click", (e) => {
        e.stopPropagation(); // Evita que se dispare el click del divArticulo (selección/animación)
        if (paraCliente)
          this.mostrarModalReproductorParaCliente(this.video_url);
        else this.mostrarModalReproductor(this.video_url);
      });

      container2.appendChild(botonVideo);
    }

    divRubro.appendChild(container2);

    divRubro.addEventListener("click", () => {
      const event = new CustomEvent("rubroSeleccionado", { detail: this });
      document.dispatchEvent(event);

      if (typeof window.gestorDeRubrosCallback === "function") {
        window.gestorDeRubrosCallback(this);
      }
    });

    return divRubro;
  }

  modalModificar(nombre) {
    const modalModificar = document.createElement("div");
    modalModificar.classList.add("modal");
    modalModificar.id = "modal-modificar-rubro";

    const modalModificarContenido = document.createElement("div");
    modalModificarContenido.classList.add("modal-content-partial");

    const htmlContent = `
    <span class="boton-eliminar" id="eliminar-rubro">Eliminar</span>
    <span class="close-modal-btn" style="position: absolute; top: 5px; right: 5px; cursor: pointer; font-size: 30px;">&times;</span>
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
                <button type="button" class="submit-button" id="boton-subir-video-rubro">Subir video</button>
                <button type="submit" class="submit-button" id="boton-modificar-rubro">Enviar</button> 
            </form> `;
    modalModificarContenido.innerHTML = htmlContent;
    modalModificar.appendChild(modalModificarContenido);

    const closeBtn = modalModificar.querySelector(".close-modal-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que interfieran otros listeners del modal
        modalModificar.remove();
      });
    }
    return modalModificar;
  }

  modalSubirVideoRubro() {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
    <div class="modal-content-partial">

      <span
        class="close-modal-btn"
        style="
          position: absolute;
          top: 5px;
          right: 5px;
          cursor: pointer;
          font-size: 30px;
        ">
        &times;
      </span>

      <h2>Archivo multimedia</h2>

      <form id="form-cargar-video">

        <div id="dropzone-video" class="dropzone">
          <div class="drop-content">

            <img
              src="../../../../Archivos/Iconos/video.svg"
              alt="Upload Icon"
              class="icon"
              height="50"
              width="50"
            />

            <p>
              Arrastrá tu archivo aquí o hacé click
            </p>

            <small>
              Formatos permitidos:
              MP4, MOV, AVI, GIF, JPG, PNG, WEBP
            </small>

          </div>

          <input
            type="file"
            id="archivo-video"
            name="archivo"
            accept="
              video/mp4,
              video/quicktime,
              video/x-msvideo,
              image/gif,
              image/jpeg,
              image/png,
              image/webp,
              .mp4,
              .mov,
              .avi,
              .gif,
              .jpg,
              .jpeg,
              .png,
              .webp
            "
            hidden
            required
          >
        </div>

        <div id="video-preview" class="file-preview hidden"></div>

        <button
          type="submit"
          class="submit-button disabled"
          id="boton-cargar-video">
          Enviar
        </button>

      </form>
    </div>
  `;

    const dropzone = modal.querySelector("#dropzone-video");
    const input = modal.querySelector("#archivo-video");
    const preview = modal.querySelector("#video-preview");

    function accionBotonCargar(estado) {
      const boton = modal.querySelector("#boton-cargar-video");

      if (!boton) return;

      boton.disabled = !estado;

      if (estado) {
        boton.classList.remove("disabled");
      } else {
        boton.classList.add("disabled");
      }
    }

    // Cerrar modal
    const closeBtn = modal.querySelector(".close-modal-btn");

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.remove();
      });
    }

    // Click
    dropzone.addEventListener("click", () => input.click());

    // Drag over
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    // Drag leave
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    // Drop
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();

      dropzone.classList.remove("dragover");

      const file = e.dataTransfer.files[0];

      input.files = e.dataTransfer.files;

      mostrarArchivo(file);
    });

    // Input change
    input.addEventListener("change", () => {
      const file = input.files[0];
      mostrarArchivo(file);
    });

    // Preview
    function mostrarArchivo(file) {
      if (!file) return;

      const validTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      const validExtensions = /\.(mp4|mov|avi|gif|jpg|jpeg|png|webp)$/i;

      if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
        preview.classList.remove("hidden");

        preview.innerHTML = `
        <strong>
          ❌ Archivo inválido.
          Solo se permiten:
          MP4, MOV, AVI, GIF, JPG, PNG o WEBP.
        </strong>
      `;

        input.value = "";

        accionBotonCargar(false);

        return;
      }

      const fileURL = URL.createObjectURL(file);

      preview.classList.remove("hidden");

      let previewElement = "";

      // Imágenes
      if (file.type.startsWith("image/")) {
        previewElement = `
        <img
          src="${fileURL}"
          alt="Preview Imagen"
          style="
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            margin-top: 10px;
            object-fit: contain;
          "
        />
      `;
      }

      // Videos
      else if (file.type.startsWith("video/")) {
        previewElement = `
        <video
          src="${fileURL}"
          controls
          style="
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            margin-top: 10px;
          ">
        </video>
      `;
      }

      preview.innerHTML = `
      <div class="file-info">

        ${previewElement}

        <p style="margin-top: 5px;">
          <strong>${file.name}</strong>
          (${(file.size / (1024 * 1024)).toFixed(2)} MB)
        </p>

      </div>
    `;

      accionBotonCargar(true);
    }

    // Eliminar
    const eliminarBtn = modal.querySelector("#eliminar-video");

    if (eliminarBtn) {
      eliminarBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.modalEliminarVideo();
      });
    }

    return modal;
  }

  mostrarModalReproductor(url) {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.id = "modal-video-rubro";

    modal.innerHTML = `
      <div class="modal-content-partial" id="modal-video">
        <button class="btn-eliminar" id="eliminar-video">
          <img src="../../../../Archivos/Iconos/trash4.svg" alt="Eliminar Icon" height="25" width="25"/>
        </button>
        <span class="close-modal-btn" style="position: absolute; top: -20px; right: 0px; cursor: pointer; font-size: 50px;">&times;</span>
        <h3 id="nombre-video" style="font-size: 21px;width: 75%;margin: auto;">${this.nombre}</h3>
        <div class="reproductor-container">
          ${
            /\.(gif|jpg|jpeg|png|webp)$/i.test(url)
              ? `
                <img
                  src="${url}"
                  alt="Imagen Rubro"
                  style="
                    max-width: 100%;
                    max-height: 80vh;
                    border-radius: 8px;
                    object-fit: contain;
                  "
                />
              `
              : `
              <video
                src="${url}"
                autoplay
                loop
                controls
                playsinline>
              </video>
              `
          }
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    this.clickFuera(modal);

    const closeBtn = modal.querySelector(".close-modal-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que interfieran otros listeners del modal
        modal.remove();
      });
    }

    const eliminarBtn = modal.querySelector("#eliminar-video");
    if (eliminarBtn) {
      eliminarBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que interfieran otros listeners del modal
        this.modalEliminarVideo();
      });
    }
  }

  mostrarModalReproductorParaCliente(url) {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.id = "modal-video-rubro";

    modal.innerHTML = `
      <div class="modal-content-partial" id="modal-video">
        <span class="close-modal-btn" style="position: absolute; top: -20px; right: 0px; cursor: pointer; font-size: 50px;">&times;</span>
        <h3 id="nombre-video" style="font-size: 21px;width: 75%;margin: auto;">${this.nombre}</h3>
        <div class="reproductor-container">
          ${
            /\.(gif|jpg|jpeg|png|webp)$/i.test(url)
              ? `
                <img
                  src="${url}"
                  alt="Imagen Rubro"
                  style="
                    max-width: 100%;
                    max-height: 80vh;
                    border-radius: 8px;
                    object-fit: contain;
                  "
                />
              `
              : `
              <video
                src="${url}"
                autoplay
                loop 
                  controls 
                  playsinline
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                >
                </video>`
          }
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    this.clickFuera(modal);

    const closeBtn = modal.querySelector(".close-modal-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que interfieran otros listeners del modal
        modal.remove();
      });
    }
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

  modalEliminarVideo() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.id = "modal-eliminar-video";

    const contenido = document.createElement("div");
    contenido.classList.add("modal-content-partial");

    contenido.innerHTML = `
      <h2>¿Deseas eliminar el video?</h2>
      <button type="button" class="submit-button" id="confirmar-eliminar-video">Confirmar</button>
      <button type="button" class="submit-button eliminar" id="cancelar-eliminar-video">Cancelar</button>
    `;

    modal.appendChild(contenido);

    document.body.appendChild(modal);

    this.clickFuera(modal);

    const confirmarBtn = document.getElementById("confirmar-eliminar-video");
    const cancelarBtn = document.getElementById("cancelar-eliminar-video");

    confirmarBtn.addEventListener("click", () => {
      const event = new CustomEvent("videoEliminarRubro", { detail: this });
      document.dispatchEvent(event);
      if (typeof window.eliminarVideoRubro === "function") {
        window.eliminarVideoRubro(this);
        document.getElementById("modal-video-rubro").remove();
        modal.remove();
      }
    });

    cancelarBtn.addEventListener("click", () => {
      modal.remove();
    });
  }
}
