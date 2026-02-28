const express = require("express");
const { startRound, endRound } = require("../controllers/contestController");
const router = express.Router();

router.post("/start", startRound);
router.post("/end", endRound);

module.exports = router;
