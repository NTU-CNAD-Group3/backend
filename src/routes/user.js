import express from 'express';

import { addServerController, deleteServerController } from '#src/controllers/user.controller.js';

const router = express.Router();

router.post('/', addServerController); // Create a server
router.delete('/', deleteServerController); // Delete a server

export default router;
