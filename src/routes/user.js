import express from 'express';

import { createController, deleteServerController } from '#src/controllers/user.controller.js';

const router = express.Router();

router.post('/', createController); // Create a server
router.delete('/', deleteServerController); // Delete a server

export default router;
