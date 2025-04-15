import express from 'express';

import {
  getFabDetailsController,
  getAllRoomsController,
  getAllFabsController,
  getFabController,
  // createFabController,
  updateFabController,
  deleteFabController,
} from '#src/controllers/fab.controller.js';

const router = express.Router();

router.get('/details', getFabDetailsController);
router.get('/rooms/:id', getAllRoomsController);
router.get('/allFabs', getAllFabsController);
router.get('/', getFabController);
// router.post('/', createFabController);
router.put('/', updateFabController);
router.delete('/', deleteFabController);

export default router;
