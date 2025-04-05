import express from 'express';

import adminController from '@/controllers/adminController.js';

const router = express.Router();

router.get('/getAllFabs', adminController.getAllFabs);
router.get('/getFab', adminController.getFab);
router.post('/createFab', adminController.createFab);
router.put('/updateFab', adminController.updateFab);
router.delete('/deleteFab', adminController.deleteFab);

export default router;
