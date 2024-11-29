import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


export const authAdminMiddleware = (req, res, next) => {
    if (!req.headers.access_token) {
        return next({
            status: 401,
            message: 'The token is empty',
        });
    }
    const token = req.headers.access_token.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
        if (user?.roleId === 'R1') {
            next()
        } else {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
    })
}

export const authUserMiddleware = (req, res, next) => {
    if (!req.headers.access_token) {
        return next({
            status: 401,
            message: 'The token is empty',
        });
    }
    const token = req.headers.access_token.split(' ')[1]
    const userId = parseInt(req.params.id, 10)
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
        if (user?.roleId === 'R1' || user?.roleId === 'R3') {
            next()
        } else {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
    })
}

export const authMiddleware = (req, res, next) => {
    if (!req.headers.access_token) {
        return next({
            status: 401,
            message: 'The token is empty',
        });
    }
    const token = req.headers.access_token.split(' ')[1]
    const userId = parseInt(req.params.id, 10)
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
        if (user?.roleId === 'R1' || user?.roleId === 'R2' || user?.roleId === 'R3') {
            next()
        } else {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
    })
}

export const authDoctorMiddleware = (req, res, next) => {
    if (!req.headers.access_token) {
        return next({
            status: 401,
            message: 'The token is empty',
        });
    }
    const token = req.headers.access_token.split(' ')[1]
    const userId = parseInt(req.params.id, 10)
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
        if (user?.roleId === 'R2' || user?.roleId === 'R1') {
            next()
        } else {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
    })
}

export const handleError = (err, req, res, next) => {
    // Định dạng lỗi trả về
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        status: 'ERROR',
        message,
    });
};

export const verifyToken = (req, res, next) => {
    if (!req.headers.access_token) {
        return next({
            status: 401,
            message: 'The token is empty',
        });
    }
    const token = req.headers.access_token.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return next({
                status: 401,
                message: 'Unauthorized',
            });
        }
        next()
    })
}