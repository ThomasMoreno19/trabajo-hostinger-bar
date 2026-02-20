// Scripts/Administrador/Vista/Js/PantallaIniciarSesionAdmin.js

class PantallaLogin {

    constructor() {
        this.loginForm = document.getElementById('login-form');
        this.nombreInput = document.getElementById('nombre');
        this.contrasenaInput = document.getElementById('contrasena');
        this.mensajeError = document.getElementById('mensaje-error');
        this.togglePasswordButton = document.getElementById('togglePassword');
        this.gestor = new GestorModerador();
        this.agregarEventListeners();
    }

    agregarEventListeners() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (event) => this.manejarLogin(event));
        }
        if (this.togglePasswordButton && this.contrasenaInput) {
          this.togglePasswordButton.addEventListener('click', () => {
            const isPassword = this.contrasenaInput.type === 'password';
            this.contrasenaInput.type = isPassword ? 'text' : 'password';
        
            // Cambiar SVG según el estado
            this.togglePasswordButton.innerHTML = isPassword
              ? `
                <!-- SVG del ojo cerrado -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="1.5" stroke="currentColor" width="22" height="22">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12
                        C3.226 16.338 7.244 19.5 12 19.5
                        c.993 0 1.953-.138 2.863-.395M6.228 6.228
                        A10.451 10.451 0 0 1 12 4.5
                        c4.756 0 8.773 3.162 10.065 7.498
                        a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228
                        3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228
                        -3.65-3.65m0 0a3 3 0 1 0-4.243-4.243
                        m4.242 4.242L9.88 9.88" />
                </svg>`
              : `
                <!-- SVG del ojo abierto -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="1.5" stroke="currentColor" width="22" height="22">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639
                        C3.423 7.51 7.36 4.5 12 4.5
                        c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639
                        C20.577 16.49 16.64 19.5 12 19.5
                        c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>`;
          });
        }

    }

    async manejarLogin(event) {
        event.preventDefault();
        const id_empresa = this.obtenerIdEmpresa();


        const nombre = this.nombreInput.value;
        const contrasena = this.contrasenaInput.value;
        
        this.mensajeError.textContent = ''; // Limpiamos el mensaje de error anterior
        
        try {
            const loginExitoso = await this.gestor.loguearModerador(nombre, contrasena, id_empresa);
            if (loginExitoso) {
                this.mensajeError.classList.add('hidden');
                console.log(loginExitoso)
                window.location.href = +id_empresa;
            } else {
                this.mensajeError.textContent = 'Nombre de usuario o contraseña incorrectos.';
                this.mensajeError.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error durante el proceso de login:', error);
            this.mensajeError.textContent = 'Ocurrió un error en el servidor. Intente de nuevo más tarde.';
            this.mensajeError.classList.remove('hidden');
        }
    }

    obtenerIdEmpresa() {
        const url_segmentada = window.location.pathname.split('/');
        const ultimo_slug = url_segmentada[url_segmentada.length - 1];
        return ultimo_slug;
    }
}

// Inicialización de la pantalla cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    new PantallaLogin();
});