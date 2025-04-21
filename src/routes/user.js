import express from 'express';

import { addServerController, deleteServerController } from '#src/controllers/user.controller.js';

const router = express.Router();

router.post('/addServer', addServerController); // Create a server
router.delete('/deleteServer', deleteServerController); // Delete a server

export default router;
