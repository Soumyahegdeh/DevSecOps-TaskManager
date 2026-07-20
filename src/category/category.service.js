"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../drizzle/db"));
const schema_1 = require("../drizzle/schema");
class CategoryService {
    /** Create a new category for the authenticated user */
    async createCategory(category) {
        try {
            console.log('Creating category:', { name: category.name, userId: category.userId });
            const result = await db_1.default.insert(schema_1.categories).values(category).returning();
            console.log('Category created successfully:', result);
            return {
                success: true,
                message: 'Category created successfully',
                category: result[0],
            };
        }
        catch (error) {
            console.error('Error creating category:', error);
            return {
                success: false,
                message: 'Failed to create category',
            };
        }
    }
    /** Get all categories for the authenticated user */
    async getAllCategories(userId) {
        try {
            console.log('Getting categories for user:', userId);
            const result = await db_1.default.query.categories.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.categories.userId, userId),
                orderBy: (categories, { asc }) => [asc(categories.createdAt)],
            });
            console.log('Categories retrieved:', result.length);
            return result;
        }
        catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }
    /** Get a specific category by ID for the authenticated user */
    async getCategoryById(categoryId, userId) {
        try {
            console.log('Getting category by ID:', { categoryId, userId });
            const result = await db_1.default.query.categories.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.categories.id, categoryId), (0, drizzle_orm_1.eq)(schema_1.categories.userId, userId)),
            });
            console.log('Category lookup result:', result ? 'Category found' : 'Category not found');
            return result;
        }
        catch (error) {
            console.error('Error getting category by ID:', error);
            throw error;
        }
    }
    /** Update a category for the authenticated user */
    async updateCategory(categoryId, userId, updates) {
        try {
            console.log('Updating category:', { categoryId, userId, updates });
            // Check if category exists and belongs to user
            const existingCategory = await this.getCategoryById(categoryId, userId);
            if (!existingCategory) {
                return {
                    success: false,
                    message: 'Category not found',
                };
            }
            const result = await db_1.default.update(schema_1.categories)
                .set({
                ...updates,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.categories.id, categoryId), (0, drizzle_orm_1.eq)(schema_1.categories.userId, userId)))
                .returning();
            console.log('Category updated successfully:', result);
            return {
                success: true,
                message: 'Category updated successfully',
                category: result[0],
            };
        }
        catch (error) {
            console.error('Error updating category:', error);
            return {
                success: false,
                message: 'Failed to update category',
            };
        }
    }
    /** Delete a category for the authenticated user */
    async deleteCategory(categoryId, userId) {
        try {
            console.log('Deleting category:', { categoryId, userId });
            // Check if category exists and belongs to user
            const existingCategory = await this.getCategoryById(categoryId, userId);
            if (!existingCategory) {
                return {
                    success: false,
                    message: 'Category not found',
                };
            }
            await db_1.default.delete(schema_1.categories)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.categories.id, categoryId), (0, drizzle_orm_1.eq)(schema_1.categories.userId, userId)));
            console.log('Category deleted successfully');
            return {
                success: true,
                message: 'Category deleted successfully',
            };
        }
        catch (error) {
            console.error('Error deleting category:', error);
            return {
                success: false,
                message: 'Failed to delete category',
            };
        }
    }
    /** Get category by name for the authenticated user */
    async getCategoryByName(name, userId) {
        try {
            console.log('Getting category by name:', { name, userId });
            const result = await db_1.default.query.categories.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.categories.name, name), (0, drizzle_orm_1.eq)(schema_1.categories.userId, userId)),
            });
            console.log('Category by name lookup result:', result ? 'Category found' : 'Category not found');
            return result;
        }
        catch (error) {
            console.error('Error getting category by name:', error);
            throw error;
        }
    }
}
exports.CategoryService = CategoryService;
