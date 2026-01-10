/**
 * Transaction Routes
 * 
 * CONCEPT: Routes define the API endpoints and which controller handles them.
 * Express Router allows modular route definitions.
 * 
 * HTTP Methods:
 * - GET: Retrieve data (read)
 * - POST: Create new resource
 * - PUT/PATCH: Update existing resource
 * - DELETE: Remove resource
 */

import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller.js';

const router = Router();

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/transactions
 * List transactions with pagination, search, sort, and filter
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - search: Search by name
 * - sort: Sort order (Latest, Oldest, A to Z, Z to A, Highest, Lowest)
 * - category: Filter by category
 */
router.get('/', transactionController.getTransactions);

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
router.get('/:id', transactionController.getTransaction);

/**
 * POST /api/transactions
 * Create a new transaction
 * 
 * Body:
 * - name: string
 * - amount: number
 * - category: string
 * - date: string (ISO date)
 * - avatar?: string
 * - recurring?: boolean
 */
router.post('/', transactionController.createTransaction);

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 */
router.put('/:id', transactionController.updateTransaction);

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete('/:id', transactionController.deleteTransaction);

export default router;
