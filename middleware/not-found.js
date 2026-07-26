function notFound(req, res) {
  res.status(404).json({
    message: "Route not foundd for ${req.method} ${req.path}",
  });
}

module.exports = notFound;
