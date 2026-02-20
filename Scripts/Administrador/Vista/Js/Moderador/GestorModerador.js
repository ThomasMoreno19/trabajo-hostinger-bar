// Scripts/Administrador/Vista/Js/GestorAdministrador.js
class GestorModerador {
    
    // El método mostrarListaEmpresas ahora solo devuelve los datos, sin manipular el DOM
    async cacheFetch(url, body, cacheKeyPrefix, ttl = 600, id_empresa) { // 10 min
        // Agregar id_empresa al body
        const requestBody = { ...body, id_empresa };
    
        const key = `${cacheKeyPrefix}_${JSON.stringify(requestBody)}_empresa${id_empresa}`;
        const cached = localStorage.getItem(key);
        const now = Date.now();
    
        if (cached) {
            const data = JSON.parse(cached);
            if (now - data.timestamp < ttl) {
                return data.value;
            }
        }
    
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
    
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Error' }));
            throw new Error(err.error || 'Error de red');
        }
    
        const result = await response.json();
        localStorage.setItem(key, JSON.stringify({ value: result, timestamp: now }));
        return result;
    }

    
    // El método mostrarListaEmpresas ahora solo devuelve los datos, sin manipular el DOM
    async mostrarListaArticulos(id_rubro, id_empresa) {
        return await this.cacheFetch(
            `/articulo/mostrar`,
            { id_rubro },
            'articulos',
            600, //10 min
            id_empresa
        );
    }

    async mostrarListaArticulosPorEmpresa(id_empresa) {
        return await this.cacheFetch(
            `/articulo/mostrar/empresa`,
            { id_empresa },
            'articulos_empresa',
            600,
            id_empresa
        );
    }
    
    async mostrarListaRubros(id_empresa) {
        return await this.cacheFetch(
            `/rubro/mostrar`,
            { id_empresa },
            'rubros',
            600,
            id_empresa
        );
    }
    
    borrarCacheRubroYArticulo(id_empresa) {
        if (!id_empresa) {
            console.warn("❗ No se proporcionó id_empresa para borrar el caché");
            return;
        }
    
        const keysToRemove = [];
    
        // Recorremos todas las claves del localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
    
            // Coincide si contiene el id_empresa en la clave
            if (
                key &&
                key.includes(`empresa${id_empresa}`) &&
                (key.startsWith("rubros_") || key.startsWith("articulos_") || key.startsWith("articulos_empresa_"))
            ) {
                keysToRemove.push(key);
            }
        }
    
        // Si no hay nada que borrar, salir sin hacer nada
        if (keysToRemove.length === 0) {
            console.info(`ℹ️ No hay caché para borrar de la empresa ${id_empresa}`);
            return;
        }
    
        // Eliminamos las claves encontradas
        keysToRemove.forEach(k => localStorage.removeItem(k));
    }


    
    async asignarImagen(id, id_empresa, nombre, archivoImagen, logo_url = '') {
        try {
            // Subir la imagen y obtener la URL del logo.
            const urlLogoEmpresa = await this.subirImagen(archivoImagen, logo_url);
            
            // Subir los datos de la empresa con la URL que obtuvimos.
            const rubro = await this.modificarRubro(id, id_empresa, nombre, urlLogoEmpresa);
            
            return rubro;
            
        } catch (error) {
            console.error('Error en el proceso de creación de la empresa:', error);
            throw error;
        }
    }
    
    async subirImagen(archivoImagen, logo_url) {
        if(!archivoImagen){
            return logo_url;
        }
        const formData = new FormData();
        formData.append('imagen', archivoImagen);
        
        try {
            // 3. Enviar la solicitud POST con FormData en el body
            const response = await fetch(`/rubro/subir-logo`, {
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
    
    async cargarArticulosYRubros(archivo, id_empresa) {
        return new Promise((resolve, reject) => {
    
            const reader = new FileReader();
    
            reader.onload = async (event) => {
                try {
                    const listaObjetos = [];
                    if(archivo.type === 'text/csv'){
                        const contenido = event.target.result;
                        
                        const lineas = contenido.split('\n');
        
                        // Elimina la primera línea (cabecera)
                        const lineasSinCabecera = lineas.slice(2);
        
                        // Process all lines to create both lists
                        const rubrosUnicos = new Set(); // Use a Set to store unique rubro names
        
                        lineasSinCabecera.forEach(linea => {
                            const columnas = linea.split(';');
                            if (columnas.length >= 4) {
                                const articulo = {
                                    id_articulo: columnas[0],
                                    nombre_articulo: columnas[3].trim(),
                                    descripcion: this.limpiarDescripcion(columnas[8]?.toString().trim() || ""),
                                    precio_articulo: parseFloat(columnas[4].trim()),
                                    codigo_carta_articulo: (columnas[1]?.toString().trim() || ""),
                                    nombre_rubro: columnas[7].trim()
                                };
                                listaObjetos.push(articulo);
                            }
                        });
                    }else if(['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(archivo.type)){
                        // 2. Leer como ArrayBuffer
                        const data = new Uint8Array(event.target.result);
                    
                        // 3. Usar XLSX para parsear
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                        // 4. Eliminar cabecera
                        const lineasSinCabecera = jsonData.slice(2);
                    
                        lineasSinCabecera.forEach(columnas => {
                            // Saltar filas vacías
                            if (!columnas || columnas.length === 0) return;
                    
                            const articulo = {
                                id_articulo: columnas[0],
                                nombre_articulo: (columnas[3].toString().trim()),
                                descripcion: this.limpiarDescripcion(columnas[8]?.toString().trim() || ""), // 👈 Esto evita el error
                                precio_articulo: parseFloat(columnas[4]),
                                codigo_carta_articulo: (columnas[1]?.toString().trim() || ""),
                                nombre_rubro: columnas[7].toString().trim()
                            };
                    
                            listaObjetos.push(articulo);
                        });
                    }
                    
                    await this.setearEn0(id_empresa);
                    // Now, send both lists to the respective methods
                    const listaArticulos = await this.cargarRubros(listaObjetos, id_empresa);
                    const booleanoArticulos = await this.cargarArticulos(listaArticulos, id_empresa);

                    // Resolve the promise based on the results of both calls
                    if (booleanoArticulos) {
                        resolve(await this.borrarRubrosYArtNoUtilizados(id_empresa));
                    } else {
                        reject(new Error('Algunos datos no se pudieron cargar correctamente.'));
                    }
    
                } catch (error) {
                    reject(error);
                }
            };
    
            reader.onerror = (error) => {
                reject(new Error('Error al leer el archivo.'));
            };
    
            if (archivo.type === 'text/csv') {
                reader.readAsText(archivo);
            } else if (['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(archivo.type)) {
                reader.readAsArrayBuffer(archivo);
            }
        });
    }
    
    async cargarRubros(lista, id_empresa) {
        try {
            const bodyData = {
            id_empresa: id_empresa,
            lista: lista};
            const response = await fetch('/rubro/cargar-lista', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Stringify the combined object
                body: JSON.stringify(bodyData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error en el servidor: ${response.status}`);
            }
    
            const resultado = await response.json();
            return resultado;
        } catch (error) {
            console.error('Error al enviar la lista:', error);
        }
    }
    
    async cargarArticulos(lista, id_empresa) {
        try {
            const bodyData = {
                id_empresa: id_empresa,
                lista: lista
            };
    
            const response = await fetch('/articulo/cargar-lista', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });
    
            // ⚠️ Leer primero como texto para ver qué llega
            const rawText = await response.text();
    
            // Intentar parsear solo si parece JSON
            let resultado;
            try {
                resultado = JSON.parse(rawText);
            } catch {
                throw new Error("El servidor devolvió HTML o un error PHP");
            }
    
            if (!response.ok) {
                throw new Error(resultado.error || `Error en el servidor: ${response.status}`);
            }
    
            return resultado;
    
        } catch (error) {
            console.error('Error al enviar la lista:', error);
            throw error; // importante para que se propague arriba
        }
    }


    
    async setearEn0(id_empresa) {
        try {
            const bodyData = {
            id_empresa: id_empresa};
            const response = await fetch('/rubro/setear-en-0', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Stringify the combined object
                body: JSON.stringify(bodyData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error en el servidor: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error al enviar la lista:', error);
        }
    }
    
    async borrarRubrosYArtNoUtilizados(id_empresa) {
        try {
            const bodyData = {
            id_empresa: id_empresa};
            const response = await fetch('/rubro/eliminar-no-utilizados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Stringify the combined object
                body: JSON.stringify(bodyData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error en el servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al enviar la lista:', error);
        }
    }
    
    async modificarArticulo(id, id_rubro, nombre, descripcion, precio, codigo_carta = '') {
        const bodyData = {
            id: id,
            id_rubro: id_rubro,
            descripcion: descripcion,
            nombre: nombre,
            precio: precio,
            codigo_carta: codigo_carta
        };
        
        try {
            const response = await fetch(`/articulo/modificar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bodyData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido al modificar articulo' }));
                throw new Error(errorData.message || `Error al crear el moderador: ${response.status}`);
            }

            // El backend debe devolver el objeto del nuevo moderador creado.
            const articulo = await response.json();
            return articulo;

        } catch (error) {
            console.error('Error al modificar articulo:', error);
            throw error;
        }
    }
    
    async modificarRubro(id, id_empresa, nombre, archivoImagen, logo_url = '') {
        let urlLogoEmpresa = logo_url;

        // Solo subir imagen si se proporcionó una nueva
        if (archivoImagen) {
            urlLogoEmpresa = await this.subirImagen(archivoImagen, logo_url);
        }
        
        const bodyData = {
            id: id,
            id_empresa: id_empresa,
            nombre: nombre,
            logo_url: urlLogoEmpresa
        };
        
        try {
            const response = await fetch(`/rubro/modificar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bodyData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido al modificar articulo' }));
                throw new Error(errorData.message || `Error al crear el moderador: ${response.status}`);
            }

            // El backend debe devolver el objeto del nuevo moderador creado.
            const rubro = await response.json();
            return rubro;

        } catch (error) {
            console.error('Error al modificar articulo:', error);
            throw error;
        }
    }
    
    async conocerEmpresa(id_empresa) {
        // Validación básica
        if (!id_empresa || isNaN(parseInt(id_empresa))) {
            throw new Error("ID de empresa inválido");
        }
    
        const bodyData = { id_empresa: parseInt(id_empresa) };
    
        return await this.cacheFetch(
            `/empresa/mostrar/id`,
            bodyData,
            'empresa',        // Prefijo único para esta entidad
            600,           // 10 minutos
            id_empresa
        );
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
    
    async modificarEmpresa(id, nombre, telefono, ubicacion, efectivo, tarjeta, transferencia, contrasenaMesero) {
        const bodyData = {
            id: id,
            nombre: nombre,
            telefono: telefono,
            ubicacion: ubicacion,
            efectivo: efectivo,
            tarjeta: tarjeta,
            transferencia: transferencia,
            contrasenaMesero: contrasenaMesero
        };
        
        try {
            const response = await fetch(`/empresa/modificar-para-moderador`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bodyData),
            });
            
            if (!response.ok) { 
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido al modificar empresa' }));
                throw new Error(errorData.message || `Error al modificar la empresa: ${response.status}`);
            }
            
            // El backend debe devolver el objeto de la nueva empresa creada.
            const empresa = await response.json();
            return empresa;   
            
        } catch (error) {   
            console.error('Error al modificar el empresa:', error);
            throw error;
        }
    }
    
    async loguearAdministrador(nombre, contrasena) {
        try {
            // Realiza el fetch a la URL 'admin/login/nombre/contrasena'
            const response = await fetch(`/admin/login/${nombre}/${contrasena}`);
            
            // Verifica si la respuesta HTTP es exitosa
            if (!response.ok) {
                throw new Error(`Error en el servidor: ${response.status}`);
            }
            
            return await response.json(); // Esto debería ser 'true' o 'false'
            
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
    
    limpiarDescripcion(texto) {
        if (!texto) return "";
        // Reemplaza saltos de línea (\r, \n, \r\n) por una coma y espacio
        return texto.replace(/[\r\n]+/g, ', ').trim();
    }

    async guardarHorarios(horarios, id_empresa) {

        const bodyData = {
            id_empresa: id_empresa,
            horarios: horarios
        };

        const response = await fetch(`/empresa/guardar-horarios`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Error guardando horarios' }));
            throw new Error(err.error || 'Error guardando horarios');
        }

        return await response.json();
    }

    async guardarDiasNoLaborales(dias_no_laborales, id_empresa) {

        const bodyData = {
            id_empresa,
            dias_no_laborales
        };

        const response = await fetch(`/empresa/guardar-dias-no-laborales`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Error guardando días no laborales' }));
            throw new Error(err.error || 'Error guardando días no laborales');
        }

        return await response;
    }

    async obtenerHorarios(id_empresa) {
        const bodyData = { id_empresa };

        const response = await fetch(`/empresa/mostrar-horarios`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Error obteniendo horarios' }));
            throw new Error(err.error || 'Error obteniendo horarios');
        }

        return await response.json();
    }

    async loguearModerador(nombre, contrasena, id_empresa) {
        try {
            const bodyData = {
            nombre: nombre,
            contrasena: contrasena,
            id_empresa: id_empresa
            };
            const responseBack = await fetch(`/moderador/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bodyData),
            });
            const response = await responseBack.json();

            // Verifica si la respuesta HTTP es exitosa
            if (!responseBack.ok || !response) {
                console.log("enviando al metodo loguearAdministrador")
                return this.loguearAdministrador(nombre, contrasena);
            }
            
            return await response; // Esto debería ser 'true' o 'false'
            
        } catch (error) {
            console.error('Error en loginModerador:', error);
            // Propagamos el error para que la pantalla lo maneje
            throw error; 
        }
    }
    
}
