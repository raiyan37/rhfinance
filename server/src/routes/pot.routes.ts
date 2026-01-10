/**
 * Pot Routes
 */

import { Router } from 'express';
import * as potController from '../controllers/pot.controller.js';

const router = Router();

// GET /api/pots - List all pots
router.get('/', potController.getPots);

// GET /api/pots/:id - Get single pot
router.get('/:id', potController.getPot);

// POST /api/pots - Create pot
router.post('/', potController.createPot);

// PUT /api/pots/:id - Update pot
router.put('/:id', potController.updatePot);

// DELETE /api/pots/:id - Delete pot (returns money to balance)
router.delete('/:id', potController.deletePot);

// POST /api/pots/:id/deposit - Add money to pot
router.post('/:id/deposit', potController.depositToPot);

// POST /api/pots/:id/withdraw - Withdraw money from pot
router.post('/:id/withdraw', potController.withdrawFromPot);

export default router;
