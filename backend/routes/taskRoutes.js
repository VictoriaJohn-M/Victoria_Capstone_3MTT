// backend/routes/taskRoutes.js
const express = require("express");
const { createTask, getTasks, updateTask, deleteTask } = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/tasks - Create a task
router.post("/", authMiddleware, createTask);

// GET /api/tasks - Get all tasks for the user
router.get("/", authMiddleware, getTasks);

// PUT /api/tasks/:id - Update a task
router.put("/:id", authMiddleware, updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
