const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const applyMiddleware = (app) => {
  app.disable("x-powered-by");

  const trustProxyValue = process.env.TRUST_PROXY;
  if (trustProxyValue) {
    app.set(
      "trust proxy",
      trustProxyValue === "true"
        ? 1
        : Number.isFinite(Number(trustProxyValue))
        ? Number(trustProxyValue)
        : trustProxyValue
    );
  }

  app.use(helmet());

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000"];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );

  app.use(compression());

  if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined"));
  } else {
    app.use(morgan("dev"));
  }

  const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const firstIp = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(",")[0];
      return firstIp.trim();
    }
    return (
      req.ip ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      "unknown"
    );
  };

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    },
    keyGenerator: getClientIp,
    skipFailedRequests: true,
  });

  app.use("/api", apiLimiter);

  app.use(express.json({ limit: "50kb" }));
  app.use(express.urlencoded({ extended: true, limit: "50kb" }));
};

module.exports = applyMiddleware;
