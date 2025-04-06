import express from 'express';

import adminController from '#src/controllers/admin.controller.js';

const router = express.Router();

router.get('/watchFab', adminController.watchFab);
router.post('/createFab', adminController.createFab);

export default router;
