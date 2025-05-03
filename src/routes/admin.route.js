import express from 'express';

import adminController from '#src/controllers/admin.controller.js';

const router = express.Router();

router.get('/fab', adminController.watchFab);
router.post('/fab', adminController.createFab);
router.post('/rack', adminController.addRack);
router.delete('/database', adminController.clearDatabase);

export default router;
