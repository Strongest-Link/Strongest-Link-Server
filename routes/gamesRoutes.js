const express = require("express");
const router = express.Router();

const gameController = require("../controller/gameController");

router.get("/leaderboard", gameController.leaderboard);

router.get("/", gameController.index);
router.post("/", gameController.create);
router.post("/:id", gameController.join);
router.post("/:id/restart", gameController.restart);
router.delete("/:id", gameController.deleteGame);

module.exports = router;
