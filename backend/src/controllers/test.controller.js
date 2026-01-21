const testEndpoint = (req, res) => {
  res.json({
    message: "TrustEat backend is alive",
    timestamp: new Date(),
  });
};

module.exports = { testEndpoint };
