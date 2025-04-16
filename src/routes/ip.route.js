import express from 'express';

import { assignIpController, createIpPoolController } from '#src/controllers/ip.controller.js';

const router = express.Router();

router.post('/assign', assignIpController); // Assign an IP address to a fabId and service
router.post('/createIpPool', createIpPoolController); // Create an IP pool for a fabId and service

export default router;
