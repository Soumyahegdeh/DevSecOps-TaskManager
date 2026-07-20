"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tasks_controller_1 = require("./tasks.controller");
const bearAuth_1 = require("../middleware/bearAuth");
const router = express_1.default.Router();
const taskController = new tasks_controller_1.TaskController();
// Apply authentication middleware to all task routes
router.use(bearAuth_1.bothRoleAuth);
// Use bind() method to preserve context and cast to unknown first
router.get('/', taskController.getAllTasks.bind(taskController));
router.get('/due/today', taskController.getTasksDueToday.bind(taskController));
router.get('/overdue', taskController.getOverdueTasks.bind(taskController));
router.get('/status/:status', taskController.getTasksByStatus.bind(taskController));
router.get('/priority/:priority', taskController.getTasksByPriority.bind(taskController));
router.get('/:id', taskController.getTaskById.bind(taskController));
router.post('/', taskController.createTask.bind(taskController));
router.put('/:id', taskController.updateTask.bind(taskController));
router.patch('/:id/complete', taskController.toggleTaskCompletion.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));
exports.default = router;
