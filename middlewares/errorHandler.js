const errorHandler = (err, req, res, next) => {
    console.error(err.stack); 
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        erro: err.message || 'Erro interno no servidor'
    });
};

module.exports = errorHandler;