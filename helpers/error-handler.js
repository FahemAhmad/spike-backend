function errorHandler(err, req, res, next) {
  //Authentication error
  if (err.name === "UnauthorizedError") {
    return res.status(401).json("The User is not authorized");
  }

  //Validation Error
  if (err.name === "ValidationError") {
    return res.status(401).json(err);
  }

  //default to 500 server error
  return res.status(500).json(err);
}

module.exports = errorHandler;
