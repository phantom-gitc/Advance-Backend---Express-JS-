// Handle 404 for undefined routes
export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal server error";

    // Handle duplicate key error in MongoDB (e.g. duplicate email)
    if (err.code === 11000) {
        statusCode = 400;
        message = "Email already exists";
    }

    // Handle invalid ObjectId error
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

// Alias for backwards compatibility
export const notFoundHandler = notFound;
