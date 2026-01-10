/**
 * Budget Routes
 */

import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller.js';

const router = Router();

// GET /api/budgets - List all budgets with spent amount
router.get('/', budgetController.getBudgets);

// GET /api/budgets/:id - Get single budget
router.get('/:id', budgetController.getBudget);

// POST /api/budgets - Create budget
router.post('/', budgetController.createBudget);

// PUT /api/budgets/:id - Update budget
router.put('/:id', budgetController.updateBudget);

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', budgetController.deleteBudget);

export default router;
