/**
 * Transaction Controller
 * 
 * CONCEPT: Controllers handle incoming requests and send responses.
 * They act as the "traffic cop" between routes and business logic.
 * 
 * Pattern:
 * 1. Receive request
 * 2. Validate input (using Zod schemas)
 * 3. Call service/model
 * 4. Send response
 */

import { Request, Response } from 'express';
import { Transaction } from '../models/index.js';
import { catchErrors } from '../utils/catchErrors.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/http.js';
import { CATEGORIES } from '../constants/categories.js';

// =============================================================================
// TYPES
// =============================================================================

// Sort options mapping
const SORT_OPTIONS: Record<string, Record<string, 1 | -1>> = {
  'Latest': { date: -1 },
  'Oldest': { date: 1 },
  'A to Z': { name: 1 },
  'Z to A': { name: -1 },
  'Highest': { amount: -1 },
  'Lowest': { amount: 1 },
};

// =============================================================================
// GET ALL TRANSACTIONS
// =============================================================================

/**
 * Get Transactions (Paginated)
 * 
 * GET /api/transactions
 * 
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 10)
 * - search: string (search by name)
 * - sort: string (Latest, Oldest, A to Z, Z to A, Highest, Lowest)
 * - filter/category: string (category name)
 */
export const getTransactions = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  // Parse query parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const search = (req.query.search as string) || '';
  const sort = (req.query.sort as string) || 'Latest';
  const category = (req.query.filter as string) || (req.query.category as string) || '';
  
  // Build query filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = { userId };
  
  // Add search filter (search by name)
  if (search) {
    filter.name = { $regex: search, $options: 'i' };  // Case-insensitive
  }
  
  // Add category filter
  if (category && category !== 'All Transactions' && CATEGORIES.includes(category as typeof CATEGORIES[number])) {
    filter.category = category;
  }
  
  // Get sort configuration
  const sortConfig = SORT_OPTIONS[sort] || SORT_OPTIONS['Latest'];
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Execute queries in parallel for better performance
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit)
      .lean(),  // .lean() returns plain JS objects (faster)
    Transaction.countDocuments(filter),
  ]);
  
  // Calculate total pages
  const pages = Math.ceil(total / limit);
  
  // Send response
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      transactions,
      total,
      page,
      pages,
      limit,
    },
  });
});

// =============================================================================
// GET SINGLE TRANSACTION
// =============================================================================

/**
 * Get Single Transaction
 * 
 * GET /api/transactions/:id
 */
export const getTransaction = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const transaction = await Transaction.findOne({ _id: id, userId }).lean();
  
  if (!transaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { transaction },
  });
});

// =============================================================================
// CREATE TRANSACTION
// =============================================================================

/**
 * Create Transaction
 * 
 * POST /api/transactions
 */
export const createTransaction = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { name, amount, category, date, avatar, recurring } = req.body;
  
  // Basic validation
  if (!name || amount === undefined || !category || !date) {
    throw new AppError(
      'Name, amount, category, and date are required',
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR'
    );
  }
  
  // Validate category
  if (!CATEGORIES.includes(category)) {
    throw new AppError(
      'Invalid category',
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR'
    );
  }
  
  // Create transaction
  const transaction = await Transaction.create({
    userId,
    name,
    amount,
    category,
    date: new Date(date),
    avatar: avatar || '/assets/images/avatars/default.jpg',
    recurring: recurring || false,
  });
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Transaction created successfully',
    data: { transaction },
  });
});

// =============================================================================
// UPDATE TRANSACTION
// =============================================================================

/**
 * Update Transaction
 * 
 * PUT /api/transactions/:id
 */
export const updateTransaction = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { name, amount, category, date, avatar, recurring } = req.body;
  
  // Find and update
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    {
      ...(name && { name }),
      ...(amount !== undefined && { amount }),
      ...(category && { category }),
      ...(date && { date: new Date(date) }),
      ...(avatar && { avatar }),
      ...(recurring !== undefined && { recurring }),
    },
    { new: true, runValidators: true }
  );
  
  if (!transaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Transaction updated successfully',
    data: { transaction },
  });
});

// =============================================================================
// DELETE TRANSACTION
// =============================================================================

/**
 * Delete Transaction
 * 
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
  
  if (!transaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Transaction deleted successfully',
  });
});
