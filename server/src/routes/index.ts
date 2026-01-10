/**
 * API Routes Index
 * 
 * CONCEPT: This file combines all route modules into one router.
 * Each resource (transactions, budgets, etc.) has its own route file.
 * 
 * Routes are mounted at /api (defined in app.ts), so:
 * - /transactions routes become /api/transactions
 * - /budgets routes become /api/budgets
 * - etc.
 */

import { Router } from 'express';

// Import route modules (we'll create these)
import transactionRoutes from './transaction.routes.js';
import budgetRoutes from './budget.routes.js';
import potRoutes from './pot.routes.js';
import overviewRoutes from './overview.routes.js';

const router = Router();

// =============================================================================
// MOUNT ROUTES
// =============================================================================

/**
 * Transaction Routes
 * GET    /api/transactions     - List transactions (paginated, filtered, sorted)
 * GET    /api/transactions/:id - Get single transaction
 * POST   /api/transactions     - Create transaction
 * PUT    /api/transactions/:id - Update transaction
 * DELETE /api/transactions/:id - Delete transaction
 */
router.use('/transactions', transactionRoutes);

/**
 * Budget Routes
 * GET    /api/budgets          - List all budgets
 * GET    /api/budgets/:id      - Get single budget
 * POST   /api/budgets          - Create budget
 * PUT    /api/budgets/:id      - Update budget
 * DELETE /api/budgets/:id      - Delete budget
 */
router.use('/budgets', budgetRoutes);

/**
 * Pot Routes
 * GET    /api/pots             - List all pots
 * GET    /api/pots/:id         - Get single pot
 * POST   /api/pots             - Create pot
 * PUT    /api/pots/:id         - Update pot
 * DELETE /api/pots/:id         - Delete pot
 * POST   /api/pots/:id/deposit - Add money to pot
 * POST   /api/pots/:id/withdraw - Withdraw from pot
 */
router.use('/pots', potRoutes);

/**
 * Overview Routes
 * GET    /api/overview         - Get overview data
 * GET    /api/overview/balance - Get current balance
 */
router.use('/overview', overviewRoutes);

export default router;
