const getProductosHATEOAS = (productos) => {
    return {
        total: productos.length,
        data: productos.map(p => ({
            ...p,
            links: [{
                rel: "self",
                href: `/productos/${p.id}`
            }]
        }))
    };
};

module.exports = {
    getProductosHATEOAS
};
