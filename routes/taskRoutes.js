const express = require("express");
const taskController = require("../controllers/taskController");

const router = express.Router();

const { create, index, show, update, deleteTask } = taskController;

router.post("/", create);
router.get("/", index);
router.get("/:id", show);
router.patch("/:id", update);
router.delete("/:id", deleteTask);

module.exports = router;
