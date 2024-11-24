// backend/controllers/taskController.js
const Task = require("../models/Task");

// Create Task
exports.createTask = async (req, res) => {
  const { title, description, deadline, priority } = req.body;

  try {
    const task = new Task({
      user: req.user.id,
      title,
      description,
      deadline,
      priority,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Tasks for User
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  const { title, description, deadline, priority } = req.body;

  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure user owns task
    if (task.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Unauthorized" });

    // Update task details
    task.title = title || task.title;
    task.description = description || task.description;
    task.deadline = deadline || task.deadline;
    task.priority = priority || task.priority;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure user owns task
    if (task.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Unauthorized" });

    await task.deleteOne({ _id: req.params.id });
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
