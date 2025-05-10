import express from 'express';

import { createRacksController, getRackController, updateRackController, deleteRackController } from '#src/controllers/rack.controller.js';

const router = express.Router();

router.post('/', createRacksController); // Create a new rack
// router.get('/maxEmpty', getMaxEmptyController); // Get the maximum number of empty racks
router.delete('/', deleteRackController); // Delete a rack
router.get('/', getRackController); // Get a rack
router.put('/', updateRackController); // Update a rack

export default router;
