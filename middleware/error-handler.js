function errorHandler(err, req, res, next) {
  res.status(500).json({
    message: "Internal Error.",
  });
}

module.exports = errorHandler;
