// Scripts/Administrador/Vista/Js/GestorAdministrador.js

class GestorAdministrador {
    
    // El método mostrarListaEmpresas ahora solo devuelve los datos, sin manipular el DOM
    async mostrarListaEmpresas() {
      try {
        const response = await fetch('/empresa/mostrar');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(`Error al obtener empresas: ${response.status} - ${errorData.error || errorData.message}`);
        }
        return await response.json();
          
      } catch (error) {
        console.error('Error cargando la lista de empresas:', error);
        throw error;
      }
    }
    
    async mostrarListaModeradores() {
      try {
        const response = await fetch('/moderador/mostrar');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(`Error al obtener moderadores: ${response.status} - ${errorData.error || errorData.message}`);
        }
        return await response.json();
          
      } catch (error) {
        console.error('Error cargando la lista de moderadores:', error);
        // Propagamos el error para que la Pantalla lo maneje
        throw error;
      }
    }
    
    async subirImagen(id_empresa, archivoImagen) {
      
      const bodyData = {
        archivoImagen: archivoImagen,
        id_empresa: id_empresa
      };
      
      try {
        // 3. Enviar la solicitud POST con FormData en el body
        const response = await fetch(`/empresa/subir-logo`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(errorData.message || `Error al subir la imagen: ${response.status}`);
        }
        
        // 4. El backend debería responder con un JSON que contenga la URL del logo
        const data = await response.json();
        
        // 5. Retornar solo la URL del logo
        return data.url;
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw error;
      }
    }
    
    async crearEmpresa(nombre, telefono, ubicacion, tienecarrito, moduloMesero, efectivo, tarjeta, transferencia, contrasenaMesero, imagen) {
      try {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('telefono', telefono);
        formData.append('ubicacion', ubicacion);
        formData.append('tieneCarrito', tienecarrito ? true : false);
        formData.append('moduloMesero', moduloMesero ? true : false);
        formData.append('efectivo', efectivo ? true : false);
        formData.append('tarjeta', tarjeta ? true : false);
        formData.append('transferencia', transferencia ? true : false);
        formData.append('contrasenaMesero', contrasenaMesero || '');
        
        if (imagen) {
          formData.append('imagen', imagen);
        }

        const response = await fetch(`/empresa/crear`, {
          method: 'POST',
          body: formData, //sin headers JSON aquí
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido al crear empresa' }));
          throw new Error(errorData.error || `Error al crear la empresa: ${response.status}`);
        }

        const nuevaEmpresa = await response.json();
        return nuevaEmpresa;
      } catch (error) {
        console.error('Error al crear la empresa:', error);
        throw error;
      }
    }

    
    async crearModerador(nombre, id_empresa, contrasena) {
      const bodyData = {
        nombre: nombre,
        id_empresa: id_empresa,
        contrasena: contrasena
      };
      
      try {
        const response = await fetch(`/moderador/crear`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(bodyData),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido al crear moderador' }));
          throw new Error(errorData.message || `Error al crear el moderador: ${response.status}`);
        }
        
        // El backend debe devolver el objeto del nuevo moderador creado.
        const moderador = await response.json();
        return moderador;
          
      } catch (error) {
        console.error('Error al crear el moderador:', error);
        throw error;
      }
    }
    
    async modificarModerador(id, nombre, contrasena) {
      const bodyData = {
        nombre: nombre,
        id: id,
        contrasena: contrasena
      };
      
      try {
        const response = await fetch(`/moderador/modificar`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(bodyData),
        });
        
        if (!response.ok) { 
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido al modificar moderador' }));
          throw new Error(errorData.message || `Error al modificar el moderador: ${response.status}`);
        }
        
        // El backend debe devolver el objeto del nuevo moderador creado.
        const moderador = await response.json();
        return moderador;   
          
      } catch (error) {
        console.error('Error al modificar el moderador:', error);
        throw error;
      }
    }
    
    async modificarEmpresa(id, nombre, telefono, ubicacion, tieneCarrito, moduloMesero, efectivo, tarjeta, transferencia, contrasenaMesero, imagenFile) {
      const formData = new FormData();

      formData.append('id', id);
      formData.append('nombre', nombre);
      formData.append('telefono', telefono);
      formData.append('ubicacion', ubicacion);
      formData.append('tieneCarrito', tieneCarrito);
      formData.append('moduloMesero', moduloMesero);
      formData.append('efectivo', efectivo);
      formData.append('tarjeta', tarjeta);
      formData.append('transferencia', transferencia);
      formData.append('contrasenaMesero', contrasenaMesero || '');

      // Solo mandamos la imagen si el usuario eligió una
      if (imagenFile) {
        formData.append('imagen', imagenFile);
      }

      const response = await fetch(`/empresa/modificar`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al modificar empresa' }));
        throw new Error(errorData.message || `Error al modificar la empresa: ${response.status}`);
      }

      return await response.json();
    }

    
    async loguearAdministrador(nombre, contrasena) {
      try {
        // Realiza el fetch a la URL 'admin/login/nombre/contrasena'
        const response = await fetch(`/admin/login/${nombre}/${contrasena}`);
        
        // Verifica si la respuesta HTTP es exitosa
        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.status}`);
        }
        
        // El backend debe devolver un booleano (true si es exitoso, false si no)
        const resultado = await response.json();
        
        return resultado; // Esto debería ser 'true' o 'false'
          
      } catch (error) {
        console.error('Error en loginAdministrador:', error);
        // Propagamos el error para que la pantalla lo maneje
        throw error; 
      }
    }
    
    async obtenerModerador(id_empresa){
      try{
        // Verifica si la empresa ya tiene un moderador asignado
        const bodyData = {
        id_empresa: id_empresa};
        const Moderador = await fetch(`/moderador/obtener-por-empresa`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(bodyData),
        });
        const moderador = await Moderador.json();
        return moderador;
          
      }catch (error) {
        console.error(`Error al obtener el moderador de la empresa con ID ${id_empresa}`, error);
        // Propagamos el error para que la pantalla lo maneje
        throw error; 
      }
    }
    
    async obtenerLogoEmpresa(id_empresa) { 
      try {
        const bodyData = { id_empresa: id_empresa };    
        
        const response = await fetch(`/moderador/obtener-logo-empresa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const logo_url = await response.json();
        
        return logo_url;
          
      } catch (error) {
        console.error('Error al obtener el logo de la empresa ', id_empresa, ':', error);
        throw error;
        
      }
    }

    
    async cambiarLogoEmpresa(id_empresa, imagen, nombre) {
      try{
        // Crear FormData correctamente
        const formData = new FormData();
        formData.append('id_empresa', id_empresa);
        formData.append('nombre', nombre);
        formData.append('imagen', imagen);

        // Enviar FormData (NO uses headers manuales, fetch lo hace solo)
        const response = await fetch(`/empresa/modificar-logo`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 2. Await the .json() call to get the data
        return await response.json();
        
      } catch(error){
        console.error('Error al cambiar el logo de la empresa ', id_empresa, ':', error);
        throw error;
      }
    }

}