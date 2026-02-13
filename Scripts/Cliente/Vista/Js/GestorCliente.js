// Scripts/Administrador/Vista/Js/GestorAdministrador.js

class GestorCliente {
    
    // cacheFetch.js
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
    
    async mostrarListaRubros(id_empresa) {
        return await this.cacheFetch(
            `/rubro/mostrar`,
            { id_empresa },
            'rubros',
            600,
            id_empresa
        );
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
            600,            // 10 minutos
            id_empresa
        );
    }


    async obtenerHorarios(id_empresa) {
        const bodyData = { id_empresa: parseInt(id_empresa) };

        const response = await fetch(`/empresa/mostrar-horarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Error al obtener horarios' }));
            throw new Error(err.error || 'Error al obtener horarios');
        }

        return await response.json();
    }

    async verificarContrasenaMesero(id_empresa, contrasena) {
        const bodyData = { id_empresa: parseInt(id_empresa), contrasena };

        const response = await fetch(`/empresa/verificar-contrasena-mesero`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Error al verificar contraseña de mesero' }));
            throw new Error(err.error || 'Error al verificar contraseña de mesero');
        }

        return await response.json();
    }

}