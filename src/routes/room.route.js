import express from 'express';
import { createRoomsController, updateRoomController, getRoomController, deleteRoomController } from '#src/controllers/room.controller.js';

const router = express.Router();

router.post('/', createRoomsController); // Create a new room
// router.get('/hasRack', getHasRackController); // Check if a room has racks
// router.get('/rackNum', getRackNumController); // Get the number of racks in a room
router.put('/', updateRoomController); // Update a room
router.get('/', getRoomController); // get a room
router.delete('/', deleteRoomController); // delete a room
export default router;
