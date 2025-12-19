class Carrito {
    
    constructor() {
        this.articulos = [];
    }
    
    agregarArticulo(articulo) {
        const copia = {
            id: articulo.id,
            nombre: articulo.nombre,
            precio: articulo.precio,
            cantidad: 1
        };
        if (articulo.nombre === undefined) {
            copia.nombre = articulo.dataset.nombre;
            copia.id = articulo.dataset.articuloId;
            copia.precio = articulo.dataset.precio;
        }
        this.articulos.push(copia);
    }
    
    eliminarArticulo(articuloId) {
        const idNum = Number(articuloId);
        this.articulos = this.articulos.filter(articulo => Number(articulo.id) !== idNum);
    }


    cambiarCantidad(nuevaCantidad, articuloId) {
        const articulo = this.articulos.find(art => art.id === articuloId);
        if (articulo) {
            articulo.cantidad = nuevaCantidad;
        }
    }
    
    obtenerTotal() {
        const total = this.articulos.reduce((total, articulo) => total + Number(this.eliminarPuntoPrecio(articulo.precio) * articulo.cantidad), 0);
        return this.insertarPuntoPrecio(total);
    }

    mostrarArticulos() {
        return this.articulos;
    }

    eliminarPuntoPrecio(precio) {
        return precio.replace(/\./g, '');
    }

    insertarPuntoPrecio(precio) {
        return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    vaciarCarrito() {
        this.articulos = [];
    }
}
