import express from 'express';
import { authorize } from '#src/middleware/authorize.js';
import { authenticateToken } from '#src/middleware/authenticate.js';
import {
  getFabDetailsController,
  getAllRoomsController,
  getAllFabsController,
  getFabController,
  createFabController,
  updateFabController,
  deleteFabController,
} from '#src/controllers/fab.controller.js';

const router = express.Router();

router.get('/details', authenticateToken, authorize(['user', 'admin']), getFabDetailsController);
router.get('/rooms/:id', authenticateToken, authorize(['user', 'admin']), getAllRoomsController);
router.get('/allFabs', authenticateToken, authorize(['user', 'admin']), getAllFabsController);
router.get('/', authenticateToken, authorize(['user', 'admin']), getFabController);
router.post('/', authenticateToken, authorize(['admin']), createFabController);
router.put('/', authenticateToken, authorize(['admin']), updateFabController);
router.delete('/', authenticateToken, authorize(['admin']), deleteFabController);

export default router;
