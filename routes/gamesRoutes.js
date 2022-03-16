const express = require("express");
const router = express.Router();

const gameController = require("../controller/gameController");

router.get("/leaderboard", gameController.leaderboard);

router.get("/", gameController.index);
router.get("/:id/restart", gameController.restart);
router.get("/:name", gameController.show);
router.post("/", gameController.create);
router.post("/:name", gameController.join);
router.delete("/:id", gameController.deleteGame);

module.exports = router;
