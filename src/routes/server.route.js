import express from 'express';

import { createServerController, deleteServerController, updateServerController, getServerController, getAllServersController } from '#src/controllers/server.controller.js';

const router = express.Router();

router.post('/', createServerController); // Create a server
router.delete('/', deleteServerController); // Delete a server
router.put('/', updateServerController); // Update a server
router.get('/', getServerController); // Get a server by ID
router.get('/AllServers', getAllServersController); // Get all servers

export default router;
