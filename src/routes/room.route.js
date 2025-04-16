import express from 'express';
import {
  createRoomController,
  getHasRackController,
  getRackNumController,
  updateRoomController,
} from '#src/controllers/room.controller.js';

const router = express.Router();

router.post('/', createRoomController); // Create a new room
router.get('/hasRack', getHasRackController); // Check if a room has racks
router.get('/rackNum', getRackNumController); // Get the number of racks in a room
router.put('/', updateRoomController); // Update a room

export default router;
