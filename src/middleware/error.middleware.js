const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Record not found',
        });
    }

    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'Record already exists',
        });
    }

    if (err.code === 'P2003') {
        return res.status(400).json({
            success: false,
            message: 'Invalid reference ID',
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};

module.exports = errorMiddleware;