import express from 'express';

import { addServerController, deleteServerController, createIpPoolController } from '#src/controllers/user.controller.js';

const router = express.Router();

router.post('/server', addServerController); // Create a server
router.delete('/server', deleteServerController); // Delete a server
router.post('/ipPool', createIpPoolController); // Create an IP pool for a fabId and service

export default router;
