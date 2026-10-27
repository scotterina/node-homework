function notFound(req, res) {
  res.status(404).json({
    message: "Route not found for ${req.method} ${req.path}",
  });
}

module.exports = notFound;
