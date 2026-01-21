const express = require("express");
const router = express.Router();

const { testEndpoint } = require("../controllers/test.controller");
router.get("/", testEndpoint);
module.exports = router;
