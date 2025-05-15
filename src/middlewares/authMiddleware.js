import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authAdminMiddleware = (req, res, next) => {
  if (!req.headers.access_token) {
    return next({
      status: 401,
      message: "The token is empty",
    });
  }
  const token = req.headers.access_token.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
    if (user?.roleId === "R1") {
      req.user = user;
      next();
    } else {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
  });
};

export const authUserMiddleware = (req, res, next) => {
  if (!req.headers.access_token) {
    return next({
      status: 401,
      message: "The token is empty",
    });
  }
  const token = req.headers.access_token.split(" ")[1];
  const userId = parseInt(req.params.id, 10);
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }

    if (user?.roleId === "R1" || user?.roleId === "R3") {
        req.user = user;
      next();
    } else {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
    req.user = user;
  });
};

export const authMiddleware = (req, res, next) => {
  if (!req.headers.access_token) {
    return next({
      status: 401,
      message: "The token is empty",
    });
  }
  const token = req.headers.access_token.split(" ")[1];
  const userId = parseInt(req.params.id, 10);
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
    if (
      user?.roleId === "R1" ||
      user?.roleId === "R2" ||
      user?.roleId === "R3" ||
      user?.roleId === "R4"
    ) {
      req.user = user;
      next();
    } else {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
  });
};

export const authDoctorMiddleware = (req, res, next) => {
  if (!req.headers.access_token) {
    return next({
      status: 401,
      message: "The token is empty",
    });
  }
  const token = req.headers.access_token.split(" ")[1];
  const userId = parseInt(req.params.id, 10);
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
    if (user?.roleId === "R2" || user?.roleId === "R1") {
      req.user = user;
      next();
    } else {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
  });
};

export const authClinicMiddleware = (req, res, next) => {
  if (!req.headers.access_token) {
    return next({
      status: 401,
      message: "The token is empty",
    });
  }
  const token = req.headers.access_token.split(" ")[1];
  const userId = parseInt(req.params.id, 10);
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
    if (user?.roleId === "R4" || user?.roleId === "R1") {
      req.user = user;
      next();
    } else {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
  });
};

export const handleError = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    status: "ERROR",
    message,
  });
};

export const verifyToken = (req, res, next) => {
  if (!req.headers.access_token) {
    return next({
      status: 401,
      message: "The token is empty",
    });
  }
  const token = req.headers.access_token.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return next({
        status: 401,
        message: "Unauthorized",
      });
    }
    next();
  });
};
