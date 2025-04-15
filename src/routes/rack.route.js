import express from 'express';

import { createRackController, getMaxEmptyController, deleteRackController } from '#src/controllers/rack.controller.js';

const router = express.Router();

router.post('/', createRackController); // Create a new rack
router.get('/maxEmpty', getMaxEmptyController); // Get the maximum number of empty racks
router.delete('/', deleteRackController); // Delete a rack

export default router;
