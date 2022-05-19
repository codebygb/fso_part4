const logger = require("./logger");
const jwt = require("jsonwebtoken");

const errorHandler = (error, _request, response, next) => {
  logger.error(error.name, error?.message, error?.code);
  if (error.name === "ValidationError") {
    return response.status(400).json({ message: error.message });
  }
  if (error.name === "CastError") {
    return response.status(400).json({ message: error.message });
  }
  if (error.name === "MongoServerError" && error?.code === 11000) {
    return response.status(400).json({ message: "username already in use" });
  }
  if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ message: error.message });
  }
  if (error.name === "TokenExpiredError") {
    return response.status(401).json({ message: error.message });
  }
  if (error.name === "SyntaxError") {
    return response
      .status(400)
      .json({ message: "invalid json or invalid token" });
  }
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Headers:", request.headers);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7);
  }
  next();
};

const userExtactor = (request, response, next) => {
  const token = request.token;
  try {
    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET);
      request.user = decodedToken.id;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestLogger,
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
  userExtactor,
};
