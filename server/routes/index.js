const express = require("express");
const router = express.Router();

// health check (test route)
router.get("/health", (req, res) => {
  res.json({ status: "API is running" });
});

module.exports = router;
