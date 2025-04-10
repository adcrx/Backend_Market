const pool = require('../config/db-config');
const format = require('pg-format');

// Función para obtener productos con paginación, ordenamiento y filtro opcional por vendedor_id
const getProductos = async (limit, page, order_by, vendedor_id) => {
    const offset = (page - 1) * limit;
    const order = order_by ? order_by.replace('_', ' ') : 'id ASC';

    let queryParams = [];
    let query = `
        SELECT p.*
        FROM productos p
    `;

    if (vendedor_id !== undefined && vendedor_id !== null) {
        query += ' WHERE p.vendedor_id = %L';
        queryParams.push(vendedor_id);
    } else {
        query += ' WHERE 1=1';
    }

    query += ' ORDER BY p.id';
    query += format(' LIMIT %L OFFSET %L', limit, offset);

    const finalQuery = format(query, ...queryParams);
    console.log("Executing SQL:", finalQuery);

    const result = await pool.query(finalQuery);
    return result.rows;
};

const getProductosFiltrados = async (filters) => {
    const { precio_max, precio_min, categoria, vendedor_id } = filters;
    let query = `
        SELECT p.*
        FROM productos p
        WHERE 1=1
    `;
    const queryParams = [];

    if (precio_max) {
        query += ' AND p.precio <= %L';
        queryParams.push(precio_max);
    }
    if (precio_min) {
        query += ' AND p.precio >= %L';
        queryParams.push(precio_min);
    }
    if (categoria) {
        query += ' AND p.categoria_id = %L';
        queryParams.push(categoria);
    }
    if (vendedor_id) {
        query += ' AND p.vendedor_id = %L';
        queryParams.push(vendedor_id);
    }

    const finalQuery = format(query, ...queryParams);
    console.log("Executing SQL (filtros):", finalQuery);

    const result = await pool.query(finalQuery);
    return result.rows;
};

const createProducto = async (productoData) => {
    const { titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id } = productoData;
    if (!vendedor_id) throw new Error("vendedor_id es requerido para crear un producto");

    const query = format(
        'INSERT INTO productos (titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id) VALUES (%L, %L, %L, %L, %L, %L, %L, %L) RETURNING *',
        titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id
    );
    console.log("Executing SQL (create):", query);
    const result = await pool.query(query);
    return result.rows[0];
};

const getProductoPorId = async (id) => {
    const query = `
        SELECT p.*
        FROM productos p
        WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const updateProducto = async (id, productoData) => {
    const { titulo, descripcion, precio, categoria_id, size, stock, imagen } = productoData;
    let updateFields = [];
    let queryParams = [id];
    let paramIndex = 2;

    if (titulo !== undefined) {
        updateFields.push(`titulo = $${paramIndex++}`);
        queryParams.push(titulo);
    }
    if (descripcion !== undefined) {
        updateFields.push(`descripcion = $${paramIndex++}`);
        queryParams.push(descripcion);
    }
    if (precio !== undefined) {
        updateFields.push(`precio = $${paramIndex++}`);
        queryParams.push(precio);
    }
    if (categoria_id !== undefined) {
        updateFields.push(`categoria_id = $${paramIndex++}`);
        queryParams.push(categoria_id);
    }
    if (size !== undefined) {
        updateFields.push(`size = $${paramIndex++}`);
        queryParams.push(size);
    }
    if (stock !== undefined) {
        updateFields.push(`stock = $${paramIndex++}`);
        queryParams.push(stock);
    }
    if (imagen !== undefined) {
        updateFields.push(`imagen = $${paramIndex++}`);
        queryParams.push(imagen);
    }

    if (updateFields.length === 0) {
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        return result.rows[0];
    }

    const query = format(`
        UPDATE productos 
        SET ${updateFields.join(', ')} 
        WHERE id = $1 
        RETURNING *
    `, ...queryParams);

    console.log("Executing SQL (update):", query);
    const result = await pool.query(query, queryParams);
    return result.rows[0];
};

const deleteProducto = async (id) => {
    const query = format('DELETE FROM productos WHERE id = %L RETURNING *', id);
    const result = await pool.query(query);
    return result.rowCount > 0;
};

module.exports = {
    getProductos,
    getProductosFiltrados,
    createProducto,
    getProductoPorId,
    updateProducto,
    deleteProducto,
};
