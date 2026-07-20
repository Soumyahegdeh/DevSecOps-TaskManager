"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("./category.controller");
const bearAuth_1 = require("../middleware/bearAuth");
const router = express_1.default.Router();
const categoryController = new category_controller_1.CategoryController();
// Apply authentication middleware to all category routes
router.use(bearAuth_1.bothRoleAuth);
// Category CRUD routes
router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));
router.post('/', categoryController.createCategory.bind(categoryController));
router.put('/:id', categoryController.updateCategory.bind(categoryController));
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));
exports.default = router;
